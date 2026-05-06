import { localStates } from '../localStates';

export const ActionsBar = () => {
    const { style, items, loadingApply, aplicar, cancelar } = localStates();

    return (
        <div className={style.actions}>
            <button type="button" className="btn btn-ghost" onClick={cancelar}>Descartar</button>
            <button
                type="button"
                className="btn btn-primary"
                onClick={aplicar}
                disabled={loadingApply || items.length === 0}
                style={{ flex: 1 }}
            >
                {loadingApply ? 'Aplicando…' : 'Aplicar al inventario'}
            </button>
        </div>
    );
};
