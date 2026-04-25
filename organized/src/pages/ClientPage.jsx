/**
 * ClientPage.jsx — Page publique client avec onglets Book · Shop · Learn
 * Route:  /:slug   (dans App.jsx: <Route path="/:slug" element={<ClientPage />} />)
 * Auth:   Anonymous
 * Import: '../lib/supabase'
 *
 * Tabs s'affichent automatiquement selon ce que le stylist a configuré:
 *   Book  → si services actifs + accepts_bookings
 *   Shop  → si produits actifs + accepts_orders
 *   Learn → si formations actives
 */

import { useState, useEffect, useLayoutEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// ─── CONSTANTS ──────────────────────────────────────────────────────────────
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const Icons = {
  instagram: (<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>),
  tiktok:    (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.14 8.14 0 0 0 4.77 1.52V6.75a4.85 4.85 0 0 1-1-.06z"/></svg>),
  facebook:  (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>),
  twitter:   (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>),
  globe:     (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><line x1="2" y1="12" x2="22" y2="12"/></svg>),
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function pad(n){ return String(n).padStart(2,'0') }
function toMinutes(t){ const [h,m]=t.split(':').map(Number); return h*60+m }
function fromMinutes(m){ return `${pad(Math.floor(m/60))}:${pad(m%60)}` }
function formatTime12h(t){ const [h,m]=t.split(':').map(Number); const p=h>=12?'PM':'AM'; const h12=h===0?12:h>12?h-12:h; return `${h12}:${pad(m)} ${p}` }
function formatDuration(mins){ if(!mins)return''; if(mins<60)return`${mins} min`; const h=Math.floor(mins/60),m=mins%60; return m?`${h}h ${m}min`:`${h} hr` }
function fmtPrice(price, currency){ if(!price||price===0)return'Free'; return`$${Math.round(price)} ${currency||'CAD'}` }
function fmtSvcPrice(svc){ if(svc.is_free||svc.price===0)return'Free'; return`$${Math.round(svc.price)} & up` }

function svcIcon(name=''){ const n=name.toLowerCase(); if(n.includes('color')||n.includes('balayage'))return'✦'; if(n.includes('cut')||n.includes('coupe'))return'◆'; if(n.includes('natural')||n.includes('texture')||n.includes('loc'))return'❋'; if(n.includes('keratin'))return'◈'; if(n.includes('bridal'))return'◇'; if(n.includes('consult'))return'○'; return'◉' }
function svcAddons(name=''){ const n=name.toLowerCase(); if(n.includes('color')||n.includes('balayage'))return['Toning +$40','Deep Condition +$30','Olaplex +$50']; if(n.includes('cut'))return['Blowout +$35','Deep Treatment +$45']; if(n.includes('natural')||n.includes('texture'))return['Scalp Massage +$20','Steam Treatment +$30']; if(n.includes('keratin'))return['Express Blowout +$40','Olaplex +$50']; if(n.includes('bridal'))return['Trial Run +$120','Bridesmaid Styling +$85/person']; return[] }

function buildSocialLinks(ws){
  const l=[]
  if(ws.instagram) l.push({key:'instagram',icon:Icons.instagram,label:'Instagram',href:`https://instagram.com/${ws.instagram.replace('@','')}`})
  if(ws.tiktok)    l.push({key:'tiktok',icon:Icons.tiktok,label:'TikTok',href:`https://tiktok.com/@${ws.tiktok.replace('@','')}`})
  if(ws.facebook)  l.push({key:'facebook',icon:Icons.facebook,label:'Facebook',href:ws.facebook.startsWith('http')?ws.facebook:`https://facebook.com/${ws.facebook}`})
  if(ws.twitter)   l.push({key:'twitter',icon:Icons.twitter,label:'X',href:`https://x.com/${ws.twitter.replace('@','')}`})
  if(ws.website)   l.push({key:'website',icon:Icons.globe,label:'Website',href:ws.website.startsWith('http')?ws.website:`https://${ws.website}`})
  return l
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function ClientPage() {
  const { slug } = useParams()

  useLayoutEffect(() => {
    const el = document.createElement('style')
    el.id = 'cp-styles'
    el.textContent = STYLES
    document.head.appendChild(el)
    return () => document.getElementById('cp-styles')?.remove()
  }, [])

  // ── Page data ──
  const [ws,          setWs]          = useState(null)
  const [services,    setServices]    = useState([])
  const [products,    setProducts]    = useState([])
  const [offerings,   setOfferings]   = useState([])
  const [pageLoading, setPageLoading] = useState(true)
  const [pageError,   setPageError]   = useState(null)

  // ── Tabs ──
  const [activeTab, setActiveTab] = useState('book')

  // ── Booking ──
  const today = new Date()
  const [step,       setStep]       = useState(1)
  const [selSvc,     setSelSvc]     = useState(null)
  const [selAddons,  setSelAddons]  = useState([])
  const [calYear,    setCalYear]    = useState(today.getFullYear())
  const [calMonth,   setCalMonth]   = useState(today.getMonth())
  const [availDays,  setAvailDays]  = useState([])
  const [selDay,     setSelDay]     = useState(null)
  const [slots,      setSlots]      = useState([])
  const [loadSlots,  setLoadSlots]  = useState(false)
  const [selTime,    setSelTime]    = useState(null)
  const [bkForm,     setBkForm]     = useState({fname:'',lname:'',email:'',phone:'',source:'',notes:''})
  const [bkErrors,   setBkErrors]   = useState({})
  const [bkSub,      setBkSub]      = useState(false)
  const [bkDone,     setBkDone]     = useState(null)

  // ── Shop ──
  const [shopModal,  setShopModal]  = useState(null) // product object or null
  const [shopForm,   setShopForm]   = useState({fname:'',lname:'',email:'',phone:'',qty:1,notes:''})
  const [shopSub,    setShopSub]    = useState(false)
  const [shopDone,   setShopDone]   = useState(null)

  // ── Learn ──
  const [learnModal, setLearnModal] = useState(null) // offering object or null
  const [learnForm,  setLearnForm]  = useState({fname:'',lname:'',email:'',phone:''})
  const [learnSub,   setLearnSub]   = useState(false)
  const [learnDone,  setLearnDone]  = useState(null)

  // ════════════════════════════════════════════
  // FETCH
  // ════════════════════════════════════════════

  useEffect(() => {
    if (!slug) return
    ;(async () => {
      try {
        const { data: workspace, error: wErr } = await supabase
          .from('workspaces')
          .select('id,name,slug,tagline,bio,avatar_url,cover_url,instagram,tiktok,website,location,currency,timezone,is_published,accepts_bookings,accepts_orders')
          .eq('slug', slug)
          .single()
        if (wErr || !workspace) throw new Error('Not found')

        const [{ data: svcs }, { data: prods }, { data: offs }] = await Promise.all([
          supabase.from('services').select('id,name,description,duration_min,price,currency,is_free,display_order').eq('workspace_id', workspace.id).eq('is_active', true).is('deleted_at', null).order('display_order', { ascending: true }),
          supabase.from('products').select('id,name,description,price,currency,stock,image_url,images').eq('workspace_id', workspace.id).eq('is_active', true).is('deleted_at', null).gt('stock', 0),
          supabase.from('offerings').select('id,title,description,price,currency,duration_label,format,max_students').eq('workspace_id', workspace.id).eq('is_active', true).is('deleted_at', null),
        ])

        setWs(workspace)
        setServices(svcs || [])
        setProducts(prods || [])
        setOfferings(offs || [])
        document.title = `${workspace.name} — Organized.`

        // Set default tab to first available
        const hasSvcs = (svcs||[]).length > 0 && workspace.accepts_bookings !== false
        if (hasSvcs) setActiveTab('book')
        else if ((prods||[]).length > 0) setActiveTab('shop')
        else if ((offs||[]).length > 0) setActiveTab('learn')
      } catch(e) {
        setPageError(e.message)
      } finally {
        setPageLoading(false)
      }
    })()
  }, [slug])

  // ── Available days for calendar ──
  const fetchAvailDays = useCallback(async () => {
    if (!ws) return
    try {
      const { data: avail } = await supabase
        .from('availability')
        .select('day_of_week,open_time,close_time,is_open')
        .eq('workspace_id', ws.id)
        .eq('is_open', true)
      if (!avail?.length) { setAvailDays([]); return }

      const openDows = new Set(avail.map(a => a.day_of_week))
      const lastDay  = new Date(calYear, calMonth+1, 0)
      const s = `${calYear}-${pad(calMonth+1)}-01`
      const e = `${calYear}-${pad(calMonth+1)}-${pad(lastDay.getDate())}`

      const { data: blocked } = await supabase.from('blocked_dates').select('blocked_date').eq('workspace_id', ws.id).gte('blocked_date', s).lte('blocked_date', e)
      const blockedSet = new Set((blocked||[]).map(b => b.blocked_date))
      const todayMid = new Date(); todayMid.setHours(0,0,0,0)
      const days = []
      for (let d=1; d<=lastDay.getDate(); d++) {
        const dt = new Date(calYear, calMonth, d)
        const ds = `${calYear}-${pad(calMonth+1)}-${pad(d)}`
        if (dt <= todayMid) continue
        if (!openDows.has(dt.getDay())) continue
        if (blockedSet.has(ds)) continue
        days.push(d)
      }
      setAvailDays(days)
    } catch(e) { console.error(e) }
  }, [ws, calYear, calMonth])

  useEffect(() => { fetchAvailDays() }, [fetchAvailDays])

  async function fetchSlots(day) {
    if (!ws) return
    setLoadSlots(true); setSlots([])
    try {
      const dateStr = `${calYear}-${pad(calMonth+1)}-${pad(day)}`
      const dow = new Date(calYear, calMonth, day).getDay()
      const dur = selSvc?.duration_min || 60

      const [{ data: windows }, { data: appts }] = await Promise.all([
        supabase.from('availability').select('open_time,close_time').eq('workspace_id', ws.id).eq('day_of_week', dow).eq('is_open', true),
        supabase.from('appointments').select('scheduled_at,duration_min').eq('workspace_id', ws.id).gte('scheduled_at', `${dateStr}T00:00:00`).lt('scheduled_at', `${dateStr}T23:59:59`).not('status','in','("cancelled","no_show")').is('deleted_at', null),
      ])

      if (!windows?.length) { setSlots([]); return }

      const booked = (appts||[]).map(a => { const dt=new Date(a.scheduled_at); const s=dt.getHours()*60+dt.getMinutes(); return{start:s,end:s+(a.duration_min||60)} })
      const gen = []
      for (const w of windows) {
        let cur = toMinutes(w.open_time)
        const close = toMinutes(w.close_time)
        while (cur+dur <= close) {
          const end = cur+dur
          const occupied = booked.some(b => cur < b.end && end > b.start)
          gen.push({ raw: fromMinutes(cur), display: formatTime12h(fromMinutes(cur)), booked: occupied })
          cur += 30
        }
      }
      setSlots(gen)
    } catch(e) { console.error(e) }
    finally { setLoadSlots(false) }
  }

  // ════════════════════════════════════════════
  // BOOKING ACTIONS
  // ════════════════════════════════════════════

  function pickSvc(svc) { setSelSvc(svc); setSelAddons([]) }
  function toggleAddon(a) { setSelAddons(p => p.includes(a)?p.filter(x=>x!==a):[...p,a]) }
  function pickDay(d) { setSelDay(d); setSelTime(null); fetchSlots(d) }
  function pickTime(sl) { if (!sl.booked) setSelTime(sl.raw) }

  function changeMonth(dir) {
    const now = new Date()
    let y=calYear, m=calMonth+dir
    if (m<0)  { m=11; y-- }
    if (m>11) { m=0;  y++ }
    if (y < now.getFullYear() || (y===now.getFullYear() && m<now.getMonth())) return
    setCalYear(y); setCalMonth(m); setSelDay(null); setSelTime(null); setSlots([])
  }

  function goStep(n) {
    if (n===2 && !selSvc) return
    if (n===3 && (!selDay||!selTime)) return
    setStep(n)
    setTimeout(() => document.getElementById('cp-book-anchor')?.scrollIntoView({ behavior:'smooth', block:'start' }), 50)
  }

  async function submitBooking() {
    const errs = {}
    if (!bkForm.fname.trim()) errs.fname='Required'
    if (!bkForm.lname.trim()) errs.lname='Required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bkForm.email.trim())) errs.email='Valid email required'
    if (bkForm.phone.replace(/\D/g,'').length < 7) errs.phone='Required'
    if (Object.keys(errs).length) { setBkErrors(errs); return }
    setBkErrors({}); setBkSub(true)

    try {
      const dateStr = `${calYear}-${pad(calMonth+1)}-${pad(selDay)}`
      const sAt = new Date(`${dateStr}T${selTime}:00`)
      const dur = selSvc.duration_min || 60
      const eAt = new Date(sAt.getTime() + dur*60000)
      const addNote = selAddons.length ? `[Add-ons: ${selAddons.join(', ')}]\n` : ''

      const { error: iErr } = await supabase.from('appointments').insert({
        workspace_id: ws.id, service_id: selSvc.id, service_name: selSvc.name,
        client_name: `${bkForm.fname.trim()} ${bkForm.lname.trim()}`,
        client_email: bkForm.email.trim(), client_phone: bkForm.phone.trim(),
        notes: (addNote+(bkForm.notes||'')).trim()||null,
        scheduled_at: sAt.toISOString(), duration_min: dur, ends_at: eAt.toISOString(),
        status: 'pending', amount: selSvc.is_free ? 0 : selSvc.price,
        currency: selSvc.currency || ws.currency || 'CAD', payment_status: 'unpaid',
      })
      if (iErr) { if (iErr.code==='23505') { alert('Slot just taken — pick another.'); setSelTime(null); fetchSlots(selDay); setStep(2); return } throw iErr }

      setBkDone({ serviceName: selSvc.name, displayDate:`${MONTHS[calMonth]} ${selDay}, ${calYear}`, displayTime: formatTime12h(selTime), duration: formatDuration(dur), email: bkForm.email.trim(), addons: selAddons, needsDeposit: !selSvc.is_free && selSvc.price >= 100 })
      setStep(4)
    } catch(e) { alert('Something went wrong. Please try again.'); console.error(e) }
    finally { setBkSub(false) }
  }

  // ════════════════════════════════════════════
  // SHOP ACTIONS
  // ════════════════════════════════════════════

  async function submitOrder() {
    const p = shopModal
    const errs = {}
    if (!shopForm.fname.trim()) errs.fname='Required'
    if (!shopForm.lname.trim()) errs.lname='Required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shopForm.email.trim())) errs.email='Valid email required'
    if (shopForm.phone.replace(/\D/g,'').length < 7) errs.phone='Required'
    if (Object.keys(errs).length) { return }
    setShopSub(true)
    try {
      await supabase.from('orders').insert({
        workspace_id: ws.id, product_id: p.id,
        client_name: `${shopForm.fname.trim()} ${shopForm.lname.trim()}`,
        client_email: shopForm.email.trim(), client_phone: shopForm.phone.trim(),
        quantity: shopForm.qty||1, unit_price: p.price,
        total_amount: p.price * (shopForm.qty||1),
        currency: p.currency || ws.currency || 'CAD',
        status: 'pending', payment_status: 'unpaid',
      })
      setShopDone({ productName: p.name, qty: shopForm.qty||1, email: shopForm.email.trim() })
    } catch(e) { alert('Something went wrong.'); console.error(e) }
    finally { setShopSub(false) }
  }

  function openShopModal(p) {
    setShopModal(p); setShopDone(null)
    setShopForm({fname:'',lname:'',email:'',phone:'',qty:1,notes:''})
  }

  // ════════════════════════════════════════════
  // LEARN ACTIONS
  // ════════════════════════════════════════════

  async function submitEnrollment() {
    if (!learnForm.fname.trim()||!learnForm.lname.trim()||!learnForm.email.trim()||learnForm.phone.replace(/\D/g,'').length < 7) { alert('Please fill all required fields.'); return }
    setLearnSub(true)
    const o = learnModal
    try {
      await supabase.from('enrollments').insert({
        workspace_id: ws.id, offering_id: o.id,
        client_name: `${learnForm.fname.trim()} ${learnForm.lname.trim()}`,
        client_email: learnForm.email.trim(), client_phone: learnForm.phone.trim(),
        amount_paid: 0, currency: o.currency || ws.currency || 'CAD',
        payment_status: 'unpaid', status: 'active',
      })
      setLearnDone({ title: o.title, email: learnForm.email.trim() })
    } catch(e) { alert('Something went wrong.'); console.error(e) }
    finally { setLearnSub(false) }
  }

  function openLearnModal(o) {
    setLearnModal(o); setLearnDone(null)
    setLearnForm({fname:'',lname:'',email:'',phone:''})
  }

  // ════════════════════════════════════════════
  // CALENDAR RENDER
  // ════════════════════════════════════════════

  function renderCalCells() {
    const firstDay = new Date(calYear, calMonth, 1).getDay()
    const daysInMonth = new Date(calYear, calMonth+1, 0).getDate()
    const todayMid = new Date(); todayMid.setHours(0,0,0,0)
    const availSet = new Set(availDays)
    const cells = []
    for (let i=0; i<firstDay; i++) cells.push(<div key={`e${i}`} className="cp-day empty" />)
    for (let d=1; d<=daysInMonth; d++) {
      const date = new Date(calYear, calMonth, d)
      const isToday = date.toDateString() === todayMid.toDateString()
      const isPast = date < todayMid
      const isAvail = availSet.has(d) && !isPast && !isToday
      const isSel = selDay === d
      let cls = 'cp-day'
      if (isSel) cls += ' sel'
      else if (isPast) cls += ' past'
      else if (isToday) cls += ' today'
      else if (isAvail) cls += ' avail'
      else cls += ' off'
      cells.push(<div key={d} className={cls} onClick={isAvail&&!isSel?()=>pickDay(d):undefined}>{d}</div>)
    }
    return cells
  }

  // ════════════════════════════════════════════
  // LOADING / ERROR
  // ════════════════════════════════════════════

  const Splash = ({ msg }) => (
    <div style={{ minHeight:'100vh', background:'#F9F5EF', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontFamily:'Playfair Display,Georgia,serif', fontSize:24, color:'#B89030', marginBottom:12 }}>Organized.</div>
        <div style={{ fontSize:12, color:'#9A8E7C', letterSpacing:'0.14em', textTransform:'uppercase' }}>{msg}</div>
      </div>
    </div>
  )

  if (pageLoading)             return <Splash msg="Loading…" />
  if (pageError || !ws)        return <Splash msg="This page doesn't exist." />
  if (!ws.is_published)        return <Splash msg="Not available yet." />

  // ── Derived ──────────────────────────────────
  const socialLinks   = buildSocialLinks(ws)
  const firstName     = ws.name.split(' ')[0]
  const hasBook       = services.length > 0 && ws.accepts_bookings !== false
  const hasShop       = products.length > 0 && ws.accepts_orders !== false
  const hasLearn      = offerings.length > 0
  const tabs          = [...(hasBook?[{id:'book',label:'Book a Service'}]:[]), ...(hasShop?[{id:'shop',label:'Shop'}]:[]), ...(hasLearn?[{id:'learn',label:'Formations'}]:[])]

  const selDateDisplay = selDay ? `${MONTHS[calMonth]} ${selDay}, ${calYear}` : null
  const selDTDisplay   = selDateDisplay && selTime ? `${selDateDisplay} · ${formatTime12h(selTime)}` : selDateDisplay
  const needsDeposit   = selSvc && !selSvc.is_free && selSvc.price >= 100
  const isCurrentMonth = calYear===today.getFullYear() && calMonth===today.getMonth()
  const addons         = selSvc ? svcAddons(selSvc.name) : []

  // ════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════
  return (
    <>
      {/* ── NAV ───────────────────────────────── */}
      <nav className="cp-nav">
        <div className="cp-logo">Organized.<span>by {ws.name}</span></div>
        <div className="cp-nav-right">
          {tabs.map(t => (
            <button key={t.id} className={`cp-nav-tab ${activeTab===t.id?'active':''}`} onClick={() => { setActiveTab(t.id); document.getElementById('cp-tabs-anchor')?.scrollIntoView({behavior:'smooth'}) }}>{t.label}</button>
          ))}
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────── */}
      <section className="cp-hero">
        <div className="cp-hero-left">
          <div className="cp-avail-tag">
            <span className="cp-tag-dot" />
            {ws.accepts_bookings !== false ? 'Accepting bookings' : 'Viewing only'}
          </div>

          <h1 className="cp-hero-name">
            {ws.name.split(' ')[0]}
            {ws.name.split(' ').length > 1 && <><br/><em>{ws.name.split(' ').slice(1).join(' ')}</em></>}
          </h1>

          {(ws.tagline||ws.location) && <p className="cp-hero-title">{ws.tagline||ws.location}</p>}
          {ws.bio && <p className="cp-hero-bio">{ws.bio}</p>}

          {/* Stats bar — adapts to what exists */}
          <div className="cp-hero-stats">
            {services.length > 0 && <div className="cp-stat"><div className="cp-stat-n">{services.length}</div><div className="cp-stat-l">Services</div></div>}
            {products.length > 0 && <div className="cp-stat"><div className="cp-stat-n">{products.length}</div><div className="cp-stat-l">Products</div></div>}
            {offerings.length > 0 && <div className="cp-stat"><div className="cp-stat-n">{offerings.length}</div><div className="cp-stat-l">Formations</div></div>}
          </div>

          {socialLinks.length > 0 && (
            <div className="cp-socials">
              {socialLinks.map(({key,icon,label,href}) => (
                <a key={key} href={href} target="_blank" rel="noreferrer" className="cp-social" title={label} aria-label={label}>{icon}</a>
              ))}
            </div>
          )}

          {tabs.length > 0 && (
            <div className="cp-hero-cta">
              {hasBook && <button className="cp-btn-gold" onClick={() => { setActiveTab('book'); document.getElementById('cp-tabs-anchor')?.scrollIntoView({behavior:'smooth'}) }}>Book a Session</button>}
              {hasShop && <button className="cp-btn-ghost" onClick={() => { setActiveTab('shop'); document.getElementById('cp-tabs-anchor')?.scrollIntoView({behavior:'smooth'}) }}>Shop</button>}
              {hasLearn && !hasBook && !hasShop && <button className="cp-btn-gold" onClick={() => { setActiveTab('learn'); document.getElementById('cp-tabs-anchor')?.scrollIntoView({behavior:'smooth'}) }}>View Formations</button>}
            </div>
          )}

          {ws.location && ws.tagline && <div className="cp-hero-loc"><span style={{color:'var(--cp-gold)',marginRight:4}}>◉</span>{ws.location}</div>}
        </div>

        <div className="cp-hero-right">
          <div className="cp-hero-photo">
            {ws.cover_url
              ? <img src={ws.cover_url} alt={ws.name} className="cp-cover-img" />
              : <div className="cp-portrait-wrap">
                  <div className="cp-p-glow" /><div className="cp-p-head" />
                  <div className="cp-p-neck" /><div className="cp-p-body" />
                  <div className="cp-p-accent">· · ·</div>
                </div>
            }
          </div>
          <div className="cp-hero-overlay" />

          {availDays.length > 0 && (
            <div className="cp-fc cp-fc-1">
              <div className="cp-fc-lbl">Next Available</div>
              <div className="cp-fc-val">{MONTHS[calMonth]} {availDays[0]}</div>
            </div>
          )}
          {(hasShop||hasLearn) && (
            <div className="cp-fc cp-fc-2">
              <div className="cp-fc-lbl">Also Offers</div>
              <div className="cp-fc-val" style={{fontSize:14,lineHeight:1.5}}>
                {[hasShop&&'Products', hasLearn&&'Formations'].filter(Boolean).join(' · ')}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── TABS ──────────────────────────────── */}
      <div id="cp-tabs-anchor" className="cp-tabs-bar">
        {tabs.map(t => (
          <button key={t.id} className={`cp-tab-btn ${activeTab===t.id?'active':''}`} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          TAB: BOOK
      ══════════════════════════════════════════ */}
      {activeTab==='book' && hasBook && (
        <section id="cp-book-anchor" className="cp-section">
          <div className="cp-section-inner">
            <div className="cp-eyebrow">Booking</div>
            <h2 className="cp-heading">Reserve your <em>moment</em></h2>

            {step < 4 && (
              <>
                <div className="cp-progress">
                  {[1,2,3].map(n => (
                    <span key={n} style={{display:'contents'}}>
                      <div className={`cp-wp-step ${step===n?'active':''} ${step>n?'done':''}`}>
                        <div className="cp-wp-num">{step>n?'✓':n}</div>
                        <div className="cp-wp-lbl">{n===1?'Service':n===2?'Date & Time':'Your Info'}</div>
                      </div>
                      {n<3 && <div className={`cp-wp-line ${step>n?'done':''}`} />}
                    </span>
                  ))}
                </div>

                <div className="cp-wiz-layout">
                  {/* Summary */}
                  <div className="cp-summary">
                    <div className="cp-sum-title">Summary</div>
                    <div className="cp-sum-row"><div className="cp-sum-key">Stylist</div><div className="cp-sum-val">{ws.name}</div></div>
                    <div className="cp-sum-row"><div className="cp-sum-key">Service</div>{selSvc ? <><div className="cp-sum-val">{selSvc.name}</div>{selSvc.duration_min&&<div className="cp-sum-sub">{formatDuration(selSvc.duration_min)}</div>}</> : <div className="cp-sum-empty">—</div>}</div>
                    <div className="cp-sum-row"><div className="cp-sum-key">Date & Time</div>{selDTDisplay ? <div className="cp-sum-val">{selDTDisplay}</div> : <div className="cp-sum-empty">—</div>}</div>
                    <div className="cp-sum-row"><div className="cp-sum-key">Price</div>{selSvc ? <div className="cp-sum-val">{fmtSvcPrice(selSvc)}</div> : <div className="cp-sum-empty">—</div>}</div>
                    {needsDeposit && <div className="cp-deposit"><strong>$40 deposit</strong> required to secure. Applied to your total. Refundable with 24h+ notice.</div>}
                  </div>

                  {/* Steps */}
                  <div>
                    {/* STEP 1 */}
                    {step===1 && (
                      <div>
                        <p className="cp-step-note">Select the service you'd like to book.</p>
                        <div className="cp-s1-grid">
                          {services.map(s => (
                            <div key={s.id} className={`cp-s1-card ${selSvc?.id===s.id?'sel':''}`} onClick={() => pickSvc(s)}>
                              <div className="cp-s1-check">✓</div>
                              <div className="cp-s1-icon">{svcIcon(s.name)}</div>
                              <div className="cp-s1-name">{s.name}</div>
                              {s.duration_min && <div className="cp-s1-meta">{formatDuration(s.duration_min)}</div>}
                              <div className="cp-s1-price">{fmtSvcPrice(s)}</div>
                            </div>
                          ))}
                        </div>
                        {selSvc && addons.length > 0 && (
                          <div className="cp-addons">
                            <div className="cp-addons-lbl">Pair it with</div>
                            <div className="cp-addons-chips">
                              {addons.map(a => <div key={a} className={`cp-chip ${selAddons.includes(a)?'on':''}`} onClick={() => toggleAddon(a)}>{a}</div>)}
                            </div>
                          </div>
                        )}
                        <div className="cp-nav-row"><span/><button className="cp-btn-next" onClick={() => goStep(2)} disabled={!selSvc}>Next — Pick a Time &#8594;</button></div>
                      </div>
                    )}

                    {/* STEP 2 */}
                    {step===2 && (
                      <div>
                        <p className="cp-step-note">Highlighted dates have openings. Pick a date then a time.</p>
                        <div className="cp-cal-wrap">
                          <div className="cp-cal-head">
                            <div className="cp-cal-month">{MONTHS[calMonth]} {calYear}</div>
                            <div className="cp-cal-navs">
                              <button className="cp-cal-btn" onClick={() => changeMonth(-1)} disabled={isCurrentMonth}>&#8249;</button>
                              <button className="cp-cal-btn" onClick={() => changeMonth(1)}>&#8250;</button>
                            </div>
                          </div>
                          <div className="cp-cal-dnames">{['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=><div key={d} className="cp-dname">{d}</div>)}</div>
                          <div className="cp-cal-grid">{renderCalCells()}</div>
                        </div>
                        {selDay && (
                          <div className="cp-slots-wrap">
                            <div className="cp-slots-lbl">Available Times — {selDateDisplay}</div>
                            {loadSlots ? <div className="cp-slots-empty">Loading…</div>
                              : slots.length===0 ? <div className="cp-slots-empty">No availability for this date.</div>
                              : <div className="cp-slots-grid">{slots.map(sl => <div key={sl.raw} className={`cp-slot ${sl.booked?'booked':selTime===sl.raw?'sel':'avail'}`} onClick={() => !sl.booked && pickTime(sl)}>{sl.display}</div>)}</div>}
                          </div>
                        )}
                        <div className="cp-nav-row">
                          <button className="cp-btn-back" onClick={() => goStep(1)}>&#8592; Back</button>
                          <button className="cp-btn-next" onClick={() => goStep(3)} disabled={!selDay||!selTime}>Next — Your Info &#8594;</button>
                        </div>
                      </div>
                    )}

                    {/* STEP 3 */}
                    {step===3 && (
                      <div>
                        <p className="cp-step-note">Almost done. Confirmation sent to your inbox right away.</p>
                        <div className="cp-form-2col">
                          <div className="cp-fg"><label className="cp-fl">First Name *</label><input className={`cp-fi ${bkErrors.fname?'err':''}`} type="text" placeholder="Marie" value={bkForm.fname} onChange={e=>setBkForm(f=>({...f,fname:e.target.value}))} />{bkErrors.fname&&<span className="cp-ferr">{bkErrors.fname}</span>}</div>
                          <div className="cp-fg"><label className="cp-fl">Last Name *</label><input className={`cp-fi ${bkErrors.lname?'err':''}`} type="text" placeholder="Dupont" value={bkForm.lname} onChange={e=>setBkForm(f=>({...f,lname:e.target.value}))} />{bkErrors.lname&&<span className="cp-ferr">{bkErrors.lname}</span>}</div>
                        </div>
                        <div className="cp-fg"><label className="cp-fl">Email *</label><input className={`cp-fi ${bkErrors.email?'err':''}`} type="email" placeholder="marie@example.com" value={bkForm.email} onChange={e=>setBkForm(f=>({...f,email:e.target.value}))} />{bkErrors.email&&<span className="cp-ferr">{bkErrors.email}</span>}</div>
                        <div className="cp-fg"><label className="cp-fl">Phone *</label><input className={`cp-fi ${bkErrors.phone?'err':''}`} type="tel" placeholder="+1 (514) 000-0000" value={bkForm.phone} onChange={e=>setBkForm(f=>({...f,phone:e.target.value}))} />{bkErrors.phone&&<span className="cp-ferr">{bkErrors.phone}</span>}</div>
                        <div className="cp-fg"><label className="cp-fl">How did you find {firstName}?</label><select className="cp-fsel" value={bkForm.source} onChange={e=>setBkForm(f=>({...f,source:e.target.value}))}><option value="">Select one</option><option value="instagram">Instagram</option><option value="referral">Friend or Referral</option><option value="google">Google</option><option value="tiktok">TikTok</option><option value="other">Other</option></select></div>
                        <div className="cp-fg"><label className="cp-fl">Notes — optional</label><input className="cp-fi" type="text" placeholder="Allergies, goals, reference photos…" value={bkForm.notes} onChange={e=>setBkForm(f=>({...f,notes:e.target.value}))} /></div>
                        <div className="cp-policy">By confirming, you agree to {firstName}&apos;s <a href="#cp-faq">cancellation policy</a>. Free cancellation up to 24h before your appointment.{needsDeposit&&' $40 deposit required.'}</div>
                        <div className="cp-nav-row">
                          <button className="cp-btn-back" onClick={() => goStep(2)}>&#8592; Back</button>
                          <button className="cp-btn-next" onClick={submitBooking} disabled={bkSub}>{bkSub?'Confirming…':'Confirm Appointment →'}</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* BOOKING SUCCESS */}
            {step===4 && bkDone && (
              <div className="cp-success">
                <div className="cp-success-icon">✓</div>
                <h2 className="cp-success-title">You&apos;re booked.</h2>
                <p className="cp-success-sub">Confirmation sent to <strong style={{color:'var(--cp-tx)'}}>{bkDone.email}</strong>.<br/>{firstName} will see you soon.</p>
                <div className="cp-success-card">
                  <div className="cp-sc-row"><span className="cp-sc-k">Stylist</span><span className="cp-sc-v">{ws.name}</span></div>
                  <div className="cp-sc-row"><span className="cp-sc-k">Service</span><span className="cp-sc-v">{bkDone.serviceName}</span></div>
                  {bkDone.addons.length>0&&<div className="cp-sc-row"><span className="cp-sc-k">Add-ons</span><span className="cp-sc-v">{bkDone.addons.join(', ')}</span></div>}
                  <div className="cp-sc-row"><span className="cp-sc-k">Date</span><span className="cp-sc-v">{bkDone.displayDate}</span></div>
                  <div className="cp-sc-row"><span className="cp-sc-k">Time</span><span className="cp-sc-v">{bkDone.displayTime}</span></div>
                  <div className="cp-sc-row"><span className="cp-sc-k">Duration</span><span className="cp-sc-v">{bkDone.duration}</span></div>
                  {bkDone.needsDeposit&&<div className="cp-sc-row"><span className="cp-sc-k">Deposit</span><span className="cp-sc-v" style={{color:'var(--cp-gold)'}}>$40 — pending</span></div>}
                </div>
                <button className="cp-btn-gold" onClick={() => window.location.reload()}>Book Another</button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          TAB: SHOP
      ══════════════════════════════════════════ */}
      {activeTab==='shop' && hasShop && (
        <section className="cp-section cp-section-alt">
          <div className="cp-section-inner">
            <div className="cp-eyebrow">Shop</div>
            <h2 className="cp-heading">Products by <em>{firstName}</em></h2>
            <div className="cp-prod-grid">
              {products.map(p => {
                const imgSrc = p.image_url || (p.images&&p.images[0]) || null
                return (
                  <div key={p.id} className="cp-prod-card">
                    <div className="cp-prod-img">
                      {imgSrc ? <img src={imgSrc} alt={p.name} /> : <div className="cp-prod-placeholder">◈</div>}
                      {p.stock <= 3 && <div className="cp-prod-badge">Only {p.stock} left</div>}
                    </div>
                    <div className="cp-prod-body">
                      <div className="cp-prod-name">{p.name}</div>
                      {p.description && <div className="cp-prod-desc">{p.description}</div>}
                      <div className="cp-prod-footer">
                        <div className="cp-prod-price">{fmtPrice(p.price, p.currency||ws.currency)}</div>
                        <button className="cp-btn-gold" onClick={() => openShopModal(p)}>Order</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          TAB: LEARN
      ══════════════════════════════════════════ */}
      {activeTab==='learn' && hasLearn && (
        <section className="cp-section">
          <div className="cp-section-inner">
            <div className="cp-eyebrow">Formations</div>
            <h2 className="cp-heading">Learn from <em>{firstName}</em></h2>
            <div className="cp-off-grid">
              {offerings.map(o => (
                <div key={o.id} className="cp-off-card">
                  <div className="cp-off-top">
                    <div className="cp-off-icon">◈</div>
                    {o.format && <div className="cp-off-format">{o.format}</div>}
                  </div>
                  <div className="cp-off-title">{o.title}</div>
                  {o.description && <div className="cp-off-desc">{o.description}</div>}
                  <div className="cp-off-meta">
                    {o.duration_label && <span>&#9201; {o.duration_label}</span>}
                    {o.max_students && <span>&#128101; Max {o.max_students} students</span>}
                  </div>
                  <div className="cp-off-footer">
                    <div className="cp-off-price">{fmtPrice(o.price, o.currency||ws.currency)}</div>
                    <button className="cp-btn-gold" onClick={() => openLearnModal(o)}>Enroll</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ───────────────────────────────── */}
      <section id="cp-faq" className="cp-section cp-section-alt">
        <div className="cp-section-inner cp-faq-inner">
          <div className="cp-eyebrow">Know Before You Go</div>
          <h2 className="cp-heading">Good <em>questions</em></h2>
          <div className="cp-faq-grid">
            {[
              {q:"What's the cancellation policy?", a:"Free cancellation up to 24 hours before your appointment. Within 24 hours, the deposit is forfeited."},
              {q:"Do you require a deposit?",       a:"Services over $100 require a $40 deposit at booking. It goes toward your total and is fully refundable with 24+ hours notice."},
              {q:"How should I arrive?",             a:"Clean, dry hair unless specified. Bring inspiration photos — the more reference, the better the result."},
              {q:"Do you work with all textures?",  a:"Yes. Every service adapts to your hair type, from fine straight to tight coils. Unsure? Book a free Consultation first."},
            ].map(item => (
              <div key={item.q} className="cp-faq-item">
                <div className="cp-faq-q">{item.q}</div>
                <div className="cp-faq-a">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────── */}
      <footer className="cp-footer">
        <div className="cp-footer-logo">Organized.</div>
        <div className="cp-footer-socials">
          {socialLinks.map(({key,icon,label,href}) => (
            <a key={key} href={href} target="_blank" rel="noreferrer" className="cp-footer-social" title={label}>{icon}</a>
          ))}
        </div>
        <div className="cp-footer-right">Powered by <a href="https://beorganized.io" target="_blank" rel="noreferrer">beorganized.io</a></div>
      </footer>

      {/* ══════════════════════════════════════════
          SHOP MODAL
      ══════════════════════════════════════════ */}
      {shopModal && (
        <div className="cp-overlay" onClick={e => { if (e.target.classList.contains('cp-overlay')) { setShopModal(null); setShopDone(null) } }}>
          <div className="cp-modal">
            {!shopDone ? (
              <>
                <div className="cp-modal-close" onClick={() => { setShopModal(null); setShopDone(null) }}>✕</div>
                <div className="cp-modal-title">Order — {shopModal.name}</div>
                <div className="cp-modal-price">{fmtPrice(shopModal.price, shopModal.currency||ws.currency)}</div>
                <div className="cp-form-2col">
                  <div className="cp-fg"><label className="cp-fl">First Name *</label><input className="cp-fi" type="text" placeholder="Marie" value={shopForm.fname} onChange={e=>setShopForm(f=>({...f,fname:e.target.value}))} /></div>
                  <div className="cp-fg"><label className="cp-fl">Last Name *</label><input className="cp-fi" type="text" placeholder="Dupont" value={shopForm.lname} onChange={e=>setShopForm(f=>({...f,lname:e.target.value}))} /></div>
                </div>
                <div className="cp-fg"><label className="cp-fl">Email *</label><input className="cp-fi" type="email" placeholder="marie@example.com" value={shopForm.email} onChange={e=>setShopForm(f=>({...f,email:e.target.value}))} /></div>
                <div className="cp-fg"><label className="cp-fl">Phone *</label><input className="cp-fi" type="tel" placeholder="+1 (514) 000-0000" value={shopForm.phone} onChange={e=>setShopForm(f=>({...f,phone:e.target.value}))} /></div>
                <div className="cp-fg"><label className="cp-fl">Quantity</label><select className="cp-fsel" value={shopForm.qty} onChange={e=>setShopForm(f=>({...f,qty:parseInt(e.target.value)}))}>{[1,2,3,4,5].filter(q=>q<=shopModal.stock).map(q=><option key={q} value={q}>{q}</option>)}</select></div>
                <button className="cp-btn-gold cp-btn-full" onClick={submitOrder} disabled={shopSub}>{shopSub?'Placing order…':'Place Order →'}</button>
                <p className="cp-modal-note">{firstName} will confirm your order and contact you for payment and delivery details.</p>
              </>
            ) : (
              <div className="cp-success" style={{padding:'24px 0 8px'}}>
                <div className="cp-success-icon">✓</div>
                <h3 className="cp-success-title" style={{fontSize:24}}>Order placed!</h3>
                <p className="cp-success-sub">{firstName} received your order for <strong>{shopDone.productName}</strong>.<br/>Confirmation sent to {shopDone.email}.</p>
                <button className="cp-btn-ghost" onClick={() => { setShopModal(null); setShopDone(null) }}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          ENROLL MODAL
      ══════════════════════════════════════════ */}
      {learnModal && (
        <div className="cp-overlay" onClick={e => { if (e.target.classList.contains('cp-overlay')) { setLearnModal(null); setLearnDone(null) } }}>
          <div className="cp-modal">
            {!learnDone ? (
              <>
                <div className="cp-modal-close" onClick={() => { setLearnModal(null); setLearnDone(null) }}>✕</div>
                <div className="cp-modal-title">Enroll — {learnModal.title}</div>
                {learnModal.price > 0 && <div className="cp-modal-price">{fmtPrice(learnModal.price, learnModal.currency||ws.currency)}</div>}
                {learnModal.description && <p className="cp-modal-desc">{learnModal.description}</p>}
                <div className="cp-form-2col">
                  <div className="cp-fg"><label className="cp-fl">First Name *</label><input className="cp-fi" type="text" placeholder="Marie" value={learnForm.fname} onChange={e=>setLearnForm(f=>({...f,fname:e.target.value}))} /></div>
                  <div className="cp-fg"><label className="cp-fl">Last Name *</label><input className="cp-fi" type="text" placeholder="Dupont" value={learnForm.lname} onChange={e=>setLearnForm(f=>({...f,lname:e.target.value}))} /></div>
                </div>
                <div className="cp-fg"><label className="cp-fl">Email *</label><input className="cp-fi" type="email" placeholder="marie@example.com" value={learnForm.email} onChange={e=>setLearnForm(f=>({...f,email:e.target.value}))} /></div>
                <div className="cp-fg"><label className="cp-fl">Phone *</label><input className="cp-fi" type="tel" placeholder="+1 (514) 000-0000" value={learnForm.phone} onChange={e=>setLearnForm(f=>({...f,phone:e.target.value}))} /></div>
                <button className="cp-btn-gold cp-btn-full" onClick={submitEnrollment} disabled={learnSub}>{learnSub?'Enrolling…':'Confirm Enrollment →'}</button>
                <p className="cp-modal-note">{firstName} will contact you with payment and session details.</p>
              </>
            ) : (
              <div className="cp-success" style={{padding:'24px 0 8px'}}>
                <div className="cp-success-icon">✓</div>
                <h3 className="cp-success-title" style={{fontSize:24}}>Enrolled!</h3>
                <p className="cp-success-sub">You&apos;re registered for <strong>{learnDone.title}</strong>.<br/>Confirmation sent to {learnDone.email}.</p>
                <button className="cp-btn-ghost" onClick={() => { setLearnModal(null); setLearnDone(null) }}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// ─── STYLES — Warm Ivory · Premium ───────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --cp-bg:#F9F5EF; --cp-bg2:#F1EAE0; --cp-card:#FFFFFF;
  --cp-gold:#B89030; --cp-gold-lt:#C9A84C;
  --cp-gold-dim:rgba(184,144,48,0.09); --cp-gold-bdr:rgba(184,144,48,0.28);
  --cp-tx:#1C1814; --cp-tx-m:#9A8E7C; --cp-tx-s:#5A5040;
  --cp-bdr:rgba(30,18,8,0.08); --cp-bdr-m:rgba(30,18,8,0.14);
  --cp-sh-sm:0 1px 8px rgba(30,18,8,0.06); --cp-sh:0 2px 20px rgba(30,18,8,0.08);
  --cp-dk:#1A1410; --cp-dk2:#221A10; --cp-err:#b94040; --cp-ok:#3a9e6a;
}
html{scroll-behavior:smooth}
body{background:var(--cp-bg);color:var(--cp-tx);font-family:'DM Sans',sans-serif;overflow-x:hidden}
body::before{content:'';position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E");pointer-events:none;z-index:9999;opacity:.6;mix-blend-mode:multiply}

/* NAV */
.cp-nav{position:fixed;top:0;left:0;right:0;z-index:500;padding:14px 40px;display:flex;align-items:center;justify-content:space-between;background:rgba(249,245,239,0.95);backdrop-filter:blur(16px);border-bottom:1px solid var(--cp-bdr)}
.cp-logo{font-family:'Playfair Display',serif;font-size:17px;letter-spacing:.04em;color:var(--cp-gold);white-space:nowrap}
.cp-logo span{color:var(--cp-tx-m);font-size:11px;margin-left:7px;font-family:'DM Sans',sans-serif;font-weight:300}
.cp-nav-right{display:flex;align-items:center;gap:4px;overflow-x:auto}
.cp-nav-tab{background:transparent;border:none;color:var(--cp-tx-m);font-family:'DM Sans',sans-serif;font-size:12px;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;padding:8px 16px;border-radius:2px;transition:all .2s}
.cp-nav-tab:hover{color:var(--cp-gold)}
.cp-nav-tab.active{background:var(--cp-gold);color:#FAF7F0}

/* BUTTONS */
.cp-btn-gold{background:var(--cp-gold);color:#FAF7F0;border:none;padding:11px 24px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;letter-spacing:.07em;cursor:pointer;border-radius:2px;text-transform:uppercase;transition:all .25s}
.cp-btn-gold:hover{background:var(--cp-gold-lt);transform:translateY(-1px);box-shadow:0 6px 20px rgba(184,144,48,.22)}
.cp-btn-gold:disabled{background:var(--cp-bdr-m);color:var(--cp-tx-m);cursor:not-allowed;transform:none;box-shadow:none}
.cp-btn-ghost{background:transparent;color:var(--cp-tx-s);border:1px solid var(--cp-bdr-m);padding:11px 20px;font-family:'DM Sans',sans-serif;font-size:12px;letter-spacing:.07em;cursor:pointer;border-radius:2px;text-transform:uppercase;transition:all .25s}
.cp-btn-ghost:hover{border-color:var(--cp-gold-bdr);color:var(--cp-gold)}
.cp-btn-full{width:100%;margin-top:4px;justify-content:center;display:block}

/* HERO */
.cp-hero{min-height:100vh;display:grid;grid-template-columns:54% 46%;position:relative;overflow:hidden}
.cp-hero-left{display:flex;flex-direction:column;justify-content:center;padding:130px 64px 80px;position:relative;z-index:2;background:var(--cp-bg)}
.cp-hero-left::after{content:'';position:absolute;right:0;top:8%;bottom:8%;width:1px;background:linear-gradient(to bottom,transparent,var(--cp-bdr-m),transparent)}
.cp-avail-tag{display:inline-flex;align-items:center;gap:8px;background:var(--cp-gold-dim);border:1px solid var(--cp-gold-bdr);border-radius:100px;padding:6px 16px 6px 10px;font-size:11px;color:var(--cp-gold);letter-spacing:.12em;text-transform:uppercase;margin-bottom:32px;width:fit-content;animation:cpFadeUp .7s ease both}
.cp-tag-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--cp-gold);animation:cpPulse 2s infinite;flex-shrink:0}
@keyframes cpPulse{0%,100%{opacity:1}50%{opacity:.2}}
@keyframes cpFadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes cpScaleIn{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}
.cp-hero-name{font-family:'Playfair Display',serif;font-size:clamp(48px,5.5vw,72px);font-weight:500;line-height:1;margin-bottom:12px;color:var(--cp-tx);animation:cpFadeUp .7s .08s ease both}
.cp-hero-name em{font-style:italic;color:var(--cp-gold)}
.cp-hero-title{font-size:12px;color:var(--cp-tx-m);letter-spacing:.2em;text-transform:uppercase;margin-bottom:24px;animation:cpFadeUp .7s .16s ease both}
.cp-hero-bio{font-size:15px;line-height:1.85;color:var(--cp-tx-s);max-width:380px;margin-bottom:28px;font-weight:300;animation:cpFadeUp .7s .22s ease both}
.cp-hero-stats{display:flex;gap:36px;margin-bottom:28px;animation:cpFadeUp .7s .28s ease both}
.cp-stat{display:flex;flex-direction:column;gap:3px}
.cp-stat-n{font-family:'Playfair Display',serif;font-size:28px;color:var(--cp-gold);font-weight:500;line-height:1}
.cp-stat-l{font-size:10px;color:var(--cp-tx-m);letter-spacing:.12em;text-transform:uppercase}
.cp-socials{display:flex;gap:10px;margin-bottom:28px;animation:cpFadeUp .7s .33s ease both}
.cp-social{width:34px;height:34px;border-radius:50%;border:1px solid var(--cp-bdr-m);display:flex;align-items:center;justify-content:center;color:var(--cp-tx-m);text-decoration:none;transition:all .22s}
.cp-social:hover{border-color:var(--cp-gold);color:var(--cp-gold);background:var(--cp-gold-dim);transform:translateY(-2px)}
.cp-hero-cta{display:flex;gap:10px;animation:cpFadeUp .7s .38s ease both}
.cp-hero-loc{font-size:12px;color:var(--cp-tx-m);margin-top:24px;animation:cpFadeUp .7s .43s ease both}
.cp-hero-right{position:relative;overflow:hidden}
.cp-hero-photo{position:absolute;inset:0;background:linear-gradient(150deg,var(--cp-dk2),var(--cp-dk),#0D0A06);display:flex;align-items:center;justify-content:center}
.cp-cover-img{width:100%;height:100%;object-fit:cover;filter:brightness(.72) saturate(.8)}
.cp-portrait-wrap{position:relative;width:260px;height:400px}
.cp-p-glow{position:absolute;top:-30px;left:50%;transform:translateX(-50%);width:200px;height:200px;background:radial-gradient(circle,rgba(201,168,76,.07) 0%,transparent 70%);border-radius:50%}
.cp-p-head{position:absolute;top:0;left:50%;transform:translateX(-50%);width:100px;height:110px;background:linear-gradient(160deg,#2e2416,#1a1208);border-radius:50%;border:1px solid rgba(201,168,76,.09)}
.cp-p-neck{position:absolute;bottom:290px;left:50%;transform:translateX(-50%);width:38px;height:52px;background:linear-gradient(160deg,#2e2416,#1a1208)}
.cp-p-body{position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:180px;height:300px;background:linear-gradient(160deg,#261e0e,#130e06);border-radius:90px 90px 60px 60px;border:1px solid rgba(201,168,76,.07)}
.cp-p-accent{position:absolute;top:48%;left:50%;transform:translate(-50%,-50%);font-size:16px;color:rgba(201,168,76,.13);letter-spacing:12px}
.cp-hero-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,transparent 50%,var(--cp-dk) 100%)}
.cp-fc{position:absolute;background:rgba(20,14,8,.92);border:1px solid rgba(201,168,76,.16);border-radius:3px;padding:14px 18px;backdrop-filter:blur(20px)}
.cp-fc-1{bottom:52px;left:-24px;min-width:170px}
.cp-fc-2{top:38%;right:24px}
.cp-fc-lbl{font-size:9px;color:rgba(201,168,76,.6);letter-spacing:.18em;text-transform:uppercase;margin-bottom:4px}
.cp-fc-val{font-family:'Playfair Display',serif;font-size:17px;color:#E8C97A}

/* TABS BAR */
.cp-tabs-bar{display:flex;background:var(--cp-card);border-bottom:1px solid var(--cp-bdr);border-top:1px solid var(--cp-bdr);position:sticky;top:53px;z-index:400;box-shadow:var(--cp-sh-sm)}
.cp-tab-btn{flex:1;background:transparent;border:none;color:var(--cp-tx-m);font-family:'DM Sans',sans-serif;font-size:12px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;padding:16px 12px;border-bottom:2px solid transparent;transition:all .2s}
.cp-tab-btn:hover{color:var(--cp-tx-s)}
.cp-tab-btn.active{color:var(--cp-gold);border-bottom-color:var(--cp-gold);background:var(--cp-gold-dim)}

/* SECTIONS */
.cp-section{padding:80px 64px;background:var(--cp-bg)}
.cp-section-alt{background:var(--cp-bg2)}
.cp-section-inner{max-width:1100px;margin:0 auto}
.cp-eyebrow{font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:var(--cp-gold);margin-bottom:12px}
.cp-heading{font-family:'Playfair Display',serif;font-size:clamp(28px,3.2vw,40px);font-weight:500;line-height:1.15;color:var(--cp-tx);margin-bottom:48px}
.cp-heading em{font-style:italic;color:var(--cp-gold)}

/* BOOKING */
.cp-progress{display:flex;align-items:center;margin-bottom:48px}
.cp-wp-step{display:flex;align-items:center;gap:10px;flex-shrink:0}
.cp-wp-num{width:28px;height:28px;border-radius:50%;border:1px solid var(--cp-bdr-m);background:var(--cp-card);display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--cp-tx-m);transition:all .3s;font-weight:500;box-shadow:var(--cp-sh-sm)}
.cp-wp-lbl{font-size:11px;color:var(--cp-tx-m);letter-spacing:.05em;white-space:nowrap;transition:color .3s}
.cp-wp-step.active .cp-wp-num{border-color:var(--cp-gold);background:var(--cp-gold-dim);color:var(--cp-gold)}
.cp-wp-step.active .cp-wp-lbl{color:var(--cp-tx-s)}
.cp-wp-step.done .cp-wp-num{background:var(--cp-gold);border-color:var(--cp-gold);color:#FAF7F0;font-weight:700}
.cp-wp-step.done .cp-wp-lbl{color:var(--cp-gold)}
.cp-wp-line{flex:1;height:1px;background:var(--cp-bdr-m);margin:0 14px;transition:background .4s}
.cp-wp-line.done{background:var(--cp-gold)}
.cp-wiz-layout{display:grid;grid-template-columns:240px 1fr;gap:48px;align-items:start}
.cp-summary{position:sticky;top:120px;background:var(--cp-card);border:1px solid var(--cp-bdr);border-radius:3px;padding:22px;box-shadow:var(--cp-sh)}
.cp-sum-title{font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:var(--cp-tx-m);margin-bottom:16px}
.cp-sum-row{margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid var(--cp-bdr)}
.cp-sum-row:last-of-type{border-bottom:none;margin-bottom:0;padding-bottom:0}
.cp-sum-key{font-size:9px;color:var(--cp-tx-m);letter-spacing:.14em;text-transform:uppercase;margin-bottom:4px}
.cp-sum-val{font-family:'Playfair Display',serif;font-size:14px;color:var(--cp-tx);line-height:1.3}
.cp-sum-sub{font-size:11px;color:var(--cp-tx-m);margin-top:2px}
.cp-sum-empty{font-size:12px;color:rgba(30,18,8,.2)}
.cp-deposit{margin-top:14px;padding:11px 13px;background:var(--cp-gold-dim);border:1px solid var(--cp-gold-bdr);border-radius:2px;font-size:11px;color:var(--cp-tx-s);line-height:1.65}
.cp-deposit strong{color:var(--cp-gold)}
.cp-step-note{font-size:13px;color:var(--cp-tx-m);font-weight:300;margin-bottom:22px;line-height:1.6}
.cp-s1-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.cp-s1-card{background:var(--cp-card);border:1px solid var(--cp-bdr);border-radius:2px;padding:18px;cursor:pointer;transition:all .2s;position:relative;box-shadow:var(--cp-sh-sm)}
.cp-s1-card:hover{border-color:var(--cp-gold-bdr);box-shadow:var(--cp-sh)}
.cp-s1-card.sel{border-color:var(--cp-gold);box-shadow:0 0 0 2px rgba(184,144,48,.14),var(--cp-sh)}
.cp-s1-check{position:absolute;top:10px;right:10px;width:15px;height:15px;border-radius:50%;border:1px solid var(--cp-bdr-m);display:flex;align-items:center;justify-content:center;font-size:9px;transition:all .2s;color:transparent}
.cp-s1-card.sel .cp-s1-check{background:var(--cp-gold);border-color:var(--cp-gold);color:#FAF7F0;font-weight:700}
.cp-s1-icon{font-size:17px;color:var(--cp-tx-m);margin-bottom:9px}
.cp-s1-card.sel .cp-s1-icon{color:var(--cp-gold)}
.cp-s1-name{font-family:'Playfair Display',serif;font-size:14px;margin-bottom:4px;color:var(--cp-tx)}
.cp-s1-meta{font-size:11px;color:var(--cp-tx-m)}
.cp-s1-price{margin-top:9px;font-family:'Playfair Display',serif;font-size:15px;color:var(--cp-gold)}
.cp-addons{margin-top:22px;padding-top:20px;border-top:1px solid var(--cp-bdr)}
.cp-addons-lbl{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--cp-tx-m);margin-bottom:11px}
.cp-addons-chips{display:flex;flex-wrap:wrap;gap:7px}
.cp-chip{padding:6px 13px;border:1px solid var(--cp-bdr-m);border-radius:100px;font-size:12px;color:var(--cp-tx-s);cursor:pointer;transition:all .2s;background:var(--cp-card)}
.cp-chip:hover{border-color:var(--cp-gold-bdr);color:var(--cp-gold)}
.cp-chip.on{border-color:var(--cp-gold);background:var(--cp-gold-dim);color:var(--cp-gold)}
.cp-cal-wrap{background:var(--cp-card);border:1px solid var(--cp-bdr);border-radius:3px;overflow:hidden;box-shadow:var(--cp-sh-sm)}
.cp-cal-head{padding:14px 20px;border-bottom:1px solid var(--cp-bdr);display:flex;align-items:center;justify-content:space-between}
.cp-cal-month{font-family:'Playfair Display',serif;font-size:15px;color:var(--cp-tx)}
.cp-cal-navs{display:flex;gap:5px}
.cp-cal-btn{width:28px;height:28px;border:1px solid var(--cp-bdr-m);background:transparent;color:var(--cp-tx-m);cursor:pointer;border-radius:2px;font-size:13px;transition:all .2s}
.cp-cal-btn:hover{border-color:var(--cp-gold-bdr);color:var(--cp-gold);background:var(--cp-gold-dim)}
.cp-cal-btn:disabled{opacity:.3;cursor:default;pointer-events:none}
.cp-cal-dnames{display:grid;grid-template-columns:repeat(7,1fr);padding:9px 18px 3px}
.cp-dname{text-align:center;font-size:9px;color:var(--cp-tx-m);letter-spacing:.12em;text-transform:uppercase}
.cp-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);padding:3px 18px 18px;gap:2px}
.cp-day{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:12px;border-radius:2px;cursor:pointer;transition:all .15s;color:var(--cp-tx-m);position:relative;user-select:none}
.cp-day.avail{color:var(--cp-tx);font-weight:500;cursor:pointer}
.cp-day.avail::after{content:'';position:absolute;bottom:2px;left:50%;transform:translateX(-50%);width:3px;height:3px;border-radius:50%;background:var(--cp-gold)}
.cp-day.avail:hover{background:var(--cp-gold-dim);color:var(--cp-gold)}
.cp-day.today{border:1px solid var(--cp-gold-bdr);color:var(--cp-gold)}
.cp-day.sel{background:var(--cp-gold)!important;color:#FAF7F0!important;font-weight:600}
.cp-day.sel::after{display:none}
.cp-day.past,.cp-day.off,.cp-day.empty{color:rgba(30,18,8,.2);cursor:default}
.cp-slots-wrap{margin-top:16px}
.cp-slots-lbl{font-size:10px;color:var(--cp-tx-m);letter-spacing:.14em;text-transform:uppercase;margin-bottom:9px}
.cp-slots-empty{font-size:13px;color:var(--cp-tx-m);padding:18px 0;font-style:italic}
.cp-slots-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:5px}
.cp-slot{padding:8px 5px;text-align:center;border:1px solid var(--cp-bdr);background:var(--cp-card);color:var(--cp-tx-m);font-size:12px;cursor:pointer;border-radius:2px;transition:all .15s}
.cp-slot.avail{color:var(--cp-tx-s)}
.cp-slot.avail:hover{border-color:var(--cp-gold-bdr);color:var(--cp-gold);background:var(--cp-gold-dim)}
.cp-slot.sel{border-color:var(--cp-gold);background:var(--cp-gold-dim);color:var(--cp-gold);font-weight:500}
.cp-slot.booked{color:rgba(30,18,8,.2);cursor:not-allowed;border-color:transparent;background:var(--cp-bg2)}
.cp-form-2col{display:grid;grid-template-columns:1fr 1fr;gap:11px}
.cp-fg{display:flex;flex-direction:column;gap:5px;margin-bottom:12px}
.cp-fl{font-size:10px;color:var(--cp-tx-m);letter-spacing:.12em;text-transform:uppercase}
.cp-fi,.cp-fsel{background:var(--cp-card);border:1px solid var(--cp-bdr-m);color:var(--cp-tx);padding:11px 14px;font-family:'DM Sans',sans-serif;font-size:14px;border-radius:2px;outline:none;transition:border-color .2s,box-shadow .2s;width:100%}
.cp-fi:focus,.cp-fsel:focus{border-color:var(--cp-gold-bdr);box-shadow:0 0 0 3px rgba(184,144,48,.07)}
.cp-fi.err{border-color:var(--cp-err)}
.cp-fi::placeholder{color:rgba(30,18,8,.2)}
.cp-fsel{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%239A8E7C' d='M5 7L1 2h8z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 13px center;background-color:var(--cp-card);cursor:pointer}
.cp-ferr{font-size:11px;color:var(--cp-err)}
.cp-policy{padding:12px 14px;background:var(--cp-gold-dim);border:1px solid var(--cp-gold-bdr);border-radius:2px;font-size:11px;color:var(--cp-tx-s);line-height:1.65;margin-bottom:4px}
.cp-policy a{color:var(--cp-gold);text-decoration:none;font-weight:500}
.cp-nav-row{display:flex;justify-content:space-between;align-items:center;margin-top:24px;padding-top:20px;border-top:1px solid var(--cp-bdr)}
.cp-btn-back{background:transparent;color:var(--cp-tx-m);border:1px solid var(--cp-bdr-m);padding:10px 20px;font-family:'DM Sans',sans-serif;font-size:12px;letter-spacing:.06em;cursor:pointer;border-radius:2px;transition:all .2s;text-transform:uppercase}
.cp-btn-back:hover{color:var(--cp-tx-s)}
.cp-btn-next{background:var(--cp-gold);color:#FAF7F0;border:none;padding:12px 28px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;letter-spacing:.06em;cursor:pointer;border-radius:2px;transition:all .25s}
.cp-btn-next:hover{background:var(--cp-gold-lt);transform:translateY(-1px);box-shadow:0 8px 24px rgba(184,144,48,.2)}
.cp-btn-next:disabled{background:var(--cp-bdr);color:var(--cp-tx-m);cursor:not-allowed;transform:none;box-shadow:none}

/* SUCCESS */
.cp-success{text-align:center;padding:56px 32px 40px;animation:cpFadeUp .5s ease both}
.cp-success-icon{width:64px;height:64px;border-radius:50%;background:rgba(58,158,106,.08);border:1px solid rgba(58,158,106,.22);display:flex;align-items:center;justify-content:center;margin:0 auto 24px;font-size:24px;color:var(--cp-ok);animation:cpScaleIn .4s .1s ease both}
.cp-success-title{font-family:'Playfair Display',serif;font-size:30px;margin-bottom:10px;color:var(--cp-tx)}
.cp-success-sub{font-size:13px;color:var(--cp-tx-s);font-weight:300;line-height:1.7;margin-bottom:32px}
.cp-success-card{background:var(--cp-card);border:1px solid var(--cp-bdr);border-radius:3px;padding:20px 28px;max-width:380px;margin:0 auto 28px;text-align:left;box-shadow:var(--cp-sh)}
.cp-sc-row{display:flex;justify-content:space-between;align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--cp-bdr);font-size:13px;gap:14px}
.cp-sc-row:last-child{border-bottom:none}
.cp-sc-k{color:var(--cp-tx-m);flex-shrink:0}
.cp-sc-v{color:var(--cp-tx-s);font-weight:500;text-align:right}

/* SHOP */
.cp-prod-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:0}
.cp-prod-card{background:var(--cp-card);border:1px solid var(--cp-bdr);border-radius:3px;overflow:hidden;box-shadow:var(--cp-sh-sm);transition:box-shadow .25s,transform .25s}
.cp-prod-card:hover{box-shadow:var(--cp-sh);transform:translateY(-2px)}
.cp-prod-img{position:relative;aspect-ratio:1;background:var(--cp-bg2);display:flex;align-items:center;justify-content:center;overflow:hidden}
.cp-prod-img img{width:100%;height:100%;object-fit:cover}
.cp-prod-placeholder{font-size:48px;color:var(--cp-gold-bdr)}
.cp-prod-badge{position:absolute;top:10px;right:10px;background:var(--cp-gold);color:#FAF7F0;font-size:10px;letter-spacing:.08em;padding:4px 10px;border-radius:100px;text-transform:uppercase}
.cp-prod-body{padding:20px}
.cp-prod-name{font-family:'Playfair Display',serif;font-size:17px;margin-bottom:6px;color:var(--cp-tx)}
.cp-prod-desc{font-size:12px;color:var(--cp-tx-m);line-height:1.6;margin-bottom:14px;font-weight:300}
.cp-prod-footer{display:flex;align-items:center;justify-content:space-between}
.cp-prod-price{font-family:'Playfair Display',serif;font-size:20px;color:var(--cp-gold)}

/* LEARN */
.cp-off-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
.cp-off-card{background:var(--cp-card);border:1px solid var(--cp-bdr);border-radius:3px;padding:28px;box-shadow:var(--cp-sh-sm);transition:box-shadow .25s,transform .25s}
.cp-off-card:hover{box-shadow:var(--cp-sh);transform:translateY(-2px)}
.cp-off-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.cp-off-icon{width:36px;height:36px;border:1px solid var(--cp-gold-bdr);border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:15px;color:var(--cp-gold);background:var(--cp-gold-dim)}
.cp-off-format{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--cp-tx-m);border:1px solid var(--cp-bdr-m);padding:4px 10px;border-radius:100px}
.cp-off-title{font-family:'Playfair Display',serif;font-size:19px;margin-bottom:8px;color:var(--cp-tx)}
.cp-off-desc{font-size:13px;color:var(--cp-tx-m);line-height:1.6;margin-bottom:14px;font-weight:300}
.cp-off-meta{display:flex;gap:16px;font-size:11px;color:var(--cp-tx-m);margin-bottom:18px}
.cp-off-footer{display:flex;align-items:center;justify-content:space-between}
.cp-off-price{font-family:'Playfair Display',serif;font-size:22px;color:var(--cp-gold)}

/* FAQ */
.cp-faq-inner{max-width:900px}
.cp-faq-grid{display:grid;grid-template-columns:1fr 1fr;gap:36px 64px;margin-top:48px}
.cp-faq-q{font-family:'Playfair Display',serif;font-size:16px;margin-bottom:9px;color:var(--cp-tx)}
.cp-faq-a{font-size:13px;color:var(--cp-tx-m);line-height:1.75;font-weight:300}

/* FOOTER */
.cp-footer{padding:28px 64px;border-top:1px solid var(--cp-bdr);background:var(--cp-bg2);display:flex;align-items:center;justify-content:space-between;gap:20px}
.cp-footer-logo{font-family:'Playfair Display',serif;font-size:16px;color:var(--cp-gold)}
.cp-footer-socials{display:flex;gap:7px}
.cp-footer-social{width:30px;height:30px;border-radius:50%;border:1px solid var(--cp-bdr-m);display:flex;align-items:center;justify-content:center;color:var(--cp-tx-m);text-decoration:none;transition:all .2s}
.cp-footer-social:hover{border-color:var(--cp-gold-bdr);color:var(--cp-gold);background:var(--cp-gold-dim)}
.cp-footer-right{font-size:11px;color:var(--cp-tx-m)}
.cp-footer-right a{color:var(--cp-gold);text-decoration:none;font-weight:500}

/* MODALS */
.cp-overlay{position:fixed;inset:0;background:rgba(28,24,20,.5);z-index:800;display:flex;align-items:flex-end;justify-content:center;backdrop-filter:blur(4px);animation:cpFadeUp .2s ease}
.cp-modal{background:var(--cp-card);border-radius:12px 12px 0 0;padding:28px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;position:relative;animation:cpFadeUp .3s ease}
.cp-modal-close{position:absolute;top:18px;right:18px;width:28px;height:28px;border-radius:50%;border:1px solid var(--cp-bdr-m);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:12px;color:var(--cp-tx-m);transition:all .2s}
.cp-modal-close:hover{background:var(--cp-bg2);color:var(--cp-tx)}
.cp-modal-title{font-family:'Playfair Display',serif;font-size:20px;margin-bottom:6px;margin-right:32px;color:var(--cp-tx)}
.cp-modal-price{font-family:'Playfair Display',serif;font-size:22px;color:var(--cp-gold);margin-bottom:20px}
.cp-modal-desc{font-size:13px;color:var(--cp-tx-m);line-height:1.65;margin-bottom:20px;font-weight:300}
.cp-modal-note{font-size:11px;color:var(--cp-tx-m);margin-top:12px;line-height:1.6}

/* MOBILE */
@media(max-width:960px){
  .cp-nav{padding:12px 20px}
  .cp-logo span{display:none}
  .cp-nav-tab{font-size:11px;padding:7px 12px}
  .cp-hero{grid-template-columns:1fr;min-height:auto}
  .cp-hero-right{height:42vh;order:-1}
  .cp-hero-left{padding:24px 24px 52px}
  .cp-hero-left::after{display:none}
  .cp-hero-name{font-size:44px}
  .cp-section{padding:52px 24px}
  .cp-wiz-layout{grid-template-columns:1fr}
  .cp-summary{position:static}
  .cp-s1-grid{grid-template-columns:1fr}
  .cp-slots-grid{grid-template-columns:repeat(3,1fr)}
  .cp-form-2col{grid-template-columns:1fr}
  .cp-prod-grid{grid-template-columns:1fr 1fr}
  .cp-off-grid{grid-template-columns:1fr}
  .cp-faq-grid{grid-template-columns:1fr;gap:24px}
  .cp-footer{flex-direction:column;gap:10px;text-align:center;padding:24px}
  .cp-overlay{align-items:flex-end}
  .cp-modal{border-radius:12px 12px 0 0;max-height:85vh}
}
@media(max-width:480px){
  .cp-prod-grid{grid-template-columns:1fr}
  .cp-hero-name{font-size:38px}
}
`
