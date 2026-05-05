import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useKeyDown } from '../../Hooks';
import style from './styles/index.module.scss';


/**
 * MenuBar: dropdown reutilizable anclado a un trigger.
 *
 * Uso:
 *   <MenuBar
 *      trigger={(open, toggle) => <button onClick={toggle}>...</button>}
 *      align="right"   // 'left' | 'right' | 'center'
 *      width={240}
 *   >
 *      {(close) => (<>
 *          <MenuBar.Item onClick={...}>Editar</MenuBar.Item>
 *          <MenuBar.Divider />
 *      </>)}
 *   </MenuBar>
 */
export const MenuBar = ({ trigger, children, align = 'right', width, header, offset = 8 }) => {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0, width: width || 240, openUp: false });
    const triggerRef = useRef(null);
    const popRef = useRef(null);

    const close = useCallback(() => setOpen(false), []);
    const toggle = useCallback(() => setOpen(o => !o), []);

    useKeyDown(close, ['escape'], open);

    useLayoutEffect(() => {
        if (!open || !triggerRef.current) return;
        const computePosition = () => {
            const rect = triggerRef.current.getBoundingClientRect();
            const w = width || Math.max(rect.width, 220);
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            // Estimar alto del popover si ya esta montado
            const popH = popRef.current?.offsetHeight || 280;
            const spaceBelow = vh - rect.bottom - 12;
            const openUp = spaceBelow < popH && rect.top > popH;
            const top = openUp ? Math.max(8, rect.top - popH - offset) : rect.bottom + offset;
            let left;
            if (align === 'left') left = rect.left;
            else if (align === 'center') left = rect.left + rect.width / 2 - w / 2;
            else left = rect.right - w;
            // clamp horizontal
            if (left + w > vw - 8) left = vw - w - 8;
            if (left < 8) left = 8;
            setPos({ top, left, width: w, openUp });
        };
        computePosition();
        // segunda pasada despues de medir altura real
        requestAnimationFrame(computePosition);
        window.addEventListener('resize', computePosition);
        window.addEventListener('scroll', computePosition, true);
        return () => {
            window.removeEventListener('resize', computePosition);
            window.removeEventListener('scroll', computePosition, true);
        };
    }, [open, align, width, offset]);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (popRef.current?.contains(e.target)) return;
            if (triggerRef.current?.contains(e.target)) return;
            close();
        };
        document.addEventListener('mousedown', handler);
        document.addEventListener('touchstart', handler);
        return () => {
            document.removeEventListener('mousedown', handler);
            document.removeEventListener('touchstart', handler);
        };
    }, [open, close]);

    return (
        <>
            <span ref={triggerRef} className={style.triggerWrap}>
                {trigger(open, toggle)}
            </span>
            {open && createPortal(
                <div
                    ref={popRef}
                    className={`${style.menu} ${pos.openUp ? style.openUp : ''}`}
                    style={{ top: pos.top, left: pos.left, width: pos.width }}
                    role="menu"
                >
                    {header && <div className={style.header}>{header}</div>}
                    <div className={style.body}>
                        {typeof children === 'function' ? children(close) : children}
                    </div>
                </div>,
                document.body,
            )}
        </>
    );
};

MenuBar.Item = ({ children, icon, onClick, danger = false, disabled = false, close, ...rest }) => {
    const handle = (e) => {
        if (disabled) return;
        onClick?.(e);
        close?.();
    };
    return (
        <button
            type="button"
            role="menuitem"
            className={`${style.item} ${danger ? style.danger : ''}`}
            onClick={handle}
            disabled={disabled}
            {...rest}
        >
            {icon !== undefined && <span className={style.icon}>{icon}</span>}
            <span className={style.label}>{children}</span>
        </button>
    );
};

MenuBar.Divider = () => <div className={style.divider} />;

MenuBar.Section = ({ title, children }) => (
    <div className={style.section}>
        {title && <div className={style.sectionTitle}>{title}</div>}
        {children}
    </div>
);
