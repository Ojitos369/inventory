export const general = props => {
    const { u1, u2, miAxios } = props;

    const notificacion = ({ message, title, mode = 'info', html, messages }) => {
        u1("general", "notification", { message, title, mode, html, messages });
        u2("modals", "general", "notification", true);
    };

    const cerrarNotificacion = () => {
        u2("modals", "general", "notification", false);
    };

    /**
     * Sube imagen a /api/uploads/image. file: File. folder: 'articulos'|'categorias'|'avatars'|'misc'.
     * Devuelve {url, path} en caso exito.
     */
    const uploadImage = async (file, folder = 'articulos') => {
        if (!file) throw new Error('Archivo requerido');
        const fd = new FormData();
        fd.append('file', file);
        fd.append('folder', folder);
        const res = await miAxios.post('uploads/image', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    };

    /**
     * Resuelve un path de media (`/media/...` o `uploads/...`) contra el host del backend.
     * Acepta tambien URLs absolutas (las regresa tal cual).
     */
    const mediaUrl = (path) => {
        if (!path) return '';
        if (/^https?:\/\//i.test(path)) return path;
        const base = miAxios.defaults.baseURL || '';
        const root = base.replace(/\/api\/?$/, '');
        const clean = path.startsWith('/') ? path : `/${path.startsWith('media/') ? '' : 'media/'}${path}`;
        return `${root}${clean}`;
    };

    return { notificacion, cerrarNotificacion, uploadImage, mediaUrl };
};
