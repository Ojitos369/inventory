from fastapi import APIRouter, Request
from .api import (
    ListGroups, CreateGroup, UpdateGroup, DeleteGroup,
    ListMembers, AddMember, RemoveMember,
)

router = APIRouter()


@router.get("")
async def listar(request: Request):
    return await ListGroups(request=request).run()


@router.post("")
async def crear(request: Request):
    return await CreateGroup(request=request).run()


@router.put("")
async def actualizar(request: Request):
    return await UpdateGroup(request=request).run()


@router.delete("")
async def eliminar(request: Request):
    return await DeleteGroup(request=request).run()


@router.get("/members")
async def miembros(request: Request):
    return await ListMembers(request=request).run()


@router.post("/members")
async def agregar_miembro(request: Request):
    return await AddMember(request=request).run()


@router.delete("/members")
async def quitar_miembro(request: Request):
    return await RemoveMember(request=request).run()
