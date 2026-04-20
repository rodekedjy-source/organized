import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Landing   from './pages/Landing'
import Auth      from './pages/Auth'
import Dashboard from './pages/Dashboard'
import ClientPage from './pages/ClientPage'

export default function App() {
  const [session,   setSession]   = useState(null)
  const [onboarded, setOnboarded] = useState(false)
  const [loading,   setLoading]   = useState(true)

  // Single source of truth: does this user have a workspace?
  async function checkOnboarding(sess) {
    if (!sess) { setOnboarded(false); return }
    const { data } = await supabase
      .from('workspaces')
      .select('id')
      .eq('user_id', sess.user.id)
      .maybeSingle()
    setOnboarded(!!data)
  }

  useEffect(() => {
    // Initial load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      await checkOnboarding(session)
      setLoading(false)
    })

    // Auth state changes (login, logout, OAuth callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        if (event === 'SIGNED_IN')  await checkOnboarding(session)
        if (event === 'SIGNED_OUT') setOnboarded(false)
        // No hard redirect here — route guards handle everything
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // ── Loading splash ───────────────────────────────────────────
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
      }}>
        Organized<span style={{ color: '#0d0c0a' }}>.</span>
      </div>
    </div>
  )

  // ── 3-state logic ────────────────────────────────────────────
  // State 1: no session            → /auth
  // State 2: session, no workspace → /auth (onboarding)
  // State 3: session + workspace   → /dashboard
  const isReady = session && onboarded

  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      {/* Auth — shown when not ready (no session OR no workspace) */}
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

      {/* Dashboard — shown only when fully ready */}
      <Route
        path="/dashboard/*"
        element={
          !session   ? <Navigate to="/auth" replace /> :
          !onboarded ? <Navigate to="/auth" replace /> :
          <Dashboard session={session} />
        }
      />

      {/* Public booking page */}
      <Route path="/:slug" element={<ClientPage />} />
    </Routes>
  )
}
