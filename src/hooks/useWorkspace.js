import { useState, useEffect, useCallback } from 'react'
import { fetchWorkspaceAndUser, fetchSubscription, getSession, onAuthStateChange } from '../api/workspace'
import { fetchPendingReviewsCount } from '../api/notifications'

export function useWorkspace() {
  const [session, setSession] = useState(null)
  const [workspace, setWorkspace] = useState(null)
  const [ownerData, setOwnerData] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [pendingReviews, setPendingReviews] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async (s) => {
    const activeSession = s ?? session
    if (!activeSession) return
    setError(null)

    const [{ data: ws, error: wsErr }, { data: user }] = await fetchWorkspaceAndUser(activeSession.user.id)
    if (wsErr) { setError(wsErr.message); setLoading(false); return }

    setWorkspace(ws)
    setOwnerData(user)

    if (ws?.id) {
      const { data: sub } = await fetchSubscription(ws.id)
      setSubscription(sub)

      const { count } = await fetchPendingReviewsCount(ws.id)
      setPendingReviews(count ?? 0)
    }

    setLoading(false)
  }, [session])

  useEffect(() => {
    getSession().then(({ data: { session: s } }) => {
      setSession(s)
      if (s) refresh(s)
      else setLoading(false)
    })

    const sub = onAuthStateChange((_, s) => {
      setSession(s)
      if (s) refresh(s)
      else setLoading(false)
    })

    return () => sub.unsubscribe()
  }, [])

  return { session, workspace, ownerData, subscription, pendingReviews, loading, error, refresh }
}
