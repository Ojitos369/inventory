import { localStates } from '../localStates';

export const EliminarBtn = () => {
    const { eliminar } = localStates();
    return (
        <button type="button" className="btn btn-danger" onClick={eliminar}>Eliminar articulo</button>
    );
};
