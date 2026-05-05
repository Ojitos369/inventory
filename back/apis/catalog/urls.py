from fastapi import APIRouter, Request
from .api import (
    ListCategorias, SaveCategoria, DeleteCategoria,
    ListArticulos, GetArticulo, SaveArticulo, DeleteArticulo,
    RegistrarMovimiento, Suggest, AgruparSimilares, ListaCompras,
)

router = APIRouter()


@router.get("/categorias")
async def cat_list(request: Request):
    return await ListCategorias(request=request).run()


@router.post("/categorias")
async def cat_save(request: Request):
    return await SaveCategoria(request=request).run()


@router.put("/categorias")
async def cat_update(request: Request):
    return await SaveCategoria(request=request).run()


@router.delete("/categorias")
async def cat_del(request: Request):
    return await DeleteCategoria(request=request).run()


@router.get("/articulos")
async def art_list(request: Request):
    return await ListArticulos(request=request).run()


@router.get("/articulos/detalle")
async def art_get(request: Request):
    return await GetArticulo(request=request).run()


@router.post("/articulos")
async def art_save(request: Request):
    return await SaveArticulo(request=request).run()


@router.put("/articulos")
async def art_update(request: Request):
    return await SaveArticulo(request=request).run()


@router.delete("/articulos")
async def art_del(request: Request):
    return await DeleteArticulo(request=request).run()


@router.post("/movimientos")
async def mov_save(request: Request):
    return await RegistrarMovimiento(request=request).run()


@router.get("/suggest")
async def suggest(request: Request):
    return await Suggest(request=request).run()


@router.get("/agrupar")
async def agrupar(request: Request):
    return await AgruparSimilares(request=request).run()


@router.get("/shopping")
async def shopping(request: Request):
    return await ListaCompras(request=request).run()
