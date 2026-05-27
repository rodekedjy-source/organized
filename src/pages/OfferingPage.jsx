import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function fmtDate(d) {
  try { return new Date(d).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}) } catch { return '' }
}
function fmtPrice(p) { return `$${Number(p).toFixed(0)}` }

function CountdownChip({ endsAt }) {
  const [label, setLabel] = useState('')
  useEffect(() => {
    function calc() {
      const diff = new Date(endsAt) - new Date()
      if (diff <= 0) { setLabel(''); return }
      const d = Math.floor(diff/86400000)
      const h = Math.floor((diff%86400000)/3600000)
      setLabel(d > 0 ? `Early bird ends in ${d}d ${h}h` : `Early bird ends in ${h}h`)
    }
    calc()
    const t = setInterval(calc, 60000)
    return () => clearInterval(t)
  }, [endsAt])
  if (!label) return null
  return <div style={{ fontSize:11, fontWeight:700, color:'#b45309', background:'rgba(245,158,11,.12)', borderRadius:6, padding:'4px 10px', display:'inline-block', marginBottom:8 }}>{label}</div>
}

export default function OfferingPage() {
  const { slug, offeringId } = useParams()
  const [ws, setWs]           = useState(null)
  const [offering, setOffering] = useState(null)
  const [reviews, setReviews]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [openMod, setOpenMod]   = useState(null)

  // Enroll / waitlist sheet
  const [sheetOpen, setSheetOpen] = useState(false)
  const [mode, setMode]           = useState('enroll') // 'enroll' | 'waitlist'
  const [form, setForm]           = useState({ name:'', email:'', phone:'' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone]           = useState(false)
  const [err, setErr]             = useState('')

  useEffect(() => {
    async function load() {
      const { data: workspace } = await supabase.from('workspaces').select('id,name,bio,photo_url').eq('slug', slug).maybeSingle()
      if (!workspace) { setLoading(false); return }
      setWs(workspace)
      const { data: o } = await supabase.from('offerings')
        .select('*')
        .eq('id', offeringId)
        .eq('workspace_id', workspace.id)
        .maybeSingle()
      setOffering(o)
      if (o) {
        const { data: rv } = await supabase.from('reviews')
          .select('id,rating,comment,client_name,created_at')
          .eq('workspace_id', workspace.id)
          .order('created_at', { ascending: false })
          .limit(6)
        setReviews(rv || [])
      }
      setLoading(false)
    }
    load()
  }, [slug, offeringId])

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0a0908' }}>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', color:'#C9A84C' }}>Organized<span style={{ color:'#F0EAE0' }}>.</span></div>
    </div>
  )
  if (!offering) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#FAF7F2' }}>
      <p style={{ color:'#888', fontFamily:'DM Sans,sans-serif' }}>Formation not found.</p>
    </div>
  )

  const isWorkshop = offering.type === 'workshop'
  const isFree     = Number(offering.price) === 0
  const spotsLeft  = isWorkshop && offering.spots_total > 0 ? offering.spots_total - (offering.spots_taken || 0) : null
  const isFull     = spotsLeft !== null && spotsLeft <= 0
  const fillPct    = offering.spots_total > 0 ? Math.min(100, ((offering.spots_taken||0)/offering.spots_total)*100) : 0
  const now        = new Date()
  const ebActive   = offering.early_bird_enabled && offering.early_bird_price && offering.early_bird_ends_at && new Date(offering.early_bird_ends_at) > now
  const displayPrice = ebActive ? Number(offering.early_bird_price) : Number(offering.price)
  const outcomes   = Array.isArray(offering.learning_outcomes) ? offering.learning_outcomes.filter(Boolean) : []
  const agenda     = Array.isArray(offering.agenda) ? offering.agenda.filter(a => a.time || a.description) : []
  const included   = Array.isArray(offering.whats_included) ? offering.whats_included.filter(Boolean) : []
  const modules    = Array.isArray(offering.modules) ? offering.modules.filter(m => m.title) : []

  function openEnroll() { setMode(isFull && offering.waitlist_enabled ? 'waitlist' : 'enroll'); setForm({name:'',email:'',phone:''}); setDone(false); setErr(''); setSheetOpen(true) }

  async function submit() {
    if (!form.name.trim() || !form.email.trim()) { setErr('Name and email are required.'); return }
    setSubmitting(true); setErr('')
    if (mode === 'waitlist') {
      const { error } = await supabase.from('waitlist_entries').insert({ offering_id: offering.id, workspace_id: ws.id, student_name: form.name.trim(), student_email: form.email.trim() })
      if (error) { setErr('Something went wrong.'); setSubmitting(false); return }
    } else {
      const payload = { offering_id: offering.id, workspace_id: ws.id, student_name: form.name.trim(), student_email: form.email.trim(), student_phone: form.phone.trim() || null, amount_paid: isFree ? 0 : displayPrice, payment_status: isFree ? 'free' : 'pending', status: 'active' }
      const { error } = await supabase.from('enrollments').insert(payload)
      if (error) { setErr('Something went wrong.'); setSubmitting(false); return }
      if (isWorkshop && offering.spots_total > 0) await supabase.from('offerings').update({ spots_taken: (offering.spots_taken||0)+1 }).eq('id', offering.id)
    }
    setDone(true); setSubmitting(false)
  }

  const S = { fontFamily:'DM Sans,sans-serif', background:'#FAF7F2', minHeight:'100vh' }
  const gold = '#C9A84C'

  return (
    <div style={S}>
      {/* Hero */}
      <div style={{ background: offering.cover_image ? `linear-gradient(to bottom,rgba(0,0,0,.55),rgba(0,0,0,.72)),url(${offering.cover_image}) center/cover` : 'linear-gradient(135deg,#2C1810,#1A0F0A)', padding:'56px 24px 40px', color:'#fff' }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <div style={{ fontSize:11, fontWeight:700, color: gold, textTransform:'uppercase', letterSpacing:'.12em', marginBottom:12 }}>{isWorkshop ? 'Workshop' : 'Online Course'}</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:32, fontWeight:700, margin:'0 0 12px', lineHeight:1.2 }}>{offering.title}</h1>
          {offering.description && <p style={{ fontSize:15, color:'rgba(255,255,255,.8)', margin:'0 0 18px', lineHeight:1.6, maxWidth:500 }}>{offering.description}</p>}
          <div style={{ display:'flex', flexWrap:'wrap', gap:12, fontSize:13, color:'rgba(255,255,255,.7)' }}>
            {isWorkshop && offering.workshop_date && <span>📅 {fmtDate(offering.workshop_date)}</span>}
            {offering.location && <span>📍 {offering.location}</span>}
            {offering.level && <span>🎯 {offering.level}</span>}
            {offering.duration_label && <span>⏱ {offering.duration_label}</span>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:600, margin:'0 auto', padding:'0 24px 120px' }}>
        {/* Price + CTA card */}
        <div style={{ background:'#fff', borderRadius:16, boxShadow:'0 2px 16px rgba(0,0,0,.09)', padding:'1.25rem 1.4rem', margin:'24px 0 20px' }}>
          {ebActive && <CountdownChip endsAt={offering.early_bird_ends_at} />}
          <div style={{ display:'flex', alignItems:'baseline', gap:10, marginBottom:12 }}>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:700, color: gold }}>{isFree ? 'Free' : fmtPrice(displayPrice)}</span>
            {ebActive && <span style={{ fontSize:14, color:'#aaa', textDecoration:'line-through' }}>{fmtPrice(offering.price)}</span>}
          </div>
          {isWorkshop && offering.spots_total > 0 && (
            <div style={{ marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4 }}>
                <span style={{ color: fillPct>=80?'#e05c5c':'#888', fontWeight: fillPct>=80?700:400 }}>{spotsLeft} spot{spotsLeft!==1?'s':''} left</span>
                <span style={{ color:'#aaa' }}>{offering.spots_taken||0}/{offering.spots_total}</span>
              </div>
              <div style={{ height:5, background:'#f0ebe3', borderRadius:3 }}>
                <div style={{ height:'100%', background: fillPct>=80?'#e05c5c':gold, borderRadius:3, width:`${fillPct}%`, transition:'width .4s' }}/>
              </div>
            </div>
          )}
          <button onClick={openEnroll} style={{ width:'100%', padding:'14px', background: isFull && !offering.waitlist_enabled ? '#ccc' : 'linear-gradient(135deg,#C9A84C,#B8924A)', border:'none', borderRadius:10, color:'#fff', fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:15, cursor: isFull && !offering.waitlist_enabled ? 'default':'pointer' }} disabled={isFull && !offering.waitlist_enabled}>
            {isFull && !offering.waitlist_enabled ? 'Sold Out' : isFull && offering.waitlist_enabled ? 'Join Waitlist →' : isFree ? 'Get Access — Free →' : `Reserve a Spot → ${fmtPrice(displayPrice)}`}
          </button>
        </div>

        {/* Learning outcomes */}
        {outcomes.length > 0 && (
          <section style={{ marginBottom:24 }}>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:'#1a1a1a', marginBottom:14 }}>What you'll learn</h2>
            <div style={{ display:'grid', gap:10 }}>
              {outcomes.map((o,i) => <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', fontSize:14, color:'#333' }}><span style={{ color:gold, marginTop:2, flexShrink:0 }}>✓</span>{o}</div>)}
            </div>
          </section>
        )}

        {/* Agenda (workshop) */}
        {isWorkshop && agenda.length > 0 && (
          <section style={{ marginBottom:24 }}>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:'#1a1a1a', marginBottom:14 }}>Agenda</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
              {agenda.map((a,i) => (
                <div key={i} style={{ display:'flex', gap:14, paddingBottom:14 }}>
                  {a.time && <div style={{ fontSize:12, color:gold, fontWeight:700, minWidth:48, paddingTop:2 }}>{a.time}</div>}
                  <div style={{ fontSize:14, color:'#333', lineHeight:1.5 }}>{a.description}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* What's included */}
        {included.length > 0 && (
          <section style={{ marginBottom:24 }}>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:'#1a1a1a', marginBottom:14 }}>What's included</h2>
            <div style={{ display:'grid', gap:8 }}>
              {included.map((it,i) => <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', fontSize:14, color:'#333' }}><span style={{ color:gold, flexShrink:0 }}>◆</span>{it}</div>)}
            </div>
          </section>
        )}

        {/* Modules (online) */}
        {!isWorkshop && modules.length > 0 && (
          <section style={{ marginBottom:24 }}>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:'#1a1a1a', marginBottom:14 }}>Course content</h2>
            {modules.map((m,i) => (
              <div key={i} style={{ border:'1px solid #e8e0d0', borderRadius:10, marginBottom:8, overflow:'hidden' }}>
                <button onClick={() => setOpenMod(openMod===i?null:i)} style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 14px', background: openMod===i?'#faf5ee':'#fff', border:'none', cursor:'pointer', fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:14, color:'#1a1a1a', textAlign:'left' }}>
                  <span>{m.title}</span><span style={{ color:gold, fontSize:12 }}>{openMod===i?'▲':'▼'}</span>
                </button>
                {openMod===i && m.content && <div style={{ padding:'10px 14px 14px', fontSize:13, color:'#555', lineHeight:1.6, background:'#faf5ee' }}>{m.content}</div>}
              </div>
            ))}
          </section>
        )}

        {/* About instructor */}
        {ws && (ws.bio || ws.photo_url) && (
          <section style={{ marginBottom:24, background:'#fff', borderRadius:14, padding:'1.25rem', boxShadow:'0 1px 6px rgba(0,0,0,.07)' }}>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, color:'#1a1a1a', marginBottom:12 }}>Your instructor</h2>
            <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
              {ws.photo_url && <img src={ws.photo_url} alt={ws.name} style={{ width:52, height:52, borderRadius:'50%', objectFit:'cover', flexShrink:0 }}/>}
              <div>
                <div style={{ fontWeight:700, fontSize:15, color:'#1a1a1a', marginBottom:4 }}>{ws.name}</div>
                {ws.bio && <p style={{ fontSize:13, color:'#666', lineHeight:1.6, margin:0 }}>{ws.bio}</p>}
              </div>
            </div>
          </section>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <section style={{ marginBottom:24 }}>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:'#1a1a1a', marginBottom:14 }}>Reviews</h2>
            {reviews.map(r => (
              <div key={r.id} style={{ background:'#fff', borderRadius:12, padding:'1rem', marginBottom:10, boxShadow:'0 1px 4px rgba(0,0,0,.06)' }}>
                <div style={{ display:'flex', gap:4, marginBottom:6 }}>{[1,2,3,4,5].map(s=><span key={s} style={{ color:s<=r.rating?gold:'#ddd', fontSize:13 }}>★</span>)}</div>
                {r.comment && <p style={{ fontSize:13, color:'#444', margin:'0 0 6px', lineHeight:1.55 }}>{r.comment}</p>}
                <div style={{ fontSize:11, color:'#aaa' }}>{r.client_name}</div>
              </div>
            ))}
          </section>
        )}
      </div>

      {/* Sticky bottom CTA */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'#fff', borderTop:'1px solid #e8e0d0', padding:'12px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 -2px 12px rgba(0,0,0,.08)', zIndex:100 }}>
        <div>
          <div style={{ fontWeight:700, fontSize:15, color:'#1a1a1a', fontFamily:"'Playfair Display',serif" }}>{offering.title}</div>
          <div style={{ fontSize:13, color:gold, fontWeight:700 }}>{isFree ? 'Free' : fmtPrice(displayPrice)}</div>
        </div>
        <button onClick={openEnroll} disabled={isFull && !offering.waitlist_enabled} style={{ padding:'11px 22px', background: isFull && !offering.waitlist_enabled ?'#ccc':'linear-gradient(135deg,#C9A84C,#B8924A)', border:'none', borderRadius:10, color:'#fff', fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:14, cursor: isFull && !offering.waitlist_enabled ?'default':'pointer' }}>
          {isFull && !offering.waitlist_enabled ? 'Sold Out' : isFull && offering.waitlist_enabled ? 'Join Waitlist →' : 'Reserve a Spot →'}
        </button>
      </div>

      {/* Enroll / Waitlist sheet */}
      {sheetOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', zIndex:800, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={() => setSheetOpen(false)}>
          <div style={{ background:'#FAF7F2', borderRadius:'20px 20px 0 0', width:'100%', maxWidth:520, padding:'1.5rem 1.5rem 2.5rem', boxSizing:'border-box' }} onClick={e => e.stopPropagation()}>
            {!done ? (
              <>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.25rem' }}>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:gold, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:4 }}>{mode==='waitlist'?'Join Waitlist':isWorkshop?'Reserve a Spot':'Enroll Now'}</div>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:'#1a1a1a' }}>{offering.title}</div>
                  </div>
                  <button onClick={() => setSheetOpen(false)} style={{ background:'none', border:'none', color:'#888', fontSize:22, cursor:'pointer', padding:0, lineHeight:1 }}>✕</button>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'.65rem', marginBottom:'1.25rem' }}>
                  {[{key:'name',ph:'Full name',type:'text'},{key:'email',ph:'Email address',type:'email'},{key:'phone',ph:'Phone (optional)',type:'tel'}].map(({key,ph,type})=>(
                    <input key={key} type={type} value={form[key]||''} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} placeholder={ph} style={{ width:'100%', background:'#fff', border:'1px solid #e8e0d0', borderRadius:10, padding:'12px 14px', color:'#1a1a1a', fontFamily:'DM Sans,sans-serif', fontSize:14, outline:'none', boxSizing:'border-box' }}/>
                  ))}
                </div>
                {err && <p style={{ fontSize:12, color:'#e05c5c', marginBottom:'.6rem' }}>{err}</p>}
                <button onClick={submit} disabled={submitting} style={{ width:'100%', padding:'14px', background:'linear-gradient(135deg,#C9A84C,#B8924A)', border:'none', borderRadius:10, color:'#fff', fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:15, cursor:'pointer' }}>
                  {submitting ? 'Submitting…' : mode==='waitlist' ? 'Join Waitlist →' : isFree ? 'Get Access — Free →' : `Reserve — ${fmtPrice(displayPrice)} →`}
                </button>
              </>
            ) : (
              <div style={{ textAlign:'center', padding:'1rem 0' }}>
                <div style={{ fontSize:32, marginBottom:12 }}>{mode==='waitlist'?'🔔':'🎉'}</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:'#1a1a1a', marginBottom:8 }}>{mode==='waitlist'?"You're on the waitlist!":'You\'re in!'}</div>
                <p style={{ fontSize:14, color:'#666', lineHeight:1.6 }}>{mode==='waitlist'?"We'll notify you if a spot opens up.":'Check your email for confirmation.'}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
