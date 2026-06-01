import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)

  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setIsAdmin(false); setLoading(false); return }
      setUser(session.user)
      const { data } = await supabase
        .from('admin_users')
        .select('authorized, role, name')
        .eq('user_id', session.user.id)
        .single()
      setIsAdmin(data?.authorized === true)
      setRole(data?.role || null)
      setLoading(false)
    }
    check()
  }, [])

  return { isAdmin, loading, user, role }
}
