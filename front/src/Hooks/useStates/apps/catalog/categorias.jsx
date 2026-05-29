export const categorias = props => {
    const { miAxios, u2, general } = props;

    const listar = (grupo_id) => {
        if (!grupo_id) return;
        miAxios.get('catalog/categorias', { params: { grupo_id } })
            .then(res => u2("catalog", "categorias", grupo_id, res.data.categorias || []));
    };

    const guardar = (data, onOk) => {
        const method = data.id ? 'put' : 'post';
        miAxios[method]('catalog/categorias', data)
            .then(() => { listar(data.grupo_id); onOk?.(); })
            .catch(err => general.notificacion({
                message: err?.response?.data?.detail || "Error", mode: "danger", title: "Error",
            }));
    };

    const eliminar = (grupo_id, id) => {
        miAxios.delete('catalog/categorias', { data: { grupo_id, id } })
            .then(() => listar(grupo_id));
    };

    return { listar, guardar, eliminar };
};
