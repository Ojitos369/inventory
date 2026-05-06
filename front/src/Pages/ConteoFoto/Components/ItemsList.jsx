import { localStates } from '../localStates';
import { ItemCard } from './ItemCard';

export const ItemsList = () => {
    const { style, items } = localStates();

    return (
        <div className={style.itemList}>
            {items.map((it, i) => <ItemCard key={i} item={it} idx={i} />)}
        </div>
    );
};
