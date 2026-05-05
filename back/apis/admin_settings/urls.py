from fastapi import APIRouter, Request
from .api import GetSettings, UpdateSettings, TestKimi


router = APIRouter()


@router.get("")
async def get_settings(request: Request):
    return await GetSettings(request=request).run()


@router.put("")
async def update_settings(request: Request):
    return await UpdateSettings(request=request).run()


@router.post("/test_kimi")
async def test_kimi(request: Request):
    return await TestKimi(request=request).run()
