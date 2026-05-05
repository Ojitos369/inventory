export const vision = props => {
    const { miAxios, u1, u2, general } = props;

    const analyze = (grupo_id, image_b64, hint, onOk) => {
        u2("loadings", "vision", "analyze", true);
        miAxios.post('vision/analyze', { grupo_id, image_b64, hint })
            .then(res => {
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
