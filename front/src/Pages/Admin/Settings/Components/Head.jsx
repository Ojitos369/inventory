import { localStates } from '../localStates';

export const Head = () => {
    const { style } = localStates();
    return (
        <div className={style.head}>
            <h2>Ajustes</h2>
        </div>
    );
};
