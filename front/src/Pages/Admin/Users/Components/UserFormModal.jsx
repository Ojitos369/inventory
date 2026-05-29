import { useEffect, useMemo } from 'react';
import { useStates, createState } from '../../../../Hooks/useStates';
import { GeneralModal } from '../../../../Components/Modals/GeneralModal';
import { ROLES } from '../localStates';
import style from '../../styles.module.scss';

const FormContent = ({ close }) => {
    const { s, f } = useStates();
    const editando = s.admin?.editUser;
    const grupos = s.groups?.lista || [];
    const userGruposActuales = useMemo(
        () => (editando ? (s.admin?.userGrupos?.[editando.id] || []) : []),
        [s.admin?.userGrupos, editando?.id],
    );

    const [username, setUsername] = createState(['admin', 'userForm', 'username'], '');
    const [nombre, setNombre] = createState(['admin', 'userForm', 'nombre'], '');
    const [email, setEmail] = createState(['admin', 'userForm', 'email'], '');
    const [passwd, setPasswd] = createState(['admin', 'userForm', 'passwd'], '');
    const [nuevaPasswd, setNuevaPasswd] = createState(['admin', 'userForm', 'nuevaPasswd'], '');
    const [isAdmin, setIsAdmin] = createState(['admin', 'userForm', 'isAdmin'], false);
    const [activo, setActivo] = createState(['admin', 'userForm', 'activo'], true);
    const [gruposMap, setGruposMap] = createState(['admin', 'userForm', 'gruposMap'], {});

    useEffect(() => {
        setUsername(editando?.username || '');
        setNombre(editando?.nombre || '');
        setEmail(editando?.email || '');
        setPasswd('');
        setNuevaPasswd('');
        setIsAdmin(!!editando?.is_admin);
        setActivo(editando?.activo ?? true);
        if (editando) f.users.crud.getGrupos(editando.id);
        else setGruposMap({});
    }, [editando?.id]);

    useEffect(() => {
        if (editando && userGruposActuales.length >= 0) {
            const m = {};
            userGruposActuales.forEach(g => { m[g.id] = g.rol; });
            setGruposMap(m);
        }
    }, [userGruposActuales]);

    const toggleGrupo = (gid, checked) => {
        const next = { ...(gruposMap || {}) };
        if (checked) next[gid] = next[gid] || 'member';
        else delete next[gid];
        setGruposMap(next);
    };
    const setRol = (gid, rol) => setGruposMap({ ...(gruposMap || {}), [gid]: rol });

    const submit = (e) => {
        e?.preventDefault?.();
        const seleccionados = Object.entries(gruposMap || {}).map(([grupo_id, rol]) => ({ grupo_id, rol }));
        if (editando) {
            const afterUpdate = () => {
                const afterGrupos = () => close?.();
                if (nuevaPasswd && nuevaPasswd.length >= 4) {
                    f.users.resetPassword(editando.id, nuevaPasswd, () => {
                        f.users.setGrupos(editando.id, seleccionados, afterGrupos);
                    });
                } else {
                    f.users.setGrupos(editando.id, seleccionados, afterGrupos);
                }
            };
            f.users.update({ id: editando.id, nombre, email, is_admin: isAdmin, activo }, afterUpdate);
        } else {
            f.users.crud.crear(
                { username: (username || '').trim(), passwd, nombre, email, is_admin: isAdmin, grupos: seleccionados.map(g => g.grupo_id) },
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
            {editando && (
                <div>
                    <label className={style.lbl}>Nueva contrasena <span style={{ fontWeight: 400, opacity: 0.6 }}>(dejar vacio para no cambiar)</span></label>
                    <input
                        type="password"
                        placeholder="Min. 4 caracteres"
                        value={nuevaPasswd}
                        onChange={e => setNuevaPasswd(e.target.value)}
                        minLength={4}
                        autoComplete="new-password"
                    />
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
                            const checked = (gruposMap || {})[g.id] !== undefined;
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
                                            value={(gruposMap || {})[g.id]}
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

export const UserFormModal = () => (
    <GeneralModal lvl1="admin" lvl2="userForm" Component={FormContent} title="Usuario" size="md" />
);
