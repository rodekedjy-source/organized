import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const G = '#c9a84c'
const LABEL = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!']

function Stars({ rating, onRate }) {
  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', padding: '4px 0' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          onClick={() => onRate(n)}
          style={{
            fontSize: '2.6rem',
            cursor: 'pointer',
            color: n <= rating ? G : '#ddd8d0',
            transition: 'color .15s, transform .1s',
            transform: n <= rating ? 'scale(1.12)' : 'scale(1)',
            display: 'inline-block',
            lineHeight: 1,
            WebkitTapHighlightColor: 'transparent',
            userSelect: 'none',
            touchAction: 'manipulation',
          }}
        >★</span>
      ))}
    </div>
  )
}

function Shell({ children }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#faf8f5',
      fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        background: '#1a1814',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: '1.1rem',
          color: G,
          letterSpacing: '.04em',
        }}>Organized.</span>
      </div>
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '2rem 1.25rem 3rem',
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 20,
          padding: '2.25rem 1.75rem',
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 4px 40px rgba(26,24,20,.08)',
        }}>
          {children}
        </div>
      </div>
      <div style={{ textAlign: 'center', padding: '1.25rem', fontSize: '.72rem', color: '#b0aba4' }}>
        Powered by <strong style={{ color: G }}>Organized.</strong> — beorganized.io
      </div>
    </div>
  )
}

export default function ReviewPage() {
  const { token } = useParams()
  const [state, setState] = useState('loading')
  const [appt, setAppt] = useState(null)
  const [workspace, setWorkspace] = useState(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const { data: apptData, error: apptErr } = await supabase
          .from('appointments')
          .select('id, client_name, service_name, workspace_id, scheduled_at')
          .eq('cancellation_token', token)
          .single()
        if (apptErr || !apptData) { setState('error'); return }
        const { data: existing } = await supabase
          .from('reviews')
          .select('id')
          .eq('appointment_id', apptData.id)
          .maybeSingle()
        if (existing) { setState('already'); return }
        const { data: ws } = await supabase
          .from('workspaces')
          .select('id, name, slug, google_review_url')
          .eq('id', apptData.workspace_id)
          .single()
        setAppt(apptData)
        setWorkspace(ws)
        setState('form')
      } catch { setState('error') }
    }
    load()
  }, [token])

  async function submit() {
    if (rating === 0 || submitting) return
    setSubmitting(true)
    setSubmitError('')
    const { error } = await supabase.from('reviews').insert({
      workspace_id: appt.workspace_id,
      appointment_id: appt.id,
      client_name: appt.client_name,
      service_name: appt.service_name || null,
      rating,
      body: comment.trim() || null,
      entity_type: 'appointment',
      reviewer_name: appt.client_name || 'Anonymous',
      is_approved: false,
    })
    if (error) { setSubmitError('Something went wrong. Please try again.'); setSubmitting(false); return }
    setState('success')
    setSubmitting(false)
  }

  if (state === 'loading') return <Shell><div style={{ textAlign: 'center', padding: '2rem 0', color: '#9a9490' }}>Loading…</div></Shell>

  if (state === 'error') return (
    <Shell>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔗</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.25rem', color: '#1a1814', marginBottom: '.75rem' }}>Link not found</div>
        <p style={{ fontSize: '.85rem', color: '#7a7774', lineHeight: 1.6, margin: 0 }}>This review link is invalid or has expired. Please contact the studio directly.</p>
      </div>
    </Shell>
  )

  if (state === 'already') return (
    <Shell>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✅</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.25rem', color: '#1a1814', marginBottom: '.75rem' }}>Already submitted</div>
        <p style={{ fontSize: '.85rem', color: '#7a7774', lineHeight: 1.6, margin: 0 }}>You've already left a review for this appointment. Thank you!</p>
      </div>
    </Shell>
  )

  if (state === 'success') return (
    <Shell>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f0faf5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2e7d52" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.35rem', color: '#1a1814', marginBottom: '.5rem' }}>
          Thank you{appt?.client_name ? `, ${appt.client_name.split(' ')[0]}` : ''}!
        </div>
        <p style={{ fontSize: '.85rem', color: '#7a7774', lineHeight: 1.7, margin: '0 auto', maxWidth: 300 }}>
          Your review has been received and will appear on {workspace?.name}'s page after approval.
        </p>
        {workspace?.google_review_url && (
          <div style={{ marginTop: '2rem', padding: '1.25rem', background: '#faf8f5', borderRadius: 12, border: '1px solid #ece9e4' }}>
            <div style={{ fontSize: '.78rem', color: '#7a7774', marginBottom: '.75rem', lineHeight: 1.5 }}>
              Loved it? Help others find {workspace.name} on Google too.
            </div>
            <a href={workspace.google_review_url} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', padding: '10px 22px', background: '#1a1814', color: '#fff', borderRadius: 8, fontSize: '.82rem', fontWeight: 600, textDecoration: 'none' }}>
              Leave a Google review →
            </a>
          </div>
        )}
      </div>
    </Shell>
  )

  return (
    <Shell>
      <div style={{ width: 36, height: 3, background: G, borderRadius: 2, marginBottom: '1.5rem' }}/>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.3rem', color: '#1a1814', marginBottom: '.35rem' }}>
        How was your visit?
      </div>
      <div style={{ fontSize: '.82rem', color: '#9a9490', marginBottom: '2rem', lineHeight: 1.5 }}>
        {appt?.service_name ? `Your ${appt.service_name} at ${workspace?.name}` : `Your visit at ${workspace?.name}`}
      </div>

      <Stars rating={rating} onRate={setRating}/>

      <div style={{ textAlign: 'center', marginTop: '.65rem', marginBottom: '1.75rem', minHeight: '1.4rem', fontSize: '.92rem', fontWeight: 600, color: G }}>
        {rating > 0 ? LABEL[rating] : ''}
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '.7rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9a9490', marginBottom: '.5rem' }}>
          Your experience (optional)
        </label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={4}
          placeholder="Tell us about your visit…"
          style={{
            width: '100%', border: '1px solid #e4e0d8', borderRadius: 10,
            padding: '12px 14px', fontSize: '1rem', fontFamily: 'inherit',
            color: '#1a1814', outline: 'none', resize: 'none',
            background: '#fdfcfa', boxSizing: 'border-box', lineHeight: 1.6,
            WebkitAppearance: 'none',
          }}
        />
      </div>

      {submitError && (
        <div style={{ marginBottom: '1rem', padding: '.75rem 1rem', background: 'rgba(192,57,43,.06)', border: '1px solid rgba(192,57,43,.2)', borderRadius: 8, fontSize: '.8rem', color: '#c0392b' }}>
          {submitError}
        </div>
      )}

      <button
        onClick={submit}
        disabled={rating === 0 || submitting}
        style={{
          width: '100%', padding: '15px',
          background: rating > 0 ? '#1a1814' : '#e8e4de',
          color: rating > 0 ? '#fff' : '#9a9490',
          border: 'none', borderRadius: 10, fontSize: '1rem', fontWeight: 600,
          cursor: rating > 0 ? 'pointer' : 'not-allowed',
          fontFamily: 'inherit', transition: 'background .2s, color .2s',
          opacity: submitting ? .65 : 1,
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
        }}
      >
        {submitting ? 'Submitting…' : rating === 0 ? 'Select a rating first' : 'Submit Review'}
      </button>

      <p style={{ textAlign: 'center', fontSize: '.72rem', color: '#b0aba4', marginTop: '1rem', lineHeight: 1.5 }}>
        Your review will be visible after approval by {workspace?.name}.
      </p>
    </Shell>
  )
}
