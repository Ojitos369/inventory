import { Outlet } from 'react-router-dom';
import { SideBar } from '../../../Components/SideBar';
import { localStates } from '../localStates';

export const Body = () => {
    const { style } = localStates();
    return (
        <div className={style.body}>
            <SideBar />
            <section className={style.contentContainer}>
                <Outlet />
            </section>
        </div>
    );
};
