import { useState, useEffect, useCallback } from 'react'
import { fetchOrders } from '../api/orders'
import OrderDetailPage from './OrderDetailPage'

const STATUS_TABS = [
  { key: 'new',        label: 'New' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped',    label: 'Shipped' },
  { key: 'delivered',  label: 'Delivered' },
]

const BADGE = {
  pending:    { background:'rgba(245,158,11,.15)', color:'#b45309', border:'1px solid rgba(245,158,11,.3)' },
  confirmed:  { background:'rgba(245,158,11,.15)', color:'#b45309', border:'1px solid rgba(245,158,11,.3)' },
  processing: { background:'rgba(59,130,246,.12)',  color:'#1d4ed8', border:'1px solid rgba(59,130,246,.25)' },
  shipped:    { background:'rgba(139,92,246,.12)',  color:'#7c3aed', border:'1px solid rgba(139,92,246,.25)' },
  delivered:  { background:'rgba(34,197,94,.12)',   color:'#16a34a', border:'1px solid rgba(34,197,94,.25)' },
}

const NEW_STATUSES = ['confirmed', 'pending']

function fmtDate(d) {
  if (!d) return ''
  try { return new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }) } catch { return '' }
}

function tabFilter(orders, tab) {
  if (tab === 'new') return orders.filter(o => NEW_STATUSES.includes(o.status))
  return orders.filter(o => o.status === tab)
}

export default function OrderHistorySection({ workspace, toast, onDetailBack }) {
  const [orders,        setOrders]        = useState([])
  const [loading,       setLoading]       = useState(true)
  const [activeTab,     setActiveTab]     = useState('new')
  const [selectedOrder, setSelectedOrder] = useState(null)

  const load = useCallback(async () => {
    if (!workspace?.id) return
    setLoading(true)
    const { data } = await fetchOrders(workspace.id)
    setOrders(data || [])
    setLoading(false)
  }, [workspace?.id])

  useEffect(() => { load() }, [load])

  // When returning from detail page, refresh list + sync updated order
  function handleBack(updatedOrder) {
    setSelectedOrder(null)
    if (updatedOrder) {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o))
    } else {
      load()
    }
  }

  // Show detail page
  if (selectedOrder) {
    return (
      <OrderDetailPage
        order={selectedOrder}
        onBack={() => {
          setSelectedOrder(null)
          if (onDetailBack) onDetailBack()
          else load()
        }}
        workspace={workspace}
        toast={toast}
      />
    )
  }

  // Stats bar
  const now       = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const mNew       = orders.filter(o => NEW_STATUSES.includes(o.status)).length
  const mShipped   = orders.filter(o => o.status === 'shipped'   && new Date(o.created_at) >= monthStart).length
  const mDelivered = orders.filter(o => o.status === 'delivered' && new Date(o.created_at) >= monthStart).length

  const tabOrders = tabFilter(orders, activeTab)

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Orders</div>
          <div className="page-sub">Track and manage your product sales</div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:'1rem', fontWeight:500 }}>
        <span style={{ color: mNew>0 ? '#b45309' : 'var(--text-secondary)', fontWeight: mNew>0 ? 700 : 500 }}>{mNew} new</span>
        {' · '}{mShipped} shipped
        {' · '}<span style={{ color:'#16a34a' }}>{mDelivered} delivered this month</span>
      </div>

      {/* Status tabs */}
      <div style={{ display:'flex', gap:'.35rem', marginBottom:'1.25rem', flexWrap:'wrap' }}>
        {STATUS_TABS.map(t => {
          const count = tabFilter(orders, t.key).length
          return (
            <button key={t.key} onClick={()=>setActiveTab(t.key)} style={{
              padding:'.35rem .85rem', borderRadius:99, border:'1.5px solid',
              borderColor: activeTab===t.key ? 'var(--gold)' : 'var(--border)',
              background:  activeTab===t.key ? 'rgba(201,168,76,.1)' : 'transparent',
              color:       activeTab===t.key ? 'var(--gold)' : 'var(--ink-3)',
              fontSize:'.75rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit',
            }}>{t.label} ({count})</button>
          )
        })}
      </div>

      {/* Order list */}
      <div className="card">
        {loading ? (
          <div style={{ padding:'2rem', color:'var(--ink-3)', fontSize:'.85rem' }}>Loading…</div>
        ) : tabOrders.length === 0 ? (
          <div style={{ padding:'2rem 1.4rem', color:'var(--ink-3)', fontSize:'.85rem', fontStyle:'italic' }}>
            No {STATUS_TABS.find(t=>t.key===activeTab)?.label.toLowerCase()} orders.
          </div>
        ) : tabOrders.map(order => {
          const badge       = BADGE[order.status] || BADGE.confirmed
          const isNew       = NEW_STATUSES.includes(order.status)
          const qty         = order.quantity || 1
          const productLabel = order.product_name || 'Cart order'
          const badgeLabel  = isNew ? 'new' : order.status

          return (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              style={{ borderBottom:'1px solid var(--border)', cursor:'pointer' }}
            >
              <div style={{ padding:'1rem 1.25rem' }}>
                {/* Row 1: product name + total */}
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'.25rem' }}>
                  <div style={{ fontWeight:700, fontSize:'.9rem', color:'var(--ink)', flex:1, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {productLabel}
                  </div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'.95rem', color:'var(--gold)', flexShrink:0, marginLeft:'.75rem' }}>
                    ${Number(order.total_amount||0).toFixed(2)}
                  </div>
                </div>

                {/* Row 2: cart items or qty */}
                {order.cart_items?.length > 0 ? (
                  <div style={{ marginBottom:'.3rem' }}>
                    {order.cart_items.map((item,idx) => (
                      <div key={idx} style={{ fontSize:12, color:'var(--text-secondary)' }}>
                        {item.name} × {item.quantity} — ${Number(item.unit_price).toFixed(2)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize:12, color:'var(--text-secondary)', marginBottom:'.3rem' }}>
                    Qty: {qty} · ${Number(order.unit_price||0).toFixed(2)} each
                  </div>
                )}

                {/* Row 3: client + date + badge */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'.2rem' }}>
                  <div style={{ fontSize:'.75rem', color:'var(--text-secondary)' }}>
                    {order.client_name || '—'} · {fmtDate(order.created_at)}
                  </div>
                  <span style={{ ...badge, fontSize:'.67rem', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', padding:'.2rem .55rem', borderRadius:5 }}>
                    {badgeLabel}
                  </span>
                </div>

                {/* Shipping address */}
                {order.shipping_address && (
                  <div style={{ fontSize:12, color:'var(--text-secondary)' }}>
                    📍 {order.shipping_address}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
