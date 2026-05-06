import { localStates, localEffects } from './localStates';
import { HeaderRow } from './Components/HeaderRow';
import { Filters } from './Components/Filters';
import { PctChips } from './Components/PctChips';
import { ItemList } from './Components/ItemList';
import { MovimientoModal } from '../Inventario/Components/MovimientoModal';
import { ArticuloFormModal } from '../Inventario/Components/ArticuloFormModal';

export const ListaCompras = () => {
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
            <Filters />
            <PctChips />
            <ItemList />
            <ArticuloFormModal />
            <MovimientoModal />
        </div>
    );
};
