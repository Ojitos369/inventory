import { localStates } from '../localStates';
import { showNumber, colorPorcentaje } from '../../../Core/helper';

export const CantidadBig = () => {
    const { style, articulo, abrirMov } = localStates();
    if (!articulo) return null;
    const pct = articulo.optimo > 0
        ? Math.min(Number(articulo.cantidad) / Number(articulo.optimo) * 100, 999)
        : null;

    return (
        <div className={style.cantidadBig}>
            <div>
                <div className={style.num} style={{ color: colorPorcentaje(pct) }}>
                    {showNumber(articulo.cantidad, 2)}
                    <span style={{ fontSize: '1rem', color: 'var(--home-text-muted)', marginLeft: 6 }}>{articulo.unidad}</span>
                </div>
                <div className={style.opt}>
                    Optimo: {articulo.optimo > 0 ? showNumber(articulo.optimo, 2) : <em>sin definir</em>} ·{' '}
                    Minimo: {articulo.minimo > 0 ? showNumber(articulo.minimo, 2) : <em>sin definir</em>}
                    {pct != null && <> · {pct.toFixed(0)}%</>}
                </div>
            </div>
            <div className={style.actions}>
                <button type="button" className="sub" onClick={() => abrirMov('descontar')}>−</button>
                <button type="button" className="add" onClick={() => abrirMov('agregar')}>+</button>
                <button type="button" className="adj" onClick={() => abrirMov('reajustar')} title="Reajustar">⟳</button>
            </div>
        </div>
    );
};
