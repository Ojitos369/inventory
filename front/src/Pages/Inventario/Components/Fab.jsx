import { localStates } from '../localStates';

export const Fab = () => {
    const { style, abrirNuevo } = localStates();
    return (
        <button type="button" className={style.fab} onClick={abrirNuevo} aria-label="Nuevo articulo">+</button>
    );
};
