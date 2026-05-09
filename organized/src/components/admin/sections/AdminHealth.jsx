import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { SectionHead, Card } from '../AdminShared'

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

async function getToken() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

function HealthItem({ name, status, latency, detail }) {
  const dotClass = status === 'ok' ? 'ok' : status === 'warn' ? 'warn' : status === 'checking' ? 'checking' : 'err'
  const label = status === 'ok' ? 'Online' : status === 'warn' ? 'Degraded' : status === 'checking' ? 'Checking…' : 'Offline'
  return (
    <div className="x-health-item">
      <div className="x-health-name">{name}</div>
      <div className="x-health-status">
        <div className={`x-health-dot ${dotClass}`} />
        <span>{label}</span>
        {latency != null && (
          <span style={{ fontSize: '.62rem', color: 'rgba(240,236,228,.2)', marginLeft: '.4rem' }}>
            {latency}ms
          </span>
        )}
      </div>
      {detail && (
        <div style={{ fontSize: '.62rem', color: 'rgba(240,236,228,.2)', marginTop: '.3rem', fontWeight: 300 }}>
          {detail}
        </div>
      )}
    </div>
  )
}

export default function AdminHealth() {
  const [checks, setChecks] = useState({
    database: { status: 'checking' },
    auth: { status: 'checking' },
    edge: { status: 'checking' },
    realtime: { status: 'checking' },
  })
  const [lastChecked, setLastChecked] = useState(null)

  async function runChecks() {
    setChecks({
      database: { status: 'checking' },
      auth: { status: 'checking' },
      edge: { status: 'checking' },
      realtime: { status: 'checking' },
    })

    // Database check
    const dbStart = Date.now()
    try {
      const { error } = await supabase.from('workspaces').select('id').limit(1)
      const latency = Date.now() - dbStart
      setChecks(c => ({ ...c, database: { status: error ? 'err' : 'ok', latency } }))
    } catch {
      setChecks(c => ({ ...c, database: { status: 'err', latency: Date.now() - dbStart } }))
    }

    // Auth check
    const authStart = Date.now()
    try {
      const { error } = await supabase.auth.getSession()
      const latency = Date.now() - authStart
      setChecks(c => ({ ...c, auth: { status: error ? 'err' : 'ok', latency } }))
    } catch {
      setChecks(c => ({ ...c, auth: { status: 'err', latency: Date.now() - authStart } }))
    }

    // Edge functions check
    const edgeStart = Date.now()
    try {
      const token = await getToken()
      const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-metrics`, {
        headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY },
      })
      const latency = Date.now() - edgeStart
      setChecks(c => ({
        ...c,
        edge: { status: res.ok ? 'ok' : res.status === 401 ? 'warn' : 'err', latency, detail: res.ok ? 'admin-metrics' : `HTTP ${res.status}` },
      }))
    } catch {
      setChecks(c => ({ ...c, edge: { status: 'err', latency: Date.now() - edgeStart } }))
    }

    // Realtime check (just verify we can get a channel)
    const rtStart = Date.now()
    try {
      const ch = supabase.channel('health-check')
      await ch.subscribe()
      supabase.removeChannel(ch)
      setChecks(c => ({ ...c, realtime: { status: 'ok', latency: Date.now() - rtStart } }))
    } catch {
      setChecks(c => ({ ...c, realtime: { status: 'warn', latency: Date.now() - rtStart, detail: 'Unable to subscribe' } }))
    }

    setLastChecked(new Date())
  }

  useEffect(() => { runChecks() }, [])

  const services = [
    { key: 'database', name: 'PostgreSQL Database' },
    { key: 'auth', name: 'Auth Service' },
    { key: 'edge', name: 'Edge Functions' },
    { key: 'realtime', name: 'Realtime' },
  ]

  const allOk = services.every(s => checks[s.key]?.status === 'ok')

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <SectionHead
          tag="Infrastructure"
          title="System Health"
          sub={lastChecked ? `Last checked at ${lastChecked.toLocaleTimeString()}` : 'Running checks…'}
        />
        <button
          onClick={runChecks}
          style={{
            marginTop: '.25rem', fontSize: '.68rem', letterSpacing: '.04em',
            textTransform: 'uppercase', color: 'rgba(240,236,228,.3)',
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: '.3rem',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M8 16H3v5"/>
          </svg>
          Re-check
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '.6rem' }}>
        <div className={`x-health-dot ${allOk ? 'ok' : 'warn'}`} style={{ width: 10, height: 10 }} />
        <span style={{ fontSize: '.78rem', color: allOk ? '#4ade80' : '#facc15' }}>
          {allOk ? 'All systems operational' : 'Some checks pending or degraded'}
        </span>
      </div>

      <div className="x-health-grid">
        {services.map(s => (
          <HealthItem
            key={s.key}
            name={s.name}
            status={checks[s.key]?.status}
            latency={checks[s.key]?.latency}
            detail={checks[s.key]?.detail}
          />
        ))}
      </div>

      <Card title="Environment">
        <div style={{ padding: '1rem 1.2rem' }}>
          {[
            { label: 'Supabase URL', value: SUPABASE_URL || '—' },
            { label: 'Project Ref', value: SUPABASE_URL ? SUPABASE_URL.split('.')[0].split('//')[1] : '—' },
            { label: 'Anon Key (prefix)', value: SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.slice(0, 20)}…` : '—' },
          ].map(row => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '.5rem 0', borderBottom: '1px solid rgba(255,255,255,.04)',
            }}>
              <span style={{ fontSize: '.7rem', color: 'rgba(240,236,228,.3)', fontWeight: 300 }}>{row.label}</span>
              <span style={{ fontSize: '.7rem', color: 'rgba(240,236,228,.6)', fontFamily: 'monospace' }}>{row.value}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
