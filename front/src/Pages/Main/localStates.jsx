import { useEffect, useMemo } from 'react';
import { useStates } from '../../Hooks/useStates';
import style from './style/index.module.scss';

export const localStates = () => {
    const { s, lf } = useStates();
    const grupoActual = useMemo(() => s.app?.grupoActual, [s.app?.grupoActual]);
    const grupos = useMemo(() => s.usuario?.grupos || [], [s.usuario?.grupos]);
    return { style, grupoActual, grupos, lf };
};

export const useInitGrupo = () => {
    const { s, f, lf } = useStates();
    const grupos = s.usuario?.grupos || [];
    const grupoActual = s.app?.grupoActual;

    useEffect(() => {
        if (!grupos.length) return;
        const guardado = localStorage.getItem('invhometka')
            ? JSON.parse(localStorage.getItem('invhometka'))?.grupoActual
            : null;
        const objetivo = grupos.find(g => g.id === guardado) || grupos[0];
        if (!grupoActual && objetivo) {
            f.u1('app', 'grupoActual', objetivo.id);
            f.u1('app', 'grupoActualData', objetivo);
            lf.u0('grupoActual', objetivo.id);
        } else if (grupoActual) {
            const data = grupos.find(g => g.id === grupoActual);
            if (data) f.u1('app', 'grupoActualData', data);
        }
    }, [grupos.length, grupoActual]);
};
