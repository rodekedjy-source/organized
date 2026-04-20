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
    // Init — catch all errors, always exit splash
    supabase.auth.getSession()
      .then(({ data }) => setSession(data?.session ?? null))
      .catch(() => setSession(null))
      .finally(() => setReady(true))

    // Keep session in sync — no redirects here, routes handle that
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => setSession(session ?? null)
    )
    return () => subscription.unsubscribe()
  }, [])

  if (!ready) return (
    <div style={{
      minHeight:'100vh', display:'flex',
      alignItems:'center', justifyContent:'center', background:'#f7f5f0'
    }}>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.5rem', color:'#b5893a' }}>
        Organized<span style={{ color:'#0d0c0a' }}>.</span>
      </div>
    </div>
  )

  return (
    <Routes>
      <Route path="/"           element={<Landing />} />
      <Route path="/:slug"      element={<ClientPage />} />
      <Route path="/auth"       element={<Auth onAuth={setSession} />} />
      <Route path="/dashboard/*"
        element={session ? <Dashboard session={session} /> : <Navigate to="/auth" replace />}
      />
    </Routes>
  )
}
