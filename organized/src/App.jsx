import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import ClientPage from './pages/ClientPage'

export default function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('users')
      .select('onboarding_complete')
      .eq('id', userId)
      .single()
    setProfile(data)
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session?.user) await fetchProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f5f0' }}>
      <div style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.5rem', color: '#b5893a' }}>Organized.</div>
    </div>
  )

  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route path="/auth" element={
        session && profile?.onboarding_complete
          ? <Navigate to="/dashboard" />
          : <Auth onAuth={setSession} />
      } />

      <Route path="/dashboard/*" element={
        !session
          ? <Navigate to="/auth" />
          : profile === null
            ? <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.5rem', color: '#b5893a' }}>Organized.</div></div>
            : !profile.onboarding_complete
              ? <Navigate to="/auth" />
              : <Dashboard session={session} />
      } />

      <Route path="/:slug" element={<ClientPage />} />
    </Routes>
  )
}
