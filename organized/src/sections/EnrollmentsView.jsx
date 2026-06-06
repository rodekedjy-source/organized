import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { markWaitlistNotified, removeWaitlistEntry } from '../api/waitlist'
import { getRefundRequests } from '../api/refundRequests'
import RefundRequestsTab from './RefundRequestsTab'

const STATUS_TABS = ['All', 'Paid', 'Free', 'Pending', 'Cancelled', 'Waitlist', 'Refunds']
const BADGE = {
  paid:      { bg:'rgba(34,197,94,.12)',   color:'#16a34a' },
  free:      { bg:'rgba(59,130,246,.12)',  color:'#1d4ed8' },
  pending:   { bg:'rgba(245,158,11,.15)',  color:'#b45309' },
  cancelled: { bg:'rgba(100,116,139,.12)', color:'#475569' },
}

function fmtDate(d) {
  try { return new Date(d).toLocaleDateString('en-CA',{month:'short',day:'numeric',year:'numeric'}) } catch { return '' }
}

function generateCertificate(enrollment, workspaceName) {
  const student = enrollment.student_name || enrollment.client_name || 'Student'
  const title   = enrollment.offerings?.title || 'Course'
  const date    = new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Certificate</title>
<style>body{margin:0;background:#FAF7F2;font-family:Georgia,serif;display:flex;align-items:center;justify-content:center;min-height:100vh;}
.c{width:680px;padding:60px;border:3px solid #C9A84C;background:#FAF7F2;text-align:center;position:relative;}
.c::before{content:'';position:absolute;inset:12px;border:1px solid rgba(201,168,76,.3);pointer-events:none;}
.ey{font-size:11px;font-family:Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#C9A84C;margin-bottom:18px;}
.ti{font-size:34px;color:#1a1a1a;margin-bottom:28px;font-style:italic;}
.ce{font-size:14px;color:#666;margin-bottom:8px;}
.st{font-size:26px;color:#1a1a1a;margin:8px 0 20px;border-bottom:1px solid #C9A84C;padding-bottom:10px;}
.co{font-size:16px;color:#333;margin-bottom:28px;line-height:1.6;}
.me{font-size:12px;color:#999;font-family:Arial,sans-serif;}
.br{margin-top:36px;font-size:20px;color:#C9A84C;letter-spacing:.1em;}
</style></head><body><div class="c">
<div class="ey">Certificate of Completion</div>
<div class="ti">Certificate of Completion</div>
<div class="ce">This certifies that</div>
<div class="st">${student}</div>
<div class="co">has successfully completed<br><strong>${title}</strong></div>
<div class="me">Issued on ${date}<br>By ${workspaceName}</div>
<div class="br">Organized.</div>
</div></body></html>`
  const blob = new Blob([html], { type: 'text/html' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = `certificate-${student.replace(/\s+/g,'-')}.html`
  document.body.appendChild(a); a.click()
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url) }, 1000)
}

export default function EnrollmentsView({ workspace, toast }) {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [tab, setTab]                 = useState('All')

  // Waitlist state
  const [waitlist, setWaitlist]       = useState([])
  const [wlLoading, setWlLoading]     = useState(false)
  const [notifying, setNotifying]     = useState(null) // id being notified

  // Refund requests state
  const [refundReqs, setRefundReqs]   = useState([])
  const [rrLoading, setRrLoading]     = useState(false)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('enrollments')
      .select('*, offerings(title, type, price)')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: false })
    setEnrollments(data || [])
    setLoading(false)
  }

  async function loadWaitlist() {
    setWlLoading(true)
    const { data, error } = await supabase
      .from('waitlist_entries')
      .select('*')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: true })
    if (error) { console.error('Waitlist fetch error:', error); setWaitlist([]); setWlLoading(false); return }
    setWaitlist(data || [])
    setWlLoading(false)
  }

  async function loadRefundReqs() {
    setRrLoading(true)
    const { data, error } = await getRefundRequests(workspace.id)
    if (error) { console.error('Refund requests fetch error:', error); setRefundReqs([]); setRrLoading(false); return }
    setRefundReqs(data || [])
    setRrLoading(false)
  }

  useEffect(() => { if (workspace?.id) { load(); loadWaitlist(); loadRefundReqs() } }, [workspace?.id])
  useEffect(() => { if (tab === 'Waitlist' && workspace?.id) loadWaitlist() }, [tab, workspace?.id])
  useEffect(() => { if (tab === 'Refunds' && workspace?.id) loadRefundReqs() }, [tab, workspace?.id])

  useEffect(() => {
    if (!workspace?.id) return
    const sub = supabase
      .channel('enrollments-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'enrollments', filter: `workspace_id=eq.${workspace.id}` },
        () => load()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'waitlist_entries', filter: `workspace_id=eq.${workspace.id}` },
        () => loadWaitlist()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'refund_requests', filter: `workspace_id=eq.${workspace.id}` },
        () => loadRefundReqs()
      )
      .subscribe()
    return () => supabase.removeChannel(sub)
  }, [workspace?.id])

  async function markCompleted(id) {
    const ts = new Date().toISOString()
    const { error } = await supabase.from('enrollments').update({ completed_at: ts }).eq('id', id)
    if (error) { toast('Could not update.'); return }
    toast('Marked as completed ✓')
    setEnrollments(prev => prev.map(e => e.id===id ? {...e, completed_at: ts} : e))
  }

  async function issueCert(enrollment) {
    generateCertificate(enrollment, workspace?.name || 'Your Instructor')
    const ts = new Date().toISOString()
    await supabase.from('enrollments').update({ certificate_issued_at: ts }).eq('id', enrollment.id)
    toast('Certificate issued ✓')
    setEnrollments(prev => prev.map(e => e.id===enrollment.id ? {...e, certificate_issued_at: ts} : e))
  }

  async function handleRefund(enrollment) {
    const confirmed = window.confirm(
      `Refund $${Number(enrollment.amount_paid).toFixed(2)} to ${enrollment.client_name}?`
    )
    if (!confirmed) return
    const { error } = await supabase.functions.invoke('refund-enrollment', {
      body: { enrollment_id: enrollment.id }
    })
    if (error) { toast('Refund failed. Try again.'); return }
    toast('Refund issued ✓')
    load()
  }

  async function notifyWaitlist(entry) {
    setNotifying(entry.id)
    try {
      await supabase.functions.invoke('send-enrollment-email', {
        body: {
          type: 'waitlist_notify',
          client_name:    entry.student_name,
          client_email:   entry.student_email,
          offering_title: entry.offerings?.title || 'Formation',
          offering_type:  entry.offerings?.type  || 'online',
          workshop_date:  entry.offerings?.workshop_date || null,
          workspace_name: workspace.name,
          booking_link:   workspace.slug ? `https://beorganized.io/${workspace.slug}` : 'https://beorganized.io',
        }
      })
      await markWaitlistNotified(entry.id)
      setWaitlist(prev => prev.map(e => e.id === entry.id ? { ...e, notified_at: new Date().toISOString() } : e))
      toast('Notification sent ✓')
    } catch {
      toast('Could not send notification.')
    } finally {
      setNotifying(null)
    }
  }

  async function removeWaitlist(id) {
    const { error } = await removeWaitlistEntry(id)
    if (error) { toast('Could not remove.'); return }
    setWaitlist(prev => prev.filter(e => e.id !== id))
    toast('Removed from waitlist')
  }

  function tabFilter(list) {
    if (tab==='All')       return list
    if (tab==='Paid')      return list.filter(e => e.payment_status==='paid' || (Number(e.amount_paid)>0 && e.payment_status!=='free'))
    if (tab==='Free')      return list.filter(e => e.payment_status==='free' || Number(e.amount_paid)===0)
    if (tab==='Pending')   return list.filter(e => e.payment_status==='pending')
    if (tab==='Cancelled') return list.filter(e => e.status==='cancelled')
    return list
  }

  const total     = enrollments.length
  const earned    = enrollments.reduce((s,e) => s+Number(e.amount_paid||0), 0)
  const completed = enrollments.filter(e => e.completed_at).length
  const visible   = tabFilter(enrollments)

  function tabCount(t) {
    if (t === 'Waitlist') return waitlist.length
    if (t === 'Refunds')  return refundReqs.filter(r => r.status === 'pending').length
    if (t === 'All') return enrollments.length
    if (t==='Paid')      return enrollments.filter(e => e.payment_status==='paid' || (Number(e.amount_paid)>0 && e.payment_status!=='free')).length
    if (t==='Free')      return enrollments.filter(e => e.payment_status==='free' || Number(e.amount_paid)===0).length
    if (t==='Pending')   return enrollments.filter(e => e.payment_status==='pending').length
    if (t==='Cancelled') return enrollments.filter(e => e.status==='cancelled').length
    return 0
  }

  function badgeStyle(e) {
    const k = e.status==='cancelled' ? 'cancelled' : e.payment_status==='paid' ? 'paid' : e.payment_status==='free' ? 'free' : 'pending'
    const b = BADGE[k] || BADGE.pending
    return { background:b.bg, color:b.color, fontSize:'.67rem', fontWeight:700, padding:'.18rem .55rem', borderRadius:5, textTransform:'uppercase', letterSpacing:'.06em' }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Enrollments</div>
          <div className="page-sub">{total} total · ${earned.toFixed(0)} earned · {completed} completed</div>
        </div>
      </div>

      <div style={{ display:'flex', gap:'.35rem', marginBottom:'1rem', flexWrap:'wrap' }}>
        {STATUS_TABS.map(t => {
          const cnt      = tabCount(t)
          const isRedTab = t === 'Refunds' && cnt > 0
          return (
            <button key={t} onClick={() => setTab(t)} style={{
              padding:'.35rem .85rem', borderRadius:99, border:'1.5px solid',
              borderColor: tab===t ? 'var(--gold)' : isRedTab ? 'rgba(239,68,68,.4)' : 'var(--border)',
              background:  tab===t ? 'rgba(201,168,76,.1)' : 'transparent',
              color:       tab===t ? 'var(--gold)' : isRedTab ? '#dc2626' : 'var(--ink-3)',
              fontSize:'.75rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit',
            }}>{t} ({cnt})</button>
          )
        })}
      </div>

      {/* ── REFUNDS TAB ── */}
      {tab === 'Refunds' ? (
        <RefundRequestsTab
          workspace={workspace}
          toast={toast}
          requests={refundReqs}
          loading={rrLoading}
          onReload={loadRefundReqs}
        />
      ) : tab === 'Waitlist' ? (
        wlLoading ? (
          <div style={{ padding:'2rem', color:'var(--ink-3)', fontSize:'.85rem' }}>Loading…</div>
        ) : waitlist.length === 0 ? (
          <div style={{ padding:'2rem', color:'var(--ink-3)', fontStyle:'italic', fontSize:'.85rem' }}>No one on the waitlist.</div>
        ) : waitlist.map((w, idx) => (
          <div key={w.id} style={{ background:'var(--bg-card)', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,.07)', padding:'1rem 1.25rem', marginBottom:'.75rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'.25rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'.5rem' }}>
                <span style={{ fontSize:'.7rem', fontWeight:700, color:'var(--gold)', background:'rgba(201,168,76,.1)', borderRadius:6, padding:'.1rem .45rem' }}>#{idx + 1}</span>
                <div style={{ fontWeight:700, fontSize:'.9rem', color:'var(--ink)' }}>{w.student_name || '—'}</div>
                {w.notified_at && <span style={{ fontSize:'.67rem', fontWeight:700, color:'#16a34a', background:'rgba(34,197,94,.12)', borderRadius:5, padding:'.1rem .45rem' }}>Notified</span>}
              </div>
              <span style={{ fontSize:'.72rem', color:'var(--ink-3)' }}>{fmtDate(w.created_at)}</span>
            </div>
            <div style={{ fontSize:'.78rem', color:'var(--ink-2)', marginBottom:'.3rem' }}>{w.student_email}</div>
            <div style={{ fontSize:'.75rem', color:'var(--ink-3)', marginBottom:'.5rem' }}>{w.offerings?.title || '—'}</div>
            <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap' }}>
              <button
                onClick={() => notifyWaitlist(w)}
                disabled={notifying === w.id}
                style={{ padding:'.35rem .85rem', background:'transparent', border:'1.5px solid var(--gold)', color:'var(--gold)', borderRadius:8, fontSize:'.78rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit', opacity: notifying===w.id ? .5 : 1 }}>
                {notifying === w.id ? 'Sending…' : 'Notify →'}
              </button>
              <button
                onClick={() => removeWaitlist(w.id)}
                style={{ padding:'.35rem .85rem', background:'transparent', border:'1.5px solid rgba(100,116,139,.4)', color:'var(--ink-3)', borderRadius:8, fontSize:'.78rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                Remove
              </button>
            </div>
          </div>
        ))
      ) : (
        /* ── ENROLLMENT TABS ── */
        loading ? (
          <div style={{ padding:'2rem', color:'var(--ink-3)', fontSize:'.85rem' }}>Loading…</div>
        ) : visible.length === 0 ? (
          <div style={{ padding:'2rem', color:'var(--ink-3)', fontStyle:'italic', fontSize:'.85rem' }}>No enrollments.</div>
        ) : visible.map(e => {
          const name  = e.student_name || e.client_name || '—'
          const title = e.offerings?.title || '—'
          const amt   = Number(e.amount_paid || 0)
          const label = e.status==='cancelled' ? 'cancelled' : e.payment_status || 'pending'
          return (
            <div key={e.id} style={{ background:'var(--bg-card)', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,.07)', padding:'1rem 1.25rem', marginBottom:'.75rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'.35rem' }}>
                <div style={{ fontWeight:700, fontSize:'.9rem', color:'var(--ink)' }}>{name}</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'.9rem', color:'var(--gold)', marginLeft:'.5rem' }}>
                  {amt > 0 ? `$${amt.toFixed(0)}` : 'Free'}
                </div>
              </div>
              <div style={{ fontSize:'.78rem', color:'var(--ink-2)', marginBottom:'.3rem' }}>{title}</div>
              <div style={{ display:'flex', alignItems:'center', gap:'.5rem', marginBottom:'.4rem' }}>
                <span style={{ fontSize:'.72rem', color:'var(--ink-3)' }}>{fmtDate(e.created_at)}</span>
                <span style={badgeStyle(e)}>{label}</span>
              </div>
              {e.completed_at && (
                <div style={{ fontSize:'.75rem', color:'#16a34a', marginBottom:'.35rem' }}>✓ Completed {fmtDate(e.completed_at)}</div>
              )}
              <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap', marginTop:'.25rem' }}>
                {!e.completed_at && (
                  <button onClick={() => markCompleted(e.id)}
                    style={{ padding:'.38rem .85rem', background:'transparent', border:'1.5px solid var(--gold)', color:'var(--gold)', borderRadius:8, fontSize:'.78rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                    Mark as completed →
                  </button>
                )}
                {e.completed_at && !e.certificate_issued_at && (
                  <button onClick={() => issueCert(e)}
                    style={{ padding:'.38rem .85rem', background:'transparent', border:'1.5px solid rgba(34,197,94,.5)', color:'#16a34a', borderRadius:8, fontSize:'.78rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                    Issue certificate →
                  </button>
                )}
                {e.certificate_issued_at && (
                  <span style={{ fontSize:'.72rem', color:'#16a34a' }}>📜 Certificate issued {fmtDate(e.certificate_issued_at)}</span>
                )}
                {e.payment_status === 'paid' && !e.refunded_at && (
                  <button onClick={() => handleRefund(e)}
                    style={{ padding:'.38rem .85rem', background:'transparent', border:'1.5px solid rgba(239,68,68,.4)', color:'#dc2626', borderRadius:8, fontSize:'.78rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                    Refund
                  </button>
                )}
                {e.refunded_at && (
                  <span style={{ fontSize:'.67rem', fontWeight:700, color:'var(--ink-3)', background:'rgba(100,116,139,.12)', borderRadius:5, padding:'.18rem .55rem', textTransform:'uppercase', letterSpacing:'.06em' }}>Refunded</span>
                )}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
