"""Cliente HTTP minimo para Kimi (Moonshot AI) compatible OpenAI.

Endpoints usados:
- POST {api_base}/chat/completions
"""
import base64
import json
import os
import re
from typing import List, Dict, Any, Optional

import httpx

from core.conf.settings import kimi_settings, MYE


def _client(timeout: float = 90.0) -> httpx.Client:
    api_key = kimi_settings.get('api_key')
    if not api_key:
        raise MYE("KIMI_API_KEY no configurada")
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    return httpx.Client(base_url=kimi_settings['api_base'], headers=headers, timeout=timeout)


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
         temperature: float = 0.2, max_tokens: int = 1024,
         response_format: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
    """Llamada a chat/completions; devuelve el dict raw de respuesta."""
    payload = {
        "model": model or kimi_settings['text_model'],
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if response_format:
        payload["response_format"] = response_format
    with _client() as c:
        r = c.post("/chat/completions", content=json.dumps(payload))
        if r.status_code >= 400:
            raise MYE(f"Kimi error {r.status_code}: {r.text[:300]}")
        return r.json()


def extract_text(resp: Dict[str, Any]) -> str:
    try:
        return resp['choices'][0]['message']['content'] or ''
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
    """Envia foto a Kimi vision; espera lista [{objeto, cantidad}]."""
    mime = _detect_mime(image_bytes)
    b64 = base64.b64encode(image_bytes).decode()
    sistema = (
        "Eres un asistente de inventario. Analiza la imagen y devuelve SOLO un array JSON "
        "con los objetos visibles agrupados por similitud. Cada elemento debe tener "
        "{\"objeto\": string, \"cantidad\": number, \"unidad\": string opcional}. "
        "Usa nombres genericos en espanol, en singular, en minusculas. "
        "No incluyas texto adicional, solo el JSON."
    )
    instruccion = "Lista los objetos visibles con su cantidad."
    if hint:
        instruccion += f" Contexto del usuario: {hint}"

    messages = [
        {"role": "system", "content": sistema},
        {"role": "user", "content": [
            {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{b64}"}},
            {"type": "text", "text": instruccion},
        ]},
    ]
    resp = chat(messages, model=kimi_settings['vision_model'], temperature=0.1, max_tokens=1500)
    data = extract_json(resp)
    if not isinstance(data, list):
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
        out.append({
            'objeto': nombre,
            'cantidad': cant,
            'unidad': (it.get('unidad') or '').strip().lower() or None,
        })
    return out


def sugerencias_articulo(query: str, existentes: List[str], categorias: List[str]) -> Dict[str, Any]:
    """Sugiere autocompletado y categoria para un articulo nuevo."""
    if not query or len(query.strip()) < 1:
        return {"sugerencias": [], "categoria_sugerida": None, "similares": []}
    sistema = (
        "Eres un asistente de inventario domestico. Recibes un texto parcial de busqueda "
        "y devuelves SOLO un JSON: {\"sugerencias\":[\"...\",\"...\"],"
        "\"categoria_sugerida\":\"...\",\"similares\":[\"...\"]}. "
        "Las sugerencias son nombres canonicos (max 5). "
        "categoria_sugerida debe estar entre las dadas o null. "
        "similares son items existentes que se parezcan al query."
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
    resp = chat(messages, temperature=0.2, max_tokens=600)
    data = extract_json(resp) or {}
    return {
        "sugerencias": [str(s).strip().lower() for s in (data.get('sugerencias') or [])][:5],
        "categoria_sugerida": (data.get('categoria_sugerida') or None),
        "similares": [str(s).strip().lower() for s in (data.get('similares') or [])][:5],
    }


def agrupar_similares(items: List[str]) -> List[List[str]]:
    """Agrupa items existentes por similitud semantica usando Kimi (texto)."""
    if not items:
        return []
    sistema = (
        "Agrupa los items recibidos por similitud semantica (mismo producto/familia). "
        "Devuelve SOLO un JSON: array de arrays de strings. Cada subarray es un grupo. "
        "Items que no se parezcan a otros van solos."
    )
    messages = [
        {"role": "system", "content": sistema},
        {"role": "user", "content": json.dumps({"items": items[:300]}, ensure_ascii=False)},
    ]
    resp = chat(messages, temperature=0.0, max_tokens=1500)
    data = extract_json(resp)
    if not isinstance(data, list):
        return [[i] for i in items]
    return [[str(x) for x in g] for g in data if isinstance(g, list) and g]
