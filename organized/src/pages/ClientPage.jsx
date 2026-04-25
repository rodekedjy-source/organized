/**
 * ClientPage.jsx — Page publique client · Book · Shop · Learn
 * Route:  /:slug   (App.jsx: <Route path="/:slug" element={<ClientPage />} />)
 * Import: '../lib/supabase'
 *
 * Hero full dark — s'adapte selon le tab actif.
 * Portfolio conditionnel (section absente si pas de photos).
 * FAQ contextuelle selon le tab.
 * TODO: Construire portfolio_photos table + section upload dans Dashboard.
 */

import { useState, useEffect, useLayoutEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// ── Constants ─────────────────────────────────────────────────────────────────
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const Icons = {
  instagram: (<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>),
  tiktok:    (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.14 8.14 0 0 0 4.77 1.52V6.75a4.85 4.85 0 0 1-1-.06z"/></svg>),
  facebook:  (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>),
  twitter:   (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>),
  globe:     (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><line x1="2" y1="12" x2="22" y2="12"/></svg>),
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const pad = n => String(n).padStart(2,'0')
const toMin = t => { const [h,m]=t.split(':').map(Number); return h*60+m }
const fromMin = m => `${pad(Math.floor(m/60))}:${pad(m%60)}`
const fmt12 = t => { const [h,m]=t.split(':').map(Number); const p=h>=12?'PM':'AM'; const h12=h===0?12:h>12?h-12:h; return `${h12}:${pad(m)} ${p}` }
const fmtDur = m => { if(!m)return''; if(m<60)return`${m} min`; const h=Math.floor(m/60),r=m%60; return r?`${h}h ${r}min`:`${h} hr` }
const fmtMoney = (p,c) => !p||p===0 ? 'Free' : `$${Math.round(p)}`
const fmtSvcP  = s => s.is_free||s.price===0 ? 'Free' : `$${Math.round(s.price)} & up`

const svcIcon = n => {
  const x=n.toLowerCase()
  if(x.includes('color')||x.includes('balayage'))return'✦'
  if(x.includes('cut')||x.includes('coupe'))return'◆'
  if(x.includes('natural')||x.includes('texture')||x.includes('loc'))return'❋'
  if(x.includes('keratin'))return'◈'
  if(x.includes('bridal'))return'◇'
  if(x.includes('consult'))return'○'
  return'◉'
}

const svcAddons = n => {
  const x=n.toLowerCase()
  if(x.includes('color')||x.includes('balayage'))return['Toning +$40','Deep Condition +$30','Olaplex +$50']
  if(x.includes('cut'))return['Blowout +$35','Deep Treatment +$45']
  if(x.includes('natural')||x.includes('texture'))return['Scalp Massage +$20','Steam Treatment +$30']
  if(x.includes('keratin'))return['Express Blowout +$40','Olaplex +$50']
  if(x.includes('bridal'))return['Trial Run +$120','Bridesmaid Styling +$85/person']
  return[]
}

function buildSocials(ws){
  const l=[]
  if(ws.instagram) l.push({k:'ig',icon:Icons.instagram,label:'Instagram',href:`https://instagram.com/${ws.instagram.replace('@','')}`})
  if(ws.tiktok)    l.push({k:'tt',icon:Icons.tiktok,label:'TikTok',href:`https://tiktok.com/@${ws.tiktok.replace('@','')}`})
  if(ws.facebook)  l.push({k:'fb',icon:Icons.facebook,label:'Facebook',href:ws.facebook.startsWith('http')?ws.facebook:`https://facebook.com/${ws.facebook}`})
  if(ws.twitter)   l.push({k:'tw',icon:Icons.twitter,label:'X',href:`https://x.com/${ws.twitter.replace('@','')}`})
  if(ws.website)   l.push({k:'ww',icon:Icons.globe,label:'Website',href:ws.website.startsWith('http')?ws.website:`https://${ws.website}`})
  return l
}

// Hero configuration adapts per active tab
function getHeroCfg(tab, ws, services, products, offerings, availDays, calMonth){
  if(tab==='shop') return {
    tag:          '✦  Products & Collections',
    taglinePrimary:  'Product Shop',
    taglineSub:   ws.tagline || null,
    bio:          null,
    ctaPrimary:   { label:'Browse Products', anchor:'cp-shop-anchor' },
    ctaGhost:     null,
    fc1:          { label:'Products', val: products.length.toString(), sub:'available' },
    fc2:          { label:'In Stock', val: products.filter(p=>p.stock>0).length.toString(), sub:'items' },
  }
  if(tab==='learn') return {
    tag:          '◈  Formations & Training',
    taglinePrimary:  'Learn & Grow',
    taglineSub:   ws.tagline || null,
    bio:          null,
    ctaPrimary:   { label:'View Formations', anchor:'cp-learn-anchor' },
    ctaGhost:     null,
    fc1:          { label:'Formations', val: offerings.length.toString(), sub:'offered' },
    fc2:          offerings.some(o=>o.format==='online') ? { label:'Format', val:'Online', sub:'& In-Person' } : null,
  }
  // book (default)
  return {
    tag:          ws.accepts_bookings!==false ? '●  Accepting bookings' : '○  Bookings paused',
    taglinePrimary:  ws.tagline || null,
    taglineSub:   ws.location || null,
    bio:          ws.bio,
    ctaPrimary:   { label:'Book a Session', anchor:'cp-book-anchor' },
    ctaGhost:     null,
    fc1:          { label:'Next Available', val: availDays.length>0 ? `${MONTHS[calMonth]} ${availDays[0]}` : 'See calendar', sub: null },
    fc2:          services.length>0 ? { label:'Services', val:services.length.toString(), sub:'offered' } : null,
  }
}

// Contextual FAQ data
const FAQS = {
  book: [
    { q:"What's the cancellation policy?",      a:"Free cancellation up to 24 hours before your appointment. Cancellations within 24 hours forfeit the deposit." },
    { q:"Do you require a deposit?",             a:"Services over $100 require a $40 deposit at booking — applied to your total, fully refundable with 24h+ notice." },
    { q:"How should I arrive?",                  a:"Clean, dry hair unless specified. Bring inspiration photos — the more reference, the better the result." },
    { q:"Do you work with all textures?",        a:"Yes. Every service adapts to your hair type, from fine straight to tight coils. Unsure? Book a free Consultation first." },
  ],
  shop: [
    { q:"How do I pay for my order?",            a:"After placing your order, you'll be contacted with payment details. We accept e-Transfer, Interac, and major cards." },
    { q:"Local pickup or delivery?",             a:"Pickup is always available. Local delivery may be offered — the stylist will confirm at order time." },
    { q:"What if a product is out of stock?",    a:"Products shown are in stock. If stock runs out after ordering, you'll be notified and fully refunded." },
    { q:"Can I return a product?",               a:"Contact the stylist within 7 days of receiving your order. Unopened products may be returned for store credit." },
  ],
  learn: [
    { q:"What's included in a formation?",       a:"All course materials are included. Duration, format, and full details are listed on each formation card." },
    { q:"Is it online or in-person?",            a:"Both formats are available depending on the formation — indicated on each card." },
    { q:"Do I need prior experience?",           a:"No prior experience required unless specified. Formations welcome all levels — beginner to advanced." },
    { q:"How and when do I pay?",                a:"After enrolling, you'll be contacted with payment instructions and session confirmation." },
  ],
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ClientPage() {
  const { slug } = useParams()

  useLayoutEffect(() => {
    const el = document.createElement('style')
    el.id = 'cp-page-styles'
    el.textContent = STYLES
    document.head.appendChild(el)
    return () => document.getElementById('cp-page-styles')?.remove()
  }, [])

  // Data
  const [ws,         setWs]         = useState(null)
  const [services,   setServices]   = useState([])
  const [products,   setProducts]   = useState([])
  const [offerings,  setOfferings]  = useState([])
  const [portfolio,  setPortfolio]  = useState([]) // TODO: query portfolio_photos once table built
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  // Active tab
  const [activeTab, setActiveTab] = useState('book')

  // Calendar
  const today = new Date()
  const [calYear,   setCalYear]   = useState(today.getFullYear())
  const [calMonth,  setCalMonth]  = useState(today.getMonth())
  const [availDays, setAvailDays] = useState([])

  // Booking
  const [bkStep,    setBkStep]    = useState(1)
  const [selSvc,    setSelSvc]    = useState(null)
  const [selAddons, setSelAddons] = useState([])
  const [selDay,    setSelDay]    = useState(null)
  const [slots,     setSlots]     = useState([])
  const [loadSlots, setLoadSlots] = useState(false)
  const [selTime,   setSelTime]   = useState(null)
  const [bkForm,    setBkForm]    = useState({fname:'',lname:'',email:'',phone:'',source:'',notes:''})
  const [bkErrors,  setBkErrors]  = useState({})
  const [bkSub,     setBkSub]     = useState(false)
  const [bkDone,    setBkDone]    = useState(null)

  // Shop modal
  const [shopModal, setShopModal] = useState(null)
  const [shopForm,  setShopForm]  = useState({fname:'',lname:'',email:'',phone:'',qty:1})
  const [shopSub,   setShopSub]   = useState(false)
  const [shopDone,  setShopDone]  = useState(null)

  // Learn modal
  const [learnModal, setLearnModal] = useState(null)
  const [learnForm,  setLearnForm]  = useState({fname:'',lname:'',email:'',phone:''})
  const [learnSub,   setLearnSub]   = useState(false)
  const [learnDone,  setLearnDone]  = useState(null)

  // ── Fetch ──
  useEffect(() => {
    if (!slug) return
    ;(async () => {
      try {
        const { data: workspace, error: wErr } = await supabase
          .from('workspaces')
          .select('id,name,slug,tagline,bio,avatar_url,cover_url,instagram,tiktok,website,facebook,twitter,location,currency,timezone,is_published,accepts_bookings,accepts_orders')
          .eq('slug', slug).single()
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

        const hasSvcs = (svcs||[]).length > 0 && workspace.accepts_bookings !== false
        setActiveTab(hasSvcs ? 'book' : (prods||[]).length > 0 ? 'shop' : 'learn')
      } catch(e) { setError(e.message) }
      finally    { setLoading(false) }
    })()
  }, [slug])

  // ── Available days ──
  const fetchAvailDays = useCallback(async () => {
    if (!ws) return
    try {
      const { data: avail } = await supabase.from('availability').select('day_of_week').eq('workspace_id', ws.id).eq('is_open', true)
      if (!avail?.length) { setAvailDays([]); return }
      const dows = new Set(avail.map(a => a.day_of_week))
      const lastDay = new Date(calYear, calMonth+1, 0)
      const { data: blocked } = await supabase.from('blocked_dates').select('blocked_date').eq('workspace_id', ws.id).gte('blocked_date', `${calYear}-${pad(calMonth+1)}-01`).lte('blocked_date', `${calYear}-${pad(calMonth+1)}-${pad(lastDay.getDate())}`)
      const blkSet = new Set((blocked||[]).map(b => b.blocked_date))
      const todayMid = new Date(); todayMid.setHours(0,0,0,0)
      const days = []
      for (let d=1; d<=lastDay.getDate(); d++) {
        const dt = new Date(calYear, calMonth, d)
        if (dt <= todayMid) continue
        if (!dows.has(dt.getDay())) continue
        if (blkSet.has(`${calYear}-${pad(calMonth+1)}-${pad(d)}`)) continue
        days.push(d)
      }
      setAvailDays(days)
    } catch(e) { console.error(e) }
  }, [ws, calYear, calMonth])

  useEffect(() => { fetchAvailDays() }, [fetchAvailDays])

  // ── Slots ──
  async function fetchSlots(day) {
    if (!ws) return
    setLoadSlots(true); setSlots([])
    try {
      const ds = `${calYear}-${pad(calMonth+1)}-${pad(day)}`
      const dow = new Date(calYear, calMonth, day).getDay()
      const dur = selSvc?.duration_min || 60
      const [{ data: wins }, { data: appts }] = await Promise.all([
        supabase.from('availability').select('open_time,close_time').eq('workspace_id', ws.id).eq('day_of_week', dow).eq('is_open', true),
        supabase.from('appointments').select('scheduled_at,duration_min').eq('workspace_id', ws.id).gte('scheduled_at',`${ds}T00:00:00`).lt('scheduled_at',`${ds}T23:59:59`).not('status','in','("cancelled","no_show")').is('deleted_at', null),
      ])
      if (!wins?.length) { setSlots([]); return }
      const booked = (appts||[]).map(a => { const dt=new Date(a.scheduled_at); const s=dt.getHours()*60+dt.getMinutes(); return{s,e:s+(a.duration_min||60)} })
      const gen = []
      for (const w of wins) {
        let cur=toMin(w.open_time); const close=toMin(w.close_time)
        while (cur+dur<=close) {
          const end=cur+dur
          gen.push({ raw:fromMin(cur), display:fmt12(fromMin(cur)), booked:booked.some(b=>cur<b.e&&end>b.s) })
          cur+=30
        }
      }
      setSlots(gen)
    } catch(e) { console.error(e) }
    finally { setLoadSlots(false) }
  }

  // ── Booking ──
  function pickSvc(s){ setSelSvc(s); setSelAddons([]) }
  function toggleAddon(a){ setSelAddons(p=>p.includes(a)?p.filter(x=>x!==a):[...p,a]) }
  function pickDay(d){ setSelDay(d); setSelTime(null); fetchSlots(d) }
  function pickTime(sl){ if(!sl.booked) setSelTime(sl.raw) }
  function changeMonth(dir){
    const now=new Date(); let y=calYear, m=calMonth+dir
    if(m<0){m=11;y--} if(m>11){m=0;y++}
    if(y<now.getFullYear()||(y===now.getFullYear()&&m<now.getMonth())) return
    setCalYear(y); setCalMonth(m); setSelDay(null); setSelTime(null); setSlots([])
  }
  function goStep(n){
    if(n===2&&!selSvc) return
    if(n===3&&(!selDay||!selTime)) return
    setBkStep(n)
    setTimeout(()=>document.getElementById('cp-book-anchor')?.scrollIntoView({behavior:'smooth',block:'start'}),50)
  }
  async function submitBooking(){
    const errs={}
    if(!bkForm.fname.trim()) errs.fname='Required'
    if(!bkForm.lname.trim()) errs.lname='Required'
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bkForm.email.trim())) errs.email='Valid email required'
    if(bkForm.phone.replace(/\D/g,'').length<7) errs.phone='Required'
    if(Object.keys(errs).length){setBkErrors(errs);return}
    setBkErrors({}); setBkSub(true)
    try {
      const ds=`${calYear}-${pad(calMonth+1)}-${pad(selDay)}`
      const sAt=new Date(`${ds}T${selTime}:00`)
      const dur=selSvc.duration_min||60
      const eAt=new Date(sAt.getTime()+dur*60000)
      const addNote=selAddons.length?`[Add-ons: ${selAddons.join(', ')}]\n`:''
      const {error:iErr}=await supabase.from('appointments').insert({
        workspace_id:ws.id, service_id:selSvc.id, service_name:selSvc.name,
        client_name:`${bkForm.fname.trim()} ${bkForm.lname.trim()}`,
        client_email:bkForm.email.trim(), client_phone:bkForm.phone.trim(),
        notes:(addNote+(bkForm.notes||'')).trim()||null,
        scheduled_at:sAt.toISOString(), duration_min:dur, ends_at:eAt.toISOString(),
        status:'pending', amount:selSvc.is_free?0:selSvc.price,
        currency:selSvc.currency||ws.currency||'CAD', payment_status:'unpaid',
      })
      if(iErr){if(iErr.code==='23505'){alert('Slot just taken — pick another.');setSelTime(null);fetchSlots(selDay);setBkStep(2);return} throw iErr}
      setBkDone({ serviceName:selSvc.name, displayDate:`${MONTHS[calMonth]} ${selDay}, ${calYear}`, displayTime:fmt12(selTime), duration:fmtDur(dur), email:bkForm.email.trim(), addons:selAddons, needsDeposit:!selSvc.is_free&&selSvc.price>=100 })
      setBkStep(4)
    } catch(e){alert('Something went wrong. Please try again.');console.error(e)}
    finally{setBkSub(false)}
  }

  // ── Shop ──
  function openShop(p){ setShopModal(p); setShopDone(null); setShopForm({fname:'',lname:'',email:'',phone:'',qty:1}) }
  async function submitOrder(){
    const f=shopForm
    if(!f.fname.trim()||!f.lname.trim()||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())||f.phone.replace(/\D/g,'').length<7){ alert('Fill all required fields.'); return }
    setShopSub(true)
    try {
      const p=shopModal
      await supabase.from('orders').insert({ workspace_id:ws.id, product_id:p.id, client_name:`${f.fname.trim()} ${f.lname.trim()}`, client_email:f.email.trim(), client_phone:f.phone.trim(), quantity:f.qty||1, unit_price:p.price, total_amount:p.price*(f.qty||1), currency:p.currency||ws.currency||'CAD', status:'pending', payment_status:'unpaid' })
      setShopDone({productName:p.name, qty:f.qty, email:f.email.trim()})
    } catch(e){alert('Something went wrong.');console.error(e)}
    finally{setShopSub(false)}
  }

  // ── Learn ──
  function openLearn(o){ setLearnModal(o); setLearnDone(null); setLearnForm({fname:'',lname:'',email:'',phone:''}) }
  async function submitEnrollment(){
    const f=learnForm
    if(!f.fname.trim()||!f.lname.trim()||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())||f.phone.replace(/\D/g,'').length<7){ alert('Fill all required fields.'); return }
    setLearnSub(true)
    const o=learnModal
    try {
      await supabase.from('enrollments').insert({ workspace_id:ws.id, offering_id:o.id, client_name:`${f.fname.trim()} ${f.lname.trim()}`, client_email:f.email.trim(), client_phone:f.phone.trim(), amount_paid:0, currency:o.currency||ws.currency||'CAD', payment_status:'unpaid', status:'active' })
      setLearnDone({title:o.title, email:f.email.trim()})
    } catch(e){alert('Something went wrong.');console.error(e)}
    finally{setLearnSub(false)}
  }

  // ── Calendar render ──
  function renderCal(){
    const firstDay=new Date(calYear,calMonth,1).getDay()
    const dim=new Date(calYear,calMonth+1,0).getDate()
    const todayMid=new Date(); todayMid.setHours(0,0,0,0)
    const avSet=new Set(availDays)
    const cells=[]
    for(let i=0;i<firstDay;i++) cells.push(<div key={`e${i}`} className="cp-day empty"/>)
    for(let d=1;d<=dim;d++){
      const date=new Date(calYear,calMonth,d)
      const isToday=date.toDateString()===todayMid.toDateString()
      const isPast=date<todayMid
      const isAvail=avSet.has(d)&&!isPast&&!isToday
      const isSel=selDay===d
      let cls='cp-day'+(isSel?' sel':isPast?' past':isToday?' today':isAvail?' avail':' off')
      cells.push(<div key={d} className={cls} onClick={isAvail&&!isSel?()=>pickDay(d):undefined}>{d}</div>)
    }
    return cells
  }

  // ── Splash ──
  const Splash=({msg})=>(
    <div style={{minHeight:'100vh',background:'#0D0A06',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontFamily:'Playfair Display,Georgia,serif',fontSize:24,color:'#C9A84C',marginBottom:12}}>Organized.</div>
        <div style={{fontSize:12,color:'rgba(245,240,232,0.4)',letterSpacing:'0.14em',textTransform:'uppercase'}}>{msg}</div>
      </div>
    </div>
  )

  if(loading)       return <Splash msg="Loading…"/>
  if(error||!ws)    return <Splash msg="This page doesn't exist."/>
  if(!ws.is_published) return <Splash msg="Not available yet."/>

  // ── Derived ──
  const socials    = buildSocials(ws)
  const firstName  = ws.name.split(' ')[0]
  const hasBook    = services.length > 0 && ws.accepts_bookings !== false
  const hasShop    = products.length > 0 && ws.accepts_orders !== false
  const hasLearn   = offerings.length > 0
  const hasPF      = portfolio.length > 0
  const tabs       = [...(hasBook?[{id:'book',label:'Book a Service'}]:[]),...(hasShop?[{id:'shop',label:'Shop'}]:[]),...(hasLearn?[{id:'learn',label:'Formations'}]:[])]
  const hcfg       = getHeroCfg(activeTab, ws, services, products, offerings, availDays, calMonth)
  const addons     = selSvc ? svcAddons(selSvc.name) : []
  const needsDep   = selSvc && !selSvc.is_free && selSvc.price >= 100
  const selDateDsp = selDay ? `${MONTHS[calMonth]} ${selDay}, ${calYear}` : null
  const selDTDsp   = selDateDsp&&selTime ? `${selDateDsp} · ${fmt12(selTime)}` : selDateDsp
  const isCurMo    = calYear===today.getFullYear()&&calMonth===today.getMonth()
  const faqItems   = FAQS[activeTab] || FAQS.book

  function switchTab(id){
    setActiveTab(id)
    setTimeout(()=>document.getElementById('cp-content-start')?.scrollIntoView({behavior:'smooth',block:'start'}),50)
  }

  // ══════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════
  return (
    <>
      {/* ── NAV ─────────────────────────────── */}
      <nav className="cp-nav">
        <div className="cp-logo">Organized.<span>by {ws.name}</span></div>
        <div className="cp-nav-right">
          {tabs.map(t=>(
            <button key={t.id} className={`cp-nav-tab ${activeTab===t.id?'active':''}`} onClick={()=>switchTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ════════════════════════════════════════
          DARK WRAP — Hero + Tab Bar
          Dark background covers both sections
      ════════════════════════════════════════ */}
      <div className="cp-dark-wrap">

        {/* HERO */}
        <section className="cp-hero">
          {/* Left panel — text content */}
          <div className="cp-hero-left">

            {/* Tag — adapts per tab */}
            <div className="cp-hero-tag" key={`tag-${activeTab}`}>
              {activeTab==='book' && ws.accepts_bookings!==false && <span className="cp-tag-dot"/>}
              {hcfg.tag}
            </div>

            {/* Name — always the stylist */}
            <h1 className="cp-hero-name">
              {ws.name.split(' ')[0]}
              {ws.name.split(' ').length > 1 && <><br/><em>{ws.name.split(' ').slice(1).join(' ')}</em></>}
            </h1>

            {/* Tagline — adapts */}
            {hcfg.taglinePrimary && (
              <p className="cp-hero-title" key={`tl-${activeTab}`}>{hcfg.taglinePrimary}</p>
            )}

            {/* Sub-tagline / location */}
            {hcfg.taglineSub && (
              <p className="cp-hero-sub" key={`sub-${activeTab}`}>
                <span className="cp-gold-dot">◉</span>{hcfg.taglineSub}
              </p>
            )}

            {/* Bio — only on book tab */}
            {hcfg.bio && (
              <p className="cp-hero-bio">{hcfg.bio}</p>
            )}

            {/* Stats bar — adapts */}
            <div className="cp-hero-stats" key={`stats-${activeTab}`}>
              {activeTab==='book' && services.length>0 && <div className="cp-stat"><div className="cp-stat-n">{services.length}</div><div className="cp-stat-l">Services</div></div>}
              {activeTab==='book' && products.length>0  && <div className="cp-stat"><div className="cp-stat-n">{products.length}</div><div className="cp-stat-l">Products</div></div>}
              {activeTab==='book' && offerings.length>0 && <div className="cp-stat"><div className="cp-stat-n">{offerings.length}</div><div className="cp-stat-l">Formations</div></div>}
              {activeTab==='shop' && <div className="cp-stat"><div className="cp-stat-n">{products.length}</div><div className="cp-stat-l">Products</div></div>}
              {activeTab==='shop' && <div className="cp-stat"><div className="cp-stat-n">{products.filter(p=>p.stock>0).length}</div><div className="cp-stat-l">In Stock</div></div>}
              {activeTab==='learn'&& <div className="cp-stat"><div className="cp-stat-n">{offerings.length}</div><div className="cp-stat-l">Formations</div></div>}
              {activeTab==='learn'&& <div className="cp-stat"><div className="cp-stat-n">{offerings.filter(o=>o.format==='online').length||'–'}</div><div className="cp-stat-l">Online</div></div>}
            </div>

            {/* Social icons */}
            {socials.length > 0 && (
              <div className="cp-socials">
                {socials.map(({k,icon,label,href})=>(
                  <a key={k} href={href} target="_blank" rel="noreferrer" className="cp-social" title={label} aria-label={label}>{icon}</a>
                ))}
              </div>
            )}

            {/* CTA — adapts per tab */}
            <div className="cp-hero-cta" key={`cta-${activeTab}`}>
              <button className="cp-btn-gold" onClick={()=>document.getElementById(hcfg.ctaPrimary.anchor)?.scrollIntoView({behavior:'smooth'})}>
                {hcfg.ctaPrimary.label}
              </button>
              {/* Secondary CTAs — always show the other tabs as ghost buttons */}
              {activeTab!=='book' && hasBook && (
                <button className="cp-btn-ghost" onClick={()=>switchTab('book')}>Book a Session</button>
              )}
              {activeTab==='book' && hasShop && (
                <button className="cp-btn-ghost" onClick={()=>switchTab('shop')}>Shop</button>
              )}
              {activeTab==='book' && !hasShop && hasLearn && (
                <button className="cp-btn-ghost" onClick={()=>switchTab('learn')}>Formations</button>
              )}
            </div>
          </div>

          {/* Right panel — photo / portrait art */}
          <div className="cp-hero-right">
            <div className="cp-hero-photo">
              {ws.cover_url
                ? <img src={ws.cover_url} alt={ws.name} className="cp-cover-img"/>
                : <div className="cp-portrait-wrap">
                    <div className="cp-p-glow"/><div className="cp-p-head"/>
                    <div className="cp-p-neck"/><div className="cp-p-body"/>
                    <div className="cp-p-accent">· · ·</div>
                  </div>
              }
            </div>
            <div className="cp-hero-overlay"/>

            {/* Floating cards — adapt per tab */}
            {hcfg.fc1 && (
              <div className="cp-fc cp-fc-1" key={`fc1-${activeTab}`}>
                <div className="cp-fc-lbl">{hcfg.fc1.label}</div>
                <div className="cp-fc-val">{hcfg.fc1.val}</div>
                {hcfg.fc1.sub && <div className="cp-fc-sub">{hcfg.fc1.sub}</div>}
              </div>
            )}
            {hcfg.fc2 && (
              <div className="cp-fc cp-fc-2" key={`fc2-${activeTab}`}>
                <div className="cp-fc-lbl">{hcfg.fc2.label}</div>
                <div className="cp-fc-val">{hcfg.fc2.val}</div>
                {hcfg.fc2.sub && <div className="cp-fc-sub">{hcfg.fc2.sub}</div>}
              </div>
            )}
          </div>
        </section>

        {/* TABS BAR — inside dark wrap, sticky */}
        <div className="cp-tabs-bar" id="cp-content-start">
          {tabs.map(t=>(
            <button key={t.id} className={`cp-tab-btn ${activeTab===t.id?'active':''}`} onClick={()=>switchTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

      </div>{/* end .cp-dark-wrap */}

      {/* ════════════════════════════════════════
          CONTENT — Light ivory sections
      ════════════════════════════════════════ */}

      {/* ── BOOK ──────────────────────────────── */}
      {activeTab==='book' && hasBook && (
        <section id="cp-book-anchor" className="cp-section">
          <div className="cp-inner">
            <div className="cp-eyebrow">Booking</div>
            <h2 className="cp-heading">Reserve your <em>moment</em></h2>

            {bkStep < 4 && (
              <>
                {/* Progress */}
                <div className="cp-progress">
                  {[1,2,3].map(n=>(
                    <span key={n} style={{display:'contents'}}>
                      <div className={`cp-wp ${bkStep===n?'active':''} ${bkStep>n?'done':''}`}>
                        <div className="cp-wp-n">{bkStep>n?'✓':n}</div>
                        <div className="cp-wp-l">{n===1?'Service':n===2?'Date & Time':'Your Info'}</div>
                      </div>
                      {n<3&&<div className={`cp-wl ${bkStep>n?'done':''}`}/>}
                    </span>
                  ))}
                </div>

                {/* Layout */}
                <div className="cp-wiz-layout">
                  {/* Summary panel */}
                  <div className="cp-summary">
                    <div className="cp-sum-title">Summary</div>
                    <div className="cp-sum-row"><div className="cp-sum-k">Stylist</div><div className="cp-sum-v">{ws.name}</div></div>
                    <div className="cp-sum-row">
                      <div className="cp-sum-k">Service</div>
                      {selSvc?<><div className="cp-sum-v">{selSvc.name}</div>{selSvc.duration_min&&<div className="cp-sum-s">{fmtDur(selSvc.duration_min)}</div>}</>:<div className="cp-sum-e">—</div>}
                    </div>
                    <div className="cp-sum-row">
                      <div className="cp-sum-k">Date & Time</div>
                      {selDTDsp?<div className="cp-sum-v">{selDTDsp}</div>:<div className="cp-sum-e">—</div>}
                    </div>
                    <div className="cp-sum-row">
                      <div className="cp-sum-k">Price</div>
                      {selSvc?<div className="cp-sum-v">{fmtSvcP(selSvc)}</div>:<div className="cp-sum-e">—</div>}
                    </div>
                    {needsDep&&<div className="cp-deposit"><strong>$40 deposit</strong> required to secure. Applied to total. Refundable with 24h+ notice.</div>}
                  </div>

                  {/* Steps */}
                  <div>
                    {/* Step 1 */}
                    {bkStep===1 && (
                      <div>
                        <p className="cp-step-note">Select the service you'd like to book.</p>
                        <div className="cp-s1-grid">
                          {services.map(s=>(
                            <div key={s.id} className={`cp-s1-card ${selSvc?.id===s.id?'sel':''}`} onClick={()=>pickSvc(s)}>
                              <div className="cp-s1-chk">✓</div>
                              <div className="cp-s1-icon">{svcIcon(s.name)}</div>
                              <div className="cp-s1-name">{s.name}</div>
                              {s.duration_min&&<div className="cp-s1-meta">{fmtDur(s.duration_min)}</div>}
                              <div className="cp-s1-price">{fmtSvcP(s)}</div>
                            </div>
                          ))}
                        </div>
                        {selSvc&&addons.length>0&&(
                          <div className="cp-addons">
                            <div className="cp-addons-lbl">Pair it with</div>
                            <div className="cp-chips">
                              {addons.map(a=><div key={a} className={`cp-chip ${selAddons.includes(a)?'on':''}`} onClick={()=>toggleAddon(a)}>{a}</div>)}
                            </div>
                          </div>
                        )}
                        <div className="cp-nav-row"><span/><button className="cp-btn-next" onClick={()=>goStep(2)} disabled={!selSvc}>Next — Pick a Time &#8594;</button></div>
                      </div>
                    )}

                    {/* Step 2 */}
                    {bkStep===2 && (
                      <div>
                        <p className="cp-step-note">Highlighted dates have openings. Select a date then a time.</p>
                        <div className="cp-cal-wrap">
                          <div className="cp-cal-head">
                            <div className="cp-cal-month">{MONTHS[calMonth]} {calYear}</div>
                            <div className="cp-cal-nav">
                              <button className="cp-cal-btn" onClick={()=>changeMonth(-1)} disabled={isCurMo}>&#8249;</button>
                              <button className="cp-cal-btn" onClick={()=>changeMonth(1)}>&#8250;</button>
                            </div>
                          </div>
                          <div className="cp-dnames">{['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=><div key={d} className="cp-dname">{d}</div>)}</div>
                          <div className="cp-cal-grid">{renderCal()}</div>
                        </div>
                        {selDay&&(
                          <div className="cp-slots-wrap">
                            <div className="cp-slots-lbl">Available Times — {selDateDsp}</div>
                            {loadSlots?<div className="cp-slots-empty">Loading…</div>
                              :slots.length===0?<div className="cp-slots-empty">No availability for this date.</div>
                              :<div className="cp-slots-grid">{slots.map(sl=><div key={sl.raw} className={`cp-slot ${sl.booked?'booked':selTime===sl.raw?'sel':'avail'}`} onClick={()=>!sl.booked&&pickTime(sl)}>{sl.display}</div>)}</div>}
                          </div>
                        )}
                        <div className="cp-nav-row">
                          <button className="cp-btn-back" onClick={()=>goStep(1)}>&#8592; Back</button>
                          <button className="cp-btn-next" onClick={()=>goStep(3)} disabled={!selDay||!selTime}>Next — Your Info &#8594;</button>
                        </div>
                      </div>
                    )}

                    {/* Step 3 */}
                    {bkStep===3 && (
                      <div>
                        <p className="cp-step-note">Almost done. Confirmation sent to your inbox right away.</p>
                        <div className="cp-2col">
                          <div className="cp-fg"><label className="cp-fl">First Name *</label><input className={`cp-fi ${bkErrors.fname?'err':''}`} type="text" placeholder="Marie" value={bkForm.fname} onChange={e=>setBkForm(f=>({...f,fname:e.target.value}))}/>{bkErrors.fname&&<span className="cp-ferr">{bkErrors.fname}</span>}</div>
                          <div className="cp-fg"><label className="cp-fl">Last Name *</label><input className={`cp-fi ${bkErrors.lname?'err':''}`} type="text" placeholder="Dupont" value={bkForm.lname} onChange={e=>setBkForm(f=>({...f,lname:e.target.value}))}/>{bkErrors.lname&&<span className="cp-ferr">{bkErrors.lname}</span>}</div>
                        </div>
                        <div className="cp-fg"><label className="cp-fl">Email *</label><input className={`cp-fi ${bkErrors.email?'err':''}`} type="email" placeholder="marie@example.com" value={bkForm.email} onChange={e=>setBkForm(f=>({...f,email:e.target.value}))}/>{bkErrors.email&&<span className="cp-ferr">{bkErrors.email}</span>}</div>
                        <div className="cp-fg"><label className="cp-fl">Phone *</label><input className={`cp-fi ${bkErrors.phone?'err':''}`} type="tel" placeholder="+1 (514) 000-0000" value={bkForm.phone} onChange={e=>setBkForm(f=>({...f,phone:e.target.value}))}/>{bkErrors.phone&&<span className="cp-ferr">{bkErrors.phone}</span>}</div>
                        <div className="cp-fg"><label className="cp-fl">How did you find {firstName}?</label><select className="cp-fsel" value={bkForm.source} onChange={e=>setBkForm(f=>({...f,source:e.target.value}))}><option value="">Select one</option><option value="instagram">Instagram</option><option value="referral">Friend or Referral</option><option value="google">Google</option><option value="tiktok">TikTok</option><option value="other">Other</option></select></div>
                        <div className="cp-fg"><label className="cp-fl">Notes — optional</label><input className="cp-fi" type="text" placeholder="Allergies, goals, reference photos…" value={bkForm.notes} onChange={e=>setBkForm(f=>({...f,notes:e.target.value}))}/></div>
                        <div className="cp-policy">By confirming, you agree to {firstName}&apos;s <a href="#cp-faq">cancellation policy</a>. Free cancellation up to 24h before your appointment.{needsDep&&' $40 deposit required.'}</div>
                        <div className="cp-nav-row">
                          <button className="cp-btn-back" onClick={()=>goStep(2)}>&#8592; Back</button>
                          <button className="cp-btn-next" onClick={submitBooking} disabled={bkSub}>{bkSub?'Confirming…':'Confirm Appointment →'}</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Booking success */}
            {bkStep===4 && bkDone && (
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
                <button className="cp-btn-gold" onClick={()=>window.location.reload()}>Book Another</button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── PORTFOLIO (conditional — only if photos exist) ── */}
      {hasPF && (
        <section className="cp-section cp-section-alt">
          <div className="cp-inner">
            <div className="cp-eyebrow">Portfolio</div>
            <h2 className="cp-heading">The <em>work</em></h2>
            <div className="cp-portfolio-grid">
              {portfolio.map((photo, i) => (
                <div key={photo.id || i} className={`cp-pf-item ${i===0?'cp-pf-main':''}`}>
                  <img src={photo.url} alt={photo.caption || `Portfolio ${i+1}`}/>
                  {photo.caption && <div className="cp-pf-caption">{photo.caption}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SHOP ──────────────────────────────── */}
      {activeTab==='shop' && hasShop && (
        <section id="cp-shop-anchor" className="cp-section">
          <div className="cp-inner">
            <div className="cp-eyebrow">Shop</div>
            <h2 className="cp-heading">Products by <em>{firstName}</em></h2>
            <div className="cp-prod-grid">
              {products.map(p=>{
                const imgSrc=p.image_url||(p.images&&p.images[0])||null
                return (
                  <div key={p.id} className="cp-prod-card">
                    <div className="cp-prod-img">
                      {imgSrc?<img src={imgSrc} alt={p.name}/>:<div className="cp-prod-ph">◈</div>}
                      {p.stock<=3&&<div className="cp-prod-badge">Only {p.stock} left</div>}
                    </div>
                    <div className="cp-prod-body">
                      <div className="cp-prod-name">{p.name}</div>
                      {p.description&&<div className="cp-prod-desc">{p.description}</div>}
                      <div className="cp-prod-foot">
                        <div className="cp-prod-price">{fmtMoney(p.price, p.currency||ws.currency)}</div>
                        <button className="cp-btn-gold" onClick={()=>openShop(p)}>Order</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── LEARN ─────────────────────────────── */}
      {activeTab==='learn' && hasLearn && (
        <section id="cp-learn-anchor" className="cp-section">
          <div className="cp-inner">
            <div className="cp-eyebrow">Formations</div>
            <h2 className="cp-heading">Learn from <em>{firstName}</em></h2>
            <div className="cp-off-grid">
              {offerings.map(o=>(
                <div key={o.id} className="cp-off-card">
                  <div className="cp-off-top">
                    <div className="cp-off-icon">◈</div>
                    {o.format&&<div className="cp-off-fmt">{o.format}</div>}
                  </div>
                  <div className="cp-off-title">{o.title}</div>
                  {o.description&&<div className="cp-off-desc">{o.description}</div>}
                  <div className="cp-off-meta">
                    {o.duration_label&&<span>&#9201; {o.duration_label}</span>}
                    {o.max_students&&<span>&#128101; Max {o.max_students}</span>}
                  </div>
                  <div className="cp-off-foot">
                    <div className="cp-off-price">{fmtMoney(o.price, o.currency||ws.currency)}</div>
                    <button className="cp-btn-gold" onClick={()=>openLearn(o)}>Enroll</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ — contextual per tab ───────────── */}
      <section id="cp-faq" className="cp-section cp-section-alt">
        <div className="cp-inner cp-faq-inner">
          <div className="cp-eyebrow">Good to Know</div>
          <h2 className="cp-heading">Good <em>questions</em></h2>
          <div className="cp-faq-grid">
            {faqItems.map(item=>(
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
          {socials.map(({k,icon,label,href})=>(
            <a key={k} href={href} target="_blank" rel="noreferrer" className="cp-footer-social" title={label}>{icon}</a>
          ))}
        </div>
        <div className="cp-footer-right">Powered by <a href="https://beorganized.io" target="_blank" rel="noreferrer">beorganized.io</a></div>
      </footer>

      {/* ── SHOP MODAL ────────────────────────── */}
      {shopModal && (
        <div className="cp-overlay" onClick={e=>{if(e.target.classList.contains('cp-overlay')){setShopModal(null);setShopDone(null)}}}>
          <div className="cp-modal">
            <button className="cp-modal-close" onClick={()=>{setShopModal(null);setShopDone(null)}}>✕</button>
            {!shopDone?(
              <>
                <div className="cp-modal-title">Order — {shopModal.name}</div>
                <div className="cp-modal-price">{fmtMoney(shopModal.price, shopModal.currency||ws.currency)}</div>
                <div className="cp-2col">
                  <div className="cp-fg"><label className="cp-fl">First Name *</label><input className="cp-fi" type="text" placeholder="Marie" value={shopForm.fname} onChange={e=>setShopForm(f=>({...f,fname:e.target.value}))}/></div>
                  <div className="cp-fg"><label className="cp-fl">Last Name *</label><input className="cp-fi" type="text" placeholder="Dupont" value={shopForm.lname} onChange={e=>setShopForm(f=>({...f,lname:e.target.value}))}/></div>
                </div>
                <div className="cp-fg"><label className="cp-fl">Email *</label><input className="cp-fi" type="email" placeholder="marie@example.com" value={shopForm.email} onChange={e=>setShopForm(f=>({...f,email:e.target.value}))}/></div>
                <div className="cp-fg"><label className="cp-fl">Phone *</label><input className="cp-fi" type="tel" placeholder="+1 (514) 000-0000" value={shopForm.phone} onChange={e=>setShopForm(f=>({...f,phone:e.target.value}))}/></div>
                <div className="cp-fg"><label className="cp-fl">Quantity</label><select className="cp-fsel" value={shopForm.qty} onChange={e=>setShopForm(f=>({...f,qty:parseInt(e.target.value)}))}>
                  {[1,2,3,4,5].filter(q=>q<=shopModal.stock).map(q=><option key={q} value={q}>{q}</option>)}
                </select></div>
                <button className="cp-btn-gold cp-btn-block" onClick={submitOrder} disabled={shopSub}>{shopSub?'Placing order…':'Place Order →'}</button>
                <p className="cp-modal-note">{firstName} will contact you with payment and delivery details.</p>
              </>
            ):(
              <div className="cp-success" style={{padding:'20px 0 4px'}}>
                <div className="cp-success-icon">✓</div>
                <h3 className="cp-success-title" style={{fontSize:22}}>Order placed!</h3>
                <p className="cp-success-sub">{firstName} received your order for <strong>{shopDone.productName}</strong>.<br/>Confirmation to {shopDone.email}.</p>
                <button className="cp-btn-ghost" onClick={()=>{setShopModal(null);setShopDone(null)}}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── LEARN MODAL ───────────────────────── */}
      {learnModal && (
        <div className="cp-overlay" onClick={e=>{if(e.target.classList.contains('cp-overlay')){setLearnModal(null);setLearnDone(null)}}}>
          <div className="cp-modal">
            <button className="cp-modal-close" onClick={()=>{setLearnModal(null);setLearnDone(null)}}>✕</button>
            {!learnDone?(
              <>
                <div className="cp-modal-title">Enroll — {learnModal.title}</div>
                {learnModal.price>0&&<div className="cp-modal-price">{fmtMoney(learnModal.price, learnModal.currency||ws.currency)}</div>}
                {learnModal.description&&<p className="cp-modal-desc">{learnModal.description}</p>}
                <div className="cp-2col">
                  <div className="cp-fg"><label className="cp-fl">First Name *</label><input className="cp-fi" type="text" placeholder="Marie" value={learnForm.fname} onChange={e=>setLearnForm(f=>({...f,fname:e.target.value}))}/></div>
                  <div className="cp-fg"><label className="cp-fl">Last Name *</label><input className="cp-fi" type="text" placeholder="Dupont" value={learnForm.lname} onChange={e=>setLearnForm(f=>({...f,lname:e.target.value}))}/></div>
                </div>
                <div className="cp-fg"><label className="cp-fl">Email *</label><input className="cp-fi" type="email" placeholder="marie@example.com" value={learnForm.email} onChange={e=>setLearnForm(f=>({...f,email:e.target.value}))}/></div>
                <div className="cp-fg"><label className="cp-fl">Phone *</label><input className="cp-fi" type="tel" placeholder="+1 (514) 000-0000" value={learnForm.phone} onChange={e=>setLearnForm(f=>({...f,phone:e.target.value}))}/></div>
                <button className="cp-btn-gold cp-btn-block" onClick={submitEnrollment} disabled={learnSub}>{learnSub?'Enrolling…':'Confirm Enrollment →'}</button>
                <p className="cp-modal-note">{firstName} will contact you with payment and session details.</p>
              </>
            ):(
              <div className="cp-success" style={{padding:'20px 0 4px'}}>
                <div className="cp-success-icon">✓</div>
                <h3 className="cp-success-title" style={{fontSize:22}}>Enrolled!</h3>
                <p className="cp-success-sub">You&apos;re registered for <strong>{learnDone.title}</strong>.<br/>Confirmation to {learnDone.email}.</p>
                <button className="cp-btn-ghost" onClick={()=>{setLearnModal(null);setLearnDone(null)}}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --cp-bg:#F9F5EF; --cp-bg2:#F1EAE0; --cp-card:#FFFFFF;
  --cp-gold:#C9A84C; --cp-gold-d:#B89030;
  --cp-gold-dim:rgba(201,168,76,0.1); --cp-gold-bdr:rgba(201,168,76,0.28);
  --cp-tx:#1C1814; --cp-tx-m:#9A8E7C; --cp-tx-s:#5A5040;
  --cp-bdr:rgba(30,18,8,0.08); --cp-bdr-m:rgba(30,18,8,0.14);
  --cp-sh-sm:0 1px 8px rgba(30,18,8,0.06); --cp-sh:0 2px 20px rgba(30,18,8,0.09);
  --cp-dk:#0D0A06; --cp-dk2:#1A1410; --cp-dk3:#221A10;
  --cp-err:#b94040; --cp-ok:#3a9e6a;
}
html{scroll-behavior:smooth}
body{background:var(--cp-bg);color:var(--cp-tx);font-family:'DM Sans',sans-serif;overflow-x:hidden}
body::before{content:'';position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E");pointer-events:none;z-index:9999;opacity:.6;mix-blend-mode:multiply}

/* NAV */
.cp-nav{position:fixed;top:0;left:0;right:0;z-index:600;padding:14px 40px;display:flex;align-items:center;justify-content:space-between;background:rgba(10,8,4,0.92);backdrop-filter:blur(16px);border-bottom:1px solid rgba(201,168,76,0.08)}
.cp-logo{font-family:'Playfair Display',serif;font-size:18px;letter-spacing:.04em;color:var(--cp-gold);white-space:nowrap}
.cp-logo span{color:rgba(245,240,232,0.4);font-size:11px;margin-left:7px;font-family:'DM Sans',sans-serif;font-weight:300}
.cp-nav-right{display:flex;align-items:center;gap:4px}
.cp-nav-tab{background:transparent;border:none;color:rgba(245,240,232,0.5);font-family:'DM Sans',sans-serif;font-size:12px;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;padding:8px 16px;border-radius:2px;transition:all .2s}
.cp-nav-tab:hover{color:var(--cp-gold)}
.cp-nav-tab.active{background:rgba(201,168,76,0.15);color:var(--cp-gold);border:1px solid rgba(201,168,76,0.2)}

/* BUTTONS (shared) */
.cp-btn-gold{background:var(--cp-gold);color:var(--cp-dk);border:none;padding:12px 26px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;letter-spacing:.07em;cursor:pointer;border-radius:2px;text-transform:uppercase;transition:all .25s;display:inline-block}
.cp-btn-gold:hover{background:#E0BA5C;transform:translateY(-1px);box-shadow:0 6px 22px rgba(201,168,76,.3)}
.cp-btn-gold:disabled{background:rgba(245,240,232,0.15);color:rgba(245,240,232,0.3);cursor:not-allowed;transform:none;box-shadow:none}
.cp-btn-ghost{background:transparent;color:rgba(245,240,232,0.6);border:1px solid rgba(245,240,232,0.2);padding:12px 22px;font-family:'DM Sans',sans-serif;font-size:12px;letter-spacing:.07em;cursor:pointer;border-radius:2px;text-transform:uppercase;transition:all .25s}
.cp-btn-ghost:hover{border-color:rgba(201,168,76,.35);color:var(--cp-gold)}

/* DARK WRAP — covers hero + tabs bar */
.cp-dark-wrap{background:linear-gradient(160deg, var(--cp-dk2) 0%, var(--cp-dk) 60%, #090705 100%);position:relative}

/* HERO */
.cp-hero{min-height:100vh;display:grid;grid-template-columns:52% 48%;position:relative;overflow:hidden}

/* Hero left — text on dark bg */
.cp-hero-left{display:flex;flex-direction:column;justify-content:center;padding:130px 64px 72px;position:relative;z-index:2}
.cp-hero-left::after{content:'';position:absolute;right:0;top:8%;bottom:8%;width:1px;background:linear-gradient(to bottom,transparent,rgba(201,168,76,0.12),transparent)}

.cp-hero-tag{display:inline-flex;align-items:center;gap:8px;background:rgba(201,168,76,0.1);border:1px solid rgba(201,168,76,0.22);border-radius:100px;padding:6px 16px 6px 10px;font-size:11px;color:var(--cp-gold);letter-spacing:.12em;text-transform:uppercase;margin-bottom:32px;width:fit-content;animation:cpFadeUp .6s ease both}
.cp-tag-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--cp-gold);animation:cpPulse 2s infinite;flex-shrink:0}
@keyframes cpPulse{0%,100%{opacity:1}50%{opacity:.2}}
@keyframes cpFadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes cpScaleIn{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}

.cp-hero-name{font-family:'Playfair Display',serif;font-size:clamp(48px,5.5vw,72px);font-weight:500;line-height:1.0;margin-bottom:12px;color:#F5F0E8;animation:cpFadeUp .6s .08s ease both}
.cp-hero-name em{font-style:italic;color:var(--cp-gold)}
.cp-hero-title{font-size:12px;color:rgba(245,240,232,0.5);letter-spacing:.2em;text-transform:uppercase;margin-bottom:10px;animation:cpFadeUp .6s .15s ease both}
.cp-hero-sub{font-size:13px;color:rgba(245,240,232,0.4);margin-bottom:20px;animation:cpFadeUp .6s .2s ease both}
.cp-gold-dot{color:var(--cp-gold);margin-right:5px}
.cp-hero-bio{font-size:14px;line-height:1.85;color:rgba(245,240,232,0.55);max-width:380px;margin-bottom:28px;font-weight:300;animation:cpFadeUp .6s .22s ease both}
.cp-hero-stats{display:flex;gap:36px;margin-bottom:26px;animation:cpFadeUp .6s .28s ease both}
.cp-stat{display:flex;flex-direction:column;gap:3px}
.cp-stat-n{font-family:'Playfair Display',serif;font-size:28px;color:var(--cp-gold);font-weight:500;line-height:1}
.cp-stat-l{font-size:10px;color:rgba(245,240,232,0.4);letter-spacing:.12em;text-transform:uppercase}
.cp-socials{display:flex;gap:9px;margin-bottom:28px;animation:cpFadeUp .6s .33s ease both}
.cp-social{width:34px;height:34px;border-radius:50%;border:1px solid rgba(245,240,232,0.15);display:flex;align-items:center;justify-content:center;color:rgba(245,240,232,0.45);text-decoration:none;transition:all .22s}
.cp-social:hover{border-color:rgba(201,168,76,.4);color:var(--cp-gold);background:rgba(201,168,76,.08);transform:translateY(-2px)}
.cp-hero-cta{display:flex;gap:10px;animation:cpFadeUp .6s .38s ease both}

/* Hero right */
.cp-hero-right{position:relative;overflow:hidden}
.cp-hero-photo{position:absolute;inset:0;background:linear-gradient(150deg,#1A1208,#0D0A06);display:flex;align-items:center;justify-content:center}
.cp-cover-img{width:100%;height:100%;object-fit:cover;filter:brightness(.65) saturate(.75)}
.cp-portrait-wrap{position:relative;width:260px;height:400px}
.cp-p-glow{position:absolute;top:-30px;left:50%;transform:translateX(-50%);width:200px;height:200px;background:radial-gradient(circle,rgba(201,168,76,.07) 0%,transparent 70%);border-radius:50%}
.cp-p-head{position:absolute;top:0;left:50%;transform:translateX(-50%);width:100px;height:110px;background:linear-gradient(160deg,#2e2416,#1a1208);border-radius:50%;border:1px solid rgba(201,168,76,.09)}
.cp-p-neck{position:absolute;bottom:290px;left:50%;transform:translateX(-50%);width:38px;height:52px;background:linear-gradient(160deg,#2e2416,#1a1208)}
.cp-p-body{position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:180px;height:300px;background:linear-gradient(160deg,#261e0e,#130e06);border-radius:90px 90px 60px 60px;border:1px solid rgba(201,168,76,.07)}
.cp-p-accent{position:absolute;top:48%;left:50%;transform:translate(-50%,-50%);font-size:16px;color:rgba(201,168,76,.13);letter-spacing:12px}
.cp-hero-overlay{position:absolute;inset:0;background:linear-gradient(to right,rgba(13,10,6,.35) 0%,transparent 40%),linear-gradient(to top,var(--cp-dk) 0%,transparent 35%)}
.cp-fc{position:absolute;background:rgba(10,8,4,.92);border:1px solid rgba(201,168,76,.18);border-radius:3px;padding:14px 18px;backdrop-filter:blur(20px);transition:all .4s}
.cp-fc-1{bottom:68px;left:-24px;min-width:170px}
.cp-fc-2{top:38%;right:24px}
.cp-fc-lbl{font-size:9px;color:rgba(201,168,76,.55);letter-spacing:.18em;text-transform:uppercase;margin-bottom:4px}
.cp-fc-val{font-family:'Playfair Display',serif;font-size:17px;color:#E8C97A}
.cp-fc-sub{font-size:11px;color:rgba(201,168,76,.4);margin-top:3px}

/* TABS BAR — at bottom of dark wrap, becomes sticky */
.cp-tabs-bar{display:flex;position:sticky;top:53px;z-index:500;background:rgba(8,6,3,0.97);backdrop-filter:blur(20px);border-top:1px solid rgba(201,168,76,0.1);border-bottom:1px solid rgba(201,168,76,0.06)}
.cp-tab-btn{flex:1;background:transparent;border:none;color:rgba(245,240,232,0.4);font-family:'DM Sans',sans-serif;font-size:12px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;padding:18px 12px;border-bottom:2px solid transparent;transition:all .25s;font-weight:400}
.cp-tab-btn:hover{color:rgba(245,240,232,0.7)}
.cp-tab-btn.active{color:var(--cp-gold);border-bottom-color:var(--cp-gold);background:rgba(201,168,76,.05)}

/* CONTENT SECTIONS — light ivory */
.cp-section{padding:80px 64px;background:var(--cp-bg)}
.cp-section-alt{background:var(--cp-bg2)}
.cp-inner{max-width:1100px;margin:0 auto}
.cp-eyebrow{font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:var(--cp-gold-d);margin-bottom:12px}
.cp-heading{font-family:'Playfair Display',serif;font-size:clamp(28px,3.2vw,40px);font-weight:500;line-height:1.15;color:var(--cp-tx);margin-bottom:48px}
.cp-heading em{font-style:italic;color:var(--cp-gold-d)}

/* BOOKING CONTENT */
.cp-btn-next{background:var(--cp-gold-d);color:#FAF7F0;border:none;padding:12px 30px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;letter-spacing:.06em;cursor:pointer;border-radius:2px;transition:all .25s}
.cp-btn-next:hover{background:var(--cp-gold);transform:translateY(-1px);box-shadow:0 8px 24px rgba(184,144,48,.22)}
.cp-btn-next:disabled{background:var(--cp-bdr-m);color:var(--cp-tx-m);cursor:not-allowed;transform:none;box-shadow:none}
.cp-btn-back{background:transparent;color:var(--cp-tx-m);border:1px solid var(--cp-bdr-m);padding:11px 20px;font-family:'DM Sans',sans-serif;font-size:12px;letter-spacing:.06em;cursor:pointer;border-radius:2px;transition:all .2s;text-transform:uppercase}
.cp-btn-back:hover{color:var(--cp-tx-s)}

.cp-progress{display:flex;align-items:center;margin-bottom:44px}
.cp-wp{display:flex;align-items:center;gap:9px;flex-shrink:0}
.cp-wp-n{width:27px;height:27px;border-radius:50%;border:1px solid var(--cp-bdr-m);background:var(--cp-card);display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--cp-tx-m);transition:all .3s;font-weight:500;box-shadow:var(--cp-sh-sm)}
.cp-wp-l{font-size:11px;color:var(--cp-tx-m);letter-spacing:.05em;white-space:nowrap;transition:color .3s}
.cp-wp.active .cp-wp-n{border-color:var(--cp-gold-d);background:rgba(184,144,48,.1);color:var(--cp-gold-d)}
.cp-wp.active .cp-wp-l{color:var(--cp-tx-s)}
.cp-wp.done .cp-wp-n{background:var(--cp-gold-d);border-color:var(--cp-gold-d);color:#FAF7F0;font-weight:700}
.cp-wp.done .cp-wp-l{color:var(--cp-gold-d)}
.cp-wl{flex:1;height:1px;background:var(--cp-bdr-m);margin:0 14px;transition:background .4s}
.cp-wl.done{background:var(--cp-gold-d)}

.cp-wiz-layout{display:grid;grid-template-columns:240px 1fr;gap:48px;align-items:start}
.cp-summary{position:sticky;top:120px;background:var(--cp-card);border:1px solid var(--cp-bdr);border-radius:3px;padding:22px;box-shadow:var(--cp-sh)}
.cp-sum-title{font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:var(--cp-tx-m);margin-bottom:16px}
.cp-sum-row{margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid var(--cp-bdr)}
.cp-sum-row:last-of-type{border-bottom:none;margin-bottom:0;padding-bottom:0}
.cp-sum-k{font-size:9px;color:var(--cp-tx-m);letter-spacing:.14em;text-transform:uppercase;margin-bottom:4px}
.cp-sum-v{font-family:'Playfair Display',serif;font-size:14px;color:var(--cp-tx);line-height:1.3}
.cp-sum-s{font-size:11px;color:var(--cp-tx-m);margin-top:2px}
.cp-sum-e{font-size:12px;color:rgba(30,18,8,.2)}
.cp-deposit{margin-top:14px;padding:11px 13px;background:rgba(184,144,48,.08);border:1px solid rgba(184,144,48,.22);border-radius:2px;font-size:11px;color:var(--cp-tx-s);line-height:1.65}
.cp-deposit strong{color:var(--cp-gold-d)}

.cp-step-note{font-size:13px;color:var(--cp-tx-m);font-weight:300;margin-bottom:22px;line-height:1.6}
.cp-s1-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.cp-s1-card{background:var(--cp-card);border:1px solid var(--cp-bdr);border-radius:2px;padding:18px;cursor:pointer;transition:all .2s;position:relative;box-shadow:var(--cp-sh-sm)}
.cp-s1-card:hover{border-color:rgba(184,144,48,.3);box-shadow:var(--cp-sh)}
.cp-s1-card.sel{border-color:var(--cp-gold-d);box-shadow:0 0 0 2px rgba(184,144,48,.12),var(--cp-sh)}
.cp-s1-chk{position:absolute;top:10px;right:10px;width:15px;height:15px;border-radius:50%;border:1px solid var(--cp-bdr-m);display:flex;align-items:center;justify-content:center;font-size:9px;transition:all .2s;color:transparent}
.cp-s1-card.sel .cp-s1-chk{background:var(--cp-gold-d);border-color:var(--cp-gold-d);color:#FAF7F0;font-weight:700}
.cp-s1-icon{font-size:17px;color:var(--cp-tx-m);margin-bottom:9px}
.cp-s1-card.sel .cp-s1-icon{color:var(--cp-gold-d)}
.cp-s1-name{font-family:'Playfair Display',serif;font-size:14px;margin-bottom:4px;color:var(--cp-tx)}
.cp-s1-meta{font-size:11px;color:var(--cp-tx-m)}
.cp-s1-price{margin-top:9px;font-family:'Playfair Display',serif;font-size:15px;color:var(--cp-gold-d)}

.cp-addons{margin-top:22px;padding-top:20px;border-top:1px solid var(--cp-bdr)}
.cp-addons-lbl{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--cp-tx-m);margin-bottom:11px}
.cp-chips{display:flex;flex-wrap:wrap;gap:7px}
.cp-chip{padding:6px 13px;border:1px solid var(--cp-bdr-m);border-radius:100px;font-size:12px;color:var(--cp-tx-s);cursor:pointer;transition:all .2s;background:var(--cp-card)}
.cp-chip:hover{border-color:rgba(184,144,48,.3);color:var(--cp-gold-d)}
.cp-chip.on{border-color:var(--cp-gold-d);background:rgba(184,144,48,.08);color:var(--cp-gold-d)}

.cp-cal-wrap{background:var(--cp-card);border:1px solid var(--cp-bdr);border-radius:3px;overflow:hidden;box-shadow:var(--cp-sh-sm)}
.cp-cal-head{padding:14px 20px;border-bottom:1px solid var(--cp-bdr);display:flex;align-items:center;justify-content:space-between}
.cp-cal-month{font-family:'Playfair Display',serif;font-size:15px;color:var(--cp-tx)}
.cp-cal-nav{display:flex;gap:5px}
.cp-cal-btn{width:28px;height:28px;border:1px solid var(--cp-bdr-m);background:transparent;color:var(--cp-tx-m);cursor:pointer;border-radius:2px;font-size:13px;transition:all .2s}
.cp-cal-btn:hover{border-color:rgba(184,144,48,.3);color:var(--cp-gold-d);background:rgba(184,144,48,.06)}
.cp-cal-btn:disabled{opacity:.3;cursor:default;pointer-events:none}
.cp-dnames{display:grid;grid-template-columns:repeat(7,1fr);padding:9px 18px 3px}
.cp-dname{text-align:center;font-size:9px;color:var(--cp-tx-m);letter-spacing:.12em;text-transform:uppercase}
.cp-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);padding:3px 18px 18px;gap:2px}
.cp-day{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:12px;border-radius:2px;cursor:pointer;transition:all .15s;color:var(--cp-tx-m);position:relative;user-select:none}
.cp-day.avail{color:var(--cp-tx);font-weight:500;cursor:pointer}
.cp-day.avail::after{content:'';position:absolute;bottom:2px;left:50%;transform:translateX(-50%);width:3px;height:3px;border-radius:50%;background:var(--cp-gold-d)}
.cp-day.avail:hover{background:rgba(184,144,48,.08);color:var(--cp-gold-d)}
.cp-day.today{border:1px solid rgba(184,144,48,.25);color:var(--cp-gold-d)}
.cp-day.sel{background:var(--cp-gold-d)!important;color:#FAF7F0!important;font-weight:600}
.cp-day.sel::after{display:none}
.cp-day.past,.cp-day.off,.cp-day.empty{color:rgba(30,18,8,.18);cursor:default}

.cp-slots-wrap{margin-top:16px}
.cp-slots-lbl{font-size:10px;color:var(--cp-tx-m);letter-spacing:.14em;text-transform:uppercase;margin-bottom:9px}
.cp-slots-empty{font-size:13px;color:var(--cp-tx-m);padding:18px 0;font-style:italic}
.cp-slots-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:5px}
.cp-slot{padding:8px 5px;text-align:center;border:1px solid var(--cp-bdr);background:var(--cp-card);color:var(--cp-tx-m);font-size:12px;cursor:pointer;border-radius:2px;transition:all .15s}
.cp-slot.avail{color:var(--cp-tx-s)}
.cp-slot.avail:hover{border-color:rgba(184,144,48,.3);color:var(--cp-gold-d);background:rgba(184,144,48,.06)}
.cp-slot.sel{border-color:var(--cp-gold-d);background:rgba(184,144,48,.08);color:var(--cp-gold-d);font-weight:500}
.cp-slot.booked{color:rgba(30,18,8,.2);cursor:not-allowed;border-color:transparent;background:var(--cp-bg2)}

.cp-2col{display:grid;grid-template-columns:1fr 1fr;gap:11px}
.cp-fg{display:flex;flex-direction:column;gap:5px;margin-bottom:12px}
.cp-fl{font-size:10px;color:var(--cp-tx-m);letter-spacing:.12em;text-transform:uppercase}
.cp-fi,.cp-fsel{background:var(--cp-card);border:1px solid var(--cp-bdr-m);color:var(--cp-tx);padding:11px 14px;font-family:'DM Sans',sans-serif;font-size:14px;border-radius:2px;outline:none;transition:border-color .2s,box-shadow .2s;width:100%}
.cp-fi:focus,.cp-fsel:focus{border-color:rgba(184,144,48,.35);box-shadow:0 0 0 3px rgba(184,144,48,.07)}
.cp-fi.err{border-color:var(--cp-err)}
.cp-fi::placeholder{color:rgba(30,18,8,.18)}
.cp-fsel{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%239A8E7C' d='M5 7L1 2h8z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 13px center;background-color:var(--cp-card);cursor:pointer}
.cp-ferr{font-size:11px;color:var(--cp-err)}
.cp-policy{padding:12px 14px;background:rgba(184,144,48,.07);border:1px solid rgba(184,144,48,.2);border-radius:2px;font-size:11px;color:var(--cp-tx-s);line-height:1.65;margin-bottom:4px}
.cp-policy a{color:var(--cp-gold-d);text-decoration:none;font-weight:500}
.cp-nav-row{display:flex;justify-content:space-between;align-items:center;margin-top:24px;padding-top:20px;border-top:1px solid var(--cp-bdr)}

/* SUCCESS */
.cp-success{text-align:center;padding:56px 32px 40px;animation:cpFadeUp .5s ease both}
.cp-success-icon{width:64px;height:64px;border-radius:50%;background:rgba(58,158,106,.08);border:1px solid rgba(58,158,106,.22);display:flex;align-items:center;justify-content:center;margin:0 auto 22px;font-size:24px;color:var(--cp-ok);animation:cpScaleIn .4s .1s ease both}
.cp-success-title{font-family:'Playfair Display',serif;font-size:30px;margin-bottom:10px;color:var(--cp-tx)}
.cp-success-sub{font-size:13px;color:var(--cp-tx-s);font-weight:300;line-height:1.7;margin-bottom:28px}
.cp-success-card{background:var(--cp-card);border:1px solid var(--cp-bdr);border-radius:3px;padding:20px 24px;max-width:380px;margin:0 auto 24px;text-align:left;box-shadow:var(--cp-sh)}
.cp-sc-row{display:flex;justify-content:space-between;align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--cp-bdr);font-size:13px;gap:14px}
.cp-sc-row:last-child{border-bottom:none}
.cp-sc-k{color:var(--cp-tx-m);flex-shrink:0}
.cp-sc-v{color:var(--cp-tx-s);font-weight:500;text-align:right}

/* PORTFOLIO (conditional) */
.cp-portfolio-grid{display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:220px 220px;gap:6px}
.cp-pf-item{position:relative;overflow:hidden;border-radius:3px}
.cp-pf-main{grid-column:1/3;grid-row:1/3}
.cp-pf-item img{width:100%;height:100%;object-fit:cover;transition:transform .5s}
.cp-pf-item:hover img{transform:scale(1.04)}
.cp-pf-caption{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to top,rgba(0,0,0,.65) 0%,transparent 100%);color:#fff;font-size:11px;padding:16px 12px 10px;letter-spacing:.06em;opacity:0;transition:opacity .3s}
.cp-pf-item:hover .cp-pf-caption{opacity:1}

/* SHOP */
.cp-prod-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.cp-prod-card{background:var(--cp-card);border:1px solid var(--cp-bdr);border-radius:3px;overflow:hidden;box-shadow:var(--cp-sh-sm);transition:box-shadow .25s,transform .25s}
.cp-prod-card:hover{box-shadow:var(--cp-sh);transform:translateY(-2px)}
.cp-prod-img{position:relative;aspect-ratio:1;background:var(--cp-bg2);display:flex;align-items:center;justify-content:center;overflow:hidden}
.cp-prod-img img{width:100%;height:100%;object-fit:cover}
.cp-prod-ph{font-size:48px;color:rgba(184,144,48,.25)}
.cp-prod-badge{position:absolute;top:10px;right:10px;background:var(--cp-gold-d);color:#FAF7F0;font-size:10px;letter-spacing:.08em;padding:4px 10px;border-radius:100px;text-transform:uppercase}
.cp-prod-body{padding:20px}
.cp-prod-name{font-family:'Playfair Display',serif;font-size:17px;margin-bottom:6px;color:var(--cp-tx)}
.cp-prod-desc{font-size:12px;color:var(--cp-tx-m);line-height:1.6;margin-bottom:14px;font-weight:300}
.cp-prod-foot{display:flex;align-items:center;justify-content:space-between}
.cp-prod-price{font-family:'Playfair Display',serif;font-size:20px;color:var(--cp-gold-d)}

/* LEARN */
.cp-off-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
.cp-off-card{background:var(--cp-card);border:1px solid var(--cp-bdr);border-radius:3px;padding:28px;box-shadow:var(--cp-sh-sm);transition:box-shadow .25s,transform .25s}
.cp-off-card:hover{box-shadow:var(--cp-sh);transform:translateY(-2px)}
.cp-off-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.cp-off-icon{width:36px;height:36px;border:1px solid rgba(184,144,48,.25);border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:15px;color:var(--cp-gold-d);background:rgba(184,144,48,.07)}
.cp-off-fmt{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--cp-tx-m);border:1px solid var(--cp-bdr-m);padding:4px 10px;border-radius:100px}
.cp-off-title{font-family:'Playfair Display',serif;font-size:19px;margin-bottom:8px;color:var(--cp-tx)}
.cp-off-desc{font-size:13px;color:var(--cp-tx-m);line-height:1.6;margin-bottom:14px;font-weight:300}
.cp-off-meta{display:flex;gap:16px;font-size:11px;color:var(--cp-tx-m);margin-bottom:18px}
.cp-off-foot{display:flex;align-items:center;justify-content:space-between}
.cp-off-price{font-family:'Playfair Display',serif;font-size:22px;color:var(--cp-gold-d)}

/* FAQ */
.cp-faq-inner{max-width:900px}
.cp-faq-grid{display:grid;grid-template-columns:1fr 1fr;gap:36px 64px;margin-top:44px}
.cp-faq-q{font-family:'Playfair Display',serif;font-size:16px;margin-bottom:9px;color:var(--cp-tx)}
.cp-faq-a{font-size:13px;color:var(--cp-tx-m);line-height:1.75;font-weight:300}

/* FOOTER */
.cp-footer{padding:28px 64px;border-top:1px solid var(--cp-bdr);background:var(--cp-bg2);display:flex;align-items:center;justify-content:space-between;gap:20px}
.cp-footer-logo{font-family:'Playfair Display',serif;font-size:16px;color:var(--cp-gold-d)}
.cp-footer-socials{display:flex;gap:7px}
.cp-footer-social{width:30px;height:30px;border-radius:50%;border:1px solid var(--cp-bdr-m);display:flex;align-items:center;justify-content:center;color:var(--cp-tx-m);text-decoration:none;transition:all .2s}
.cp-footer-social:hover{border-color:rgba(184,144,48,.3);color:var(--cp-gold-d);background:rgba(184,144,48,.07)}
.cp-footer-right{font-size:11px;color:var(--cp-tx-m)}
.cp-footer-right a{color:var(--cp-gold-d);text-decoration:none;font-weight:500}

/* MODALS */
.cp-overlay{position:fixed;inset:0;background:rgba(10,8,4,.6);z-index:800;display:flex;align-items:flex-end;justify-content:center;backdrop-filter:blur(6px)}
.cp-modal{background:var(--cp-card);border-radius:14px 14px 0 0;padding:28px 28px 40px;width:100%;max-width:480px;max-height:88vh;overflow-y:auto;position:relative;animation:cpFadeUp .3s ease}
.cp-modal-close{position:absolute;top:16px;right:16px;width:28px;height:28px;border-radius:50%;border:1px solid var(--cp-bdr-m);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;color:var(--cp-tx-m);background:var(--cp-card);transition:all .2s}
.cp-modal-close:hover{background:var(--cp-bg2);color:var(--cp-tx)}
.cp-modal-title{font-family:'Playfair Display',serif;font-size:20px;margin-bottom:6px;margin-right:32px;color:var(--cp-tx)}
.cp-modal-price{font-family:'Playfair Display',serif;font-size:22px;color:var(--cp-gold-d);margin-bottom:20px}
.cp-modal-desc{font-size:13px;color:var(--cp-tx-m);line-height:1.65;margin-bottom:18px;font-weight:300}
.cp-modal-note{font-size:11px;color:var(--cp-tx-m);margin-top:12px;line-height:1.6}
.cp-btn-block{width:100%;margin-top:4px;text-align:center;display:block;padding:13px}

/* MOBILE */
@media(max-width:960px){
  .cp-nav{padding:12px 20px}
  .cp-logo span{display:none}
  .cp-nav-tab{font-size:11px;padding:7px 10px;letter-spacing:.04em}
  .cp-hero{grid-template-columns:1fr;min-height:auto}
  .cp-hero-right{height:40vh;order:-1}
  .cp-hero-left{padding:28px 24px 52px}
  .cp-hero-left::after{display:none}
  .cp-hero-name{font-size:44px}
  .cp-section{padding:52px 24px}
  .cp-wiz-layout{grid-template-columns:1fr}
  .cp-summary{position:static}
  .cp-s1-grid{grid-template-columns:1fr}
  .cp-slots-grid{grid-template-columns:repeat(3,1fr)}
  .cp-2col{grid-template-columns:1fr}
  .cp-prod-grid{grid-template-columns:1fr 1fr}
  .cp-off-grid{grid-template-columns:1fr}
  .cp-faq-grid{grid-template-columns:1fr;gap:24px}
  .cp-portfolio-grid{grid-template-columns:1fr 1fr;grid-template-rows:none}
  .cp-pf-main{grid-column:1/3;height:240px}
  .cp-pf-item{height:180px}
  .cp-footer{flex-direction:column;gap:10px;text-align:center;padding:24px}
  .cp-tabs-bar{top:49px}
}
@media(max-width:480px){
  .cp-prod-grid{grid-template-columns:1fr}
  .cp-hero-name{font-size:38px}
  .cp-hero-stats{gap:20px}
}
`
