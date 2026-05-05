import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStates } from '../../Hooks/useStates';
import { showNumber } from '../../Core/helper';
import { MovimientoModal } from '../Inventario/MovimientoModal';
import { ArticuloFormModal } from '../Inventario/ArticuloFormModal';
import style from './styles/index.module.scss';


const SEVERIDAD = {
    critico:   { label: '🔥 Critico', color: 'var(--home-danger)', bg: 'var(--home-danger-soft)' },
    alto:      { label: '⚠️ Alto',    color: '#FB923C',           bg: 'rgba(251,146,60,0.16)' },
    medio:     { label: '🟡 Medio',   color: 'var(--home-warning)', bg: 'var(--home-warning-soft)' },
    bajo:      { label: '🟢 Bajo',    color: 'var(--home-success)', bg: 'var(--home-success-soft)' },
    ok:        { label: '✅ OK',      color: 'var(--home-text-soft)', bg: 'var(--home-bg-3)' },
    sin_datos: { label: '❓ Sin datos', color: 'var(--home-info)', bg: 'var(--home-info-soft)' },
};


export const ListaCompras = () => {
    const { s, f } = useStates();
    const navigate = useNavigate();
    const grupoId = useMemo(() => s.app?.grupoActual, [s.app?.grupoActual]);
    const items = useMemo(() => s.catalog?.shopping?.[grupoId] || [], [s.catalog?.shopping, grupoId]);
    const categorias = useMemo(() => s.catalog?.categorias?.[grupoId] || [], [s.catalog?.categorias, grupoId]);
    const loading = !!s.loadings?.catalog?.shopping;

    const [cat, setCat] = useState('');
    const [minPct, setMinPct] = useState(0);
    const [soloFaltantes, setSoloFaltantes] = useState(true);
    const [incluirSinDatos, setIncluirSinDatos] = useState(true);
    const [q, setQ] = useState('');

    useEffect(() => { if (grupoId) f.catalog.listCategorias(grupoId); }, [grupoId]);

    useEffect(() => {
        if (!grupoId) return;
        const params = { grupo_id: grupoId };
        if (cat) params.categoria_id = cat;
        if (minPct > 0) params.min_pct = minPct;
        if (soloFaltantes) params.solo_faltantes = '1';
        params.incluir_sin_datos = incluirSinDatos ? '1' : '0';
        f.catalog.listShopping(params);
    }, [grupoId, cat, minPct, soloFaltantes, incluirSinDatos]);

    const filtrados = useMemo(() => {
        const ql = q.trim().toLowerCase();
        if (!ql) return items;
        return items.filter(i => (i.nombre || '').toLowerCase().includes(ql));
    }, [items, q]);

    const totalFaltante = filtrados.reduce((acc, i) => acc + Number(i.faltante || 0), 0);
    const criticos = filtrados.filter(i => i.severidad === 'critico').length;

    const abrirAgregar = (it) => {
        // si faltante <= 0 (caso sin datos lleno), sugiere 1
        const sug = Number(it.faltante || 0) > 0 ? it.faltante : 1;
        f.u1('catalog', 'movArticulo', { ...it, cantidadSugerida: sug });
        f.u1('catalog', 'movTipo', 'agregar');
        f.u2('modals', 'catalog', 'movModal', true);
    };

    const abrirEditar = (it) => {
        f.u1('catalog', 'editArticulo', it);
        f.u2('modals', 'catalog', 'formModal', true);
    };

    if (!grupoId) {
        return <div className={style.page}><p style={{ color: 'var(--home-text-muted)' }}>Selecciona un grupo desde el menu superior.</p></div>;
    }

    return (
        <div className={style.page}>
            <div className={style.headerRow}>
                <div>
                    <h2>Lista de compras</h2>
                    <span className={style.summary}>
                        {filtrados.length} item{filtrados.length === 1 ? '' : 's'}
                        {criticos > 0 && <> · <strong style={{ color: 'var(--home-danger)' }}>{criticos} criticos</strong></>}
                        {totalFaltante > 0 && <> · faltan {showNumber(totalFaltante, 2)} unidades totales</>}
                    </span>
                </div>
            </div>

            <div className={style.filters}>
                <input
                    placeholder="Buscar…"
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    className={style.search}
                />
                <select value={cat} onChange={e => setCat(e.target.value)}>
                    <option value="">Todas las categorias</option>
                    {categorias.map(c => (
                        <option key={c.id} value={c.id}>{c.icono ? `${c.icono} ` : ''}{c.nombre}</option>
                    ))}
                </select>
                <label className={style.chip}>
                    <input
                        type="checkbox"
                        checked={soloFaltantes}
                        onChange={e => setSoloFaltantes(e.target.checked)}
                    />
                    <span>Solo faltantes</span>
                </label>
                <label className={style.chip}>
                    <input
                        type="checkbox"
                        checked={incluirSinDatos}
                        onChange={e => setIncluirSinDatos(e.target.checked)}
                    />
                    <span>Incluir sin datos</span>
                </label>
            </div>

            <div className={style.pctChips}>
                <span style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)' }}>% gastado mínimo:</span>
                {[0, 30, 50, 70, 90].map(v => (
                    <button
                        key={v}
                        type="button"
                        className={`${style.pctChip} ${minPct === v ? style.pctOn : ''}`}
                        onClick={() => setMinPct(v)}
                    >{v === 0 ? 'Todos' : `≥ ${v}%`}</button>
                ))}
            </div>

            {loading && filtrados.length === 0 && <p style={{ color: 'var(--home-text-muted)' }}>Cargando…</p>}
            {!loading && filtrados.length === 0 && (
                <p style={{ color: 'var(--home-text-muted)', textAlign: 'center', padding: 24 }}>
                    🎉 Nada que comprar. El inventario esta optimo.
                </p>
            )}

            <div className={style.list}>
                {filtrados.map(it => {
                    const sev = SEVERIDAD[it.severidad] || SEVERIDAD.ok;
                    const pg = Number(it.pct_gastado || 0);
                    const sinDatos = !!it.datos_faltantes;
                    return (
                        <div
                            key={it.id}
                            className={`${style.itemCard} ${sinDatos ? style.sinDatos : ''}`}
                            style={{ borderLeftColor: sev.color }}
                        >
                            <div
                                className={style.itemMain}
                                onClick={() => navigate(`/articulo/${it.id}`)}
                            >
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
                })}
            </div>
            <ArticuloFormModal />

            <MovimientoModal />
        </div>
    );
};
