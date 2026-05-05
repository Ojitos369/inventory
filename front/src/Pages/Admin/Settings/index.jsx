import { useEffect, useMemo, useState } from 'react';
import { useStates } from '../../../Hooks/useStates';
import style from '../styles.module.scss';


export const AdminSettings = () => {
    const { s, f } = useStates();
    const data = useMemo(() => s.adminSettings?.data, [s.adminSettings?.data]);
    const kimi = data?.kimi || {};
    const modelos = data?.kimi_models || [];

    const [apiKey, setApiKey] = useState('');
    const [apiBase, setApiBase] = useState('');
    const [visionModel, setVisionModel] = useState('');
    const [textModel, setTextModel] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResp, setTestResp] = useState(null);

    useEffect(() => { f.adminSettings.fetch(); }, []);

    useEffect(() => {
        if (data) {
            setApiBase(kimi.api_base || '');
            setVisionModel(kimi.vision_model || '');
            setTextModel(kimi.text_model || '');
        }
    }, [data?.kimi?.api_base, data?.kimi?.vision_model, data?.kimi?.text_model]);

    const submit = (e) => {
        e?.preventDefault?.();
        const payload = { kimi: {} };
        // Solo enviar api_key si el admin escribio algo (string vacio borra explicitamente)
        if (apiKey) payload.kimi.api_key = apiKey;
        if (apiBase) payload.kimi.api_base = apiBase;
        if (visionModel) payload.kimi.vision_model = visionModel;
        if (textModel) payload.kimi.text_model = textModel;
        f.adminSettings.save(payload, () => setApiKey(''));
    };

    const borrarKey = () => {
        if (!confirm('Borrar API key actual?')) return;
        f.adminSettings.save({ kimi: { api_key: '' } });
    };

    const probar = async () => {
        setTesting(true);
        setTestResp(null);
        const r = await f.adminSettings.testKimi();
        setTestResp(r);
        setTesting(false);
    };

    const visionOptions = modelos.filter(m => m.vision);
    const textOptions = modelos;  // todos sirven para texto

    return (
        <div className={style.page}>
            <div className={style.head}>
                <h2>Ajustes</h2>
            </div>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720 }}>
                <section style={{
                    background: 'var(--home-bg-2)', border: '1px solid var(--home-border)',
                    borderRadius: 'var(--home-r-lg)', padding: 16,
                    display: 'flex', flexDirection: 'column', gap: 12,
                }}>
                    <h3 style={{ fontFamily: 'var(--home-font-display)', margin: 0 }}>Kimi (Moonshot AI)</h3>
                    <p style={{ color: 'var(--home-text-muted)', margin: 0, fontSize: '0.85rem' }}>
                        API key, endpoint y modelos para texto / vision. Los cambios se aplican en caliente
                        (no se requiere reinicio).
                    </p>

                    <div>
                        <label className={style.lbl}>API key</label>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <input
                                type={showKey ? 'text' : 'password'}
                                value={apiKey}
                                onChange={e => setApiKey(e.target.value)}
                                placeholder={kimi?.api_key?.set ? `Configurada (${kimi.api_key.masked})` : 'sk-...'}
                                style={{ flex: 1 }}
                                autoComplete="off"
                            />
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => setShowKey(v => !v)}
                                style={{ minHeight: 44, padding: '0 12px' }}
                            >{showKey ? '🙈' : '👁️'}</button>
                            {kimi?.api_key?.set && (
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={borrarKey}
                                    style={{ minHeight: 44, padding: '0 12px', color: 'var(--home-danger)' }}
                                >Borrar</button>
                            )}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--home-text-muted)' }}>
                            {kimi?.api_key?.set
                                ? 'Hay una key guardada. Escribe una nueva para reemplazarla.'
                                : 'Sin key guardada. La app cae a la variable KIMI_API_KEY de entorno.'}
                        </span>
                    </div>

                    <div>
                        <label className={style.lbl}>Endpoint</label>
                        <input value={apiBase} onChange={e => setApiBase(e.target.value)} placeholder="https://api.moonshot.ai/v1" />
                    </div>

                    <div>
                        <label className={style.lbl}>Modelo de vision (analizar fotos)</label>
                        <select value={visionModel} onChange={e => setVisionModel(e.target.value)}>
                            <option value="">— elige —</option>
                            {visionOptions.map(m => (
                                <option key={m.id} value={m.id}>
                                    {m.label}
                                </option>
                            ))}
                        </select>
                        <span style={{ fontSize: '0.72rem', color: 'var(--home-text-muted)' }}>
                            Solo modelos con soporte multimodal aparecen aqui.
                        </span>
                    </div>

                    <div>
                        <label className={style.lbl}>Modelo de texto (sugerencias / agrupar)</label>
                        <select value={textModel} onChange={e => setTextModel(e.target.value)}>
                            <option value="">— elige —</option>
                            {textOptions.map(m => (
                                <option key={m.id} value={m.id}>
                                    {m.label} {m.vision ? '· vision' : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button type="submit" className="btn btn-primary">Guardar</button>
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={probar}
                            disabled={testing}
                        >{testing ? 'Probando…' : '🧪 Probar conexion'}</button>
                    </div>

                    {testResp && (
                        <div style={{
                            padding: 10,
                            borderRadius: 'var(--home-r-md)',
                            background: testResp.ok ? 'var(--home-success-soft)' : 'var(--home-danger-soft)',
                            color: testResp.ok ? 'var(--home-success)' : 'var(--home-danger)',
                            fontSize: '0.85rem',
                        }}>
                            {testResp.ok
                                ? <>OK · respuesta: <code>{testResp.respuesta || '(vacio)'}</code></>
                                : <>Error: {testResp.error}</>}
                        </div>
                    )}
                </section>

                <section style={{
                    background: 'var(--home-bg-2)', border: '1px solid var(--home-border)',
                    borderRadius: 'var(--home-r-lg)', padding: 16,
                }}>
                    <h3 style={{ fontFamily: 'var(--home-font-display)', margin: '0 0 8px' }}>Modelos disponibles</h3>
                    <p style={{ color: 'var(--home-text-muted)', margin: '0 0 12px', fontSize: '0.85rem' }}>
                        Catalogo curado segun la documentacion de Kimi. Los marcados con 👁️ aceptan imagenes.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {modelos.map(m => (
                            <div key={m.id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '8px 10px', background: 'var(--home-bg-3)',
                                borderRadius: 'var(--home-r-md)', fontSize: '0.85rem',
                            }}>
                                <span>
                                    <code style={{ fontFamily: 'var(--home-font-mono)' }}>{m.id}</code>
                                    {' · '}
                                    <span style={{ color: 'var(--home-text-muted)' }}>{m.context}</span>
                                </span>
                                <span>{m.vision ? '👁️ vision' : '📝 texto'}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </form>
        </div>
    );
};
