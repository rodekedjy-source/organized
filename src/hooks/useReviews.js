import { useState, useEffect, useCallback } from 'react'
import { fetchReviews } from '../api/reviews'

export function useReviews(workspaceId) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!workspaceId) return
    setLoading(true)
    setError(null)
    const { data, error: err } = await fetchReviews(workspaceId)
    if (err) setError(err.message)
    else setReviews(data ?? [])
    setLoading(false)
  }, [workspaceId])

  useEffect(() => { refresh() }, [refresh])

  return { reviews, loading, error, refresh }
}
