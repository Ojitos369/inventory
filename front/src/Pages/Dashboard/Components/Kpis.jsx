import { localStates } from '../localStates';
import { showNumber } from '../../../Core/helper';

export const Kpis = () => {
    const { style, kpis } = localStates();
    return (
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
    );
};
