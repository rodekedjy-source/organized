import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchWorkspaceAndUser, fetchSubscription } from '../api/workspace'
import { fetchPendingReviewsCount } from '../api/notifications'

export function useWorkspace(session) {
  const [workspace, setWorkspace] = useState(null)
  const [ownerData, setOwnerData] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [pendingReviews, setPendingReviews] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const retryCount = useRef(0)

  const refresh = useCallback(async (s) => {
    const activeSession = s ?? session
    if (!activeSession) return
    setError(null)

    const [{ data: ws, error: wsErr }, { data: user }] = await fetchWorkspaceAndUser(activeSession.user.id)
    if (wsErr) { setError(wsErr.message); setLoading(false); return }

    if (!ws && !wsErr) {
      if (retryCount.current < 2) {
        retryCount.current += 1
        setTimeout(() => refresh(s ?? session), 600)
      } else {
        retryCount.current = 0
        setWorkspace(null)
        setLoading(false)
      }
      return
    }
    retryCount.current = 0
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
    if (session) {
      refresh(session)
    } else {
      setLoading(false)
    }
  }, [session?.user?.id])

  return { session, workspace, ownerData, subscription, pendingReviews, loading, error, refresh }
}
