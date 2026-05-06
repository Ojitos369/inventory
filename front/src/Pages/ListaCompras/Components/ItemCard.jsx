import { localStates, SEVERIDAD } from '../localStates';
import { showNumber } from '../../../Core/helper';

export const ItemCard = ({ it }) => {
    const { style, f, navigate, abrirAgregar, abrirEditar } = localStates();
    const sev = SEVERIDAD[it.severidad] || SEVERIDAD.ok;
    const pg = Number(it.pct_gastado || 0);
    const sinDatos = !!it.datos_faltantes;

    return (
        <div
            className={`${style.itemCard} ${sinDatos ? style.sinDatos : ''}`}
            style={{ borderLeftColor: sev.color }}
        >
            <div className={style.itemMain} onClick={() => navigate(`/articulo/${it.id}`)}>
                {it.foto_url && (
                    <img src={f.general.mediaUrl(it.foto_url)} alt="" className={style.thumb} />
                )}
                <div className={style.info}>
                    <div className={style.nombreRow}>
                        <span className={style.nombre}>{it.nombre}</span>
                        <span
                            className={style.sevBadge}
                            style={{ background: sev.bg, color: sev.color }}
                        >{sev.label}</span>
                    </div>
                    {it.categoria_nombre && (
                        <span
                            className={style.cat}
                            style={it.categoria_color ? { background: it.categoria_color + '22', color: it.categoria_color } : {}}
                        >
                            {it.categoria_icono ? `${it.categoria_icono} ` : ''}{it.categoria_nombre}
                        </span>
                    )}
                </div>
            </div>

            {sinDatos && (
                <div
                    className={style.warningNote}
                    onClick={(e) => { e.stopPropagation(); abrirEditar(it); }}
                >
                    ⚠️ Faltan datos en el inventario (optimo / minimo). Toca para editarlos.
                </div>
            )}

            <div className={style.metrics}>
                <div className={style.metric}>
                    <span className={style.mLabel}>Actual</span>
                    <span className={style.mValue}>
                        {showNumber(it.cantidad, 2)} <small>{it.unidad}</small>
                    </span>
                </div>
                <div className={style.metric}>
                    <span className={style.mLabel}>Optimo</span>
                    <span className={style.mValue}>
                        {showNumber(it.optimo || it.optimo_efectivo, 2)} <small>{it.unidad}</small>
                        {sinDatos && <em className={style.defValTag}> · default</em>}
                    </span>
                </div>
                <div className={style.metric}>
                    <span className={style.mLabel}>Faltan</span>
                    <span className={style.mValue} style={{ color: sev.color }}>
                        {showNumber(it.faltante, 2)} <small>{it.unidad}</small>
                    </span>
                </div>
                <div className={style.metric}>
                    <span className={style.mLabel}>Gastado</span>
                    <span className={style.mValue} style={{ color: sev.color }}>
                        {pg.toFixed(0)}%
                    </span>
                </div>
            </div>

            <div className={style.bar}>
                <div
                    className={style.barFill}
                    style={{ width: `${Math.min(pg, 100)}%`, background: sev.color }}
                />
            </div>

            <div className={style.actions}>
                <button
                    type="button"
                    className={style.cta}
                    onClick={() => abrirAgregar(it)}
                    style={{ background: sev.bg, color: sev.color, borderColor: sev.color }}
                >
                    ➕ Comprar / Agregar al stock
                </button>
                <button
                    type="button"
                    className={style.editBtn}
                    onClick={() => abrirEditar(it)}
                    title="Editar datos"
                >✏️</button>
            </div>
        </div>
    );
};
