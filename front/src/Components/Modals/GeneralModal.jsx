import { useEffect, useRef } from 'react';
import { useStates } from '../../Hooks/useStates';
import { useKeyDown } from '../../Hooks';
import styles from './styles/index.module.scss';

const GeneralModal = (props) => {
    const { s, f } = useStates();
    const { Component, lvl1, lvl2, size = 'sm', title, hideClose = false, closeOnOutside = true } = props;
    const open = !!s.modals?.[lvl1]?.[lvl2];
    const ref = useRef(null);
    const overlayRef = useRef(null);

    // ghost-click guard: ignora close por click-outside los primeros 300ms despues
    // de abrir. iOS/Android pueden disparar un mousedown sintetico en el overlay
    // que acabamos de montar, por el tap original que abrio este modal.
    const openedAtRef = useRef(0);
    // requiere que mousedown y mouseup ocurran ambos sobre el overlay para cerrar
    // (evita cierres por drag accidental desde dentro del container).
    const downOnOverlayRef = useRef(false);

    useEffect(() => {
        if (open) {
            openedAtRef.current = Date.now();
            downOnOverlayRef.current = false;
        }
    }, [open]);

    const close = () => {
        props.close?.();
        f.u2('modals', lvl1, lvl2, false);
    };

    useKeyDown(close, ['escape'], open);

    const onOverlayMouseDown = (e) => {
        downOnOverlayRef.current = (e.target === overlayRef.current);
    };
    const onOverlayMouseUp = (e) => {
        const downed = downOnOverlayRef.current;
        downOnOverlayRef.current = false;
        if (!closeOnOutside) return;
        // swallow ghost-click sintetico justo despues de abrir
        if (Date.now() - openedAtRef.current < 300) return;
        if (downed && e.target === overlayRef.current) close();
    };

    if (!open) return null;

    const sizeClass = {
        sm: '',
        md: styles.modal_w_md,
        lg: styles.modal_w_lg,
        xl: styles.modal_w_xl,
    }[size] || '';

    return (
        <div
            className={styles.modal_overlay}
            ref={overlayRef}
            onMouseDown={onOverlayMouseDown}
            onMouseUp={onOverlayMouseUp}
        >
            <div className={`${styles.modal_container} ${sizeClass}`} ref={ref}>
                {(title || !hideClose) && (
                    <div className={styles.modal_header}>
                        <h3>{title || ''}</h3>
                        {!hideClose && <button type="button" className={styles.close} onClick={close} aria-label="Cerrar">×</button>}
                    </div>
                )}
                <Component {...props} close={close} />
            </div>
        </div>
    );
};

export { GeneralModal };
