export const me = props => {
    const { miAxios, u1, general } = props;

    const obtener = () => {
        miAxios.get('users/me').then(res => {
            u1("usuario", "data", res.data.user);
            u1("usuario", "grupos", res.data.grupos);
        });
    };

    const actualizar = (data, onOk) => {
        miAxios.put('users/me', data)
            .then(() => {
                obtener();
                general.notificacion({ message: "Perfil actualizado", mode: "success", title: "Listo" });
                onOk?.();
            })
            .catch(err => general.notificacion({
                message: err?.response?.data?.detail || "Error", mode: "danger", title: "Error",
            }));
    };

    return { obtener, actualizar };
};
