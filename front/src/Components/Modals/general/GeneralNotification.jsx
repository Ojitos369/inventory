import { useMemo } from 'react';
import { useStates } from '../../../Hooks/useStates';
import { GeneralModal } from '../GeneralModal';

const colors = {
    success: 'var(--home-success)',
    danger: 'var(--home-danger)',
    warning: 'var(--home-warning)',
    info: 'var(--home-info)',
};

const Content = (props) => {
    const { s } = useStates();
    const { color, title, message, messages, html } = useMemo(() => ({
        color: colors[s.general?.notification?.mode] || 'var(--home-text)',
        title: s.general?.notification?.title || '',
        message: s.general?.notification?.message || '',
        messages: s.general?.notification?.messages,
        html: s.general?.notification?.html,
    }), [s.general?.notification]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {!!title && <h3 style={{ fontWeight: 700 }}>{title}</h3>}
            {!!message && <p style={{ color: 'var(--home-text-soft)' }}>{message}</p>}
            {!!messages && messages.map((m, i) => (
                <p key={i} style={{ color: 'var(--home-text-soft)' }}>{m}</p>
            ))}
            {!!html && <div dangerouslySetInnerHTML={{ __html: html }} />}
            <button
                className="btn"
                style={{ background: color, color: '#0B0F14', border: 'none' }}
                onClick={props.close}
            >
                Cerrar
            </button>
        </div>
    );
};

const GeneralNotification = () => (
    <GeneralModal
        lvl1="general"
        lvl2="notification"
        Component={Content}
        size="sm"
        hideClose
    />
);

export { GeneralNotification };
