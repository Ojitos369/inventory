import { localStates } from '../localStates';
import { ItemCard } from './ItemCard';

export const ItemList = () => {
    const { style, filtrados, loading } = localStates();
    return (
        <>
            {loading && filtrados.length === 0 && <p style={{ color: 'var(--home-text-muted)' }}>Cargando…</p>}
            {!loading && filtrados.length === 0 && (
                <p style={{ color: 'var(--home-text-muted)', textAlign: 'center', padding: 24 }}>
                    🎉 Nada que comprar. El inventario esta optimo.
                </p>
            )}
            <div className={style.list}>
                {filtrados.map(it => <ItemCard key={it.id} it={it} />)}
            </div>
        </>
    );
};
