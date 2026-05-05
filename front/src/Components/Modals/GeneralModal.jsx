import { useRef } from 'react';
import { useStates } from '../../Hooks/useStates';
import { useKeyDown, useClickOutside } from '../../Hooks';
import styles from './styles/index.module.scss';

const GeneralModal = (props) => {
    const { s, f } = useStates();
    const { Component, lvl1, lvl2, size = 'sm', title, hideClose = false } = props;
    const open = !!s.modals?.[lvl1]?.[lvl2];
    const ref = useRef(null);

    const close = () => {
        props.close?.();
        f.u2('modals', lvl1, lvl2, false);
    };

    useKeyDown(close, ['escape'], open);
    useClickOutside(ref, close, open);

    if (!open) return null;

    const sizeClass = {
        sm: '',
        md: styles.modal_w_md,
        lg: styles.modal_w_lg,
        xl: styles.modal_w_xl,
    }[size] || '';

    return (
        <div className={styles.modal_overlay}>
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
