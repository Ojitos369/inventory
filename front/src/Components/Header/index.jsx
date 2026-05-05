import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStates } from '../../Hooks/useStates';
import { GeneralModal } from '../Modals/GeneralModal';
import style from './styles/index.module.scss';


const GroupSwitcherContent = ({ close }) => {
    const { s, f, lf } = useStates();
    const grupos = useMemo(() => s.usuario?.grupos || [], [s.usuario?.grupos]);
    const grupoId = useMemo(() => s.app?.grupoActual, [s.app?.grupoActual]);

    const seleccionar = (g) => {
        f.u1('app', 'grupoActual', g.id);
        f.u1('app', 'grupoActualData', g);
        lf.u0('grupoActual', g.id);
        close?.();
    };

    if (!grupos.length) {
        return <p style={{ color: 'var(--home-text-muted)' }}>No perteneces a ningun grupo. Pide a un admin que te agregue.</p>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {grupos.map(g => (
                <button
                    key={g.id}
                    type="button"
                    className={`${style.groupItem} ${g.id === grupoId ? style.selected : ''}`}
                    onClick={() => seleccionar(g)}
                >
                    <span className={style.name}>{g.icono ? `${g.icono} ` : ''}{g.nombre}</span>
                    <span className={style.meta}>Rol: {g.rol}</span>
                </button>
            ))}
        </div>
    );
};

const UserMenuContent = ({ close }) => {
    const { s, f } = useStates();
    const navigate = useNavigate();
    const u = s.usuario?.data || {};
    const isAdmin = !!u.is_admin;

    const ir = (to) => { navigate(to); close?.(); };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--home-border)' }}>
                <div style={{ fontWeight: 700 }}>{u.nombre || u.username}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--home-text-muted)' }}>{u.email || ''}</div>
            </div>
            <button className={style.menuItem} onClick={() => ir('/perfil')}>👤 Mi perfil</button>
            {isAdmin && <button className={style.menuItem} onClick={() => ir('/admin/usuarios')}>👥 Admin usuarios</button>}
            {isAdmin && <button className={style.menuItem} onClick={() => ir('/admin/grupos')}>🏷️ Admin grupos</button>}
            {isAdmin && <button className={style.menuItem} onClick={() => ir('/admin/categorias')}>🗂️ Admin categorias</button>}
            <button className={`${style.menuItem} ${style.danger}`} onClick={() => { f.auth.closeSession(); close?.(); }}>
                ⏏️ Cerrar sesion
            </button>
        </div>
    );
};


export const Header = () => {
    const { s, f } = useStates();
    const grupoActualData = useMemo(() => s.app?.grupoActualData, [s.app?.grupoActualData]);
    const u = s.usuario?.data || {};
    const inicial = (u.nombre || u.username || '?')[0];

    return (
        <header className={style.headerContent}>
            <Link to="/" className={style.brand} aria-label="Inicio">
                <span className={style.dot}></span>
                <span className={style.brandText}>InvHome</span>
            </Link>
            <div className={style.right}>
                <button
                    type="button"
                    className={style.groupBtn}
                    onClick={() => f.u2('modals', 'header', 'grupos', true)}
                    title={grupoActualData?.nombre || 'Grupo'}
                >
                    <span>{grupoActualData?.icono || '🏷️'}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {grupoActualData?.nombre || 'Sin grupo'}
                    </span>
                    <span className={style.swap}>▾</span>
                </button>
                <button
                    type="button"
                    className={style.userBtn}
                    onClick={() => f.u2('modals', 'header', 'user', true)}
                    aria-label="Menu usuario"
                >
                    {inicial}
                </button>
            </div>

            <GeneralModal
                lvl1="header"
                lvl2="grupos"
                Component={GroupSwitcherContent}
                title="Selecciona grupo"
                size="sm"
            />
            <GeneralModal
                lvl1="header"
                lvl2="user"
                Component={UserMenuContent}
                title=""
                size="sm"
            />
        </header>
    );
};
