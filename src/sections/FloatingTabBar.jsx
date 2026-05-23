export default function FloatingTabBar({ activeTab, onTabChange }) {
  const TABS = [
    {
      key: 'home', label: 'Home',
      icon: (a) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.6} width="22" height="22">
          <path d="M3 12L12 4l9 8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      key: 'booking', label: 'Booking',
      icon: (a) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.6} width="22" height="22">
          <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 9h18M8 2v4M16 2v4" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      key: 'shop', label: 'Shop',
      icon: (a) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.6} width="22" height="22">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 6h18M16 10a4 4 0 01-8 0" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      key: 'learn', label: 'Learn',
      icon: (a) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.6} width="22" height="22">
          <path d="M12 3L2 9l10 6 10-6-10-6z" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6 12.5V18c0 1.657 2.686 3 6 3s6-1.343 6-3v-5.5" strokeLinecap="round"/>
          <path d="M22 9v5" strokeLinecap="round"/>
        </svg>
      ),
    },
  ]

  return (
    <div style={{
      position: 'fixed',
      bottom: 16,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 32px)',
      maxWidth: 480,
      background: '#FAF7F2',
      borderRadius: 24,
      boxShadow: '0 4px 32px rgba(0,0,0,.13), 0 1px 4px rgba(0,0,0,.07)',
      border: '1px solid rgba(0,0,0,.06)',
      display: 'flex',
      alignItems: 'center',
      padding: '6px 4px',
      zIndex: 100,
    }}>
      {TABS.map(tab => {
        const active = activeTab === tab.key
        return (
          <button key={tab.key} onClick={() => onTabChange(tab.key)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '7px 4px', background: 'none', border: 'none', cursor: 'pointer',
            color: active ? '#C9A84C' : '#9E9894', borderRadius: 16, transition: 'color .15s',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          }}>
            {tab.icon(active)}
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, letterSpacing: '.02em' }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
