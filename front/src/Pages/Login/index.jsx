import { localStates, localEffects } from './localStates';
import { LoginForm } from './Components/LoginForm';

export const Login = () => {
    const { style } = localStates();
    localEffects();
    return (
        <div className={style.loginPage}>
            <LoginForm />
        </div>
    );
};
