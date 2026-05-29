import { useState, useEffect } from 'react'
import { createConnectAccount, verifyConnectAccount } from '../api/stripe'

export default function PaymentsSection({ workspace, toast, refetchWorkspace }) {
  const [connecting, setConnecting] = useState(false)
  const connected = workspace?.stripe_onboarded === true && !!workspace?.stripe_account_id

  // Handle redirect back from Stripe Connect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('stripe') !== 'success' || !workspace?.id) return
    window.history.replaceState({}, '', '/dashboard')
    verifyConnectAccount(workspace.id).then(({ data }) => {
      if (data?.onboarded) {
        toast('Stripe account connected.')
        refetchWorkspace?.()
      }
    })
  }, [workspace?.id])

  async function handleConnect() {
    if (!workspace?.id) return
    setConnecting(true)
    const { data, error } = await createConnectAccount(workspace.id)
    setConnecting(false)
    if (error || !data?.url) {
      toast('Could not start Stripe connection. Please try again.')
      return
    }
    window.location.href = data.url
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Payments</div>
          <div className="page-sub">Manage your Stripe connection and payout settings.</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-head">
          <div className="card-title">{connected ? 'Stripe Connected' : 'Accept Payments'}</div>
        </div>
        <div className="card-body">
          {!connected ? (
            <>
              <p style={{ fontSize: '.88rem', color: 'var(--ink-2)', lineHeight: 1.65, margin: '0 0 1.25rem' }}>
                Connect your Stripe account to accept deposits, shop payments, and course enrollments.
              </p>
              <button
                className="btn btn-primary"
                style={{ justifyContent: 'center', padding: '.75rem 2rem' }}
                onClick={handleConnect}
                disabled={connecting}
              >
                {connecting ? 'Redirecting…' : 'Connect Stripe'}
              </button>
            </>
          ) : (
            <>
              <p style={{ fontSize: '.88rem', color: 'var(--ink-2)', lineHeight: 1.65, margin: '0 0 1.25rem' }}>
                Payouts go to your connected Stripe account.
              </p>
              {workspace.stripe_account_id && (
                <div style={{ fontSize: '.75rem', color: 'var(--ink-3)', background: 'var(--bg)', borderRadius: 8, padding: '.6rem .9rem', marginBottom: '1.1rem', fontFamily: 'monospace', letterSpacing: '.02em' }}>
                  {workspace.stripe_account_id}
                </div>
              )}
              <button
                className="btn btn-secondary"
                style={{ justifyContent: 'center', padding: '.75rem 2rem' }}
                onClick={handleConnect}
                disabled={connecting}
              >
                {connecting ? 'Redirecting…' : 'Reconnect'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
