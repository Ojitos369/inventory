import { localStates, datosFaltantes } from '../localStates';
import { showNumber, colorPorcentaje } from '../../../Core/helper';
import { MenuBar } from '../../../Components/MenuBar';

export const ArticuloCard = ({ a }) => {
    const { style, f, grupoId, navigate, abrirMov, abrirEditar, cardClick } = localStates();
    const pct = a.optimo > 0 ? Math.min(Number(a.cantidad) / Number(a.optimo) * 100, 999) : null;
    const fillW = pct == null ? 0 : Math.min(pct, 100);
    const tieneTodos = datosFaltantes(a).length === 0;

    return (
        <div
            className={`${style.itemCard} ${!tieneTodos ? style.incompleta : ''}`}
            onClick={(e) => cardClick(a, e)}
            role="button"
        >
            <div className="row1">
                {a.foto_url ? (
                    <img src={f.general.mediaUrl(a.foto_url)} alt="" className="thumb" />
                ) : (
                    <div className="thumb noPhoto">📦</div>
                )}
                <div className="row1info">
                    <div className="nombre">{a.nombre}</div>
                    {a.descripcion ? (
                        <div className="desc">{a.descripcion}</div>
                    ) : (
                        <div className="descMissing">sin descripción</div>
                    )}
                </div>
                {a.categoria_nombre ? (
                    <span
                        className="cat"
                        style={a.categoria_color ? { background: a.categoria_color + '22', color: a.categoria_color } : {}}
                    >
                        {a.categoria_icono ? `${a.categoria_icono} ` : ''}{a.categoria_nombre}
                    </span>
                ) : (
                    <span className="cat catMissing">sin categoría</span>
                )}
            </div>

            <div className="row2">
                <div>
                    <div className="cantidad" style={{ color: colorPorcentaje(pct) }}>
                        {showNumber(a.cantidad, 2)}
                        <span className="unit">{a.unidad}</span>
                    </div>
                    <div className="opt">
                        Optimo: {a.optimo > 0 ? showNumber(a.optimo, 2) : <em>sin definir</em>}
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
                            if (confirm(`Eliminar ${a.nombre}?`)) f.catalog.articulos.eliminar(grupoId, a.id);
                        }}>Eliminar</MenuBar.Item>
                    </MenuBar>
                </div>
            </div>

            {pct != null && (
                <div className="progress">
                    <div className="fill" style={{ width: `${fillW}%`, background: colorPorcentaje(pct) }}></div>
                </div>
            )}
        </div>
    );
};
