import { NavLink } from 'react-router-dom';
import { useStates } from '../../Hooks/useStates';
import { pages, adminPages } from '../../Core/helper';
import style from './styles/index.module.scss';

export const SideBar = () => {
    const { s } = useStates();
    const isAdmin = s.usuario?.data?.is_admin;
    return (
        <aside className={style.sideBarContent}>
            <div className={style.section}>Principal</div>
            {pages.map(p => (
                <NavLink
                    key={p.menu_name}
                    to={p.to}
                    end={p.to === '/'}
                    className={({ isActive }) => `${style.link} ${isActive ? style.active : ''}`}
                >
                    <span className={style.icon}>{p.icon}</span>
                    {p.name}
                </NavLink>
            ))}
            {isAdmin && (
                <>
                    <div className={style.section}>Admin</div>
                    {adminPages.map(p => (
                        <NavLink
                            key={p.menu_name}
                            to={p.to}
                            className={({ isActive }) => `${style.link} ${isActive ? style.active : ''}`}
                        >
                            <span className={style.icon}>{p.icon}</span>
                            {p.name}
                        </NavLink>
                    ))}
                </>
            )}
        </aside>
    );
};
