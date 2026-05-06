import { localStates } from '../localStates';
import { UserRow } from './UserRow';

export const UsersList = () => {
    const { style, users } = localStates();
    return (
        <div className={style.list}>
            {users.map(u => <UserRow key={u.id} u={u} />)}
        </div>
    );
};
