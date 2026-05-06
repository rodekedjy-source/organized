import { useState, useEffect, useCallback } from 'react'
import { fetchClients } from '../api/clients'

export function useClients(workspaceId) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!workspaceId) return
    setLoading(true)
    setError(null)
    const { data: rows, error: err } = await fetchClients(workspaceId)
    if (err) setError(err.message)
    else setData(rows ?? [])
    setLoading(false)
  }, [workspaceId])

  useEffect(() => { refresh() }, [refresh])

  return { data, loading, error, refresh }
}
