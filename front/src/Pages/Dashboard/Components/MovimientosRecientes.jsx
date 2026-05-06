import { localStates } from '../localStates';
import { showNumber, showDate } from '../../../Core/helper';

export const MovimientosRecientes = () => {
    const { style, movs } = localStates();
    return (
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
                            {m.cantidad_anterior != null
                                ? `${showNumber(m.cantidad_anterior, 1)} → ${showNumber(m.cantidad_posterior, 1)}`
                                : showNumber(m.cantidad, 1)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
