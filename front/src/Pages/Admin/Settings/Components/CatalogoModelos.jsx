import { localStates } from '../localStates';

const ModelRow = ({ m }) => (
    <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 10px',
        background: 'var(--home-bg-3)',
        borderRadius: 'var(--home-r-md)',
        fontSize: '0.82rem',
    }}>
        <span>
            <code style={{ fontFamily: 'var(--home-font-mono)' }}>{m.id}</code>
            {' · '}
            <span style={{ color: 'var(--home-text-muted)' }}>{m.context}</span>
        </span>
        <span>{m.vision ? '👁️' : '📝'}</span>
    </div>
);

export const CatalogoModelos = () => {
    const { kimiModels, geminiModels } = localStates();
    return (
        <section style={{
            background: 'var(--home-bg-2)',
            border: '1px solid var(--home-border)',
            borderRadius: 'var(--home-r-lg)',
            padding: 16,
        }}>
            <h3 style={{ fontFamily: 'var(--home-font-display)', margin: '0 0 8px' }}>Catalogo de modelos</h3>
            <p style={{ color: 'var(--home-text-muted)', margin: '0 0 12px', fontSize: '0.85rem' }}>
                👁️ acepta imagenes · 📝 solo texto.
            </p>
            <h4 style={{ fontSize: '0.85rem', marginBottom: 6 }}>Kimi</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                {kimiModels.map(m => <ModelRow key={m.id} m={m} />)}
            </div>
            <h4 style={{ fontSize: '0.85rem', marginBottom: 6 }}>Gemini</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {geminiModels.map(m => <ModelRow key={m.id} m={m} />)}
            </div>
        </section>
    );
};
