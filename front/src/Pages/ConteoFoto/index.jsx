import { useMemo, useRef, useState } from 'react';
import { useStates } from '../../Hooks/useStates';
import { fileToBase64, showNumber, compressImage } from '../../Core/helper';
import style from './styles/index.module.scss';


const MODES = [
    { id: 'reemplazar', label: 'Reemplazar', icon: '🔁', short: 'Reempl.' },
    { id: 'agregar', label: 'Agregar', icon: '➕', short: 'Agrega' },
    { id: 'ignorar', label: 'Ignorar', icon: '🚫', short: 'Ignora' },
];


export const ConteoFoto = () => {
    const { s, f } = useStates();
    const grupoId = useMemo(() => s.app?.grupoActual, [s.app?.grupoActual]);
    const captura = useMemo(() => s.vision?.captura, [s.vision?.captura]);
    const loadingAnalyze = !!s.loadings?.vision?.analyze;
    const loadingApply = !!s.loadings?.vision?.aplicar;

    const cameraInput = useRef(null);
    const fileInput = useRef(null);
    const [preview, setPreview] = useState(null);
    const [hint, setHint] = useState('');
    const [items, setItems] = useState([]);
    const [dragActive, setDragActive] = useState(false);

    const elegir = async (file) => {
        if (!file) return;
        if (!file.type?.startsWith('image/')) {
            f.general.notificacion({ message: 'Tipo de archivo invalido', mode: 'danger', title: 'Error' });
            return;
        }
        // comprime camara/galeria (foto cruda iPhone ~3-6MB) antes de mandar a API vision
        let comprimido = file;
        try {
            comprimido = await compressImage(file, { maxSide: 1600, quality: 0.8, targetBytes: 1.2 * 1024 * 1024 });
        } catch (_) { /* si falla, manda original */ }
        const b64 = await fileToBase64(comprimido);
        setPreview(b64);
        if (!grupoId) return;
        f.vision.analyze(grupoId, b64, hint, (res) => {
            const conModo = (res.items || []).map(it => ({
                ...it,
                modo: it.articulo_id ? 'reemplazar' : 'agregar',
            }));
            setItems(conModo);
        });
    };

    const onPickCam = (e) => elegir(e.target.files?.[0]);
    const onPickFile = (e) => elegir(e.target.files?.[0]);

    const onDrop = (e) => {
        e.preventDefault(); e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer?.files?.[0];
        if (file) elegir(file);
    };
    const onDragOver = (e) => {
        e.preventDefault(); e.stopPropagation();
        setDragActive(true);
    };
    const onDragLeave = (e) => {
        e.preventDefault(); e.stopPropagation();
        setDragActive(false);
    };

    const updateItem = (idx, key, value) => {
        const next = [...items];
        next[idx] = { ...next[idx], [key]: value };
        setItems(next);
    };
    const setAllModo = (modo) => {
        setItems(items.map(i => ({ ...i, modo })));
    };
    const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

    const aplicar = () => {
        if (!captura?.captura_id) return;
        const limpios = items
            .filter(i => i.objeto)
            .map(i => ({
                objeto: i.objeto,
                cantidad: Number(i.cantidad || 0),
                unidad: i.unidad || 'pz',
                modo: i.modo || 'reemplazar',
            }));
        f.vision.aplicar(captura.captura_id, 'reemplazar', limpios, () => {
            setPreview(null); setItems([]); setHint('');
        });
    };

    const cancelar = () => { f.vision.clear(); setPreview(null); setItems([]); };

    if (!grupoId) {
        return <div className={style.page}><p style={{ color: 'var(--home-text-muted)' }}>Selecciona un grupo primero.</p></div>;
    }

    return (
        <div className={style.page}>
            <h2 style={{ fontFamily: 'var(--home-font-display)', fontSize: '1.4rem' }}>Conteo por foto</h2>
            <p style={{ color: 'var(--home-text-muted)', fontSize: '0.9rem' }}>
                Toma una foto o sube una imagen y la IA listara los objetos para que confirmes.
            </p>

            {!preview && (
                <>
                    {/* Inputs ocultos: uno fuerza camara, otro deja elegir archivo */}
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        ref={cameraInput}
                        style={{ display: 'none' }}
                        onChange={onPickCam}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInput}
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
                                onClick={() => cameraInput.current?.click()}
                            >📷 Camara</button>
                            <button
                                type="button"
                                className={`btn btn-ghost ${style.dzBtn}`}
                                onClick={() => fileInput.current?.click()}
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
            )}

            {preview && (
                <>
                    <img src={preview} alt="captura" className={style.preview} />
                    {loadingAnalyze && <p style={{ color: 'var(--home-text-muted)' }}>Analizando imagen...</p>}

                    {!loadingAnalyze && items.length > 0 && (
                        <>
                            <div className={style.itemsHeader}>
                                <h3 style={{ fontFamily: 'var(--home-font-display)', fontSize: '1.05rem' }}>
                                    Items detectados ({items.length})
                                </h3>
                                <div className={style.bulkRow}>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)' }}>Aplicar a todos:</span>
                                    {MODES.map(m => (
                                        <button
                                            key={m.id}
                                            type="button"
                                            className={style.bulkBtn}
                                            onClick={() => setAllModo(m.id)}
                                            title={m.label}
                                        >{m.icon} {m.short}</button>
                                    ))}
                                </div>
                            </div>

                            <div className={style.itemList}>
                                {items.map((it, i) => {
                                    const modo = it.modo || 'reemplazar';
                                    return (
                                        <div key={i} className={`${style.itemCard} ${style[`m_${modo}`]}`}>
                                            <div className={style.itemTop}>
                                                <input
                                                    className={style.objInput}
                                                    value={it.objeto || ''}
                                                    onChange={e => updateItem(i, 'objeto', e.target.value)}
                                                />
                                                <button type="button" className={style.del} onClick={() => removeItem(i)} aria-label="Quitar">×</button>
                                            </div>
                                            <div className={style.itemBottom}>
                                                <div className={style.qtyBlock}>
                                                    <input
                                                        type="number"
                                                        inputMode="decimal"
                                                        step="any"
                                                        value={it.cantidad}
                                                        onChange={e => updateItem(i, 'cantidad', e.target.value)}
                                                        className={style.qtyInput}
                                                    />
                                                    <input
                                                        className={style.unidadInput}
                                                        value={it.unidad || ''}
                                                        onChange={e => updateItem(i, 'unidad', e.target.value)}
                                                        placeholder="pz"
                                                    />
                                                </div>
                                                <span className={style.itemMeta}>
                                                    {it.articulo_id
                                                        ? `Existente · actual ${showNumber(it.cantidad_actual, 2)}`
                                                        : 'Nuevo articulo'}
                                                </span>
                                            </div>
                                            <div className={style.modeRowItem}>
                                                {MODES.map(m => (
                                                    <button
                                                        key={m.id}
                                                        type="button"
                                                        className={`${style.modeBtn} ${modo === m.id ? style.active : ''}`}
                                                        onClick={() => updateItem(i, 'modo', m.id)}
                                                    >
                                                        <span>{m.icon}</span>
                                                        <span>{m.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className={style.actions}>
                                <button type="button" className="btn btn-ghost" onClick={cancelar}>Descartar</button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={aplicar}
                                    disabled={loadingApply || items.length === 0}
                                    style={{ flex: 1 }}
                                >
                                    {loadingApply ? 'Aplicando…' : 'Aplicar al inventario'}
                                </button>
                            </div>
                        </>
                    )}

                    {!loadingAnalyze && items.length === 0 && (
                        <>
                            <p style={{ color: 'var(--home-text-muted)' }}>No se detectaron items.</p>
                            <button type="button" className="btn btn-ghost" onClick={cancelar}>Reintentar</button>
                        </>
                    )}
                </>
            )}
        </div>
    );
};
