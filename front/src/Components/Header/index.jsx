import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStates } from '../../Hooks/useStates';
import { MenuBar } from '../MenuBar';
import style from './styles/index.module.scss';


const GroupSwitcher = () => {
    const { s, f, lf } = useStates();
    const grupos = useMemo(() => s.usuario?.grupos || [], [s.usuario?.grupos]);
    const grupoId = useMemo(() => s.app?.grupoActual, [s.app?.grupoActual]);
    const grupoActualData = useMemo(() => s.app?.grupoActualData, [s.app?.grupoActualData]);

    const seleccionar = (g) => {
        f.u1('app', 'grupoActual', g.id);
        f.u1('app', 'grupoActualData', g);
        lf.u0('grupoActual', g.id);
    };

    return (
        <MenuBar
            align="right"
            width={260}
            header={<div className={style.menuTitle}>Selecciona grupo</div>}
            trigger={(open, toggle) => (
                <button
                    type="button"
                    className={`${style.groupBtn} ${open ? style.active : ''}`}
                    onClick={toggle}
                    title={grupoActualData?.nombre || 'Grupo'}
                >
                    <span>{grupoActualData?.icono || '🏷️'}</span>
                    <span className={style.groupName}>{grupoActualData?.nombre || 'Sin grupo'}</span>
                    <span className={style.swap}>▾</span>
                </button>
            )}
        >
            {(close) => (
                grupos.length === 0 ? (
                    <div className={style.empty}>No perteneces a ningun grupo. Pide a un admin que te agregue.</div>
                ) : (
                    grupos.map(g => (
                        <button
                            key={g.id}
                            type="button"
                            className={`${style.groupItem} ${g.id === grupoId ? style.selected : ''}`}
                            onClick={() => { seleccionar(g); close(); }}
                        >
                            <span className={style.gIcon}>{g.icono || '🏷️'}</span>
                            <span className={style.gInfo}>
                                <span className={style.gName}>{g.nombre}</span>
                                <span className={style.gMeta}>Rol: {g.rol}</span>
                            </span>
                            {g.id === grupoId && <span className={style.gCheck}>✓</span>}
                        </button>
                    ))
                )
            )}
        </MenuBar>
    );
};

const UserMenu = () => {
    const { s, f } = useStates();
    const navigate = useNavigate();
    const u = s.usuario?.data || {};
    const isAdmin = !!u.is_admin;
    const inicial = (u.nombre || u.username || '?')[0];

    return (
        <MenuBar
            align="right"
            width={240}
            header={(
                <div>
                    <div className={style.userName}>{u.nombre || u.username}</div>
                    {u.email && <div className={style.userEmail}>{u.email}</div>}
                </div>
            )}
            trigger={(open, toggle) => (
                <button
                    type="button"
                    className={`${style.userBtn} ${open ? style.active : ''}`}
                    onClick={toggle}
                    aria-label="Menu usuario"
                >
                    {inicial}
                </button>
            )}
        >
            <MenuBar.Item icon="👤" onClick={() => navigate('/perfil')}>Mi perfil</MenuBar.Item>
            {isAdmin && (
                <>
                    <MenuBar.Divider />
                    <MenuBar.Section title="Administracion">
                        <MenuBar.Item icon="👥" onClick={() => navigate('/admin/usuarios')}>Usuarios</MenuBar.Item>
                        <MenuBar.Item icon="🏷️" onClick={() => navigate('/admin/grupos')}>Grupos</MenuBar.Item>
                        <MenuBar.Item icon="🗂️" onClick={() => navigate('/admin/categorias')}>Categorias</MenuBar.Item>
                        <MenuBar.Item icon="⚙️" onClick={() => navigate('/admin/ajustes')}>Ajustes</MenuBar.Item>
                    </MenuBar.Section>
                </>
            )}
            <MenuBar.Divider />
            <MenuBar.Item icon="⏏️" danger onClick={() => f.auth.closeSession()}>Cerrar sesion</MenuBar.Item>
        </MenuBar>
    );
};


export const Header = () => {
    return (
        <header className={style.headerContent}>
            <Link to="/" className={style.brand} aria-label="Inicio">
                <span className={style.dot}></span>
                <span className={style.brandText}>InvHome</span>
            </Link>
            <div className={style.right}>
                <GroupSwitcher />
                <UserMenu />
            </div>
        </header>
    );
};
