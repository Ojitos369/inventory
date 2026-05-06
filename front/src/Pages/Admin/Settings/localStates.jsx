import { useEffect } from 'react';
import { useStates, createState } from '../../../Hooks/useStates';
import style from '../styles.module.scss';

export const localStates = () => {
    const { s, f } = useStates();
    const data = s.adminSettings?.data;
    const provider = data?.provider || { vision: 'kimi', text: 'kimi' };
    const providers = data?.providers || [];
    const kimiModels = data?.kimi_models || [];
    const geminiModels = data?.gemini_models || [];

    const [pVision, setPVision] = createState(['adminSettings', 'pVision'], 'kimi');
    const [pText, setPText] = createState(['adminSettings', 'pText'], 'kimi');

    const guardarSeccion = (ns, payload, onOk) => {
        f.adminSettings.save({ [ns]: payload }, onOk);
    };

    const guardarProvider = () => {
        f.adminSettings.save({ provider: { vision: pVision, text: pText } });
    };

    const probar = (kind) => f.adminSettings.test(kind);

    return {
        style, f,
        data, provider, providers, kimiModels, geminiModels,
        pVision, setPVision, pText, setPText,
        guardarSeccion, guardarProvider, probar,
    };
};

export const localEffects = () => {
    const { f, provider, setPVision, setPText } = localStates();
    useEffect(() => { f.adminSettings.fetch(); }, []);
    useEffect(() => {
        setPVision(provider.vision || 'kimi');
        setPText(provider.text || 'kimi');
    }, [provider.vision, provider.text]);
};
