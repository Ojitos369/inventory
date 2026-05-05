"""Dispatcher LLM. Selecciona proveedor (kimi | gemini) por funcion (vision/text).

El proveedor activo se lee de `app_settings.provider.vision` y `app_settings.provider.text`,
con fallback a `core.conf.settings.provider_defaults` (env LLM_PROVIDER_VISION / _TEXT).
"""
from typing import Any, Dict, List

from core.conf.settings import provider_defaults, db_data, ce
from ojitos369_postgres_db.postgres_db import ConexionPostgreSQL

from . import kimi, gemini


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
    return _provider_for('vision').vision_inventario(image_bytes, hint=hint)


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
