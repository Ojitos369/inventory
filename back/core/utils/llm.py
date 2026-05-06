"""Dispatcher LLM. Selecciona proveedor (kimi | gemini) por funcion (vision/text).

El proveedor activo se lee de `app_settings.provider.vision` y `app_settings.provider.text`,
con fallback a `core.conf.settings.provider_defaults` (env LLM_PROVIDER_VISION / _TEXT).
"""
import io
import time
from datetime import datetime
from typing import Any, Dict, List

from core.conf.settings import provider_defaults, db_data, ce
from ojitos369_postgres_db.postgres_db import ConexionPostgreSQL

from . import kimi, gemini


def vlog(tag: str, msg: str = "") -> None:
    """Log estandar para el flujo de vision/llm. Prefijo con timestamp y tag."""
    ts = datetime.now().strftime('%H:%M:%S.%f')[:-3]
    line = f"[VISION {ts}] {tag}"
    if msg:
        line += f" — {msg}"
    print(line, flush=True)


def _normalize_image(image_bytes: bytes, max_side: int = 1024, quality: int = 75) -> bytes:
    """Reescala a `max_side` (lado mayor) y reencoda a JPEG para reducir tokens del modelo.

    Si Pillow no esta disponible o falla, devuelve los bytes originales. Idempotente:
    imagenes ya pequenas no se tocan.
    """
    in_kb = len(image_bytes) / 1024
    try:
        from PIL import Image
    except Exception:
        vlog('normalize', f'Pillow no disponible — paso bytes raw ({in_kb:.0f} KB)')
        return image_bytes
    try:
        t0 = time.time()
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode not in ('RGB', 'L'):
            img = img.convert('RGB')
        w, h = img.size
        m = max(w, h)
        scaled = False
        if m > max_side:
            ratio = max_side / m
            img = img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)
            scaled = True
        buf = io.BytesIO()
        img.save(buf, format='JPEG', quality=quality, optimize=True)
        out = buf.getvalue()
        out_kb = len(out) / 1024
        dt = (time.time() - t0) * 1000
        vlog('normalize',
             f'{w}x{h} → {img.size[0]}x{img.size[1]} '
             f'({in_kb:.0f}KB → {out_kb:.0f}KB) scaled={scaled} en {dt:.0f}ms')
        return out
    except Exception as e:
        vlog('normalize.error', f'{type(e).__name__}: {e} — paso bytes raw ({in_kb:.0f} KB)')
        return image_bytes


PROVIDERS = {
    'kimi': kimi,
    'gemini': gemini,
}


def _runtime_providers() -> Dict[str, str]:
    """Devuelve dict {'vision': 'kimi'|'gemini', 'text': 'kimi'|'gemini'}."""
    out = dict(provider_defaults)
    try:
        conexion = ConexionPostgreSQL(db_data, ce=ce, send_error=False, parameter_indicator=":")
        conexion.raise_error = True
        try:
            df = conexion.consulta_asociativa(
                "SELECT clave, valor FROM app_settings WHERE clave LIKE 'provider.%'"
            )
            try:
                rows = df.to_dict(orient='records')
            except Exception:
                rows = df if isinstance(df, list) else []
            for r in rows:
                k = (r.get('clave') or '').split('.', 1)[-1]
                v = (r.get('valor') or '').strip().lower()
                if k in ('vision', 'text') and v in PROVIDERS:
                    out[k] = v
        finally:
            try:
                conexion.close()
            except Exception:
                pass
    except Exception:
        pass
    return out


def _provider_for(kind: str):
    name = _runtime_providers().get(kind, 'gemini')
    return PROVIDERS.get(name) or kimi


def vision_inventario(image_bytes: bytes, hint: str = "") -> List[Dict[str, Any]]:
    provider_name = _runtime_providers().get('vision', 'kimi')
    vlog('dispatch', f'vision_inventario provider={provider_name} input={len(image_bytes)/1024:.0f}KB hint={hint!r}')
    norm = _normalize_image(image_bytes, max_side=1024, quality=75)
    t0 = time.time()
    try:
        items = _provider_for('vision').vision_inventario(norm, hint=hint)
        vlog('dispatch.ok', f'{len(items)} items en {(time.time()-t0):.1f}s')
        return items
    except Exception as e:
        vlog('dispatch.error', f'{type(e).__name__}: {e} (tras {(time.time()-t0):.1f}s)')
        raise


def sugerencias_articulo(query: str, existentes: List[str], categorias: List[str]) -> Dict[str, Any]:
    return _provider_for('text').sugerencias_articulo(query, existentes, categorias)


def agrupar_similares(items: List[str]) -> List[List[str]]:
    return _provider_for('text').agrupar_similares(items)


def test_provider(kind: str = 'text'):
    """Prueba ping para el proveedor configurado en `kind`. Devuelve (ok, respuesta_or_error)."""
    # mod = _provider_for(kind)
    mod = _provider_for(kind)
    try:
        resp = mod.chat([
            {"role": "system", "content": "Responde exactamente: pong"},
            {"role": "user", "content": "ping"},
        ], max_tokens=8)
        txt = mod.extract_text(resp).strip()
        return True, txt, _runtime_providers().get(kind)
    except Exception as e:
        return False, str(e), _runtime_providers().get(kind)
