import { localStates } from '../localStates';

export const ItemsHeader = () => {
    const { style, MODES, items, setAllModo } = localStates();

    return (
        <div className={style.itemsHeader}>
            <h3 style={{ fontFamily: 'var(--home-font-display)', fontSize: '1.05rem' }}>
                Items detectados ({items.length})
            </h3>
            <div className={style.bulkRow}>
                <span style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)' }}>Aplicar a todos:</span>
                {MODES.map(m => (
                    <button
                        key={m.id}
                        type="button"
                        className={style.bulkBtn}
                        onClick={() => setAllModo(m.id)}
                        title={m.label}
                    >{m.icon} {m.short}</button>
                ))}
            </div>
        </div>
    );
};
