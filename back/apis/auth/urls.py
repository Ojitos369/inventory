from fastapi import APIRouter, Request
from .api import Login, ValidateLogin, CloseSession, ChangePassword

router = APIRouter()


@router.post("/login")
async def login(request: Request):
    return await Login(request=request).run()


@router.get("/validate_login")
async def validate_login(request: Request):
    return await ValidateLogin(request=request).run()


@router.get("/close_session")
async def close_session(request: Request):
    return await CloseSession(request=request).run()


@router.post("/change_password")
async def change_password(request: Request):
    return await ChangePassword(request=request).run()
