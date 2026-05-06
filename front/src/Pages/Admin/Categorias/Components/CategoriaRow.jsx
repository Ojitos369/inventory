import { localStates } from '../localStates';

export const CategoriaRow = ({ c }) => {
    const { style, f, abrirEditar, eliminar } = localStates();
    return (
        <div className={style.row} style={c.color ? { borderColor: c.color + '55' } : {}}>
            {c.foto_url && (
                <img
                    src={f.general.mediaUrl(c.foto_url)}
                    alt=""
                    style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 'var(--home-r-md)' }}
                />
            )}
            <div className="name">{c.icono ? `${c.icono} ` : ''}{c.nombre}</div>
            <div className="meta">orden: {c.orden}</div>
            <div className="actions">
                <button type="button" className="primary" onClick={() => abrirEditar(c)}>✏️ Editar</button>
                <button type="button" className="danger" onClick={() => eliminar(c)}>🗑️ Eliminar</button>
            </div>
        </div>
    );
};
