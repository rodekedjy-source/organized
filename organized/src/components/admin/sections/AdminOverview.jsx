import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { KpiCard, SecHd, Card, InfoBanner, CenterSpinner, Toast, useToast, fmtMoney, fmtDate, fmtTime } from '../AdminShared'

function AuditOpPill({ action }) {
  const a = (action || '').toLowerCase()
  const cls = a === 'insert' ? 'ins' : a === 'update' ? 'upd' : a === 'delete' ? 'del' : 'ins'
  return <div className={`x-aop ${cls}`}>{a.toUpperCase()}</div>
}

export default function AdminOverview({ onNavigate }) {
  const [data,    setData]    = useState(null)
  const [mrr,     setMrr]     = useState(null)
  const [loading, setLoading] = useState(true)
  const { toastMsg, toastType, showToast } = useToast()

  useEffect(() => {
    async function load() {
      const [{ data: overview }, { data: mrrData }] = await Promise.all([
        supabase.rpc('get_admin_overview'),
        supabase.rpc('get_mrr_overview'),
      ])
      setData(overview)
      setMrr(mrrData)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <CenterSpinner />

  const wsCount     = data?.workspace_count   ?? 0
  const auditCount  = data?.audit_count        ?? 0
  const apptCount   = data?.appointment_count  ?? 0
  const recentWs    = data?.recent_workspaces  || []
  const recentAudit = data?.recent_audit       || []

  const thisMRR  = mrr?.this_month ?? 0
  const lastMRR  = mrr?.last_month ?? 0
  const mrrDelta = thisMRR - lastMRR
  const mrrChangeType  = mrrDelta > 0 ? 'up' : mrrDelta < 0 ? 'wn' : 'nn'
  const mrrChangeLabel = lastMRR === 0
    ? (thisMRR > 0 ? '↑ First revenue!' : '— No payments yet')
    : `${mrrDelta >= 0 ? '↑' : '↓'} ${fmtMoney(Math.abs(mrrDelta))} vs last month`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <InfoBanner id="overview" text="Vue globale de la plateforme. Cliquez sur une carte pour naviguer directement vers cette section." />

      <div className="x-g4">
        <KpiCard label="MRR — This Month" value={fmtMoney(thisMRR)}
          change={mrrChangeLabel} changeType={mrrChangeType} gold
          spark={[20, 20, 20, 20, 20]}
          onClick={() => onNavigate?.('revenue')} />
        <KpiCard label="Workspaces" value={wsCount}
          change="— Pre-beta" changeType="nn"
          spark={[10, 10, 60, 60, 100]}
          onClick={() => onNavigate?.('users')} />
        <KpiCard label="Appointments" value={apptCount}
          change="↑ Active" changeType="up"
          spark={[30, 55, 45, 80, 100]} sparkAllGold
          onClick={() => onNavigate?.('audit')} />
        <KpiCard label="Audit Events" value={auditCount}
          change="↑ Real-time" changeType="up"
          spark={[40, 65, 55, 85, 100]} sparkAllGold
          onClick={() => onNavigate?.('audit')} />
      </div>

      <div className="x-g2">
        <Card>
          <SecHd title="Workspaces" right={
            <button className="x-btn-ghost" onClick={() => onNavigate?.('users')}>see all →</button>
          } />
          <table className="x-tbl">
            <thead><tr><th>Workspace</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>
              {recentWs.length === 0 ? (
                <tr><td colSpan={3} style={{ color: 'var(--muted)', fontFamily: 'DM Mono,monospace', fontSize: 10, paddingTop: 16 }}>No workspaces yet</td></tr>
              ) : recentWs.map(w => (
                <tr key={w.id}>
                  <td>
                    <div className="x-ws-row">
                      <div className="x-ws-av">🏢</div>
                      <div>
                        <div style={{ fontSize: 11.5, fontWeight: 500 }}>{w.name || '—'}</div>
                        {w.slug && <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--muted)' }}>@{w.slug}</div>}
                      </div>
                    </div>
                  </td>
                  <td><span className={`x-pill ${w.is_published ? 'act' : 'inn'}`}>{w.is_published ? 'Active' : 'Inactive'}</span></td>
                  <td style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--muted)' }}>{fmtDate(w.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card warn>
          <div className="x-sec-title" style={{ marginBottom: 14 }}>System Health</div>
          <div className="x-hrow"><div className="x-hname">Supabase DB</div><div className="x-hst ok"><span className="x-hd pulse" />Operational</div></div>
          <div className="x-hrow"><div className="x-hname">Vercel Production</div><div className="x-hst ok"><span className="x-hd" />Ready</div></div>
          <div className="x-hrow"><div className="x-hname">Stripe Webhook</div><div className="x-hst ok"><span className="x-hd" />Active v2</div></div>
          <div className="x-hrow"><div className="x-hname">Edge Functions</div><div className="x-hst ok"><span className="x-hd" />Active</div></div>
          <div className="x-hrow"><div className="x-hname">MRR this month</div><div className="x-hst ok"><span className="x-hd" />{fmtMoney(thisMRR)}</div></div>
          <div style={{ marginTop: 14 }}>
            <button className="x-btn-ghost" onClick={() => onNavigate?.('health')}>Full details →</button>
          </div>
        </Card>
      </div>

      <Card>
        <SecHd title="Audit Trail — Preview" right={
          <button className="x-btn-ghost" onClick={() => onNavigate?.('audit')}>see all →</button>
        } />
        {recentAudit.length === 0 && (
          <div style={{ color: 'var(--muted)', fontFamily: 'DM Mono,monospace', fontSize: 10, paddingTop: 8 }}>No audit events yet</div>
        )}
        {recentAudit.map(a => (
          <div key={a.id} className="x-audit-row">
            <div className="x-at">{fmtTime(a.changed_at)}</div>
            <AuditOpPill action={a.action} />
            <div className="x-am" style={{ flex: 1 }}>{a.table_name}</div>
          </div>
        ))}
      </Card>

      <Toast msg={toastMsg} type={toastType} />
    </div>
  )
}
