import os
from datetime import datetime
from uuid import uuid4
from fastapi import APIRouter, Request, UploadFile, File, Form, HTTPException, status
from fastapi.concurrency import run_in_threadpool

from core.bases.apis import SessionApi
from core.conf.settings import UPLOADS_DIR, SESSION_COOKIE


router = APIRouter()

ALLOWED_FOLDERS = {'articulos', 'categorias', 'avatars', 'misc'}
ALLOWED_MIME = {'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'}
EXT_BY_MIME = {
    'image/jpeg': 'jpg', 'image/jpg': 'jpg',
    'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
}
MAX_BYTES = 8 * 1024 * 1024  # 8 MB


def _validate_session_sync(request: Request):
    api = SessionApi(request=request)
    try:
        api.validate_session()
        usuario = api.usuario
    except Exception as e:
        api.close_conexion()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    api.close_conexion()
    return usuario


@router.post("/image")
async def upload_image(request: Request, file: UploadFile = File(...), folder: str = Form('articulos')):
    usuario = await run_in_threadpool(_validate_session_sync, request)

    if folder not in ALLOWED_FOLDERS:
        raise HTTPException(status_code=400, detail="Carpeta no permitida")

    mime = (file.content_type or '').lower()
    if mime not in ALLOWED_MIME:
        raise HTTPException(status_code=400, detail=f"MIME no permitido: {mime}")

    contenido = await file.read()
    if not contenido:
        raise HTTPException(status_code=400, detail="Archivo vacio")
    if len(contenido) > MAX_BYTES:
        raise HTTPException(status_code=400, detail=f"Archivo > {MAX_BYTES // (1024*1024)}MB")

    target_dir = os.path.join(UPLOADS_DIR, folder)
    os.makedirs(target_dir, exist_ok=True)

    ext = EXT_BY_MIME[mime]
    ts = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    fname = f"{ts}_{uuid4().hex[:10]}.{ext}"
    fpath = os.path.join(target_dir, fname)
    with open(fpath, 'wb') as fp:
        fp.write(contenido)

    rel = f"uploads/{folder}/{fname}"
    return {
        "ok": True,
        "url": f"/media/{rel}",
        "path": rel,
        "size": len(contenido),
        "mime": mime,
    }
