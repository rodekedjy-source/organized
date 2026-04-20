import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Landing    from './pages/Landing'
import Auth       from './pages/Auth'
import Dashboard  from './pages/Dashboard'
import ClientPage from './pages/ClientPage'

export default function App() {
  const [session, setSession] = useState(null)
  const [ready,   setReady]   = useState(false)

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data }) => {
        setSession(data?.session ?? null)
      })
      .catch(() => {
        setSession(null) // lock contention or network error — treat as no session
      })
      .finally(() => {
        setReady(true)  // ALWAYS exit loading, no matter what
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (!ready) return (
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

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/:slug" element={<ClientPage />} />
      <Route
        path="/auth"
        element={<Auth session={session} onAuth={setSession} />}
      />
      <Route
        path="/dashboard/*"
        element={
          session
            ? <Dashboard session={session} />
            : <Navigate to="/auth" replace />
        }
      />
    </Routes>
  )
}
