import { localStates } from '../localStates';

export const Toolbar = () => {
    const { style, q, setQ, cat, setCat, bajos, setBajos, categorias } = localStates();
    return (
        <div className={style.toolbar}>
            <input
                placeholder="Buscar articulo…"
                value={q}
                onChange={e => setQ(e.target.value)}
            />
            <select value={cat || ''} onChange={e => setCat(e.target.value || null)}>
                <option value="">Todas las categorias</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            <button
                type="button"
                className={`${style.filterChip} ${bajos ? style.on : ''}`}
                onClick={() => setBajos(!bajos)}
            >
                {bajos ? '✓ ' : ''}Bajo optimo
            </button>
        </div>
    );
};
