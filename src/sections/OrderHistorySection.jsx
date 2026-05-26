import { useState, useEffect, useCallback } from 'react'
import { fetchOrders, updateOrderStatus, updateOrderTracking, markOrderDelivered, notifyOrderShipped, notifyOrderDelivered } from '../api/orders'
import { formatCurrency } from '../lib/formatters'

const CARRIERS = ['Canada Post', 'Purolator', 'UPS', 'FedEx', 'Other']

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

export default function OrderHistorySection({ workspace, toast }) {
  const [orders,    setOrders]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState('new')
  const [shipId,    setShipId]    = useState(null)
  const [carrier,   setCarrier]   = useState(CARRIERS[0])
  const [trackNo,   setTrackNo]   = useState('')
  const [acting,    setActing]    = useState(false)

  const load = useCallback(async () => {
    if (!workspace?.id) return
    setLoading(true)
    const { data } = await fetchOrders(workspace.id)
    setOrders(data || [])
    setLoading(false)
  }, [workspace?.id])

  useEffect(() => { load() }, [load])

  async function markProcessing(order) {
    setActing(true)
    const { error } = await updateOrderStatus(order.id, 'processing')
    if (error) {
      console.error('UPDATE ERROR:', JSON.stringify(error))
      toast('Could not update order.')
      setActing(false)
      return
    }
    toast('Marked as processing ✓')
    setActing(false); load()
  }

  async function ship(order) {
    if (!trackNo.trim()) return
    setActing(true)
    const { error } = await updateOrderTracking(order.id, { carrier, tracking_number: trackNo.trim() })
    if (error) { toast('Could not save tracking.'); setActing(false); return }
    const updated = { ...order, carrier, tracking_number: trackNo.trim() }
    const link = workspace?.slug ? `https://beorganized.io/${workspace.slug}` : ''
    await notifyOrderShipped(updated, workspace?.name || '', link)
    toast('Shipped · client notified ✓')
    setShipId(null); setTrackNo(''); setCarrier(CARRIERS[0])
    setActing(false); load()
  }

  async function deliver(order) {
    setActing(true)
    const { error } = await markOrderDelivered(order.id)
    if (error) { toast('Could not update order.'); setActing(false); return }
    const link = workspace?.slug ? `https://beorganized.io/${workspace.slug}` : ''
    await notifyOrderDelivered(order, workspace?.name || '', link)
    toast('Marked as delivered ✓')
    setActing(false); load()
  }

  // Stats bar
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const mNew       = orders.filter(o => NEW_STATUSES.includes(o.status)).length
  const mShipped   = orders.filter(o => o.status === 'shipped'   && new Date(o.created_at) >= monthStart).length
  const mDelivered = orders.filter(o => o.status === 'delivered' && new Date(o.created_at) >= monthStart).length

  const tabOrders = tabFilter(orders, activeTab)
  const iS = { height:34, borderRadius:7, border:'1px solid var(--border-2)', padding:'0 .75rem', fontSize:'.82rem', fontFamily:'inherit', background:'var(--bg)', color:'var(--ink)', outline:'none', width:'100%', boxSizing:'border-box' }

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

      {/* Internal tabs */}
      <div style={{ display:'flex', gap:'.35rem', marginBottom:'1.25rem', flexWrap:'wrap' }}>
        {STATUS_TABS.map(t => {
          const count = tabFilter(orders, t.key).length
          return (
            <button key={t.key} onClick={()=>setActiveTab(t.key)} style={{
              padding:'.35rem .85rem', borderRadius:99, border:'1.5px solid',
              borderColor: activeTab===t.key ? 'var(--gold)' : 'var(--border)',
              background: activeTab===t.key ? 'rgba(201,168,76,.1)' : 'transparent',
              color: activeTab===t.key ? 'var(--gold)' : 'var(--ink-3)',
              fontSize:'.75rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit',
            }}>{t.label} ({count})</button>
          )
        })}
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding:'2rem', color:'var(--ink-3)', fontSize:'.85rem' }}>Loading…</div>
        ) : tabOrders.length === 0 ? (
          <div style={{ padding:'2rem 1.4rem', color:'var(--ink-3)', fontSize:'.85rem', fontStyle:'italic' }}>
            No {STATUS_TABS.find(t=>t.key===activeTab)?.label.toLowerCase()} orders.
          </div>
        ) : tabOrders.map(order => {
          const badge = BADGE[order.status] || BADGE.confirmed
          const isExpanded = shipId === order.id
          const isNew = NEW_STATUSES.includes(order.status)
          const qty = order.quantity || 1
          const productLabel = order.product_name || `Cart order · ${qty} item${qty !== 1 ? 's' : ''}`
          const badgeLabel = isNew ? 'new' : order.status
          return (
            <div key={order.id} style={{ borderBottom:'1px solid var(--border)' }}>
              <div style={{ padding:'1rem 1.25rem' }}>
                {/* Row 1: product name + total */}
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'.25rem' }}>
                  <div style={{ fontWeight:700, fontSize:'.9rem', color:'var(--ink)', flex:1, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {productLabel}
                  </div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'.95rem', color:'var(--gold)', flexShrink:0, marginLeft:'.75rem' }}>
                    {formatCurrency(order.total_amount)}
                  </div>
                </div>
                {/* Row 2: client + date + badge */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'.2rem' }}>
                  <div style={{ fontSize:'.75rem', color:'var(--text-secondary)' }}>
                    {order.client_name || '—'} · {fmtDate(order.created_at)}
                  </div>
                  <span style={{ ...badge, fontSize:'.67rem', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', padding:'.2rem .55rem', borderRadius:5 }}>
                    {badgeLabel}
                  </span>
                </div>
                {/* Row 3: cart item breakdown or qty + unit price */}
                {order.cart_items?.length > 0 ? (
                  <div style={{ marginBottom:'.5rem' }}>
                    {order.cart_items.map((item, idx) => (
                      <div key={idx} style={{ fontSize:12, color:'var(--text-secondary)' }}>
                        {item.name} × {item.quantity} — ${Number(item.unit_price).toFixed(2)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize:12, color:'var(--text-secondary)', marginBottom:'.5rem' }}>
                    Qty: {qty} · ${Number(order.unit_price || 0).toFixed(2)} each
                  </div>
                )}

                {/* Actions */}
                {isNew && (
                  <button onClick={() => markProcessing(order)} disabled={acting} style={{
                    background:'transparent', border:'1.5px solid var(--gold)', color:'var(--gold)',
                    borderRadius:8, padding:'.4rem 1rem', fontSize:'.78rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                  }}>
                    {acting ? 'Saving…' : 'Mark as processing →'}
                  </button>
                )}

                {order.status === 'processing' && (
                  <div style={{ marginTop:'.65rem' }}>
                    {!isExpanded ? (
                      <button onClick={()=>{setShipId(order.id);setTrackNo('');setCarrier(CARRIERS[0])}} style={{
                        background:'transparent', border:'1.5px solid var(--gold)', color:'var(--gold)',
                        borderRadius:8, padding:'.4rem 1rem', fontSize:'.78rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                      }}>Mark as shipped →</button>
                    ) : (
                      <div style={{ display:'flex', flexDirection:'column', gap:'.5rem' }}>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.5rem' }}>
                          <select value={carrier} onChange={e=>setCarrier(e.target.value)} style={{ ...iS, cursor:'pointer' }}>
                            {CARRIERS.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <input type="text" placeholder="Tracking number" value={trackNo} onChange={e=>setTrackNo(e.target.value)} style={iS} />
                        </div>
                        <div style={{ display:'flex', gap:'.5rem' }}>
                          <button onClick={()=>ship(order)} disabled={acting||!trackNo.trim()} style={{
                            background:'var(--gold)', border:'none', color:'#fff', borderRadius:7,
                            padding:'.45rem 1rem', fontSize:'.78rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                            opacity: (acting || !trackNo.trim()) ? 0.45 : 1,
                          }}>
                            {acting ? 'Saving…' : 'Confirm & Notify →'}
                          </button>
                          <button onClick={()=>setShipId(null)} style={{
                            background:'transparent', border:'1px solid var(--border-2)', color:'var(--ink-3)',
                            borderRadius:7, padding:'.45rem .85rem', fontSize:'.78rem', cursor:'pointer', fontFamily:'inherit',
                          }}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {order.status === 'shipped' && (
                  <div style={{ marginTop:'.65rem' }}>
                    <div style={{ fontSize:'.78rem', color:'var(--ink-2)', marginBottom:'.5rem' }}>
                      <span style={{ color:'var(--ink-3)' }}>Carrier: </span>{order.carrier}
                      {order.tracking_number && <><span style={{ color:'var(--ink-3)', marginLeft:8 }}>Tracking: </span><code style={{ fontSize:'.75rem' }}>{order.tracking_number}</code></>}
                    </div>
                    <button onClick={()=>deliver(order)} disabled={acting} style={{
                      background:'rgba(34,197,94,.1)', border:'1px solid rgba(34,197,94,.3)', color:'#16a34a',
                      borderRadius:7, padding:'.4rem .9rem', fontSize:'.78rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                    }}>
                      {acting ? 'Saving…' : 'Mark as delivered'}
                    </button>
                  </div>
                )}

                {order.status === 'delivered' && (
                  <div style={{ marginTop:'.5rem', fontSize:'.78rem', color:'#16a34a', fontWeight:600 }}>
                    ✓ Delivered{order.delivered_at ? ` · ${fmtDate(order.delivered_at)}` : ''}
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
