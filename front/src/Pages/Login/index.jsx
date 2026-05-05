import { useMemo } from 'react';
import { useStates } from '../../Hooks/useStates';
import style from './styles/index.module.scss';

const myStates = () => {
    const { s, f } = useStates();
    const usuario = useMemo(() => s.auth?.form?.usuario ?? '', [s.auth?.form?.usuario]);
    const passwd = useMemo(() => s.auth?.form?.passwd ?? '', [s.auth?.form?.passwd]);
    const loading = useMemo(() => !!s.loadings?.auth?.login, [s.loadings?.auth?.login]);

    const updateUsuario = e => f.u2('auth', 'form', 'usuario', e.target.value);
    const updatePasswd = e => f.u2('auth', 'form', 'passwd', e.target.value);

    const handleSubmit = e => {
        e?.preventDefault?.();
        f.auth.login(usuario.trim(), passwd);
    };
    return { usuario, passwd, loading, updateUsuario, updatePasswd, handleSubmit };
};

export const Login = () => {
    const { usuario, passwd, loading, updateUsuario, updatePasswd, handleSubmit } = myStates();
    return (
        <div className={style.loginPage}>
            <form className={style.card} onSubmit={handleSubmit} autoComplete="on">
                <div className={style.brand}>
                    <span className={style.dot}></span>
                    <h1>InvHome</h1>
                </div>
                <p className={style.subtitle}>Lleva el control de tu inventario casero. Inicia sesion para continuar.</p>

                <div className={style.formGroup}>
                    <label>Usuario</label>
                    <input
                        type="text"
                        value={usuario}
                        onChange={updateUsuario}
                        autoComplete="username"
                        placeholder="tu usuario"
                        required
                        autoFocus
                    />
                </div>
                <div className={style.formGroup}>
                    <label>Contrasena</label>
                    <input
                        type="password"
                        value={passwd}
                        onChange={updatePasswd}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className={`btn btn-primary ${style.submit}`}
                >
                    {loading ? 'Ingresando…' : 'Ingresar'}
                </button>
                <p className={style.helper}>Solo el administrador puede crear cuentas nuevas.</p>
            </form>
        </div>
    );
};
