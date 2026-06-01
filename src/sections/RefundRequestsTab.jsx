import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { approveRefundRequest, declineRefundRequest } from '../api/refundRequests'

function fmtDate(d) {
  try { return new Date(d).toLocaleDateString('en-CA', { month:'short', day:'numeric', year:'numeric' }) } catch { return '' }
}

const RR_BADGE = {
  pending:  { bg:'rgba(245,158,11,.15)',  color:'#b45309' },
  approved: { bg:'rgba(34,197,94,.12)',   color:'#16a34a' },
  declined: { bg:'rgba(239,68,68,.12)',   color:'#dc2626' },
}

export default function RefundRequestsTab({ workspace, toast, requests, loading, onReload }) {
  const [declining,      setDeclining]      = useState(null)   // id showing inline form
  const [declineReason,  setDeclineReason]  = useState('')
  const [processing,     setProcessing]     = useState(null)   // id being processed

  async function handleAccept(req) {
    const confirmed = window.confirm(
      `Accept & refund $${Number(req.enrollments?.amount_paid || 0).toFixed(2)} to ${req.client_name}?`
    )
    if (!confirmed) return
    setProcessing(req.id)
    const { error } = await supabase.functions.invoke('refund-enrollment', {
      body: { enrollment_id: req.enrollment_id }
    })
    if (error) { toast('Refund failed. Try again.'); setProcessing(null); return }
    await approveRefundRequest(req.id)
    toast('Refund issued & request approved ✓')
    setProcessing(null)
    onReload()
  }

  async function handleDecline(req) {
    if (!declineReason.trim()) { toast('Please enter a reason.'); return }
    setProcessing(req.id)
    const { error } = await declineRefundRequest(req.id, declineReason.trim())
    if (error) { toast('Could not decline. Try again.'); setProcessing(null); return }
    try {
      await supabase.functions.invoke('send-enrollment-email', {
        body: {
          type:           'refund_declined',
          client_name:    req.client_name,
          client_email:   req.client_email,
          offering_title: req.enrollments?.offerings?.title || 'Formation',
          workspace_name: workspace.name,
          decline_reason: declineReason.trim(),
        }
      })
    } catch { /* email failure doesn't block */ }
    toast('Request declined ✓')
    setDeclining(null)
    setDeclineReason('')
    setProcessing(null)
    onReload()
  }

  if (loading) {
    return <div style={{ padding:'2rem', color:'var(--ink-3)', fontSize:'.85rem' }}>Loading…</div>
  }
  if (!requests.length) {
    return <div style={{ padding:'2rem', color:'var(--ink-3)', fontStyle:'italic', fontSize:'.85rem' }}>No refund requests.</div>
  }

  return (
    <>
      {requests.map(req => {
        const badge   = RR_BADGE[req.status] || RR_BADGE.pending
        const title   = req.enrollments?.offerings?.title || '—'
        const amt     = Number(req.enrollments?.amount_paid || 0)
        const curr    = (req.enrollments?.currency || 'CAD').toUpperCase()
        const isDecl  = declining === req.id
        const isBusy  = processing === req.id

        return (
          <div key={req.id} style={{ background:'var(--bg-card)', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,.07)', padding:'1rem 1.25rem', marginBottom:'.75rem' }}>

            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'.3rem' }}>
              <div style={{ fontWeight:700, fontSize:'.9rem', color:'var(--ink)' }}>{req.client_name || '—'}</div>
              <span style={{ fontSize:'.67rem', fontWeight:700, padding:'.18rem .55rem', borderRadius:5, textTransform:'uppercase', letterSpacing:'.06em', background:badge.bg, color:badge.color }}>
                {req.status}
              </span>
            </div>

            {/* Email */}
            <div style={{ fontSize:'.78rem', color:'var(--ink-2)', marginBottom:'.3rem' }}>{req.client_email}</div>

            {/* Formation + amount */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.3rem' }}>
              <div style={{ fontSize:'.78rem', color:'var(--ink-3)' }}>{title}</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'.85rem', color:'var(--gold)', marginLeft:'.5rem', flexShrink:0 }}>
                {amt > 0 ? `$${amt.toFixed(2)} ${curr}` : 'Free'}
              </div>
            </div>

            {/* Reason */}
            {req.reason && (
              <div style={{ fontSize:'.78rem', color:'var(--ink-2)', background:'var(--bg-pill)', borderRadius:7, padding:'.5rem .75rem', marginBottom:'.4rem', lineHeight:1.5, fontStyle:'italic' }}>
                "{req.reason}"
              </div>
            )}

            {/* Date */}
            <div style={{ fontSize:'.72rem', color:'var(--ink-3)', marginBottom:'.5rem' }}>{fmtDate(req.created_at)}</div>

            {/* Decline note if already declined */}
            {req.status === 'declined' && req.decline_reason && (
              <div style={{ fontSize:'.75rem', color:'#dc2626', marginBottom:'.4rem' }}>
                Declined: {req.decline_reason}
              </div>
            )}

            {/* Actions — pending only */}
            {req.status === 'pending' && !isDecl && (
              <div style={{ display:'flex', gap:'.5rem' }}>
                <button onClick={() => handleAccept(req)} disabled={isBusy}
                  style={{ padding:'.38rem .85rem', background:'transparent', border:'1.5px solid rgba(34,197,94,.5)', color:'#16a34a', borderRadius:8, fontSize:'.78rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit', opacity:isBusy?.5:1 }}>
                  {isBusy ? 'Processing…' : 'Accept & Refund'}
                </button>
                <button onClick={() => { setDeclining(req.id); setDeclineReason('') }} disabled={isBusy}
                  style={{ padding:'.38rem .85rem', background:'transparent', border:'1.5px solid rgba(239,68,68,.4)', color:'#dc2626', borderRadius:8, fontSize:'.78rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit', opacity:isBusy?.5:1 }}>
                  Decline
                </button>
              </div>
            )}

            {/* Inline decline form */}
            {req.status === 'pending' && isDecl && (
              <div>
                <textarea
                  value={declineReason}
                  onChange={e => setDeclineReason(e.target.value)}
                  placeholder="Reason for declining…"
                  rows={3}
                  style={{ width:'100%', boxSizing:'border-box', border:'1.5px solid var(--border)', borderRadius:8, padding:'.5rem .75rem', fontSize:'.82rem', fontFamily:'inherit', resize:'vertical', outline:'none', marginBottom:'.5rem' }}
                />
                <div style={{ display:'flex', gap:'.5rem' }}>
                  <button onClick={() => handleDecline(req)} disabled={isBusy}
                    style={{ padding:'.38rem .85rem', background:'#dc2626', border:'none', color:'#fff', borderRadius:8, fontSize:'.78rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit', opacity:isBusy?.5:1 }}>
                    {isBusy ? 'Declining…' : 'Confirm Decline'}
                  </button>
                  <button onClick={() => { setDeclining(null); setDeclineReason('') }}
                    style={{ padding:'.38rem .85rem', background:'transparent', border:'1.5px solid var(--border)', color:'var(--ink-3)', borderRadius:8, fontSize:'.78rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}
