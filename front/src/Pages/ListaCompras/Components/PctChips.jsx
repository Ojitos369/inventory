import { localStates } from '../localStates';

export const PctChips = () => {
    const { style, minPct, setMinPct } = localStates();
    return (
        <div className={style.pctChips}>
            <span style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)' }}>% gastado mínimo:</span>
            {[0, 30, 50, 70, 90].map(v => (
                <button
                    key={v}
                    type="button"
                    className={`${style.pctChip} ${minPct === v ? style.pctOn : ''}`}
                    onClick={() => setMinPct(v)}
                >{v === 0 ? 'Todos' : `≥ ${v}%`}</button>
            ))}
        </div>
    );
};
