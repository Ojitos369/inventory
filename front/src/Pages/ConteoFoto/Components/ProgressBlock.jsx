import { localStates, PROGRESS_LABELS } from '../localStates';

export const ProgressBlock = () => {
    const { style, f, progreso, partialItems, setZoomImg } = localStates();
    const stage = progreso?.stage || 'subiendo';
    const baseLabel = progreso?.message || PROGRESS_LABELS[stage] || 'Procesando…';
    const counter = (progreso?.current && progreso?.total)
        ? ` (${progreso.current}/${progreso.total})`
        : '';
    const pct = (progreso?.current && progreso?.total)
        ? Math.min(100, Math.round((progreso.current / progreso.total) * 100))
        : null;

    return (
        <div className={style.progressBlock}>
            <div className={style.progressRow}>
                <span className={style.spinner} />
                <span className={style.progressMsg}>{baseLabel}{counter}</span>
            </div>
            {pct != null && (
                <div className={style.progressBar}>
                    <div className={style.progressFill} style={{ width: `${pct}%` }} />
                </div>
            )}
            {partialItems.length > 0 && (
                <div className={style.partialList}>
                    {partialItems.map((it, i) => {
                        const thumb = it.foto_url ? f.general.mediaUrl(it.foto_url) : null;
                        return (
                            <div key={i} className={style.partialCard}>
                                {thumb ? (
                                    <img
                                        src={thumb}
                                        alt={it.objeto || ''}
                                        className={style.itemThumb}
                                        onClick={() => setZoomImg(thumb)}
                                    />
                                ) : (
                                    <div className={`${style.itemThumb} ${style.thumbWaiting}`}>…</div>
                                )}
                                <div className={style.partialInfo}>
                                    <div className={style.partialName}>{it.objeto || '—'}</div>
                                    <div className={style.partialMeta}>
                                        {it.cantidad} {it.unidad || ''}
                                        {it.articulo_id ? ' · existente' : ' · nuevo'}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
