import { localStates } from '../localStates';
import { GroupRow } from './GroupRow';

export const GroupsList = () => {
    const { style, grupos } = localStates();
    return (
        <div className={style.list}>
            {grupos.map(g => <GroupRow key={g.id} g={g} />)}
        </div>
    );
};
