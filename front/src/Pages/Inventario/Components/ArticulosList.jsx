import { localStates } from '../localStates';
import { ArticuloCard } from './ArticuloCard';

export const ArticulosList = () => {
    const { style, articulos, loading } = localStates();

    return (
        <>
            {loading && articulos.length === 0 && (
                <p style={{ color: 'var(--home-text-muted)' }}>Cargando…</p>
            )}
            {!loading && articulos.length === 0 && (
                <p style={{ color: 'var(--home-text-muted)', textAlign: 'center', padding: 20 }}>
                    No hay articulos. Crea el primero con el boton +.
                </p>
            )}
            <div className={style.list}>
                {articulos.map(a => <ArticuloCard key={a.id} a={a} />)}
            </div>
        </>
    );
};
