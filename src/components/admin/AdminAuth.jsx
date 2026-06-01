import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { Spinner } from './AdminShared'

export default function AdminAuth({ children }) {
  const { isAdmin, loading } = useAdminAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && isAdmin === false) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAdmin, loading, navigate])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#0f0e0c',
      }}>
        <Spinner />
      </div>
    )
  }

  if (!isAdmin) return null

  return children
}
