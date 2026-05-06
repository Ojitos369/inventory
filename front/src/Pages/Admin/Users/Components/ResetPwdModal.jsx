import { useEffect } from 'react';
import { useStates, createState } from '../../../../Hooks/useStates';
import { GeneralModal } from '../../../../Components/Modals/GeneralModal';

const ResetPwdContent = ({ close }) => {
    const { s, f } = useStates();
    const target = s.admin?.resetPwdUser;
    const [nueva, setNueva] = createState(['admin', 'userResetForm', 'nueva'], '');

    useEffect(() => { setNueva(''); }, [target?.id]);

    const submit = (e) => {
        e?.preventDefault?.();
        f.users.resetPassword(target.id, nueva, () => close?.());
    };
    if (!target) return null;
    return (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p>Reiniciar contrasena de <strong>{target.username}</strong></p>
            <input
                type="password"
                placeholder="Nueva contrasena"
                value={nueva}
                onChange={e => setNueva(e.target.value)}
                required
            />
            <button type="submit" className="btn btn-primary">Reiniciar</button>
        </form>
    );
};

export const ResetPwdModal = () => (
    <GeneralModal lvl1="admin" lvl2="userReset" Component={ResetPwdContent} title="Reiniciar contrasena" size="sm" />
);
