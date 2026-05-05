"""Admin settings: configuracion runtime persistida en la tabla `app_settings`.

Hoy se usa para:
- Kimi (api_key, api_base, vision_model, text_model)
- Gemini (api_key, api_base, vision_model, text_model)
- Provider selector (provider.vision, provider.text) — kimi | gemini

Cliente correspondiente lee de DB con fallback a env (variables KIMI_* / GEMINI_*).
"""
from core.bases.apis import SessionApi


KIMI_MODELS = [
    {"id": "kimi-k2.6", "context": "256K", "vision": True, "label": "Kimi K2.6 (vision, 256K)", "family": "k2"},
    {"id": "kimi-k2.5", "context": "256K", "vision": True, "label": "Kimi K2.5 (vision, 256K)", "family": "k2"},
    {"id": "moonshot-v1-8k-vision-preview", "context": "8K", "vision": True, "label": "Moonshot V1 8K Vision (preview)", "family": "v1"},
    {"id": "moonshot-v1-32k-vision-preview", "context": "32K", "vision": True, "label": "Moonshot V1 32K Vision (preview)", "family": "v1"},
    {"id": "moonshot-v1-128k-vision-preview", "context": "128K", "vision": True, "label": "Moonshot V1 128K Vision (preview)", "family": "v1"},
    {"id": "moonshot-v1-8k", "context": "8K", "vision": False, "label": "Moonshot V1 8K", "family": "v1"},
    {"id": "moonshot-v1-32k", "context": "32K", "vision": False, "label": "Moonshot V1 32K", "family": "v1"},
    {"id": "moonshot-v1-128k", "context": "128K", "vision": False, "label": "Moonshot V1 128K", "family": "v1"},
    {"id": "kimi-k2-0905-preview", "context": "256K", "vision": False, "label": "Kimi K2 0905 (preview)", "family": "k2-legacy"},
    {"id": "kimi-k2-0711-preview", "context": "128K", "vision": False, "label": "Kimi K2 0711 (preview)", "family": "k2-legacy"},
    {"id": "kimi-k2-turbo-preview", "context": "256K", "vision": False, "label": "Kimi K2 Turbo (preview)", "family": "k2-legacy"},
    {"id": "kimi-k2-thinking", "context": "256K", "vision": False, "label": "Kimi K2 Thinking", "family": "k2-thinking"},
    {"id": "kimi-k2-thinking-turbo", "context": "256K", "vision": False, "label": "Kimi K2 Thinking Turbo", "family": "k2-thinking"},
]

# Catalogo Gemini segun https://ai.google.dev/gemini-api/docs/models
# Todos los modelos modernos aceptan imagenes; vision: True salvo casos puntuales.
GEMINI_MODELS = [
    {"id": "gemini-2.5-pro", "context": "1M", "vision": True, "label": "Gemini 2.5 Pro (1M, razonamiento)", "family": "2.5"},
    {"id": "gemini-2.5-flash", "context": "1M", "vision": True, "label": "Gemini 2.5 Flash (1M, rapido)", "family": "2.5"},
    {"id": "gemini-2.5-flash-lite", "context": "1M", "vision": True, "label": "Gemini 2.5 Flash Lite (eficiente)", "family": "2.5"},
    {"id": "gemini-2.0-flash", "context": "1M", "vision": True, "label": "Gemini 2.0 Flash", "family": "2.0"},
    {"id": "gemini-2.0-flash-lite", "context": "1M", "vision": True, "label": "Gemini 2.0 Flash Lite", "family": "2.0"},
    {"id": "gemini-1.5-pro", "context": "2M", "vision": True, "label": "Gemini 1.5 Pro (legacy)", "family": "1.5"},
    {"id": "gemini-1.5-flash", "context": "1M", "vision": True, "label": "Gemini 1.5 Flash (legacy)", "family": "1.5"},
]

# clave -> {secret, default}. Las claves provider.* se almacenan tambien aqui.
SETTINGS_SCHEMA = {
    'kimi.api_key': {'secret': True, 'default': ''},
    'kimi.api_base': {'secret': False, 'default': 'https://api.moonshot.ai/v1'},
    'kimi.vision_model': {'secret': False, 'default': 'moonshot-v1-32k-vision-preview'},
    'kimi.text_model': {'secret': False, 'default': 'moonshot-v1-32k'},
    'gemini.api_key': {'secret': True, 'default': ''},
    'gemini.api_base': {'secret': False, 'default': 'https://generativelanguage.googleapis.com/v1beta/openai'},
    'gemini.vision_model': {'secret': False, 'default': 'gemini-2.5-flash'},
    'gemini.text_model': {'secret': False, 'default': 'gemini-2.5-flash'},
    'provider.vision': {'secret': False, 'default': 'kimi'},
    'provider.text': {'secret': False, 'default': 'kimi'},
}

VALID_PROVIDERS = {'kimi', 'gemini'}


def _mask_secret(value: str) -> str:
    if not value:
        return ''
    if len(value) <= 8:
        return '****'
    return f"{value[:4]}…{value[-4:]}"


def _build_section_view(actuales: dict, prefix: str) -> dict:
    """Devuelve dict con valores legibles para el front de un namespace (kimi.*, gemini.*)."""
    out = {}
    for k, meta in SETTINGS_SCHEMA.items():
        if not k.startswith(prefix + '.'):
            continue
        short = k.split('.', 1)[1]
        raw = actuales.get(k) or ''
        if meta['secret']:
            out[short] = {'set': bool(raw), 'masked': _mask_secret(raw)}
        else:
            out[short] = raw or meta['default']
    return out


class GetSettings(SessionApi):
    def main(self):
        self.require_admin()
        rs = self.d2d(self.conexion.consulta_asociativa(
            "SELECT clave, valor FROM app_settings"
        ))
        actuales = {r['clave']: r['valor'] for r in rs}

        provider = {
            'vision': actuales.get('provider.vision') or SETTINGS_SCHEMA['provider.vision']['default'],
            'text': actuales.get('provider.text') or SETTINGS_SCHEMA['provider.text']['default'],
        }

        self.response = {
            "kimi": _build_section_view(actuales, 'kimi'),
            "gemini": _build_section_view(actuales, 'gemini'),
            "provider": provider,
            "kimi_models": KIMI_MODELS,
            "gemini_models": GEMINI_MODELS,
            "providers": [
                {"id": "kimi", "label": "Kimi (Moonshot AI)"},
                {"id": "gemini", "label": "Google Gemini"},
            ],
        }


class UpdateSettings(SessionApi):
    """Body: {kimi:{}, gemini:{}, provider:{vision, text}}.

    api_key="" borra la clave (cae a env).
    """
    def main(self):
        self.require_admin()
        kimi_p = self.data.get('kimi') or {}
        gemini_p = self.data.get('gemini') or {}
        provider_p = self.data.get('provider') or {}

        cambios = []
        for ns, payload in (('kimi', kimi_p), ('gemini', gemini_p)):
            if not isinstance(payload, dict):
                raise self.MYE(f"Payload {ns} invalido")
            for short, valor in payload.items():
                clave = f"{ns}.{short}"
                meta = SETTINGS_SCHEMA.get(clave)
                if not meta:
                    continue
                if valor is None:
                    continue
                valor = str(valor).strip()
                if valor == '' and meta['secret']:
                    self.conexion.ejecutar(
                        "DELETE FROM app_settings WHERE clave = :k",
                        {'k': clave},
                    )
                    cambios.append(f"{clave}=<vacio>")
                    continue
                self.conexion.ejecutar("""
                    INSERT INTO app_settings (clave, valor, updated_by)
                    VALUES (:k, :v, :u)
                    ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor,
                        updated_at = CURRENT_TIMESTAMP, updated_by = EXCLUDED.updated_by
                """, {'k': clave, 'v': valor, 'u': self.usuario['id']})
                cambios.append(clave)

        if isinstance(provider_p, dict):
            for kind in ('vision', 'text'):
                v = provider_p.get(kind)
                if not v:
                    continue
                v = str(v).strip().lower()
                if v not in VALID_PROVIDERS:
                    raise self.MYE(f"provider.{kind} invalido (kimi|gemini)")
                self.conexion.ejecutar("""
                    INSERT INTO app_settings (clave, valor, updated_by)
                    VALUES (:k, :v, :u)
                    ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor,
                        updated_at = CURRENT_TIMESTAMP, updated_by = EXCLUDED.updated_by
                """, {'k': f'provider.{kind}', 'v': v, 'u': self.usuario['id']})
                cambios.append(f'provider.{kind}={v}')

        self.response = {"message": "Ajustes guardados", "cambios": cambios}


class TestProvider(SessionApi):
    """Prueba ping para vision o text con el proveedor activo."""
    def main(self):
        self.require_admin()
        kind = (self.data.get('kind') or 'text').lower()
        if kind not in ('vision', 'text'):
            raise self.MYE("kind debe ser 'vision' o 'text'")
        from core.utils import llm
        ok, resp, provider = llm.test_provider(kind)
        self.response = {"ok": ok, "respuesta": resp if ok else None,
                         "error": None if ok else resp,
                         "provider": provider, "kind": kind}
