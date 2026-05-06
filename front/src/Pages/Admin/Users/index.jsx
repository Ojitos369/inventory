import { localStates, localEffects } from './localStates';
import { Head } from './Components/Head';
import { UsersList } from './Components/UsersList';
import { UserFormModal } from './Components/UserFormModal';
import { ResetPwdModal } from './Components/ResetPwdModal';

export const AdminUsers = () => {
    const { style } = localStates();
    localEffects();
    return (
        <div className={style.page}>
            <Head />
            <UsersList />
            <UserFormModal />
            <ResetPwdModal />
        </div>
    );
};
