import json
import os
import base64
from datetime import datetime
from fastapi import UploadFile, File, Form

from core.bases.apis import SessionApi
from core.conf.settings import UPLOADS_DIR
from core.utils import llm


def _ensure_uploads_dir():
    os.makedirs(UPLOADS_DIR, exist_ok=True)


class AnalyzePhoto(SessionApi):
    """Recibe imagen base64 (data.image_b64) y un grupo_id; corre Kimi y guarda captura."""

    def main(self):
        gid = self.data.get('grupo_id')
        b64 = self.data.get('image_b64') or ''
        hint = self.data.get('hint') or ''
        if not gid:
            raise self.MYE("grupo_id requerido")
        if not b64:
            raise self.MYE("image_b64 requerido")
        self.require_grupo_member(gid)

        # Quitar prefijo data:image/...;base64,
        if ',' in b64 and b64.startswith('data:'):
            b64 = b64.split(',', 1)[1]
        try:
            img_bytes = base64.b64decode(b64)
        except Exception:
            raise self.MYE("image_b64 invalido")
        if len(img_bytes) > 8 * 1024 * 1024:
            raise self.MYE("Imagen mayor a 8MB")

        _ensure_uploads_dir()
        ts = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        fname = f"capt_{gid[:8]}_{ts}_{self.get_id(long=8)}.jpg"
        fpath = os.path.join(UPLOADS_DIR, fname)
        with open(fpath, 'wb') as f:
            f.write(img_bytes)

        try:
            items = llm.vision_inventario(img_bytes, hint=hint)
        except Exception as e:
            print(f"Kimi vision: {e}")
            raise self.MYE(f"Error analizando imagen: {e}")

        # Match contra existentes para autovincular
        existentes = self.d2d(self.conexion.consulta_asociativa("""
            SELECT id, nombre, nombre_normalizado, cantidad, unidad
            FROM articulos WHERE grupo_id = :gid AND activo = TRUE
        """, {'gid': gid}))
        idx = {e['nombre_normalizado']: e for e in existentes}

        for it in items:
            match = idx.get(it['objeto'])
            if match:
                it['articulo_id'] = match['id']
                it['cantidad_actual'] = float(match['cantidad'] or 0)
                it['unidad'] = it.get('unidad') or match.get('unidad')
            else:
                it['articulo_id'] = None
                it['cantidad_actual'] = 0

        cap_id = self.get_id()
        self.conexion.ejecutar("""
            INSERT INTO vision_capturas (id, usuario_id, grupo_id, foto_path, items_detectados)
            VALUES (:id, :uid, :gid, :fp, CAST(:items AS JSONB))
        """, {
            'id': cap_id, 'uid': self.usuario['id'], 'gid': gid,
            'fp': f"uploads/{fname}",
            'items': json.dumps(items, ensure_ascii=False),
        })
        self.response = {
            "captura_id": cap_id,
            "foto_path": f"/media/uploads/{fname}",
            "items": items,
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
            "SELECT id, grupo_id, aplicada FROM vision_capturas WHERE id = :id",
            {'id': cap_id},
        ))
        if not cap:
            raise self.MYE("Captura no encontrada")
        if cap[0]['aplicada']:
            raise self.MYE("Captura ya aplicada")
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
            # cant == 0 con modo reemplazar deja en cero (valido); con agregar es no-op
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
            SELECT vc.id, vc.foto_path, vc.modo_aplicacion, vc.aplicada,
                   vc.created_at, vc.aplicada_at, u.username
            FROM vision_capturas vc
            LEFT JOIN usuarios u ON u.id = vc.usuario_id
            WHERE vc.grupo_id = :gid
            ORDER BY vc.created_at DESC
            LIMIT 50
        """, {'gid': gid}))
        self.response = {"capturas": rs}
