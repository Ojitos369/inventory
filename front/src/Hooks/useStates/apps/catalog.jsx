export const catalog = props => {
    const { miAxios, u1, u2, general } = props;

    const listCategorias = (grupo_id) => {
        if (!grupo_id) return;
        miAxios.get('catalog/categorias', { params: { grupo_id } })
            .then(res => u2("catalog", "categorias", grupo_id, res.data.categorias || []));
    };

    const saveCategoria = (data, onOk) => {
        const method = data.id ? 'put' : 'post';
        miAxios[method]('catalog/categorias', data)
            .then(() => { listCategorias(data.grupo_id); onOk?.(); })
            .catch(err => general.notificacion({
                message: err?.response?.data?.detail || "Error", mode: "danger", title: "Error",
            }));
    };

    const removeCategoria = (grupo_id, id) => {
        miAxios.delete('catalog/categorias', { data: { grupo_id, id } })
            .then(() => listCategorias(grupo_id));
    };

    const listArticulos = (params) => {
        u2("loadings", "catalog", "articulos", true);
        miAxios.get('catalog/articulos', { params })
            .then(res => u2("catalog", "articulos", params.grupo_id, res.data.articulos || []))
            .finally(() => u2("loadings", "catalog", "articulos", false));
    };

    const getArticulo = (id) => {
        u2("loadings", "catalog", "detalle", true);
        return miAxios.get('catalog/articulos/detalle', { params: { id } })
            .then(res => {
                u1("catalog", "detalle", res.data);
                return res.data;
            })
            .finally(() => u2("loadings", "catalog", "detalle", false));
    };

    const saveArticulo = (data, onOk) => {
        const method = data.id ? 'put' : 'post';
        return miAxios[method]('catalog/articulos', data)
            .then(res => {
                general.notificacion({ message: "Articulo guardado", mode: "success", title: "Listo" });
                listArticulos({ grupo_id: data.grupo_id });
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

    const removeArticulo = (grupo_id, id) => {
        miAxios.delete('catalog/articulos', { data: { id } })
            .then(() => listArticulos({ grupo_id }));
    };

    const movimiento = (data, onOk) => {
        miAxios.post('catalog/movimientos', data)
            .then(res => {
                onOk?.(res.data);
                general.notificacion({ message: "Movimiento registrado", mode: "success", title: "Listo" });
            })
            .catch(err => general.notificacion({
                message: err?.response?.data?.detail || "Error", mode: "danger", title: "Error",
            }));
    };

    const suggest = (grupo_id, q, onResult) => {
        if (!q || q.length < 2) { onResult?.({ locales: [], ia: { sugerencias: [] } }); return; }
        miAxios.get('catalog/suggest', { params: { grupo_id, q } })
            .then(res => onResult?.(res.data))
            .catch(() => onResult?.({ locales: [], ia: { sugerencias: [] } }));
    };

    const listShopping = (params) => {
        u2('loadings', 'catalog', 'shopping', true);
        return miAxios.get('catalog/shopping', { params })
            .then(res => {
                u2('catalog', 'shopping', params.grupo_id, res.data.items || []);
                return res.data;
            })
            .catch(err => general.notificacion({
                message: err?.response?.data?.detail || 'Error', mode: 'danger', title: 'Error',
            }))
            .finally(() => u2('loadings', 'catalog', 'shopping', false));
    };

    return {
        listCategorias, saveCategoria, removeCategoria,
        listArticulos, getArticulo, saveArticulo, removeArticulo,
        movimiento, suggest, listShopping,
    };
};
