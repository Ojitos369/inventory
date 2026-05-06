import { localStates } from '../localStates';

export const DropZone = () => {
    const {
        style, dragActive, hint, setHint,
        cameraInputRef, fileInputRef,
        onPickCam, onPickFile, onDrop, onDragOver, onDragLeave,
    } = localStates();

    return (
        <>
            <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={cameraInputRef}
                style={{ display: 'none' }}
                onChange={onPickCam}
            />
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={onPickFile}
            />

            <div
                className={`${style.dropZone} ${dragActive ? style.dragActive : ''}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
            >
                <span className={style.dzIcon}>📸</span>
                <span className={style.dzTitle}>Sube una foto del area a analizar</span>
                <span className={style.dzHint}>Arrastra y suelta aqui, o usa los botones</span>
                <div className={style.dzActions}>
                    <button
                        type="button"
                        className={`btn btn-primary ${style.dzBtn}`}
                        onClick={() => cameraInputRef.current?.click()}
                    >📷 Camara</button>
                    <button
                        type="button"
                        className={`btn btn-ghost ${style.dzBtn}`}
                        onClick={() => fileInputRef.current?.click()}
                    >🖼️ Elegir archivo</button>
                </div>
            </div>

            <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)' }}>Pista (opcional)</label>
                <input
                    placeholder="Ej. estante de la cocina"
                    value={hint}
                    onChange={e => setHint(e.target.value)}
                />
            </div>
        </>
    );
};
