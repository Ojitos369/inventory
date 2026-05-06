import { Header } from '../../Components/Header';
import { BottomNav } from '../../Components/BottomNav';
import { Body } from './Components/Body';
import { localStates, localEffects } from './localStates';

export const Main = () => {
    const { style } = localStates();
    localEffects();
    return (
        <div className={style.mainPage}>
            <Header />
            <Body />
            <BottomNav />
        </div>
    );
};
