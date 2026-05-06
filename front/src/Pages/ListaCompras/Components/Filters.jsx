import { localStates } from '../localStates';

export const Filters = () => {
    const {
        style, q, setQ, cat, setCat, soloFaltantes, setSoloFaltantes,
        incluirSinDatos, setIncluirSinDatos, categorias,
    } = localStates();

    return (
        <div className={style.filters}>
            <input
                placeholder="Buscar…"
                value={q}
                onChange={e => setQ(e.target.value)}
                className={style.search}
            />
            <select value={cat} onChange={e => setCat(e.target.value)}>
                <option value="">Todas las categorias</option>
                {categorias.map(c => (
                    <option key={c.id} value={c.id}>{c.icono ? `${c.icono} ` : ''}{c.nombre}</option>
                ))}
            </select>
            <label className={style.chip}>
                <input
                    type="checkbox"
                    checked={soloFaltantes}
                    onChange={e => setSoloFaltantes(e.target.checked)}
                />
                <span>Solo faltantes</span>
            </label>
            <label className={style.chip}>
                <input
                    type="checkbox"
                    checked={incluirSinDatos}
                    onChange={e => setIncluirSinDatos(e.target.checked)}
                />
                <span>Incluir sin datos</span>
            </label>
        </div>
    );
};
