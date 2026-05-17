import { useState, useEffect, useCallback } from 'react'
import { fetchOrders, updateOrderStatus } from '../api/orders'
import { formatCurrency } from '../lib/formatters'

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const styles = {
    pending:   { background: 'var(--bg)', color: 'var(--ink-3)', border: '1px solid var(--border-2)' },
    confirmed: { background: 'rgba(34,197,94,.10)', color: '#16a34a', border: '1px solid rgba(34,197,94,.2)' },
    paid:      { background: 'rgba(34,197,94,.10)', color: '#16a34a', border: '1px solid rgba(34,197,94,.2)' },
    cancelled: { background: 'rgba(192,57,43,.08)', color: 'var(--red)', border: '1px solid rgba(192,57,43,.15)' },
    refunded:  { background: 'rgba(192,57,43,.08)', color: 'var(--red)', border: '1px solid rgba(192,57,43,.15)' },
  }
  const s = styles[status] || styles.pending
  return (
    <span style={{ ...s, fontSize: '.68rem', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', padding: '.2rem .55rem', borderRadius: 5, whiteSpace: 'nowrap' }}>
      {status}
    </span>
  )
}

// ── Order row ─────────────────────────────────────────────────────────────────
function OrderRow({ order, onStatusChange }) {
  const [expanded, setExpanded]   = useState(false)
  const [acting,   setActing]     = useState(false)

  const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const shortId = order.id.slice(0, 8).toUpperCase()

  async function act(newStatus) {
    setActing(true)
    await onStatusChange(order.id, newStatus)
    setActing(false)
  }

  const btnBase = { height: 34, borderRadius: 7, fontSize: '.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', border: 'none', padding: '0 1rem', transition: 'opacity .15s' }

  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      {/* Main row */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.95rem 1.25rem', cursor: 'pointer', transition: 'background .12s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        {/* Client */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '.88rem', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {order.client_name || '—'}
          </div>
          {order.client_email && (
            <div style={{ fontSize: '.75rem', color: 'var(--ink-3)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {order.client_email}
            </div>
          )}
        </div>

        {/* Qty × price */}
        <div style={{ fontSize: '.8rem', color: 'var(--ink-2)', flexShrink: 0, whiteSpace: 'nowrap' }}>
          {order.quantity} × {formatCurrency(order.unit_price)}
        </div>

        {/* Total */}
        <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--gold)', flexShrink: 0, minWidth: 60, textAlign: 'right' }}>
          {formatCurrency(order.total_amount)}
        </div>

        {/* Status */}
        <div style={{ flexShrink: 0 }}><StatusBadge status={order.status} /></div>

        {/* Date */}
        <div style={{ fontSize: '.75rem', color: 'var(--ink-3)', flexShrink: 0, minWidth: 80, textAlign: 'right' }}>
          {date}
        </div>

        {/* Chevron */}
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
          style={{ width: 12, height: 12, flexShrink: 0, color: 'var(--ink-3)', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
          <path d="M4 6l4 4 4-4"/>
        </svg>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: '0 1.25rem 1rem 1.25rem', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem .75rem', padding: '.75rem 0', fontSize: '.8rem' }}>
            <div>
              <span style={{ color: 'var(--ink-3)', fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em' }}>Order ID</span>
              <div style={{ color: 'var(--ink-2)', marginTop: 2, fontFamily: 'monospace' }}>{shortId}…</div>
            </div>
            <div>
              <span style={{ color: 'var(--ink-3)', fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em' }}>Payment</span>
              <div style={{ marginTop: 2 }}><StatusBadge status={order.payment_status || 'none'} /></div>
            </div>
            {order.client_email && (
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ color: 'var(--ink-3)', fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em' }}>Email</span>
                <div style={{ color: 'var(--ink-2)', marginTop: 2 }}>{order.client_email}</div>
              </div>
            )}
          </div>

          {/* Actions */}
          {(order.status === 'pending' || (order.status !== 'cancelled' && order.status !== 'refunded')) && (
            <div style={{ display: 'flex', gap: '.5rem', paddingTop: '.5rem' }}>
              {order.status === 'pending' && (
                <button
                  disabled={acting}
                  onClick={() => act('confirmed')}
                  style={{ ...btnBase, background: 'var(--gold)', color: '#fff', opacity: acting ? .5 : 1 }}>
                  {acting ? 'Saving…' : 'Mark as Confirmed'}
                </button>
              )}
              {order.status !== 'cancelled' && order.status !== 'refunded' && (
                <button
                  disabled={acting}
                  onClick={() => act('cancelled')}
                  style={{ ...btnBase, background: 'transparent', border: '1px solid rgba(192,57,43,.3)', color: 'var(--red)', opacity: acting ? .5 : 1 }}>
                  {acting ? 'Saving…' : 'Cancel Order'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value }) {
  return (
    <div className="card" style={{ flex: 1, minWidth: 0 }}>
      <div className="card-body" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ fontSize: '.67rem', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.35rem' }}>{label}</div>
        <div style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--ink)', fontFamily: "'Playfair Display',serif" }}>{value}</div>
      </div>
    </div>
  )
}

// ── OrdersSection ─────────────────────────────────────────────────────────────
export default function OrdersSection({ workspace, toast }) {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!workspace?.id) return
    setLoading(true)
    const { data, error } = await fetchOrders(workspace.id)
    setLoading(false)
    if (error) { toast('Could not load orders.'); return }
    setOrders(data || [])
  }, [workspace?.id])

  useEffect(() => { load() }, [load])

  async function handleStatusChange(orderId, status) {
    const { error } = await updateOrderStatus(orderId, status)
    if (error) { toast('Could not update order.'); return }
    toast(`Order ${status}.`)
    load()
  }

  // Stats
  const total   = orders.length
  const revenue = orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + Number(o.total_amount || 0), 0)
  const pending = orders.filter(o => o.status === 'pending').length

  return (
    <div>
      {/* Header */}
      <div className="page-head">
        <div>
          <div className="page-title">Orders</div>
          <div className="page-sub">Track and manage your product sales.</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <StatCard label="Total Orders" value={total} />
        <StatCard label="Revenue" value={formatCurrency(revenue)} />
        <StatCard label="Pending" value={pending} />
      </div>

      {/* List */}
      <div className="card">
        <div className="card-head"><div className="card-title">All orders</div></div>

        {loading ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--ink-3)', fontSize: '.85rem' }}>Loading…</div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-title">No orders yet.</div>
            <div className="empty-sub">When clients purchase products from your page, orders will appear here.</div>
          </div>
        ) : (
          orders.map(order => (
            <OrderRow key={order.id} order={order} onStatusChange={handleStatusChange} />
          ))
        )}
      </div>
    </div>
  )
}
