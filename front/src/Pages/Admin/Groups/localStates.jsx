import { useEffect } from 'react';
import { useStates } from '../../../Hooks/useStates';
import style from '../styles.module.scss';

export const localStates = () => {
    const { s, f } = useStates();
    const grupos = s.groups?.lista || [];

    const abrirNuevo = () => {
        f.u1('admin', 'editGroup', null);
        f.u2('modals', 'admin', 'groupForm', true);
    };
    const abrirEditar = (g) => {
        f.u1('admin', 'editGroup', g);
        f.u2('modals', 'admin', 'groupForm', true);
    };
    const abrirMiembros = (g) => {
        f.u1('admin', 'editGroupMembers', g);
        f.u2('modals', 'admin', 'groupMembers', true);
    };
    const eliminar = (g) => {
        if (!confirm(`Desactivar grupo ${g.nombre}?`)) return;
        f.groups.crud.eliminar(g.id);
    };

    return { style, f, grupos, abrirNuevo, abrirEditar, abrirMiembros, eliminar };
};

export const localEffects = () => {
    const { f } = localStates();
    useEffect(() => { f.groups.crud.listar(); }, []);
};
