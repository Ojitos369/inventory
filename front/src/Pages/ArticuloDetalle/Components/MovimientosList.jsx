import { localStates } from '../localStates';
import { showNumber, showDate } from '../../../Core/helper';

export const MovimientosList = () => {
    const { style, movimientos } = localStates();
    return (
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
    );
};
