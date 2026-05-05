export const users = props => {
    const { miAxios, u1, u2, general } = props;

    const me = () => {
        miAxios.get('users/me').then(res => {
            u1("usuario", "data", res.data.user);
            u1("usuario", "grupos", res.data.grupos);
        });
    };

    const updateMe = (data, onOk) => {
        miAxios.put('users/me', data)
            .then(() => {
                me();
                general.notificacion({ message: "Perfil actualizado", mode: "success", title: "Listo" });
                onOk?.();
            })
            .catch(err => general.notificacion({
                message: err?.response?.data?.detail || "Error", mode: "danger", title: "Error",
            }));
    };

    const list = () => {
        u2("loadings", "users", "list", true);
        miAxios.get('users')
            .then(res => u1("admin", "users", res.data.users || []))
            .finally(() => u2("loadings", "users", "list", false));
    };

    const create = (data, onOk) => {
        miAxios.post('users', data)
            .then(() => { list(); onOk?.(); general.notificacion({ message: "Usuario creado", mode: "success", title: "Listo" }); })
            .catch(err => general.notificacion({
                message: err?.response?.data?.detail || "Error", mode: "danger", title: "Error",
            }));
    };

    const update = (data, onOk) => {
        miAxios.put('users', data)
            .then(() => { list(); onOk?.(); })
            .catch(err => general.notificacion({
                message: err?.response?.data?.detail || "Error", mode: "danger", title: "Error",
            }));
    };

    const resetPassword = (id, nueva, onOk) => {
        miAxios.post('users/reset_password', { id, nueva })
            .then(() => { onOk?.(); general.notificacion({ message: "Contrasena reiniciada", mode: "success", title: "Listo" }); })
            .catch(err => general.notificacion({
                message: err?.response?.data?.detail || "Error", mode: "danger", title: "Error",
            }));
    };

    const remove = (id, onOk) => {
        miAxios.delete('users', { data: { id } })
            .then(() => { list(); onOk?.(); });
    };

    const getGrupos = (id, onOk) => {
        miAxios.get('users/grupos', { params: { id } })
            .then(res => {
                u2('admin', 'userGrupos', id, res.data.grupos || []);
                onOk?.(res.data.grupos || []);
            })
            .catch(err => general.notificacion({
                message: err?.response?.data?.detail || "Error", mode: "danger", title: "Error",
            }));
    };

    const setGrupos = (id, grupos, onOk) => {
        miAxios.put('users/grupos', { id, grupos })
            .then(() => {
                onOk?.();
                general.notificacion({ message: "Grupos actualizados", mode: "success", title: "Listo" });
            })
            .catch(err => general.notificacion({
                message: err?.response?.data?.detail || "Error", mode: "danger", title: "Error",
            }));
    };

    return { me, updateMe, list, create, update, resetPassword, remove, getGrupos, setGrupos };
};
