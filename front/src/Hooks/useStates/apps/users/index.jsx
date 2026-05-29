import { me as meMod } from './me';
import { crud as crudMod } from './crud';

export const users = props => {
    const me = meMod(props);
    const crud = crudMod(props);
    return { me, crud };
};
