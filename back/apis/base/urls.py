from fastapi import APIRouter, Request
from .api import HelloWorld, GetModes

router = APIRouter()


@router.get("/hh")
async def hh(request: Request):
    return await HelloWorld(request=request).run()


@router.get("/get_modes")
async def get_modes(request: Request):
    return await GetModes(request=request).run()
