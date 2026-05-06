import { localStates } from '../localStates';
import { showNumber, colorPorcentaje } from '../../../Core/helper';

export const BajosList = () => {
    const { style, bajos } = localStates();
    return (
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
    );
};
