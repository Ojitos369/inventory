import { localStates, localEffects } from './localStates';
import { Head } from './Components/Head';
import { ProviderActivo } from './Components/ProviderActivo';
import { ProviderSection } from './Components/ProviderSection';
import { CatalogoModelos } from './Components/CatalogoModelos';

export const AdminSettings = () => {
    const { style, data, kimiModels, geminiModels } = localStates();
    localEffects();
    return (
        <div className={style.page}>
            <Head />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 760 }}>
                <ProviderActivo />
                <ProviderSection
                    providerKey="kimi"
                    label="Kimi (Moonshot AI)"
                    modelos={kimiModels}
                    view={data?.kimi}
                />
                <ProviderSection
                    providerKey="gemini"
                    label="Google Gemini"
                    modelos={geminiModels}
                    view={data?.gemini}
                />
                <CatalogoModelos />
            </div>
        </div>
    );
};
