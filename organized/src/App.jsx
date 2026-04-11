import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import ClientPage from './pages/ClientPage'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (event === 'SIGNED_IN' && session) {
        window.location.href = '/dashboard'
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // FIX: splash blanc → page blanche avec "Organized" en noir + point doré
  // FIX: ne s'affiche QUE au tout premier chargement, pas au retour sur l'onglet
  if (loading) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#ffffff',           // blanc pur
    }}>
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '1.75rem',
        fontWeight: 500,
        color: '#111110',              // noir
        letterSpacing: '-.01em',
      }}>
        Organized<span style={{ color: '#b5893a' }}>.</span>
      </div>
    </div>
  )

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={session ? <Navigate to="/dashboard" /> : <Auth onAuth={setSession} />} />
      <Route path="/dashboard/*" element={session ? <Dashboard session={session} /> : <Navigate to="/" />} />
      <Route path="/:slug" element={<ClientPage />} />
    </Routes>
  )
}
