import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Suspended() {
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400&family=DM+Mono:wght@300;400&display=swap'
    document.head.appendChild(link)
    return () => { if (document.head.contains(link)) document.head.removeChild(link) }
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
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

      {/* Subtle gold glow blob */}
      <div style={{
        position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: 400, height: 200,
        background: 'radial-gradient(ellipse, rgba(201,168,76,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Wave decorations */}
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

        {/* Logo */}
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

        {/* Divider */}
        <div style={{
          width: 40, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)',
          margin: '0 auto 2.5rem',
        }} />

        {/* Title */}
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

        {/* Main message */}
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

        {/* Subtitle */}
        <p style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '0.72rem',
          color: '#C9A84C',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          margin: '0 0 2.5rem',
        }}>
          Lancement bientôt — restez à l'écoute.
        </p>

        {/* Divider */}
        <div style={{
          width: 40, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)',
          margin: '0 auto 2.5rem',
        }} />

        {/* Contact */}
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

        {/* Sign out */}
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
