import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStates } from '../../Hooks/useStates';
import style from './styles/index.module.scss';

export const localStates = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { s, f } = useStates();

    const data = s.catalog?.detalle;
    const articulo = data?.articulo;
    const movimientos = data?.movimientos || [];

    const abrirMov = (tipo) => {
        if (!articulo) return;
        f.u1('catalog', 'movArticulo', articulo);
        f.u1('catalog', 'movTipo', tipo);
        f.u2('modals', 'catalog', 'movModal', true);
    };

    const editar = () => {
        if (!articulo) return;
        f.u1('catalog', 'editArticulo', articulo);
        f.u2('modals', 'catalog', 'formModal', true);
    };

    const eliminar = () => {
        if (!articulo) return;
        if (!confirm(`Eliminar "${articulo.nombre}"?`)) return;
        f.catalog.articulos.eliminar(articulo.grupo_id, articulo.id);
        navigate('/inventario');
    };

    return {
        style, f, navigate, id,
        data, articulo, movimientos,
        abrirMov, editar, eliminar,
    };
};

export const localEffects = () => {
    const { s, f } = useStates();
    const { id } = useParams();

    useEffect(() => {
        if (id) f.catalog.articulos.obtener(id);
        return () => f.u1('catalog', 'detalle', null);
    }, [id]);

    const formOpen = !!s.modals?.catalog?.formModal;
    useEffect(() => {
        if (!formOpen && id) f.catalog.articulos.obtener(id);
    }, [formOpen]);
};
