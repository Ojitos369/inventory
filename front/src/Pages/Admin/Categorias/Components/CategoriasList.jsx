import { localStates } from '../localStates';
import { CategoriaRow } from './CategoriaRow';

export const CategoriasList = () => {
    const { style, categorias } = localStates();
    return (
        <div className={style.list}>
            {categorias.map(c => <CategoriaRow key={c.id} c={c} />)}
        </div>
    );
};
