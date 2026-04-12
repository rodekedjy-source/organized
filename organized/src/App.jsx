import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import ClientPage from './pages/ClientPage'

const Splash = () => (
  <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#ffffff' }}>
    <div style={{ fontFamily:'Playfair Display,serif', fontSize:'1.5rem', color:'#0d0c0a' }}>
      Organized<span style={{ color:'#b5893a' }}>.</span>
    </div>
  </div>
)

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
    const timeout = setTimeout(() => setLoading(false), 3000)

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        try { await fetchProfile(session.user.id) } catch {}
      }
      clearTimeout(timeout)
      setLoading(false)
    }).catch(() => { clearTimeout(timeout); setLoading(false) })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        if (session?.user) {
          try { await fetchProfile(session.user.id) } catch { setProfile(null) }
        } else {
          setProfile(null)
        }
      }
    )

    return () => { subscription.unsubscribe(); clearTimeout(timeout) }
  }, [])

  if (loading) return <Splash />

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={
        session && profile?.onboarding_complete
          ? <Navigate to="/dashboard" />
          : <Auth onAuth={setSession} />
      } />
      <Route path="/dashboard/*" element={
        !session ? <Navigate to="/auth" /> :
        profile === null ? <Splash /> :
        !profile.onboarding_complete ? <Navigate to="/auth" /> :
        <Dashboard session={session} />
      } />
      <Route path="/:slug" element={<ClientPage />} />
    </Routes>
  )
}
