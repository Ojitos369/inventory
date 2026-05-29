import { cacheGet, cacheHas, cacheSet, stableKey } from '../../../../Core/cache';

export const ia = props => {
    const { miAxios } = props;

    const sugerir = (grupo_id, q, onResult) => {
        if (!q || q.length < 2) { onResult?.({ locales: [], ia: { sugerencias: [] } }); return; }
        const key = 'catalog:suggest:' + stableKey({ grupo_id, q: q.trim().toLowerCase() });
        if (cacheHas(key)) { onResult?.(cacheGet(key)); return; }
        miAxios.get('catalog/suggest', { params: { grupo_id, q } })
            .then(res => { cacheSet(key, res.data); onResult?.(res.data); })
            .catch(() => onResult?.({ locales: [], ia: { sugerencias: [] } }));
    };

    return { sugerir };
};
