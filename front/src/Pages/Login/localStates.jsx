import { useStates, createState } from '../../Hooks/useStates';
import style from './styles/index.module.scss';

export const localStates = () => {
    const { s, f } = useStates();

    const [usuario, setUsuario] = createState(['auth', 'form', 'usuario'], '');
    const [passwd, setPasswd] = createState(['auth', 'form', 'passwd'], '');
    const loading = !!s.loadings?.auth?.login;

    const updateUsuario = e => setUsuario(e.target.value);
    const updatePasswd = e => setPasswd(e.target.value);

    const handleSubmit = e => {
        e?.preventDefault?.();
        f.auth.login((usuario || '').trim(), passwd || '');
    };

    return { style, usuario, passwd, loading, updateUsuario, updatePasswd, handleSubmit };
};

export const localEffects = () => { /* sin efectos */ };
