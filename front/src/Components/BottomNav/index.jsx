import { NavLink } from 'react-router-dom';
import style from './styles.module.scss';
import { pages } from '../../Core/helper';

export const BottomNav = () => (
    <nav className={style.bottomNav} aria-label="Navegacion principal">
        {pages.map(p => (
            <NavLink
                key={p.menu_name}
                to={p.to}
                end={p.to === '/'}
                className={({ isActive }) => `${style.item} ${isActive ? style.active : ''}`}
            >
                <span className={style.icon}>{p.icon}</span>
                <span>{p.name}</span>
            </NavLink>
        ))}
    </nav>
);
