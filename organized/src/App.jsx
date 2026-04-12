import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { supabase } from './lib/supabase'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import ClientPage from './pages/ClientPage'

function SplashScreen() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&display=swap');
        html, body { margin:0; padding:0; background:#ffffff !important; }
        @keyframes spFadeUp {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes spDot {
          0%,100% { opacity:1; }
          50%      { opacity:0.2; }
        }
        .sp-wrap {
          position: fixed;
          inset: 0;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        .sp-logo {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(2.8rem, 12vw, 5.5rem);
          font-weight: 400;
          color: #111110;
          letter-spacing: -0.02em;
          line-height: 1;
          animation: spFadeUp 0.7s cubic-bezier(.22,1,.36,1) both;
        }
        .sp-dot {
          color: #b5893a;
          display: inline-block;
          animation: spFadeUp 0.7s cubic-bezier(.22,1,.36,1) both,
                     spDot 2s ease-in-out 1s infinite;
        }
      `}</style>
      <div className="sp-wrap">
        <div className="sp-logo">
          Organized<span className="sp-dot">.</span>
        </div>
      </div>
    </>
  )
}

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const initialLoad = useRef(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
      initialLoad.current = false
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)

      if (event === 'SIGNED_IN' && !initialLoad.current) {
        window.location.replace('/dashboard')
      }
      if (event === 'SIGNED_OUT') {
        window.location.replace('/')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <SplashScreen />

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/auth"
        element={session ? <Navigate to="/dashboard" replace /> : <Auth onAuth={setSession} />}
      />
      <Route
        path="/dashboard/*"
        element={
          session
            ? <Dashboard key={session.user.id} session={session} />
            : <Navigate to="/auth" replace />
        }
      />
      <Route path="/:slug" element={<ClientPage />} />
    </Routes>
  )
}
