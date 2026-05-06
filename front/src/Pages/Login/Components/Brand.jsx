import { localStates } from '../localStates';

export const Brand = () => {
    const { style } = localStates();
    return (
        <>
            <div className={style.brand}>
                <span className={style.dot}></span>
                <h1>InvHome</h1>
            </div>
            <p className={style.subtitle}>Lleva el control de tu inventario casero. Inicia sesion para continuar.</p>
        </>
    );
};
