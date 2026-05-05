import { useEffect, useMemo, useState } from 'react';
import { useStates } from '../../Hooks/useStates';
import { debounce } from '../../Core/helper';
import style from './styles/index.module.scss';

export const useLocalStates = () => {
    const { s, f } = useStates();
    const grupoId = useMemo(() => s.app?.grupoActual, [s.app?.grupoActual]);
    const articulos = useMemo(() => s.catalog?.articulos?.[grupoId] || [], [s.catalog?.articulos, grupoId]);
    const categorias = useMemo(() => s.catalog?.categorias?.[grupoId] || [], [s.catalog?.categorias, grupoId]);
    const loading = !!s.loadings?.catalog?.articulos;

    const [q, setQ] = useState('');
    const [cat, setCat] = useState(null);
    const [bajos, setBajos] = useState(false);

    useEffect(() => {
        if (!grupoId) return;
        f.catalog.listCategorias(grupoId);
        f.catalog.listArticulos({ grupo_id: grupoId });
    }, [grupoId]);

    const refrescar = () => {
        if (!grupoId) return;
        const params = { grupo_id: grupoId };
        if (q) params.q = q;
        if (cat) params.categoria_id = cat;
        if (bajos) params.bajos = '1';
        f.catalog.listArticulos(params);
    };

    useEffect(() => { refrescar(); }, [cat, bajos]);
    useEffect(() => {
        const fn = debounce(refrescar, 350);
        fn();
    }, [q]);

    return {
        style, grupoId, articulos, categorias, loading,
        q, setQ, cat, setCat, bajos, setBajos, refrescar, f, s,
    };
};
