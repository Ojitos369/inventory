import { useEffect, useMemo, useRef } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';

import { Main as MainPage } from '../Pages/Main';
import { Login as LoginPage } from '../Pages/Login';
import { Dashboard as DashboardPage } from '../Pages/Dashboard';
import { Inventario as InventarioPage } from '../Pages/Inventario';
import { ArticuloDetalle as ArticuloDetallePage } from '../Pages/ArticuloDetalle';
import { ConteoFoto as ConteoFotoPage } from '../Pages/ConteoFoto';
import { Perfil as PerfilPage } from '../Pages/Perfil';
import { AdminUsers as AdminUsersPage } from '../Pages/Admin/Users';
import { AdminGroups as AdminGroupsPage } from '../Pages/Admin/Groups';
import { AdminCategorias as AdminCategoriasPage } from '../Pages/Admin/Categorias';
import { P404 } from '../Pages/P404';

import { store } from './store';
import { Provider } from "react-redux";
import { useStates } from '../Hooks/useStates';
import { GeneralNotification } from '../Components/Modals/general/GeneralNotification';


function AppUI() {
    const { s, f } = useStates();
    const location = useLocation();
    const logged = useMemo(() => s.auth?.logged, [s.auth?.logged]);
    const isAdmin = useMemo(() => s.usuario?.data?.is_admin, [s.usuario?.data?.is_admin]);
    const validatedRef = useRef(false);

    useEffect(() => { f.app.getModes(); }, []);

    useEffect(() => {
        if (!validatedRef.current || s.auth?.logged) {
            validatedRef.current = true;
            f.auth.validateLogin();
        }
    }, [location.pathname]);

    useEffect(() => {
        if (logged) f.users.me();
    }, [logged]);

    if (!logged) {
        return (
            <>
                <LoginPage />
                {!!s.modals?.general?.notification && <GeneralNotification />}
            </>
        );
    }

    return (
        <>
            <Routes>
                <Route path="" element={<MainPage />} >
                    <Route path="" element={<DashboardPage />} />
                    <Route path="inventario" element={<InventarioPage />} />
                    <Route path="articulo/:id" element={<ArticuloDetallePage />} />
                    <Route path="conteo" element={<ConteoFotoPage />} />
                    <Route path="perfil" element={<PerfilPage />} />
                    {isAdmin && (
                        <>
                            <Route path="admin/usuarios" element={<AdminUsersPage />} />
                            <Route path="admin/grupos" element={<AdminGroupsPage />} />
                            <Route path="admin/categorias" element={<AdminCategoriasPage />} />
                        </>
                    )}
                    <Route path="*" element={<P404 />} />
                </Route>
            </Routes>
            {!!s.modals?.general?.notification && <GeneralNotification />}
        </>
    );
}

function App() {
    return (
        <Provider store={store}>
            <AppUI />
        </Provider>
    );
}

export default App;
