import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import { KpiCard, SecHd, Card, CenterSpinner, fmtTime } from '../AdminShared'

function AuditOpPill({ action }) {
  const a = (action || '').toLowerCase()
  const cls = a === 'insert' ? 'ins' : a === 'update' ? 'upd' : a === 'delete' ? 'del' : 'ins'
  return <div className={`x-aop ${cls}`}>{a.toUpperCase()}</div>
}

export default function AdminAudit() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [live, setLive] = useState(true)
  const chanRef = useRef(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('audit_log')
        .select('id, table_name, action, changed_at, workspace_id')
        .order('changed_at', { ascending: false })
        .limit(100)
      setEvents(data || [])
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!live) { chanRef.current?.unsubscribe(); chanRef.current = null; return }
    chanRef.current = supabase.channel('audit-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_log' }, payload => {
        setEvents(prev => [payload.new, ...prev].slice(0, 100))
      })
      .subscribe()
    return () => { chanRef.current?.unsubscribe() }
  }, [live])

  if (loading) return <CenterSpinner />

  const insertCount = events.filter(e => e.action?.toLowerCase() === 'insert').length
  const updateCount = events.filter(e => e.action?.toLowerCase() === 'update').length
  const deleteCount = events.filter(e => e.action?.toLowerCase() === 'delete').length

  const filtered = filter === 'all' ? events : events.filter(e => e.action?.toLowerCase() === filter)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="x-g4">
        <KpiCard label="Total Events" value={events.length} change="↑ Active" changeType="up" gold />
        <KpiCard label="INSERT" value={insertCount} change={`${Math.round(insertCount / Math.max(events.length, 1) * 100)}% of total`} changeType="nn" />
        <KpiCard label="UPDATE" value={updateCount} change={`${Math.round(updateCount / Math.max(events.length, 1) * 100)}% of total`} changeType="nn" />
        <KpiCard label="DELETE" value={deleteCount} change={`${Math.round(deleteCount / Math.max(events.length, 1) * 100)}% of total`} changeType="nn" />
      </div>

      <Card>
        <SecHd
          title="Action Log — Real Time"
          right={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {live && <><div className="x-live-dot" /><span className="x-live-lbl">Live</span></>}
              <button className="x-btn-ghost" onClick={() => setLive(v => !v)}>
                {live ? 'Pause' : 'Resume'}
              </button>
            </div>
          }
        />
        <div className="x-audit-filters">
          {[
            { key: 'all', label: 'All', base: '' },
            { key: 'insert', label: 'INSERT', base: 'ins' },
            { key: 'update', label: 'UPDATE', base: 'upd' },
            { key: 'delete', label: 'DELETE', base: 'del' },
          ].map(({ key, label, base }) => (
            <button
              key={key}
              className={`x-af${base ? ` ${base}` : ''}${filter === key ? ' sel' : ''}`}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
        {filtered.length === 0 && (
          <div style={{ color: 'var(--muted)', fontFamily: 'DM Mono,monospace', fontSize: 10, paddingTop: 8 }}>No events</div>
        )}
        {filtered.map(e => (
          <div key={e.id} className="x-audit-row">
            <div className="x-at">{fmtTime(e.changed_at)}</div>
            <AuditOpPill action={e.action} />
            <div className="x-am">{e.table_name}</div>
            <div className="x-aw">@ws</div>
          </div>
        ))}
      </Card>
    </div>
  )
}
