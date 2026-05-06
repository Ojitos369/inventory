export const DataField = ({ label, value }) => (
    <div style={{
        background: 'var(--home-bg-3)',
        borderRadius: 'var(--home-r-md)',
        padding: '8px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
    }}>
        <span style={{
            fontSize: '0.66rem',
            color: 'var(--home-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
        }}>{label}</span>
        <span style={{
            fontWeight: 700,
            fontSize: '0.92rem',
            fontFamily: 'var(--home-font-display)',
        }}>{value}</span>
    </div>
);
