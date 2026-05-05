import { useEffect, useMemo, useState } from 'react';
import { useStates } from '../../../Hooks/useStates';
import style from '../styles.module.scss';


const ProviderSection = ({ providerKey, label, modelos, view, onChange }) => {
    const [apiKey, setApiKey] = useState('');
    const [apiBase, setApiBase] = useState('');
    const [visionModel, setVisionModel] = useState('');
    const [textModel, setTextModel] = useState('');
    const [showKey, setShowKey] = useState(false);

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
        onChange?.(providerKey, payload, () => setApiKey(''));
    };
    const borrarKey = () => {
        if (!confirm(`Borrar API key de ${label}?`)) return;
        onChange?.(providerKey, { api_key: '' });
    };

    const visionOptions = modelos.filter(m => m.vision);

    return (
        <section style={{
            background: 'var(--home-bg-2)', border: '1px solid var(--home-border)',
            borderRadius: 'var(--home-r-lg)', padding: 16,
            display: 'flex', flexDirection: 'column', gap: 12,
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
                        onClick={() => setShowKey(v => !v)}
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
                    {modelos.map(m => (
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


export const AdminSettings = () => {
    const { s, f } = useStates();
    const data = useMemo(() => s.adminSettings?.data, [s.adminSettings?.data]);
    const provider = data?.provider || { vision: 'kimi', text: 'kimi' };
    const providers = data?.providers || [];
    const kimiModels = data?.kimi_models || [];
    const geminiModels = data?.gemini_models || [];

    const [pVision, setPVision] = useState('kimi');
    const [pText, setPText] = useState('kimi');

    useEffect(() => { f.adminSettings.fetch(); }, []);

    useEffect(() => {
        setPVision(provider.vision || 'kimi');
        setPText(provider.text || 'kimi');
    }, [provider.vision, provider.text]);

    const guardarSeccion = (ns, payload, onOk) => {
        f.adminSettings.save({ [ns]: payload }, onOk);
    };

    const guardarProvider = () => {
        f.adminSettings.save({ provider: { vision: pVision, text: pText } });
    };

    const probar = (kind) => f.adminSettings.test(kind);

    return (
        <div className={style.page}>
            <div className={style.head}>
                <h2>Ajustes</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 760 }}>
                <section style={{
                    background: 'var(--home-bg-2)', border: '1px solid var(--home-border)',
                    borderRadius: 'var(--home-r-lg)', padding: 16,
                    display: 'flex', flexDirection: 'column', gap: 12,
                }}>
                    <h3 style={{ fontFamily: 'var(--home-font-display)', margin: 0 }}>Proveedor activo</h3>
                    <p style={{ color: 'var(--home-text-muted)', margin: 0, fontSize: '0.85rem' }}>
                        Elige que proveedor usa cada funcion. Cada uno se configura en su seccion abajo.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label className={style.lbl}>Vision (analizar fotos)</label>
                            <select value={pVision} onChange={e => setPVision(e.target.value)}>
                                {providers.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={style.lbl}>Texto (sugerencias / agrupar)</label>
                            <select value={pText} onChange={e => setPText(e.target.value)}>
                                {providers.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button type="button" className="btn btn-primary" onClick={guardarProvider}>Guardar proveedor</button>
                        <button type="button" className="btn btn-ghost" onClick={() => probar('text')}>🧪 Probar texto</button>
                        <button type="button" className="btn btn-ghost" onClick={() => probar('vision')}>🧪 Probar vision</button>
                    </div>
                </section>

                <ProviderSection
                    providerKey="kimi"
                    label="Kimi (Moonshot AI)"
                    modelos={kimiModels}
                    view={data?.kimi}
                    onChange={guardarSeccion}
                />

                <ProviderSection
                    providerKey="gemini"
                    label="Google Gemini"
                    modelos={geminiModels}
                    view={data?.gemini}
                    onChange={guardarSeccion}
                />

                <section style={{
                    background: 'var(--home-bg-2)', border: '1px solid var(--home-border)',
                    borderRadius: 'var(--home-r-lg)', padding: 16,
                }}>
                    <h3 style={{ fontFamily: 'var(--home-font-display)', margin: '0 0 8px' }}>Catalogo de modelos</h3>
                    <p style={{ color: 'var(--home-text-muted)', margin: '0 0 12px', fontSize: '0.85rem' }}>
                        👁️ acepta imagenes · 📝 solo texto.
                    </p>
                    <h4 style={{ fontSize: '0.85rem', marginBottom: 6 }}>Kimi</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                        {kimiModels.map(m => (
                            <ModelRow key={m.id} m={m} />
                        ))}
                    </div>
                    <h4 style={{ fontSize: '0.85rem', marginBottom: 6 }}>Gemini</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {geminiModels.map(m => (
                            <ModelRow key={m.id} m={m} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

const ModelRow = ({ m }) => (
    <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '6px 10px', background: 'var(--home-bg-3)',
        borderRadius: 'var(--home-r-md)', fontSize: '0.82rem',
    }}>
        <span>
            <code style={{ fontFamily: 'var(--home-font-mono)' }}>{m.id}</code>
            {' · '}
            <span style={{ color: 'var(--home-text-muted)' }}>{m.context}</span>
        </span>
        <span>{m.vision ? '👁️' : '📝'}</span>
    </div>
);
