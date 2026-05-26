export default function BackBar({ onBack, title }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 52,
      background: '#FAF7F2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      borderBottom: '1px solid rgba(0,0,0,.06)',
    }}>
      <button onClick={onBack} style={{
        position: 'absolute',
        left: 16,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        color: '#C9A84C',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: 15,
        fontWeight: 500,
        padding: '4px 0',
      }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          width={20} height={20} strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
        Back
      </button>
      <span style={{
        fontSize: 16,
        fontWeight: 600,
        color: '#1a1a1a',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        letterSpacing: '-.01em',
      }}>{title}</span>
    </div>
  )
}
