import io
import json
import os
import base64
import time
import threading
from uuid import uuid4
from datetime import datetime
from fastapi import UploadFile, File, Form

from core.bases.apis import SessionApi
from core.conf.settings import UPLOADS_DIR, MYE, ce, prod_mode, db_data
from core.utils import llm
from core.utils.llm import vlog, normalize_image
from ojitos369_postgres_db.postgres_db import ConexionPostgreSQL


def _ensure_uploads_dir():
    os.makedirs(UPLOADS_DIR, exist_ok=True)


def _cleanup_uploads(max_age_hours: float = 24.0):
    """Borra capt_*.jpg y crop_*.jpg con mtime > max_age_hours horas. Mantiene la
    carpeta acotada. Solo toca esos prefijos para no afectar otros archivos."""
    try:
        if not os.path.isdir(UPLOADS_DIR):
            return 0
        cutoff = time.time() - (max_age_hours * 3600)
        n = 0
        for fname in os.listdir(UPLOADS_DIR):
            if not (fname.startswith('capt_') or fname.startswith('crop_')):
                continue
            fpath = os.path.join(UPLOADS_DIR, fname)
            try:
                if os.path.isfile(fpath) and os.path.getmtime(fpath) < cutoff:
                    os.remove(fpath)
                    n += 1
            except Exception:
                pass
        if n:
            vlog('cleanup', f'borrados {n} archivos > {max_age_hours}h')
        return n
    except Exception as e:
        vlog('cleanup.error', f'{type(e).__name__}: {e}')
        return 0


def _set_progress(conn, cap_id, stage, current=None, total=None, message=None):
    """Helper para escribir progreso a la captura. Falla silenciosamente."""
    try:
        payload = {'stage': stage}
        if current is not None: payload['current'] = current
        if total is not None: payload['total'] = total
        if message: payload['message'] = message
        conn.ejecutar(
            "UPDATE vision_capturas SET progreso = CAST(:p AS JSONB) WHERE id = :id",
            {'p': json.dumps(payload, ensure_ascii=False), 'id': cap_id},
        )
        conn.commit()
    except Exception as e:
        vlog('progress.error', f'{type(e).__name__}: {e}')


def _crop_from_bbox(image_bytes, bbox, padding=0.04, max_side=400, quality=78):
    """Recorta region (bbox normalizada [x1,y1,x2,y2] en 0-1) y devuelve JPEG. None si falla."""
    if not bbox or len(bbox) != 4:
        return None
    try:
        from PIL import Image
    except Exception:
        return None
    try:
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode not in ('RGB', 'L'):
            img = img.convert('RGB')
        w, h = img.size
        x1, y1, x2, y2 = bbox
        bw, bh = x2 - x1, y2 - y1
        x1 = max(0.0, x1 - bw * padding)
        y1 = max(0.0, y1 - bh * padding)
        x2 = min(1.0, x2 + bw * padding)
        y2 = min(1.0, y2 + bh * padding)
        box = (int(x1 * w), int(y1 * h), int(x2 * w), int(y2 * h))
        if box[2] - box[0] < 8 or box[3] - box[1] < 8:
            return None
        crop = img.crop(box)
        cw, ch = crop.size
        m = max(cw, ch)
        if m > max_side:
            r = max_side / m
            crop = crop.resize((int(cw * r), int(ch * r)), Image.LANCZOS)
        buf = io.BytesIO()
        crop.save(buf, format='JPEG', quality=quality, optimize=True)
        return buf.getvalue()
    except Exception:
        return None


def _process_capture_async(cap_id, gid, uid, norm_bytes, hint, cap_short):
    """Worker que corre en thread aparte. Crea su propia conexion DB porque la del
    request original ya esta cerrada. Actualiza vision_capturas con el resultado."""
    vlog('worker.start', f'captura_id={cap_id[:8]} gid={gid[:8]}')
    t0 = time.time()
    conn = None
    try:
        # Conexion para reportar progreso desde el inicio
        conn = ConexionPostgreSQL(db_data, ce=ce, send_error=prod_mode, parameter_indicator=":")
        conn.raise_error = True

        # Stage 1: LLM
        _set_progress(conn, cap_id, 'llm', message='Analizando imagen con IA…')
        try:
            items = llm.vision_inventario(norm_bytes, hint=hint)
        except Exception as e:
            vlog('worker.llm_error', f'{type(e).__name__}: {e}')
            _mark_error(cap_id, str(e))
            return

        # Stage 2: Match contra existentes
        _set_progress(conn, cap_id, 'match', total=len(items),
                      message=f'Buscando {len(items)} items en el inventario…')
        existentes_df = conn.consulta_asociativa("""
            SELECT id, nombre, nombre_normalizado, cantidad, unidad
            FROM articulos WHERE grupo_id = :gid AND activo = TRUE
        """, {'gid': gid})
        existentes = _df_to_list(existentes_df)
        idx = {e['nombre_normalizado']: e for e in existentes}
        matched = 0
        for it in items:
            match = idx.get(it.get('objeto'))
            if match:
                it['articulo_id'] = match['id']
                it['cantidad_actual'] = float(match['cantidad'] or 0)
                it['unidad'] = it.get('unidad') or match.get('unidad')
                matched += 1
            else:
                it['articulo_id'] = None
                it['cantidad_actual'] = 0
        vlog('worker.match', f'{matched}/{len(items)} matched')

        # Stage 3: Crops (con progreso N/M y persistencia incremental para que el
        # front pueda ir mostrando los items conforme aparecen sus crops)
        crops_ok = 0
        total = len(items)
        for i, it in enumerate(items):
            _set_progress(conn, cap_id, 'crops', current=i + 1, total=total,
                          message=f'Recortando objetos detectados ({i + 1}/{total})…')
            crop_bytes = _crop_from_bbox(norm_bytes, it.get('bbox'))
            if crop_bytes:
                crop_name = f"crop_{cap_short}_{i:02d}.jpg"
                try:
                    with open(os.path.join(UPLOADS_DIR, crop_name), 'wb') as f:
                        f.write(crop_bytes)
                    it['foto_url'] = f"uploads/{crop_name}"
                    crops_ok += 1
                except Exception as e:
                    vlog('worker.crop_error', f'item#{i}: {e}')
            # Persiste el snapshot parcial de items conforme avanzan los crops
            try:
                conn.ejecutar(
                    "UPDATE vision_capturas SET items_detectados = CAST(:items AS JSONB) WHERE id = :id",
                    {'items': json.dumps(items, ensure_ascii=False), 'id': cap_id},
                )
                conn.commit()
            except Exception as e:
                vlog('worker.partial_save_error', f'{type(e).__name__}: {e}')
        vlog('worker.crops', f'{crops_ok}/{len(items)} generados')

        # Stage 4: Persistir resultado final
        conn.ejecutar("""
            UPDATE vision_capturas
               SET items_detectados = CAST(:items AS JSONB),
                   estado = 'done',
                   error_msg = NULL,
                   progreso = CAST(:p AS JSONB)
             WHERE id = :id
        """, {
            'items': json.dumps(items, ensure_ascii=False),
            'p': json.dumps({'stage': 'done', 'total': len(items)}, ensure_ascii=False),
            'id': cap_id,
        })
        conn.commit()
        vlog('worker.done', f'captura_id={cap_id[:8]} {len(items)} items en {(time.time()-t0):.1f}s')
    except Exception as e:
        vlog('worker.error', f'{type(e).__name__}: {e}')
        _mark_error(cap_id, str(e))
    finally:
        if conn is not None:
            try:
                conn.close()
            except Exception:
                pass


def _df_to_list(df):
    """Convierte DataFrame a list[dict] (replica logica de ClassBase.d2d sin importar pandas aqui)."""
    try:
        import pandas as pd
        if isinstance(df, (pd.DataFrame, pd.Series)):
            if isinstance(df, pd.DataFrame) and df.empty:
                return []
            cleaned = df.copy().astype(object).where(df.notnull(), None)
            if isinstance(df, pd.DataFrame):
                return cleaned.to_dict(orient='records')
            return cleaned.to_dict()
    except Exception:
        pass
    return df if isinstance(df, list) else []


def _mark_error(cap_id, msg):
    """Marca la captura como error en una conexion aparte."""
    try:
        c = ConexionPostgreSQL(db_data, ce=ce, send_error=prod_mode, parameter_indicator=":")
        c.raise_error = True
        c.ejecutar(
            "UPDATE vision_capturas SET estado='error', error_msg=:m WHERE id=:id",
            {'m': (msg or '')[:1000], 'id': cap_id},
        )
        c.commit()
        c.close()
    except Exception as e:
        vlog('worker.mark_error_failed', f'{type(e).__name__}: {e}')


class AnalyzePhoto(SessionApi):
    """Encola el analisis de la imagen. Responde inmediato con captura_id+estado.

    El analisis con el LLM puede tardar > 120s y Cloudflare cierra la conexion (524),
    por eso se procesa en un thread y el front hace polling a /vision/status.
    """

    def main(self):
        t_start = time.time()
        gid = self.data.get('grupo_id')
        b64 = self.data.get('image_b64') or ''
        hint = self.data.get('hint') or ''
        vlog('api.in', f'gid={(gid or "")[:8]} b64_chars={len(b64)} hint={hint!r}')
        if not gid:
            raise self.MYE("grupo_id requerido")
        if not b64:
            raise self.MYE("image_b64 requerido")
        self.require_grupo_member(gid)
        vlog('api.session_ok', f'user={self.usuario.get("username")}')

        if ',' in b64 and b64.startswith('data:'):
            b64 = b64.split(',', 1)[1]
        try:
            img_bytes = base64.b64decode(b64)
        except Exception:
            raise self.MYE("image_b64 invalido")
        vlog('api.decoded', f'{len(img_bytes)/1024:.0f}KB')
        if len(img_bytes) > 8 * 1024 * 1024:
            raise self.MYE("Imagen mayor a 8MB")

        _ensure_uploads_dir()
        # Limpieza oportunista: borra capt_*/crop_* > 24h al iniciar nuevo analisis
        _cleanup_uploads(max_age_hours=24.0)
        norm_bytes = normalize_image(img_bytes, max_side=1024, quality=75)
        ts = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        cap_short = self.get_id(long=8)
        fname = f"capt_{gid[:8]}_{ts}_{cap_short}.jpg"
        with open(os.path.join(UPLOADS_DIR, fname), 'wb') as f:
            f.write(norm_bytes)
        vlog('api.saved', f'uploads/{fname} ({len(norm_bytes)/1024:.0f}KB)')

        # Persiste captura como 'processing' antes de soltar el thread
        cap_id = self.get_id()
        self.conexion.ejecutar("""
            INSERT INTO vision_capturas (id, usuario_id, grupo_id, foto_path, estado, items_detectados, progreso)
            VALUES (:id, :uid, :gid, :fp, 'processing', CAST('[]' AS JSONB), CAST(:p AS JSONB))
        """, {
            'id': cap_id, 'uid': self.usuario['id'], 'gid': gid,
            'fp': f"uploads/{fname}",
            'p': json.dumps({'stage': 'subiendo', 'message': 'Imagen recibida, encolando…'}),
        })
        self.conexion.commit()
        vlog('api.persisted', f'captura_id={cap_id[:8]} estado=processing')

        # Lanza el worker (daemon=True para no bloquear shutdown)
        threading.Thread(
            target=_process_capture_async,
            args=(cap_id, gid, self.usuario['id'], norm_bytes, hint, cap_short),
            daemon=True,
        ).start()
        vlog('api.queued', f'thread lanzado, respondiendo en {(time.time()-t_start)*1000:.0f}ms')

        self.response = {
            "captura_id": cap_id,
            "foto_path": f"/media/uploads/{fname}",
            "estado": "processing",
            "items": [],
            "progreso": {"stage": "subiendo", "message": "Imagen recibida, encolando…"},
        }


class StatusCaptura(SessionApi):
    """Devuelve el estado actual de una captura para que el front haga polling."""

    def main(self):
        cap_id = self.data.get('captura_id') or self.data.get('id')
        if not cap_id:
            raise self.MYE("captura_id requerido")
        rs = self.d2d(self.conexion.consulta_asociativa("""
            SELECT id, grupo_id, foto_path, estado, error_msg, items_detectados, progreso,
                   aplicada, created_at
              FROM vision_capturas WHERE id = :id
        """, {'id': cap_id}))
        if not rs:
            raise self.MYE("Captura no encontrada")
        cap = rs[0]
        # require_grupo_member valida acceso (no exponer capturas de otros grupos)
        self.require_grupo_member(cap['grupo_id'])

        # items_detectados puede venir como str (jsonb -> str segun driver) o lista
        items = cap.get('items_detectados')
        if isinstance(items, str):
            try: items = json.loads(items)
            except Exception: items = []
        if items is None:
            items = []

        progreso = cap.get('progreso')
        if isinstance(progreso, str):
            try: progreso = json.loads(progreso)
            except Exception: progreso = None

        self.response = {
            "captura_id": cap['id'],
            "estado": cap.get('estado') or 'done',
            "error": cap.get('error_msg'),
            "foto_path": f"/media/{cap.get('foto_path')}" if cap.get('foto_path') else None,
            "items": items,
            "progreso": progreso,
            "aplicada": bool(cap.get('aplicada')),
        }


class AplicarCaptura(SessionApi):
    """Aplica items finales corregidos a articulos.

    Cada item lleva su propio `modo` (`reemplazar | agregar | ignorar`). Si no trae modo,
    cae al `modo` global (compatibilidad). `ignorar` salta el item sin crear movimiento.
    """

    def main(self):
        cap_id = self.data.get('captura_id')
        modo_default = self.data.get('modo') or 'reemplazar'
        items = self.data.get('items') or []
        if modo_default not in ('reemplazar', 'agregar', 'ignorar'):
            raise self.MYE("modo invalido")
        if not cap_id or not isinstance(items, list):
            raise self.MYE("captura_id y items requeridos")

        cap = self.d2d(self.conexion.consulta_asociativa(
            "SELECT id, grupo_id, aplicada, estado FROM vision_capturas WHERE id = :id",
            {'id': cap_id},
        ))
        if not cap:
            raise self.MYE("Captura no encontrada")
        if cap[0]['aplicada']:
            raise self.MYE("Captura ya aplicada")
        if cap[0].get('estado') == 'processing':
            raise self.MYE("La captura aun se esta procesando")
        if cap[0].get('estado') == 'error':
            raise self.MYE("La captura fallo, no se puede aplicar")
        gid = cap[0]['grupo_id']
        self.require_grupo_member(gid)

        resumen = {"creados": 0, "actualizados": 0, "movimientos": 0, "ignorados": 0}
        for it in items:
            nombre = (it.get('objeto') or it.get('nombre') or '').strip().lower()
            if not nombre:
                continue
            modo_item = (it.get('modo') or modo_default)
            if modo_item not in ('reemplazar', 'agregar', 'ignorar'):
                modo_item = modo_default
            if modo_item == 'ignorar':
                resumen['ignorados'] += 1
                continue
            try:
                cant = float(it.get('cantidad') or 0)
            except Exception:
                cant = 0
            if cant < 0:
                continue
            if modo_item == 'agregar' and cant == 0:
                continue
            unidad = (it.get('unidad') or 'pz').strip().lower() or 'pz'
            cat_id = it.get('categoria_id') or None

            existing = self.d2d(self.conexion.consulta_asociativa("""
                SELECT id, cantidad FROM articulos
                WHERE grupo_id = :gid AND nombre_normalizado = :n AND activo = TRUE
                LIMIT 1
            """, {'gid': gid, 'n': nombre}))

            if existing:
                aid = existing[0]['id']
                actual = float(existing[0]['cantidad'] or 0)
                if modo_item == 'reemplazar':
                    nueva = cant
                    tipo = 'reajustar'
                else:
                    nueva = actual + cant
                    tipo = 'agregar'
                self.conexion.ejecutar(
                    "UPDATE articulos SET cantidad = :c, updated_at = CURRENT_TIMESTAMP WHERE id = :id",
                    {'c': nueva, 'id': aid},
                )
                resumen['actualizados'] += 1
            else:
                aid = self.get_id()
                self.conexion.ejecutar("""
                    INSERT INTO articulos (id, grupo_id, categoria_id, nombre, cantidad, unidad)
                    VALUES (:id, :gid, :cat, :n, :c, :u)
                """, {'id': aid, 'gid': gid, 'cat': cat_id, 'n': nombre, 'c': cant, 'u': unidad})
                actual = 0
                nueva = cant
                tipo = 'reajustar'
                resumen['creados'] += 1

            self.conexion.ejecutar("""
                INSERT INTO movimientos (id, articulo_id, grupo_id, usuario_id, tipo,
                    cantidad, cantidad_anterior, cantidad_posterior, origen, captura_id, comentario)
                VALUES (:id, :aid, :gid, :uid, :t, :c, :ca, :cp, 'foto_kimi', :cap, :cm)
            """, {
                'id': self.get_id(), 'aid': aid, 'gid': gid, 'uid': self.usuario['id'],
                't': tipo, 'c': cant, 'ca': actual, 'cp': nueva,
                'cap': cap_id, 'cm': f'Captura foto ({modo_item})',
            })
            resumen['movimientos'] += 1

        self.conexion.ejecutar("""
            UPDATE vision_capturas SET items_finales = CAST(:i AS JSONB),
                modo_aplicacion = :m, aplicada = TRUE, aplicada_at = CURRENT_TIMESTAMP
            WHERE id = :id
        """, {'i': json.dumps(items, ensure_ascii=False), 'm': 'mixto', 'id': cap_id})

        self.response = {"resumen": resumen, "message": "Captura aplicada"}


class ListarCapturas(SessionApi):
    def main(self):
        gid = self.data.get('grupo_id')
        if not gid:
            raise self.MYE("grupo_id requerido")
        self.require_grupo_member(gid)
        rs = self.d2d(self.conexion.consulta_asociativa("""
            SELECT vc.id, vc.foto_path, vc.modo_aplicacion, vc.aplicada, vc.estado,
                   vc.created_at, vc.aplicada_at, u.username
            FROM vision_capturas vc
            LEFT JOIN usuarios u ON u.id = vc.usuario_id
            WHERE vc.grupo_id = :gid
            ORDER BY vc.created_at DESC
            LIMIT 50
        """, {'gid': gid}))
        self.response = {"capturas": rs}
