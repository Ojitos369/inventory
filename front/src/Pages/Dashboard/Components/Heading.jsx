import { localStates } from '../localStates';

export const Heading = () => {
    const { style, grupoData } = localStates();
    return (
        <div className={style.heading}>
            <h2>{grupoData?.nombre || 'Dashboard'}</h2>
            <span className={style.meta}>Resumen del inventario</span>
        </div>
    );
};
