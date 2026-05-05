# InvHome - Front

Vite + React 19 + Tailwind + Sass.

## Scripts

```
pnpm install
pnpm run dev      # http://localhost:8373
pnpm run build    # genera dist/
```

## Backend

Espera el backend en `localhost:8373` (uvicorn). El proxy se hace via configuracion del axios baseURL en `src/Hooks/useStates/apps/base.jsx`.
