import { useEffect, useMemo, useState } from 'react';
import { useStates } from '../../../Hooks/useStates';
import { GeneralModal } from '../../../Components/Modals/GeneralModal';
import style from '../styles.module.scss';


const FormContent = ({ close }) => {
    const { s, f } = useStates();
    const grupoId = s.app?.grupoActual;
    const editando = s.admin?.editCat;

    const [nombre, setNombre] = useState(editando?.nombre || '');
    const [color, setColor] = useState(editando?.color || '#34D399');
    const [icono, setIcono] = useState(editando?.icono || '');
    const [orden, setOrden] = useState(editando?.orden ?? 0);

    const submit = (e) => {
        e?.preventDefault?.();
        f.catalog.saveCategoria(
            { id: editando?.id, grupo_id: grupoId, nombre: nombre.trim(), color, icono, orden: Number(orden || 0) },
            () => close?.(),
        );
    };

    return (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)' }}>Nombre</label>
                <input value={nombre} onChange={e => setNombre(e.target.value)} required autoFocus />
            </div>
            <div className={style.formRow}>
                <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)' }}>Icono (emoji)</label>
                    <input value={icono} onChange={e => setIcono(e.target.value)} />
                </div>
                <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)' }}>Color</label>
                    <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ height: 44 }} />
                </div>
            </div>
            <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)' }}>Orden</label>
                <input type="number" value={orden} onChange={e => setOrden(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary">{editando ? 'Guardar' : 'Crear'}</button>
        </form>
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
                        <div className="name">{c.icono ? `${c.icono} ` : ''}{c.nombre}</div>
                        <div className="meta">orden: {c.orden}</div>
                        <div className="actions">
                            <button type="button" onClick={() => abrirEditar(c)}>Editar</button>
                            <button type="button" className="danger" onClick={() => eliminar(c)}>Eliminar</button>
                        </div>
                    </div>
                ))}
            </div>
            <GeneralModal lvl1="admin" lvl2="catForm" Component={FormContent} title="Categoria" size="sm" />
        </div>
    );
};
