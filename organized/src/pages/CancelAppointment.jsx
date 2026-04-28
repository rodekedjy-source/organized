import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

export default function CancelAppointment() {
  const { token } = useParams()

  const [status,      setStatus]      = useState('loading') // loading|ready|already|past|cancelled|error
  const [appointment, setAppointment] = useState(null)
  const [confirming,  setConfirming]  = useState(false)

  useEffect(() => {
    if (!token) { setStatus('error'); return }
    fetchAppointment()
  }, [token])

  async function fetchAppointment() {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/cancel-appointment?token=${token}&check=true`,
        { headers: { 'Content-Type': 'application/json' } }
      )
      const data = await res.json()

      if (data.already_cancelled) { setAppointment(data.appointment); setStatus('already'); return }
      if (res.status === 404)     { setStatus('error'); return }
      if (res.status === 410)     { setAppointment(data.appointment); setStatus('past'); return }

      setAppointment(data.appointment)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }

  async function confirmCancel() {
    setConfirming(true)
    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/cancel-appointment?token=${token}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' } }
      )
      const data = await res.json()

      if (data.cancelled || data.already_cancelled) {
        setStatus('cancelled')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    } finally {
      setConfirming(false)
    }
  }

  function formatDate(iso) {
    if (!iso) return ''
    try {
      return new Date(iso).toLocaleString('en-CA', {
        weekday: 'long', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    } catch { return iso }
  }

  return (
    <div style={styles.page}>
      <style>{pageCSS}</style>

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logo}>Organized.</div>

        {/* ── LOADING ── */}
        {status === 'loading' && (
          <div style={styles.center}>
            <div style={styles.spinner} />
            <p style={styles.sub}>Looking up your appointment…</p>
          </div>
        )}

        {/* ── READY — show appointment + confirm button ── */}
        {status === 'ready' && appointment && (
          <>
            <div style={styles.accentLine} />
            <h1 style={styles.title}>Cancel your appointment</h1>
            <p style={styles.sub}>
              Please review the details below before confirming your cancellation.
            </p>

            <div style={styles.apptCard}>
              <div style={styles.apptHeader}>
                <span style={styles.apptLbl}>Appointment</span>
                <span style={{ ...styles.apptBadge, background: 'rgba(201,168,76,0.12)', color: '#E8C97A', border: '1px solid rgba(201,168,76,0.25)' }}>Confirmed</span>
              </div>
              <div style={styles.apptRows}>
                {[
                  ['Service',  appointment.service_name],
                  ['Date',     formatDate(appointment.scheduled_at)],
                  ['Client',   appointment.client_name],
                ].map(([k, v]) => v && (
                  <div key={k} style={styles.apptRow}>
                    <span style={styles.apptKey}>{k}</span>
                    <span style={styles.apptVal}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.policyNote}>
              By cancelling, you acknowledge the cancellation policy. Deposits may be forfeited for late cancellations.
            </div>

            <button
              style={{ ...styles.btnPrimary, ...(confirming ? styles.btnDisabled : {}) }}
              onClick={confirmCancel}
              disabled={confirming}
            >
              {confirming ? 'Cancelling…' : 'Confirm Cancellation'}
            </button>

            <Link to="/" style={styles.linkBack}>← Keep my appointment</Link>
          </>
        )}

        {/* ── CANCELLED — success state ── */}
        {status === 'cancelled' && (
          <>
            <div style={{ ...styles.accentLine, background: '#56bb86' }} />
            <div style={styles.checkWrap}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#56bb86" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h1 style={styles.title}>Appointment cancelled</h1>
            <p style={styles.sub}>
              Your appointment has been cancelled. A confirmation has been sent to your email address.
            </p>
            {appointment && (
              <div style={styles.apptCard}>
                <div style={styles.apptRows}>
                  {[
                    ['Service', appointment.service_name],
                    ['Was scheduled', formatDate(appointment.scheduled_at)],
                  ].map(([k, v]) => v && (
                    <div key={k} style={styles.apptRow}>
                      <span style={styles.apptKey}>{k}</span>
                      <span style={styles.apptVal}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <p style={{ ...styles.sub, marginTop: 24 }}>
              We hope to see you again. Book a new appointment any time.
            </p>
            <Link to="/" style={styles.btnGhost}>Back to Home</Link>
          </>
        )}

        {/* ── ALREADY CANCELLED ── */}
        {status === 'already' && (
          <>
            <div style={{ ...styles.accentLine, background: '#9A8E7E' }} />
            <h1 style={styles.title}>Already cancelled</h1>
            <p style={styles.sub}>
              This appointment has already been cancelled. No further action is needed.
            </p>
            <Link to="/" style={styles.btnGhost}>Back to Home</Link>
          </>
        )}

        {/* ── PAST — appointment already happened ── */}
        {status === 'past' && (
          <>
            <div style={{ ...styles.accentLine, background: '#9A8E7E' }} />
            <h1 style={styles.title}>Appointment has passed</h1>
            <p style={styles.sub}>
              This appointment has already taken place and can no longer be cancelled.
            </p>
            <Link to="/" style={styles.btnGhost}>Back to Home</Link>
          </>
        )}

        {/* ── ERROR ── */}
        {status === 'error' && (
          <>
            <div style={{ ...styles.accentLine, background: '#d0605a' }} />
            <h1 style={styles.title}>Link not found</h1>
            <p style={styles.sub}>
              This cancellation link is invalid or has expired. Please contact your service provider directly.
            </p>
            <Link to="/" style={styles.btnGhost}>Back to Home</Link>
          </>
        )}

        <div style={styles.footer}>
          Powered by <strong style={{ color: '#C9A84C' }}>Organized.</strong>
        </div>
      </div>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: '100vh',
    background: '#0a0908',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 16px',
    fontFamily: "'DM Sans', -apple-system, sans-serif",
  },
  card: {
    background: '#101010',
    border: '1px solid #242424',
    borderRadius: 4,
    padding: '40px 36px',
    width: '100%',
    maxWidth: 480,
  },
  logo: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 20,
    color: '#C9A84C',
    marginBottom: 32,
  },
  accentLine: {
    width: 40,
    height: 3,
    background: '#C9A84C',
    borderRadius: 2,
    marginBottom: 22,
  },
  title: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 24,
    fontWeight: 500,
    color: '#F0EAE0',
    marginBottom: 12,
    lineHeight: 1.25,
  },
  sub: {
    fontSize: 14,
    color: '#9A8E7E',
    fontWeight: 300,
    lineHeight: 1.75,
    marginBottom: 24,
  },
  apptCard: {
    border: '1px solid #242424',
    background: '#181818',
    marginBottom: 20,
    overflow: 'hidden',
  },
  apptHeader: {
    padding: '12px 18px',
    borderBottom: '1px solid #242424',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  apptLbl: {
    fontSize: 8,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: '#9A8E7E',
  },
  apptBadge: {
    fontSize: 9,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '3px 10px',
    borderRadius: 100,
  },
  apptRows: { padding: '4px 0' },
  apptRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '9px 18px',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    gap: 16,
    fontSize: 13,
  },
  apptKey: { color: '#9A8E7E', flexShrink: 0, fontSize: 12 },
  apptVal: { color: '#CCC0A8', textAlign: 'right', fontWeight: 400 },
  policyNote: {
    fontSize: 11,
    color: '#6B6158',
    fontWeight: 300,
    lineHeight: 1.7,
    marginBottom: 20,
    padding: '12px 14px',
    border: '1px solid #242424',
    background: 'rgba(208,96,90,0.04)',
  },
  btnPrimary: {
    display: 'block',
    width: '100%',
    background: '#d0605a',
    color: '#fff',
    border: 'none',
    padding: '14px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    borderRadius: 1,
    marginBottom: 16,
    transition: 'all 0.25s',
  },
  btnDisabled: {
    background: '#333',
    color: '#9A8E7E',
    cursor: 'not-allowed',
  },
  btnGhost: {
    display: 'block',
    width: '100%',
    background: 'transparent',
    color: '#9A8E7E',
    border: '1px solid #333',
    padding: '13px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 12,
    fontWeight: 400,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    borderRadius: 1,
    textAlign: 'center',
    textDecoration: 'none',
    marginTop: 8,
    transition: 'all 0.2s',
  },
  linkBack: {
    display: 'block',
    textAlign: 'center',
    fontSize: 12,
    color: '#6B6158',
    textDecoration: 'none',
    letterSpacing: '0.06em',
    transition: 'color 0.2s',
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 0',
    gap: 16,
  },
  spinner: {
    width: 32,
    height: 32,
    border: '2px solid #242424',
    borderTop: '2px solid #C9A84C',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  checkWrap: {
    width: 52,
    height: 52,
    border: '1px solid rgba(86,187,134,0.2)',
    background: 'rgba(86,187,134,0.06)',
    borderRadius: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  footer: {
    marginTop: 36,
    paddingTop: 20,
    borderTop: '1px solid #1a1a1a',
    fontSize: 11,
    color: '#444',
    textAlign: 'center',
  },
}

const pageCSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,600&display=swap');
@keyframes spin { to { transform: rotate(360deg); } }
body { margin: 0; padding: 0; background: #0a0908; }
`
