import { localStates } from '../localStates';

export const HeaderRow = () => {
    const { style, abrirCategorias } = localStates();
    return (
        <div className={style.headerRow}>
            <h2>Inventario</h2>
            <button
                type="button"
                className="btn btn-ghost"
                onClick={abrirCategorias}
                style={{ minHeight: 38, padding: '0 14px', fontSize: '0.85rem' }}
            >🗂️ Categorias</button>
        </div>
    );
};
