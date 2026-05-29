import { captura as capturaMod } from './captura';

export const vision = props => {
    const captura = capturaMod(props);
    return { captura };
};
