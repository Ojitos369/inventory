"""Cliente HTTP minimo para Google Gemini via su endpoint OpenAI-compatible.

Endpoint: POST {api_base}/chat/completions con header `Authorization: Bearer GEMINI_API_KEY`.
Doc: https://ai.google.dev/gemini-api/docs/openai

Misma forma de mensajes que Kimi/OpenAI: image_url soporta data URLs.
"""
import base64
import json
import os
import re
import time
from typing import List, Dict, Any, Optional

import httpx

from core.conf.settings import gemini_settings as _env_gemini, MYE, db_data, ce
from ojitos369_postgres_db.postgres_db import ConexionPostgreSQL


def _vlog(tag: str, msg: str = "") -> None:
    try:
        from . import llm
        llm.vlog(f'gemini.{tag}', msg)
    except Exception:
        pass


def _runtime_settings() -> Dict[str, Any]:
    """Lee app_settings.gemini.* y mergea sobre env. Cualquier fallo cae a env."""
    cfg = dict(_env_gemini)
    try:
        conexion = ConexionPostgreSQL(db_data, ce=ce, send_error=False, parameter_indicator=":")
        conexion.raise_error = True
        try:
            df = conexion.consulta_asociativa(
                "SELECT clave, valor FROM app_settings WHERE clave LIKE 'gemini.%'"
            )
            try:
                rows = df.to_dict(orient='records')
            except Exception:
                rows = df if isinstance(df, list) else []
            for r in rows:
                k = (r.get('clave') or '').split('.', 1)[-1]
                v = r.get('valor')
                if v:
                    cfg[k] = v
        finally:
            try:
                conexion.close()
            except Exception:
                pass
    except Exception:
        pass
    return cfg


def _client(timeout: float = 90.0) -> httpx.Client:
    cfg = _runtime_settings()
    api_key = cfg.get('api_key')
    if not api_key:
        raise MYE("GEMINI_API_KEY no configurada")
    base = cfg.get('api_base') or 'https://generativelanguage.googleapis.com/v1beta/openai'
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    return httpx.Client(base_url=base, headers=headers, timeout=timeout)


def _model(name: str) -> str:
    cfg = _runtime_settings()
    return cfg.get(name) or _env_gemini.get(name) or ''


def _detect_mime(image_bytes: bytes) -> str:
    if image_bytes.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if image_bytes.startswith(b"\x89PNG"):
        return "image/png"
    if image_bytes[:6] in (b"GIF87a", b"GIF89a"):
        return "image/gif"
    if image_bytes.startswith(b"RIFF") and image_bytes[8:12] == b"WEBP":
        return "image/webp"
    return "image/jpeg"


def chat(messages: List[Dict[str, Any]], model: Optional[str] = None,
         temperature: float = 0.1, max_tokens: int = 1024,
         response_format: Optional[Dict[str, str]] = None,
         timeout: float = 90.0) -> Dict[str, Any]:
    payload = {
        "model": model or _model('text_model'),
        "messages": messages,
        "max_tokens": max_tokens,
    }
    if response_format:
        payload["response_format"] = response_format
    body = json.dumps(payload)
    _vlog('chat.request',
          f'model={payload["model"]} max_tokens={max_tokens} '
          f'rf={response_format and response_format.get("type")} '
          f'payload={len(body)/1024:.0f}KB timeout={int(timeout)}s')
    t0 = time.time()
    try:
        with _client(timeout=timeout) as c:
            r = c.post("/chat/completions", content=body)
            dt = time.time() - t0
            _vlog('chat.response', f'status={r.status_code} en {dt:.1f}s')
            if r.status_code >= 400:
                _vlog('chat.error', f'{r.status_code}: {r.text[:200]}')
                raise MYE(f"Gemini error {r.status_code}: {r.text[:300]}")
            return r.json()
    except httpx.TimeoutException:
        dt = time.time() - t0
        _vlog('chat.timeout', f'>{int(timeout)}s (real {dt:.1f}s)')
        raise MYE(
            f"Gemini tardo mas de {int(timeout)}s en responder. "
            "Reintenta o cambia a un modelo mas rapido en /admin/ajustes "
            "(ej. gemini-2.5-flash)."
        )


def extract_text(resp: Dict[str, Any]) -> str:
    """Lee `message.content`. Fallback a `reasoning_content` si content vacio."""
    try:
        msg = resp['choices'][0]['message']
        content = (msg.get('content') or '').strip()
        if content:
            return content
        return (msg.get('reasoning_content') or '').strip()
    except Exception:
        return ''


def _finish_reason(resp: Dict[str, Any]) -> str:
    try:
        return resp['choices'][0].get('finish_reason') or ''
    except Exception:
        return ''


def extract_json(resp: Dict[str, Any]) -> Any:
    txt = extract_text(resp).strip()
    if not txt:
        return None
    if txt.startswith("```"):
        txt = re.sub(r"^```(?:json)?", "", txt).strip()
        txt = re.sub(r"```$", "", txt).strip()
    try:
        return json.loads(txt)
    except Exception:
        m = re.search(r"(\[.*\]|\{.*\})", txt, re.S)
        if m:
            try:
                return json.loads(m.group(1))
            except Exception:
                return None
        return None


def vision_inventario(image_bytes: bytes, hint: str = "") -> List[Dict[str, Any]]:
    mime = _detect_mime(image_bytes)
    _vlog('vision.start', f'{len(image_bytes)/1024:.0f}KB mime={mime} hint={hint!r}')
    b64 = base64.b64encode(image_bytes).decode()
    _vlog('vision.b64', f'{len(b64)/1024:.0f}KB encoded')
    sistema = (
        "Eres un EXTRACTOR estricto de inventario a partir de una imagen. "
        "Tu unica salida valida es un JSON con la forma exacta: "
        "{\"items\":[{\"objeto\":string,\"cantidad\":number,\"unidad\":string|null}]}. "
        "REGLAS OBLIGATORIAS: "
        "(1) NO razones en voz alta ni escribas pasos, NO uses bloques markdown, "
        "NO incluyas explicaciones ni comentarios; emite UNICAMENTE el JSON. "
        "(2) `objeto`: nombre generico en espanol, singular, minusculas (ej. 'leche', "
        "'huevo', 'manzana'); evita marcas, modelos o adjetivos; agrupa duplicados "
        "del mismo producto en un solo item con la cantidad sumada. "
        "(3) `cantidad`: numero (entero o decimal); si no estas seguro, da el conteo "
        "minimo razonable basado en lo que se ve. "
        "(4) `unidad`: una de pz / kg / g / l / ml / paquete / lata / caja / bolsa / "
        "carton; si no aplica, deja null. "
        "(5) Si la imagen no contiene objetos identificables, responde "
        "{\"items\":[]}. NUNCA devuelvas texto fuera del JSON."
    )
    instruccion = "Genera el objeto JSON con los items visibles. Solo JSON, sin prosa."
    if hint:
        instruccion += f" Pista del usuario: {hint}"

    messages = [
        {"role": "system", "content": sistema},
        {"role": "user", "content": [
            {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{b64}"}},
            {"type": "text", "text": instruccion},
        ]},
    ]
    vmodel = _model('vision_model')
    _vlog('vision.send', f'model={vmodel}')
    resp = chat(
        messages,
        model=vmodel,
        max_tokens=8192,
        response_format={"type": "json_object"},
        timeout=240.0,
    )
    fr = _finish_reason(resp)
    txt = extract_text(resp)
    _vlog('vision.parse', f'finish_reason={fr} content_chars={len(txt)}')
    data = extract_json(resp)
    if isinstance(data, dict):
        data = data.get('items') or data.get('objetos') or data.get('articulos') or []
    if not isinstance(data, list):
        if _finish_reason(resp) == 'length':
            _vlog('vision.tokens_exhausted', 'finish_reason=length sin JSON')
            raise MYE(
                "El modelo se quedo sin tokens antes de generar el JSON. "
                "Cambia el modelo de vision en /admin/ajustes."
            )
        _vlog('vision.empty', f'data tipo {type(data).__name__} — items=[]')
        return []
    out = []
    for it in data:
        if not isinstance(it, dict):
            continue
        nombre = str(it.get('objeto') or it.get('nombre') or '').strip().lower()
        if not nombre:
            continue
        try:
            cant = float(it.get('cantidad') or 1)
        except Exception:
            cant = 1.0
        unidad = it.get('unidad')
        if unidad in (None, '', 'null'):
            unidad_norm = None
        else:
            unidad_norm = str(unidad).strip().lower() or None
        out.append({
            'objeto': nombre,
            'cantidad': cant,
            'unidad': unidad_norm,
        })
    _vlog('vision.done', f'{len(out)} items extraidos')
    return out


def sugerencias_articulo(query: str, existentes: List[str], categorias: List[str]) -> Dict[str, Any]:
    if not query or len(query.strip()) < 1:
        return {"sugerencias": [], "categoria_sugerida": None, "similares": []}
    sistema = (
        "Eres un autocompletador de inventario domestico. Tu UNICA salida valida es un "
        "JSON con la forma exacta: "
        "{\"sugerencias\":[string,...],\"categoria_sugerida\":string|null,"
        "\"similares\":[string,...]}. "
        "REGLAS: (1) NO razones en voz alta, NO uses markdown ni texto fuera del JSON. "
        "(2) `sugerencias`: max 5, nombres canonicos en espanol singular minusculas. "
        "(3) `categoria_sugerida`: debe ser exactamente una de `categorias_disponibles` "
        "o null. (4) `similares`: max 5 items de `items_existentes` que se parezcan."
    )
    contexto = {
        "query": query,
        "categorias_disponibles": categorias[:80],
        "items_existentes": existentes[:200],
    }
    messages = [
        {"role": "system", "content": sistema},
        {"role": "user", "content": json.dumps(contexto, ensure_ascii=False)},
    ]
    resp = chat(messages, max_tokens=1024, response_format={"type": "json_object"})
    data = extract_json(resp) or {}
    return {
        "sugerencias": [str(s).strip().lower() for s in (data.get('sugerencias') or [])][:5],
        "categoria_sugerida": (data.get('categoria_sugerida') or None),
        "similares": [str(s).strip().lower() for s in (data.get('similares') or [])][:5],
    }


def agrupar_similares(items: List[str]) -> List[List[str]]:
    if not items:
        return []
    sistema = (
        "Agrupa items por similitud semantica (mismo producto/familia). Tu UNICA salida "
        "valida es un JSON con la forma exacta: {\"grupos\":[[string,...],...]}. "
        "REGLAS: NO razones, NO uses markdown ni prosa, solo JSON. Items unicos van en "
        "grupo de uno."
    )
    messages = [
        {"role": "system", "content": sistema},
        {"role": "user", "content": json.dumps({"items": items[:300]}, ensure_ascii=False)},
    ]
    resp = chat(messages, max_tokens=2048, response_format={"type": "json_object"})
    data = extract_json(resp)
    if isinstance(data, dict):
        data = data.get('grupos') or data.get('groups') or []
    if not isinstance(data, list):
        return [[i] for i in items]
    return [[str(x) for x in g] for g in data if isinstance(g, list) and g]
