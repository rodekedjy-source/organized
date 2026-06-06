import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { KpiCard, SecHd, Card, InfoBanner, CenterSpinner, Toast, useToast, fmtDate } from '../AdminShared'

const GOAL = 15
const BETA_CUTOFF_DATE = '2026-07-01'

function BetaPill({ status }) {
  const map = { active: ['act', 'Active'], invited: ['inv', 'Invited'] }
  const [type, label] = map[status] || ['inn', status || '—']
  return <span className={`x-pill ${type}`}>{label}</span>
}

export default function AdminBeta() {
  const [betaUsers, setBetaUsers] = useState([])
  const [loading,   setLoading]   = useState(true)
  const { toastMsg, showToast } = useToast()

  useEffect(() => {
    async function load() {
      const { data } = await supabase.rpc('get_workspaces_admin')
      const all = data || []
      const beta = all
        .filter(w => w.created_at < BETA_CUTOFF_DATE)
        .map(w => ({
          ...w,
          status: (w.appointment_count ?? 0) >= 1 ? 'active' : 'invited',
        }))
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      setBetaUsers(beta)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <CenterSpinner />

  const active  = betaUsers.filter(u => u.status === 'active').length
  const invited = betaUsers.filter(u => u.status === 'invited').length
  const pct = Math.round((betaUsers.length / GOAL) * 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <InfoBanner id="beta" text="Comptes créés avant le lancement public (avant juillet 2026). Actif = au moins 1 rendez-vous. Invité = compte créé sans activité." />

      <div className="x-g4">
        <KpiCard label="Goal"      value={GOAL}            change="Beta testers"             changeType="nn" gold />
        <KpiCard label="Detected"  value={betaUsers.length} change={`${pct}% of goal`}       changeType={pct > 0 ? 'up' : 'nn'} />
        <KpiCard label="Active"    value={active}           change={active > 0 ? '↑ Using platform' : '— None yet'} changeType={active > 0 ? 'up' : 'nn'} />
        <KpiCard label="Invited"   value={invited}          change="Workspace — no bookings"  changeType="nn" />
      </div>

      <Card>
        <SecHd
          title="Beta Users — Auto-detected"
          right={
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--muted)' }}>
              Created before {BETA_CUTOFF_DATE}
            </div>
          }
        />

        {/* Progress bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--muted)' }}>Progress</span>
            <span style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--gold)' }}>{betaUsers.length}/{GOAL}</span>
          </div>
          <div style={{ height: 4, background: 'var(--border2)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: 'var(--gold)', borderRadius: 2, transition: 'width 0.6s ease' }} />
          </div>
        </div>

        <table className="x-tbl">
          <thead>
            <tr>
              <th>Workspace</th>
              <th>Slug</th>
              <th>Appts</th>
              <th>Status</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {betaUsers.length === 0 && (
              <tr>
                <td colSpan={6} style={{ color: 'var(--muted)', fontFamily: 'DM Mono,monospace', fontSize: 10, paddingTop: 16 }}>
                  No workspaces created before {BETA_CUTOFF_DATE}
                </td>
              </tr>
            )}
            {betaUsers.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ fontSize: 11.5, fontWeight: 500 }}>{u.name || '—'}</div>
                  {u.email && <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--muted)' }}>{u.email}</div>}
                </td>
                <td style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--muted)' }}>
                  {u.slug ? `@${u.slug}` : '—'}
                </td>
                <td style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: u.appointment_count > 0 ? 'var(--green)' : 'var(--muted)' }}>
                  {u.appointment_count ?? 0}
                </td>
                <td><BetaPill status={u.status} /></td>
                <td style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--muted)' }}>{fmtDate(u.created_at)}</td>
                <td>
                  {u.email && (
                    <button className="x-btn-ghost" onClick={() => window.open(`mailto:${u.email}`, '_blank')}>
                      Contact
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {betaUsers.length < GOAL && (
              <tr>
                <td colSpan={6} style={{ color: 'var(--muted)', fontFamily: 'DM Mono,monospace', fontSize: 10, paddingTop: 12, fontStyle: 'italic' }}>
                  {GOAL - betaUsers.length} more beta users needed before {BETA_CUTOFF_DATE}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Card>
        <div className="x-sec-title" style={{ marginBottom: 14 }}>DM Template — Copy &amp; Send</div>
        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 8, padding: 14, fontSize: 12, lineHeight: 1.7, color: 'var(--muted2)' }}>
          "Hey <strong style={{ color: 'var(--white)' }}>[First name]</strong> 👋 — I saw you manage your bookings by DM. I'm building a free tool made for independent <strong style={{ color: 'var(--white)' }}>[nail techs / stylists]</strong> to simplify that. I'm looking for 10 people to test it before public launch. Would you be interested in early access?"
        </div>
        <button className="x-btn-ghost" style={{ marginTop: 12 }} onClick={() => showToast('Copied to clipboard!')}>📋 Copy template</button>
      </Card>

      <Toast msg={toastMsg} />
    </div>
  )
}
