import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-font-smoothing: antialiased; }

  .adm-page { font-family: 'DM Sans', sans-serif; background: #0f0e0c; min-height: 100vh; color: #f0ece4; }

  .adm-nav {
    height: 58px; display: flex; align-items: center; justify-content: space-between;
    padding: 0 2rem; border-bottom: 1px solid rgba(255,255,255,.07);
    position: sticky; top: 0; z-index: 50;
    background: rgba(15,14,12,.95); backdrop-filter: blur(16px);
  }
  .adm-nav-left { display: flex; align-items: center; gap: .6rem; }
  .adm-nav-logo { font-family: 'Playfair Display', serif; font-size: 1.1rem; color: #f0ece4; letter-spacing: -.01em; }
  .adm-nav-logo span { color: #b5893a; }
  .adm-badge {
    font-size: .58rem; font-weight: 500; letter-spacing: .1em; text-transform: uppercase;
    background: rgba(181,137,58,.12); border: 1px solid rgba(181,137,58,.22);
    color: #b5893a; padding: .18rem .5rem; border-radius: 20px;
  }
  .adm-nav-right { display: flex; align-items: center; gap: 1rem; }
  .adm-refresh {
    font-size: .72rem; color: rgba(240,236,228,.3); cursor: pointer;
    background: none; border: none; font-family: inherit; transition: color .2s;
    display: flex; align-items: center; gap: .35rem;
  }
  .adm-refresh:hover { color: rgba(240,236,228,.65); }
  .adm-refresh svg { width: 13px; height: 13px; }
  .adm-refresh.spinning svg { animation: adm-spin .7s linear infinite; }
  .adm-back {
    font-size: .7rem; color: rgba(240,236,228,.25); cursor: pointer;
    background: none; border: none; font-family: inherit;
    transition: color .2s; letter-spacing: .04em; text-transform: uppercase;
  }
  .adm-back:hover { color: rgba(240,236,228,.55); }

  .adm-body { max-width: 1100px; margin: 0 auto; padding: 2.5rem 2rem 5rem; }

  .adm-header { margin-bottom: 2.5rem; }
  .adm-header-tag { font-size: .63rem; letter-spacing: .12em; text-transform: uppercase; color: #b5893a; font-weight: 500; margin-bottom: .5rem; }
  .adm-header h1 { font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 500; letter-spacing: -.02em; }
  .adm-header-sub { font-size: .78rem; color: rgba(240,236,228,.25); margin-top: .35rem; font-weight: 300; }

  /* METRICS */
  .adm-metrics {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(175px, 1fr));
    gap: 1px; background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.06); border-radius: 12px; overflow: hidden;
    margin-bottom: 2rem;
  }
  .adm-metric { background: #161512; padding: 1.4rem 1.3rem; position: relative; }
  .adm-metric-dot { position: absolute; top: 1.1rem; right: 1.1rem; width: 5px; height: 5px; background: #b5893a; border-radius: 50%; opacity: .45; }
  .adm-metric-label { font-size: .63rem; letter-spacing: .08em; text-transform: uppercase; color: rgba(240,236,228,.28); font-weight: 500; margin-bottom: .55rem; }
  .adm-metric-val { font-size: 1.9rem; font-weight: 300; color: #f0ece4; line-height: 1; letter-spacing: -.03em; font-family: 'Playfair Display', serif; }
  .adm-metric-val.gold { color: #b5893a; }
  .adm-metric-sub { font-size: .63rem; color: rgba(240,236,228,.18); margin-top: .4rem; font-weight: 300; }

  /* TABLES */
  .adm-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
  .adm-card { background: #161512; border: 1px solid rgba(255,255,255,.06); border-radius: 10px; overflow: hidden; }
  .adm-card-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1rem 1.2rem; border-bottom: 1px solid rgba(255,255,255,.05);
  }
  .adm-card-title { font-size: .65rem; letter-spacing: .1em; text-transform: uppercase; color: rgba(240,236,228,.35); font-weight: 500; }
  .adm-card-count { font-size: .62rem; color: rgba(240,236,228,.18); }

  table { width: 100%; border-collapse: collapse; }
  th { font-size: .6rem; letter-spacing: .07em; text-transform: uppercase; color: rgba(240,236,228,.2); font-weight: 500; padding: .55rem 1.2rem; text-align: left; border-bottom: 1px solid rgba(255,255,255,.04); }
  td { font-size: .76rem; color: rgba(240,236,228,.6); padding: .6rem 1.2rem; border-bottom: 1px solid rgba(255,255,255,.03); font-weight: 300; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(255,255,255,.02); }
  td strong { color: #f0ece4; font-weight: 400; }

  .pill {
    display: inline-block; font-size: .58rem; font-weight: 500; letter-spacing: .06em;
    text-transform: uppercase; padding: .18rem .48rem; border-radius: 20px;
  }
  .pill-captured { background: rgba(74,222,128,.1); color: #4ade80; border: 1px solid rgba(74,222,128,.18); }
  .pill-hold { background: rgba(96,165,250,.1); color: #60a5fa; border: 1px solid rgba(96,165,250,.18); }
  .pill-pending { background: rgba(250,204,21,.1); color: #facc15; border: 1px solid rgba(250,204,21,.18); }
  .pill-none { background: rgba(255,255,255,.04); color: rgba(240,236,228,.22); border: 1px solid rgba(255,255,255,.06); }
  .pill-super { background: rgba(181,137,58,.12); color: #b5893a; border: 1px solid rgba(181,137,58,.2); }
  .pill-co { background: rgba(167,139,250,.1); color: #a78bfa; border: 1px solid rgba(167,139,250,.18); }
  .pill-team { background: rgba(255,255,255,.05); color: rgba(240,236,228,.3); border: 1px solid rgba(255,255,255,.07); }

  .adm-empty { text-align: center; color: rgba(240,236,228,.15); padding: 2rem; font-size: .75rem; }

  /* LOADING */
  .adm-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 65vh; gap: 1rem; }
  .adm-spinner { width: 26px; height: 26px; border: 2px solid rgba(181,137,58,.18); border-top-color: #b5893a; border-radius: 50%; animation: adm-spin .8s linear infinite; }
  .adm-loading-text { font-size: .75rem; color: rgba(240,236,228,.22); font-weight: 300; letter-spacing: .04em; }

  @keyframes adm-spin { to { transform: rotate(360deg); } }

  .adm-updated { text-align: center; font-size: .62rem; color: rgba(240,236,228,.12); margin-top: 2.5rem; letter-spacing: .04em; }

  @media(max-width: 720px) {
    .adm-two-col { grid-template-columns: 1fr; }
    .adm-metrics { grid-template-columns: repeat(2, 1fr); }
    .adm-metric-val { font-size: 1.55rem; }
  }
`

const fmt = n => (n == null ? '—' : Number(n).toLocaleString())
const fmtMoney = n => (!n ? '$0' : new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(n))
const timeAgo = ts => {
  if (!ts) return '—'
  const m = Math.floor((Date.now() - new Date(ts)) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function PaymentPill({ status }) {
  const map = { captured: 'captured', authorized: 'hold', pending: 'pending' }
  const cls = map[status] || 'none'
  return <span className={`pill pill-${cls}`}>{status || 'none'}</span>
}

function RolePill({ role }) {
  const map = { super_admin: ['super', 'Founder'], co_founder: ['co', 'Co-Founder'], team: ['team', 'Team'] }
  const [cls, label] = map[role] || ['team', role]
  return <span className={`pill pill-${cls}`}>{label}</span>
}

export default function AdminPanel({ session }) {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchMetrics = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const { data: { session: s } } = await supabase.auth.getSession()
      if (!s) { navigate('/dashboard', { replace: true }); return }

      const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-metrics`, {
        headers: {
          'Authorization': `Bearer ${s.access_token}`,
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
        },
      })

      // Non-admin → silent redirect, no error shown
      if (res.status === 401 || res.status === 403) {
        navigate('/dashboard', { replace: true })
        return
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setData(await res.json())
    } catch {
      navigate('/dashboard', { replace: true })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [navigate])

  useEffect(() => { fetchMetrics() }, [fetchMetrics])
  useEffect(() => {
    const id = setInterval(() => fetchMetrics(true), 60000)
    return () => clearInterval(id)
  }, [fetchMetrics])

  return (
    <>
      <style>{css}</style>
      <div className="adm-page">

        <nav className="adm-nav">
          <div className="adm-nav-left">
            <div className="adm-nav-logo">Organized<span>.</span></div>
            <span className="adm-badge">Founder Console</span>
          </div>
          <div className="adm-nav-right">
            {!loading && data && (
              <button className={`adm-refresh${refreshing ? ' spinning' : ''}`} onClick={() => fetchMetrics(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                  <path d="M21 3v5h-5"/>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                  <path d="M8 16H3v5"/>
                </svg>
                Refresh
              </button>
            )}
            <button className="adm-back" onClick={() => navigate('/dashboard')}>← Dashboard</button>
          </div>
        </nav>

        <div className="adm-body">

          {loading && (
            <div className="adm-loading">
              <div className="adm-spinner"/>
              <div className="adm-loading-text">Loading...</div>
            </div>
          )}

          {!loading && data && (() => {
            const m = data.metrics || {}
            const proRate = m.total_workspaces > 0 ? Math.round((m.pro_subscribers / m.total_workspaces) * 100) : 0

            return (
              <>
                <div className="adm-header">
                  <div className="adm-header-tag">Founder Console</div>
                  <h1>Platform Overview</h1>
                  <div className="adm-header-sub">Auto-refreshes every 60s · {m.computed_at ? new Date(m.computed_at).toLocaleTimeString() : '—'}</div>
                </div>

                {/* METRICS */}
                <div className="adm-metrics">
                  {[
                    { label: 'Workspaces', val: fmt(m.total_workspaces), sub: `+${fmt(m.new_workspaces_7d)} this week` },
                    { label: 'Total Users', val: fmt(m.total_users), sub: 'Registered accounts' },
                    { label: 'Pro Subscribers', val: fmt(m.pro_subscribers), sub: `${proRate}% conversion`, gold: true },
                    { label: 'Active Subs', val: fmt(m.active_subscriptions), sub: 'Active or trialing' },
                    { label: 'Bookings Today', val: fmt(m.bookings_today), sub: `${fmt(m.bookings_last_7d)} this week` },
                    { label: 'Bookings 30d', val: fmt(m.bookings_last_30d), sub: 'Last 30 days' },
                    { label: 'Revenue 30d', val: fmtMoney(m.revenue_last_30d), sub: 'Captured deposits', gold: true },
                    { label: 'Revenue Total', val: fmtMoney(m.revenue_total), sub: 'All time captured', gold: true },
                  ].map((item, i) => (
                    <div key={i} className="adm-metric">
                      <div className="adm-metric-dot"/>
                      <div className="adm-metric-label">{item.label}</div>
                      <div className={`adm-metric-val${item.gold ? ' gold' : ''}`}>{item.val}</div>
                      <div className="adm-metric-sub">{item.sub}</div>
                    </div>
                  ))}
                </div>

                {/* TABLES */}
                <div className="adm-two-col">

                  {/* RECENT WORKSPACES */}
                  <div className="adm-card">
                    <div className="adm-card-head">
                      <span className="adm-card-title">Recent Workspaces</span>
                      <span className="adm-card-count">{(data.recent_workspaces || []).length} shown</span>
                    </div>
                    <table>
                      <thead><tr><th>Name</th><th>Handle</th><th>Joined</th></tr></thead>
                      <tbody>
                        {(data.recent_workspaces || []).map(w => (
                          <tr key={w.id}>
                            <td><strong>{w.name || '—'}</strong></td>
                            <td style={{ color: 'rgba(181,137,58,.65)', fontFamily: 'monospace', fontSize: '.7rem' }}>{w.handle || '—'}</td>
                            <td>{timeAgo(w.created_at)}</td>
                          </tr>
                        ))}
                        {!(data.recent_workspaces || []).length && <tr><td colSpan={3} className="adm-empty">No workspaces yet</td></tr>}
                      </tbody>
                    </table>
                  </div>

                  {/* RECENT BOOKINGS */}
                  <div className="adm-card">
                    <div className="adm-card-head">
                      <span className="adm-card-title">Recent Bookings</span>
                      <span className="adm-card-count">{(data.recent_bookings || []).length} shown</span>
                    </div>
                    <table>
                      <thead><tr><th>Client</th><th>Deposit</th><th>Status</th><th>When</th></tr></thead>
                      <tbody>
                        {(data.recent_bookings || []).map(b => (
                          <tr key={b.id}>
                            <td><strong>{b.client_name || '—'}</strong></td>
                            <td style={{ color: b.deposit_amount ? '#b5893a' : 'rgba(240,236,228,.2)' }}>
                              {b.deposit_amount ? fmtMoney(b.deposit_amount) : '—'}
                            </td>
                            <td><PaymentPill status={b.payment_status}/></td>
                            <td>{timeAgo(b.created_at)}</td>
                          </tr>
                        ))}
                        {!(data.recent_bookings || []).length && <tr><td colSpan={4} className="adm-empty">No bookings yet</td></tr>}
                      </tbody>
                    </table>
                  </div>

                </div>

                {/* ADMIN USERS */}
                <div className="adm-card" style={{ marginBottom: '2rem' }}>
                  <div className="adm-card-head">
                    <span className="adm-card-title">Console Access</span>
                    <span className="adm-card-count">{(data.admin_users || []).length} members</span>
                  </div>
                  <table>
                    <thead><tr><th>Name / Email</th><th>Role</th><th>Since</th></tr></thead>
                    <tbody>
                      {(data.admin_users || []).map(u => (
                        <tr key={u.user_id}>
                          <td><strong>{u.name || u.email || '—'}</strong></td>
                          <td><RolePill role={u.role}/></td>
                          <td>{timeAgo(u.created_at)}</td>
                        </tr>
                      ))}
                      {!(data.admin_users || []).length && <tr><td colSpan={3} className="adm-empty">No team members</td></tr>}
                    </tbody>
                  </table>
                </div>

                <div className="adm-updated">
                  beorganized.io/x · Founder Console · Not linked anywhere in the UI
                </div>
              </>
            )
          })()}

        </div>
      </div>
    </>
  )
}
