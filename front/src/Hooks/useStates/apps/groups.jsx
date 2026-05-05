export const groups = props => {
    const { miAxios, u1, u2, general } = props;

    const list = () => {
        u2("loadings", "groups", "list", true);
        miAxios.get('groups')
            .then(res => u1("groups", "lista", res.data.grupos || []))
            .catch(() => {})
            .finally(() => u2("loadings", "groups", "list", false));
    };

    const save = (data, onOk) => {
        const method = data.id ? 'put' : 'post';
        miAxios[method]('groups', data)
            .then(() => {
                general.notificacion({ message: "Grupo guardado", mode: "success", title: "Listo" });
                list();
                onOk?.();
            })
            .catch(err => general.notificacion({
                message: err?.response?.data?.detail || "Error", mode: "danger", title: "Error",
            }));
    };

    const remove = (id, onOk) => {
        miAxios.delete('groups', { data: { id } })
            .then(() => { list(); onOk?.(); })
            .catch(err => general.notificacion({
                message: err?.response?.data?.detail || "Error", mode: "danger", title: "Error",
            }));
    };

    const members = (grupo_id) => {
        u2("loadings", "groups", "members", true);
        miAxios.get('groups/members', { params: { grupo_id } })
            .then(res => u2("groups", "miembros", grupo_id, res.data.miembros || []))
            .finally(() => u2("loadings", "groups", "members", false));
    };

    const addMember = (grupo_id, usuario_id, rol = 'member', onOk) => {
        miAxios.post('groups/members', { grupo_id, usuario_id, rol })
            .then(() => { members(grupo_id); onOk?.(); })
            .catch(err => general.notificacion({
                message: err?.response?.data?.detail || "Error", mode: "danger", title: "Error",
            }));
    };

    const removeMember = (grupo_id, usuario_id) => {
        miAxios.delete('groups/members', { data: { grupo_id, usuario_id } })
            .then(() => members(grupo_id));
    };

    return { list, save, remove, members, addMember, removeMember };
};
