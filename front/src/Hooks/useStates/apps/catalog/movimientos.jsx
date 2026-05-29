export const movimientos = props => {
    const { miAxios, general } = props;

    const crear = (data, onOk) => {
        miAxios.post('catalog/movimientos', data)
            .then(res => {
                onOk?.(res.data);
                general.notificacion({ message: "Movimiento registrado", mode: "success", title: "Listo" });
            })
            .catch(err => general.notificacion({
                message: err?.response?.data?.detail || "Error", mode: "danger", title: "Error",
            }));
    };

    return { crear };
};
