import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { updatePolicy } from '../api/policy'
import { getWorkspaceSettings, upsertWorkspaceSettings } from '../api/workspaceSettings'

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

// ── ShopPolicySection ─────────────────────────────────────────────────────────
function ShopPolicySection({ workspace, toast, refetch }) {
  const DEF = { returns: true, return_days: 14, return_condition: 'unused_only', refund_type: 'full', refund_days: 5, processing_days: 2, shipping_fee: 'free', flat_rate: 0, custom: '' }
  const [form, setForm] = useState(() => {
    const saved = workspace?.policy_shop
    return saved ? { ...DEF, ...saved } : DEF
  })
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function save() {
    setSaving(true)
    const { error } = await supabase
      .from('workspaces')
      .update({ policy_shop: form })
      .eq('id', workspace.id)
    setSaving(false)
    if (error) { toast('Could not save policy.'); return }
    toast('Policy saved.')
    if (refetch) await refetch()
  }

  const iS = { width: '100%', padding: '.6rem .85rem', border: '1px solid var(--border-2)', borderRadius: 9, fontSize: '.85rem', fontFamily: 'inherit', color: 'var(--ink)', background: 'var(--surface)', outline: 'none', transition: 'border .15s' }
  const focus = e => (e.target.style.borderColor = 'var(--gold)')
  const blur  = e => (e.target.style.borderColor = 'var(--border-2)')
  const hint  = { fontSize: '.71rem', color: 'var(--ink-3)', marginTop: '.25rem' }

  // Preview lines
  const lines = []
  if (form.returns) {
    lines.push(`Returns accepted within ${form.return_days} days of delivery${form.return_condition === 'unused_only' ? ' (unused/unopened items only)' : ''}.`)
    if (form.refund_type === 'full') lines.push(`Full refund issued within ${form.refund_days} business days of receiving the return.`)
    else if (form.refund_type === 'store_credit') lines.push(`Store credit issued within ${form.refund_days} business days of receiving the return.`)
    else lines.push('No cash refunds — exchanges or store credit only.')
  } else {
    lines.push('All sales are final. No returns or refunds accepted.')
  }
  lines.push(`Orders are processed within ${form.processing_days} business day${form.processing_days !== 1 ? 's' : ''} before shipping.`)
  if (form.shipping_fee === 'free') lines.push('Free shipping on all orders.')
  else if (form.shipping_fee === 'flat') lines.push(`Flat shipping rate of $${Number(form.flat_rate).toFixed(2)}.`)
  else lines.push('Shipping calculated at checkout based on location and weight.')
  if (form.custom?.trim()) form.custom.trim().split('\n').filter(l => l.trim()).forEach(l => lines.push(l.trim()))

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Shop Policy</div>
          <div className="page-sub">Define your return, refund and shipping terms.</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>

          {/* Section 1 — Return Policy */}
          <div>
            <SHead title="Return Policy" />
            <Toggle checked={form.returns} onChange={v => set('returns', v)} label="Accept returns" />
            {form.returns && (
              <>
                <div className="field" style={{ marginTop: '.75rem' }}>
                  <label>Return window after delivery</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                    <input style={{ ...iS, maxWidth: 80 }} type="number" min="1" value={form.return_days} onChange={e => set('return_days', Number(e.target.value))} onFocus={focus} onBlur={blur} />
                    <span style={{ fontSize: '.88rem', color: 'var(--ink-2)', flexShrink: 0 }}>days</span>
                  </div>
                </div>
                <div className="field" style={{ marginTop: '.75rem' }}>
                  <label>Item condition</label>
                  <select style={{ ...iS, cursor: 'pointer' }} value={form.return_condition} onChange={e => set('return_condition', e.target.value)} onFocus={focus} onBlur={blur}>
                    <option value="unused_only">Unused only</option>
                    <option value="any">Any condition</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Section 2 — Refund Policy */}
          <div>
            <SHead title="Refund Policy" />
            <div className="field">
              <label>Refund type</label>
              <select style={{ ...iS, cursor: 'pointer' }} value={form.refund_type} onChange={e => set('refund_type', e.target.value)} onFocus={focus} onBlur={blur}>
                <option value="full">Full refund</option>
                <option value="store_credit">Store credit</option>
                <option value="none">No refunds</option>
              </select>
            </div>
            {form.refund_type !== 'none' && (
              <div className="field" style={{ marginTop: '.75rem' }}>
                <label>Processing time</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                  <input style={{ ...iS, maxWidth: 80 }} type="number" min="1" value={form.refund_days} onChange={e => set('refund_days', Number(e.target.value))} onFocus={focus} onBlur={blur} />
                  <span style={{ fontSize: '.88rem', color: 'var(--ink-2)', flexShrink: 0 }}>business days</span>
                </div>
                <div style={hint}>After receiving the returned item</div>
              </div>
            )}
          </div>

          {/* Section 3 — Shipping Policy */}
          <div>
            <SHead title="Shipping Policy" />
            <div className="field">
              <label>Processing time before shipping</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                <input style={{ ...iS, maxWidth: 80 }} type="number" min="1" value={form.processing_days} onChange={e => set('processing_days', Number(e.target.value))} onFocus={focus} onBlur={blur} />
                <span style={{ fontSize: '.88rem', color: 'var(--ink-2)', flexShrink: 0 }}>business days</span>
              </div>
            </div>
            <div className="field" style={{ marginTop: '.75rem' }}>
              <label>Shipping fees</label>
              <select style={{ ...iS, cursor: 'pointer' }} value={form.shipping_fee} onChange={e => set('shipping_fee', e.target.value)} onFocus={focus} onBlur={blur}>
                <option value="free">Free shipping</option>
                <option value="flat">Flat rate</option>
                <option value="calculated">Calculated at checkout</option>
              </select>
            </div>
            {form.shipping_fee === 'flat' && (
              <div className="field" style={{ marginTop: '.75rem' }}>
                <label>Flat rate amount</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                  <span style={{ fontSize: '.88rem', color: 'var(--ink-2)', flexShrink: 0 }}>$</span>
                  <input style={{ ...iS, maxWidth: 100 }} type="number" min="0" step="0.01" value={form.flat_rate} onChange={e => set('flat_rate', Number(e.target.value))} onFocus={focus} onBlur={blur} />
                </div>
              </div>
            )}
          </div>

          {/* Section 4 — Additional Terms */}
          <div>
            <SHead title="Additional Terms" />
            <div className="field">
              <label>Custom notes <span style={{ fontWeight: 400, color: 'var(--ink-3)' }}>(optional)</span></label>
              <textarea style={{ ...iS, minHeight: 80, resize: 'vertical' }} rows={3} value={form.custom} onChange={e => set('custom', e.target.value)} placeholder="Any additional terms shown to customers..." onFocus={focus} onBlur={blur} />
            </div>
          </div>

        </div>
      </div>

      {/* Section 5 — Preview */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-body">
          <div style={{ fontSize: '.67rem', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.85rem' }}>Preview</div>
          {lines.map((line, i) => (
            <div key={i} style={{ borderLeft: '2px solid var(--gold)', paddingLeft: 12, paddingTop: 6, paddingBottom: 6, margin: '8px 0', fontSize: '.85rem', color: 'var(--ink-2)', lineHeight: 1.65 }}>{line}</div>
          ))}
        </div>
      </div>

      <button className="btn btn-primary" style={{ justifyContent: 'center', padding: '.75rem 2rem' }} onClick={save} disabled={saving}>
        {saving ? 'Saving…' : 'Save Policy'}
      </button>
    </div>
  )
}

// ── LearnPolicySection ────────────────────────────────────────────────────────
function LearnPolicySection({ workspace, toast, refetch }) {
  const DEF = { refund_type:'no_refund', refund_days:7, content_access:'lifetime', prerequisites:'', issue_certificate:false, custom_notes:'' }
  const [form, setForm] = useState(() => ({ ...DEF, ...(workspace?.policy_learn||{}) }))
  const [saving, setSaving] = useState(false)
  const set = (k,v) => setForm(f => ({...f,[k]:v}))
  const iS = { width:'100%', padding:'.6rem .85rem', border:'1px solid var(--border-2)', borderRadius:9, fontSize:'.85rem', fontFamily:'inherit', color:'var(--ink)', background:'var(--surface)', outline:'none', transition:'border .15s' }
  const focus = e => (e.target.style.borderColor='var(--gold)')
  const blur  = e => (e.target.style.borderColor='var(--border-2)')

  async function save() {
    setSaving(true)
    const { error } = await supabase.from('workspaces').update({ policy_learn: form }).eq('id', workspace.id)
    setSaving(false)
    if (error) { toast('Could not save policy.'); return }
    toast('Policy saved.')
    if (refetch) await refetch()
  }

  const previewLines = []
  if (form.refund_type==='no_refund') previewLines.push('No refunds after enrollment.')
  else if (form.refund_type==='full_refund') previewLines.push(`Full refund within ${form.refund_days} days of purchase.`)
  else previewLines.push('Store credit issued upon refund request.')
  const accessLabels = { lifetime:'Lifetime access to course content.', one_year:'Content access for 1 year.', six_months:'Content access for 6 months.', course_duration:'Access limited to course duration.' }
  if (accessLabels[form.content_access]) previewLines.push(accessLabels[form.content_access])
  if (form.prerequisites?.trim()) previewLines.push(`Prerequisites: ${form.prerequisites.trim()}`)
  if (form.issue_certificate) previewLines.push('A certificate of completion is issued upon finishing the course.')
  if (form.custom_notes?.trim()) form.custom_notes.trim().split('\n').filter(l=>l.trim()).forEach(l=>previewLines.push(l.trim()))

  return (
    <div>
      <div className="page-head"><div><div className="page-title">Learn Policy</div><div className="page-sub">Define your refund, access and certificate terms.</div></div></div>
      <div className="card" style={{ marginBottom:'1rem' }}>
        <div className="card-body" style={{ display:'flex', flexDirection:'column', gap:'1.4rem' }}>
          <div><SHead title="Refund Policy" />
            <div className="field"><label>Refund terms</label>
              <select style={{...iS,cursor:'pointer'}} value={form.refund_type} onChange={e=>set('refund_type',e.target.value)} onFocus={focus} onBlur={blur}>
                <option value="no_refund">No refunds after enrollment</option>
                <option value="full_refund">Full refund within X days of purchase</option>
                <option value="store_credit">Store credit only</option>
              </select>
            </div>
            {form.refund_type==='full_refund'&&(
              <div className="field" style={{marginTop:'.75rem'}}>
                <label>Refund window</label>
                <div style={{display:'flex',alignItems:'center',gap:'.6rem'}}>
                  <input style={{...iS,maxWidth:80}} type="number" min="1" value={form.refund_days} onChange={e=>set('refund_days',Number(e.target.value))} onFocus={focus} onBlur={blur}/>
                  <span style={{fontSize:'.88rem',color:'var(--ink-2)',flexShrink:0}}>days</span>
                </div>
              </div>
            )}
          </div>
          <div><SHead title="Content Access" />
            <div className="field"><label>Access duration</label>
              <select style={{...iS,cursor:'pointer'}} value={form.content_access} onChange={e=>set('content_access',e.target.value)} onFocus={focus} onBlur={blur}>
                <option value="lifetime">Lifetime access</option>
                <option value="one_year">1 year</option>
                <option value="six_months">6 months</option>
                <option value="course_duration">Course duration only</option>
              </select>
            </div>
          </div>
          <div><SHead title="Prerequisites" />
            <div className="field">
              <textarea style={{...iS,minHeight:64,resize:'vertical'}} value={form.prerequisites} onChange={e=>set('prerequisites',e.target.value)} placeholder="Requirements to join (optional)" onFocus={focus} onBlur={blur}/>
            </div>
          </div>
          <div><SHead title="Certificate" />
            <Toggle checked={form.issue_certificate} onChange={v=>set('issue_certificate',v)} label="Issue certificate upon completion"/>
          </div>
          <div><SHead title="Additional Terms" />
            <div className="field">
              <textarea style={{...iS,minHeight:80,resize:'vertical'}} value={form.custom_notes} onChange={e=>set('custom_notes',e.target.value)} placeholder="Any additional terms…" onFocus={focus} onBlur={blur}/>
            </div>
          </div>
        </div>
      </div>
      <div className="card" style={{ marginBottom:'1rem' }}>
        <div className="card-body">
          <div style={{ fontSize:'.67rem', fontWeight:700, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:'.85rem' }}>Preview</div>
          {previewLines.map((line,i) => (
            <div key={i} style={{ borderLeft:'2px solid var(--gold)', paddingLeft:12, paddingTop:6, paddingBottom:6, margin:'8px 0', fontSize:'.85rem', color:'var(--ink-2)', lineHeight:1.65 }}>{line}</div>
          ))}
        </div>
      </div>
      <button className="btn btn-primary" style={{ justifyContent:'center', padding:'.75rem 2rem' }} onClick={save} disabled={saving}>
        {saving ? 'Saving…' : 'Save Policy'}
      </button>
    </div>
  )
}

// ── PolicySection ─────────────────────────────────────────────────────────────
export default function PolicySection({ workspace, toast, refetch, type = 'booking' }) {
  if (type === 'learn') return <LearnPolicySection workspace={workspace} toast={toast} refetch={refetch} />
  if (type === 'shop') return <ShopPolicySection workspace={workspace} toast={toast} refetch={refetch} />
  const [form, setForm] = useState({
    policy_enabled:      workspace?.policy_enabled      || false,
    policy_deposit_pct:  workspace?.policy_deposit_pct  ?? 0,
    policy_cancel_hours: workspace?.policy_cancel_hours ?? 24,
    policy_late_fee:     workspace?.policy_late_fee     || false,
    policy_no_show_fee:  workspace?.policy_no_show_fee  || false,
    policy_custom:       workspace?.policy_custom       || '',
  })
  const [saving, setSaving] = useState(false)
  const [reminders, setReminders] = useState({ remind_7d: false, remind_3d: false, remind_24h: true })
  const [reminderSaving, setReminderSaving] = useState(false)

  useEffect(() => {
    if (!workspace?.id) return
    getWorkspaceSettings(workspace.id).then(({ data }) => {
      if (data) setReminders({
        remind_7d:  !!data.remind_7d,
        remind_3d:  !!data.remind_3d,
        remind_24h: data.remind_24h !== false,
      })
    })
  }, [workspace?.id])

  async function saveReminder(next) {
    setReminderSaving(true)
    await upsertWorkspaceSettings(workspace.id, next)
    setReminderSaving(false)
    toast('Reminders saved.')
  }

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

      {/* Reminder Settings */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-head">
          <div>
            <div className="card-title">Reminder Settings</div>
            <div style={{ fontSize: '.72rem', color: 'var(--ink-3)', marginTop: 2 }}>Auto-reminders sent to clients before their appointment</div>
          </div>
          {reminderSaving && <span style={{ fontSize: '.72rem', color: 'var(--ink-3)' }}>Saving…</span>}
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '.1rem' }}>
          {[
            { key: 'remind_7d',  label: '7 days before' },
            { key: 'remind_3d',  label: '3 days before' },
            { key: 'remind_24h', label: '24 hours before' },
          ].map(({ key, label }) => (
            <Toggle
              key={key}
              checked={reminders[key]}
              label={label}
              onChange={v => {
                const next = { ...reminders, [key]: v }
                setReminders(next)
                saveReminder(next)
              }}
            />
          ))}
        </div>
      </div>

      {/* Save — always visible */}
      <button className="btn btn-primary" style={{ justifyContent: 'center', padding: '.75rem 2rem' }} onClick={save} disabled={saving}>
        {saving ? 'Saving…' : 'Save Policy'}
      </button>
    </div>
  )
}
