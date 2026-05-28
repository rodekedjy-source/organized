import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { fetchEnrollmentByToken, checkExistingRefundRequest, submitRefundRequest } from '../api/refundRequests'

const GOLD  = '#C9A84C'
const DARK  = '#1A0900'
const SERIF = "'Playfair Display', Georgia, serif"
const SANS  = "'Josefin Sans', sans-serif"

function card(extra) {
  return { background: '#fff', borderRadius: 12, border: '1px solid #EAE6E1', padding: 24, marginBottom: 16, ...extra }
}
function eyebrow(color = GOLD) {
  return { fontSize: '.58rem', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color, marginBottom: 12 }
}

function Shell({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: SANS }}>
      <div style={{ background: DARK, padding: '20px 24px', textAlign: 'center' }}>
        <span
          style={{ fontFamily: SERIF, fontSize: '1.2rem', color: GOLD, cursor: 'pointer' }}
          onClick={() => window.open('https://beorganized.io')}
        >Organized.</span>
      </div>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '28px 20px 48px' }}>
        {children}
      </div>
      <div style={{ textAlign: 'center', padding: '24px 20px', borderTop: '1px solid #EAE6E1' }}>
        <span
          style={{ fontFamily: SERIF, fontSize: '.9rem', color: GOLD, cursor: 'pointer' }}
          onClick={() => window.open('https://beorganized.io')}
        >Organized.</span>
        <div style={{ fontFamily: SANS, fontSize: '.75rem', color: '#B0A898', marginTop: 4 }}>Powered by Organized.</div>
      </div>
    </div>
  )
}

function InfoScreen({ title, sub }) {
  return (
    <Shell>
      <div style={card({ textAlign: 'center', padding: '40px 24px' })}>
        <div style={{ fontFamily: SERIF, fontSize: '1.2rem', color: DARK, marginBottom: 10 }}>{title}</div>
        <div style={{ fontSize: '.85rem', color: '#A09890', lineHeight: 1.6 }}>{sub}</div>
      </div>
    </Shell>
  )
}

export default function RefundRequestPage() {
  const { token } = useParams()
  const [loading,    setLoading]    = useState(true)
  const [enrollment, setEnrollment] = useState(null)
  const [screen,     setScreen]     = useState('form') // 'notFound' | 'alreadyRefunded' | 'requestPending' | 'form' | 'submitted'
  const [reason,     setReason]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError,  setFormError]  = useState(null)

  useEffect(() => {
    if (!token) { setScreen('notFound'); setLoading(false); return }
    ;(async () => {
      const { data: enr, error: enrErr } = await fetchEnrollmentByToken(token)
      if (enrErr || !enr) { setScreen('notFound'); setLoading(false); return }

      if (enr.refunded_at) {
        setEnrollment(enr); setScreen('alreadyRefunded'); setLoading(false); return
      }

      const { data: req } = await checkExistingRefundRequest(enr.id)
      if (req) {
        setEnrollment(enr); setScreen('requestPending'); setLoading(false); return
      }

      setEnrollment(enr)
      setScreen('form')
      setLoading(false)
    })()
  }, [token])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!reason.trim()) { setFormError('Please describe the reason for your refund request.'); return }
    setSubmitting(true)
    setFormError(null)
    const { error } = await submitRefundRequest({
      workspace_id:  enrollment.workspace_id,
      enrollment_id: enrollment.id,
      client_name:   enrollment.client_name,
      client_email:  enrollment.client_email,
      reason:        reason.trim(),
    })
    setSubmitting(false)
    if (error) { setFormError('Something went wrong. Please try again.'); return }
    setScreen('submitted')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAFAF8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: SERIF, fontSize: '1.1rem', color: '#A09890' }}>Loading…</div>
      </div>
    )
  }

  if (screen === 'notFound') {
    return <InfoScreen title="Request not found" sub="This link may have expired or the enrollment doesn't exist." />
  }

  if (screen === 'alreadyRefunded') {
    return <InfoScreen title="Already refunded" sub="This enrollment has already been refunded. No further action is needed." />
  }

  if (screen === 'requestPending') {
    return <InfoScreen title="Request already submitted" sub="A refund request for this enrollment is already pending. The instructor will review it shortly." />
  }

  if (screen === 'submitted') {
    return (
      <Shell>
        <div style={card({ textAlign: 'center', padding: '40px 24px', borderLeft: `3px solid ${GOLD}` })}>
          <div style={{ fontFamily: SERIF, fontSize: '1.4rem', color: GOLD, marginBottom: 12 }}>Request submitted</div>
          <div style={{ fontSize: '.9rem', color: DARK, lineHeight: 1.7 }}>
            Your request has been submitted.<br />The instructor will review it shortly.
          </div>
        </div>
      </Shell>
    )
  }

  const offeringTitle  = enrollment?.offerings?.title || 'Formation'
  const amountDisplay  = `${Number(enrollment?.amount_paid || 0).toFixed(2)} ${(enrollment?.currency || 'CAD').toUpperCase()}`

  return (
    <Shell>

      {/* Info card */}
      <div style={card()}>
        <div style={eyebrow()}>Refund Request</div>
        <div style={{ fontFamily: SERIF, fontSize: '1.15rem', fontWeight: 600, color: DARK, marginBottom: 6 }}>
          {offeringTitle}
        </div>
        <div style={{ fontSize: '.82rem', color: '#7A706A', marginBottom: 12 }}>
          {enrollment?.client_name && <span>{enrollment.client_name} · </span>}
          {enrollment?.client_email}
        </div>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: GOLD }}>{amountDisplay}</div>
      </div>

      {/* Form card */}
      <form onSubmit={handleSubmit}>
        <div style={card()}>
          <div style={eyebrow()}>Reason</div>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Please describe why you're requesting a refund…"
            rows={5}
            style={{
              width: '100%', boxSizing: 'border-box',
              border: '1.5px solid #E0DDD8', borderRadius: 8,
              padding: '12px 14px', fontSize: '.88rem',
              fontFamily: SANS, color: DARK,
              background: '#FAFAF8', resize: 'vertical',
              outline: 'none', lineHeight: 1.6,
            }}
          />
          {formError && (
            <div style={{ marginTop: 8, fontSize: '.78rem', color: '#dc2626' }}>{formError}</div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%', padding: '14px 24px',
            background: submitting ? '#E0DDD8' : DARK,
            color: submitting ? '#A09890' : '#F0EAE0',
            border: 'none', borderRadius: 10,
            fontFamily: SERIF, fontSize: '1rem', fontWeight: 600,
            cursor: submitting ? 'not-allowed' : 'pointer',
            letterSpacing: '.03em', transition: 'background .2s',
          }}
        >
          {submitting ? 'Submitting…' : 'Submit Refund Request'}
        </button>
      </form>

    </Shell>
  )
}
