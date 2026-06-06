import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { fetchOrderByToken } from '../api/orders'

const GOLD  = '#C9A84C'
const DARK  = '#1A0900'
const SERIF = "'Playfair Display', Georgia, serif"
const SANS  = "'Josefin Sans', sans-serif"

function getCarrierUrl(carrier, trackingNumber) {
  if (!carrier || !trackingNumber) return null
  const n = encodeURIComponent(trackingNumber)
  switch (carrier) {
    case 'Canada Post':
      return `https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=${n}`
    case 'UPS':
      return `https://www.ups.com/track?tracknum=${n}`
    case 'FedEx':
      return `https://www.fedex.com/apps/fedextrack/?tracknumbers=${n}`
    case 'Purolator':
      return `https://www.purolator.com/en/shipping/tracker.page?pin=${n}`
    default:
      return null
  }
}

function fmtDate(d) {
  if (!d) return ''
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  } catch { return d }
}

function StepCircle({ active, label, sub }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: active ? GOLD : '#E5E2DE',
        border: `2px solid ${active ? GOLD : '#D0CCC7'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .25s',
        position: 'relative', zIndex: 1,
      }}>
        {active && (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M3 8l3.5 3.5L13 5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: active ? DARK : '#A09890', fontFamily: SANS, letterSpacing: '.05em', textTransform: 'uppercase' }}>
          {label}
        </div>
        {sub && (
          <div style={{ fontSize: 10, color: '#B0A898', fontFamily: SANS, marginTop: 2 }}>{sub}</div>
        )}
      </div>
    </div>
  )
}

export default function TrackOrder() {
  const { token } = useParams()
  const [order,    setOrder]    = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!token) { setNotFound(true); setLoading(false); return }
    fetchOrderByToken(token).then(({ data, error }) => {
      setLoading(false)
      if (error || !data) { setNotFound(true); return }
      setOrder(data)
    })
  }, [token])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAFAF8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: SERIF, fontSize: '1.1rem', color: '#A09890' }}>Loading…</div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAFAF8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div
          style={{ fontFamily: SERIF, fontSize: '1.5rem', color: GOLD, marginBottom: 12, cursor: 'pointer' }}
          onClick={() => window.open('https://beorganized.io')}
        >Organized.</div>
        <div style={{ fontFamily: SANS, fontSize: '1rem', color: DARK, marginBottom: 8 }}>Order not found</div>
        <div style={{ fontFamily: SANS, fontSize: '.85rem', color: '#A09890', textAlign: 'center' }}>
          This tracking link may have expired or the order doesn't exist.
        </div>
      </div>
    )
  }

  const step1Active = true
  const step2Active = ['processing', 'shipped', 'delivered'].includes(order.status)
  const step3Active = !!(order.shipped_at)
  const step4Active = !!(order.delivered_at)
  const carrierUrl  = getCarrierUrl(order.carrier, order.tracking_number)

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: SANS }}>

      {/* Header */}
      <div style={{ background: DARK, padding: '20px 24px', textAlign: 'center' }}>
        <div
          style={{ fontFamily: SERIF, fontSize: '1.2rem', color: GOLD, cursor: 'pointer', display: 'inline-block' }}
          onClick={() => window.open('https://beorganized.io')}
        >
          Organized.
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '28px 20px 48px' }}>

        {/* Status timeline */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #EAE6E1', padding: '24px 20px', marginBottom: 16 }}>
          <div style={{ fontSize: '.58rem', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: GOLD, marginBottom: 20 }}>
            Order Status
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
            {/* Background track */}
            <div style={{
              position: 'absolute', top: 15, left: 'calc(12.5% + 16px)',
              right: 'calc(12.5% + 16px)', height: 2, background: '#E5E2DE', zIndex: 0,
            }}/>
            {/* Step 1→2 fill */}
            <div style={{
              position: 'absolute', top: 15,
              left: 'calc(12.5% + 16px)', right: 'calc(62.5% + 16px)',
              height: 2, background: step2Active ? GOLD : '#E5E2DE', zIndex: 1, transition: 'background .3s',
            }}/>
            {/* Step 2→3 fill */}
            <div style={{
              position: 'absolute', top: 15,
              left: 'calc(37.5% + 16px)', right: 'calc(37.5% + 16px)',
              height: 2, background: step3Active ? GOLD : '#E5E2DE', zIndex: 1, transition: 'background .3s',
            }}/>
            {/* Step 3→4 fill */}
            <div style={{
              position: 'absolute', top: 15,
              left: 'calc(62.5% + 16px)', right: 'calc(12.5% + 16px)',
              height: 2, background: step4Active ? GOLD : '#E5E2DE', zIndex: 1, transition: 'background .3s',
            }}/>
            <StepCircle active={step1Active} label="Confirmed"  sub={fmtDate(order.created_at)} />
            <StepCircle active={step2Active} label="Processing" sub={''} />
            <StepCircle active={step3Active} label="Shipped"    sub={step3Active ? fmtDate(order.shipped_at) : ''} />
            <StepCircle active={step4Active} label="Delivered"  sub={step4Active ? fmtDate(order.delivered_at) : ''} />
          </div>
        </div>

        {/* Order card */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #EAE6E1', padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: '.58rem', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: GOLD, marginBottom: 14 }}>
            Your Order
          </div>
          <div style={{ fontFamily: SERIF, fontSize: '1.1rem', fontWeight: 600, color: DARK, marginBottom: 6 }}>
            {order.product_name || 'Order'}
          </div>
          <div style={{ fontSize: '.82rem', color: '#7A706A', marginBottom: 8 }}>
            Qty: {order.quantity || 1}
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: GOLD }}>
            ${Number(order.total_amount || 0).toFixed(2)} {(order.currency || 'CAD').toUpperCase()}
          </div>
          {order.shipping_address && (
            <div style={{ fontSize: '.78rem', color: '#A09890', marginTop: 12, paddingTop: 12, borderTop: '1px solid #F0EDE8', lineHeight: 1.6 }}>
              <span style={{ fontWeight: 600, color: '#7A706A' }}>Ships to: </span>{order.shipping_address}
            </div>
          )}
        </div>

        {/* Tracking card — only if shipped */}
        {order.shipped_at && (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #EAE6E1', borderLeft: `3px solid ${GOLD}`, padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: '.58rem', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: GOLD, marginBottom: 14 }}>
              Tracking
            </div>
            <div style={{ fontSize: '.9rem', fontWeight: 600, color: DARK, marginBottom: 12 }}>
              Your order is on its way
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              {order.carrier && (
                <div style={{ fontSize: '.82rem', color: '#555' }}>
                  <span style={{ color: '#A09890', fontWeight: 600 }}>Carrier: </span>{order.carrier}
                </div>
              )}
              {order.tracking_number && (
                <div style={{ fontSize: '.82rem', color: '#555' }}>
                  <span style={{ color: '#A09890', fontWeight: 600 }}>Tracking: </span>
                  <span style={{ fontFamily: 'monospace', background: '#F8F6F2', padding: '2px 6px', borderRadius: 4 }}>
                    {order.tracking_number}
                  </span>
                </div>
              )}
            </div>
            {carrierUrl ? (
              <a
                href={carrierUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-block', background: GOLD, color: '#fff', padding: '12px 24px', borderRadius: 8, fontSize: '.85rem', fontWeight: 700, textDecoration: 'none', letterSpacing: '.03em', fontFamily: SERIF }}
              >
                Track on {order.carrier} →
              </a>
            ) : order.tracking_number && (
              <div style={{ fontSize: '.78rem', color: '#A09890' }}>
                Use tracking number{' '}
                <span style={{ fontFamily: 'monospace' }}>{order.tracking_number}</span>
                {' '}on your carrier's website.
              </div>
            )}
          </div>
        )}

      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '24px 20px', borderTop: '1px solid #EAE6E1' }}>
        <span
          style={{ fontFamily: SERIF, fontSize: '.9rem', color: GOLD, cursor: 'pointer' }}
          onClick={() => window.open('https://beorganized.io')}
        >
          Organized.
        </span>
        <div style={{ fontFamily: SANS, fontSize: '.75rem', color: '#B0A898', marginTop: 4 }}>
          Powered by Organized.
        </div>
      </div>

    </div>
  )
}
