import { useEffect, useMemo, useState } from 'react';
import { useStates } from '../../../Hooks/useStates';
import { GeneralModal } from '../../../Components/Modals/GeneralModal';
import { CategoriaForm } from '../../../Components/CategoriaForm';
import style from '../styles/index.module.scss';


// IMPORTANTE: el Component pasado a GeneralModal debe ser una referencia estable.
// Si se redefine inline (e.g. (props) => <Content {...props} grupoId={grupoId} />),
// cada re-render del padre crea una NUEVA funcion -> React desmonta+monta el Content
// -> se pierde el state local (creando, editando). Por eso el componente se declara
// aqui top-level y lee grupoId desde el store directamente.
const Content = ({ close }) => {
    const { s, f } = useStates();
    const grupoId = useMemo(() => s.app?.grupoActual, [s.app?.grupoActual]);
    const categorias = useMemo(
        () => s.catalog?.categorias?.[grupoId] || [],
        [s.catalog?.categorias, grupoId],
    );
    const [editando, setEditando] = useState(null);
    const [creando, setCreando] = useState(false);

    useEffect(() => { if (grupoId) f.catalog.listCategorias(grupoId); }, [grupoId]);

    const eliminar = (c) => {
        if (!confirm(`Eliminar categoria "${c.nombre}"? (los articulos quedaran sin categoria)`)) return;
        f.catalog.removeCategoria(grupoId, c.id);
    };

    if (creando || editando) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => { setCreando(false); setEditando(null); }}
                    style={{ alignSelf: 'flex-start' }}
                >← Volver al listado</button>
                <h4 style={{ fontFamily: 'var(--home-font-display)', margin: 0 }}>
                    {editando ? `Editar "${editando.nombre}"` : 'Nueva categoria'}
                </h4>
                <CategoriaForm
                    grupoId={grupoId}
                    editando={editando}
                    onSaved={() => { setCreando(false); setEditando(null); }}
                />
            </div>
        );
    }

    return (
        <div className={style.catManager}>
            <button
                type="button"
                className="btn btn-primary"
                onClick={() => setCreando(true)}
            >+ Nueva categoria</button>

            {categorias.length === 0 ? (
                <p style={{ color: 'var(--home-text-muted)', textAlign: 'center', padding: 12 }}>
                    Aun no hay categorias en este grupo.
                </p>
            ) : (
                <div className={style.catList}>
                    {categorias.map(c => (
                        <div key={c.id} className={style.catRow}>
                            <div
                                className={style.catIcon}
                                style={c.color ? { background: c.color + '33', color: c.color } : {}}
                            >
                                {c.foto_url ? (
                                    <img src={f.general.mediaUrl(c.foto_url)} alt="" />
                                ) : (
                                    <span>{c.icono || '🗂️'}</span>
                                )}
                            </div>
                            <div className={style.catName}>{c.nombre}</div>
                            <div className={style.catActions}>
                                <button type="button" onClick={() => setEditando(c)}>✏️</button>
                                <button type="button" className="danger" onClick={() => eliminar(c)}>🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


export const CategoriasManagerModal = () => {
    return (
        <GeneralModal
            lvl1="catalog"
            lvl2="catsManager"
            Component={Content}
            title="Categorias del grupo"
            size="md"
        />
    );
};
