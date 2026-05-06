import { localStates, localEffects } from './localStates';
import { DropZone } from './Components/DropZone';
import { PreviewBlock } from './Components/PreviewBlock';

export const ConteoFoto = () => {
    const { style, grupoId, preview } = localStates();
    localEffects();

    if (!grupoId) {
        return (
            <div className={style.page}>
                <p style={{ color: 'var(--home-text-muted)' }}>Selecciona un grupo primero.</p>
            </div>
        );
    }

    return (
        <div className={style.page}>
            <h2 style={{ fontFamily: 'var(--home-font-display)', fontSize: '1.4rem' }}>Conteo por foto</h2>
            <p style={{ color: 'var(--home-text-muted)', fontSize: '0.9rem' }}>
                Toma una foto o sube una imagen y la IA listara los objetos para que confirmes.
            </p>

            {!preview && <DropZone />}
            {preview && <PreviewBlock />}
        </div>
    );
};
