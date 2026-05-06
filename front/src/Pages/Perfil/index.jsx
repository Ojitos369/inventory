import { localStates, localEffects } from './localStates';
import { DatosPersonales } from './Components/DatosPersonales';
import { CambiarPassword } from './Components/CambiarPassword';
import { MisGrupos } from './Components/MisGrupos';

export const Perfil = () => {
    const { style } = localStates();
    localEffects();
    return (
        <div className={style.page}>
            <h2 style={{ fontFamily: 'var(--home-font-display)', fontSize: '1.4rem' }}>Mi perfil</h2>
            <DatosPersonales />
            <CambiarPassword />
            <MisGrupos />
        </div>
    );
};
