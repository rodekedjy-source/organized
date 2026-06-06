const NAV = [
  {
    group: 'Principal',
    items: [
      {
        id: 'overview', label: 'Overview',
        icon: <svg className="x-nav-icon" viewBox="0 0 15 15" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="9" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="1" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/></svg>,
      },
      {
        id: 'users', label: 'Workspaces',
        icon: <svg className="x-nav-icon" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M2 13c0-3.038 2.462-5.5 5.5-5.5S13 9.962 13 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
      },
      {
        id: 'revenue', label: 'Revenue',
        icon: <svg className="x-nav-icon" viewBox="0 0 15 15" fill="none"><path d="M1 11l3-3 3 3 3-5 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      },
    ],
  },
  {
    group: 'Launch',
    items: [
      {
        id: 'beta', label: 'Beta Testers',
        icon: <svg className="x-nav-icon" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.2"/><path d="M7.5 4v4l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
      },
    ],
  },
  {
    group: 'System',
    items: [
      {
        id: 'health', label: 'System Health',
        icon: <svg className="x-nav-icon" viewBox="0 0 15 15" fill="none"><rect x="1" y="3" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5 12v2M10 12v2M3 14h9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
      },
      {
        id: 'audit', label: 'Audit Trail',
        icon: <svg className="x-nav-icon" viewBox="0 0 15 15" fill="none"><path d="M1 4h13M1 7.5h13M1 11h13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
        badge: { label: 'live', type: 'gold' },
      },
    ],
  },
  {
    group: 'Custom',
    items: [
      {
        id: 'theme', label: 'Theme',
        icon: <svg className="x-nav-icon" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="3" stroke="currentColor" strokeWidth="1.2"/><path d="M7.5 1v2M7.5 12v2M1 7.5h2M12 7.5h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
      },
    ],
  },
  {
    group: 'Config',
    items: [
      {
        id: 'team', label: 'Team',
        icon: <svg className="x-nav-icon" viewBox="0 0 15 15" fill="none"><circle cx="5" cy="4" r="2" stroke="currentColor" strokeWidth="1.2"/><circle cx="10" cy="4" r="2" stroke="currentColor" strokeWidth="1.2"/><path d="M1 12c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M10 8c1.66 0 3 1.34 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
      },
    ],
  },
]

export default function AdminSidebar({ active, onSelect, userEmail, userName, userRole, mobileOpen }) {
  const initials = (userName || userEmail || 'A').charAt(0).toUpperCase()
  const displayName = userName || (userEmail ? userEmail.split('@')[0] : 'Admin')
  const roleLabel = { super_admin: 'Super Admin', co_founder: 'Co-Founder', team: 'Team' }[userRole] || 'Admin'

  return (
    <div className={`x-sidebar${mobileOpen ? ' mobile-open' : ''}`}>
      <div className="x-sb-logo">
        <div className="x-sb-brand">Organized.</div>
        <div className="x-sb-label">Founder Console</div>
      </div>

      <nav className="x-sb-nav">
        {NAV.map(({ group, items }) => (
          <div key={group}>
            <div className="x-nav-grp">{group}</div>
            {items.map(({ id, label, icon, badge }) => (
              <button
                key={id}
                className={`x-nav-item${active === id ? ' active' : ''}`}
                onClick={() => onSelect(id)}
              >
                {icon}
                {label}
                {badge && <span className={`x-nav-badge ${badge.type}`}>{badge.label}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="x-sb-foot">
        <div className="x-admin-pill">
          <div className="x-admin-av">{initials}</div>
          <div>
            <div className="x-admin-name">{displayName}</div>
            <div className="x-admin-role">{roleLabel}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
