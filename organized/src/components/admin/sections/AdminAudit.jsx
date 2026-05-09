import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import { KpiCard, SecHd, Card, InfoBanner, CenterSpinner, fmtTime } from '../AdminShared'

function AuditOpPill({ action }) {
  const a = (action || '').toLowerCase()
  const cls = a === 'insert' ? 'ins' : a === 'update' ? 'upd' : a === 'delete' ? 'del' : 'ins'
  return <div className={`x-aop ${cls}`}>{a.toUpperCase()}</div>
}

export default function AdminAudit() {
  const [events,   setEvents]   = useState([])
  const [wsMap,    setWsMap]    = useState({})
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('all')
  const [live,     setLive]     = useState(true)
  const chanRef = useRef(null)

  useEffect(() => {
    async function load() {
      const [{ data: evts }, { data: wsList }] = await Promise.all([
        supabase
          .from('audit_log')
          .select('id, table_name, action, changed_at, workspace_id')
          .order('changed_at', { ascending: false })
          .limit(100),
        supabase.rpc('get_workspaces_admin'),
      ])
      setEvents(evts || [])
      const map = {}
      for (const w of (wsList || [])) map[w.id] = w.name || w.slug || w.id?.slice(0, 8)
      setWsMap(map)
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

  const insertCount = events.filter(e => (e.action || '').toLowerCase() === 'insert').length
  const updateCount = events.filter(e => (e.action || '').toLowerCase() === 'update').length
  const deleteCount = events.filter(e => (e.action || '').toLowerCase() === 'delete').length

  const filtered = filter === 'all'
    ? events
    : events.filter(e => (e.action || '').toLowerCase() === filter)

  function wsLabel(workspace_id) {
    if (!workspace_id) return '—'
    return wsMap[workspace_id] || workspace_id.slice(0, 8) + '…'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <InfoBanner id="audit" text="Chaque action sur la plateforme est loggée ici en temps réel. INSERT = nouveau, UPDATE = modifié, DELETE = supprimé. Les filtres permettent de cibler un type d'opération." />
      <div className="x-g4">
        <KpiCard label="Total Events"  value={events.length}  change="↑ Active"                                                     changeType="up" gold />
        <KpiCard label="INSERT"        value={insertCount}    change={`${Math.round(insertCount / Math.max(events.length, 1) * 100)}% of total`} changeType="nn" />
        <KpiCard label="UPDATE"        value={updateCount}    change={`${Math.round(updateCount / Math.max(events.length, 1) * 100)}% of total`} changeType="nn" />
        <KpiCard label="DELETE"        value={deleteCount}    change={`${Math.round(deleteCount / Math.max(events.length, 1) * 100)}% of total`} changeType="nn" />
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
            { key: 'all',    label: 'All',    cls: '' },
            { key: 'insert', label: 'INSERT', cls: 'ins' },
            { key: 'update', label: 'UPDATE', cls: 'upd' },
            { key: 'delete', label: 'DELETE', cls: 'del' },
          ].map(({ key, label, cls }) => (
            <button
              key={key}
              className={`x-af${cls ? ` ${cls}` : ''}${filter === key ? ' sel' : ''}`}
              onClick={() => setFilter(key)}
            >
              {label}
              {key !== 'all' && (
                <span style={{ marginLeft: 5, opacity: 0.6 }}>
                  {key === 'insert' ? insertCount : key === 'update' ? updateCount : deleteCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ color: 'var(--muted)', fontFamily: 'DM Mono,monospace', fontSize: 10, paddingTop: 8 }}>
            No {filter === 'all' ? '' : filter.toUpperCase() + ' '}events
          </div>
        )}

        {filtered.map(e => (
          <div key={e.id} className="x-audit-row">
            <div className="x-at">{fmtTime(e.changed_at)}</div>
            <AuditOpPill action={e.action} />
            <div className="x-am" style={{ flex: 1 }}>{e.table_name}</div>
            <div className="x-aw" style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--muted)' }}>
              {wsLabel(e.workspace_id)}
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}
