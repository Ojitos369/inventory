export const shopping = props => {
    const { miAxios, u2, general } = props;

    const listar = (params) => {
        u2('loadings', 'catalog', 'shopping', true);
        return miAxios.get('catalog/shopping', { params })
            .then(res => {
                u2('catalog', 'shopping', params.grupo_id, res.data.items || []);
                return res.data;
            })
            .catch(err => general.notificacion({
                message: err?.response?.data?.detail || 'Error', mode: 'danger', title: 'Error',
            }))
            .finally(() => u2('loadings', 'catalog', 'shopping', false));
    };

    return { listar };
};
