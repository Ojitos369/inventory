import { configureStore } from "@reduxjs/toolkit";
import { fsReducer } from "../Hooks/useStates/fs";

const store = configureStore({
    reducer: { fs: fsReducer },
});

export { store };
