import { useState, useEffect } from 'react'
import { createConnectAccount } from '../api/stripe'
import { supabase } from '../lib/supabase'

const STEPS = [
  { n: 1, text: 'Connect your Stripe account' },
  { n: 2, text: 'Clients pay directly through your page' },
  { n: 3, text: 'Funds land in your bank automatically' },
]

export default function PaymentsSection({ workspace, toast, refetchWorkspace }) {
  const [connecting, setConnecting] = useState(false)
  const connected = workspace?.stripe_onboarded === true && !!workspace?.stripe_account_id

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('stripe') === 'success') {
      supabase.functions.invoke('verify-connect-account')
        .then(() => {
          refetchWorkspace?.()
          window.history.replaceState({}, '', '/dashboard')
        })
    }
  }, [])

  async function handleConnect() {
    if (!workspace?.id) return
    setConnecting(true)
    const { data, error } = await createConnectAccount(workspace.id)
    setConnecting(false)
    if (error) {
      console.error('Connect error:', error)
      toast(error.message || JSON.stringify(error))
      return
    }
    if (!data?.url) {
      toast('No redirect URL returned: ' + JSON.stringify(data))
      return
    }
    window.location.href = data.url
  }

  return (
    <div>
      <style>{`
        @keyframes pulse-dot {
          0%,100%{box-shadow:0 0 0 0 rgba(52,199,89,.45)}
          50%{box-shadow:0 0 0 6px rgba(52,199,89,0)}
        }
        .pay-pulse{
          width:9px;height:9px;border-radius:50%;background:#34C759;
          animation:pulse-dot 1.8s ease infinite;flex-shrink:0;
        }
        .pay-step{display:flex;align-items:flex-start;gap:.9rem;padding:.85rem 0;border-bottom:1px solid var(--border)}
        .pay-step:last-child{border-bottom:none}
        .pay-step-num{
          width:28px;height:28px;border-radius:50%;background:rgba(201,168,76,.1);
          border:1px solid rgba(201,168,76,.3);display:flex;align-items:center;
          justify-content:center;font-size:.75rem;font-weight:700;color:var(--gold);
          flex-shrink:0;margin-top:1px;
        }
        .pay-reconnect{
          background:none;border:1px solid var(--border-2);color:var(--ink-3);
          border-radius:8px;padding:.5rem 1.1rem;font-size:.78rem;cursor:pointer;
          font-family:inherit;transition:color .15s,border-color .15s;
        }
        .pay-reconnect:hover{color:var(--ink);border-color:var(--ink-3)}
      `}</style>

      <div className="page-head">
        <div>
          <div className="page-title">Payments</div>
          <div className="page-sub">Manage your Stripe connection and payout settings.</div>
        </div>
      </div>

      {connected ? (
        /* ── CONNECTED STATE ─────────────────────────────────── */
        <div className="card" style={{ overflow: 'hidden', marginBottom: '1rem' }}>

          {/* Dark header */}
          <div style={{
            background: 'linear-gradient(135deg,#2C1A0E,#1A0900)',
            padding: '1.4rem 1.5rem',
            borderBottom: '1px solid rgba(201,168,76,.18)',
          }}>
            <div style={{ fontSize: '.62rem', fontWeight: 700, color: 'rgba(201,168,76,.6)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '.45rem' }}>
              Stripe
            </div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.2rem', color: '#C9A84C', marginBottom: '.9rem' }}>
              Stripe Connected
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.55rem' }}>
              <div className="pay-pulse" />
              <span style={{ fontSize: '.78rem', color: 'rgba(240,234,224,.75)', fontWeight: 500 }}>
                Active — receiving payments
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '.88rem', color: 'var(--ink-2)', lineHeight: 1.65, margin: 0 }}>
              Funds are transferred to your bank automatically.
            </p>

            {workspace.stripe_account_id && (
              <div style={{
                fontSize: '.73rem', color: 'var(--ink-3)', background: 'var(--bg)',
                borderRadius: 8, padding: '.55rem .9rem', fontFamily: 'monospace',
                letterSpacing: '.02em', border: '1px solid var(--border)',
              }}>
                {workspace.stripe_account_id}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.75rem' }}>
              <a
                href="https://dashboard.stripe.com"
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '.85rem', color: 'var(--gold)', fontWeight: 600, textDecoration: 'none' }}
              >
                View payouts →
              </a>
              <button
                className="pay-reconnect"
                onClick={handleConnect}
                disabled={connecting}
              >
                {connecting ? 'Redirecting…' : 'Reconnect'}
              </button>
            </div>
          </div>
        </div>

      ) : (
        /* ── NOT CONNECTED STATE ─────────────────────────────── */
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="card-head">
            <div className="card-title">Accept Payments</div>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Steps */}
            <div style={{ marginBottom: '.25rem' }}>
              {STEPS.map(({ n, text }) => (
                <div key={n} className="pay-step">
                  <div className="pay-step-num">{n}</div>
                  <div style={{ fontSize: '.88rem', color: 'var(--ink-2)', lineHeight: 1.55, paddingTop: '.3rem' }}>
                    {text}
                  </div>
                </div>
              ))}
            </div>

            <button
              className="btn btn-primary"
              style={{ justifyContent: 'center', padding: '.75rem 2rem' }}
              onClick={handleConnect}
              disabled={connecting}
            >
              {connecting ? 'Redirecting…' : 'Connect Stripe →'}
            </button>

            <div style={{ fontSize: '.72rem', color: 'var(--ink-3)', textAlign: 'center', marginTop: '-.25rem' }}>
              Takes less than 5 minutes. No monthly fees.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
