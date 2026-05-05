import { useEffect, useMemo, useState } from 'react';
import { useStates } from '../../Hooks/useStates';
import { GeneralModal } from '../../Components/Modals/GeneralModal';
import { CategoriaForm } from '../../Components/CategoriaForm';
import { ImageUploader } from '../../Components/ImageUploader';
import { debounce } from '../../Core/helper';
import style from './styles/index.module.scss';

const Content = ({ close }) => {
    const { s, f } = useStates();
    const editando = s.catalog?.editArticulo;
    const grupoId = s.app?.grupoActual;
    const categorias = s.catalog?.categorias?.[grupoId] || [];

    const [nombre, setNombre] = useState(editando?.nombre || '');
    const [descripcion, setDescripcion] = useState(editando?.descripcion || '');
    const [cantidad, setCantidad] = useState(editando?.cantidad ?? 0);
    const [optimo, setOptimo] = useState(editando?.optimo ?? 0);
    const [minimo, setMinimo] = useState(editando?.minimo ?? 0);
    const [unidad, setUnidad] = useState(editando?.unidad || 'pz');
    const [categoria, setCategoria] = useState(editando?.categoria_id || '');
    const [foto, setFoto] = useState(editando?.foto_url || '');
    const [sugerencias, setSugerencias] = useState({ locales: [], ia: { sugerencias: [], categoria_sugerida: null, similares: [] } });
    const [showSug, setShowSug] = useState(false);
    const [creandoCategoria, setCreandoCategoria] = useState(false);

    const buscarSug = useMemo(() => debounce((q) => {
        if (!q || q.length < 2) { setSugerencias({ locales: [], ia: { sugerencias: [] } }); return; }
        f.catalog.suggest(grupoId, q, setSugerencias);
    }, 400), [grupoId]);

    useEffect(() => {
        if (!editando) buscarSug(nombre);
    }, [nombre]);

    useEffect(() => {
        if (sugerencias?.ia?.categoria_sugerida && !categoria) {
            const match = categorias.find(c => c.nombre.toLowerCase() === sugerencias.ia.categoria_sugerida.toLowerCase());
            if (match) setCategoria(match.id);
        }
    }, [sugerencias?.ia?.categoria_sugerida]);

    const submit = (e) => {
        e?.preventDefault?.();
        const data = {
            id: editando?.id,
            grupo_id: grupoId,
            nombre: nombre.trim(),
            descripcion,
            categoria_id: categoria || null,
            cantidad: Number(cantidad || 0),
            optimo: Number(optimo || 0),
            minimo: Number(minimo || 0),
            unidad,
            foto_url: foto || null,
        };
        f.catalog.saveArticulo(data, () => { f.u1('catalog', 'editArticulo', null); close?.(); });
    };

    const todasSug = [
        ...(sugerencias.locales || []).map(s => ({ s, kind: 'local' })),
        ...((sugerencias.ia?.sugerencias) || []).map(s => ({ s, kind: 'ia' })),
    ];

    if (creandoCategoria) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setCreandoCategoria(false)}
                    style={{ alignSelf: 'flex-start' }}
                >← Volver al articulo</button>
                <h4 style={{ fontFamily: 'var(--home-font-display)', margin: 0 }}>Nueva categoria</h4>
                <CategoriaForm
                    grupoId={grupoId}
                    editando={null}
                    compact
                    onSaved={(resp) => {
                        // re-listar categorias y seleccionar la nueva
                        f.catalog.listCategorias(grupoId);
                        if (resp?.id) setCategoria(resp.id);
                        setCreandoCategoria(false);
                    }}
                />
            </div>
        );
    }

    return (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)' }}>Articulo</label>
                <input
                    value={nombre}
                    onChange={e => { setNombre(e.target.value); setShowSug(true); }}
                    onFocus={() => setShowSug(true)}
                    onBlur={() => setTimeout(() => setShowSug(false), 200)}
                    placeholder="Ej. detergente liquido"
                    required
                    autoFocus
                />
                {showSug && todasSug.length > 0 && (
                    <div className={style.suggestList}>
                        {sugerencias.locales?.length > 0 && <div className="head">Existentes</div>}
                        {sugerencias.locales?.map((sug, i) => (
                            <div key={`l${i}`} className="item" onMouseDown={() => setNombre(sug)}>{sug}</div>
                        ))}
                        {sugerencias.ia?.sugerencias?.length > 0 && <div className="head">Sugerencias IA</div>}
                        {sugerencias.ia?.sugerencias?.map((sug, i) => (
                            <div key={`i${i}`} className="item" onMouseDown={() => setNombre(sug)}>✨ {sug}</div>
                        ))}
                    </div>
                )}
            </div>

            <div className={style.formRow}>
                <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)' }}>Categoria</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <select value={categoria} onChange={e => setCategoria(e.target.value)} style={{ flex: 1 }}>
                            <option value="">Sin categoria</option>
                            {categorias.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.icono ? `${c.icono} ` : ''}{c.nombre}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => setCreandoCategoria(true)}
                            title="Nueva categoria"
                            style={{ minHeight: 44, padding: '0 14px', flexShrink: 0 }}
                        >＋</button>
                    </div>
                </div>
                <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)' }}>Unidad</label>
                    <input value={unidad} onChange={e => setUnidad(e.target.value)} placeholder="pz / kg / l" />
                </div>
            </div>

            <div className={style.formRow}>
                <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)' }}>Cantidad actual</label>
                    <input type="number" inputMode="decimal" step="any" value={cantidad} onChange={e => setCantidad(e.target.value)} disabled={!!editando} />
                    {!!editando && <span style={{ fontSize: '0.7rem', color: 'var(--home-text-muted)' }}>Usa "movimientos" para cambiar la cantidad</span>}
                </div>
                <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)' }}>Optimo</label>
                    <input type="number" inputMode="decimal" step="any" value={optimo} onChange={e => setOptimo(e.target.value)} />
                </div>
            </div>

            <div className={style.formRow}>
                <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)' }}>Minimo (alerta)</label>
                    <input type="number" inputMode="decimal" step="any" value={minimo} onChange={e => setMinimo(e.target.value)} />
                </div>
                <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)' }}>Descripcion</label>
                    <input value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Notas opcionales" />
                </div>
            </div>

            <ImageUploader
                value={foto}
                onChange={setFoto}
                folder="articulos"
                label="Foto del articulo (opcional)"
            />

            <button type="submit" className="btn btn-primary">{editando ? 'Guardar cambios' : 'Crear articulo'}</button>
        </form>
    );
};

export const ArticuloFormModal = () => {
    const { s } = useStates();
    const editando = s.catalog?.editArticulo;
    return (
        <GeneralModal
            lvl1="catalog"
            lvl2="formModal"
            Component={Content}
            title={editando?.id ? 'Editar articulo' : 'Nuevo articulo'}
            size="md"
        />
    );
};
