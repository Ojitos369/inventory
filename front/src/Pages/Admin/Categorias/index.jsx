import { localStates, localEffects } from './localStates';
import { Head } from './Components/Head';
import { CategoriasList } from './Components/CategoriasList';
import { CatFormModal } from './Components/CatFormModal';

export const AdminCategorias = () => {
    const { style, grupoId } = localStates();
    localEffects();

    if (!grupoId) {
        return <div className={style.page}><p style={{ color: 'var(--home-text-muted)' }}>Selecciona un grupo primero.</p></div>;
    }

    return (
        <div className={style.page}>
            <Head />
            <CategoriasList />
            <CatFormModal />
        </div>
    );
};
