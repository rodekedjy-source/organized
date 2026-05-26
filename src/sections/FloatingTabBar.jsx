export default function FloatingTabBar({ activeTab, onTabChange, bookingBadge = 0, shopBadge = 0, learnBadge = 0 }) {
  const badgeMap = { booking: bookingBadge, shop: shopBadge, learn: learnBadge }
  const TABS = [
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
      background: 'var(--tab-bar-bg)',
      borderRadius: 24,
      boxShadow: 'var(--tab-bar-shadow)',
      display: 'flex',
      alignItems: 'center',
      padding: '6px 4px',
      zIndex: 100,
    }}>
      {TABS.map(tab => {
        const active = activeTab === tab.key
        const badge = badgeMap[tab.key] || 0
        return (
          <button key={tab.key} onClick={() => onTabChange(tab.key)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '7px 4px', background: 'none', border: 'none', cursor: 'pointer',
            color: active ? 'var(--accent-gold)' : 'var(--text-secondary)', borderRadius: 16, transition: 'color .15s',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          }}>
            <div style={{ position: 'relative' }}>
              {tab.icon(active)}
              {badge > 0 && (
                <div style={{
                  position: 'absolute', top: -2, right: -2,
                  width: 16, height: 16,
                  background: '#E53E3E', borderRadius: '50%',
                  fontSize: 10, color: '#fff', fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {badge > 9 ? '9+' : badge}
                </div>
              )}
            </div>
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, letterSpacing: '.02em' }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
