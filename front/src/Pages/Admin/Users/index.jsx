import { useEffect, useMemo, useState } from 'react';
import { useStates } from '../../../Hooks/useStates';
import { GeneralModal } from '../../../Components/Modals/GeneralModal';
import { showDate } from '../../../Core/helper';
import style from '../styles.module.scss';


const FormContent = ({ close }) => {
    const { s, f } = useStates();
    const editando = s.admin?.editUser;
    const grupos = s.groups?.lista || [];

    const [username, setUsername] = useState(editando?.username || '');
    const [nombre, setNombre] = useState(editando?.nombre || '');
    const [email, setEmail] = useState(editando?.email || '');
    const [passwd, setPasswd] = useState('');
    const [isAdmin, setIsAdmin] = useState(!!editando?.is_admin);
    const [activo, setActivo] = useState(editando?.activo ?? true);
    const [gruposSel, setGruposSel] = useState([]);

    const submit = (e) => {
        e?.preventDefault?.();
        if (editando) {
            f.users.update({ id: editando.id, nombre, email, is_admin: isAdmin, activo }, () => close?.());
        } else {
            f.users.create({ username: username.trim(), passwd, nombre, email, is_admin: isAdmin, grupos: gruposSel }, () => close?.());
        }
    };

    return (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)' }}>Usuario</label>
                <input value={username} onChange={e => setUsername(e.target.value.toLowerCase())} disabled={!!editando} required />
            </div>
            {!editando && (
                <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)' }}>Contrasena inicial</label>
                    <input type="password" value={passwd} onChange={e => setPasswd(e.target.value)} required />
                </div>
            )}
            <div className={style.formRow}>
                <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)' }}>Nombre</label>
                    <input value={nombre} onChange={e => setNombre(e.target.value)} />
                </div>
                <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)' }}>Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={isAdmin} onChange={e => setIsAdmin(e.target.checked)} style={{ width: 'auto' }} />
                Es administrador
            </label>
            {editando && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" checked={activo} onChange={e => setActivo(e.target.checked)} style={{ width: 'auto' }} />
                    Activo
                </label>
            )}
            {!editando && grupos.length > 0 && (
                <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)' }}>Asignar a grupos</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {grupos.map(g => (
                            <label key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <input
                                    type="checkbox"
                                    style={{ width: 'auto' }}
                                    checked={gruposSel.includes(g.id)}
                                    onChange={e => setGruposSel(e.target.checked ? [...gruposSel, g.id] : gruposSel.filter(x => x !== g.id))}
                                />
                                {g.nombre}
                            </label>
                        ))}
                    </div>
                </div>
            )}
            <button type="submit" className="btn btn-primary">{editando ? 'Guardar cambios' : 'Crear usuario'}</button>
        </form>
    );
};

const ResetPwdContent = ({ close }) => {
    const { s, f } = useStates();
    const target = s.admin?.resetPwdUser;
    const [nueva, setNueva] = useState('');
    const submit = (e) => {
        e?.preventDefault?.();
        f.users.resetPassword(target.id, nueva, () => close?.());
    };
    if (!target) return null;
    return (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p>Reiniciar contrasena de <strong>{target.username}</strong></p>
            <input type="password" placeholder="Nueva contrasena" value={nueva} onChange={e => setNueva(e.target.value)} required />
            <button type="submit" className="btn btn-primary">Reiniciar</button>
        </form>
    );
};


export const AdminUsers = () => {
    const { s, f } = useStates();
    const users = useMemo(() => s.admin?.users || [], [s.admin?.users]);

    useEffect(() => { f.users.list(); f.groups.list(); }, []);

    const abrirNuevo = () => {
        f.u1('admin', 'editUser', null);
        f.u2('modals', 'admin', 'userForm', true);
    };
    const abrirEditar = (u) => {
        f.u1('admin', 'editUser', u);
        f.u2('modals', 'admin', 'userForm', true);
    };
    const abrirReset = (u) => {
        f.u1('admin', 'resetPwdUser', u);
        f.u2('modals', 'admin', 'userReset', true);
    };
    const eliminar = (u) => {
        if (!confirm(`Desactivar usuario ${u.username}?`)) return;
        f.users.remove(u.id);
    };

    return (
        <div className={style.page}>
            <div className={style.head}>
                <h2>Usuarios</h2>
                <button type="button" className="btn btn-primary" onClick={abrirNuevo}>+ Nuevo</button>
            </div>
            <div className={style.list}>
                {users.map(u => (
                    <div key={u.id} className={style.row}>
                        <div className="name">{u.nombre || u.username} {u.is_admin && '👑'}</div>
                        <div className="meta">@{u.username} · {u.email || '—'}</div>
                        <div className="meta">
                            {u.activo ? 'activo' : 'inactivo'}
                            {u.last_login && ` · ult. login ${showDate(u.last_login)}`}
                        </div>
                        <div className="actions">
                            <button type="button" onClick={() => abrirEditar(u)}>Editar</button>
                            <button type="button" onClick={() => abrirReset(u)}>Reset pwd</button>
                            <button type="button" className="danger" onClick={() => eliminar(u)}>Desactivar</button>
                        </div>
                    </div>
                ))}
            </div>

            <GeneralModal lvl1="admin" lvl2="userForm" Component={FormContent} title="Usuario" size="md" />
            <GeneralModal lvl1="admin" lvl2="userReset" Component={ResetPwdContent} title="Reiniciar contrasena" size="sm" />
        </div>
    );
};
