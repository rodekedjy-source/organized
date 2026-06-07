import { useState } from 'react'
import { supabase } from '../lib/supabase'

async function createCheckoutSession(priceId, workspaceId, billingInterval) {
  const { data, error } = await supabase.functions.invoke('create-subscription', {
    body: { price_id: priceId, workspace_id: workspaceId, billing_interval: billingInterval },
  })
  if (error) throw error
  return data
}

const PRICES = {
  essential: {
    monthly: { id: 'price_1Te2s9LK1I7qLsjci5sqbRJM', amount: '$19.99' },
    yearly:  { id: 'price_1Te2t5LK1I7qLsjcgI1LIg1l', amount: '$190.99' },
  },
  pro: {
    monthly: { id: 'price_1Te2tvLK1I7qLsjcttBtZqxm', amount: '$39.99' },
    yearly:  { id: 'price_1Te2ueLK1I7qLsjcpomLTyKn', amount: '$390.99' },
  },
}

const FEATURES_ESSENTIAL = [
  'Booking page & services',
  'Client management',
  'Appointment reminders',
  'Payment deposits',
  'Analytics dashboard',
]

const FEATURES_PRO = [
  'Booking page & services',
  'Client management',
  'Appointment reminders',
  'Payment deposits',
  'Analytics dashboard',
  'Online shop',
  'Digital courses & workshops',
  'Portfolio gallery',
  'Priority support',
]

const gold = '#B8924A'
const goldLight = 'rgba(184,146,74,0.12)'

function Checkmark() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
      <circle cx="8" cy="8" r="8" fill={goldLight} />
      <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke={gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function UpgradeModal({ workspaceId, currentPlan, onSuccess }) {
  const [interval, setInterval] = useState('monthly')
  const [loading, setLoading] = useState(null) // 'essential' | 'pro' | null

  async function handleUpgrade(plan) {
    const priceObj = PRICES[plan][interval]
    setLoading(plan)
    try {
      const { url } = await createCheckoutSession(priceObj.id, workspaceId, interval)
      if (url) window.location.href = url
    } catch (err) {
      console.error('Checkout error:', err)
      setLoading(null)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(10,9,8,0.72)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: '#FDFAF5',
        borderRadius: 20,
        boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
        maxWidth: 760,
        width: '100%',
        padding: '2.5rem 2rem 2rem',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', color: '#1A0E00', marginBottom: '.5rem' }}>
            Choose your plan
          </div>
          <div style={{ fontSize: '.9rem', color: '#7A6A58' }}>
            Your trial has ended. Select a plan to continue using Organized.
          </div>
        </div>

        {/* Interval toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', background: '#EDE8E0', borderRadius: 100, padding: 4, gap: 4,
          }}>
            {['monthly', 'yearly'].map(iv => (
              <button key={iv} onClick={() => setInterval(iv)} style={{
                padding: '.4rem 1.25rem',
                borderRadius: 100,
                border: 'none',
                cursor: 'pointer',
                fontSize: '.82rem',
                fontWeight: 500,
                fontFamily: 'inherit',
                transition: 'all .2s ease',
                background: interval === iv ? '#fff' : 'transparent',
                color: interval === iv ? '#1A0E00' : '#7A6A58',
                boxShadow: interval === iv ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
              }}>
                {iv === 'monthly' ? 'Monthly' : 'Yearly · Save 20%'}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Essential */}
          <div style={{
            background: '#fff',
            border: '1.5px solid #E8E0D4',
            borderRadius: 16,
            padding: '1.5rem',
          }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '.72rem', fontWeight: 600, color: gold, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '.4rem' }}>Essential</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: '#1A0E00', lineHeight: 1 }}>
                {PRICES.essential[interval].amount}
              </div>
              <div style={{ fontSize: '.78rem', color: '#9A8E7E', marginTop: '.25rem' }}>
                {interval === 'monthly' ? 'per month' : 'per year'}
              </div>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
              {FEATURES_ESSENTIAL.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '.5rem', fontSize: '.84rem', color: '#3D2E1E' }}>
                  <Checkmark />{f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleUpgrade('essential')}
              disabled={!!loading}
              style={{
                width: '100%', padding: '.75rem', borderRadius: 10, border: `1.5px solid ${gold}`,
                background: 'transparent', color: gold, fontWeight: 600, fontSize: '.9rem',
                fontFamily: 'inherit', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading === 'pro' ? 0.5 : 1,
                transition: 'all .2s',
              }}
            >
              {loading === 'essential' ? 'Redirecting…' : 'Get Essential'}
            </button>
          </div>

          {/* Pro */}
          <div style={{
            background: '#fff',
            border: `2px solid ${gold}`,
            borderRadius: 16,
            padding: '1.5rem',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
              background: gold, color: '#fff', fontSize: '.7rem', fontWeight: 700,
              letterSpacing: '.06em', textTransform: 'uppercase',
              padding: '.25rem .85rem', borderRadius: 100,
              whiteSpace: 'nowrap',
            }}>
              Most Popular
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '.72rem', fontWeight: 600, color: gold, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '.4rem' }}>Pro</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: '#1A0E00', lineHeight: 1 }}>
                {PRICES.pro[interval].amount}
              </div>
              <div style={{ fontSize: '.78rem', color: '#9A8E7E', marginTop: '.25rem' }}>
                {interval === 'monthly' ? 'per month' : 'per year'}
              </div>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
              {FEATURES_PRO.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '.5rem', fontSize: '.84rem', color: '#3D2E1E' }}>
                  <Checkmark />{f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleUpgrade('pro')}
              disabled={!!loading}
              style={{
                width: '100%', padding: '.75rem', borderRadius: 10, border: 'none',
                background: gold, color: '#fff', fontWeight: 600, fontSize: '.9rem',
                fontFamily: 'inherit', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading === 'essential' ? 0.5 : 1,
                transition: 'all .2s',
                boxShadow: '0 4px 16px rgba(184,146,74,0.30)',
              }}
            >
              {loading === 'pro' ? 'Redirecting…' : 'Get Pro'}
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '.75rem', color: '#9A8E7E' }}>
          Secure payment via Stripe · Cancel anytime
        </div>
      </div>
    </div>
  )
}
