import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ADMIN_CSS } from '../components/admin/AdminShared'
import AdminAuth from '../components/admin/AdminAuth'
import AdminSidebar from '../components/admin/AdminSidebar'
import AdminOverview from '../components/admin/sections/AdminOverview'
import AdminUsers    from '../components/admin/sections/AdminUsers'
import AdminRevenue  from '../components/admin/sections/AdminRevenue'
import AdminBeta     from '../components/admin/sections/AdminBeta'
import AdminHealth   from '../components/admin/sections/AdminHealth'
import AdminAudit    from '../components/admin/sections/AdminAudit'
import AdminTheme    from '../components/admin/sections/AdminTheme'
import AdminTeam     from '../components/admin/sections/AdminTeam'
import { useAdminAuth } from '../hooks/useAdminAuth'

const SECTION_TITLES = {
  overview: 'Overview',
  users:    'Workspaces',
  revenue:  'Revenue',
  beta:     'Beta Testers',
  health:   'System Health',
  audit:    'Audit Trail',
  theme:    'Theme',
  team:     'Team',
}

function useClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const days = ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const h = String(time.getHours()).padStart(2, '0')
  const m = String(time.getMinutes()).padStart(2, '0')
  return `${days[time.getDay()]} ${time.getDate()} ${months[time.getMonth()]} ${time.getFullYear()} · ${h}:${m}`
}

function ConsoleSections({ section, onNavigate, role }) {
  switch (section) {
    case 'overview': return <AdminOverview onNavigate={onNavigate} />
    case 'users':    return <AdminUsers    onNavigate={onNavigate} role={role} />
    case 'revenue':  return <AdminRevenue />
    case 'beta':     return <AdminBeta />
    case 'health':   return <AdminHealth  onNavigate={onNavigate} />
    case 'audit':    return <AdminAudit />
    case 'theme':    return <AdminTheme />
    case 'team':     return <AdminTeam />
    default:         return <AdminOverview onNavigate={onNavigate} />
  }
}

function ConsoleShell() {
  const [section, setSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const { user, role } = useAdminAuth()
  const clock = useClock()

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/', { replace: true })
  }

  function handleSelect(id) {
    setSection(id)
    setSidebarOpen(false)
  }

  function closeSidebar() {
    setSidebarOpen(false)
  }

  // Lock body scroll when mobile sidebar is open (same as Dashboard)
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap'
    document.head.appendChild(link)
    return () => { if (document.head.contains(link)) document.head.removeChild(link) }
  }, [])

  return (
    <>
      <style>{ADMIN_CSS}</style>
      <div className="x-wrap">
        {sidebarOpen && <div className="x-sb-overlay" onClick={closeSidebar} />}

        <AdminSidebar
          active={section}
          onSelect={handleSelect}
          userEmail={user?.email}
          userRole={role}
          mobileOpen={sidebarOpen}
        />

        <div className="x-main">
          <header className="x-topbar">
            <button className="x-hamburger" onClick={() => setSidebarOpen(v => !v)} aria-label="Open menu">
              <span className="x-hamburger-bar" />
              <span className="x-hamburger-bar" />
              <span className="x-hamburger-bar" />
            </button>
            <div className="x-page-title">{SECTION_TITLES[section] || 'Console'}</div>
            <div className="x-live-dot" />
            <div className="x-live-lbl">Live</div>
            <div className="x-sep" />
            <div className="x-topbar-date">{clock}</div>
            <div className="x-topbar-r">
              <button className="x-topbar-btn" onClick={() => navigate('/dashboard')}>← Dashboard</button>
              <button className="x-topbar-btn" onClick={handleSignOut}>Sign out</button>
            </div>
          </header>

          <div className="x-content">
            <ConsoleSections section={section} onNavigate={setSection} role={role} />
          </div>
        </div>
      </div>
    </>
  )
}

export default function AdminConsole() {
  return (
    <AdminAuth>
      <ConsoleShell />
    </AdminAuth>
  )
}
