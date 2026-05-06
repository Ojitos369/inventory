import { localStates } from '../localStates';

export const ProviderActivo = () => {
    const {
        style, providers, pVision, setPVision, pText, setPText,
        guardarProvider, probar,
    } = localStates();

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
    );
};
