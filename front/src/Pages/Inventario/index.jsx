import { useNavigate } from 'react-router-dom';
import { useLocalStates } from './localStates';
import { showNumber, colorPorcentaje } from '../../Core/helper';
import { MovimientoModal } from './MovimientoModal';
import { ArticuloFormModal } from './ArticuloFormModal';
import { CategoriasManagerModal } from './CategoriasManagerModal';
import { MenuBar } from '../../Components/MenuBar';

export const Inventario = () => {
    const lc = useLocalStates();
    const { style, grupoId, articulos, categorias, q, setQ, cat, setCat, bajos, setBajos, f, loading } = lc;
    const navigate = useNavigate();

    if (!grupoId) {
        return (
            <div className={style.page}>
                <p style={{ color: 'var(--home-text-muted)' }}>Selecciona un grupo desde el menu superior.</p>
            </div>
        );
    }

    const abrirMov = (articulo, tipo) => {
        f.u1('catalog', 'movArticulo', articulo);
        f.u1('catalog', 'movTipo', tipo);
        f.u2('modals', 'catalog', 'movModal', true);
    };

    const abrirNuevo = () => {
        f.u1('catalog', 'editArticulo', null);
        f.u2('modals', 'catalog', 'formModal', true);
    };

    const abrirEditar = (a) => {
        f.u1('catalog', 'editArticulo', a);
        f.u2('modals', 'catalog', 'formModal', true);
    };

    const abrirCategorias = () => f.u2('modals', 'catalog', 'catsManager', true);

    return (
        <div className={style.page}>
            <div className={style.headerRow}>
                <h2>Inventario</h2>
                <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={abrirCategorias}
                    style={{ minHeight: 38, padding: '0 14px', fontSize: '0.85rem' }}
                >🗂️ Categorias</button>
            </div>

            <div className={style.toolbar}>
                <input
                    placeholder="Buscar articulo…"
                    value={q}
                    onChange={e => setQ(e.target.value)}
                />
                <select value={cat || ''} onChange={e => setCat(e.target.value || null)}>
                    <option value="">Todas las categorias</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
                <button
                    type="button"
                    className={`${style.filterChip} ${bajos ? style.on : ''}`}
                    onClick={() => setBajos(!bajos)}
                >
                    {bajos ? '✓ ' : ''}Bajo optimo
                </button>
            </div>

            {loading && articulos.length === 0 && <p style={{ color: 'var(--home-text-muted)' }}>Cargando…</p>}
            {!loading && articulos.length === 0 && (
                <p style={{ color: 'var(--home-text-muted)', textAlign: 'center', padding: 20 }}>
                    No hay articulos. Crea el primero con el boton +.
                </p>
            )}

            <div className={style.list}>
                {articulos.map(a => {
                    const pct = a.optimo > 0 ? Math.min(Number(a.cantidad) / Number(a.optimo) * 100, 999) : null;
                    const fillW = pct == null ? 0 : Math.min(pct, 100);
                    return (
                        <div key={a.id} className={style.itemCard}>
                            <div className="row1" onClick={() => navigate(`/articulo/${a.id}`)}>
                                {a.foto_url && (
                                    <img
                                        src={f.general.mediaUrl(a.foto_url)}
                                        alt=""
                                        className="thumb"
                                    />
                                )}
                                <div className="row1info">
                                    <div className="nombre">{a.nombre}</div>
                                    {a.descripcion && (
                                        <div style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)', marginTop: 2 }}>
                                            {a.descripcion}
                                        </div>
                                    )}
                                </div>
                                {a.categoria_nombre && (
                                    <span className="cat" style={a.categoria_color ? { background: a.categoria_color + '22', color: a.categoria_color } : {}}>
                                        {a.categoria_nombre}
                                    </span>
                                )}
                            </div>
                            <div className="row2">
                                <div>
                                    <div className="cantidad" style={{ color: colorPorcentaje(pct) }}>
                                        {showNumber(a.cantidad, 2)}
                                        <span style={{ fontSize: '0.7rem', color: 'var(--home-text-muted)', marginLeft: 4 }}>{a.unidad}</span>
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--home-text-muted)' }}>
                                        Optimo: {showNumber(a.optimo, 2)}
                                    </div>
                                </div>
                                <div className="actions">
                                    <button type="button" className="sub" onClick={() => abrirMov(a, 'descontar')} aria-label="Descontar" title="Descontar">−</button>
                                    <button type="button" className="add" onClick={() => abrirMov(a, 'agregar')} aria-label="Agregar" title="Agregar">+</button>
                                    <MenuBar
                                        align="right"
                                        width={210}
                                        trigger={(open, toggle) => (
                                            <button
                                                type="button"
                                                className={`more ${open ? 'on' : ''}`}
                                                onClick={(e) => { e.stopPropagation(); toggle(); }}
                                                aria-label="Mas acciones"
                                                title="Mas"
                                            >⋯</button>
                                        )}
                                    >
                                        <MenuBar.Item icon="✏️" onClick={() => abrirEditar(a)}>Editar</MenuBar.Item>
                                        <MenuBar.Item icon="🔄" onClick={() => abrirMov(a, 'reajustar')}>Reajustar</MenuBar.Item>
                                        <MenuBar.Item icon="🔍" onClick={() => navigate(`/articulo/${a.id}`)}>Ver detalle</MenuBar.Item>
                                        <MenuBar.Divider />
                                        <MenuBar.Item icon="🗑️" danger onClick={() => {
                                            if (confirm(`Eliminar ${a.nombre}?`)) f.catalog.removeArticulo(grupoId, a.id);
                                        }}>Eliminar</MenuBar.Item>
                                    </MenuBar>
                                </div>
                            </div>
                            <div className="progress">
                                <div className="fill" style={{ width: `${fillW}%`, background: colorPorcentaje(pct) }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button type="button" className={style.fab} onClick={abrirNuevo} aria-label="Nuevo articulo">+</button>

            <MovimientoModal />
            <ArticuloFormModal />
            <CategoriasManagerModal grupoId={grupoId} />
        </div>
    );
};
