import { useState, useEffect, useCallback } from 'react'
import {
  fetchOrders,
  updateOrderStatus,
  updateOrderTracking,
  markOrderDelivered,
  notifyOrderShipped,
  notifyOrderDelivered,
} from '../api/orders'
import { formatCurrency } from '../lib/formatters'

const CARRIERS = ['Canada Post', 'UPS', 'FedEx', 'Purolator', 'Other']

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const styles = {
    pending:   { background: 'var(--bg)', color: 'var(--ink-3)', border: '1px solid var(--border-2)' },
    confirmed: { background: 'rgba(34,197,94,.10)', color: '#16a34a', border: '1px solid rgba(34,197,94,.2)' },
    paid:      { background: 'rgba(34,197,94,.10)', color: '#16a34a', border: '1px solid rgba(34,197,94,.2)' },
    shipped:   { background: 'rgba(59,130,246,.10)', color: '#2563eb', border: '1px solid rgba(59,130,246,.2)' },
    delivered: { background: 'rgba(201,168,76,.12)', color: '#92701a', border: '1px solid rgba(201,168,76,.25)' },
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

function fmtDate(d) {
  if (!d) return ''
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
  catch { return d }
}

// ── Order row ─────────────────────────────────────────────────────────────────
function OrderRow({ order, workspace, onStatusChange, onShip, onDeliver }) {
  const [expanded,     setExpanded]     = useState(false)
  const [acting,       setActing]       = useState(false)
  const [shipCarrier,  setShipCarrier]  = useState(CARRIERS[0])
  const [shipTracking, setShipTracking] = useState('')
  const [shipLoading,  setShipLoading]  = useState(false)

  const date    = fmtDate(order.created_at)
  const shortId = order.id.slice(0, 8).toUpperCase()

  async function act(newStatus) {
    setActing(true)
    await onStatusChange(order.id, newStatus)
    setActing(false)
  }

  async function handleSaveShipping() {
    if (!shipTracking.trim()) return
    setShipLoading(true)
    await onShip(order, shipCarrier, shipTracking.trim())
    setShipLoading(false)
    setShipTracking('')
  }

  async function handleMarkDelivered() {
    setShipLoading(true)
    await onDeliver(order)
    setShipLoading(false)
  }

  const btnBase     = { height: 34, borderRadius: 7, fontSize: '.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', border: 'none', padding: '0 1rem', transition: 'opacity .15s' }
  const inputStyle  = { height: 34, borderRadius: 7, border: '1px solid var(--border-2)', padding: '0 .75rem', fontSize: '.82rem', fontFamily: 'inherit', background: 'var(--bg)', color: 'var(--ink)', outline: 'none', width: '100%', boxSizing: 'border-box' }
  const selectStyle = { ...inputStyle, cursor: 'pointer' }

  const isShipped   = !!(order.tracking_number)
  const isDelivered = !!(order.delivered_at)

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
          {order.product_name && (
            <div style={{ fontSize: '.75rem', color: 'var(--ink-3)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {order.product_name}
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

          {/* Meta grid */}
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
            {order.shipping_address && (
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ color: 'var(--ink-3)', fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em' }}>Ships to</span>
                <div style={{ color: 'var(--ink-2)', marginTop: 2, lineHeight: 1.5 }}>{order.shipping_address}</div>
              </div>
            )}
          </div>

          {/* ── SHIPPING SECTION ─────────────────────────────── */}
          {order.status !== 'cancelled' && order.status !== 'refunded' && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '.25rem' }}>
              <div style={{ fontSize: '.62rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '.75rem' }}>
                Shipping
              </div>

              {/* Not yet shipped */}
              {!isShipped && !isDelivered && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem' }}>
                    <div>
                      <div style={{ fontSize: '.68rem', color: 'var(--ink-3)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Carrier</div>
                      <select value={shipCarrier} onChange={e => setShipCarrier(e.target.value)} style={selectStyle}>
                        {CARRIERS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <div style={{ fontSize: '.68rem', color: 'var(--ink-3)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Tracking number</div>
                      <input
                        type="text"
                        placeholder="e.g. 1234567890"
                        value={shipTracking}
                        onChange={e => setShipTracking(e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div>
                    <button
                      disabled={shipLoading || !shipTracking.trim()}
                      onClick={handleSaveShipping}
                      style={{ ...btnBase, background: 'var(--gold)', color: '#fff', opacity: (shipLoading || !shipTracking.trim()) ? .45 : 1 }}
                    >
                      {shipLoading ? 'Saving…' : 'Save & Notify Client →'}
                    </button>
                  </div>
                </div>
              )}

              {/* Shipped, not delivered */}
              {isShipped && !isDelivered && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                  <div style={{ fontSize: '.82rem', color: 'var(--ink-2)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <span><span style={{ color: 'var(--ink-3)', fontWeight: 600 }}>Carrier: </span>{order.carrier}</span>
                    <span>
                      <span style={{ color: 'var(--ink-3)', fontWeight: 600 }}>Tracking: </span>
                      <span style={{ fontFamily: 'monospace', background: 'var(--border)', padding: '1px 5px', borderRadius: 3 }}>{order.tracking_number}</span>
                    </span>
                    {order.shipped_at && (
                      <span><span style={{ color: 'var(--ink-3)', fontWeight: 600 }}>Shipped: </span>{fmtDate(order.shipped_at)}</span>
                    )}
                  </div>
                  <div>
                    <button
                      disabled={shipLoading}
                      onClick={handleMarkDelivered}
                      style={{ ...btnBase, background: 'var(--gold)', color: '#fff', opacity: shipLoading ? .45 : 1 }}
                    >
                      {shipLoading ? 'Saving…' : 'Mark as Delivered'}
                    </button>
                  </div>
                </div>
              )}

              {/* Delivered */}
              {isDelivered && (
                <div style={{ fontSize: '.82rem', color: 'var(--ink-2)' }}>
                  <span style={{ color: '#16a34a', fontWeight: 600 }}>✓ Delivered</span>
                  {order.delivered_at && <span style={{ color: 'var(--ink-3)', marginLeft: 6 }}>on {fmtDate(order.delivered_at)}</span>}
                </div>
              )}
            </div>
          )}

          {/* Order status actions */}
          {order.status !== 'cancelled' && order.status !== 'refunded' && order.status !== 'delivered' && (
            <div style={{ display: 'flex', gap: '.5rem', paddingTop: '.75rem', borderTop: '1px solid var(--border)', marginTop: '.75rem' }}>
              {order.status === 'pending' && (
                <button
                  disabled={acting}
                  onClick={() => act('confirmed')}
                  style={{ ...btnBase, background: 'var(--gold)', color: '#fff', opacity: acting ? .5 : 1 }}>
                  {acting ? 'Saving…' : 'Mark as Confirmed'}
                </button>
              )}
              <button
                disabled={acting}
                onClick={() => act('cancelled')}
                style={{ ...btnBase, background: 'transparent', border: '1px solid rgba(192,57,43,.3)', color: 'var(--red)', opacity: acting ? .5 : 1 }}>
                {acting ? 'Saving…' : 'Cancel Order'}
              </button>
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

  async function handleShip(order, carrier, tracking_number) {
    const { error } = await updateOrderTracking(order.id, { carrier, tracking_number })
    if (error) { toast('Could not save tracking.'); return }
    const updatedOrder  = { ...order, carrier, tracking_number }
    const bookingLink   = workspace?.slug ? `https://beorganized.io/${workspace.slug}` : 'https://beorganized.io'
    await notifyOrderShipped(updatedOrder, workspace?.name || '', bookingLink)
    await load()
    toast('Client notified ✓')
  }

  async function handleDeliver(order) {
    const { error } = await markOrderDelivered(order.id)
    if (error) { toast('Could not update order.'); return }
    const bookingLink = workspace?.slug ? `https://beorganized.io/${workspace.slug}` : 'https://beorganized.io'
    await notifyOrderDelivered(order, workspace?.name || '', bookingLink)
    await load()
    toast('Marked as delivered ✓')
  }

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
        <StatCard label="Revenue"      value={formatCurrency(revenue)} />
        <StatCard label="Pending"      value={pending} />
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
            <OrderRow
              key={order.id}
              order={order}
              workspace={workspace}
              onStatusChange={handleStatusChange}
              onShip={handleShip}
              onDeliver={handleDeliver}
            />
          ))
        )}
      </div>
    </div>
  )
}
