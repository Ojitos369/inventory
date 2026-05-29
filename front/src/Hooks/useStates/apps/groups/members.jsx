export const members = props => {
    const { miAxios, u2, general } = props;

    const listar = (grupo_id) => {
        u2("loadings", "groups", "members", true);
        miAxios.get('groups/members', { params: { grupo_id } })
            .then(res => u2("groups", "miembros", grupo_id, res.data.miembros || []))
            .finally(() => u2("loadings", "groups", "members", false));
    };

    const agregar = (grupo_id, usuario_id, rol = 'member', onOk) => {
        miAxios.post('groups/members', { grupo_id, usuario_id, rol })
            .then(() => { listar(grupo_id); onOk?.(); })
            .catch(err => general.notificacion({
                message: err?.response?.data?.detail || "Error", mode: "danger", title: "Error",
            }));
    };

    const eliminar = (grupo_id, usuario_id) => {
        miAxios.delete('groups/members', { data: { grupo_id, usuario_id } })
            .then(() => listar(grupo_id));
    };

    return { listar, agregar, eliminar };
};
