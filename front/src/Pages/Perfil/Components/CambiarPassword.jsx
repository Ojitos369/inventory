import { localStates } from '../localStates';

export const CambiarPassword = () => {
    const {
        style, actual, setActual, nueva, setNueva, nuevaConf, setNuevaConf, cambiarPasswd,
    } = localStates();
    return (
        <form className={style.section} onSubmit={cambiarPasswd}>
            <h3>Cambiar contrasena</h3>
            <div className={style.formGroup}>
                <label>Contrasena actual</label>
                <input type="password" value={actual} onChange={e => setActual(e.target.value)} required />
            </div>
            <div className={style.formGroup}>
                <label>Nueva</label>
                <input type="password" value={nueva} onChange={e => setNueva(e.target.value)} required />
            </div>
            <div className={style.formGroup}>
                <label>Confirmar nueva</label>
                <input type="password" value={nuevaConf} onChange={e => setNuevaConf(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary">Actualizar</button>
        </form>
    );
};
