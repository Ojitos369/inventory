import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStates, createState } from '../../Hooks/useStates';
import style from './styles/index.module.scss';

export const datosFaltantes = (a) => {
    const f = [];
    if (!a.optimo || Number(a.optimo) <= 0) f.push('óptimo');
    if (!a.minimo || Number(a.minimo) <= 0) f.push('mínimo');
    if (!a.foto_url) f.push('foto');
    if (!a.categoria_id) f.push('categoría');
    if (!a.descripcion) f.push('descripción');
    return f;
};

export const localStates = () => {
    const { s, f } = useStates();
    const navigate = useNavigate();

    const grupoId = s.app?.grupoActual;
    const articulos = s.catalog?.articulos?.[grupoId] || [];
    const categorias = s.catalog?.categorias?.[grupoId] || [];
    const loading = !!s.loadings?.catalog?.articulos;

    const [q, setQ] = createState(['invUI', 'q'], '');
    const [cat, setCat] = createState(['invUI', 'cat'], null);
    const [bajos, setBajos] = createState(['invUI', 'bajos'], false);

    const refrescar = () => {
        if (!grupoId) return;
        const params = { grupo_id: grupoId };
        if (q) params.q = q;
        if (cat) params.categoria_id = cat;
        if (bajos) params.bajos = '1';
        f.catalog.articulos.listar(params);
    };

    const abrirMov = (articulo, tipo) => {
        f.u1('catalog', 'movArticulo', articulo);
        f.u1('catalog', 'movTipo', tipo);
        f.u2('modals', 'catalog', 'movModal', true);
    };

    const abrirNuevo = () => {
        f.u1('catalog', 'editArticulo', null);
        f.u2('modals', 'catalog', 'formModal', true);
    };

    const abrirEditar = (a) => {
        f.u1('catalog', 'editArticulo', a);
        f.u2('modals', 'catalog', 'formModal', true);
    };

    const abrirCategorias = () => f.u2('modals', 'catalog', 'catsManager', true);

    const cardClick = (a, e) => {
        if (e.target.closest('button, a, [role="menu"], select, input')) return;
        navigate(`/articulo/${a.id}`);
    };

    return {
        style, f, navigate,
        grupoId, articulos, categorias, loading,
        q, setQ, cat, setCat, bajos, setBajos,
        refrescar,
        abrirMov, abrirNuevo, abrirEditar, abrirCategorias, cardClick,
    };
};

export const localEffects = () => {
    const { f, grupoId, q, cat, bajos } = localStates();

    useEffect(() => {
        if (!grupoId) return;
        f.catalog.categorias.listar(grupoId);
        f.catalog.articulos.listar({ grupo_id: grupoId });
    }, [grupoId]);

    useEffect(() => {
        if (!grupoId) return;
        const t = setTimeout(() => {
            const params = { grupo_id: grupoId };
            if (q) params.q = q;
            if (cat) params.categoria_id = cat;
            if (bajos) params.bajos = '1';
            f.catalog.articulos.listar(params);
        }, 350);
        return () => clearTimeout(t);
    }, [q, cat, bajos]);
};
