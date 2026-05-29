export const crud = props => {
    const { miAxios, u1, u2, general } = props;

    const listar = () => {
        u2("loadings", "groups", "list", true);
        miAxios.get('groups')
            .then(res => u1("groups", "lista", res.data.grupos || []))
            .catch(() => {})
            .finally(() => u2("loadings", "groups", "list", false));
    };

    const guardar = (data, onOk) => {
        const method = data.id ? 'put' : 'post';
        miAxios[method]('groups', data)
            .then(() => {
                general.notificacion({ message: "Grupo guardado", mode: "success", title: "Listo" });
                listar();
                onOk?.();
            })
            .catch(err => general.notificacion({
                message: err?.response?.data?.detail || "Error", mode: "danger", title: "Error",
            }));
    };

    const eliminar = (id, onOk) => {
        miAxios.delete('groups', { data: { id } })
            .then(() => { listar(); onOk?.(); })
            .catch(err => general.notificacion({
                message: err?.response?.data?.detail || "Error", mode: "danger", title: "Error",
            }));
    };

    return { listar, guardar, eliminar };
};
