from core.bases.apis import BaseApi, ConexionApi, SessionApi
from core.utils.security import check_password, make_password


class Login(ConexionApi):
    def main(self):
        usuario = (self.data.get('usuario') or '').strip()
        passwd = self.data.get('passwd') or ''
        if not usuario or not passwd:
            raise self.MYE("Usuario y contrasena son requeridos")

        query = """
            SELECT id, username, passwd, nombre, email, foto_url, is_admin, activo
            FROM usuarios WHERE username = :u
        """
        result = self.d2d(self.conexion.consulta_asociativa(query, {'u': usuario}))
        if not result:
            raise self.MYE("Usuario o contrasena incorrectos")
        user = result[0]
        if not user.get('activo'):
            raise self.MYE("Usuario inactivo")
        if not check_password(passwd, user['passwd']):
            raise self.MYE("Usuario o contrasena incorrectos")

        token = self.get_id()
        self.conexion.ejecutar(
            "INSERT INTO sessiones (id, usuario_id, token) VALUES (:id, :uid, :tk)",
            {'id': self.get_id(), 'uid': user['id'], 'tk': token},
        )
        self.conexion.ejecutar(
            "UPDATE usuarios SET last_login = CURRENT_TIMESTAMP WHERE id = :id",
            {'id': user['id']},
        )

        self.response = {
            "user": {
                "id": user['id'], "username": user['username'],
                "nombre": user.get('nombre'), "email": user.get('email'),
                "foto_url": user.get('foto_url'), "is_admin": bool(user.get('is_admin')),
            },
            "token": token,
        }


class ValidateLogin(SessionApi):
    def main(self):
        u = self.usuario
        self.response = {
            "user": {
                "id": u['id'], "username": u['username'],
                "nombre": u.get('nombre'), "email": u.get('email'),
                "foto_url": u.get('foto_url'), "is_admin": bool(u.get('is_admin')),
            },
            "token": self.token,
        }


class CloseSession(SessionApi):
    def main(self):
        self.conexion.ejecutar("DELETE FROM sessiones WHERE token = :tk", {'tk': self.token})
        self.conexion.commit()
        self.response = {"message": "Sesion cerrada"}


class ChangePassword(SessionApi):
    def main(self):
        actual = self.data.get('actual') or ''
        nueva = self.data.get('nueva') or ''
        if not actual or not nueva:
            raise self.MYE("Contrasena actual y nueva son requeridas")
        if len(nueva) < 4:
            raise self.MYE("La contrasena nueva debe tener al menos 4 caracteres")

        rs = self.d2d(self.conexion.consulta_asociativa(
            "SELECT passwd FROM usuarios WHERE id = :id", {'id': self.usuario['id']}
        ))
        if not rs or not check_password(actual, rs[0]['passwd']):
            raise self.MYE("Contrasena actual incorrecta")

        self.conexion.ejecutar(
            "UPDATE usuarios SET passwd = :p WHERE id = :id",
            {'p': make_password(nueva), 'id': self.usuario['id']},
        )
        self.conexion.ejecutar(
            "DELETE FROM sessiones WHERE usuario_id = :uid AND token <> :tk",
            {'uid': self.usuario['id'], 'tk': self.token},
        )
        self.response = {"message": "Contrasena actualizada"}
