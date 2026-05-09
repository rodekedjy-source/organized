import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import {
  SectionHead, Card, KpiBlock, XTable, PaymentPill,
  CenterSpinner, fmtMoney, fmt, timeAgo,
} from '../AdminShared'

export default function AdminRevenue() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('payments')
        .select('id, client_name, amount, currency, status, created_at')
        .order('created_at', { ascending: false })
        .limit(100)
      setPayments(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <CenterSpinner />

  const captured = payments.filter(p => p.status === 'captured')
  const totalCaptured = captured.reduce((s, p) => s + (p.amount || 0), 0)
  const totalAll = payments.reduce((s, p) => s + (p.amount || 0), 0)
  const pending = payments.filter(p => p.status === 'pending').length

  return (
    <div>
      <SectionHead
        tag="Finance"
        title="Revenue"
        sub="All payment transactions"
      />

      <div className="x-kpi-grid">
        <KpiBlock label="Total Captured" value={fmtMoney(totalCaptured)} sub="Captured deposits" gold />
        <KpiBlock label="All Transactions" value={fmtMoney(totalAll)} sub="Including pending" />
        <KpiBlock label="Transactions" value={fmt(payments.length)} sub="All time" />
        <KpiBlock label="Pending" value={fmt(pending)} sub="Awaiting capture" />
      </div>

      <Card title="Payment Transactions" meta={`${payments.length} total`}>
        <XTable
          cols={['Client', 'Amount', 'Currency', 'Status', 'Date']}
          empty="No payments yet"
          rows={payments.map(p => (
            <tr key={p.id}>
              <td><strong>{p.client_name || '—'}</strong></td>
              <td style={{ color: p.amount ? '#b5893a' : 'rgba(240,236,228,.2)' }}>
                {p.amount ? fmtMoney(p.amount, p.currency) : '—'}
              </td>
              <td style={{ fontSize: '.65rem', color: 'rgba(240,236,228,.3)', fontFamily: 'monospace' }}>
                {p.currency || 'CAD'}
              </td>
              <td><PaymentPill status={p.status} /></td>
              <td>{timeAgo(p.created_at)}</td>
            </tr>
          ))}
        />
      </Card>
    </div>
  )
}
