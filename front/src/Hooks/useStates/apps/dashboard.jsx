export const dashboard = props => {
    const { miAxios, u1, u2 } = props;

    const general = (grupo_id) => {
        if (!grupo_id) return;
        u2("loadings", "dashboard", "general", true);
        miAxios.get('dashboard/general', { params: { grupo_id } })
            .then(res => u1("dashboard", "data", res.data))
            .finally(() => u2("loadings", "dashboard", "general", false));
    };

    return { general };
};
