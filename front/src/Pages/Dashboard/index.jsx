import { localStates, localEffects } from './localStates';
import { Heading } from './Components/Heading';
import { Kpis } from './Components/Kpis';
import { PorCategoria } from './Components/PorCategoria';
import { BajosList } from './Components/BajosList';
import { MovimientosRecientes } from './Components/MovimientosRecientes';

export const Dashboard = () => {
    const { style, grupoId, loading } = localStates();
    localEffects();

    if (!grupoId) {
        return (
            <div className={style.page}>
                <p className={style.empty}>Selecciona un grupo desde el menu superior para ver el dashboard.</p>
            </div>
        );
    }

    return (
        <div className={style.page}>
            <Heading />
            <Kpis />
            <PorCategoria />
            <BajosList />
            <MovimientosRecientes />
            {loading && <p className={style.empty}>Cargando…</p>}
        </div>
    );
};
