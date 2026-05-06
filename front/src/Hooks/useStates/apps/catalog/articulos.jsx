export const articulos = props => {
    const { miAxios, u1, u2, general } = props;

    const listar = (params) => {
        u2("loadings", "catalog", "articulos", true);
        miAxios.get('catalog/articulos', { params })
            .then(res => u2("catalog", "articulos", params.grupo_id, res.data.articulos || []))
            .finally(() => u2("loadings", "catalog", "articulos", false));
    };

    const obtener = (id) => {
        u2("loadings", "catalog", "detalle", true);
        return miAxios.get('catalog/articulos/detalle', { params: { id } })
            .then(res => {
                u1("catalog", "detalle", res.data);
                return res.data;
            })
            .finally(() => u2("loadings", "catalog", "detalle", false));
    };

    const guardar = (data, onOk) => {
        const method = data.id ? 'put' : 'post';
        return miAxios[method]('catalog/articulos', data)
            .then(res => {
                general.notificacion({ message: "Articulo guardado", mode: "success", title: "Listo" });
                listar({ grupo_id: data.grupo_id });
                onOk?.(res.data);
                return res.data;
            })
            .catch(err => {
                general.notificacion({
                    message: err?.response?.data?.detail || "Error", mode: "danger", title: "Error",
                });
                throw err;
            });
    };

    const eliminar = (grupo_id, id) => {
        miAxios.delete('catalog/articulos', { data: { id } })
            .then(() => listar({ grupo_id }));
    };

    return { listar, obtener, guardar, eliminar };
};
