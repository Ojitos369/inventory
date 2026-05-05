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

    const testKimi = (onOk) => {
        return miAxios.post('admin/settings/test_kimi')
            .then(res => {
                onOk?.(res.data);
                if (res.data.ok) {
                    general.notificacion({
                        message: `Respuesta: ${res.data.respuesta || '(vacio)'}`,
                        mode: 'success', title: 'Kimi responde',
                    });
                } else {
                    general.notificacion({
                        message: res.data.error || 'Error',
                        mode: 'danger', title: 'Kimi fallo',
                    });
                }
                return res.data;
            })
            .catch(err => general.notificacion({
                message: err?.response?.data?.detail || 'Error', mode: 'danger', title: 'Error',
            }));
    };

    return { fetch, save, testKimi };
};
