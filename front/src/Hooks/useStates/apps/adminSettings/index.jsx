import { settings as settingsMod } from './settings';

export const adminSettings = props => {
    const settings = settingsMod(props);
    return { settings };
};
