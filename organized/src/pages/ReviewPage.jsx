import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const G = '#c9a84c'

function Stars({ rating, hovered, onRate, onHover, onLeave, readonly }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {[1, 2, 3, 4, 5].map(n => {
        const filled = readonly ? n <= rating : n <= (hovered || rating)
        return (
          <span key={n}
            onClick={() => !readonly && onRate(n)}
            onMouseEnter={() => !readonly && onHover(n)}
            onMouseLeave={() => !readonly && onLeave()}
            style={{
              fontSize: '2.2rem',
              cursor: readonly ? 'default' : 'pointer',
              color: filled ? G : '#e0dbd4',
              transition: 'color .12s, transform .1s',
              transform: !readonly && n <= (hovered || rating) ? 'scale(1.15)' : 'scale(1)',
              display: 'inline-block',
              lineHeight: 1,
            }}>★</span>
        )
      })}
    </div>
  )
}

const LABEL = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!']

export default function ReviewPage() {
  const { token } = useParams()
  const [state, setState] = useState('loading') // loading | form | success | error | already
  const [appt, setAppt] = useState(null)
  const [workspace, setWorkspace] = useState(null)
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        // 1. Find appointment by cancellation_token
        const { data: apptData, error: apptErr } = await supabase
          .from('appointments')
          .select('id, client_name, service_name, workspace_id, scheduled_at')
          .eq('cancellation_token', token)
          .single()

        if (apptErr || !apptData) { setState('error'); return }

        // 2. Check if already reviewed for this appointment
        const { data: existing } = await supabase
          .from('reviews')
          .select('id')
          .eq('appointment_id', apptData.id)
          .maybeSingle()

        if (existing) { setState('already'); return }

        // 3. Load workspace (name + optional google link)
        const { data: ws } = await supabase
          .from('workspaces')
          .select('id, name, slug, google_review_url')
          .eq('id', apptData.workspace_id)
          .single()

        setAppt(apptData)
        setWorkspace(ws)
        setState('form')
      } catch {
        setState('error')
      }
    }
    load()
  }, [token])

  async function submit() {
    if (rating === 0 || submitting) return
    setSubmitting(true)
    const { error } = await supabase.from('reviews').insert({
      workspace_id: appt.workspace_id,
      appointment_id: appt.id,
      client_name: appt.client_name,
      service_name: appt.service_name || null,
      rating,
      body: comment.trim() || null,
      is_approved: false,
    })
    if (error) { setSubmitting(false); return }
    setState('success')
    setSubmitting(false)
  }

  // ── Shared shell ─────────────────────────────────────────────
  function Shell({ children }) {
    return (
      <div style={{
        minHeight: '100vh', background: '#faf8f5',
        fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          background: '#1a1814', padding: '1rem 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: "'Playfair Display',serif", fontSize: '1.1rem',
            color: G, letterSpacing: '.04em',
          }}>Organized.</span>
        </div>

        {/* Card */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: '2rem 1.25rem',
        }}>
          <div style={{
            background: '#fff', borderRadius: 20, padding: '2.5rem 2rem',
            width: '100%', maxWidth: 420,
            boxShadow: '0 4px 40px rgba(26,24,20,.08)',
          }}>
            {children}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center', padding: '1.25rem',
          fontSize: '.72rem', color: '#b0aba4',
        }}>
          Powered by <strong style={{ color: G }}>Organized.</strong> — beorganized.io
        </div>
      </div>
    )
  }

  // ── Loading ───────────────────────────────────────────────────
  if (state === 'loading') return (
    <Shell>
      <div style={{ textAlign: 'center', padding: '2rem 0', color: '#9a9490', fontSize: '.9rem' }}>
        Loading…
      </div>
    </Shell>
  )

  // ── Error ─────────────────────────────────────────────────────
  if (state === 'error') return (
    <Shell>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔗</div>
        <div style={{
          fontFamily: "'Playfair Display',serif", fontSize: '1.3rem',
          color: '#1a1814', marginBottom: '.75rem',
        }}>Link not found</div>
        <p style={{ fontSize: '.85rem', color: '#7a7774', lineHeight: 1.6, margin: 0 }}>
          This review link is invalid or has expired. Please contact the studio directly.
        </p>
      </div>
    </Shell>
  )

  // ── Already reviewed ──────────────────────────────────────────
  if (state === 'already') return (
    <Shell>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✅</div>
        <div style={{
          fontFamily: "'Playfair Display',serif", fontSize: '1.3rem',
          color: '#1a1814', marginBottom: '.75rem',
        }}>Review already submitted</div>
        <p style={{ fontSize: '.85rem', color: '#7a7774', lineHeight: 1.6, margin: 0 }}>
          You've already left a review for this appointment. Thank you for your feedback!
        </p>
      </div>
    </Shell>
  )

  // ── Success ───────────────────────────────────────────────────
  if (state === 'success') return (
    <Shell>
      <div style={{ textAlign: 'center' }}>
        {/* Check */}
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: '#f0faf5', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2e7d52" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <div style={{
          fontFamily: "'Playfair Display',serif", fontSize: '1.4rem',
          color: '#1a1814', marginBottom: '.5rem',
        }}>Thank you, {appt?.client_name?.split(' ')[0] || 'friend'}!</div>
        <p style={{
          fontSize: '.85rem', color: '#7a7774',
          lineHeight: 1.7, marginBottom: 0, maxWidth: 300, margin: '0 auto',
        }}>
          Your review has been received. {workspace?.name} will review it shortly.
        </p>

        {/* Optional Google nudge */}
        {workspace?.google_review_url && (
          <div style={{
            marginTop: '2rem', padding: '1.25rem',
            background: '#faf8f5', borderRadius: 12,
            border: '1px solid #ece9e4',
          }}>
            <div style={{ fontSize: '.78rem', color: '#7a7774', marginBottom: '.75rem', lineHeight: 1.5 }}>
              Loved your experience? Help others find {workspace.name} on Google too.
            </div>
            <a href={workspace.google_review_url} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-block', padding: '10px 22px',
                background: '#1a1814', color: '#fff',
                borderRadius: 8, fontSize: '.82rem', fontWeight: 600,
                textDecoration: 'none', fontFamily: 'inherit',
              }}>
              Also leave a Google review →
            </a>
          </div>
        )}
      </div>
    </Shell>
  )

  // ── Review Form ───────────────────────────────────────────────
  return (
    <Shell>
      {/* Gold bar */}
      <div style={{ width: 36, height: 3, background: G, borderRadius: 2, marginBottom: '1.5rem' }}/>

      <div style={{
        fontFamily: "'Playfair Display',serif", fontSize: '1.35rem',
        color: '#1a1814', marginBottom: '.35rem',
      }}>
        How was your visit?
      </div>
      <div style={{ fontSize: '.82rem', color: '#9a9490', marginBottom: '1.75rem', lineHeight: 1.5 }}>
        {appt?.service_name
          ? `Your ${appt.service_name} at ${workspace?.name}`
          : `Your visit at ${workspace?.name}`
        }
      </div>

      {/* Stars */}
      <Stars
        rating={rating} hovered={hovered}
        onRate={setRating}
        onHover={setHovered}
        onLeave={() => setHovered(0)}
      />

      {/* Star label */}
      <div style={{
        textAlign: 'center', height: '1.5rem', marginTop: '.6rem', marginBottom: '1.5rem',
        fontSize: '.88rem', fontWeight: 600,
        color: rating > 0 ? G : 'transparent',
        transition: 'color .15s',
      }}>
        {LABEL[hovered || rating] || '‎'}
      </div>

      {/* Comment */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'block', fontSize: '.7rem', fontWeight: 600,
          letterSpacing: '.1em', textTransform: 'uppercase',
          color: '#9a9490', marginBottom: '.5rem',
        }}>
          Your experience (optional)
        </label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={4}
          placeholder="Tell us about your visit…"
          style={{
            width: '100%', border: '1px solid #e4e0d8', borderRadius: 10,
            padding: '12px 14px', fontSize: '.9rem', fontFamily: 'inherit',
            color: '#1a1814', outline: 'none', resize: 'none',
            background: '#fdfcfa', boxSizing: 'border-box',
            transition: 'border .15s', lineHeight: 1.6,
          }}
          onFocus={e => e.target.style.borderColor = G}
          onBlur={e => e.target.style.borderColor = '#e4e0d8'}
        />
      </div>

      {/* Submit */}
      <button
        onClick={submit}
        disabled={rating === 0 || submitting}
        style={{
          width: '100%', padding: '14px',
          background: rating > 0 ? '#1a1814' : '#e4e0d8',
          color: rating > 0 ? '#fff' : '#9a9490',
          border: 'none', borderRadius: 10,
          fontSize: '.9rem', fontWeight: 600,
          cursor: rating > 0 ? 'pointer' : 'not-allowed',
          fontFamily: 'inherit', transition: 'all .2s',
          opacity: submitting ? .6 : 1,
        }}>
        {submitting ? 'Submitting…' : 'Submit Review'}
      </button>

      <p style={{
        textAlign: 'center', fontSize: '.72rem',
        color: '#b0aba4', marginTop: '1rem', lineHeight: 1.5,
      }}>
        Your review will be visible after approval by {workspace?.name}.
      </p>
    </Shell>
  )
}
