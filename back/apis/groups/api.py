from core.bases.apis import SessionApi


class ListGroups(SessionApi):
    def main(self):
        if self.usuario.get('is_admin'):
            rs = self.d2d(self.conexion.consulta_asociativa("""
                SELECT g.id, g.nombre, g.descripcion, g.color, g.icono, g.activo,
                       g.created_at, g.creado_por,
                       (SELECT COUNT(*) FROM usuarios_grupos ug WHERE ug.grupo_id = g.id) AS miembros,
                       (SELECT COUNT(*) FROM articulos a WHERE a.grupo_id = g.id AND a.activo = TRUE) AS articulos,
                       'admin' AS mi_rol
                FROM grupos g
                ORDER BY g.created_at DESC
            """))
        else:
            rs = self.d2d(self.conexion.consulta_asociativa("""
                SELECT g.id, g.nombre, g.descripcion, g.color, g.icono, g.activo,
                       g.created_at, g.creado_por,
                       (SELECT COUNT(*) FROM usuarios_grupos ug WHERE ug.grupo_id = g.id) AS miembros,
                       (SELECT COUNT(*) FROM articulos a WHERE a.grupo_id = g.id AND a.activo = TRUE) AS articulos,
                       ug.rol AS mi_rol
                FROM grupos g
                JOIN usuarios_grupos ug ON ug.grupo_id = g.id
                WHERE ug.usuario_id = :uid AND g.activo = TRUE
                ORDER BY g.created_at DESC
            """, {'uid': self.usuario['id']}))
        self.response = {"grupos": rs}


class CreateGroup(SessionApi):
    def main(self):
        self.require_admin()
        nombre = (self.data.get('nombre') or '').strip()
        if not nombre:
            raise self.MYE("Nombre requerido")
        descripcion = self.data.get('descripcion')
        color = self.data.get('color')
        icono = self.data.get('icono')
        gid = self.get_id()
        self.conexion.ejecutar("""
            INSERT INTO grupos (id, nombre, descripcion, color, icono, creado_por)
            VALUES (:id, :n, :d, :c, :i, :u)
        """, {'id': gid, 'n': nombre, 'd': descripcion, 'c': color, 'i': icono, 'u': self.usuario['id']})
        self.conexion.ejecutar("""
            INSERT INTO usuarios_grupos (id, usuario_id, grupo_id, rol)
            VALUES (:id, :uid, :gid, 'admin')
        """, {'id': self.get_id(), 'uid': self.usuario['id'], 'gid': gid})
        self.response = {"id": gid, "message": "Grupo creado"}


class UpdateGroup(SessionApi):
    def main(self):
        gid = self.data.get('id')
        if not gid:
            raise self.MYE("id requerido")
        self.require_grupo_member(gid, admin_only=True)
        nombre = self.data.get('nombre')
        descripcion = self.data.get('descripcion')
        color = self.data.get('color')
        icono = self.data.get('icono')
        activo = self.data.get('activo')
        self.conexion.ejecutar("""
            UPDATE grupos SET
                nombre = COALESCE(:n, nombre),
                descripcion = COALESCE(:d, descripcion),
                color = COALESCE(:c, color),
                icono = COALESCE(:i, icono),
                activo = COALESCE(:a, activo)
            WHERE id = :id
        """, {'n': nombre, 'd': descripcion, 'c': color, 'i': icono, 'a': activo, 'id': gid})
        self.response = {"message": "Grupo actualizado"}


class DeleteGroup(SessionApi):
    def main(self):
        self.require_admin()
        gid = self.data.get('id')
        if not gid:
            raise self.MYE("id requerido")
        self.conexion.ejecutar("UPDATE grupos SET activo = FALSE WHERE id = :id", {'id': gid})
        self.response = {"message": "Grupo desactivado"}


class ListMembers(SessionApi):
    def main(self):
        gid = self.data.get('grupo_id')
        if not gid:
            raise self.MYE("grupo_id requerido")
        self.require_grupo_member(gid)
        rs = self.d2d(self.conexion.consulta_asociativa("""
            SELECT u.id, u.username, u.nombre, u.email, u.foto_url, ug.rol
            FROM usuarios_grupos ug
            JOIN usuarios u ON u.id = ug.usuario_id
            WHERE ug.grupo_id = :gid
            ORDER BY u.username
        """, {'gid': gid}))
        self.response = {"miembros": rs}


class AddMember(SessionApi):
    def main(self):
        gid = self.data.get('grupo_id')
        uid = self.data.get('usuario_id')
        rol = self.data.get('rol') or 'member'
        if not gid or not uid:
            raise self.MYE("grupo_id y usuario_id requeridos")
        self.require_grupo_member(gid, admin_only=True)
        self.conexion.ejecutar("""
            INSERT INTO usuarios_grupos (id, usuario_id, grupo_id, rol)
            VALUES (:id, :uid, :gid, :r)
            ON CONFLICT (usuario_id, grupo_id) DO UPDATE SET rol = EXCLUDED.rol
        """, {'id': self.get_id(), 'uid': uid, 'gid': gid, 'r': rol})
        self.response = {"message": "Miembro agregado"}


class RemoveMember(SessionApi):
    def main(self):
        gid = self.data.get('grupo_id')
        uid = self.data.get('usuario_id')
        if not gid or not uid:
            raise self.MYE("grupo_id y usuario_id requeridos")
        self.require_grupo_member(gid, admin_only=True)
        self.conexion.ejecutar(
            "DELETE FROM usuarios_grupos WHERE grupo_id = :gid AND usuario_id = :uid",
            {'gid': gid, 'uid': uid},
        )
        self.response = {"message": "Miembro removido"}
