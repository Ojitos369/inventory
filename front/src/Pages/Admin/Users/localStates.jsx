import { useEffect } from 'react';
import { useStates } from '../../../Hooks/useStates';
import style from '../styles.module.scss';

export const ROLES = ['admin', 'member', 'viewer'];

export const localStates = () => {
    const { s, f } = useStates();
    const users = s.admin?.users || [];

    const abrirNuevo = () => {
        f.u1('admin', 'editUser', null);
        f.u2('modals', 'admin', 'userForm', true);
    };
    const abrirEditar = (u) => {
        f.u1('admin', 'editUser', u);
        f.u2('modals', 'admin', 'userForm', true);
    };
    const abrirReset = (u) => {
        f.u1('admin', 'resetPwdUser', u);
        f.u2('modals', 'admin', 'userReset', true);
    };
    const eliminar = (u) => {
        if (!confirm(`Desactivar usuario ${u.username}?`)) return;
        f.users.remove(u.id);
    };

    return { style, f, users, abrirNuevo, abrirEditar, abrirReset, eliminar };
};

export const localEffects = () => {
    const { f } = localStates();
    useEffect(() => { f.users.list(); f.groups.list(); }, []);
};
