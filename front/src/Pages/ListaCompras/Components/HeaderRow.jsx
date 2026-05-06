import { localStates } from '../localStates';
import { showNumber } from '../../../Core/helper';

export const HeaderRow = () => {
    const { style, filtrados, criticos, totalFaltante } = localStates();
    return (
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
    );
};
