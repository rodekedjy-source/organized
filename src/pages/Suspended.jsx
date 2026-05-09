import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Suspended() {
  const [email,       setEmail]       = useState('')
  const [status,      setStatus]      = useState(null) // null | 'success' | 'duplicate' | 'error'
  const [submitting,  setSubmitting]  = useState(false)

  const slug = window.location.pathname.replace(/^\//, '') || null

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400&family=DM+Mono:wght@300;400&display=swap'
    document.head.appendChild(link)
    return () => { if (document.head.contains(link)) document.head.removeChild(link) }
  }, [])

  useEffect(() => {
    let interval = null

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return

      interval = setInterval(async () => {
        const { data: ws } = await supabase
          .from('workspaces')
          .select('beta_suspended, is_published, is_beta')
          .eq('user_id', session.user.id)
          .single()

        if (!ws) return

        if (ws.beta_suspended === false) {
          clearInterval(interval)
          window.location.href = '/dashboard'
        }
      }, 3000)
    })

    return () => { if (interval) clearInterval(interval) }
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  async function joinWaitlist(e) {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitting(true)
    const { error } = await supabase.from('waitlist').insert({
      email: email.trim().toLowerCase(),
      source: 'suspended_page',
      workspace_slug: slug,
    })
    setSubmitting(false)
    if (!error) {
      setStatus('success')
    } else if (error.code === '23505') {
      setStatus('duplicate')
    } else {
      setStatus('error')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 30% 20%, #1a1208 0%, #0a0805 60%, #080603 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: "'DM Sans', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>

      <div style={{
        position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: 400, height: 200,
        background: 'radial-gradient(ellipse, rgba(201,168,76,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <svg style={{ position: 'absolute', bottom: 0, left: 0, right: 0, opacity: 0.06 }}
        viewBox="0 0 1440 200" preserveAspectRatio="none" height="200">
        <path d="M0,100 C240,160 480,40 720,100 C960,160 1200,40 1440,100 L1440,200 L0,200 Z"
          fill="#C9A84C" />
      </svg>
      <svg style={{ position: 'absolute', bottom: 0, left: 0, right: 0, opacity: 0.04 }}
        viewBox="0 0 1440 200" preserveAspectRatio="none" height="200">
        <path d="M0,140 C360,80 720,180 1080,120 C1260,90 1380,150 1440,140 L1440,200 L0,200 Z"
          fill="#C9A84C" />
      </svg>

      <div style={{ textAlign: 'center', maxWidth: 480, position: 'relative', zIndex: 1 }}>

        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1.9rem',
          fontWeight: 400,
          color: '#C9A84C',
          letterSpacing: '0.04em',
          marginBottom: '2.5rem',
        }}>
          Organized.
        </div>

        <div style={{
          width: 40, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)',
          margin: '0 auto 2.5rem',
        }} />

        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '2.4rem',
          fontWeight: 300,
          color: '#f0ebe0',
          margin: '0 0 1.25rem',
          lineHeight: 1.2,
          letterSpacing: '0.01em',
        }}>
          Accès suspendu
        </h1>

        <p style={{
          fontSize: '1rem',
          color: '#a09070',
          lineHeight: 1.75,
          margin: '0 0 1rem',
          fontWeight: 300,
        }}>
          Merci d'avoir participé à notre beta.
          Votre compte et toutes vos données sont préservés.
          Vous pourrez vous reconnecter lors du lancement officiel
          et retrouver exactement où vous en étiez.
        </p>

        <p style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '0.72rem',
          color: '#C9A84C',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          margin: '0 0 1.5rem',
        }}>
          Lancement bientôt — restez à l'écoute.
        </p>

        {/* Waitlist */}
        <div style={{
          width: 40, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.2), transparent)',
          margin: '0 auto 1.5rem',
        }} />

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '0.85rem',
          color: '#7a6040',
          margin: '0 0 1.25rem',
          letterSpacing: '0.02em',
        }}>
          Soyez parmi les premiers à savoir.
        </p>

        {status === 'success' ? (
          <p style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '0.72rem',
            color: '#C9A84C',
            letterSpacing: '0.08em',
            margin: '0 0 2rem',
          }}>
            ✓ Vous serez notifié le jour du lancement.
          </p>
        ) : status === 'duplicate' ? (
          <p style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '0.72rem',
            color: '#8a7050',
            letterSpacing: '0.06em',
            margin: '0 0 2rem',
          }}>
            Vous êtes déjà sur la liste. À bientôt.
          </p>
        ) : (
          <form onSubmit={joinWaitlist} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Votre adresse email"
              style={{
                width: '100%',
                maxWidth: 320,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(201,168,76,0.3)',
                borderRadius: 8,
                padding: '12px 16px',
                color: '#f0ebe0',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                maxWidth: 320,
                background: submitting ? 'rgba(201,168,76,0.5)' : '#C9A84C',
                color: '#1a1208',
                border: 'none',
                borderRadius: 8,
                padding: '12px 16px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.85rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
              }}
            >
              {submitting ? '…' : 'Me notifier au lancement'}
            </button>
            {status === 'error' && (
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', color: '#aa5555', margin: 0 }}>
                Une erreur est survenue. Réessayez.
              </p>
            )}
          </form>
        )}

        <div style={{
          width: 40, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)',
          margin: '0 auto 2.5rem',
        }} />

        <p style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '0.7rem',
          color: '#665544',
          letterSpacing: '0.06em',
          margin: '0 0 2.5rem',
        }}>
          Des questions ?{' '}
          <a href="mailto:hello@beorganized.io" style={{ color: '#C9A84C', textDecoration: 'none' }}>
            hello@beorganized.io
          </a>
        </p>

        <button
          onClick={signOut}
          style={{
            background: 'none',
            border: '1px solid rgba(201,168,76,0.25)',
            borderRadius: 6,
            color: '#665544',
            fontFamily: "'DM Mono', monospace",
            fontSize: '0.68rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '0.6rem 1.4rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#C9A84C'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#665544'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.25)' }}
        >
          Se déconnecter
        </button>
      </div>
    </div>
  )
}
