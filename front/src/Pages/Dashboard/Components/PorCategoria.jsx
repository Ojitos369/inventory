import { localStates } from '../localStates';
import { showNumber } from '../../../Core/helper';

export const PorCategoria = () => {
    const { style, porCat, totalCat } = localStates();
    return (
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
    );
};
