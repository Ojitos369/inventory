import { localStates } from '../localStates';
import { ItemsHeader } from './ItemsHeader';
import { ItemsList } from './ItemsList';
import { ActionsBar } from './ActionsBar';

export const PreviewBlock = () => {
    const { style, preview, items, loadingAnalyze, cancelar } = localStates();

    return (
        <>
            <img src={preview} alt="captura" className={style.preview} />
            {loadingAnalyze && <p style={{ color: 'var(--home-text-muted)' }}>Analizando imagen...</p>}

            {!loadingAnalyze && items.length > 0 && (
                <>
                    <ItemsHeader />
                    <ItemsList />
                    <ActionsBar />
                </>
            )}

            {!loadingAnalyze && items.length === 0 && (
                <>
                    <p style={{ color: 'var(--home-text-muted)' }}>No se detectaron items.</p>
                    <button type="button" className="btn btn-ghost" onClick={cancelar}>Reintentar</button>
                </>
            )}
        </>
    );
};
