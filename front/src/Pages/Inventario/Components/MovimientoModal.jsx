import { useState, useEffect } from 'react';
import { useStates } from '../../../Hooks/useStates';
import { GeneralModal } from '../../../Components/Modals/GeneralModal';
import { showNumber } from '../../../Core/helper';

const Content = ({ close }) => {
    const { s, f } = useStates();
    const articulo = s.catalog?.movArticulo;
    const tipo = s.catalog?.movTipo || 'agregar';
    const [cantidad, setCantidad] = useState(() => {
        const sug = articulo?.cantidadSugerida;
        return sug != null && Number(sug) > 0 ? String(sug) : '1';
    });
    const [comentario, setComentario] = useState('');

    useEffect(() => {
        const sug = articulo?.cantidadSugerida;
        if (sug != null && Number(sug) > 0) setCantidad(String(sug));
    }, [articulo?.id, articulo?.cantidadSugerida]);

    if (!articulo) return null;

    const submit = (e) => {
        e?.preventDefault?.();
        const num = parseFloat(cantidad);
        if (isNaN(num) || num < 0) return;
        f.catalog.movimiento(
            { articulo_id: articulo.id, tipo, cantidad: num, comentario },
            () => {
                close?.();
                f.catalog.listArticulos({ grupo_id: articulo.grupo_id });
                // refresca lista de compras tambien (si la vista esta abierta usa el dato)
                f.catalog.listShopping({ grupo_id: articulo.grupo_id, solo_faltantes: '1' });
            },
        );
    };

    const titulos = { agregar: 'Agregar al stock', descontar: 'Descontar del stock', reajustar: 'Reajustar cantidad total' };
    const ayuda = {
        agregar: `Suma a la cantidad actual (${showNumber(articulo.cantidad, 2)}).`,
        descontar: `Resta de la cantidad actual (${showNumber(articulo.cantidad, 2)}).`,
        reajustar: `Reemplaza la cantidad actual por el valor nuevo.`,
    };

    return (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{ fontFamily: 'var(--home-font-display)', fontSize: '1.1rem' }}>{titulos[tipo]}</h3>
            <div style={{ color: 'var(--home-text-muted)', fontSize: '0.85rem' }}>{ayuda[tipo]}</div>
            <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--home-text-muted)', marginBottom: 6 }}>
                    Cantidad ({articulo.unidad})
                </label>
                <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="0"
                    value={cantidad}
                    onChange={e => setCantidad(e.target.value)}
                    autoFocus
                    required
                />
            </div>
            <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--home-text-muted)', marginBottom: 6 }}>
                    Comentario (opcional)
                </label>
                <input value={comentario} onChange={e => setComentario(e.target.value)} placeholder="Ej. compra de mercado" />
            </div>
            <button type="submit" className="btn btn-primary">Confirmar</button>
        </form>
    );
};

export const MovimientoModal = () => (
    <GeneralModal lvl1="catalog" lvl2="movModal" Component={Content} title="Movimiento" size="sm" />
);
