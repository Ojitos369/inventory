import { localStates } from '../localStates';
import { showDate } from '../../../Core/helper';

export const Head = () => {
    const { style, f, articulo } = localStates();
    if (!articulo) return null;
    return (
        <div className={style.head}>
            {articulo.foto_url && (
                <div className={style.fotoWrap}>
                    <img
                        src={f.general.mediaUrl(articulo.foto_url)}
                        alt=""
                        className={style.foto}
                    />
                </div>
            )}
            <h2>{articulo.nombre}</h2>
            <span className={style.meta}>
                {articulo.categoria_nombre || 'Sin categoria'} · actualizado {showDate(articulo.updated_at)}
            </span>
        </div>
    );
};
