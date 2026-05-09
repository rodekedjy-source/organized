import { useState, useEffect, useCallback } from 'react'
import { fetchPortfolioPhotos } from '../api/portfolio'

export function usePortfolio(workspaceId) {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!workspaceId) return
    setLoading(true)
    setError(null)
    const { data, error: err } = await fetchPortfolioPhotos(workspaceId)
    if (err) setError(err.message)
    else setPhotos(data ?? [])
    setLoading(false)
  }, [workspaceId])

  useEffect(() => { refresh() }, [refresh])

  return { photos, loading, error, refresh }
}
