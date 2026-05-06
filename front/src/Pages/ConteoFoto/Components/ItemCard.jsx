import { localStates } from '../localStates';
import { showNumber } from '../../../Core/helper';

export const ItemCard = ({ item, idx }) => {
    const { style, MODES, updateItem, removeItem } = localStates();
    const modo = item.modo || 'reemplazar';

    return (
        <div className={`${style.itemCard} ${style[`m_${modo}`]}`}>
            <div className={style.itemTop}>
                <input
                    className={style.objInput}
                    value={item.objeto || ''}
                    onChange={e => updateItem(idx, 'objeto', e.target.value)}
                />
                <button
                    type="button"
                    className={style.del}
                    onClick={() => removeItem(idx)}
                    aria-label="Quitar"
                >×</button>
            </div>
            <div className={style.itemBottom}>
                <div className={style.qtyBlock}>
                    <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        value={item.cantidad}
                        onChange={e => updateItem(idx, 'cantidad', e.target.value)}
                        className={style.qtyInput}
                    />
                    <input
                        className={style.unidadInput}
                        value={item.unidad || ''}
                        onChange={e => updateItem(idx, 'unidad', e.target.value)}
                        placeholder="pz"
                    />
                </div>
                <span className={style.itemMeta}>
                    {item.articulo_id
                        ? `Existente · actual ${showNumber(item.cantidad_actual, 2)}`
                        : 'Nuevo articulo'}
                </span>
            </div>
            <div className={style.modeRowItem}>
                {MODES.map(m => (
                    <button
                        key={m.id}
                        type="button"
                        className={`${style.modeBtn} ${modo === m.id ? style.active : ''}`}
                        onClick={() => updateItem(idx, 'modo', m.id)}
                    >
                        <span>{m.icon}</span>
                        <span>{m.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
