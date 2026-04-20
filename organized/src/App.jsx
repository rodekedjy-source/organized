import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Landing    from './pages/Landing'
import Auth       from './pages/Auth'
import Dashboard  from './pages/Dashboard'
import ClientPage from './pages/ClientPage'

export default function App() {
  const [session,   setSession]   = useState(null)
  const [onboarded, setOnboarded] = useState(false)
  const [loading,   setLoading]   = useState(true)

  async function checkOnboarding(sess) {
    if (!sess) { setOnboarded(false); return }
    try {
      const { data } = await supabase
        .from('workspaces')
        .select('id')
        .eq('user_id', sess.user.id)
        .maybeSingle()
      setOnboarded(!!data)
    } catch {
      setOnboarded(false)
    }
  }

  useEffect(() => {
    // onAuthStateChange fires INITIAL_SESSION immediately on mount —
    // no need for a separate getSession() call.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)

        if (event === 'INITIAL_SESSION') {
          // First event on page load — always exits loading state
          await checkOnboarding(session)
          setLoading(false)
        }

        if (event === 'SIGNED_IN') {
          await checkOnboarding(session)
        }

        if (event === 'SIGNED_OUT') {
          setOnboarded(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // ── Splash ───────────────────────────────────────────────────
  if (loading) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f7f5f0',
    }}>
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '1.5rem',
        color: '#b5893a',
        letterSpacing: '.02em',
      }}>
        Organized<span style={{ color: '#0d0c0a' }}>.</span>
      </div>
    </div>
  )

  // ── 3 states ─────────────────────────────────────────────────
  // 1. No session          → /auth (or landing)
  // 2. Session, no workspace → /auth (onboarding)
  // 3. Session + workspace → /dashboard
  const isReady = !!(session && onboarded)

  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route
        path="/auth"
        element={
          isReady
            ? <Navigate to="/dashboard" replace />
            : <Auth
                onAuth={setSession}
                onOnboarded={() => setOnboarded(true)}
              />
        }
      />

      <Route
        path="/dashboard/*"
        element={
          !session   ? <Navigate to="/auth" replace /> :
          !onboarded ? <Navigate to="/auth" replace /> :
          <Dashboard session={session} />
        }
      />

      <Route path="/:slug" element={<ClientPage />} />
    </Routes>
  )
}
