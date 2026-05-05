import { useEffect, useMemo } from 'react';
import { useStates } from '../../Hooks/useStates';
import { showNumber, showDate, colorPorcentaje } from '../../Core/helper';
import style from './styles/index.module.scss';

export const Dashboard = () => {
    const { s, f } = useStates();
    const grupoId = useMemo(() => s.app?.grupoActual, [s.app?.grupoActual]);
    const grupoData = useMemo(() => s.app?.grupoActualData, [s.app?.grupoActualData]);
    const data = useMemo(() => s.dashboard?.data, [s.dashboard?.data]);
    const loading = !!s.loadings?.dashboard?.general;

    useEffect(() => { if (grupoId) f.dashboard.general(grupoId); }, [grupoId]);

    if (!grupoId) {
        return (
            <div className={style.page}>
                <p className={style.empty}>Selecciona un grupo desde el menu superior para ver el dashboard.</p>
            </div>
        );
    }

    const kpis = data?.kpis || {};
    const porCat = data?.por_categoria || [];
    const bajos = data?.bajos || [];
    const movs = data?.movimientos_recientes || [];
    const totalCat = porCat.reduce((acc, c) => acc + Number(c.articulos || 0), 0) || 1;

    return (
        <div className={style.page}>
            <div className={style.heading}>
                <h2>{grupoData?.nombre || 'Dashboard'}</h2>
                <span className={style.meta}>Resumen del inventario</span>
            </div>

            <div className={style.kpis}>
                <div className={style.kpi}>
                    <div className="label">Articulos</div>
                    <div className="value">{showNumber(kpis.total_articulos, 0)}</div>
                </div>
                <div className={`${style.kpi} ${style.warning}`}>
                    <div className="label">Bajo optimo</div>
                    <div className="value">{showNumber(kpis.bajo_optimo, 0)}</div>
                </div>
                <div className={`${style.kpi} ${style.danger}`}>
                    <div className="label">Agotados</div>
                    <div className="value">{showNumber(kpis.agotados, 0)}</div>
                </div>
                <div className={`${style.kpi} ${style.success}`}>
                    <div className="label">Unidades totales</div>
                    <div className="value">{showNumber(kpis.unidades_totales, 1)}</div>
                </div>
            </div>

            <div className={style.section}>
                <h3>Por categoria</h3>
                {porCat.length === 0 && <p className={style.empty}>Sin datos.</p>}
                {porCat.map((c, i) => {
                    const pct = (Number(c.articulos || 0) / totalCat) * 100;
                    return (
                        <div className={style.barRow} key={i}>
                            <div className="top">
                                <span>{c.categoria}</span>
                                <span style={{ color: 'var(--home-text-muted)' }}>{showNumber(c.articulos, 0)} items</span>
                            </div>
                            <div className="track">
                                <div className="fill" style={{ width: `${pct}%`, background: c.color || 'var(--home-mint)' }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className={style.section}>
                <h3>Articulos bajos del optimo</h3>
                {bajos.length === 0 && <p className={style.empty}>Todo en orden.</p>}
                <div className={style.list}>
                    {bajos.map(b => (
                        <div key={b.id} className="row">
                            <div>
                                <div className="name">{b.nombre}</div>
                                <div className="meta">{showNumber(b.cantidad, 1)} / {showNumber(b.optimo, 1)} {b.unidad}</div>
                            </div>
                            <div className="value" style={{ color: colorPorcentaje(Number(b.porcentaje || 0)) }}>
                                {b.porcentaje != null ? `${b.porcentaje}%` : '-'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={style.section}>
                <h3>Movimientos recientes</h3>
                {movs.length === 0 && <p className={style.empty}>Sin movimientos aun.</p>}
                <div className={style.list}>
                    {movs.map(m => (
                        <div key={m.id} className="row">
                            <div>
                                <div className="name">{m.articulo}</div>
                                <div className="meta">
                                    <span className={`badge ${m.tipo}`}>{m.tipo}</span>
                                    {' '} por {m.username || 'sistema'} · {showDate(m.created_at)}
                                </div>
                            </div>
                            <div className="value">
                                {m.cantidad_anterior != null ? `${showNumber(m.cantidad_anterior, 1)} → ${showNumber(m.cantidad_posterior, 1)}` : showNumber(m.cantidad, 1)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {loading && <p className={style.empty}>Cargando…</p>}
        </div>
    );
};
