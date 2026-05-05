from fastapi import APIRouter, Request
from .api import GetMe, UpdatePerfil, ListUsers, CreateUser, UpdateUser, ResetUserPassword, DeleteUser

router = APIRouter()


@router.get("/me")
async def me(request: Request):
    return await GetMe(request=request).run()


@router.put("/me")
async def update_me(request: Request):
    return await UpdatePerfil(request=request).run()


@router.get("")
async def list_users(request: Request):
    return await ListUsers(request=request).run()


@router.post("")
async def create_user(request: Request):
    return await CreateUser(request=request).run()


@router.put("")
async def update_user(request: Request):
    return await UpdateUser(request=request).run()


@router.post("/reset_password")
async def reset_password(request: Request):
    return await ResetUserPassword(request=request).run()


@router.delete("")
async def delete_user(request: Request):
    return await DeleteUser(request=request).run()
