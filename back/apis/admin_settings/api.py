"""Admin settings: configuracion runtime persistida en la tabla `app_settings`.

Hoy se usa para Kimi (api_key, api_base, vision_model, text_model). El cliente Kimi lee
prioritariamente de DB (`get_kimi_runtime`) y cae a env si la clave no esta seteada.
"""
import json
from core.bases.apis import SessionApi


# Catalogo curado de modelos Kimi/Moonshot (https://platform.kimi.ai/docs)
KIMI_MODELS = [
    # texto + vision (multimodales nativos, 256K)
    {"id": "kimi-k2.6", "context": "256K", "vision": True, "label": "Kimi K2.6 (vision, 256K)", "family": "k2"},
    {"id": "kimi-k2.5", "context": "256K", "vision": True, "label": "Kimi K2.5 (vision, 256K)", "family": "k2"},
    # serie Moonshot v1 — vision preview
    {"id": "moonshot-v1-8k-vision-preview", "context": "8K", "vision": True, "label": "Moonshot V1 8K Vision (preview)", "family": "v1"},
    {"id": "moonshot-v1-32k-vision-preview", "context": "32K", "vision": True, "label": "Moonshot V1 32K Vision (preview)", "family": "v1"},
    {"id": "moonshot-v1-128k-vision-preview", "context": "128K", "vision": True, "label": "Moonshot V1 128K Vision (preview)", "family": "v1"},
    # serie Moonshot v1 — solo texto
    {"id": "moonshot-v1-8k", "context": "8K", "vision": False, "label": "Moonshot V1 8K", "family": "v1"},
    {"id": "moonshot-v1-32k", "context": "32K", "vision": False, "label": "Moonshot V1 32K", "family": "v1"},
    {"id": "moonshot-v1-128k", "context": "128K", "vision": False, "label": "Moonshot V1 128K", "family": "v1"},
    # serie Kimi K2 turbo / thinking (heredados)
    {"id": "kimi-k2-0905-preview", "context": "256K", "vision": False, "label": "Kimi K2 0905 (preview)", "family": "k2-legacy"},
    {"id": "kimi-k2-0711-preview", "context": "128K", "vision": False, "label": "Kimi K2 0711 (preview)", "family": "k2-legacy"},
    {"id": "kimi-k2-turbo-preview", "context": "256K", "vision": False, "label": "Kimi K2 Turbo (preview)", "family": "k2-legacy"},
    {"id": "kimi-k2-thinking", "context": "256K", "vision": False, "label": "Kimi K2 Thinking", "family": "k2-thinking"},
    {"id": "kimi-k2-thinking-turbo", "context": "256K", "vision": False, "label": "Kimi K2 Thinking Turbo", "family": "k2-thinking"},
]

KIMI_KEYS = {
    'kimi.api_key': {'secret': True, 'default': ''},
    'kimi.api_base': {'secret': False, 'default': 'https://api.moonshot.ai/v1'},
    'kimi.vision_model': {'secret': False, 'default': 'moonshot-v1-32k-vision-preview'},
    'kimi.text_model': {'secret': False, 'default': 'moonshot-v1-32k'},
}


def _mask_secret(value: str) -> str:
    if not value:
        return ''
    if len(value) <= 8:
        return '****'
    return f"{value[:4]}…{value[-4:]}"


class GetSettings(SessionApi):
    def main(self):
        self.require_admin()
        rs = self.d2d(self.conexion.consulta_asociativa(
            "SELECT clave, valor FROM app_settings WHERE clave LIKE 'kimi.%'"
        ))
        actuales = {r['clave']: r['valor'] for r in rs}
        kimi_view = {}
        for k, meta in KIMI_KEYS.items():
            short = k.split('.', 1)[1]
            raw = actuales.get(k) or ''
            if meta['secret']:
                kimi_view[short] = {
                    'set': bool(raw),
                    'masked': _mask_secret(raw),
                }
            else:
                kimi_view[short] = raw or meta['default']
        self.response = {
            "kimi": kimi_view,
            "kimi_models": KIMI_MODELS,
        }


class UpdateSettings(SessionApi):
    """Body: {kimi: {api_key?, api_base?, vision_model?, text_model?}}.

    Solo claves declaradas en KIMI_KEYS se aceptan. Si `api_key` viene como string vacio
    (""), se borra. Si no viene, se conserva.
    """
    def main(self):
        self.require_admin()
        kimi = self.data.get('kimi') or {}
        if not isinstance(kimi, dict):
            raise self.MYE("Payload kimi invalido")

        cambios = []
        for short, meta in KIMI_KEYS.items():
            base = short.split('.', 1)[1]
            if base not in kimi:
                continue
            valor = kimi[base]
            if valor is None:
                continue
            valor = str(valor).strip()
            if valor == '' and meta['secret']:
                # borrar
                self.conexion.ejecutar(
                    "DELETE FROM app_settings WHERE clave = :k",
                    {'k': short},
                )
                cambios.append(f"{short}=<vacio>")
                continue
            self.conexion.ejecutar("""
                INSERT INTO app_settings (clave, valor, updated_by)
                VALUES (:k, :v, :u)
                ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor,
                    updated_at = CURRENT_TIMESTAMP, updated_by = EXCLUDED.updated_by
            """, {'k': short, 'v': valor, 'u': self.usuario['id']})
            cambios.append(short)

        self.response = {"message": "Ajustes guardados", "cambios": cambios}


class TestKimi(SessionApi):
    """Prueba rapida: chat texto con el text_model actual."""
    def main(self):
        self.require_admin()
        from core.utils import kimi
        try:
            resp = kimi.chat([
                {"role": "system", "content": "Responde exactamente: pong"},
                {"role": "user", "content": "ping"},
            ], temperature=0.0, max_tokens=8)
            txt = kimi.extract_text(resp).strip()
            self.response = {"ok": True, "respuesta": txt}
        except Exception as e:
            self.response = {"ok": False, "error": str(e)}
