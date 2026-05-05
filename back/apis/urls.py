from fastapi import APIRouter
from .base.urls import router as base_router
from .auth.urls import router as auth_router
from .users.urls import router as users_router
from .groups.urls import router as groups_router
from .catalog.urls import router as catalog_router
from .vision.urls import router as vision_router
from .dashboard.urls import router as dashboard_router
from .get_media.urls import router as get_media_router

apis = APIRouter()
media = APIRouter()

media.include_router(get_media_router, prefix="")
apis.include_router(base_router, prefix="/base")
apis.include_router(auth_router, prefix="/auth")
apis.include_router(users_router, prefix="/users")
apis.include_router(groups_router, prefix="/groups")
apis.include_router(catalog_router, prefix="/catalog")
apis.include_router(vision_router, prefix="/vision")
apis.include_router(dashboard_router, prefix="/dashboard")
