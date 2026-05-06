import { localStates } from '../localStates';

export const TopBar = () => {
    const { style, navigate, editar } = localStates();
    return (
        <div className={style.topbar}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>← Volver</button>
            <button type="button" className="btn btn-primary" onClick={editar}>✏️ Editar</button>
        </div>
    );
};
