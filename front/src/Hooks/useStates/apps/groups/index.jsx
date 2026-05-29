import { crud as crudMod } from './crud';
import { members as membersMod } from './members';

export const groups = props => {
    const crud = crudMod(props);
    const members = membersMod(props);
    return { crud, members };
};
