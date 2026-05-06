import { localStates, localEffects } from './localStates';
import { HeaderRow } from './Components/HeaderRow';
import { Toolbar } from './Components/Toolbar';
import { ArticulosList } from './Components/ArticulosList';
import { Fab } from './Components/Fab';
import { MovimientoModal } from './Components/MovimientoModal';
import { ArticuloFormModal } from './Components/ArticuloFormModal';
import { CategoriasManagerModal } from './Components/CategoriasManagerModal';

export const Inventario = () => {
    const { style, grupoId } = localStates();
    localEffects();

    if (!grupoId) {
        return (
            <div className={style.page}>
                <p style={{ color: 'var(--home-text-muted)' }}>Selecciona un grupo desde el menu superior.</p>
            </div>
        );
    }

    return (
        <div className={style.page}>
            <HeaderRow />
            <Toolbar />
            <ArticulosList />
            <Fab />
            <MovimientoModal />
            <ArticuloFormModal />
            <CategoriasManagerModal />
        </div>
    );
};
