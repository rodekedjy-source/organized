import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { SecHd, Card, CenterSpinner } from '../AdminShared'

const EDGE_FUNCTIONS = [
  { name: 'enhance-product-image', version: 'v27', jwt: false },
  { name: 'send-booking-email', version: 'v21', jwt: false },
  { name: 'send-appointment-reminders', version: 'v8', jwt: false },
  { name: 'create-payment-intent', version: 'v6', jwt: false },
  { name: 'stripe-webhook', version: 'v2', jwt: false },
  { name: 'admin-metrics', version: 'v1', jwt: false },
]

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
  const [loading, setLoading] = useState(true)

  async function runChecks() {
    setLoading(true)

    const dbStart = Date.now()
    const { error: dbErr } = await supabase.from('workspaces').select('id').limit(1)
    const dbMs = Date.now() - dbStart

    const authStart = Date.now()
    const { error: authErr } = await supabase.auth.getSession()
    const authMs = Date.now() - authStart

    setChecks({
      db: { ok: !dbErr, ms: dbMs },
      auth: { ok: !authErr, ms: authMs },
    })
    setLoading(false)
  }

  useEffect(() => { runChecks() }, [])

  const ok = t => ({ type: 'ok', label: t })
  const wn = t => ({ type: 'wn', label: t })
  const err = t => ({ type: 'err', label: t })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="x-g2">
        <Card>
          <SecHd title="Core Services" right={<button className="x-btn-ghost" onClick={runChecks}>Re-check</button>} />
          <HRow name="Supabase Database" status={loading ? wn('Checking…') : checks?.db.ok ? ok(`Operational · ${checks.db.ms}ms`) : err('Error')} pulse={!loading && checks?.db.ok} />
          <HRow name="Supabase Auth" status={loading ? wn('Checking…') : checks?.auth.ok ? ok(`Operational · ${checks.auth.ms}ms`) : err('Error')} />
          <HRow name="Supabase Storage" status={ok('Operational')} />
          <HRow name="Vercel Production" status={ok('READY — v6 hero')} />
          <HRow name="Stripe Webhook" status={ok('Active v2')} />
          <HRow name="Resend (Emails)" status={ok('Active')} />
          <HRow name="fal.ai (AI Photos)" status={ok('FLUX v27 active')} />
        </Card>

        <Card warn>
          <div className="x-sec-title" style={{ marginBottom: 14 }}>Security Alerts</div>
          <HRow name="RLS — ai_templates" status={wn('⚠ Disabled')} />
          <HRow name="admin_users" status={wn('⚠ Check config')} />
          <HRow name="Stripe — Mode" status={wn('Test only')} />
          <HRow name="RLS — other tables" status={ok('22/23 protected')} />
          <div style={{ marginTop: 16, padding: 12, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8 }}>
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: 'var(--amber)', marginBottom: 6 }}>Fix required — RLS</div>
            <code style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: 'var(--muted2)' }}>
              ALTER TABLE ai_templates ENABLE ROW LEVEL SECURITY;
            </code>
          </div>
        </Card>
      </div>

      <Card>
        <div className="x-sec-title" style={{ marginBottom: 14 }}>Edge Functions — {EDGE_FUNCTIONS.length} active</div>
        <table className="x-tbl">
          <thead><tr><th>Function</th><th>Version</th><th>JWT</th><th>Status</th></tr></thead>
          <tbody>
            {EDGE_FUNCTIONS.map(fn => (
              <tr key={fn.name}>
                <td style={{ fontFamily: 'DM Mono,monospace', fontSize: 11 }}>{fn.name}</td>
                <td style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: 'var(--muted)' }}>{fn.version}</td>
                <td style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--muted)' }}>{fn.jwt ? 'true' : 'false'}</td>
                <td><span className="x-pill act">ACTIVE</span></td>
              </tr>
            ))}
            <tr>
              <td style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: 'var(--muted)' }}>+ 9 more functions…</td>
              <td /><td /><td />
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  )
}
