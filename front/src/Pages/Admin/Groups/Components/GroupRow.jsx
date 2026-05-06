import { localStates } from '../localStates';
import { MenuBar } from '../../../../Components/MenuBar';

export const GroupRow = ({ g }) => {
    const { style, abrirEditar, abrirMiembros, eliminar } = localStates();
    return (
        <div className={style.row}>
            <div className="name">{g.icono ? `${g.icono} ` : ''}{g.nombre}</div>
            {g.descripcion && <div className="meta">{g.descripcion}</div>}
            <div className="meta">{g.miembros} miembros · {g.articulos} articulos</div>
            <div className="actions">
                <button type="button" className="primary" onClick={() => abrirEditar(g)}>✏️ Editar</button>
                <button type="button" onClick={() => abrirMiembros(g)}>👥 Miembros</button>
                <MenuBar
                    align="right"
                    width={200}
                    trigger={(open, toggle) => (
                        <button type="button" className={`kebab ${open ? 'primary' : ''}`} onClick={toggle} aria-label="Mas">⋯</button>
                    )}
                >
                    <MenuBar.Item icon="🚫" danger onClick={() => eliminar(g)}>Desactivar</MenuBar.Item>
                </MenuBar>
            </div>
        </div>
    );
};
