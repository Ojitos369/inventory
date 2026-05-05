from fastapi import APIRouter, Request
from .api import DashboardGeneral

router = APIRouter()


@router.get("/general")
async def general(request: Request):
    return await DashboardGeneral(request=request).run()
