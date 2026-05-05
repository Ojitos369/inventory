import { useMemo, useRef, useState } from 'react';
import { useStates } from '../../Hooks/useStates';
import { fileToBase64, showNumber } from '../../Core/helper';
import style from './styles/index.module.scss';

export const ConteoFoto = () => {
    const { s, f } = useStates();
    const grupoId = useMemo(() => s.app?.grupoActual, [s.app?.grupoActual]);
    const captura = useMemo(() => s.vision?.captura, [s.vision?.captura]);
    const loadingAnalyze = !!s.loadings?.vision?.analyze;
    const loadingApply = !!s.loadings?.vision?.aplicar;

    const fileInput = useRef(null);
    const [preview, setPreview] = useState(null);
    const [hint, setHint] = useState('');
    const [items, setItems] = useState([]);
    const [modo, setModo] = useState('reemplazar');

    const elegir = async (file) => {
        if (!file) return;
        const b64 = await fileToBase64(file);
        setPreview(b64);
        if (!grupoId) return;
        f.vision.analyze(grupoId, b64, hint, (res) => setItems(res.items || []));
    };

    const onPick = (e) => elegir(e.target.files?.[0]);

    const updateItem = (idx, key, value) => {
        const next = [...items];
        next[idx] = { ...next[idx], [key]: value };
        setItems(next);
    };
    const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

    const aplicar = () => {
        if (!captura?.captura_id) return;
        const limpios = items
            .filter(i => i.objeto && Number(i.cantidad) > 0)
            .map(i => ({ objeto: i.objeto, cantidad: Number(i.cantidad), unidad: i.unidad || 'pz' }));
        f.vision.aplicar(captura.captura_id, modo, limpios, () => {
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
                Toma una foto de la zona y la IA listara los objetos para que confirmes.
            </p>

            {!preview && (
                <>
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        ref={fileInput}
                        style={{ display: 'none' }}
                        onChange={onPick}
                    />
                    <button type="button" className={style.dropZone} onClick={() => fileInput.current?.click()}>
                        📷  Toca para tomar/elegir foto
                    </button>
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
                    {loadingAnalyze && <p style={{ color: 'var(--home-text-muted)' }}>Analizando con Kimi…</p>}

                    {!loadingAnalyze && items.length > 0 && (
                        <>
                            <h3 style={{ fontFamily: 'var(--home-font-display)', fontSize: '1.05rem', marginTop: 6 }}>
                                Items detectados (corrige si es necesario)
                            </h3>
                            <div className={style.itemList}>
                                {items.map((it, i) => (
                                    <div key={i} className={style.itemRow}>
                                        <div className="info">
                                            <input
                                                value={it.objeto || ''}
                                                onChange={e => updateItem(i, 'objeto', e.target.value)}
                                            />
                                            <div className="meta">
                                                {it.articulo_id ? `existente · actual: ${showNumber(it.cantidad_actual, 2)}` : 'nuevo'}
                                                {' '}·{' '}
                                                <input
                                                    style={{ width: 60, display: 'inline-block', padding: '2px 6px' }}
                                                    value={it.unidad || ''}
                                                    onChange={e => updateItem(i, 'unidad', e.target.value)}
                                                    placeholder="pz"
                                                />
                                            </div>
                                        </div>
                                        <input
                                            type="number"
                                            inputMode="decimal"
                                            step="any"
                                            value={it.cantidad}
                                            onChange={e => updateItem(i, 'cantidad', e.target.value)}
                                        />
                                        <button type="button" className="del" onClick={() => removeItem(i)} aria-label="Quitar">×</button>
                                    </div>
                                ))}
                            </div>

                            <h3 style={{ fontFamily: 'var(--home-font-display)', fontSize: '1.05rem', marginTop: 10 }}>
                                Modo de aplicacion
                            </h3>
                            <div className={style.modeRow}>
                                <button
                                    type="button"
                                    className={modo === 'reemplazar' ? style.active : ''}
                                    onClick={() => setModo('reemplazar')}
                                >
                                    <span className="t">Reemplazar</span>
                                    <span className="d">El total queda igual a lo que sale en la foto</span>
                                </button>
                                <button
                                    type="button"
                                    className={modo === 'agregar' ? style.active : ''}
                                    onClick={() => setModo('agregar')}
                                >
                                    <span className="t">Agregar</span>
                                    <span className="d">Suma a lo que ya existe</span>
                                </button>
                            </div>

                            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                                <button type="button" className="btn btn-ghost" onClick={cancelar}>Descartar</button>
                                <button type="button" className="btn btn-primary" onClick={aplicar} disabled={loadingApply || items.length === 0} style={{ flex: 1 }}>
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
