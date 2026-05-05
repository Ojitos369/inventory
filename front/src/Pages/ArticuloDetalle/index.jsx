import { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStates } from '../../Hooks/useStates';
import { showNumber, showDate, colorPorcentaje } from '../../Core/helper';
import { MovimientoModal } from '../Inventario/MovimientoModal';
import style from './styles/index.module.scss';

export const ArticuloDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { s, f } = useStates();
    const data = useMemo(() => s.catalog?.detalle, [s.catalog?.detalle]);
    const articulo = data?.articulo;
    const movimientos = data?.movimientos || [];

    useEffect(() => {
        if (id) f.catalog.getArticulo(id);
        return () => f.u1('catalog', 'detalle', null);
    }, [id]);

    if (!articulo) return <div className={style.page}><p style={{ color: 'var(--home-text-muted)' }}>Cargando…</p></div>;

    const pct = articulo.optimo > 0 ? Math.min(Number(articulo.cantidad) / Number(articulo.optimo) * 100, 999) : null;

    const abrirMov = (tipo) => {
        f.u1('catalog', 'movArticulo', articulo);
        f.u1('catalog', 'movTipo', tipo);
        f.u2('modals', 'catalog', 'movModal', true);
    };

    const eliminar = () => {
        if (!confirm(`Eliminar "${articulo.nombre}"?`)) return;
        f.catalog.removeArticulo(articulo.grupo_id, articulo.id);
        navigate('/inventario');
    };

    return (
        <div className={style.page}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)} style={{ alignSelf: 'flex-start' }}>← Volver</button>
            <div className={style.head}>
                <h2>{articulo.nombre}</h2>
                <span className={style.meta}>
                    {articulo.categoria_nombre || 'Sin categoria'} · actualizado {showDate(articulo.updated_at)}
                </span>
            </div>

            <div className={style.cantidadBig}>
                <div>
                    <div className={style.num} style={{ color: colorPorcentaje(pct) }}>
                        {showNumber(articulo.cantidad, 2)}
                        <span style={{ fontSize: '1rem', color: 'var(--home-text-muted)', marginLeft: 6 }}>{articulo.unidad}</span>
                    </div>
                    <div className={style.opt}>
                        Optimo: {showNumber(articulo.optimo, 2)} · Minimo: {showNumber(articulo.minimo, 2)}
                        {pct != null && <> · {pct.toFixed(0)}%</>}
                    </div>
                </div>
                <div className={style.actions}>
                    <button type="button" className="sub" onClick={() => abrirMov('descontar')}>−</button>
                    <button type="button" className="add" onClick={() => abrirMov('agregar')}>+</button>
                    <button type="button" className="adj" onClick={() => abrirMov('reajustar')} title="Reajustar">⟳</button>
                </div>
            </div>

            {articulo.descripcion && (
                <div className="card" style={{ padding: 16 }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: 6, fontFamily: 'var(--home-font-display)' }}>Descripcion</h3>
                    <p style={{ color: 'var(--home-text-soft)' }}>{articulo.descripcion}</p>
                </div>
            )}

            <div className={style.movs}>
                <h3>Movimientos</h3>
                {movimientos.length === 0 && <p style={{ color: 'var(--home-text-muted)' }}>Sin movimientos.</p>}
                {movimientos.map(m => (
                    <div className="row" key={m.id}>
                        <div>
                            <div style={{ fontWeight: 600 }}>
                                {m.tipo} · {showNumber(m.cantidad, 2)}
                            </div>
                            <div className="meta">
                                {showNumber(m.cantidad_anterior, 2)} → {showNumber(m.cantidad_posterior, 2)}
                                {m.username && ` · ${m.username}`} · {showDate(m.created_at)}
                                {m.origen && m.origen !== 'manual' && ` · ${m.origen}`}
                                {m.comentario && ` · ${m.comentario}`}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button type="button" className="btn btn-danger" onClick={eliminar}>Eliminar articulo</button>

            <MovimientoModal />
        </div>
    );
};
