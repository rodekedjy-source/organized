import { createContext, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkspace } from '../hooks/useWorkspace'

const WorkspaceContext = createContext(null)

export function WorkspaceProvider({ children }) {
  const { session, workspace, ownerData, subscription, pendingReviews, loading, error, refresh } = useWorkspace()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !session) navigate('/auth')
  }, [loading, session, navigate])

  return (
    <WorkspaceContext.Provider value={{ session, workspace, ownerData, subscription, pendingReviews, loading, error, refresh }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspaceContext() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspaceContext must be used inside <WorkspaceProvider>')
  return ctx
}
