import { useEffect } from 'react';

export const useKeyDown = (callback, keys, keyExec) => {
    useEffect(() => {
        if (!keyExec) return;
        const onKeyDown = (event) => {
            const evKey = (event?.key || '').toLowerCase();
            if (keys.some(k => k.toLowerCase() === evKey)) {
                callback?.(event);
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [callback, keyExec, keys.join('|')]);
};

export const useClickOutside = (ref, onOutside, active = true) => {
    useEffect(() => {
        if (!active) return;
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) onOutside?.(e);
        };
        document.addEventListener('mousedown', handler);
        document.addEventListener('touchstart', handler);
        return () => {
            document.removeEventListener('mousedown', handler);
            document.removeEventListener('touchstart', handler);
        };
    }, [ref, onOutside, active]);
};
