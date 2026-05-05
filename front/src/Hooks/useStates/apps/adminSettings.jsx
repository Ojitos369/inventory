export const adminSettings = props => {
    const { miAxios, u1, general } = props;

    const fetch = (onOk) => {
        miAxios.get('admin/settings')
            .then(res => {
                u1('adminSettings', 'data', res.data);
                onOk?.(res.data);
            })
            .catch(err => general.notificacion({
                message: err?.response?.data?.detail || 'Error al cargar ajustes',
                mode: 'danger', title: 'Error',
            }));
    };

    const save = (payload, onOk) => {
        miAxios.put('admin/settings', payload)
            .then(() => {
                fetch();
                onOk?.();
                general.notificacion({ message: 'Ajustes guardados', mode: 'success', title: 'Listo' });
            })
            .catch(err => general.notificacion({
                message: err?.response?.data?.detail || 'Error al guardar',
                mode: 'danger', title: 'Error',
            }));
    };

    const test = (kind, onOk) => {
        return miAxios.post('admin/settings/test', { kind })
            .then(res => {
                onOk?.(res.data);
                if (res.data.ok) {
                    general.notificacion({
                        message: `Proveedor ${res.data.provider} OK · ${res.data.respuesta || '(vacio)'}`,
                        mode: 'success', title: `${kind} responde`,
                    });
                } else {
                    general.notificacion({
                        message: `Proveedor ${res.data.provider}: ${res.data.error || 'Error'}`,
                        mode: 'danger', title: `${kind} fallo`,
                    });
                }
                return res.data;
            })
            .catch(err => general.notificacion({
                message: err?.response?.data?.detail || 'Error', mode: 'danger', title: 'Error',
            }));
    };

    return { fetch, save, test };
};
