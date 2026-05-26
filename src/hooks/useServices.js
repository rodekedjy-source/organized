import { useState, useEffect, useCallback } from 'react'
import { fetchServices } from '../api/services'

export function useServices(workspaceId) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!workspaceId) return
    setLoading(true)
    setError(null)
    const { data: rows, error: err } = await fetchServices(workspaceId)
    if (err) setError(err.message)
    else setData(rows ?? [])
    setLoading(false)
  }, [workspaceId])

  useEffect(() => { refresh() }, [refresh])

  return { data, loading, error, refresh }
}
