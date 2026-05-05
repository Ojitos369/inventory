import { useEffect, useState } from 'react';
import { useStates } from '../../Hooks/useStates';
import { ImageUploader } from '../ImageUploader';


/**
 * CategoriaForm: formulario controlado de categoria (sin modal envoltorio).
 * Reutilizado por Admin/Categorias y por inventario para crear in-line.
 *
 * Props:
 *   grupoId
 *   editando: categoria existente (o null)
 *   onSaved: (cat) => void
 *   compact: boolean — esconde campos avanzados (orden) cuando true
 */
export const CategoriaForm = ({ grupoId, editando, onSaved, compact = false }) => {
    const { f } = useStates();
    const [nombre, setNombre] = useState('');
    const [color, setColor] = useState('#34D399');
    const [icono, setIcono] = useState('');
    const [orden, setOrden] = useState(0);
    const [foto, setFoto] = useState('');

    useEffect(() => {
        setNombre(editando?.nombre || '');
        setColor(editando?.color || '#34D399');
        setIcono(editando?.icono || '');
        setOrden(editando?.orden ?? 0);
        setFoto(editando?.foto_url || '');
    }, [editando?.id]);

    const submit = (e) => {
        e?.preventDefault?.();
        f.catalog.saveCategoria(
            {
                id: editando?.id,
                grupo_id: grupoId,
                nombre: nombre.trim(),
                color,
                icono,
                orden: Number(orden || 0),
                foto_url: foto || null,
            },
            (resp) => onSaved?.(resp),
        );
    };

    return (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)' }}>Nombre</label>
                <input value={nombre} onChange={e => setNombre(e.target.value)} required autoFocus />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)' }}>Icono (emoji)</label>
                    <input value={icono} onChange={e => setIcono(e.target.value)} placeholder="🥫" />
                </div>
                <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)' }}>Color</label>
                    <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ height: 44 }} />
                </div>
            </div>
            {!compact && (
                <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)' }}>Orden</label>
                    <input type="number" value={orden} onChange={e => setOrden(e.target.value)} />
                </div>
            )}
            <ImageUploader
                value={foto}
                onChange={setFoto}
                folder="categorias"
                label="Imagen (opcional)"
            />
            <button type="submit" className="btn btn-primary">
                {editando ? 'Guardar' : 'Crear categoria'}
            </button>
        </form>
    );
};
