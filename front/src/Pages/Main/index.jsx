import { Outlet } from 'react-router-dom';
import { Header } from '../../Components/Header';
import { SideBar } from '../../Components/SideBar';
import { BottomNav } from '../../Components/BottomNav';
import { localStates, useInitGrupo } from './localStates';

export const Main = () => {
    const { style } = localStates();
    useInitGrupo();
    return (
        <div className={style.mainPage}>
            <Header />
            <div className={style.body}>
                <SideBar />
                <section className={style.contentContainer}>
                    <Outlet />
                </section>
            </div>
            <BottomNav />
        </div>
    );
};
