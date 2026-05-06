import { localStates, localEffects } from './localStates';
import { Head } from './Components/Head';
import { GroupsList } from './Components/GroupsList';
import { GroupFormModal } from './Components/GroupFormModal';
import { MembersModal } from './Components/MembersModal';

export const AdminGroups = () => {
    const { style } = localStates();
    localEffects();
    return (
        <div className={style.page}>
            <Head />
            <GroupsList />
            <GroupFormModal />
            <MembersModal />
        </div>
    );
};
