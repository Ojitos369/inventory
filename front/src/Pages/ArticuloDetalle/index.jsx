import { localStates, localEffects } from './localStates';
import { TopBar } from './Components/TopBar';
import { Head } from './Components/Head';
import { CantidadBig } from './Components/CantidadBig';
import { DataGrid } from './Components/DataGrid';
import { Descripcion } from './Components/Descripcion';
import { MovimientosList } from './Components/MovimientosList';
import { EliminarBtn } from './Components/EliminarBtn';
import { MovimientoModal } from '../Inventario/Components/MovimientoModal';
import { ArticuloFormModal } from '../Inventario/Components/ArticuloFormModal';

export const ArticuloDetalle = () => {
    const { style, articulo } = localStates();
    localEffects();

    if (!articulo) {
        return <div className={style.page}><p style={{ color: 'var(--home-text-muted)' }}>Cargando…</p></div>;
    }

    return (
        <div className={style.page}>
            <TopBar />
            <Head />
            <CantidadBig />
            <DataGrid />
            <Descripcion />
            <MovimientosList />
            <EliminarBtn />
            <MovimientoModal />
            <ArticuloFormModal />
        </div>
    );
};
