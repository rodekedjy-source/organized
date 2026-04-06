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
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f7f5f0'}}>
      <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.5rem',color:'#b5893a'}}>Organized.</div>
    </div>
  )

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={session ? <Navigate to="/dashboard" /> : <Auth onAuth={setSession} />} />

      {/* Protected dashboard */}
      <Route path="/dashboard/*" element={session ? <Dashboard session={session} /> : <Navigate to="/auth" />} />

      {/* Public client profile pages */}
      <Route path="/:slug" element={<ClientPage />} />
    </Routes>
  )
}
