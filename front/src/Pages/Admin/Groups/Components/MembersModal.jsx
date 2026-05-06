import { useEffect } from 'react';
import { useStates } from '../../../../Hooks/useStates';
import { GeneralModal } from '../../../../Components/Modals/GeneralModal';

const MembersContent = () => {
    const { s, f } = useStates();
    const grupo = s.admin?.editGroupMembers;
    const miembros = s.groups?.miembros?.[grupo?.id] || [];
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
                    <div
                        key={m.id}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 10,
                            background: 'var(--home-bg-3)',
                            borderRadius: 'var(--home-r-md)',
                        }}
                    >
                        <div>
                            <div style={{ fontWeight: 600 }}>{m.nombre || m.username}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)' }}>@{m.username} · {m.rol}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <select
                                value={m.rol}
                                onChange={e => f.groups.addMember(grupo.id, m.id, e.target.value)}
                                style={{ padding: 4, fontSize: '0.8rem', width: 'auto' }}
                            >
                                <option value="admin">admin</option>
                                <option value="member">member</option>
                                <option value="viewer">viewer</option>
                            </select>
                            <button
                                type="button"
                                className="btn btn-ghost"
                                style={{ minHeight: 32, padding: '2px 8px', fontSize: '0.8rem' }}
                                onClick={() => f.groups.removeMember(grupo.id, m.id)}
                            >×</button>
                        </div>
                    </div>
                ))}
            </div>
            {noMiembros.length > 0 && (
                <>
                    <h4 style={{
                        marginTop: 8,
                        fontSize: '0.85rem',
                        color: 'var(--home-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                    }}>Agregar</h4>
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

export const MembersModal = () => (
    <GeneralModal lvl1="admin" lvl2="groupMembers" Component={MembersContent} title="Miembros" size="md" />
);
