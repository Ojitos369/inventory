import { localStates } from '../localStates';
import { showNumber } from '../../../Core/helper';
import { DataField } from './DataField';

export const DataGrid = () => {
    const { style, articulo } = localStates();
    if (!articulo) return null;
    return (
        <div className={style.dataGrid}>
            <DataField label="Unidad" value={articulo.unidad || '—'} />
            <DataField label="SKU" value={articulo.sku || '—'} />
            <DataField
                label="Optimo"
                value={articulo.optimo > 0 ? `${showNumber(articulo.optimo, 2)} ${articulo.unidad}` : '—'}
            />
            <DataField
                label="Mínimo"
                value={articulo.minimo > 0 ? `${showNumber(articulo.minimo, 2)} ${articulo.unidad}` : '—'}
            />
        </div>
    );
};
