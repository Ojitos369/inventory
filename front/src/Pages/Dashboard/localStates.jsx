import { useEffect } from 'react';
import { useStates } from '../../Hooks/useStates';
import style from './styles/index.module.scss';

export const localStates = () => {
    const { s, f } = useStates();
    const grupoId = s.app?.grupoActual;
    const grupoData = s.app?.grupoActualData;
    const data = s.dashboard?.data;
    const loading = !!s.loadings?.dashboard?.general;

    const kpis = data?.kpis || {};
    const porCat = data?.por_categoria || [];
    const bajos = data?.bajos || [];
    const movs = data?.movimientos_recientes || [];
    const totalCat = porCat.reduce((acc, c) => acc + Number(c.articulos || 0), 0) || 1;

    return {
        style, f,
        grupoId, grupoData, data, loading,
        kpis, porCat, bajos, movs, totalCat,
    };
};

export const localEffects = () => {
    const { f, grupoId } = localStates();
    useEffect(() => { if (grupoId) f.dashboard.general(grupoId); }, [grupoId]);
};
