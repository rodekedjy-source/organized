import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Landing           from './pages/Landing'
import Auth              from './pages/Auth'
import Dashboard         from './pages/Dashboard'
import ClientPage        from './pages/ClientPage'
import CancelAppointment from './pages/CancelAppointment'
import ReviewPage        from './pages/ReviewPage'
import Legal               from './pages/Legal'
import AdminConsole        from './pages/AdminConsole'
import Suspended           from './pages/Suspended'
import { WorkspaceProvider } from './contexts/WorkspaceContext'
import { ToastProvider }     from './contexts/ToastContext'

export default function App() {
  const [session, setSession] = useState(null)
  const [ready,   setReady]   = useState(false)

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data }) => setSession(data?.session ?? null))
      .catch(() => setSession(null))
      .finally(() => setReady(true))

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session ?? null)
    )
    return () => subscription.unsubscribe()
  }, [])

  if (!ready) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0a0908' }}>
      <div style={{ fontFamily:"'Playfair Display', serif", fontSize:'1.5rem', color:'#C9A84C' }}>
        Organized<span style={{ color:'#F0EAE0' }}>.</span>
      </div>
    </div>
  )

  return (
    <Routes>
      {/* Public */}
      <Route path="/"              element={<Landing />} />
      <Route path="/cancel/:token" element={<CancelAppointment />} />
      <Route path="/review/:token" element={<ReviewPage />} />

      {/* Auth */}
      <Route
        path="/auth"
        element={session ? <Navigate to="/dashboard" replace /> : <Auth onAuth={setSession} />}
      />

      {/* Dashboard — protected */}
      <Route
        path="/dashboard/*"
        element={session ? (
          <ToastProvider>
            <WorkspaceProvider>
              <Dashboard key={session.user.id} session={session} />
            </WorkspaceProvider>
          </ToastProvider>
        ) : <Navigate to="/auth" replace />}
      />

      {/* Legal */}
      <Route path="/legal" element={<Legal />} />

      {/* Founder Console — secret, no link in UI */}
      <Route
        path="/x"
        element={session ? <AdminConsole /> : <Navigate to="/auth" replace />}
      />

      {/* Suspended beta page */}
      <Route path="/suspended" element={<Suspended />} />

      {/* Client booking page — public, must be last */}
      <Route path="/book/:slug" element={<ClientPage />} />
      <Route path="/:slug"      element={<ClientPage />} />
    </Routes>
  )
}
