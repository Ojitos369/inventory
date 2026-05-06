const store = new Map();

const sortedReplacer = (_k, v) => {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
        return Object.keys(v).sort().reduce((acc, k) => {
            acc[k] = v[k];
            return acc;
        }, {});
    }
    return v;
};

export const stableKey = (parts) => {
    try { return JSON.stringify(parts, sortedReplacer); }
    catch { return String(Date.now()) + Math.random(); }
};

export const cacheGet = (k) => store.get(k);
export const cacheHas = (k) => store.has(k);
export const cacheSet = (k, v) => { store.set(k, v); return v; };
export const cacheDelete = (k) => store.delete(k);
export const cacheClearPrefix = (prefix) => {
    for (const k of store.keys()) if (k.startsWith(prefix)) store.delete(k);
};

export const sha256Hex = async (str) => {
    if (typeof str !== 'string') str = String(str ?? '');
    if (window.crypto?.subtle) {
        const buf = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    return ('00000000' + (h >>> 0).toString(16)).slice(-8);
};
