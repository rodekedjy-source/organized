import { useState } from 'react'
import { updateOrderStatus, updateOrderTracking, markOrderDelivered, notifyOrderShipped, notifyOrderDelivered } from '../api/orders'

const CARRIERS = ['Canada Post', 'Purolator', 'UPS', 'FedEx', 'Other']

const BADGE = {
  pending:    { bg:'rgba(245,158,11,.15)',  color:'#b45309', label:'New' },
  confirmed:  { bg:'rgba(245,158,11,.15)',  color:'#b45309', label:'New' },
  processing: { bg:'rgba(59,130,246,.12)',  color:'#1d4ed8', label:'Processing' },
  shipped:    { bg:'rgba(139,92,246,.12)',  color:'#7c3aed', label:'Shipped' },
  delivered:  { bg:'rgba(34,197,94,.12)',   color:'#16a34a', label:'Delivered' },
}

const fmtDate = d => { try { return new Date(d).toLocaleDateString('en-CA',{month:'short',day:'numeric',year:'numeric'}) } catch { return '' } }

const Card = ({children}) => (
  <div style={{background:'var(--bg-card)',borderRadius:12,boxShadow:'0 1px 4px rgba(0,0,0,.07)',padding:'1rem 1.25rem',marginBottom:'1rem'}}>
    {children}
  </div>
)
const Lbl = ({children}) => (
  <div style={{fontSize:10,fontWeight:700,letterSpacing:'.08em',color:'var(--text-secondary)',textTransform:'uppercase',marginBottom:'.5rem'}}>
    {children}
  </div>
)

export default function OrderDetailPage({ order: init, onBack, workspace, toast }) {
  const [order,    setOrder]    = useState(init)
  const [acting,   setActing]   = useState(false)
  const [showShip, setShowShip] = useState(false)
  const [carrier,  setCarrier]  = useState(CARRIERS[0])
  const [trackNo,  setTrackNo]  = useState('')

  const badge  = BADGE[order.status] || BADGE.confirmed
  const isNew  = ['pending','confirmed'].includes(order.status)
  const link   = workspace?.slug ? `https://beorganized.io/${workspace.slug}` : ''
  const iS     = {height:36,borderRadius:8,border:'1px solid var(--border-2)',padding:'0 .75rem',fontSize:'.82rem',fontFamily:'inherit',background:'var(--bg)',color:'var(--ink)',outline:'none',width:'100%',boxSizing:'border-box'}
  const goldBt = {width:'100%',padding:'.65rem',background:'transparent',border:'1.5px solid var(--gold)',color:'var(--gold)',borderRadius:10,fontWeight:700,fontSize:'.85rem',cursor:'pointer',fontFamily:'inherit'}

  async function doProcess() {
    setActing(true)
    const { error } = await updateOrderStatus(order.id, 'processing')
    if (error) { toast('Could not update order.'); setActing(false); return }
    setOrder(o => ({...o, status: 'processing'}))
    toast('Marked as processing ✓')
    setActing(false)
  }

  async function doShip() {
    if (!trackNo.trim()) return
    setActing(true)
    const { error } = await updateOrderTracking(order.id, { carrier, tracking_number: trackNo.trim() })
    if (error) { toast('Could not save tracking.'); setActing(false); return }
    const updated = {...order, carrier, tracking_number: trackNo.trim(), status:'shipped'}
    setOrder(updated)
    await notifyOrderShipped(updated, workspace?.name || '', link)
    toast('Shipped · client notified ✓')
    setShowShip(false); setTrackNo(''); setCarrier(CARRIERS[0]); setActing(false)
  }

  async function doDeliver() {
    setActing(true)
    const { error } = await markOrderDelivered(order.id)
    if (error) { toast('Could not update order.'); setActing(false); return }
    await notifyOrderDelivered(order, workspace?.name || '', link)
    toast('Delivered · client notified ✓')
    setActing(false)
    onBack()
  }

  return (
    <div style={{paddingBottom:90}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1rem 1.25rem',borderBottom:'1px solid var(--border)',marginBottom:'1rem'}}>
        <button onClick={onBack} style={{background:'none',border:'none',color:'var(--gold)',fontWeight:700,fontSize:'.9rem',cursor:'pointer',fontFamily:'inherit',padding:0}}>
          ← Back
        </button>
        <span style={{fontWeight:700,fontSize:'.9rem',color:'var(--ink)'}}>
          Order #{order.id.slice(0,8).toUpperCase()}
        </span>
        <span style={{fontSize:'.75rem',color:'var(--text-secondary)'}}>{fmtDate(order.created_at)}</span>
      </div>

      <div style={{padding:'0 1rem'}}>

        {/* ORDER SUMMARY */}
        <Card>
          <Lbl>Order Summary</Lbl>
          {order.cart_items?.length > 0 ? (
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr>
                  {['Item','Qty','Price'].map((h,i) => (
                    <th key={h} style={{fontSize:11,color:'var(--text-secondary)',fontWeight:600,paddingBottom:6,textAlign:i===0?'left':i===1?'center':'right'}}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {order.cart_items.map((item,i) => (
                  <tr key={i}>
                    <td style={{fontSize:13,padding:'.35rem 0',borderTop:'1px solid var(--border)'}}>{item.name}</td>
                    <td style={{fontSize:13,textAlign:'center',padding:'.35rem 0',borderTop:'1px solid var(--border)'}}>×{item.quantity}</td>
                    <td style={{fontSize:13,textAlign:'right',padding:'.35rem 0',borderTop:'1px solid var(--border)'}}>${Number(item.unit_price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : order.product_name === 'Cart order' ? (
            <div>
              <div style={{fontSize:14,color:'var(--ink)'}}>
                Cart order — {order.quantity || '?'} items · ${Number(order.total_amount||0).toFixed(2)} total
              </div>
              <div style={{fontSize:11,color:'var(--text-secondary)',marginTop:4}}>
                Item breakdown not available for this order
              </div>
            </div>
          ) : (
            <div style={{display:'flex',justifyContent:'space-between',fontSize:14,color:'var(--ink)'}}>
              <span>{order.product_name || 'Product'}</span>
              <span>×{order.quantity||1} · ${Number(order.unit_price||0).toFixed(2)}</span>
            </div>
          )}
          <div style={{borderTop:'1px solid var(--border)',marginTop:'.75rem',paddingTop:'.75rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontWeight:600,fontSize:'.85rem',color:'var(--ink)'}}>Total</span>
            <span style={{fontWeight:700,fontSize:'1rem',color:'var(--gold)'}}>
              ${Number(order.total_amount||0).toFixed(2)} {(order.currency||'CAD').toUpperCase()}
            </span>
          </div>
        </Card>

        {/* CLIENT INFO */}
        <Card>
          <Lbl>Client</Lbl>
          <div style={{fontSize:14,fontWeight:600,color:'var(--ink)'}}>{order.client_name||'—'}</div>
          {order.client_email && <div style={{fontSize:13,color:'var(--text-secondary)',marginTop:2}}>{order.client_email}</div>}
          {order.client_phone && <div style={{fontSize:13,color:'var(--text-secondary)',marginTop:2}}>{order.client_phone}</div>}
        </Card>

        {/* SHIPPING ADDRESS */}
        {order.shipping_address && (
          <Card>
            <Lbl>Ship To</Lbl>
            <div style={{fontSize:14,color:'var(--ink)',lineHeight:1.6}}>{order.shipping_address}</div>
          </Card>
        )}

        {/* STATUS + ACTIONS */}
        <Card>
          <Lbl>Status</Lbl>
          <span style={{background:badge.bg,color:badge.color,fontSize:12,fontWeight:700,padding:'.2rem .6rem',borderRadius:5,letterSpacing:'.04em'}}>
            {badge.label}
          </span>
          <div style={{marginTop:'1rem'}}>

            {isNew && (
              <button onClick={doProcess} disabled={acting} style={{...goldBt,opacity:acting?0.45:1}}>
                {acting ? 'Saving…' : 'Mark as processing →'}
              </button>
            )}

            {order.status === 'processing' && !showShip && (
              <button onClick={()=>setShowShip(true)} style={goldBt}>Mark as shipped →</button>
            )}

            {order.status === 'processing' && showShip && (
              <div style={{display:'flex',flexDirection:'column',gap:'.5rem'}}>
                <select value={carrier} onChange={e=>setCarrier(e.target.value)} style={{...iS,cursor:'pointer'}}>
                  {CARRIERS.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
                <input type="text" placeholder="Tracking number" value={trackNo} onChange={e=>setTrackNo(e.target.value)} style={iS}/>
                <div style={{display:'flex',gap:'.5rem'}}>
                  <button onClick={doShip} disabled={acting||!trackNo.trim()} style={{flex:1,padding:'.55rem',background:'var(--gold)',border:'none',color:'#fff',borderRadius:8,fontWeight:700,fontSize:'.82rem',cursor:'pointer',fontFamily:'inherit',opacity:(acting||!trackNo.trim())?0.45:1}}>
                    {acting ? 'Saving…' : 'Confirm shipment →'}
                  </button>
                  <button onClick={()=>setShowShip(false)} style={{padding:'.55rem .9rem',background:'transparent',border:'1px solid var(--border-2)',color:'var(--ink-3)',borderRadius:8,fontSize:'.82rem',cursor:'pointer',fontFamily:'inherit'}}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {order.status === 'shipped' && (
              <div>
                <div style={{fontSize:13,color:'var(--ink-2)',marginBottom:'.75rem'}}>
                  <span style={{color:'var(--text-secondary)'}}>Carrier: </span>{order.carrier}
                  {order.tracking_number && (
                    <><span style={{color:'var(--text-secondary)',marginLeft:8}}>Tracking: </span>
                    <code style={{fontSize:12}}>{order.tracking_number}</code></>
                  )}
                </div>
                <button onClick={doDeliver} disabled={acting} style={{...goldBt,background:'rgba(34,197,94,.1)',border:'1px solid rgba(34,197,94,.3)',color:'#16a34a',opacity:acting?0.45:1}}>
                  {acting ? 'Saving…' : 'Mark as delivered'}
                </button>
              </div>
            )}

            {order.status === 'delivered' && (
              <div style={{fontSize:14,color:'#16a34a',fontWeight:600}}>
                ✓ Delivered{order.delivered_at ? ` on ${fmtDate(order.delivered_at)}` : ''}
              </div>
            )}
          </div>
        </Card>

        {/* TRACKING LINK */}
        {order.tracking_token && (
          <Card>
            <Lbl>Tracking Link</Lbl>
            <div style={{fontSize:13,color:'var(--ink-2)',marginBottom:'.5rem',wordBreak:'break-all'}}>
              beorganized.io/track/{order.tracking_token}
            </div>
            <button
              onClick={()=>{
                navigator.clipboard.writeText(`https://beorganized.io/track/${order.tracking_token}`)
                toast('Link copied ✓')
              }}
              style={{padding:'.4rem .9rem',background:'transparent',border:'1px solid var(--border-2)',color:'var(--ink-2)',borderRadius:8,fontSize:'.8rem',cursor:'pointer',fontFamily:'inherit'}}
            >
              Copy link
            </button>
          </Card>
        )}

      </div>
    </div>
  )
}
