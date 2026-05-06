import { useStates, createState } from '../../../../Hooks/useStates';
import { GeneralModal } from '../../../../Components/Modals/GeneralModal';
import { useEffect } from 'react';
import style from '../../styles.module.scss';

const FormContent = ({ close }) => {
    const { s, f } = useStates();
    const editando = s.admin?.editGroup;

    const [nombre, setNombre] = createState(['admin', 'groupForm', 'nombre'], '');
    const [descripcion, setDescripcion] = createState(['admin', 'groupForm', 'descripcion'], '');
    const [color, setColor] = createState(['admin', 'groupForm', 'color'], '#34D399');
    const [icono, setIcono] = createState(['admin', 'groupForm', 'icono'], '🏠');

    useEffect(() => {
        setNombre(editando?.nombre || '');
        setDescripcion(editando?.descripcion || '');
        setColor(editando?.color || '#34D399');
        setIcono(editando?.icono || '🏠');
    }, [editando?.id]);

    const submit = (e) => {
        e?.preventDefault?.();
        f.groups.crud.guardar(
            { id: editando?.id, nombre: (nombre || '').trim(), descripcion, color, icono },
            () => close?.(),
        );
    };

    return (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)' }}>Nombre</label>
                <input value={nombre} onChange={e => setNombre(e.target.value)} required autoFocus />
            </div>
            <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)' }}>Descripcion</label>
                <input value={descripcion} onChange={e => setDescripcion(e.target.value)} />
            </div>
            <div className={style.formRow}>
                <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)' }}>Icono (emoji)</label>
                    <input value={icono} onChange={e => setIcono(e.target.value)} />
                </div>
                <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--home-text-muted)' }}>Color</label>
                    <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ height: 44 }} />
                </div>
            </div>
            <button type="submit" className="btn btn-primary">{editando ? 'Guardar' : 'Crear grupo'}</button>
        </form>
    );
};

export const GroupFormModal = () => (
    <GeneralModal lvl1="admin" lvl2="groupForm" Component={FormContent} title="Grupo" size="sm" />
);
