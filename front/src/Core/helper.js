export const showDate = (date, showTime = true) => {
    if (!date) return '';
    date = date.toString();
    const sep = date.includes('T') ? date.split('T') : date.split(' ');
    const fecha = sep[0].split('-').reverse().join('/');
    if (!showTime) return fecha;
    const hora = sep.length > 1 ? sep[1].split('.')[0].slice(0, 5) : '';
    return hora ? `${fecha} ${hora}` : fecha;
};

export const showNumber = (value, decimals = 2) => {
    const v = Number(value || 0);
    if (Number.isInteger(v) && decimals > 0) return v.toLocaleString('es-MX');
    return v.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: decimals });
};

export const slug = (s) => (s || '').toString().toLowerCase().trim().replace(/\s+/g, '-');

export const debounce = (fn, ms = 300) => {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), ms);
    };
};

export const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

/**
 * Comprime una imagen reescalando al lado mas largo y exportando JPEG con calidad ajustable.
 *
 * Si el archivo ya es pequeno, lo regresa tal cual. Para PNG/WEBP/HEIC pesados (camara),
 * convierte a JPEG. Devuelve un objeto Blob/File con `name` derivado del original.
 *
 * Opciones por defecto: lado max 1920px, calidad 0.82, target 1.5 MB.
 */
export const compressImage = async (file, opts = {}) => {
    const {
        maxSide = 1920,
        quality = 0.82,
        targetBytes = 1.5 * 1024 * 1024,
        forceJpeg = true,
        skipUnder = 800 * 1024, // si el archivo ya pesa menos, no lo toques
    } = opts;
    if (!file || !(file instanceof Blob)) return file;
    if (!file.type?.startsWith('image/')) return file;
    if (file.size <= skipUnder && !forceJpeg) return file;

    // Cargar imagen
    const dataUrl = await fileToBase64(file);
    const img = await new Promise((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = dataUrl;
    });

    let { width, height } = img;
    if (Math.max(width, height) > maxSide) {
        const r = maxSide / Math.max(width, height);
        width = Math.round(width * r);
        height = Math.round(height * r);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    // Itera bajando calidad hasta cumplir target, minimo 0.5
    let q = quality;
    let blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', q));
    while (blob && blob.size > targetBytes && q > 0.5) {
        q -= 0.1;
        blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', q));
    }
    if (!blob) return file;
    const baseName = (file.name || 'image').replace(/\.[^.]+$/, '');
    return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
};

export const colorPorcentaje = (porc) => {
    if (porc == null) return 'var(--home-text-muted)';
    if (porc >= 100) return 'var(--home-mint)';
    if (porc >= 60) return 'var(--home-mint-3)';
    if (porc >= 30) return 'var(--home-warning)';
    return 'var(--home-danger)';
};

export const pages = [
    { name: 'Dashboard', menu_name: 'dashboard', to: '/', icon: '📊' },
    { name: 'Inventario', menu_name: 'inventario', to: '/inventario', icon: '📦' },
    { name: 'Lista', menu_name: 'lista', to: '/lista', icon: '🛒' },
    { name: 'Conteo foto', menu_name: 'conteo', to: '/conteo', icon: '📷' },
    { name: 'Perfil', menu_name: 'perfil', to: '/perfil', icon: '👤' },
];

export const adminPages = [
    { name: 'Usuarios', menu_name: 'admin_users', to: '/admin/usuarios', icon: '👥' },
    { name: 'Grupos', menu_name: 'admin_grupos', to: '/admin/grupos', icon: '🏷️' },
    { name: 'Categorias', menu_name: 'admin_categorias', to: '/admin/categorias', icon: '🗂️' },
    { name: 'Ajustes', menu_name: 'admin_ajustes', to: '/admin/ajustes', icon: '⚙️' },
];
