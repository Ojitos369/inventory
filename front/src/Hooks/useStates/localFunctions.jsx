import { useDispatch, useSelector } from "react-redux";
import { lf as lff } from "./fs";

const useLf = () => {
    const ls = useSelector(state => state.fs.ls);
    const d = useDispatch();

    const u0 = (f0, value) => d(lff.u0({ f0, value }));
    const u1 = (f0, f1, value) => d(lff.u1({ f0, f1, value }));

    return { u0, u1 };
};

export { useLf };
