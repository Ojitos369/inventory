from core.bases.apis import SessionApi
from core.utils.security import make_password


class GetMe(SessionApi):
    def main(self):
        u = self.usuario
        rs = self.d2d(self.conexion.consulta_asociativa("""
            SELECT g.id, g.nombre, g.color, g.icono, ug.rol
            FROM usuarios_grupos ug
            JOIN grupos g ON g.id = ug.grupo_id
            WHERE ug.usuario_id = :uid AND g.activo = TRUE
            ORDER BY g.nombre
        """, {'uid': u['id']}))
        self.response = {
            "user": {
                "id": u['id'], "username": u['username'],
                "nombre": u.get('nombre'), "email": u.get('email'),
                "foto_url": u.get('foto_url'), "is_admin": bool(u.get('is_admin')),
            },
            "grupos": rs,
        }


class UpdatePerfil(SessionApi):
    def main(self):
        nombre = (self.data.get('nombre') or '').strip() or None
        email = (self.data.get('email') or '').strip() or None
        foto_url = (self.data.get('foto_url') or '').strip() or None
        self.conexion.ejecutar("""
            UPDATE usuarios
            SET nombre = COALESCE(:n, nombre),
                email = COALESCE(:e, email),
                foto_url = COALESCE(:f, foto_url)
            WHERE id = :id
        """, {'n': nombre, 'e': email, 'f': foto_url, 'id': self.usuario['id']})
        self.response = {"message": "Perfil actualizado"}


class ListUsers(SessionApi):
    def main(self):
        self.require_admin()
        rs = self.d2d(self.conexion.consulta_asociativa("""
            SELECT id, username, nombre, email, foto_url, is_admin, activo, last_login, created_at
            FROM usuarios
            ORDER BY created_at DESC
        """))
        self.response = {"users": rs}


class CreateUser(SessionApi):
    def main(self):
        self.require_admin()
        username = (self.data.get('username') or '').strip().lower()
        passwd = self.data.get('passwd') or ''
        nombre = (self.data.get('nombre') or '').strip() or None
        email = (self.data.get('email') or '').strip().lower() or None
        is_admin = bool(self.data.get('is_admin'))
        if not username or not passwd:
            raise self.MYE("Usuario y contrasena son requeridos")
        if len(username) < 3:
            raise self.MYE("El usuario debe tener al menos 3 caracteres")
        if len(passwd) < 4:
            raise self.MYE("La contrasena debe tener al menos 4 caracteres")

        existe = self.d2d(self.conexion.consulta_asociativa(
            "SELECT id FROM usuarios WHERE username = :u", {'u': username}
        ))
        if existe:
            raise self.MYE("El usuario ya existe")

        new_id = self.get_id()
        self.conexion.ejecutar("""
            INSERT INTO usuarios (id, username, passwd, nombre, email, is_admin)
            VALUES (:id, :u, :p, :n, :e, :a)
        """, {'id': new_id, 'u': username, 'p': make_password(passwd), 'n': nombre, 'e': email, 'a': is_admin})

        grupos_ids = self.data.get('grupos') or []
        for gid in grupos_ids:
            self.conexion.ejecutar("""
                INSERT INTO usuarios_grupos (id, usuario_id, grupo_id, rol)
                VALUES (:id, :uid, :gid, 'member')
                ON CONFLICT (usuario_id, grupo_id) DO NOTHING
            """, {'id': self.get_id(), 'uid': new_id, 'gid': gid})

        self.response = {"id": new_id, "message": "Usuario creado"}


class UpdateUser(SessionApi):
    def main(self):
        self.require_admin()
        uid = self.data.get('id')
        if not uid:
            raise self.MYE("id requerido")
        nombre = self.data.get('nombre')
        email = self.data.get('email')
        is_admin = self.data.get('is_admin')
        activo = self.data.get('activo')
        self.conexion.ejecutar("""
            UPDATE usuarios SET
                nombre = COALESCE(:n, nombre),
                email = COALESCE(:e, email),
                is_admin = COALESCE(:a, is_admin),
                activo = COALESCE(:ac, activo)
            WHERE id = :id
        """, {'n': nombre, 'e': email, 'a': is_admin, 'ac': activo, 'id': uid})
        self.response = {"message": "Usuario actualizado"}


class ResetUserPassword(SessionApi):
    def main(self):
        self.require_admin()
        uid = self.data.get('id')
        nueva = self.data.get('nueva') or ''
        if not uid or len(nueva) < 4:
            raise self.MYE("id y contrasena (>=4) requeridos")
        self.conexion.ejecutar(
            "UPDATE usuarios SET passwd = :p WHERE id = :id",
            {'p': make_password(nueva), 'id': uid},
        )
        self.conexion.ejecutar("DELETE FROM sessiones WHERE usuario_id = :id", {'id': uid})
        self.response = {"message": "Contrasena reiniciada"}


class DeleteUser(SessionApi):
    def main(self):
        self.require_admin()
        uid = self.data.get('id')
        if not uid:
            raise self.MYE("id requerido")
        if uid == self.usuario['id']:
            raise self.MYE("No puedes eliminar tu propio usuario")
        self.conexion.ejecutar("UPDATE usuarios SET activo = FALSE WHERE id = :id", {'id': uid})
        self.conexion.ejecutar("DELETE FROM sessiones WHERE usuario_id = :id", {'id': uid})
        self.response = {"message": "Usuario desactivado"}
