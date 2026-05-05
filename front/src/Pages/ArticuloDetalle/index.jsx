import { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStates } from '../../Hooks/useStates';
import { showNumber, showDate, colorPorcentaje } from '../../Core/helper';
import { MovimientoModal } from '../Inventario/MovimientoModal';
import { ArticuloFormModal } from '../Inventario/ArticuloFormModal';
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

    // Si se edita el articulo desde el modal, refresca el detalle.
    const formOpen = !!s.modals?.catalog?.formModal;
    useEffect(() => {
        if (!formOpen && id) f.catalog.getArticulo(id);
    }, [formOpen]);

    if (!articulo) return <div className={style.page}><p style={{ color: 'var(--home-text-muted)' }}>Cargando…</p></div>;

    const pct = articulo.optimo > 0 ? Math.min(Number(articulo.cantidad) / Number(articulo.optimo) * 100, 999) : null;

    const abrirMov = (tipo) => {
        f.u1('catalog', 'movArticulo', articulo);
        f.u1('catalog', 'movTipo', tipo);
        f.u2('modals', 'catalog', 'movModal', true);
    };

    const editar = () => {
        f.u1('catalog', 'editArticulo', articulo);
        f.u2('modals', 'catalog', 'formModal', true);
    };

    const eliminar = () => {
        if (!confirm(`Eliminar "${articulo.nombre}"?`)) return;
        f.catalog.removeArticulo(articulo.grupo_id, articulo.id);
        navigate('/inventario');
    };

    return (
        <div className={style.page}>
            <div className={style.topbar}>
                <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>← Volver</button>
                <button type="button" className="btn btn-primary" onClick={editar}>✏️ Editar</button>
            </div>
            <div className={style.head}>
                {articulo.foto_url && (
                    <div className={style.fotoWrap}>
                        <img
                            src={f.general.mediaUrl(articulo.foto_url)}
                            alt=""
                            className={style.foto}
                        />
                    </div>
                )}
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
                        Optimo: {articulo.optimo > 0 ? showNumber(articulo.optimo, 2) : <em>sin definir</em>} ·{' '}
                        Minimo: {articulo.minimo > 0 ? showNumber(articulo.minimo, 2) : <em>sin definir</em>}
                        {pct != null && <> · {pct.toFixed(0)}%</>}
                    </div>
                </div>
                <div className={style.actions}>
                    <button type="button" className="sub" onClick={() => abrirMov('descontar')}>−</button>
                    <button type="button" className="add" onClick={() => abrirMov('agregar')}>+</button>
                    <button type="button" className="adj" onClick={() => abrirMov('reajustar')} title="Reajustar">⟳</button>
                </div>
            </div>

            {/* Datos rapidos */}
            <div className={style.dataGrid}>
                <DataField label="Unidad" value={articulo.unidad || '—'} />
                <DataField label="SKU" value={articulo.sku || '—'} />
                <DataField label="Optimo" value={articulo.optimo > 0 ? `${showNumber(articulo.optimo, 2)} ${articulo.unidad}` : '—'} />
                <DataField label="Mínimo" value={articulo.minimo > 0 ? `${showNumber(articulo.minimo, 2)} ${articulo.unidad}` : '—'} />
            </div>

            {articulo.descripcion && (
                <div className="card" style={{ padding: 16 }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: 6, fontFamily: 'var(--home-font-display)' }}>Descripcion</h3>
                    <p style={{ color: 'var(--home-text-soft)' }}>{articulo.descripcion}</p>
                </div>
            )}

            {articulo.notas && (
                <div className="card" style={{ padding: 16 }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: 6, fontFamily: 'var(--home-font-display)' }}>Notas</h3>
                    <p style={{ color: 'var(--home-text-soft)' }}>{articulo.notas}</p>
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
            <ArticuloFormModal />
        </div>
    );
};

const DataField = ({ label, value }) => (
    <div style={{
        background: 'var(--home-bg-3)',
        borderRadius: 'var(--home-r-md)',
        padding: '8px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
    }}>
        <span style={{ fontSize: '0.66rem', color: 'var(--home-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
        <span style={{ fontWeight: 700, fontSize: '0.92rem', fontFamily: 'var(--home-font-display)' }}>{value}</span>
    </div>
);
