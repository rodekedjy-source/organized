import { useState } from 'react'
import { formatCurrency } from '../lib/formatters'
import { cancelAppointment, completeAppointment, updateAppointmentStatus } from '../api/appointments'

function svcName(a) { return a.services?.name || a.service_name || '—' }

const CANCEL_REASONS = [
  'Client cancelled — last minute',
  'Client no-show',
  'Cancelled by studio',
  'Other',
]

// ── Cancel sub-flow ───────────────────────────────────────────────────────────
function CancelSubFlow({ appt, onConfirm, onBack, saving }) {
  const [reason, setReason]           = useState('')
  const [depositAction, setDepositAction] = useState('keep')
  const radio = { accentColor: 'var(--gold)', width: 16, height: 16, flexShrink: 0, cursor: 'pointer' }
  const row   = { display: 'flex', alignItems: 'center', gap: '.7rem', padding: '.45rem 0', cursor: 'pointer' }
  const secHd = { fontSize: '.67rem', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.5rem' }

  return (
    <>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.1rem', color: 'var(--ink)', marginBottom: 4 }}>Cancel Appointment</div>
      <div style={{ fontSize: '.8rem', color: 'var(--ink-3)', marginBottom: '1.4rem' }}>{appt.client_name} · {svcName(appt)}</div>

      <div style={secHd}>Reason</div>
      {CANCEL_REASONS.map(r => (
        <label key={r} style={row}>
          <input type="radio" name="cancel-reason" value={r} checked={reason === r}
            onChange={() => setReason(r)} style={radio} />
          <span style={{ fontSize: '.88rem', color: 'var(--ink)' }}>{r}</span>
        </label>
      ))}

      {reason && (
        <>
          <div style={{ height: 1, background: 'var(--border)', margin: '1.1rem 0' }} />
          <div style={secHd}>Deposit</div>
          {[
            { val: 'keep',   label: 'Keep deposit — non-refundable' },
            { val: 'refund', label: 'Refund deposit to client' },
          ].map(opt => (
            <label key={opt.val} style={row}>
              <input type="radio" name="deposit-action" value={opt.val} checked={depositAction === opt.val}
                onChange={() => setDepositAction(opt.val)} style={radio} />
              <span style={{ fontSize: '.88rem', color: 'var(--ink)' }}>{opt.label}</span>
            </label>
          ))}
        </>
      )}

      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
        <button
          disabled={!reason || saving}
          onClick={() => onConfirm(reason, depositAction)}
          style={{ height: 48, borderRadius: 8, border: '1px solid var(--red)', color: 'var(--red)', background: 'transparent', fontSize: '.88rem', fontWeight: 600, cursor: reason && !saving ? 'pointer' : 'not-allowed', fontFamily: 'inherit', opacity: !reason || saving ? .45 : 1, transition: 'opacity .15s' }}>
          {saving ? 'Cancelling…' : 'Cancel & Confirm'}
        </button>
        <button onClick={onBack}
          style={{ height: 48, borderRadius: 8, border: '1px solid var(--border)', color: 'var(--ink-2)', background: 'transparent', fontSize: '.88rem', cursor: 'pointer', fontFamily: 'inherit' }}>
          Go Back
        </button>
      </div>
    </>
  )
}

// ── Appointment detail sheet ──────────────────────────────────────────────────
export default function AppointmentDetailSheet({ appt, onClose, onRefresh, toast }) {
  const [view,   setView]   = useState('detail') // 'detail' | 'cancel'
  const [acting, setActing] = useState(false)

  const status  = appt.status
  const dt      = new Date(appt.scheduled_at)
  const dateStr = dt.toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' })
  const timeStr = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const durMin  = appt.duration_min || appt.services?.duration_min

  // Generic action runner — fn must return { error }
  async function act(fn, msg) {
    setActing(true)
    const { error } = await fn()
    setActing(false)
    if (error) { toast('Something went wrong.'); return }
    toast(msg); onRefresh(); onClose()
  }

  async function handleCancel(reason, depositAction) {
    setActing(true)
    const { error } = await cancelAppointment(appt.id, reason)
    if (error) { setActing(false); toast('Something went wrong.'); return }
    if (depositAction === 'refund' && appt.stripe_payment_intent_id) {
      const url = import.meta.env.VITE_SUPABASE_URL
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY
      await fetch(`${url}/functions/v1/cancel-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: key },
        body: JSON.stringify({ payment_intent_id: appt.stripe_payment_intent_id, appointment_id: appt.id }),
      }).catch(() => {})
    }
    setActing(false)
    toast('Appointment cancelled.'); onRefresh(); onClose()
  }

  const btnBase   = { width: '100%', height: 48, borderRadius: 8, fontSize: '.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity .15s', border: 'none' }
  const btnGold   = { ...btnBase, background: 'var(--gold)', color: '#fff' }
  const btnDanger = { ...btnBase, background: 'transparent', border: '1px solid var(--red)', color: 'var(--red)', fontWeight: 600 }
  const btnGhost  = { ...btnBase, background: 'transparent', border: '1px solid var(--border)', color: 'var(--ink-3)', fontWeight: 400, opacity: .45, cursor: 'not-allowed' }

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 290 }} onClick={onClose} />
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 300, background: 'var(--surface)', borderRadius: '16px 16px 0 0', padding: '1rem 1.5rem 2.5rem', maxHeight: '82vh', overflowY: 'auto', boxShadow: '0 -8px 40px rgba(0,0,0,.18)', animation: 'apptSheetUp .28s cubic-bezier(.25,.46,.45,.94)' }}>
        <style>{`@keyframes apptSheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>

        {/* Drag handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border-2)', margin: '0 auto 1.25rem' }} />

        {view === 'cancel' ? (
          <CancelSubFlow appt={appt} onConfirm={handleCancel} onBack={() => setView('detail')} saving={acting} />
        ) : (
          <>
            {/* Header */}
            <div style={{ marginBottom: '1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '.5rem', marginBottom: '.3rem' }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.25rem', color: 'var(--ink)', fontWeight: 500 }}>{appt.client_name}</div>
                <span className={`badge badge-${status}`} style={{ flexShrink: 0, marginTop: 4 }}>{status}</span>
              </div>
              <div style={{ fontSize: '.85rem', color: 'var(--ink-2)', marginBottom: '.2rem' }}>{svcName(appt)}</div>
              <div style={{ fontSize: '.77rem', color: 'var(--ink-3)' }}>
                {dateStr} · {timeStr}{durMin ? ` · ${durMin} min` : ''}
              </div>
              <div style={{ marginTop: '.45rem', fontFamily: "'Playfair Display',serif", fontSize: '1.05rem', color: 'var(--ink)' }}>
                {formatCurrency(appt.amount)}
              </div>
            </div>

            <div style={{ height: 1, background: 'var(--border)', marginBottom: '1.1rem' }} />

            {/* Confirmed actions */}
            {status === 'confirmed' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                <button style={btnGold} disabled={acting} onClick={() => act(() => completeAppointment(appt.id), 'Marked as completed.')}>
                  {acting ? 'Saving…' : 'Mark as Completed'}
                </button>
                <button style={btnDanger} disabled={acting} onClick={() => setView('cancel')}>
                  Cancel Appointment
                </button>
                <button style={btnGhost} disabled title="Coming soon">
                  Reschedule
                </button>
              </div>
            )}

            {/* Pending actions */}
            {status === 'pending' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                <button style={btnGold} disabled={acting}
                  onClick={() => act(() => updateAppointmentStatus(appt.id, 'confirmed'), 'Confirmed.')}>
                  {acting ? 'Saving…' : 'Confirm'}
                </button>
                <button style={btnDanger} disabled={acting}
                  onClick={() => act(() => cancelAppointment(appt.id, 'Declined by studio'), 'Declined.')}>
                  Decline
                </button>
              </div>
            )}

            {/* Read-only states */}
            {(status === 'completed' || status === 'cancelled') && (
              <div style={{ padding: '1rem 1.1rem', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)', fontSize: '.85rem', color: 'var(--ink-3)', lineHeight: 1.6 }}>
                {status === 'completed'
                  ? 'This appointment has been completed.'
                  : 'This appointment was cancelled.'}
                {status === 'cancelled' && appt.cancellation_reason && (
                  <div style={{ marginTop: '.35rem', fontSize: '.78rem' }}>Reason: {appt.cancellation_reason}</div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
