import { cacheGet, cacheHas, cacheSet, stableKey, sha256Hex } from '../../../Core/cache';

const POLL_INTERVAL_MS = 2500;
const POLL_MAX_MS = 5 * 60 * 1000; // 5 min

export const vision = props => {
    const { miAxios, u1, u2, general } = props;

    /**
     * Lanza analyze (responde inmediato con captura_id+estado=processing) y luego
     * hace polling a /status hasta done|error. onOk recibe la captura completa con items.
     */
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
        try {
            const res = await miAxios.post('vision/analyze', { grupo_id, image_b64, hint });
            const initial = res.data;
            // Captura placeholder visible mientras llega el resultado
            u1("vision", "captura", initial);
            if (initial.estado === 'done') {
                cacheSet(key, initial);
                onOk?.(initial);
                u2("loadings", "vision", "analyze", false);
                return;
            }
            // Polling
            const captura_id = initial.captura_id;
            const t0 = Date.now();
            const tick = async () => {
                if (Date.now() - t0 > POLL_MAX_MS) {
                    u2("loadings", "vision", "analyze", false);
                    general.notificacion({
                        message: "El analisis esta tardando mas de lo esperado. Reintenta en un momento.",
                        mode: "danger", title: "Timeout",
                    });
                    return;
                }
                try {
                    const r = await miAxios.get('vision/status', { params: { captura_id } });
                    const cap = r.data;
                    u1("vision", "captura", cap);
                    if (cap.estado === 'done') {
                        cacheSet(key, cap);
                        onOk?.(cap);
                        u2("loadings", "vision", "analyze", false);
                        return;
                    }
                    if (cap.estado === 'error') {
                        u2("loadings", "vision", "analyze", false);
                        general.notificacion({
                            message: cap.error || "Error analizando imagen",
                            mode: "danger", title: "Error",
                        });
                        return;
                    }
                    setTimeout(tick, POLL_INTERVAL_MS);
                } catch (err) {
                    // 5xx transitorio: reintenta unas pocas veces; otros: aborta
                    setTimeout(tick, POLL_INTERVAL_MS);
                }
            };
            setTimeout(tick, POLL_INTERVAL_MS);
        } catch (err) {
            u2("loadings", "vision", "analyze", false);
            general.notificacion({
                message: err?.response?.data?.detail || "Error analizando imagen",
                mode: "danger", title: "Error",
            });
        }
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
