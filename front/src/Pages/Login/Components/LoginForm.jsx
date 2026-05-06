import { localStates } from '../localStates';
import { Brand } from './Brand';

export const LoginForm = () => {
    const { style, usuario, passwd, loading, updateUsuario, updatePasswd, handleSubmit } = localStates();

    return (
        <form className={style.card} onSubmit={handleSubmit} autoComplete="on">
            <Brand />

            <div className={style.formGroup}>
                <label>Usuario</label>
                <input
                    type="text"
                    value={usuario}
                    onChange={updateUsuario}
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    inputMode="email"
                    placeholder="tu usuario"
                    required
                    autoFocus
                    style={{ textTransform: 'lowercase' }}
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
    );
};
