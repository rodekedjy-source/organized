import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { KpiCard, SecHd, Card, InfoBanner, StatusPill, CenterSpinner, fmtMoney, fmtDate } from '../AdminShared'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function AdminRevenue() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('payments')
        .select('id, workspace_id, amount, currency, status, client_name, description, created_at')
        .order('created_at', { ascending: false })
      setPayments(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <CenterSpinner />

  const captured = payments.filter(p => p.status === 'captured' || p.status === 'succeeded')
  const totalCents = captured.reduce((s, p) => s + (Number(p.amount) || 0), 0)

  const now = new Date()
  const barMonths = Array.from({ length: 7 }, (_, i) => {
    const offset = i - 6
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1)
    const monthTotal = captured
      .filter(p => {
        const pd = new Date(p.created_at)
        return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear()
      })
      .reduce((s, p) => s + Number(p.amount || 0), 0)
    return { label: MONTHS[d.getMonth()], total: monthTotal, isCurrent: offset === 0 }
  })
  const maxBar = Math.max(...barMonths.map(b => b.total), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <InfoBanner id="revenue" text="Paiements Stripe en temps réel. MRR = revenus des abonnements actifs ce mois. Les montants sont en cents dans Supabase, divisés par 100 pour l'affichage." />
      <div className="x-g4">
        <KpiCard label="MRR" value="$0" change="Awaiting Stripe" changeType="wn" gold />
        <KpiCard label="ARR Projected" value="$0" change="— MRR × 12" changeType="nn" />
        <KpiCard label="Total Captured" value={fmtMoney(totalCents)} change={captured.length > 0 ? `↑ ${captured.length} transactions` : '— No payments'} changeType={captured.length > 0 ? 'up' : 'nn'} />
        <KpiCard label="Test Payments" value={payments.length} change="Stripe test mode" changeType="wn" />
      </div>

      <Card>
        <SecHd title="Revenue by Month" right={<span style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--muted)' }}>MRR in CAD</span>} />
        <div className="x-rev-bars">
          {barMonths.map((b, i) => (
            <div key={i} className="x-rev-col">
              <div className={`x-rev-bar${b.isCurrent ? ' gold' : ''}`} style={{ height: `${Math.max((b.total / maxBar) * 100, 5)}%` }} />
              <div className="x-rev-lbl">{b.label}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, padding: 12, background: 'var(--surface2)', borderRadius: 8, border: '1px solid rgba(201,168,76,0.15)' }}>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: 'var(--gold)', marginBottom: 6 }}>Post-beta projection</div>
          <div style={{ fontSize: 12, color: 'var(--muted2)' }}>
            10 users × $29/mo = <strong style={{ color: 'var(--white)' }}>$290 MRR</strong> · 50 users = <strong style={{ color: 'var(--gold)' }}>$1,450 MRR</strong>
          </div>
        </div>
      </Card>

      <Card>
        <SecHd title="Recent Payments" />
        <table className="x-tbl">
          <thead><tr><th>Client</th><th>Amount</th><th>Description</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {payments.length === 0 && (
              <tr><td colSpan={5} style={{ color: 'var(--muted)', fontFamily: 'DM Mono,monospace', fontSize: 10, paddingTop: 16 }}>No payments yet</td></tr>
            )}
            {payments.slice(0, 20).map(p => (
              <tr key={p.id}>
                <td style={{ fontSize: 11.5 }}>{p.client_name || '—'}</td>
                <td style={{ fontFamily: 'DM Mono,monospace', color: (p.status === 'captured' || p.status === 'succeeded') ? 'var(--gold)' : 'var(--muted2)' }}>
                  {fmtMoney(p.amount)}
                </td>
                <td style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: 'var(--muted2)' }}>{p.description || 'Deposit'}</td>
                <td><StatusPill status={p.status} /></td>
                <td style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--muted)' }}>{fmtDate(p.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
