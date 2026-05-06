import { localStates } from '../localStates';

export const MisGrupos = () => {
    const { style, grupos } = localStates();
    return (
        <div className={style.section}>
            <h3>Mis grupos</h3>
            {grupos.length === 0 && <p style={{ color: 'var(--home-text-muted)' }}>No perteneces a ningun grupo.</p>}
            {grupos.map(g => (
                <div
                    key={g.id}
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '8px 0',
                        borderBottom: '1px solid var(--home-border)',
                    }}
                >
                    <span>{g.icono ? `${g.icono} ` : ''}{g.nombre}</span>
                    <span style={{ color: 'var(--home-text-muted)', fontSize: '0.85rem' }}>{g.rol}</span>
                </div>
            ))}
        </div>
    );
};
