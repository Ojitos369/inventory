from fastapi import APIRouter, Request
from .api import AnalyzePhoto, AplicarCaptura, ListarCapturas, StatusCaptura

router = APIRouter()


@router.post("/analyze")
async def analyze(request: Request):
    return await AnalyzePhoto(request=request).run()


@router.get("/status")
async def status(request: Request):
    return await StatusCaptura(request=request).run()


@router.post("/aplicar")
async def aplicar(request: Request):
    return await AplicarCaptura(request=request).run()


@router.get("/capturas")
async def listar(request: Request):
    return await ListarCapturas(request=request).run()
