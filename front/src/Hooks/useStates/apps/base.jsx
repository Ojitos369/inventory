import { useDispatch, useSelector } from "react-redux";
import { f as ff } from "../fs";
import axios from "axios";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);
const host = window.location.hostname;
const protocol = window.location.protocol;
// Puertos donde el back sirve directo (local + docker). Cualquier otro puerto
// se asume Vite dev server -> redirige al back local 8373.
const BACK_PORTS = ['8373', '8378'];
const currentPort = window.location.port;
const port = currentPort
    ? (BACK_PORTS.includes(currentPort) ? `:${currentPort}` : ':8373')
    : '';
const link = `${protocol}//${host}${port}/api/`;
axios.defaults.withCredentials = true;
const miAxios = axios.create({ baseURL: link });

const pjid = "invhometka";

import { app as appMod } from "./app";
import { general as generalMod } from "./general";
import { auth as authMod } from "./auth";
import { catalog as catalogMod } from "./catalog";
import { groups as groupsMod } from "./groups";
import { users as usersMod } from "./users";
import { vision as visionMod } from "./vision";
import { dashboard as dashboardMod } from "./dashboard";
import { adminSettings as adminSettingsMod } from "./adminSettings";

const updates = () => {
    const d = useDispatch();
    const urs = () => d(ff.rs());
    const u0 = (f0, value) => d(ff.u0({ f0, value }));
    const u1 = (f0, f1, value) => d(ff.u1({ f0, f1, value }));
    const u2 = (f0, f1, f2, value) => d(ff.u2({ f0, f1, f2, value }));
    const u3 = (f0, f1, f2, f3, value) => d(ff.u3({ f0, f1, f2, f3, value }));
    const u4 = (f0, f1, f2, f3, f4, value) => d(ff.u4({ f0, f1, f2, f3, f4, value }));
    return { urs, u0, u1, u2, u3, u4 };
};


export const useBase = () => {
    const s = useSelector(state => state.fs.s);
    const updatesVars = updates();
    const { u0, u1, u2, u3, u4, urs } = updatesVars;
    const bases = { miAxios, MySwal, s, pjid };

    const general = generalMod({ ...bases, ...updatesVars });
    const app = appMod({ ...bases, ...updatesVars });
    const auth = authMod({ ...bases, ...updatesVars, general });
    const groups = groupsMod({ ...bases, ...updatesVars, general });
    const users = usersMod({ ...bases, ...updatesVars, general });
    const catalog = catalogMod({ ...bases, ...updatesVars, general });
    const vision = visionMod({ ...bases, ...updatesVars, general });
    const dashboard = dashboardMod({ ...bases, ...updatesVars, general });
    const adminSettings = adminSettingsMod({ ...bases, ...updatesVars, general });

    return {
        MySwal, miAxios,
        u0, u1, u2, u3, u4, urs,
        app, general, auth, groups, users, catalog, vision, dashboard, adminSettings,
    };
};
