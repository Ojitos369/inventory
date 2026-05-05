import { createSlice } from "@reduxjs/toolkit";

const appName = "invhometka";

const fs = createSlice({
    name: "fs",
    initialState: {
        s: {},
        ls: localStorage.getItem(appName) ? JSON.parse(localStorage.getItem(appName)) : { theme: 'dark' },
    },
    reducers: {
        rs: (s) => { s.s = {}; },
        u0: (s, action) => {
            const { f0, value } = action.payload;
            s.s = { ...s.s, [f0]: value };
        },
        u1: (s, action) => {
            const { f0, f1, value } = action.payload;
            s.s = { ...s.s, [f0]: { ...(s.s?.[f0] || {}), [f1]: value } };
        },
        u2: (s, action) => {
            const { f0, f1, f2, value } = action.payload;
            s.s = {
                ...s.s,
                [f0]: {
                    ...(s.s?.[f0] || {}),
                    [f1]: { ...(s.s?.[f0]?.[f1] || {}), [f2]: value },
                },
            };
        },
        u3: (s, action) => {
            const { f0, f1, f2, f3, value } = action.payload;
            s.s = {
                ...s.s,
                [f0]: {
                    ...(s.s?.[f0] || {}),
                    [f1]: {
                        ...(s.s?.[f0]?.[f1] || {}),
                        [f2]: { ...(s.s?.[f0]?.[f1]?.[f2] || {}), [f3]: value },
                    },
                },
            };
        },
        u4: (s, action) => {
            const { f0, f1, f2, f3, f4, value } = action.payload;
            s.s = {
                ...s.s,
                [f0]: {
                    ...(s.s?.[f0] || {}),
                    [f1]: {
                        ...(s.s?.[f0]?.[f1] || {}),
                        [f2]: {
                            ...(s.s?.[f0]?.[f1]?.[f2] || {}),
                            [f3]: { ...(s.s?.[f0]?.[f1]?.[f2]?.[f3] || {}), [f4]: value },
                        },
                    },
                },
            };
        },
        lu0: (s, action) => {
            const { f0, value } = action.payload;
            s.ls = { ...s.ls, [f0]: value };
            localStorage.setItem(appName, JSON.stringify(s.ls));
        },
        lu1: (s, action) => {
            const { f0, f1, value } = action.payload;
            s.ls = { ...s.ls, [f0]: { ...(s.ls?.[f0] || {}), [f1]: value } };
            localStorage.setItem(appName, JSON.stringify(s.ls));
        },
    },
});

const { rs, u0, u1, u2, u3, u4, lu0, lu1 } = fs.actions;
const f = { rs, u0, u1, u2, u3, u4 };
const lf = { u0: lu0, u1: lu1 };
const fsReducer = fs.reducer;
export { f, lf, fsReducer };
