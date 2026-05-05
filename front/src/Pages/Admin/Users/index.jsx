import { useEffect, useMemo, useState } from 'react';
import { useStates } from '../../../Hooks/useStates';
import { GeneralModal } from '../../../Components/Modals/GeneralModal';
import { MenuBar } from '../../../Components/MenuBar';
import { showDate } from '../../../Core/helper';
import style from '../styles.module.scss';


const ROLES = ['admin', 'member', 'viewer'];


const FormContent = ({ close }) => {
    const { s, f } = useStates();
    const editando = s.admin?.editUser;
    const grupos = s.groups?.lista || [];
    const userGruposActuales = useMemo(
        () => (editando ? (s.admin?.userGrupos?.[editando.id] || []) : []),
        [s.admin?.userGrupos, editando?.id],
    );

    const [username, setUsername] = useState(editando?.username || '');
    const [nombre, setNombre] = useState(editando?.nombre || '');
    const [email, setEmail] = useState(editando?.email || '');
    const [passwd, setPasswd] = useState('');
    const [isAdmin, setIsAdmin] = useState(!!editando?.is_admin);
    const [activo, setActivo] = useState(editando?.activo ?? true);
    // map grupo_id -> rol ('' = no asignado)
    const [gruposMap, setGruposMap] = useState({});

    useEffect(() => {
        if (editando) {
            f.users.getGrupos(editando.id);
        }
    }, [editando?.id]);

    useEffect(() => {
        if (editando && userGruposActuales.length >= 0) {
            const m = {};
            userGruposActuales.forEach(g => { m[g.id] = g.rol; });
            setGruposMap(m);
        }
    }, [userGruposActuales]);

    const toggleGrupo = (gid, checked) => {
        setGruposMap(prev => {
            const next = { ...prev };
            if (checked) next[gid] = next[gid] || 'member';
            else delete next[gid];
            return next;
        });
    };
    const setRol = (gid, rol) => {
        setGruposMap(prev => ({ ...prev, [gid]: rol }));
    };

    const submit = (e) => {
        e?.preventDefault?.();
        const seleccionados = Object.entries(gruposMap).map(([grupo_id, rol]) => ({ grupo_id, rol }));
        if (editando) {
            f.users.update({ id: editando.id, nombre, email, is_admin: isAdmin, activo }, () => {
                f.users.setGrupos(editando.id, seleccionados, () => close?.());
            });
        } else {
            f.users.create(
                { username: username.trim(), passwd, nombre, email, is_admin: isAdmin, grupos: seleccionados.map(g => g.grupo_id) },
                () => close?.(),
            );
        }
    };

    return (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
                <label className={style.lbl}>Usuario</label>
                <input value={username} onChange={e => setUsername(e.target.value.toLowerCase())} disabled={!!editando} required />
            </div>
            {!editando && (
                <div>
                    <label className={style.lbl}>Contrasena inicial</label>
                    <input type="password" value={passwd} onChange={e => setPasswd(e.target.value)} required />
                </div>
            )}
            <div className={style.formRow}>
                <div>
                    <label className={style.lbl}>Nombre</label>
                    <input value={nombre} onChange={e => setNombre(e.target.value)} />
                </div>
                <div>
                    <label className={style.lbl}>Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
            </div>

            <div className={style.toggleRow}>
                <label className={style.toggleLabel}>
                    <input type="checkbox" checked={isAdmin} onChange={e => setIsAdmin(e.target.checked)} />
                    <span>Administrador global</span>
                </label>
                {editando && (
                    <label className={style.toggleLabel}>
                        <input type="checkbox" checked={activo} onChange={e => setActivo(e.target.checked)} />
                        <span>Activo</span>
                    </label>
                )}
            </div>

            {grupos.length > 0 && (
                <div>
                    <label className={style.lbl}>Grupos asignados</label>
                    <div className={style.gruposList}>
                        {grupos.map(g => {
                            const checked = gruposMap[g.id] !== undefined;
                            return (
                                <div key={g.id} className={`${style.grupoItem} ${checked ? style.on : ''}`}>
                                    <label className={style.grupoCheck}>
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={e => toggleGrupo(g.id, e.target.checked)}
                                        />
                                        <span>{g.icono ? `${g.icono} ` : ''}{g.nombre}</span>
                                    </label>
                                    {checked && (
                                        <select
                                            value={gruposMap[g.id]}
                                            onChange={e => setRol(g.id, e.target.value)}
                                            className={style.rolSel}
                                        >
                                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    )}
                                </div>
                            );
                        })}
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
                            <button type="button" className="primary" onClick={() => abrirEditar(u)}>
                                ✏️ Editar
                            </button>
                            <MenuBar
                                align="right"
                                width={200}
                                trigger={(open, toggle) => (
                                    <button
                                        type="button"
                                        className={`kebab ${open ? 'primary' : ''}`}
                                        onClick={toggle}
                                        aria-label="Mas acciones"
                                    >⋯</button>
                                )}
                            >
                                <MenuBar.Item icon="🔑" onClick={() => abrirReset(u)}>Reset contrasena</MenuBar.Item>
                                <MenuBar.Divider />
                                <MenuBar.Item icon="🚫" danger onClick={() => eliminar(u)}>
                                    {u.activo ? 'Desactivar' : 'Reactivar'}
                                </MenuBar.Item>
                            </MenuBar>
                        </div>
                    </div>
                ))}
            </div>

            <GeneralModal lvl1="admin" lvl2="userForm" Component={FormContent} title="Usuario" size="md" />
            <GeneralModal lvl1="admin" lvl2="userReset" Component={ResetPwdContent} title="Reiniciar contrasena" size="sm" />
        </div>
    );
};
