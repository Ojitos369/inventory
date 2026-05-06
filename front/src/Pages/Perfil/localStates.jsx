import { useEffect } from 'react';
import { useStates, createState } from '../../Hooks/useStates';
import style from './styles/index.module.scss';

export const localStates = () => {
    const { s, f } = useStates();
    const u = s.usuario?.data || {};
    const grupos = s.usuario?.grupos || [];

    const [nombre, setNombre] = createState(['perfilUI', 'nombre'], '');
    const [email, setEmail] = createState(['perfilUI', 'email'], '');
    const [actual, setActual] = createState(['perfilUI', 'actual'], '');
    const [nueva, setNueva] = createState(['perfilUI', 'nueva'], '');
    const [nuevaConf, setNuevaConf] = createState(['perfilUI', 'nuevaConf'], '');

    const guardarPerfil = (e) => {
        e?.preventDefault?.();
        f.users.updateMe({ nombre, email });
    };

    const cambiarPasswd = (e) => {
        e?.preventDefault?.();
        if (nueva !== nuevaConf) {
            f.general.notificacion({ message: 'Las contrasenas no coinciden', mode: 'danger', title: 'Error' });
            return;
        }
        f.auth.changePassword(actual, nueva, () => {
            setActual(''); setNueva(''); setNuevaConf('');
        });
    };

    return {
        style, f,
        u, grupos,
        nombre, setNombre, email, setEmail,
        actual, setActual, nueva, setNueva, nuevaConf, setNuevaConf,
        guardarPerfil, cambiarPasswd,
    };
};

export const localEffects = () => {
    const { u, setNombre, setEmail } = localStates();
    useEffect(() => {
        setNombre(u.nombre || '');
        setEmail(u.email || '');
    }, [u.id]);
};
