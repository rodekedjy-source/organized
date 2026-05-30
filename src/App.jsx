import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Landing           from './pages/Landing'
import Auth              from './pages/Auth'
import Dashboard         from './pages/Dashboard'
import ClientPage        from './pages/ClientPage'
import CancelAppointment from './pages/CancelAppointment'
import ReviewPage        from './pages/ReviewPage'
import TrackOrder        from './pages/TrackOrder'
import RefundRequestPage from './pages/RefundRequestPage'
import OfferingPage        from './pages/OfferingPage'
import Legal               from './pages/Legal'
import AdminConsole        from './pages/AdminConsole'
import Suspended           from './pages/Suspended'
import { WorkspaceProvider } from './contexts/WorkspaceContext'
import { ToastProvider }     from './contexts/ToastContext'

export default function App() {
  const [session,    setSession]    = useState(null)
  const [ready,      setReady]      = useState(false)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data }) => setSession(data?.session ?? null))
      .catch(() => setSession(null))
      .finally(() => setReady(true))

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
          const { data: ws } = await supabase
            .from('workspaces')
            .select('id')
            .eq('user_id', session.user.id)
            .maybeSingle()
          if (!ws) {
            setNeedsOnboarding(true)
          } else {
            setNeedsOnboarding(false)
          }
        }
        setSession(session ?? null)
      }
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
        element={session && !needsOnboarding ? <Navigate to="/dashboard" replace /> : <Auth onAuth={setSession} onOnboarding={setNeedsOnboarding} />}
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

      {/* Order tracking — public */}
      <Route path="/track/:token" element={<TrackOrder />} />

      {/* Enrollment refund request — public */}
      <Route path="/enrollment/:token/refund" element={<RefundRequestPage />} />

      {/* Offering sales page — public, before /book/:slug */}
      <Route path="/book/:slug/learn/:offeringId" element={<OfferingPage />} />

      {/* Client booking page — public, must be last */}
      <Route path="/book/:slug" element={<ClientPage />} />
      <Route path="/:slug"      element={<ClientPage />} />
    </Routes>
  )
}
