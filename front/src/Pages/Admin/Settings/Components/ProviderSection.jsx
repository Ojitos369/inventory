import { useEffect } from 'react';
import { createState } from '../../../../Hooks/useStates';
import { localStates } from '../localStates';

export const ProviderSection = ({ providerKey, label, modelos, view }) => {
    const { style, guardarSeccion } = localStates();

    const [apiKey, setApiKey] = createState(['adminSettings', providerKey, 'apiKey'], '');
    const [apiBase, setApiBase] = createState(['adminSettings', providerKey, 'apiBase'], '');
    const [visionModel, setVisionModel] = createState(['adminSettings', providerKey, 'visionModel'], '');
    const [textModel, setTextModel] = createState(['adminSettings', providerKey, 'textModel'], '');
    const [showKey, setShowKey] = createState(['adminSettings', providerKey, 'showKey'], false);

    useEffect(() => {
        setApiBase(view?.api_base || '');
        setVisionModel(view?.vision_model || '');
        setTextModel(view?.text_model || '');
    }, [view?.api_base, view?.vision_model, view?.text_model]);

    const submit = () => {
        const payload = {};
        if (apiKey) payload.api_key = apiKey;
        if (apiBase) payload.api_base = apiBase;
        if (visionModel) payload.vision_model = visionModel;
        if (textModel) payload.text_model = textModel;
        guardarSeccion?.(providerKey, payload, () => setApiKey(''));
    };
    const borrarKey = () => {
        if (!confirm(`Borrar API key de ${label}?`)) return;
        guardarSeccion?.(providerKey, { api_key: '' });
    };

    const visionOptions = (modelos || []).filter(m => m.vision);

    return (
        <section style={{
            background: 'var(--home-bg-2)',
            border: '1px solid var(--home-border)',
            borderRadius: 'var(--home-r-lg)',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
        }}>
            <h3 style={{ fontFamily: 'var(--home-font-display)', margin: 0 }}>{label}</h3>

            <div>
                <label className={style.lbl}>API key</label>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                        type={showKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                        placeholder={view?.api_key?.set ? `Configurada (${view.api_key.masked})` : 'sk-...'}
                        style={{ flex: 1, minWidth: 200 }}
                        autoComplete="off"
                    />
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => setShowKey(!showKey)}
                        style={{ minHeight: 44, padding: '0 12px' }}
                    >{showKey ? '🙈' : '👁️'}</button>
                    {view?.api_key?.set && (
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={borrarKey}
                            style={{ minHeight: 44, padding: '0 12px', color: 'var(--home-danger)' }}
                        >Borrar</button>
                    )}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--home-text-muted)' }}>
                    {view?.api_key?.set
                        ? 'Hay una key guardada. Escribe una nueva para reemplazarla.'
                        : `Sin key guardada. Cae a env (${providerKey === 'kimi' ? 'KIMI_API_KEY' : 'GEMINI_API_KEY'}).`}
                </span>
            </div>

            <div>
                <label className={style.lbl}>Endpoint</label>
                <input value={apiBase} onChange={e => setApiBase(e.target.value)} placeholder="https://..." />
            </div>

            <div>
                <label className={style.lbl}>Modelo de vision (analizar fotos)</label>
                <select value={visionModel} onChange={e => setVisionModel(e.target.value)}>
                    <option value="">— elige —</option>
                    {visionOptions.map(m => (
                        <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className={style.lbl}>Modelo de texto (sugerencias / agrupar)</label>
                <select value={textModel} onChange={e => setTextModel(e.target.value)}>
                    <option value="">— elige —</option>
                    {(modelos || []).map(m => (
                        <option key={m.id} value={m.id}>
                            {m.label} {m.vision ? '· vision' : ''}
                        </option>
                    ))}
                </select>
            </div>

            <button type="button" className="btn btn-primary" onClick={submit}>Guardar {label}</button>
        </section>
    );
};
