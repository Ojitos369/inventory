from core.bases.apis import SessionApi


class DashboardGeneral(SessionApi):
    def main(self):
        gid = self.data.get('grupo_id')
        if not gid:
            raise self.MYE("grupo_id requerido")
        self.require_grupo_member(gid)

        kpis = self.d2d(self.conexion.consulta_asociativa("""
            SELECT
                COUNT(*) FILTER (WHERE activo) AS total_articulos,
                COUNT(*) FILTER (WHERE activo AND optimo > 0 AND cantidad < optimo) AS bajo_optimo,
                COUNT(*) FILTER (WHERE activo AND cantidad <= 0) AS agotados,
                COUNT(*) FILTER (WHERE activo AND minimo > 0 AND cantidad <= minimo) AS criticos,
                COALESCE(SUM(cantidad), 0) AS unidades_totales
            FROM articulos WHERE grupo_id = :gid
        """, {'gid': gid}))

        por_categoria = self.d2d(self.conexion.consulta_asociativa("""
            SELECT
                COALESCE(c.nombre, 'Sin categoria') AS categoria,
                c.color AS color,
                COUNT(a.id) AS articulos,
                COALESCE(SUM(a.cantidad), 0) AS unidades
            FROM articulos a
            LEFT JOIN categorias c ON c.id = a.categoria_id
            WHERE a.grupo_id = :gid AND a.activo = TRUE
            GROUP BY COALESCE(c.nombre, 'Sin categoria'), c.color
            ORDER BY articulos DESC
        """, {'gid': gid}))

        bajos = self.d2d(self.conexion.consulta_asociativa("""
            SELECT id, nombre, cantidad, optimo, unidad,
                   CASE WHEN optimo > 0 THEN ROUND((cantidad / optimo) * 100, 1) ELSE NULL END AS porcentaje
            FROM articulos
            WHERE grupo_id = :gid AND activo = TRUE AND optimo > 0 AND cantidad < optimo
            ORDER BY (cantidad / NULLIF(optimo, 0)) ASC
            LIMIT 10
        """, {'gid': gid}))

        movs = self.d2d(self.conexion.consulta_asociativa("""
            SELECT m.id, m.tipo, m.cantidad, m.cantidad_anterior, m.cantidad_posterior,
                   m.origen, m.created_at, a.nombre AS articulo, u.username
            FROM movimientos m
            JOIN articulos a ON a.id = m.articulo_id
            LEFT JOIN usuarios u ON u.id = m.usuario_id
            WHERE m.grupo_id = :gid
            ORDER BY m.created_at DESC
            LIMIT 20
        """, {'gid': gid}))

        movs_por_dia = self.d2d(self.conexion.consulta_asociativa("""
            SELECT DATE(created_at) AS dia,
                   SUM(CASE WHEN tipo = 'agregar' THEN cantidad ELSE 0 END) AS agregadas,
                   SUM(CASE WHEN tipo = 'descontar' THEN cantidad ELSE 0 END) AS descontadas
            FROM movimientos
            WHERE grupo_id = :gid AND created_at >= CURRENT_DATE - INTERVAL '14 days'
            GROUP BY DATE(created_at)
            ORDER BY dia
        """, {'gid': gid}))

        self.response = {
            "kpis": kpis[0] if kpis else {},
            "por_categoria": por_categoria,
            "bajos": bajos,
            "movimientos_recientes": movs,
            "tendencia": movs_por_dia,
        }
