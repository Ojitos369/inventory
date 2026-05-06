import { localStates } from '../localStates';

export const Descripcion = () => {
    const { articulo } = localStates();
    if (!articulo) return null;

    return (
        <>
            {articulo.descripcion && (
                <div className="card" style={{ padding: 16 }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: 6, fontFamily: 'var(--home-font-display)' }}>Descripcion</h3>
                    <p style={{ color: 'var(--home-text-soft)' }}>{articulo.descripcion}</p>
                </div>
            )}
            {articulo.notas && (
                <div className="card" style={{ padding: 16 }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: 6, fontFamily: 'var(--home-font-display)' }}>Notas</h3>
                    <p style={{ color: 'var(--home-text-soft)' }}>{articulo.notas}</p>
                </div>
            )}
        </>
    );
};
