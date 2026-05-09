import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { KpiCard, SecHd, Card, CenterSpinner, fmtDate } from '../AdminShared'

function DetailPanel({ ws }) {
  return (
    <tr>
      <td colSpan={6} style={{ padding: '0 0 8px' }}>
        <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: 16, border: '1px solid var(--border2)' }}>
          {!ws.is_published && (
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: 'var(--amber)', marginBottom: 10 }}>
              ⚠ Inactive workspace
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="x-btn-ghost">📧 Contact</button>
            {ws.slug && (
              <button className="x-btn-ghost" onClick={() => window.open(`/${ws.slug}`, '_blank')}>🔗 View page</button>
            )}
          </div>
        </div>
      </td>
    </tr>
  )
}

export default function AdminUsers() {
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.rpc('get_workspaces_admin')
      setWorkspaces(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <CenterSpinner />

  const active = workspaces.filter(w => w.is_published).length
  const inactive = workspaces.length - active

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="x-g4">
        <KpiCard label="Total Workspaces" value={workspaces.length} change="— Pre-beta" changeType="nn" />
        <KpiCard label="Active" value={active} change={active > 0 ? `${Math.round(active / Math.max(workspaces.length, 1) * 100)}% of total` : '— None yet'} changeType={active > 0 ? 'up' : 'nn'} gold />
        <KpiCard label="Inactive" value={inactive} change={inactive > 0 ? `${Math.round(inactive / Math.max(workspaces.length, 1) * 100)}% of total` : '— All active'} changeType="nn" />
        <KpiCard label="Stripe Onboarded" value={workspaces.filter(w => w.stripe_onboarded).length} change="— Payments ready" changeType="nn" />
      </div>

      <Card>
        <SecHd title="All Workspaces" right={<span style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: 'var(--muted)' }}>Click to expand</span>} />
        <table className="x-tbl">
          <thead>
            <tr>
              <th>Workspace</th>
              <th>Email</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {workspaces.length === 0 && (
              <tr><td colSpan={4} style={{ color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: 10, paddingTop: 16 }}>No workspaces found</td></tr>
            )}
            {workspaces.map(w => (
              <>
                <tr key={w.id} style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === w.id ? null : w.id)}>
                  <td>
                    <div className="x-ws-row">
                      <div className="x-ws-av">🏢</div>
                      <div>
                        <div style={{ fontSize: 11.5, fontWeight: 500 }}>{w.name || '—'}</div>
                        {w.slug && <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: 'var(--muted)' }}>@{w.slug}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--muted2)' }}>{w.email || '—'}</td>
                  <td>
                    <span className={`x-pill ${w.is_published ? 'act' : 'inn'}`}>
                      {w.is_published ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: 'var(--muted)' }}>{fmtDate(w.created_at)}</td>
                </tr>
                {expanded === w.id && <DetailPanel key={`d-${w.id}`} ws={w} />}
              </>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
