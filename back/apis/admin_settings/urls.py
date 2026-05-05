from fastapi import APIRouter, Request
from .api import GetSettings, UpdateSettings, TestProvider


router = APIRouter()


@router.get("")
async def get_settings(request: Request):
    return await GetSettings(request=request).run()


@router.put("")
async def update_settings(request: Request):
    return await UpdateSettings(request=request).run()


@router.post("/test")
async def test_provider(request: Request):
    return await TestProvider(request=request).run()


# Compat
@router.post("/test_kimi")
async def test_kimi_compat(request: Request):
    return await TestProvider(request=request).run()
