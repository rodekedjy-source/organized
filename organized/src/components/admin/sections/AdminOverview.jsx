import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import {
  SectionHead, KpiBlock, Card, XTable, PaymentPill,
  CenterSpinner, GhostBtn, fmt, fmtMoney, timeAgo,
} from '../AdminShared'

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const EDGE_API = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-metrics`

async function getToken() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

export default function AdminOverview() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch(EDGE_API, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
        },
      })
      if (res.ok) setData(await res.json())
      else {
        // fallback: query directly
        await loadDirect()
      }
    } catch {
      await loadDirect()
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  async function loadDirect() {
    const [
      { count: wsCount },
      { count: userCount },
      { data: recentWs },
      { data: recentPay },
    ] = await Promise.all([
      supabase.from('workspaces').select('*', { count: 'exact', head: true }),
      supabase.from('admin_users').select('*', { count: 'exact', head: true }),
      supabase.from('workspaces').select('id,name,slug,created_at').order('created_at', { ascending: false }).limit(6),
      supabase.from('payments').select('id,client_name,amount,currency,status,created_at').order('created_at', { ascending: false }).limit(6),
    ])
    setData({
      metrics: { total_workspaces: wsCount, total_users: userCount },
      recent_workspaces: recentWs || [],
      recent_bookings: recentPay || [],
      beta_testers: [],
      admin_users: [],
    })
  }

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const id = setInterval(() => load(true), 60000)
    return () => clearInterval(id)
  }, [load])

  if (loading) return <CenterSpinner />

  const m = data?.metrics || {}
  const proRate = m.total_workspaces > 0
    ? Math.round(((m.pro_subscribers || 0) / m.total_workspaces) * 100) : 0

  const kpis = [
    { label: 'Workspaces',      value: fmt(m.total_workspaces),      sub: `+${fmt(m.new_workspaces_7d || 0)} this week` },
    { label: 'Total Users',     value: fmt(m.total_users),            sub: 'Registered accounts' },
    { label: 'Pro Subscribers', value: fmt(m.pro_subscribers),        sub: `${proRate}% conversion`, gold: true },
    { label: 'Active Subs',     value: fmt(m.active_subscriptions),   sub: 'Active or trialing' },
    { label: 'Bookings Today',  value: fmt(m.bookings_today),         sub: `${fmt(m.bookings_last_7d)} this week` },
    { label: 'Bookings 30d',    value: fmt(m.bookings_last_30d),      sub: 'Last 30 days' },
    { label: 'Revenue 30d',     value: fmtMoney(m.revenue_last_30d),  sub: 'Captured deposits', gold: true },
    { label: 'Revenue Total',   value: fmtMoney(m.revenue_total),     sub: 'All time', gold: true },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <SectionHead
          tag="Founder Console"
          title="Platform Overview"
          sub={`Auto-refreshes every 60s${m.computed_at ? ` · ${new Date(m.computed_at).toLocaleTimeString()}` : ''}`}
        />
        <GhostBtn onClick={() => load(true)} spin={refreshing} style={{ marginTop: '.25rem' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M8 16H3v5"/>
          </svg>
          Refresh
        </GhostBtn>
      </div>

      <div className="x-kpi-grid">
        {kpis.map(k => <KpiBlock key={k.label} {...k} />)}
      </div>

      <div className="x-2col">
        <Card
          title="Recent Workspaces"
          meta={`${(data?.recent_workspaces || []).length} shown`}
        >
          <XTable
            cols={['Name', 'Slug', 'Joined']}
            empty="No workspaces yet"
            rows={(data?.recent_workspaces || []).map(w => (
              <tr key={w.id}>
                <td><strong>{w.name || '—'}</strong></td>
                <td style={{ color: 'rgba(181,137,58,.6)', fontFamily: 'monospace', fontSize: '.69rem' }}>
                  {w.slug || '—'}
                </td>
                <td>{timeAgo(w.created_at)}</td>
              </tr>
            ))}
          />
        </Card>

        <Card
          title="Recent Payments"
          meta={`${(data?.recent_bookings || []).length} shown`}
        >
          <XTable
            cols={['Client', 'Amount', 'Status', 'When']}
            empty="No payments yet"
            rows={(data?.recent_bookings || []).map(p => (
              <tr key={p.id}>
                <td><strong>{p.client_name || '—'}</strong></td>
                <td style={{ color: p.amount ? '#b5893a' : 'rgba(240,236,228,.2)' }}>
                  {p.amount ? fmtMoney(p.amount, p.currency) : '—'}
                </td>
                <td><PaymentPill status={p.payment_status || p.status} /></td>
                <td>{timeAgo(p.created_at)}</td>
              </tr>
            ))}
          />
        </Card>
      </div>
    </div>
  )
}
