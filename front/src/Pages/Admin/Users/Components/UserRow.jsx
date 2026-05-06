import { localStates } from '../localStates';
import { showDate } from '../../../../Core/helper';
import { MenuBar } from '../../../../Components/MenuBar';

export const UserRow = ({ u }) => {
    const { style, abrirEditar, abrirReset, eliminar } = localStates();
    return (
        <div className={style.row}>
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
    );
};
