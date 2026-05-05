from decimal import Decimal
from core.bases.apis import SessionApi
from core.utils import llm


# ===================== CATEGORIAS =====================
class ListCategorias(SessionApi):
    def main(self):
        gid = self.data.get('grupo_id')
        if not gid:
            raise self.MYE("grupo_id requerido")
        self.require_grupo_member(gid)
        rs = self.d2d(self.conexion.consulta_asociativa("""
            SELECT id, nombre, color, icono, orden, foto_url
            FROM categorias WHERE grupo_id = :gid
            ORDER BY orden, nombre
        """, {'gid': gid}))
        self.response = {"categorias": rs}


class SaveCategoria(SessionApi):
    def main(self):
        gid = self.data.get('grupo_id')
        if not gid:
            raise self.MYE("grupo_id requerido")
        self.require_grupo_member(gid)
        nombre = (self.data.get('nombre') or '').strip()
        if not nombre:
            raise self.MYE("Nombre requerido")
        cat_id = self.data.get('id')
        color = self.data.get('color')
        icono = self.data.get('icono')
        orden = int(self.data.get('orden') or 0)
        foto = self.data.get('foto_url')
        if cat_id:
            self.conexion.ejecutar("""
                UPDATE categorias SET nombre = :n, color = :c, icono = :i, orden = :o, foto_url = :f
                WHERE id = :id AND grupo_id = :gid
            """, {'n': nombre, 'c': color, 'i': icono, 'o': orden, 'f': foto, 'id': cat_id, 'gid': gid})
            self.response = {"id": cat_id, "message": "Categoria actualizada"}
        else:
            cat_id = self.get_id()
            self.conexion.ejecutar("""
                INSERT INTO categorias (id, grupo_id, nombre, color, icono, orden, foto_url)
                VALUES (:id, :gid, :n, :c, :i, :o, :f)
            """, {'id': cat_id, 'gid': gid, 'n': nombre, 'c': color, 'i': icono, 'o': orden, 'f': foto})
            self.response = {"id": cat_id, "message": "Categoria creada"}


class DeleteCategoria(SessionApi):
    def main(self):
        gid = self.data.get('grupo_id')
        cat_id = self.data.get('id')
        if not gid or not cat_id:
            raise self.MYE("grupo_id e id requeridos")
        self.require_grupo_member(gid)
        self.conexion.ejecutar(
            "DELETE FROM categorias WHERE id = :id AND grupo_id = :gid",
            {'id': cat_id, 'gid': gid},
        )
        self.response = {"message": "Categoria eliminada"}


# ===================== ARTICULOS =====================
class ListArticulos(SessionApi):
    def main(self):
        gid = self.data.get('grupo_id')
        if not gid:
            raise self.MYE("grupo_id requerido")
        self.require_grupo_member(gid)
        q = (self.data.get('q') or '').strip().lower()
        cat = self.data.get('categoria_id') or None
        bajos = str(self.data.get('bajos') or '').lower() in ('1', 'true')

        params = {'gid': gid}
        sql = """
            SELECT a.id, a.nombre, a.descripcion, a.cantidad, a.optimo, a.minimo,
                   a.unidad, a.sku, a.foto_url, a.notas, a.activo,
                   a.categoria_id, c.nombre AS categoria_nombre, c.color AS categoria_color,
                   a.created_at, a.updated_at,
                   CASE
                     WHEN a.optimo > 0 THEN ROUND((a.cantidad / a.optimo) * 100, 1)
                     ELSE NULL
                   END AS porcentaje
            FROM articulos a
            LEFT JOIN categorias c ON c.id = a.categoria_id
            WHERE a.grupo_id = :gid AND a.activo = TRUE
        """
        if q:
            sql += " AND (a.nombre_normalizado LIKE :q OR LOWER(COALESCE(a.descripcion,'')) LIKE :q)"
            params['q'] = f"%{q}%"
        if cat:
            sql += " AND a.categoria_id = :cat"
            params['cat'] = cat
        if bajos:
            sql += " AND a.optimo > 0 AND a.cantidad < a.optimo"
        sql += " ORDER BY a.nombre"
        rs = self.d2d(self.conexion.consulta_asociativa(sql, params))
        self.response = {"articulos": rs}


class GetArticulo(SessionApi):
    def main(self):
        aid = self.data.get('id')
        if not aid:
            raise self.MYE("id requerido")
        rs = self.d2d(self.conexion.consulta_asociativa("""
            SELECT a.*, c.nombre AS categoria_nombre, c.color AS categoria_color
            FROM articulos a
            LEFT JOIN categorias c ON c.id = a.categoria_id
            WHERE a.id = :id
        """, {'id': aid}))
        if not rs:
            raise self.MYE("Articulo no encontrado")
        articulo = rs[0]
        self.require_grupo_member(articulo['grupo_id'])
        movs = self.d2d(self.conexion.consulta_asociativa("""
            SELECT m.id, m.tipo, m.cantidad, m.cantidad_anterior, m.cantidad_posterior,
                   m.origen, m.comentario, m.created_at, u.username
            FROM movimientos m
            LEFT JOIN usuarios u ON u.id = m.usuario_id
            WHERE m.articulo_id = :id
            ORDER BY m.created_at DESC
            LIMIT 50
        """, {'id': aid}))
        self.response = {"articulo": articulo, "movimientos": movs}


class SaveArticulo(SessionApi):
    def main(self):
        gid = self.data.get('grupo_id')
        if not gid:
            raise self.MYE("grupo_id requerido")
        self.require_grupo_member(gid)
        nombre = (self.data.get('nombre') or '').strip()
        if not nombre:
            raise self.MYE("Nombre requerido")
        aid = self.data.get('id')
        params = {
            'gid': gid,
            'cat': self.data.get('categoria_id') or None,
            'n': nombre,
            'd': self.data.get('descripcion'),
            'opt': float(self.data.get('optimo') or 0),
            'mn': float(self.data.get('minimo') or 0),
            'un': self.data.get('unidad') or 'pz',
            'sku': self.data.get('sku'),
            'foto': self.data.get('foto_url'),
            'notas': self.data.get('notas'),
        }
        if aid:
            params['id'] = aid
            self.conexion.ejecutar("""
                UPDATE articulos SET
                    categoria_id = :cat, nombre = :n, descripcion = :d,
                    optimo = :opt, minimo = :mn, unidad = :un, sku = :sku,
                    foto_url = :foto, notas = :notas
                WHERE id = :id AND grupo_id = :gid
            """, params)
            self.response = {"id": aid, "message": "Articulo actualizado"}
        else:
            cantidad = float(self.data.get('cantidad') or 0)
            params['id'] = self.get_id()
            params['cant'] = cantidad
            self.conexion.ejecutar("""
                INSERT INTO articulos (id, grupo_id, categoria_id, nombre, descripcion,
                    cantidad, optimo, minimo, unidad, sku, foto_url, notas)
                VALUES (:id, :gid, :cat, :n, :d, :cant, :opt, :mn, :un, :sku, :foto, :notas)
            """, params)
            if cantidad:
                self._registrar_mov(params['id'], gid, 'reajustar', cantidad, 0, cantidad,
                                    origen='alta', comentario='Alta inicial')
            self.response = {"id": params['id'], "message": "Articulo creado"}

    def _registrar_mov(self, aid, gid, tipo, cant, ant, post, origen='manual', comentario=None, captura_id=None):
        self.conexion.ejecutar("""
            INSERT INTO movimientos (id, articulo_id, grupo_id, usuario_id, tipo,
                cantidad, cantidad_anterior, cantidad_posterior, origen, comentario, captura_id)
            VALUES (:id, :aid, :gid, :uid, :t, :c, :ca, :cp, :o, :cm, :cap)
        """, {
            'id': self.get_id(), 'aid': aid, 'gid': gid, 'uid': self.usuario['id'],
            't': tipo, 'c': cant, 'ca': ant, 'cp': post,
            'o': origen, 'cm': comentario, 'cap': captura_id,
        })


class DeleteArticulo(SessionApi):
    def main(self):
        aid = self.data.get('id')
        if not aid:
            raise self.MYE("id requerido")
        rs = self.d2d(self.conexion.consulta_asociativa(
            "SELECT grupo_id FROM articulos WHERE id = :id", {'id': aid}
        ))
        if not rs:
            raise self.MYE("Articulo no encontrado")
        self.require_grupo_member(rs[0]['grupo_id'])
        self.conexion.ejecutar("UPDATE articulos SET activo = FALSE WHERE id = :id", {'id': aid})
        self.response = {"message": "Articulo eliminado"}


# ===================== MOVIMIENTOS =====================
class RegistrarMovimiento(SessionApi):
    def main(self):
        aid = self.data.get('articulo_id')
        tipo = self.data.get('tipo')  # agregar | descontar | reajustar
        if not aid or tipo not in ('agregar', 'descontar', 'reajustar'):
            raise self.MYE("articulo_id y tipo validos requeridos")
        try:
            cant = float(self.data.get('cantidad'))
        except Exception:
            raise self.MYE("cantidad invalida")
        if cant < 0:
            raise self.MYE("cantidad debe ser >= 0")

        rs = self.d2d(self.conexion.consulta_asociativa(
            "SELECT id, grupo_id, cantidad FROM articulos WHERE id = :id AND activo = TRUE",
            {'id': aid},
        ))
        if not rs:
            raise self.MYE("Articulo no encontrado")
        articulo = rs[0]
        self.require_grupo_member(articulo['grupo_id'])

        actual = float(articulo['cantidad'] or 0)
        if tipo == 'agregar':
            nueva = actual + cant
        elif tipo == 'descontar':
            nueva = max(actual - cant, 0)
        else:
            nueva = cant

        self.conexion.ejecutar("""
            UPDATE articulos SET cantidad = :nc, updated_at = CURRENT_TIMESTAMP
            WHERE id = :id
        """, {'nc': nueva, 'id': aid})

        self.conexion.ejecutar("""
            INSERT INTO movimientos (id, articulo_id, grupo_id, usuario_id, tipo,
                cantidad, cantidad_anterior, cantidad_posterior, origen, comentario)
            VALUES (:id, :aid, :gid, :uid, :t, :c, :ca, :cp, 'manual', :cm)
        """, {
            'id': self.get_id(), 'aid': aid, 'gid': articulo['grupo_id'],
            'uid': self.usuario['id'], 't': tipo,
            'c': cant, 'ca': actual, 'cp': nueva,
            'cm': self.data.get('comentario'),
        })
        self.response = {
            "cantidad_anterior": actual, "cantidad_posterior": nueva,
            "message": "Movimiento registrado",
        }


# ===================== SUGGEST AI =====================
class Suggest(SessionApi):
    def main(self):
        gid = self.data.get('grupo_id')
        q = (self.data.get('q') or '').strip()
        if not gid:
            raise self.MYE("grupo_id requerido")
        self.require_grupo_member(gid)

        existentes = [r['nombre'] for r in self.d2d(self.conexion.consulta_asociativa(
            "SELECT nombre FROM articulos WHERE grupo_id = :gid AND activo = TRUE",
            {'gid': gid},
        ))]
        categorias = [r['nombre'] for r in self.d2d(self.conexion.consulta_asociativa(
            "SELECT nombre FROM categorias WHERE grupo_id = :gid", {'gid': gid},
        ))]

        local = []
        ql = q.lower()
        if ql:
            local = [n for n in existentes if ql in n.lower()][:5]

        ai = {"sugerencias": [], "categoria_sugerida": None, "similares": []}
        if q and len(q) >= 2:
            try:
                ai = llm.sugerencias_articulo(q, existentes, categorias)
            except Exception as e:
                self.send_me_error(f"Suggest IA: {e}")
        self.response = {
            "locales": local,
            "ia": ai,
        }


class AgruparSimilares(SessionApi):
    def main(self):
        gid = self.data.get('grupo_id')
        if not gid:
            raise self.MYE("grupo_id requerido")
        self.require_grupo_member(gid)
        items = [r['nombre'] for r in self.d2d(self.conexion.consulta_asociativa(
            "SELECT nombre FROM articulos WHERE grupo_id = :gid AND activo = TRUE ORDER BY nombre",
            {'gid': gid},
        ))]
        try:
            grupos = llm.agrupar_similares(items)
        except Exception as e:
            self.send_me_error(f"Agrupar IA: {e}")
            grupos = [[i] for i in items]
        self.response = {"grupos": grupos}


# ===================== LISTA DE COMPRAS =====================
class ListaCompras(SessionApi):
    """Lista de compras: TODOS los articulos activos, ordenados por % gastado desc.

    Cuando un articulo NO tiene `optimo` (NULL o 0), aplica defaults:
      - `optimo_efectivo = GREATEST(cantidad, 1)` (asi siempre hay un techo razonable)
      - `minimo_efectivo = COALESCE(minimo, 1)`
      - `datos_faltantes = TRUE` para marcar al usuario que complete los datos

    Calcula:
      - `pct_stock` = cantidad / optimo_efectivo * 100  (cap 999)
      - `pct_gastado` = 100 - LEAST(pct_stock, 100)
      - `faltante`   = MAX(optimo_efectivo - cantidad, 0)

    Filtros (query params):
      - `categoria_id`
      - `min_pct` (default 0): mostrar % gastado >= N
      - `max_pct` (default 100)
      - `solo_faltantes=1`: solo cuando faltante > 0
      - `incluir_sin_datos=0|1` (default 1): si 0, oculta items con `datos_faltantes`
    """
    def main(self):
        gid = self.data.get('grupo_id')
        if not gid:
            raise self.MYE("grupo_id requerido")
        self.require_grupo_member(gid)

        cat = self.data.get('categoria_id') or None
        try:
            min_pct = float(self.data.get('min_pct') or 0)
        except Exception:
            min_pct = 0
        try:
            max_pct = float(self.data.get('max_pct') or 100)
        except Exception:
            max_pct = 100
        solo_faltantes = str(self.data.get('solo_faltantes') or '').lower() in ('1', 'true', 'yes')
        incluir_sin_datos = str(self.data.get('incluir_sin_datos') or '1').lower() in ('1', 'true', 'yes')

        params = {'gid': gid}
        # CTE con valores efectivos (defaults cuando faltan datos)
        sql = """
            WITH base AS (
                SELECT a.id, a.nombre, a.descripcion, a.cantidad, a.optimo, a.minimo, a.unidad,
                       a.foto_url, a.categoria_id,
                       c.nombre AS categoria_nombre, c.color AS categoria_color, c.icono AS categoria_icono,
                       (a.optimo IS NULL OR a.optimo = 0 OR a.minimo IS NULL OR a.minimo = 0) AS datos_faltantes,
                       GREATEST(COALESCE(NULLIF(a.optimo, 0), GREATEST(a.cantidad, 1)), 1) AS optimo_efectivo,
                       COALESCE(NULLIF(a.minimo, 0), 1) AS minimo_efectivo
                FROM articulos a
                LEFT JOIN categorias c ON c.id = a.categoria_id
                WHERE a.grupo_id = :gid AND a.activo = TRUE
            )
            SELECT id, nombre, descripcion, cantidad, optimo, minimo, unidad, foto_url,
                   categoria_id, categoria_nombre, categoria_color, categoria_icono,
                   datos_faltantes, optimo_efectivo, minimo_efectivo,
                   ROUND(LEAST((cantidad / optimo_efectivo) * 100, 999), 1) AS pct_stock,
                   ROUND(GREATEST(100 - LEAST((cantidad / optimo_efectivo) * 100, 100), 0), 1) AS pct_gastado,
                   GREATEST(optimo_efectivo - cantidad, 0) AS faltante
            FROM base
            WHERE 1 = 1
        """
        if cat:
            sql += " AND categoria_id = :cat"
            params['cat'] = cat
        if not incluir_sin_datos:
            sql += " AND datos_faltantes = FALSE"
        if solo_faltantes:
            sql += " AND cantidad < optimo_efectivo"
        if min_pct > 0:
            sql += " AND (100 - LEAST((cantidad / optimo_efectivo) * 100, 100)) >= :minp"
            params['minp'] = min_pct
        if max_pct < 100:
            sql += " AND (100 - LEAST((cantidad / optimo_efectivo) * 100, 100)) <= :maxp"
            params['maxp'] = max_pct
        # ordenar primero por gastado desc, despues los con datos faltantes al final
        sql += " ORDER BY datos_faltantes ASC, pct_gastado DESC NULLS LAST, nombre"

        rs = self.d2d(self.conexion.consulta_asociativa(sql, params))
        for r in rs:
            try:
                pg = float(r.get('pct_gastado') or 0)
            except Exception:
                pg = 0
            if r.get('datos_faltantes'):
                # severidad ligera cuando no hay datos: solo refleja gastado real
                if pg >= 90: r['severidad'] = 'critico'
                elif pg >= 70: r['severidad'] = 'alto'
                elif pg >= 50: r['severidad'] = 'medio'
                else: r['severidad'] = 'sin_datos'
            else:
                if pg >= 90: r['severidad'] = 'critico'
                elif pg >= 70: r['severidad'] = 'alto'
                elif pg >= 50: r['severidad'] = 'medio'
                elif pg >= 30: r['severidad'] = 'bajo'
                else: r['severidad'] = 'ok'
        self.response = {"items": rs, "total": len(rs)}
