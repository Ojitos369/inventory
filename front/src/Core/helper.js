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
    { name: 'Conteo foto', menu_name: 'conteo', to: '/conteo', icon: '📷' },
    { name: 'Perfil', menu_name: 'perfil', to: '/perfil', icon: '👤' },
];

export const adminPages = [
    { name: 'Usuarios', menu_name: 'admin_users', to: '/admin/usuarios', icon: '👥' },
    { name: 'Grupos', menu_name: 'admin_grupos', to: '/admin/grupos', icon: '🏷️' },
    { name: 'Categorias', menu_name: 'admin_categorias', to: '/admin/categorias', icon: '🗂️' },
];
