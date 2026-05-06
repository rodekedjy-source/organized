import { useState, useEffect, useCallback } from 'react'
import { fetchAvailability, fetchBlockedDates, insertDefaultAvailability } from '../api/availability'

export function useAvailability(workspaceId) {
  const [schedule, setSchedule] = useState([])
  const [blockedDates, setBlockedDates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!workspaceId) return
    setLoading(true)
    setError(null)
    const [a, b] = await Promise.all([
      fetchAvailability(workspaceId),
      fetchBlockedDates(workspaceId),
    ])
    if (a.error) { setError(a.error.message); setLoading(false); return }

    let avail = a.data ?? []
    if (avail.length === 0) {
      const { data: created } = await insertDefaultAvailability(workspaceId)
      avail = created ?? []
    }

    setSchedule(avail)
    setBlockedDates(b.data ?? [])
    setLoading(false)
  }, [workspaceId])

  useEffect(() => { refresh() }, [refresh])

  return { schedule, setSchedule, blockedDates, loading, error, refresh }
}
