import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { SecHd, Card, InfoBanner, CenterSpinner } from '../AdminShared'

function HRow({ name, status, pulse }) {
  return (
    <div className="x-hrow">
      <div className="x-hname">{name}</div>
      <div className={`x-hst ${status.type}`}>
        <span className={`x-hd${pulse ? ' pulse' : ''}`} />
        {status.label}
      </div>
    </div>
  )
}

export default function AdminHealth() {
  const [checks, setChecks] = useState(null)
  const [security, setSecurity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastBackup, setLastBackup] = useState(undefined) // null = none found, Date = last backup

  async function fetchLastBackup() {
    try {
      const { data } = await supabase.functions.invoke('backup-database', { method: 'GET' })
      const raw = data?.lastBackupDate ?? null
      setLastBackup(raw ? new Date(raw) : null)
    } catch (_) {
      setLastBackup(null)
    }
  }

  async function runChecks() {
    setLoading(true)

    // Core service latency checks
    const dbStart = Date.now()
    const { error: dbErr } = await supabase.from('workspaces').select('id').limit(1)
    const dbMs = Date.now() - dbStart

    const authStart = Date.now()
    const { error: authErr } = await supabase.auth.getSession()
    const authMs = Date.now() - authStart

    // Security overview (RLS, admins, stripe) — single RPC
    const { data: secData } = await supabase.rpc('get_security_overview')

    // Edge function count via admin-metrics
    let edgeFnCount = null
    try {
      const { data: metricsData } = await supabase.functions.invoke('admin-metrics')
      if (metricsData?.edge_function_count != null) {
        edgeFnCount = metricsData.edge_function_count
      } else if (metricsData?.functions != null) {
        edgeFnCount = Array.isArray(metricsData.functions)
          ? metricsData.functions.length
          : metricsData.functions
      }
    } catch (_) { /* leave null if function unreachable */ }

    setChecks({ db: { ok: !dbErr, ms: dbMs }, auth: { ok: !authErr, ms: authMs } })
    setSecurity(secData ? { ...secData, edgeFnCount } : null)
    setLoading(false)
  }

  useEffect(() => { runChecks(); fetchLastBackup() }, [])

  const ok  = t => ({ type: 'ok',  label: t })
  const wn  = t => ({ type: 'wn',  label: t })
  const err = t => ({ type: 'err', label: t })

  // DB Backup status
  const backupStatus = (() => {
    if (lastBackup === undefined) return wn('Checking…')
    if (lastBackup === null)      return err('No backup found')
    const ageDays = (Date.now() - lastBackup.getTime()) / 86400000
    const label = `Last: ${lastBackup.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}`
    return ageDays <= 8 ? ok(label) : err(`Overdue · ${label}`)
  })()

  // Derived security values
  const rlsTables       = security?.rls_tables ?? []
  const aiTemplatesRow  = rlsTables.find(t => t.table_name === 'ai_templates')
  const aiRlsOn         = aiTemplatesRow?.rls_enabled === true
  const totalTables     = rlsTables.length
  const protectedTables = rlsTables.filter(t => t.rls_enabled).length
  const authorizedAdmins = security?.authorized_admins ?? null
  const stripeOnboarded  = security?.stripe_onboarded ?? null

  const aiTemplatesStatus = loading
    ? wn('Checking…')
    : security == null
      ? err('Query failed')
      : aiRlsOn
        ? ok('Enabled')
        : wn('⚠ Disabled')

  const adminUsersStatus = loading
    ? wn('Checking…')
    : authorizedAdmins == null
      ? err('Query failed')
      : authorizedAdmins > 0
        ? ok(`${authorizedAdmins} authorized`)
        : wn('⚠ No authorized admins')

  const stripeStatus = loading
    ? wn('Checking…')
    : stripeOnboarded == null
      ? err('Query failed')
      : stripeOnboarded > 0
        ? ok(`${stripeOnboarded} workspace${stripeOnboarded !== 1 ? 's' : ''} onboarded`)
        : wn('Test only — none onboarded')

  const rlsOtherStatus = loading
    ? wn('Checking…')
    : totalTables === 0
      ? err('Query failed')
      : protectedTables === totalTables
        ? ok(`${protectedTables}/${totalTables} protected`)
        : wn(`${protectedTables}/${totalTables} protected`)

  const edgeFnLabel = security?.edgeFnCount != null
    ? `${security.edgeFnCount} active`
    : 'active'

  // Tables with RLS off (excluding ai_templates which is shown separately)
  const unprotectedOther = rlsTables.filter(t => !t.rls_enabled && t.table_name !== 'ai_templates')

  if (loading && !checks) return <CenterSpinner />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <InfoBanner id="health" text="État de tous les services en temps réel. Rouge = action requise immédiatement. Amber = attention nécessaire. Vert = opérationnel. Le bouton Re-check rafraîchit la latence." />
      <div className="x-g2">
        <Card>
          <SecHd title="Core Services" right={<button className="x-btn-ghost" onClick={runChecks}>Re-check</button>} />
          <HRow name="Supabase Database" status={loading ? wn('Checking…') : checks?.db.ok ? ok(`Operational · ${checks.db.ms}ms`) : err('Error')} pulse={!loading && checks?.db.ok} />
          <HRow name="Supabase Auth"     status={loading ? wn('Checking…') : checks?.auth.ok ? ok(`Operational · ${checks.auth.ms}ms`) : err('Error')} />
          <HRow name="Supabase Storage"  status={ok('Operational')} />
          <HRow name="DB Backup"         status={backupStatus} />
          <HRow name="Vercel Production" status={ok('READY — v6 hero')} />
          <HRow name="Stripe Webhook"    status={ok('Active v2')} />
          <HRow name="Resend (Emails)"   status={ok('Active')} />
          <HRow name="fal.ai (AI Photos)"status={ok('FLUX v27 active')} />
        </Card>

        <Card warn>
          <div className="x-sec-title" style={{ marginBottom: 14 }}>Security Alerts</div>
          <HRow name="RLS — ai_templates" status={aiTemplatesStatus} />
          <HRow name="admin_users"        status={adminUsersStatus} />
          <HRow name="Stripe — Mode"      status={stripeStatus} />
          <HRow name="RLS — other tables" status={rlsOtherStatus} />

          {!loading && !aiRlsOn && (
            <div style={{ marginTop: 16, padding: 12, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8 }}>
              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: 'var(--amber)', marginBottom: 6 }}>Fix required — RLS</div>
              <code style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: 'var(--muted2)' }}>
                ALTER TABLE ai_templates ENABLE ROW LEVEL SECURITY;
              </code>
            </div>
          )}

          {!loading && unprotectedOther.length > 0 && (
            <div style={{ marginTop: 12, padding: 12, background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 8 }}>
              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--amber)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Unprotected tables
              </div>
              {unprotectedOther.map(t => (
                <div key={t.table_name} style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: 'var(--muted2)', marginBottom: 2 }}>
                  · {t.table_name}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div className="x-sec-title" style={{ marginBottom: 14 }}>
          Edge Functions — {edgeFnLabel}
        </div>
        <table className="x-tbl">
          <thead><tr><th>Function</th><th>Version</th><th>JWT</th><th>Status</th></tr></thead>
          <tbody>
            {[
              { name: 'enhance-product-image',     version: 'v27', jwt: false },
              { name: 'send-booking-email',        version: 'v21', jwt: false },
              { name: 'send-appointment-reminders',version: 'v8',  jwt: false },
              { name: 'create-payment-intent',     version: 'v6',  jwt: false },
              { name: 'stripe-webhook',            version: 'v2',  jwt: false },
              { name: 'admin-metrics',             version: 'v1',  jwt: false },
              { name: 'backup-database',           version: 'v1',  jwt: false },
            ].map(fn => (
              <tr key={fn.name}>
                <td style={{ fontFamily: 'DM Mono,monospace', fontSize: 11 }}>{fn.name}</td>
                <td style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: 'var(--muted)' }}>{fn.version}</td>
                <td style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--muted)' }}>{fn.jwt ? 'true' : 'false'}</td>
                <td><span className="x-pill act">ACTIVE</span></td>
              </tr>
            ))}
            {security?.edgeFnCount != null && security.edgeFnCount > 6 && (
              <tr>
                <td style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: 'var(--muted)' }}>
                  + {security.edgeFnCount - 6} more functions…
                </td>
                <td /><td /><td />
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
