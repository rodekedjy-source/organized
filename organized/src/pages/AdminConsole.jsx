import { useState } from 'react'
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
  overview: 'Platform Overview',
  users:    'Workspaces',
  revenue:  'Revenue',
  beta:     'Beta Testers',
  health:   'System Health',
  audit:    'Audit Log',
  theme:    'Theme & Settings',
  team:     'Console Team',
}

function ConsoleSections({ section }) {
  switch (section) {
    case 'overview': return <AdminOverview />
    case 'users':    return <AdminUsers />
    case 'revenue':  return <AdminRevenue />
    case 'beta':     return <AdminBeta />
    case 'health':   return <AdminHealth />
    case 'audit':    return <AdminAudit />
    case 'theme':    return <AdminTheme />
    case 'team':     return <AdminTeam />
    default:         return <AdminOverview />
  }
}

function ConsoleShell() {
  const [section, setSection] = useState('overview')
  const navigate = useNavigate()
  const { user } = useAdminAuth()

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/', { replace: true })
  }

  return (
    <>
      <style>{ADMIN_CSS}</style>
      <div className="x-wrap">
        <AdminSidebar
          active={section}
          onSelect={setSection}
          userEmail={user?.email}
        />

        <div className="x-main">
          <header className="x-topbar">
            <span className="x-topbar-title">
              Organized · {SECTION_TITLES[section] || 'Console'}
            </span>
            <div className="x-topbar-r">
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  fontSize: '.68rem', color: 'rgba(240,236,228,.28)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', letterSpacing: '.04em', textTransform: 'uppercase',
                }}
              >
                ← Dashboard
              </button>
              <button
                onClick={handleSignOut}
                style={{
                  fontSize: '.68rem', color: 'rgba(240,236,228,.18)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', letterSpacing: '.04em', textTransform: 'uppercase',
                }}
              >
                Sign out
              </button>
            </div>
          </header>

          <div className="x-content">
            <ConsoleSections section={section} />
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
