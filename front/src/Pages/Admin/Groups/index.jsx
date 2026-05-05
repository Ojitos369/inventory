import { useEffect, useMemo, useState } from 'react';
import { useStates } from '../../../Hooks/useStates';
import { GeneralModal } from '../../../Components/Modals/GeneralModal';
import style from '../styles.module.scss';


const FormContent = ({ close }) => {
    const { s, f } = useStates();
    const editando = s.admin?.editGroup;

    const [nombre, setNombre] = useState(editando?.nombre || '');
    const [descripcion, setDescripcion] = useState(editando?.descripcion || '');
    const [color, setColor] = useState(editando?.color || '#34D399');
    const [icono, setIcono] = useState(editando?.icono || '🏠');

    const submit = (e) => {
        e?.preventDefault?.();
        f.groups.save(
            { id: editando?.id, nombre: nombre.trim(), descripcion, color, icono },
            () => close?.(),
        );
    };

    return (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)' }}>Nombre</label>
                <input value={nombre} onChange={e => setNombre(e.target.value)} required autoFocus />
            </div>
            <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)' }}>Descripcion</label>
                <input value={descripcion} onChange={e => setDescripcion(e.target.value)} />
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
            <button type="submit" className="btn btn-primary">{editando ? 'Guardar' : 'Crear grupo'}</button>
        </form>
    );
};

const MembersContent = ({ close }) => {
    const { s, f } = useStates();
    const grupo = s.admin?.editGroupMembers;
    const miembros = useMemo(() => s.groups?.miembros?.[grupo?.id] || [], [s.groups?.miembros, grupo?.id]);
    const users = s.admin?.users || [];

    useEffect(() => {
        if (!grupo) return;
        f.groups.members(grupo.id);
        if (!users.length) f.users.list();
    }, [grupo?.id]);

    if (!grupo) return null;

    const noMiembros = users.filter(u => !miembros.find(m => m.id === u.id));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{ fontFamily: 'var(--home-font-display)' }}>Miembros de {grupo.nombre}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {miembros.map(m => (
                    <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 10, background: 'var(--home-bg-3)', borderRadius: 'var(--home-r-md)' }}>
                        <div>
                            <div style={{ fontWeight: 600 }}>{m.nombre || m.username}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)' }}>@{m.username} · {m.rol}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <select value={m.rol} onChange={e => f.groups.addMember(grupo.id, m.id, e.target.value)} style={{ padding: 4, fontSize: '0.8rem', width: 'auto' }}>
                                <option value="admin">admin</option>
                                <option value="member">member</option>
                                <option value="viewer">viewer</option>
                            </select>
                            <button type="button" className="btn btn-ghost" style={{ minHeight: 32, padding: '2px 8px', fontSize: '0.8rem' }} onClick={() => f.groups.removeMember(grupo.id, m.id)}>×</button>
                        </div>
                    </div>
                ))}
            </div>
            {noMiembros.length > 0 && (
                <>
                    <h4 style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--home-text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Agregar</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {noMiembros.map(u => (
                            <button
                                key={u.id}
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => f.groups.addMember(grupo.id, u.id, 'member')}
                                style={{ justifyContent: 'space-between' }}
                            >
                                <span>{u.nombre || u.username}</span>
                                <span style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)' }}>+</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};


export const AdminGroups = () => {
    const { s, f } = useStates();
    const grupos = useMemo(() => s.groups?.lista || [], [s.groups?.lista]);

    useEffect(() => { f.groups.list(); }, []);

    const abrirNuevo = () => {
        f.u1('admin', 'editGroup', null);
        f.u2('modals', 'admin', 'groupForm', true);
    };
    const abrirEditar = (g) => {
        f.u1('admin', 'editGroup', g);
        f.u2('modals', 'admin', 'groupForm', true);
    };
    const abrirMiembros = (g) => {
        f.u1('admin', 'editGroupMembers', g);
        f.u2('modals', 'admin', 'groupMembers', true);
    };
    const eliminar = (g) => {
        if (!confirm(`Desactivar grupo ${g.nombre}?`)) return;
        f.groups.remove(g.id);
    };

    return (
        <div className={style.page}>
            <div className={style.head}>
                <h2>Grupos</h2>
                <button type="button" className="btn btn-primary" onClick={abrirNuevo}>+ Nuevo</button>
            </div>
            <div className={style.list}>
                {grupos.map(g => (
                    <div key={g.id} className={style.row}>
                        <div className="name">{g.icono ? `${g.icono} ` : ''}{g.nombre}</div>
                        {g.descripcion && <div className="meta">{g.descripcion}</div>}
                        <div className="meta">{g.miembros} miembros · {g.articulos} articulos</div>
                        <div className="actions">
                            <button type="button" onClick={() => abrirEditar(g)}>Editar</button>
                            <button type="button" onClick={() => abrirMiembros(g)}>Miembros</button>
                            <button type="button" className="danger" onClick={() => eliminar(g)}>Desactivar</button>
                        </div>
                    </div>
                ))}
            </div>
            <GeneralModal lvl1="admin" lvl2="groupForm" Component={FormContent} title="Grupo" size="sm" />
            <GeneralModal lvl1="admin" lvl2="groupMembers" Component={MembersContent} title="Miembros" size="md" />
        </div>
    );
};
