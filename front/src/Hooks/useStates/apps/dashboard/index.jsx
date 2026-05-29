import { reportes as reportesMod } from './reportes';

export const dashboard = props => {
    const reportes = reportesMod(props);
    return { reportes };
};
