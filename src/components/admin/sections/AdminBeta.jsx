import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { KpiCard, SecHd, Card, InfoBanner, CenterSpinner, Toast, useToast, fmtDate, timeAgo } from '../AdminShared'

const GOAL = 15

function betaStatus(w) {
  const total = Number(w.appointment_count) || 0
  const thisWeek = Number(w.appointments_this_week) || 0
  if (total === 0) return 'tagged'
  if (thisWeek > 0) return 'active'
  if (w.last_appointment_at) {
    const days = (Date.now() - new Date(w.last_appointment_at).getTime()) / 86400000
    if (days <= 14) return 'inactive'
  }
  return 'churned'
}

const STATUS_ORDER = { churned: 0, inactive: 1, tagged: 2, active: 3 }

const STATUS_PILL = {
  tagged:   { cls: 'pnd', label: 'Tagged' },
  active:   { cls: 'act', label: 'Active' },
  inactive: { cls: 'pnd', label: 'Inactive' },
  churned:  { cls: 'red', label: 'Churned' },
}

function StatusPill({ status }) {
  const { cls, label } = STATUS_PILL[status] || { cls: 'inn', label: status }
  return <span className={`x-pill ${cls}`}>{label}</span>
}

function ConfirmModal({ open, title, body, confirmLabel, onConfirm, onClose, busy }) {
  if (!open) return null
  return (
    <div className="x-modal-overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="x-modal">
        <div className="x-modal-title">{title}</div>
        <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: 'var(--muted2)', lineHeight: 1.65, marginBottom: 20 }}>{body}</div>
        <div className="x-modal-actions">
          <button className="x-btn-cancel" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="x-btn-danger" style={{ padding: '8px 16px', fontSize: 10 }} onClick={onConfirm} disabled={busy}>
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function NoteField({ wsId, initial }) {
  const [value, setValue] = useState(initial || '')
  const [saving, setSaving] = useState(false)

  async function save() {
    if (value === (initial || '')) return
    setSaving(true)
    await supabase.rpc('admin_save_beta_notes', { p_id: wsId, p_notes: value })
    setSaving(false)
  }

  return (
    <textarea
      value={value}
      onChange={e => setValue(e.target.value)}
      onBlur={save}
      placeholder="Add notes about this tester…"
      style={{
        width: '100%', minHeight: 56, resize: 'vertical',
        background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 6,
        padding: '8px 10px', fontFamily: 'DM Mono,monospace', fontSize: 10,
        color: 'var(--muted2)', outline: 'none', lineHeight: 1.55,
        opacity: saving ? 0.6 : 1, transition: 'opacity 0.2s',
      }}
    />
  )
}

function BetaCard({ ws, status, onRemoved }) {
  const [expanded, setExpanded] = useState(false)
  const [confirm,  setConfirm]  = useState(false)
  const [busy,     setBusy]     = useState(false)

  async function removeBeta() {
    setBusy(true)
    const { error } = await supabase.rpc('admin_remove_beta', { p_id: ws.id })
    setBusy(false)
    setConfirm(false)
    onRemoved(ws.id, error)
  }

  const borderColor = status === 'churned' ? 'rgba(239,68,68,0.2)' :
                      status === 'inactive' ? 'rgba(245,158,11,0.2)' :
                      status === 'active'   ? 'rgba(34,197,94,0.15)' : 'var(--border)'

  return (
    <>
      <div style={{
        background: 'var(--surface)', border: `1px solid ${borderColor}`,
        borderRadius: 10, overflow: 'hidden',
      }}>
        {/* Collapsed header row — always visible, clickable */}
        <div
          onClick={() => setExpanded(e => !e)}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
            cursor: 'pointer', userSelect: 'none',
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 7, flexShrink: 0,
            background: 'linear-gradient(135deg,var(--surface2),var(--border2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Cormorant Garamond,serif', fontSize: 15, color: 'var(--gold)', fontWeight: 500,
          }}>
            {(ws.name || ws.slug || '?').charAt(0).toUpperCase()}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--white)' }}>{ws.name || '—'}</div>
              <StatusPill status={status} />
            </div>
            {ws.slug && (
              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--muted)', marginTop: 1 }}>
                @{ws.slug}
              </div>
            )}
          </div>

          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--muted)', flexShrink: 0, textAlign: 'right' }}>
            <div>{fmtDate(ws.created_at)}</div>
            <div style={{ color: expanded ? 'var(--gold)' : 'var(--muted)', marginTop: 2, transition: 'color 0.2s' }}>
              {expanded ? '▴ collapse' : '▾ expand'}
            </div>
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div style={{ borderTop: `1px solid ${borderColor}`, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Stats row */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {[
                { label: 'Last activity', value: ws.last_appointment_at ? timeAgo(ws.last_appointment_at) : 'No activity yet' },
                { label: 'Clients',       value: ws.client_count ?? '—' },
                { label: 'Appointments',  value: ws.appointment_count ?? '—' },
                { label: 'This week',     value: ws.appointments_this_week ?? '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 8, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: 'var(--muted2)' }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Notes */}
            <NoteField wsId={ws.id} initial={ws.beta_notes} />

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ws.email && (
                <button className="x-btn-ghost" onClick={() => window.open(`mailto:${ws.email}`, '_blank')}>
                  📧 Reach out
                </button>
              )}
              {ws.slug && (
                <button className="x-btn-ghost" onClick={() => window.open(`/book/${ws.slug}`, '_blank')}>
                  🔗 View page
                </button>
              )}
              <button
                className="x-btn-danger"
                style={{ marginLeft: 'auto' }}
                disabled={busy}
                onClick={() => setConfirm(true)}
              >
                Remove Beta
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirm}
        title="Remove from Beta"
        body={`This will suspend ${ws.name || ws.slug || 'this workspace'}'s access until official launch. Their account, clients, appointments and all data are fully preserved. They will not be able to log in until they purchase a plan at launch.`}
        confirmLabel="Suspend Access"
        busy={busy}
        onClose={() => setConfirm(false)}
        onConfirm={removeBeta}
      />
    </>
  )
}

export default function AdminBeta() {
  const [betaUsers,       setBetaUsers]       = useState([])
  const [loading,         setLoading]         = useState(true)
  const [waitlist,        setWaitlist]        = useState([])
  const [waitlistLoading, setWaitlistLoading] = useState(true)
  const [sendConfirm,     setSendConfirm]     = useState(false)
  const [sending,         setSending]         = useState(false)
  const { toastMsg, toastType, showToast } = useToast()

  useEffect(() => {
    supabase.rpc('get_workspaces_admin').then(({ data }) => {
      setBetaUsers((data || []).filter(w => w.is_beta))
      setLoading(false)
    })
    loadWaitlist()
  }, [])

  async function loadWaitlist() {
    setWaitlistLoading(true)
    const { data } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    setWaitlist(data || [])
    setWaitlistLoading(false)
  }

  function handleRemoved(wsId, error) {
    if (error) { showToast(`Failed: ${error.message}`, 'err'); return }
    showToast('Access suspended. All data preserved. They will be restored at launch when they pay.')
    setBetaUsers(prev => prev.filter(w => w.id !== wsId))
  }

  async function sendLaunchEmails() {
    setSending(true)
    setSendConfirm(false)
    const { data, error } = await supabase.functions.invoke('send-launch-email')
    setSending(false)
    if (error) { showToast(`Failed: ${error.message}`, 'err'); return }
    showToast(`Emails envoyés avec succès à ${data?.sent ?? 0} personnes`)
    loadWaitlist()
  }

  if (loading) return <CenterSpinner />

  const withStatus = betaUsers.map(w => ({ ...w, _status: betaStatus(w) }))
  const sorted = [...withStatus].sort((a, b) =>
    (STATUS_ORDER[a._status] ?? 9) - (STATUS_ORDER[b._status] ?? 9)
  )

  const total    = betaUsers.length
  const active   = withStatus.filter(w => w._status === 'active').length
  const inactive = withStatus.filter(w => w._status === 'inactive').length
  const churned  = withStatus.filter(w => w._status === 'churned').length
  const pct      = Math.round((total / GOAL) * 100)

  const waitlistTotal    = waitlist.length
  const waitlistNotified = waitlist.filter(r => r.notified_at).length
  const waitlistPending  = waitlistTotal - waitlistNotified

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <InfoBanner id="beta-v2" text="Tag workspaces as beta from the Workspaces section → expand a row → Tag as Beta. Active = booked in last 7 days · Inactive = 7-14 days · Churned = no activity 14+ days. Remove Beta = suspends access until official launch. All data is always preserved." />

      <div className="x-g4" style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>
        <KpiCard label="Goal"     value={GOAL}    change="Beta testers"            changeType="nn" gold />
        <KpiCard label="Tagged"   value={total}   change={`${pct}% of goal`}       changeType={total > 0 ? 'up' : 'nn'} />
        <KpiCard label="Active"   value={active}  change={active > 0 ? '↑ Using platform' : '— None yet'} changeType={active > 0 ? 'up' : 'nn'} />
        <KpiCard label="Inactive" value={inactive} change="7-14 days no activity"  changeType={inactive > 0 ? 'wn' : 'nn'} />
        <KpiCard label="Churned"  value={churned} change="14+ days no activity"    changeType={churned > 0 ? 'wn' : 'nn'} />
      </div>

      {/* Progress bar */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Beta progress</div>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--gold)' }}>{total}/{GOAL}</div>
        </div>
        <div style={{ height: 4, background: 'var(--border2)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: 'linear-gradient(90deg,var(--gold-dim),var(--gold))', borderRadius: 2, transition: 'width 0.6s ease' }} />
        </div>
        {total < GOAL && (
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--muted)', marginTop: 8 }}>
            {GOAL - total} more needed · tag from Workspaces section
          </div>
        )}
      </Card>

      <Card>
        <SecHd title="Beta Testers" right={
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--muted)' }}>
            Churned first · Active last
          </div>
        } />
        {sorted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)', fontSize: 12 }}>
            <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 22, marginBottom: 10, color: 'var(--muted2)' }}>No beta testers yet</div>
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10 }}>
              Go to Workspaces → expand a row → Tag as Beta
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
            {sorted.map(w => (
              <BetaCard key={w.id} ws={w} status={w._status} onRemoved={handleRemoved} />
            ))}
          </div>
        )}
      </Card>

      <Card>
        <div className="x-sec-title" style={{ marginBottom: 14 }}>Instagram DM Template</div>
        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 8, padding: 14, fontSize: 12, lineHeight: 1.75, color: 'var(--muted2)' }}>
          "Hey <strong style={{ color: 'var(--white)' }}>[Prénom]</strong> 👋 — j'ai vu que tu gères tes bookings par DM. Je construis un outil gratuit fait pour les indépendants beauté pour simplifier ça. Je cherche 10 personnes pour le tester avant le lancement. Tu serais partante?"
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
          <button className="x-btn-ghost" onClick={() => showToast('Copied!')}>
            📋 Copy template
          </button>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--muted)' }}>
            {total}/{GOAL} recruited
          </div>
        </div>
      </Card>

      {/* Waitlist card */}
      <Card>
        <SecHd title="Waitlist" right={
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--muted)' }}>
            Suspended page sign-ups
          </div>
        } />

        <div className="x-g4" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 16 }}>
          <KpiCard label="Total signups" value={waitlistTotal} change="Depuis la page suspendue" changeType={waitlistTotal > 0 ? 'up' : 'nn'} />
          <KpiCard label="Notified" value={waitlistNotified} change={waitlistPending > 0 ? `${waitlistPending} en attente` : '— All notified'} changeType={waitlistNotified > 0 ? 'up' : 'nn'} />
        </div>

        {waitlistLoading ? (
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: 'var(--muted)', padding: '12px 0' }}>Loading…</div>
        ) : waitlist.length === 0 ? (
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: 'var(--muted)', padding: '16px 0', textAlign: 'center' }}>
            No signups yet — waitlist form appears on the /suspended page
          </div>
        ) : (
          <table className="x-tbl" style={{ marginBottom: 16 }}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Source</th>
                <th>Workspace</th>
                <th>Joined</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {waitlist.map(r => (
                <tr key={r.id}>
                  <td style={{ fontFamily: 'DM Mono,monospace', fontSize: 10 }}>{r.email}</td>
                  <td style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--muted)' }}>{r.source || '—'}</td>
                  <td style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--muted)' }}>{r.workspace_slug || '—'}</td>
                  <td style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--muted)' }}>{fmtDate(r.created_at)}</td>
                  <td>
                    {r.notified_at
                      ? <span className="x-pill act">Notified ✓</span>
                      : <span className="x-pill inn">Waiting</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <button
          className="x-btn-primary"
          disabled={sending || waitlistPending === 0}
          style={{ width: '100%', justifyContent: 'center', opacity: waitlistPending === 0 ? 0.5 : 1 }}
          onClick={() => setSendConfirm(true)}
        >
          {sending ? 'Envoi en cours…' : `Send Launch Email${waitlistPending > 0 ? ` (${waitlistPending} pending)` : ''}`}
        </button>
      </Card>

      <ConfirmModal
        open={sendConfirm}
        title="Envoyer l'email de lancement"
        body={`Ceci enverra l'email de lancement à ${waitlistPending} personne${waitlistPending !== 1 ? 's' : ''} qui n'ont pas encore été notifiées. Cette action ne peut pas être annulée.`}
        confirmLabel={`Envoyer à ${waitlistPending} personne${waitlistPending !== 1 ? 's' : ''}`}
        busy={sending}
        onClose={() => setSendConfirm(false)}
        onConfirm={sendLaunchEmails}
      />

      <Toast msg={toastMsg} type={toastType} />
    </div>
  )
}
