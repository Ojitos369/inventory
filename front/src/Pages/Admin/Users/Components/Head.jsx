import { localStates } from '../localStates';

export const Head = () => {
    const { style, abrirNuevo } = localStates();
    return (
        <div className={style.head}>
            <h2>Usuarios</h2>
            <button type="button" className="btn btn-primary" onClick={abrirNuevo}>+ Nuevo</button>
        </div>
    );
};
