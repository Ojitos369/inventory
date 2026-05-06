import { cacheGet, cacheHas, cacheSet, stableKey, sha256Hex } from '../../../Core/cache';

export const vision = props => {
    const { miAxios, u1, u2, general } = props;

    const analyze = async (grupo_id, image_b64, hint, onOk) => {
        const imgHash = await sha256Hex(image_b64 || '');
        const key = 'vision:analyze:' + stableKey({ grupo_id, hint: hint || '', imgHash });

        if (cacheHas(key)) {
            const cached = cacheGet(key);
            u1("vision", "captura", cached);
            onOk?.(cached);
            return;
        }

        u2("loadings", "vision", "analyze", true);
        miAxios.post('vision/analyze', { grupo_id, image_b64, hint })
            .then(res => {
                cacheSet(key, res.data);
                u1("vision", "captura", res.data);
                onOk?.(res.data);
            })
            .catch(err => general.notificacion({
                message: err?.response?.data?.detail || "Error analizando imagen",
                mode: "danger", title: "Error",
            }))
            .finally(() => u2("loadings", "vision", "analyze", false));
    };

    const aplicar = (captura_id, modo, items, onOk) => {
        u2("loadings", "vision", "aplicar", true);
        miAxios.post('vision/aplicar', { captura_id, modo, items })
            .then(res => {
                general.notificacion({
                    message: `Creados: ${res.data.resumen.creados}, Actualizados: ${res.data.resumen.actualizados}`,
                    mode: "success", title: "Captura aplicada",
                });
                u1("vision", "captura", null);
                onOk?.(res.data);
            })
            .catch(err => general.notificacion({
                message: err?.response?.data?.detail || "Error", mode: "danger", title: "Error",
            }))
            .finally(() => u2("loadings", "vision", "aplicar", false));
    };

    const clear = () => u1("vision", "captura", null);

    return { analyze, aplicar, clear };
};
