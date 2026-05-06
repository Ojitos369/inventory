export const crud = props => {
    const { miAxios, u1, u2, general } = props;

    const listar = () => {
        u2("loadings", "users", "list", true);
        miAxios.get('users')
            .then(res => u1("admin", "users", res.data.users || []))
            .finally(() => u2("loadings", "users", "list", false));
    };

    const crear = (data, onOk) => {
        miAxios.post('users', data)
            .then(() => {
                listar();
                onOk?.();
                general.notificacion({ message: "Usuario creado", mode: "success", title: "Listo" });
            })
            .catch(err => general.notificacion({
                message: err?.response?.data?.detail || "Error", mode: "danger", title: "Error",
            }));
    };

    const actualizar = (data, onOk) => {
        miAxios.put('users', data)
            .then(() => { listar(); onOk?.(); })
            .catch(err => general.notificacion({
                message: err?.response?.data?.detail || "Error", mode: "danger", title: "Error",
            }));
    };

    const resetPassword = (id, nueva, onOk) => {
        miAxios.post('users/reset_password', { id, nueva })
            .then(() => {
                onOk?.();
                general.notificacion({ message: "Contrasena reiniciada", mode: "success", title: "Listo" });
            })
            .catch(err => general.notificacion({
                message: err?.response?.data?.detail || "Error", mode: "danger", title: "Error",
            }));
    };

    const eliminar = (id, onOk) => {
        miAxios.delete('users', { data: { id } })
            .then(() => { listar(); onOk?.(); });
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

    return { listar, crear, actualizar, resetPassword, eliminar, getGrupos, setGrupos };
};
