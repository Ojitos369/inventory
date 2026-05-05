import os
from inspect import currentframe

from fastapi import status
from fastapi import HTTPException
from fastapi import WebSocket, WebSocketDisconnect
from starlette.concurrency import run_in_threadpool

from ojitos369.errors import CatchErrors as CE
from ojitos369.utils import get_d, print_line_center, printwln as pln
from core.websockets.manager import ConnectionManager
from .utils import ClassBase

from core.conf.settings import MYE, ce, prod_mode, dev_mode, SESSION_COOKIE


class BaseApi(ClassBase):
    def __init__(self, *args, **kwargs):
        self.request = kwargs.get('request', None)
        self.data = {}
        for key, value in kwargs.items():
            if key != "request":
                self.data[key] = value
        if args:
            self.data['args'] = args

        self.status = 200
        self.response = {}
        self.ce = ce
        self.MYE = MYE
        self.response_mode = 'json'
        self.extra_error = ""
        self.usuario = None

    def errors(self, e):
        try:
            self.extra_error = f'\n{self.extra_error}'
            self.extra_error += f'\nIp de la petition: {self.petition_ip}'
            raise e
        except MYE as e:
            error = self.ce.show_error(e, extra=self.extra_error)
            print_line_center(error)
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
        except Exception as e:
            error = self.ce.show_error(e, send_email=prod_mode, extra=self.extra_error)
            print_line_center(error)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    async def get_post_data(self):
        try:
            data = await self.request.json()
        except Exception:
            data = {}
        for key, value in data.items():
            self.data[key] = value

    def get_get_data(self):
        data = self.request.query_params
        for key, value in data.items():
            self.data[key] = value

    def validate_session(self):
        pass

    def show_me(self):
        class_name = self.__class__.__name__
        cf = currentframe()
        line = cf.f_back.f_lineno
        file_name = cf.f_back.f_code.co_filename
        print_line_center(f"{class_name} - {file_name}:{line} ")

    def get_client_ip(self):
        try:
            ip = self.request.client.host
        except Exception:
            ip = 'unknown'
        self.petition_ip = ip

    async def run(self):
        self.get_client_ip()
        try:
            self.get_get_data()
            await self.get_post_data()
        except Exception as e:
            self.errors(e)
        try:
            await run_in_threadpool(self.validate_session)
            result = await run_in_threadpool(self.main)
            return result or self.response
        except Exception as e:
            self.errors(e)
        finally:
            self.close_conexion()


class ConexionApi(BaseApi):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.create_conexion()


class SessionApi(ConexionApi):
    """Sesion validada + usuario cargado en self.usuario."""

    def validate_session(self):
        cookies = self.request.cookies
        mi_cookie = cookies.get(SESSION_COOKIE, '')
        auth_code = self.request.headers.get("authorization", None)
        self.token = mi_cookie or auth_code
        if not self.token:
            raise self.MYE("Sesion no valida")

        query = """
            SELECT u.id, u.username, u.nombre, u.email, u.foto_url, u.is_admin, u.activo
            FROM sessiones s
            JOIN usuarios u ON u.id = s.usuario_id
            WHERE s.token = :token
            ORDER BY s.created_at DESC
            LIMIT 1
        """
        result = self.conexion.consulta_asociativa(query, {'token': self.token})
        users = self.d2d(result)
        if not users:
            raise self.MYE("Sesion no valida")
        self.usuario = users[0]
        if not self.usuario.get('activo', True):
            raise self.MYE("Usuario inactivo")

    def require_admin(self):
        if not self.usuario or not self.usuario.get('is_admin'):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Requiere permisos de administrador")

    def require_grupo_member(self, grupo_id, admin_only=False):
        """Valida que el usuario tenga acceso al grupo. Admin global pasa sin verificar."""
        if self.usuario.get('is_admin'):
            return 'admin'
        query = """
            SELECT rol FROM usuarios_grupos
            WHERE usuario_id = :uid AND grupo_id = :gid
        """
        rs = self.d2d(self.conexion.consulta_asociativa(query, {'uid': self.usuario['id'], 'gid': grupo_id}))
        if not rs:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No perteneces a este grupo")
        rol = rs[0]['rol']
        if admin_only and rol != 'admin':
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Requiere admin del grupo")
        return rol


class WebSocketApi:
    def __init__(self, websocket: WebSocket, manager: ConnectionManager, **kwargs):
        self.websocket = websocket
        self.manager = manager
        self.data = kwargs
        self.validate_session()

    def validate_session(self):
        auth_code = self.websocket.query_params.get("clientId", None)
        if not auth_code:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized access")

    async def on_connect(self): pass
    async def on_receive(self, data): pass
    async def on_disconnect(self): pass

    async def handle_connection(self):
        chat_id = self.data.get('chat_id', 'default')
        await self.manager.connect(self.websocket, chat_id)
        await self.on_connect()
        try:
            while True:
                data = await self.websocket.receive_text()
                await self.on_receive(data)
        except WebSocketDisconnect:
            pass
        finally:
            self.manager.disconnect(self.websocket, chat_id)
            await self.on_disconnect()
