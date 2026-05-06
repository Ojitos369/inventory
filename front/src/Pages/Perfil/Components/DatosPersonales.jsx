import { localStates } from '../localStates';

export const DatosPersonales = () => {
    const { style, u, nombre, setNombre, email, setEmail, guardarPerfil } = localStates();
    return (
        <form className={style.section} onSubmit={guardarPerfil}>
            <h3>Datos personales</h3>
            <div className={style.formGroup}>
                <label>Usuario</label>
                <input value={u.username || ''} disabled />
            </div>
            <div className={style.formGroup}>
                <label>Nombre</label>
                <input value={nombre} onChange={e => setNombre(e.target.value)} />
            </div>
            <div className={style.formGroup}>
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary">Guardar</button>
        </form>
    );
};
