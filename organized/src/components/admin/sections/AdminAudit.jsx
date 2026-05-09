import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import { SectionHead, Card, Pill, CenterSpinner, timeAgo } from '../AdminShared'

function actionColor(action) {
  if (!action) return 'dim'
  const a = action.toLowerCase()
  if (a.includes('delete') || a.includes('remove')) return 'red'
  if (a.includes('create') || a.includes('insert') || a.includes('add')) return 'green'
  if (a.includes('update') || a.includes('edit')) return 'blue'
  if (a.includes('login') || a.includes('auth')) return 'purple'
  return 'dim'
}

function ActionIcon({ action }) {
  const a = (action || '').toLowerCase()
  if (a.includes('delete') || a.includes('remove')) return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
    </svg>
  )
  if (a.includes('create') || a.includes('insert') || a.includes('add')) return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  )
  if (a.includes('update') || a.includes('edit')) return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}

export default function AdminAudit() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [live, setLive] = useState(true)
  const channelRef = useRef(null)

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (!live) {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      return
    }

    const ch = supabase
      .channel('audit-log-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_log' }, payload => {
        setLogs(prev => [payload.new, ...prev].slice(0, 100))
      })
      .subscribe()

    channelRef.current = ch
    return () => { supabase.removeChannel(ch); channelRef.current = null }
  }, [live])

  async function load() {
    const { data } = await supabase
      .from('audit_log')
      .select('*')
      .order('changed_at', { ascending: false })
      .limit(100)
    setLogs(data || [])
    setLoading(false)
  }

  if (loading) return <CenterSpinner />

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <SectionHead
          tag="Security"
          title="Audit Log"
          sub={`${logs.length} recent events${live ? ' · Live' : ''}`}
        />
        <label style={{
          display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer',
          fontSize: '.68rem', color: 'rgba(240,236,228,.35)', marginTop: '.35rem',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: live ? '#4ade80' : 'rgba(255,255,255,.15)', boxShadow: live ? '0 0 6px rgba(74,222,128,.4)' : 'none' }} />
          Live
          <input type="checkbox" checked={live} onChange={e => setLive(e.target.checked)} style={{ display: 'none' }} />
        </label>
      </div>

      <Card title="Events" meta={`${logs.length} entries`}>
        {logs.length === 0 ? (
          <div className="x-empty">No audit events found</div>
        ) : (
          logs.map((log, i) => (
            <div key={log.id ?? i} className="x-audit-row">
              <div className="x-audit-icon">
                <ActionIcon action={log.action} />
              </div>
              <div className="x-audit-body">
                <div className="x-audit-action">
                  <Pill color={actionColor(log.action)}>
                    {log.action || 'unknown'}
                  </Pill>
                  {log.table_name && (
                    <span style={{ marginLeft: '.5rem', fontSize: '.72rem', color: 'rgba(240,236,228,.4)', fontFamily: 'monospace' }}>
                      {log.table_name}
                    </span>
                  )}
                </div>
                <div className="x-audit-meta">
                  {log.user_id && <span>User {log.user_id.slice(0, 8)}…</span>}
                  {log.record_id && <span style={{ marginLeft: '.5rem', opacity: .7 }}>· record {String(log.record_id).slice(0, 8)}</span>}
                </div>
              </div>
              <div className="x-audit-time">{timeAgo(log.changed_at)}</div>
            </div>
          ))
        )}
      </Card>
    </div>
  )
}
