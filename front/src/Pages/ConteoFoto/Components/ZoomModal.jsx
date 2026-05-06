import { useEffect } from 'react';
import { localStates } from '../localStates';

export const ZoomModal = () => {
    const { style, zoomImg, setZoomImg } = localStates();

    useEffect(() => {
        if (!zoomImg) return;
        const onKey = (e) => { if (e.key === 'Escape') setZoomImg(null); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [zoomImg]);

    if (!zoomImg) return null;

    return (
        <div className={style.zoomOverlay} onClick={() => setZoomImg(null)} role="dialog" aria-modal="true">
            <button
                type="button"
                className={style.zoomClose}
                onClick={() => setZoomImg(null)}
                aria-label="Cerrar"
            >×</button>
            <img
                src={zoomImg}
                alt="Vista completa"
                className={style.zoomImage}
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
};
