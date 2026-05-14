import { useState } from 'react'
import { updatePolicy } from '../api/policy'

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '.75rem', cursor: 'pointer', padding: '.6rem 0' }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 36, height: 20, borderRadius: 10, position: 'relative', flexShrink: 0,
          background: checked ? 'var(--gold)' : 'var(--border-2)', transition: 'background .2s', cursor: 'pointer',
        }}
      >
        <div style={{
          position: 'absolute', top: 2, left: checked ? 18 : 2, width: 16, height: 16,
          borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
        }} />
      </div>
      <span style={{ fontSize: '.88rem', color: 'var(--ink)', fontWeight: 500 }}>{label}</span>
    </label>
  )
}

// ── Section heading ───────────────────────────────────────────────────────────
function SHead({ title }) {
  return (
    <div style={{ fontSize: '.67rem', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.55rem', paddingBottom: '.4rem', borderBottom: '1px solid var(--border)' }}>
      {title}
    </div>
  )
}

// ── PolicySection ─────────────────────────────────────────────────────────────
export default function PolicySection({ workspace, toast, refetch }) {
  const [form, setForm] = useState({
    policy_enabled:      workspace?.policy_enabled      || false,
    policy_deposit_pct:  workspace?.policy_deposit_pct  ?? 0,
    policy_cancel_hours: workspace?.policy_cancel_hours ?? 24,
    policy_late_fee:     workspace?.policy_late_fee     || false,
    policy_no_show_fee:  workspace?.policy_no_show_fee  || false,
    policy_custom:       workspace?.policy_custom       || '',
  })
  const [saving, setSaving] = useState(false)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  // Preview lines — same logic as ClientPage gate
  const lines = []
  if (form.policy_deposit_pct > 0)
    lines.push(`A $${form.policy_deposit_pct} deposit is required to confirm your booking.`)
  if (form.policy_cancel_hours > 0)
    lines.push(`Free cancellation up to ${form.policy_cancel_hours} hours before your appointment.`)
  if (form.policy_late_fee) {
    const customLate = form.policy_custom?.toLowerCase().includes('late')
    if (!customLate) lines.push('A fee may apply for late arrivals.')
  }
  if (form.policy_no_show_fee) {
    const customNoShow = form.policy_custom?.toLowerCase().includes('no-show') ||
      form.policy_custom?.toLowerCase().includes('no show') ||
      form.policy_custom?.toLowerCase().includes('noshow')
    if (!customNoShow) lines.push('In case of no-show, the deposit is non-refundable.')
  }
  if (form.policy_custom?.trim()) {
    form.policy_custom.trim().split('\n')
      .filter(l => l.trim())
      .forEach(l => lines.push(l.trim()))
  }

  async function save() {
    setSaving(true)
    const { error } = await updatePolicy(workspace.id, form)
    setSaving(false)
    if (error) { toast('Could not save policy.'); return }
    toast('Policy saved.')
    if (refetch) await refetch()
  }

  const iS = {
    width: '100%', padding: '.6rem .85rem', border: '1px solid var(--border-2)',
    borderRadius: 9, fontSize: '.85rem', fontFamily: 'inherit', color: 'var(--ink)',
    background: 'var(--surface)', outline: 'none', transition: 'border .15s',
  }
  const focus = e => (e.target.style.borderColor = 'var(--gold)')
  const blur  = e => (e.target.style.borderColor = 'var(--border-2)')
  const hint  = { fontSize: '.71rem', color: 'var(--ink-3)', marginTop: '.25rem' }

  return (
    <div>
      {/* Header */}
      <div className="page-head">
        <div>
          <div className="page-title">Booking Policy</div>
          <div className="page-sub">Define your terms. Clients agree before booking.</div>
        </div>
        <Toggle
          checked={form.policy_enabled}
          onChange={v => set('policy_enabled', v)}
          label={form.policy_enabled ? 'Active' : 'Inactive'}
        />
      </div>

      {/* Inactive message */}
      {!form.policy_enabled && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--ink-3)', fontSize: '.88rem', lineHeight: 1.65 }}>
            Policy inactive — clients can book without agreeing to terms.
          </div>
        </div>
      )}

      {/* Builder — shown when enabled */}
      {form.policy_enabled && (
        <>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>

              {/* Deposit */}
              <div>
                <SHead title="Deposit" />
                <div className="field">
                  <label>Require a deposit to confirm bookings</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                    <input style={{ ...iS, maxWidth: 100 }} type="number" min="0" max="100"
                      value={form.policy_deposit_pct}
                      onChange={e => set('policy_deposit_pct', Number(e.target.value))}
                      onFocus={focus} onBlur={blur} />
                    <span style={{ fontSize: '.88rem', color: 'var(--ink-2)', flexShrink: 0 }}>$</span>
                  </div>
                  <div style={hint}>Set to 0 for no deposit required</div>
                </div>
              </div>

              {/* Cancellation */}
              <div>
                <SHead title="Cancellation Window" />
                <div className="field">
                  <label>Free cancellation up to</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap' }}>
                    <input style={{ ...iS, maxWidth: 90 }} type="number" min="0"
                      value={form.policy_cancel_hours}
                      onChange={e => set('policy_cancel_hours', Number(e.target.value))}
                      onFocus={focus} onBlur={blur} />
                    <span style={{ fontSize: '.88rem', color: 'var(--ink-2)', flexShrink: 0 }}>hours before appointment</span>
                  </div>
                  <div style={hint}>Cancellations after this window may be charged</div>
                </div>
              </div>

              {/* Fees */}
              <div>
                <SHead title="Fees" />
                <Toggle checked={form.policy_late_fee}    onChange={v => set('policy_late_fee', v)}    label="Late arrival fee applies" />
                <Toggle checked={form.policy_no_show_fee} onChange={v => set('policy_no_show_fee', v)} label="No-show deposit is non-refundable" />
                <div style={{ fontSize: '.75rem', color: 'var(--ink-3)', fontStyle: 'italic', marginTop: '.35rem', lineHeight: 1.55 }}>
                  Specify details in Additional Terms, or a default message will be shown.
                </div>
              </div>

              {/* Custom */}
              <div>
                <SHead title="Additional Terms" />
                <div className="field">
                  <label>Custom policy <span style={{ fontWeight: 400, color: 'var(--ink-3)' }}>(optional)</span></label>
                  <textarea
                    style={{ ...iS, minHeight: 88, resize: 'vertical' }}
                    rows={4}
                    value={form.policy_custom}
                    onChange={e => set('policy_custom', e.target.value)}
                    placeholder={"Example: Color services require a consultation.\nExtensions cannot be done on chemically damaged hair."}
                    onFocus={focus} onBlur={blur}
                  />
                  <div style={hint}>This will be displayed exactly as written.</div>
                </div>
              </div>

            </div>
          </div>

          {/* Preview */}
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="card-body">
              <div style={{ fontSize: '.67rem', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.85rem' }}>Preview</div>
              {lines.length === 0
                ? <div style={{ fontSize: '.85rem', color: 'var(--ink-3)', fontStyle: 'italic' }}>No policy terms set yet.</div>
                : lines.map((line, i) => (
                  <div key={i} style={{ borderLeft: '2px solid var(--gold)', paddingLeft: 12, paddingTop: 6, paddingBottom: 6, margin: '8px 0', fontSize: '.85rem', color: 'var(--ink-2)', lineHeight: 1.65 }}>
                    {line}
                  </div>
                ))
              }
            </div>
          </div>
        </>
      )}

      {/* Save — always visible */}
      <button className="btn btn-primary" style={{ justifyContent: 'center', padding: '.75rem 2rem' }} onClick={save} disabled={saving}>
        {saving ? 'Saving…' : 'Save Policy'}
      </button>
    </div>
  )
}
