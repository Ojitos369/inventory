export const app = props => {
    const { miAxios, u1 } = props;

    const getModes = () => {
        miAxios.get('base/get_modes')
            .then(res => u1("app", "modes", res.data))
            .catch(() => {});
    };

    const ping = () => miAxios.get('base/hh').then(r => r.data);

    return { getModes, ping };
};
