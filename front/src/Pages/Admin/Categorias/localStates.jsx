import { useEffect } from 'react';
import { useStates } from '../../../Hooks/useStates';
import style from '../styles.module.scss';

export const localStates = () => {
    const { s, f } = useStates();
    const grupoId = s.app?.grupoActual;
    const categorias = s.catalog?.categorias?.[grupoId] || [];

    const abrirNuevo = () => {
        f.u1('admin', 'editCat', null);
        f.u2('modals', 'admin', 'catForm', true);
    };
    const abrirEditar = (c) => {
        f.u1('admin', 'editCat', c);
        f.u2('modals', 'admin', 'catForm', true);
    };
    const eliminar = (c) => {
        if (!confirm(`Eliminar categoria ${c.nombre}? (los articulos quedaran sin categoria)`)) return;
        f.catalog.categorias.eliminar(grupoId, c.id);
    };

    return { style, f, grupoId, categorias, abrirNuevo, abrirEditar, eliminar };
};

export const localEffects = () => {
    const { f, grupoId } = localStates();
    useEffect(() => { if (grupoId) f.catalog.categorias.listar(grupoId); }, [grupoId]);
};
