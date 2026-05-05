import { useEffect, useMemo } from 'react';
import { useStates } from '../../../Hooks/useStates';
import { GeneralModal } from '../../../Components/Modals/GeneralModal';
import { CategoriaForm } from '../../../Components/CategoriaForm';
import style from '../styles.module.scss';


const FormContent = ({ close }) => {
    const { s } = useStates();
    const grupoId = s.app?.grupoActual;
    const editando = s.admin?.editCat;
    return (
        <CategoriaForm
            grupoId={grupoId}
            editando={editando}
            onSaved={() => close?.()}
        />
    );
};


export const AdminCategorias = () => {
    const { s, f } = useStates();
    const grupoId = useMemo(() => s.app?.grupoActual, [s.app?.grupoActual]);
    const categorias = useMemo(() => s.catalog?.categorias?.[grupoId] || [], [s.catalog?.categorias, grupoId]);

    useEffect(() => { if (grupoId) f.catalog.listCategorias(grupoId); }, [grupoId]);

    const abrirNuevo = () => {
        f.u1('admin', 'editCat', null);
        f.u2('modals', 'admin', 'catForm', true);
    };
    const abrirEditar = (c) => {
        f.u1('admin', 'editCat', c);
        f.u2('modals', 'admin', 'catForm', true);
    };
    const eliminar = (c) => {
        if (!confirm(`Eliminar categoria ${c.nombre}? (los articulos quedaran sin categoria)`)) return;
        f.catalog.removeCategoria(grupoId, c.id);
    };

    if (!grupoId) {
        return <div className={style.page}><p style={{ color: 'var(--home-text-muted)' }}>Selecciona un grupo primero.</p></div>;
    }

    return (
        <div className={style.page}>
            <div className={style.head}>
                <h2>Categorias</h2>
                <button type="button" className="btn btn-primary" onClick={abrirNuevo}>+ Nueva</button>
            </div>
            <div className={style.list}>
                {categorias.map(c => (
                    <div key={c.id} className={style.row} style={c.color ? { borderColor: c.color + '55' } : {}}>
                        {c.foto_url && (
                            <img
                                src={f.general.mediaUrl(c.foto_url)}
                                alt=""
                                style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 'var(--home-r-md)' }}
                            />
                        )}
                        <div className="name">{c.icono ? `${c.icono} ` : ''}{c.nombre}</div>
                        <div className="meta">orden: {c.orden}</div>
                        <div className="actions">
                            <button type="button" className="primary" onClick={() => abrirEditar(c)}>✏️ Editar</button>
                            <button type="button" className="danger" onClick={() => eliminar(c)}>🗑️ Eliminar</button>
                        </div>
                    </div>
                ))}
            </div>
            <GeneralModal lvl1="admin" lvl2="catForm" Component={FormContent} title="Categoria" size="sm" />
        </div>
    );
};
