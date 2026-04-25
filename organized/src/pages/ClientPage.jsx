/**
 * ClientBooking.jsx — Public booking page · Warm Ivory premium theme
 * Route:  /book/:slug   |   Auth: Anonymous
 *
 * Before deploying:
 *   1. Run ClientBooking_rls.sql         (anon RLS policies)
 *   2. Run ClientBooking_social_migration.sql  (adds facebook + twitter columns)
 *
 * Router setup:
 *   import ClientBooking from './pages/ClientBooking'
 *   <Route path="/book/:slug" element={<ClientBooking />} />
 */

import { useState, useEffect, useLayoutEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'

// ─── CONSTANTS ──────────────────────────────────────────────────────────────

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const GALLERY_ITEMS = [
  { glyph:'✦', label:'Color Work',    cls:'gi-1' },
  { glyph:'❋', label:'Natural Hair',  cls:'gi-2' },
  { glyph:'◆', label:'Precision Cut', cls:'gi-3' },
  { glyph:'◇', label:'Bridal',        cls:'gi-4' },
  { glyph:'◈', label:'Treatments',    cls:'gi-5' },
]

// ─── SOCIAL ICONS (inline SVG) ──────────────────────────────────────────────

const Icons = {
  instagram: (<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>),
  tiktok:    (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.14 8.14 0 0 0 4.77 1.52V6.75a4.85 4.85 0 0 1-1-.06z"/></svg>),
  facebook:  (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>),
  twitter:   (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>),
  globe:     (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><line x1="2" y1="12" x2="22" y2="12"/></svg>),
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

function pad(n){ return String(n).padStart(2,'0') }
function toMinutes(t){ const [h,m]=t.split(':').map(Number); return h*60+m }
function fromMinutes(m){ return `${pad(Math.floor(m/60))}:${pad(m%60)}` }
function formatTime12h(t){ const [h,m]=t.split(':').map(Number); const p=h>=12?'PM':'AM'; const h12=h===0?12:h>12?h-12:h; return `${h12}:${pad(m)} ${p}` }
function formatDuration(mins){ if(!mins)return''; if(mins<60)return`${mins} min`; const h=Math.floor(mins/60),m=mins%60; return m?`${h}h ${m}min`:`${h} hr` }
function formatPrice(svc){ if(svc.is_free||svc.price===0)return'Free'; return`$${Math.round(svc.price)} & up` }

function getServiceIcon(name=''){
  const n=name.toLowerCase()
  if(n.includes('color')||n.includes('balayage')||n.includes('highlight'))return'✦'
  if(n.includes('cut')||n.includes('coupe'))return'◆'
  if(n.includes('natural')||n.includes('texture')||n.includes('loc'))return'❋'
  if(n.includes('keratin')||n.includes('lissage'))return'◈'
  if(n.includes('bridal')||n.includes('wedding')||n.includes('mariée'))return'◇'
  if(n.includes('consult'))return'○'
  return'◉'
}

function getAddons(name=''){
  const n=name.toLowerCase()
  if(n.includes('color')||n.includes('balayage'))return['Toning +$40','Deep Condition +$30','Olaplex +$50']
  if(n.includes('cut'))return['Blowout +$35','Deep Treatment +$45']
  if(n.includes('natural')||n.includes('texture'))return['Scalp Massage +$20','Steam Treatment +$30']
  if(n.includes('keratin'))return['Express Blowout +$40','Olaplex +$50']
  if(n.includes('bridal'))return['Trial Run +$120','Bridesmaid Styling +$85/person']
  return[]
}

function buildSocialLinks(ws){
  const links=[]
  if(ws.instagram) links.push({key:'instagram',icon:Icons.instagram,label:'Instagram',href:`https://instagram.com/${ws.instagram.replace('@','')}`})
  if(ws.tiktok)    links.push({key:'tiktok',icon:Icons.tiktok,label:'TikTok',href:`https://tiktok.com/@${ws.tiktok.replace('@','')}`})
  if(ws.facebook)  links.push({key:'facebook',icon:Icons.facebook,label:'Facebook',href:ws.facebook.startsWith('http')?ws.facebook:`https://facebook.com/${ws.facebook}`})
  if(ws.twitter)   links.push({key:'twitter',icon:Icons.twitter,label:'X / Twitter',href:`https://x.com/${ws.twitter.replace('@','')}`})
  if(ws.website)   links.push({key:'website',icon:Icons.globe,label:'Website',href:ws.website.startsWith('http')?ws.website:`https://${ws.website}`})
  return links
}

// ─── COMPONENT ──────────────────────────────────────────────────────────────

export default function ClientBooking() {
  const { slug } = useParams()

  useLayoutEffect(() => {
    const el = document.createElement('style')
    el.id = 'cb-styles'
    el.textContent = STYLES
    document.head.appendChild(el)
    return () => document.getElementById('cb-styles')?.remove()
  }, [])

  const [workspace,   setWorkspace]   = useState(null)
  const [services,    setServices]    = useState([])
  const [pageLoading, setPageLoading] = useState(true)
  const [pageError,   setPageError]   = useState(null)

  const [step,       setStep]       = useState(1)
  const [selService, setSelService] = useState(null)
  const [selAddons,  setSelAddons]  = useState([])

  const today = new Date()
  const [calYear,      setCalYear]      = useState(today.getFullYear())
  const [calMonth,     setCalMonth]     = useState(today.getMonth())
  const [availDays,    setAvailDays]    = useState([])
  const [selDay,       setSelDay]       = useState(null)
  const [slots,        setSlots]        = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selTime,      setSelTime]      = useState(null)

  const [form,       setForm]       = useState({ fname:'',lname:'',email:'',phone:'',source:'',notes:'' })
  const [errors,     setErrors]     = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [confirmed,  setConfirmed]  = useState(null)

  // ── Fetch workspace + services ──────────────────────────────────────────────
  useEffect(() => {
    if (!slug) return
    ;(async () => {
      try {
        const { data: ws, error: wErr } = await supabase
          .from('workspaces')
          .select('id,name,tagline,bio,avatar_url,cover_url,instagram,tiktok,website,location,currency,timezone,is_published,accepts_bookings')
          .eq('slug', slug)
          .single()
        if (wErr || !ws) throw new Error('Professional not found')

        const { data: svcs } = await supabase
          .from('services')
          .select('id,name,description,duration_min,price,currency,is_free,display_order')
          .eq('workspace_id', ws.id)
          .eq('is_active', true)
          .is('deleted_at', null)
          .order('display_order', { ascending: true })

        setWorkspace(ws)
        setServices(svcs || [])
        document.title = `Book with ${ws.name} — Organized.`
      } catch(e) {
        setPageError(e.message)
      } finally {
        setPageLoading(false)
      }
    })()
  }, [slug])

  // ── Fetch available days ────────────────────────────────────────────────────
  const fetchAvailableDays = useCallback(async () => {
    if (!workspace) return
    try {
      const { data: avail } = await supabase
        .from('availability')
        .select('day_of_week,open_time,close_time,is_open')
        .eq('workspace_id', workspace.id)
        .eq('is_open', true)

      if (!avail?.length) { setAvailDays([]); return }

      const openDows  = new Set(avail.map(a => a.day_of_week))
      const lastDay   = new Date(calYear, calMonth+1, 0)
      const startStr  = `${calYear}-${pad(calMonth+1)}-01`
      const endStr    = `${calYear}-${pad(calMonth+1)}-${pad(lastDay.getDate())}`

      const { data: blocked } = await supabase
        .from('blocked_dates')
        .select('blocked_date')
        .eq('workspace_id', workspace.id)
        .gte('blocked_date', startStr)
        .lte('blocked_date', endStr)

      const blockedSet    = new Set((blocked||[]).map(b => b.blocked_date))
      const todayMidnight = new Date(); todayMidnight.setHours(0,0,0,0)
      const days = []

      for (let d=1; d<=lastDay.getDate(); d++) {
        const date    = new Date(calYear, calMonth, d)
        const dateStr = `${calYear}-${pad(calMonth+1)}-${pad(d)}`
        if (date <= todayMidnight)        continue
        if (!openDows.has(date.getDay())) continue
        if (blockedSet.has(dateStr))      continue
        days.push(d)
      }
      setAvailDays(days)
    } catch(e) { console.error('fetchAvailableDays:', e) }
  }, [workspace, calYear, calMonth])

  useEffect(() => { fetchAvailableDays() }, [fetchAvailableDays])

  // ── Fetch time slots ────────────────────────────────────────────────────────
  async function fetchSlots(day) {
    if (!workspace) return
    setLoadingSlots(true); setSlots([])
    try {
      const dateStr  = `${calYear}-${pad(calMonth+1)}-${pad(day)}`
      const dow      = new Date(calYear, calMonth, day).getDay()
      const duration = selService?.duration_min || 60

      const [{ data: windows }, { data: appts }] = await Promise.all([
        supabase.from('availability').select('open_time,close_time')
          .eq('workspace_id', workspace.id).eq('day_of_week', dow).eq('is_open', true),
        supabase.from('appointments').select('scheduled_at,duration_min')
          .eq('workspace_id', workspace.id)
          .gte('scheduled_at', `${dateStr}T00:00:00`)
          .lt('scheduled_at',  `${dateStr}T23:59:59`)
          .not('status','in','("cancelled","no_show")')
          .is('deleted_at', null),
      ])

      if (!windows?.length) { setSlots([]); return }

      const bookedRanges = (appts||[]).map(a => {
        const dt = new Date(a.scheduled_at)
        const s  = dt.getHours()*60 + dt.getMinutes()
        return { start: s, end: s + (a.duration_min || 60) }
      })

      const generated = []
      for (const w of windows) {
        let cur = toMinutes(w.open_time)
        const close = toMinutes(w.close_time)
        while (cur + duration <= close) {
          const end    = cur + duration
          const booked = bookedRanges.some(b => cur < b.end && end > b.start)
          generated.push({ raw: fromMinutes(cur), display: formatTime12h(fromMinutes(cur)), booked })
          cur += 30
        }
      }
      setSlots(generated)
    } catch(e) { console.error('fetchSlots:', e) }
    finally { setLoadingSlots(false) }
  }

  // ── Actions ─────────────────────────────────────────────────────────────────
  function pickService(svc) { setSelService(svc); setSelAddons([]) }
  function toggleAddon(a)   { setSelAddons(p => p.includes(a) ? p.filter(x=>x!==a) : [...p,a]) }
  function pickDay(day)     { setSelDay(day); setSelTime(null); fetchSlots(day) }
  function pickTime(slot)   { if (!slot.booked) setSelTime(slot.raw) }

  function changeMonth(dir) {
    const now = new Date()
    let y=calYear, m=calMonth+dir
    if (m<0)  { m=11; y-- }
    if (m>11) { m=0;  y++ }
    if (y < now.getFullYear() || (y===now.getFullYear() && m<now.getMonth())) return
    setCalYear(y); setCalMonth(m); setSelDay(null); setSelTime(null); setSlots([])
  }

  function goStep(n) {
    if (n===2 && !selService)           return
    if (n===3 && (!selDay||!selTime))   return
    setStep(n)
    setTimeout(() => document.getElementById('bk-anchor')?.scrollIntoView({ behavior:'smooth', block:'start' }), 50)
  }

  function scrollToBook() { document.getElementById('bk-anchor')?.scrollIntoView({ behavior:'smooth' }) }
  function quickBook(svc) { setSelService(svc); setSelAddons([]); setTimeout(scrollToBook, 50) }

  async function submitBooking() {
    const errs = {}
    if (!form.fname.trim())                                      errs.fname='Required'
    if (!form.lname.trim())                                      errs.lname='Required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email='Valid email required'
    if (form.phone.replace(/\D/g,'').length < 7)                errs.phone='Required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setErrors({}); setSubmitting(true)
    try {
      const dateStr     = `${calYear}-${pad(calMonth+1)}-${pad(selDay)}`
      const scheduledAt = new Date(`${dateStr}T${selTime}:00`)
      const duration    = selService.duration_min || 60
      const endsAt      = new Date(scheduledAt.getTime() + duration*60000)
      const addonsNote  = selAddons.length ? `[Add-ons: ${selAddons.join(', ')}]\n` : ''

      const { data, error: iErr } = await supabase
        .from('appointments')
        .insert({
          workspace_id:   workspace.id,
          service_id:     selService.id,
          service_name:   selService.name,
          client_name:    `${form.fname.trim()} ${form.lname.trim()}`,
          client_email:   form.email.trim(),
          client_phone:   form.phone.trim(),
          notes:          (addonsNote + (form.notes||'')).trim() || null,
          scheduled_at:   scheduledAt.toISOString(),
          duration_min:   duration,
          ends_at:        endsAt.toISOString(),
          status:         'pending',
          amount:         selService.is_free ? 0 : selService.price,
          currency:       selService.currency || workspace.currency || 'CAD',
          payment_status: 'unpaid',
        })
        .select('id').single()

      if (iErr) {
        if (iErr.code==='23505') {
          alert('This slot was just taken. Please pick another time.')
          setSelTime(null); fetchSlots(selDay); setStep(2); return
        }
        throw iErr
      }

      setConfirmed({
        id:          data.id,
        serviceName: selService.name,
        displayDate: `${MONTHS[calMonth]} ${selDay}, ${calYear}`,
        displayTime: formatTime12h(selTime),
        duration:    formatDuration(duration),
        price:       formatPrice(selService),
        email:       form.email.trim(),
        addons:      selAddons,
        needsDeposit: !selService.is_free && selService.price >= 100,
      })
      setStep(4)
    } catch(e) {
      alert('Something went wrong. Please try again.')
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Calendar render ─────────────────────────────────────────────────────────
  function renderCalendarCells() {
    const firstDay    = new Date(calYear, calMonth, 1).getDay()
    const daysInMonth = new Date(calYear, calMonth+1, 0).getDate()
    const todayMid    = new Date(); todayMid.setHours(0,0,0,0)
    const availSet    = new Set(availDays)
    const cells       = []

    for (let i=0; i<firstDay; i++) cells.push(<div key={`e${i}`} className="bk-day empty" />)

    for (let d=1; d<=daysInMonth; d++) {
      const date    = new Date(calYear, calMonth, d)
      const isToday = date.toDateString() === todayMid.toDateString()
      const isPast  = date < todayMid
      const isAvail = availSet.has(d) && !isPast && !isToday
      const isSel   = selDay === d

      let cls = 'bk-day'
      if (isSel)        cls += ' sel'
      else if (isPast)  cls += ' past'
      else if (isToday) cls += ' today'
      else if (isAvail) cls += ' avail'
      else              cls += ' off'

      cells.push(
        <div key={d} className={cls}
          onClick={isAvail && !isSel ? () => pickDay(d) : undefined}>
          {d}
        </div>
      )
    }
    return cells
  }

  // ── Splash screens ──────────────────────────────────────────────────────────
  const Splash = ({ msg }) => (
    <div style={{ minHeight:'100vh', background:'#F9F5EF', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontFamily:'Playfair Display,Georgia,serif', fontSize:26, color:'#B89030', marginBottom:14 }}>Organized.</div>
        <div style={{ fontSize:12, color:'#9A8E7C', letterSpacing:'0.14em', textTransform:'uppercase' }}>{msg}</div>
      </div>
    </div>
  )

  if (pageLoading)             return <Splash msg="Loading…" />
  if (pageError || !workspace) return <Splash msg="This page doesn't exist." />
  if (!workspace.is_published) return <Splash msg="Booking page not available yet." />

  // ── Derived ─────────────────────────────────────────────────────────────────
  const socialLinks    = buildSocialLinks(workspace)
  const addons         = selService ? getAddons(selService.name) : []
  const selDateDisplay = selDay ? `${MONTHS[calMonth]} ${selDay}, ${calYear}` : null
  const selDateTimeDsp = selDateDisplay && selTime ? `${selDateDisplay} · ${formatTime12h(selTime)}` : selDateDisplay
  const isCurrentMonth = calYear===today.getFullYear() && calMonth===today.getMonth()
  const needsDeposit   = selService && !selService.is_free && selService.price >= 100
  const firstName      = workspace.name.split(' ')[0]

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* NAV */}
      <nav className="bk-nav">
        <div className="bk-logo">Organized.<span>by {workspace.name}</span></div>
        <div className="bk-nav-right">
          <ul className="bk-nav-links">
            <li><a href="#bk-gallery">Portfolio</a></li>
            <li><a href="#bk-services">Services</a></li>
            <li><a href="#bk-anchor">Book</a></li>
          </ul>
          <button className="bk-btn-gold" onClick={scrollToBook}>Book Now</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="bk-hero">
        {/* Left — warm ivory */}
        <div className="bk-hero-left">
          <div className="bk-tag">
            {workspace.accepts_bookings !== false
              ? <><span className="bk-tag-dot" />Accepting bookings</>
              : 'Bookings paused'}
          </div>

          <h1 className="bk-hero-name">
            {workspace.name.split(' ')[0]}
            {workspace.name.split(' ').length > 1 && (
              <><br /><em>{workspace.name.split(' ').slice(1).join(' ')}</em></>
            )}
          </h1>

          {(workspace.tagline || workspace.location) && (
            <p className="bk-hero-title">{workspace.tagline || workspace.location}</p>
          )}

          {workspace.bio && (
            <p className="bk-hero-bio">{workspace.bio}</p>
          )}

          {/* Social icons — only render what the stylist has filled in */}
          {socialLinks.length > 0 && (
            <div className="bk-socials">
              {socialLinks.map(({ key, icon, label, href }) => (
                <a key={key} href={href} target="_blank" rel="noreferrer"
                   className="bk-social-link" title={label} aria-label={label}>
                  {icon}
                </a>
              ))}
            </div>
          )}

          <div className="bk-hero-cta">
            <button className="bk-btn-gold" onClick={scrollToBook}>Book a Session</button>
            <button className="bk-btn-ghost"
              onClick={() => document.getElementById('bk-gallery')?.scrollIntoView({ behavior:'smooth' })}>
              View Work
            </button>
          </div>

          {workspace.location && workspace.tagline && (
            <div className="bk-hero-loc">
              <span className="bk-loc-dot">◉</span>
              {workspace.location}
            </div>
          )}
        </div>

        {/* Right — dark dramatic panel */}
        <div className="bk-hero-right">
          <div className="bk-hero-photo">
            {workspace.cover_url
              ? <img src={workspace.cover_url} alt={workspace.name} className="bk-cover-img" />
              : (
                <div className="bk-portrait-wrap">
                  <div className="bk-p-glow" />
                  <div className="bk-p-head" />
                  <div className="bk-p-neck" />
                  <div className="bk-p-body" />
                  <div className="bk-p-accent">· · ·</div>
                </div>
              )
            }
          </div>
          <div className="bk-hero-overlay" />

          <div className="bk-fc bk-fc-1">
            <div className="bk-fc-lbl">Next Available</div>
            <div className="bk-fc-val">
              {availDays.length > 0 ? `${MONTHS[calMonth]} ${availDays[0]}` : 'See calendar'}
            </div>
          </div>

          {services.length > 0 && (
            <div className="bk-fc bk-fc-2">
              <div className="bk-fc-lbl">Services</div>
              <div className="bk-fc-val" style={{ fontSize:26 }}>{services.length}</div>
              <div className="bk-fc-sub">offered</div>
            </div>
          )}
        </div>
      </section>

      {/* GALLERY */}
      <section id="bk-gallery" className="bk-gallery">
        <div className="bk-gallery-head">
          <div>
            <div className="bk-eyebrow">Portfolio</div>
            <h2 className="bk-heading">The <em>work</em></h2>
          </div>
          {workspace.instagram && (
            <a href={`https://instagram.com/${workspace.instagram.replace('@','')}`}
               target="_blank" rel="noreferrer" className="bk-ig-link">
              {Icons.instagram}&nbsp;@{workspace.instagram.replace('@','')}
            </a>
          )}
        </div>
        <div className="bk-gallery-grid">
          {GALLERY_ITEMS.map((item, i) => (
            <div key={i} className="bk-gi">
              <div className={`bk-gi-bg ${item.cls}`}>
                <div className="bk-gi-tex" />
                <div className="bk-gi-glyph">{item.glyph}</div>
              </div>
              <div className="bk-gi-overlay">
                <span className="bk-gi-tag">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section id="bk-services" className="bk-services">
        <div className="bk-services-inner">
          <div className="bk-services-head">
            <div>
              <div className="bk-eyebrow">What I Offer</div>
              <h2 className="bk-heading">Crafted for <em>you</em></h2>
            </div>
            <p className="bk-services-note">Click any service to jump to booking.</p>
          </div>
          <div className="bk-svc-grid">
            {services.map(svc => (
              <div key={svc.id} className="bk-svc-card" onClick={() => quickBook(svc)}>
                <div className="bk-svc-top">
                  <div className="bk-svc-icon">{getServiceIcon(svc.name)}</div>
                  <div className="bk-svc-arrow">&#8594;</div>
                </div>
                <div className="bk-svc-name">{svc.name}</div>
                {svc.description && <div className="bk-svc-desc">{svc.description}</div>}
                {svc.duration_min && <div className="bk-svc-dur">{formatDuration(svc.duration_min)}</div>}
                <div className="bk-svc-price">{formatPrice(svc)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOOKING WIZARD */}
      <section id="bk-anchor" className="bk-booking">
        <div className="bk-booking-inner">
          <div className="bk-eyebrow">Booking</div>
          <h2 className="bk-heading" style={{ marginBottom:48 }}>Reserve your <em>moment</em></h2>

          {step < 4 && (
            <div className="bk-progress">
              {[1,2,3].map(n => (
                <span key={n} style={{ display:'contents' }}>
                  <div className={`bk-wp-step ${step===n?'active':''} ${step>n?'done':''}`}>
                    <div className="bk-wp-num">{step>n?'✓':n}</div>
                    <div className="bk-wp-lbl">{n===1?'Service':n===2?'Date & Time':'Your Info'}</div>
                  </div>
                  {n<3 && <div className={`bk-wp-line ${step>n?'done':''}`} />}
                </span>
              ))}
            </div>
          )}

          {step < 4 && (
            <div className="bk-wiz-layout">
              {/* Summary panel */}
              <div className="bk-summary">
                <div className="bk-sum-title">Summary</div>
                <div className="bk-sum-row">
                  <div className="bk-sum-key">Stylist</div>
                  <div className="bk-sum-val">{workspace.name}</div>
                  {workspace.tagline && <div className="bk-sum-sub">{workspace.tagline}</div>}
                </div>
                <div className="bk-sum-row">
                  <div className="bk-sum-key">Service</div>
                  {selService ? (
                    <>
                      <div className="bk-sum-val">{selService.name}</div>
                      {selService.duration_min && <div className="bk-sum-sub">{formatDuration(selService.duration_min)}</div>}
                    </>
                  ) : <div className="bk-sum-empty">—</div>}
                </div>
                <div className="bk-sum-row">
                  <div className="bk-sum-key">Date &amp; Time</div>
                  {selDateTimeDsp ? <div className="bk-sum-val">{selDateTimeDsp}</div> : <div className="bk-sum-empty">—</div>}
                </div>
                <div className="bk-sum-row">
                  <div className="bk-sum-key">Price</div>
                  {selService ? <div className="bk-sum-val">{formatPrice(selService)}</div> : <div className="bk-sum-empty">—</div>}
                </div>
                {needsDeposit && (
                  <div className="bk-deposit">
                    <strong>$40 deposit</strong> required to secure this appointment.
                    Applied to your total. Fully refundable with 24h+ notice.
                  </div>
                )}
              </div>

              {/* Steps */}
              <div className="bk-steps">
                {/* STEP 1 */}
                {step===1 && (
                  <div className="bk-step">
                    <p className="bk-step-note">Select the service you'd like to book.</p>
                    <div className="bk-s1-grid">
                      {services.map(svc => (
                        <div key={svc.id}
                          className={`bk-s1-card ${selService?.id===svc.id?'sel':''}`}
                          onClick={() => pickService(svc)}>
                          <div className="bk-s1-check">&#10003;</div>
                          <div className="bk-s1-icon">{getServiceIcon(svc.name)}</div>
                          <div className="bk-s1-name">{svc.name}</div>
                          {svc.duration_min && <div className="bk-s1-meta">{formatDuration(svc.duration_min)}</div>}
                          <div className="bk-s1-price">{formatPrice(svc)}</div>
                        </div>
                      ))}
                    </div>
                    {selService && addons.length>0 && (
                      <div className="bk-addons">
                        <div className="bk-addons-label">Pair it with</div>
                        <div className="bk-addons-chips">
                          {addons.map(a => (
                            <div key={a}
                              className={`bk-chip ${selAddons.includes(a)?'on':''}`}
                              onClick={() => toggleAddon(a)}>{a}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="bk-nav-row">
                      <span />
                      <button className="bk-btn-next" onClick={() => goStep(2)} disabled={!selService}>
                        Next — Pick a Time &#8594;
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2 */}
                {step===2 && (
                  <div className="bk-step">
                    <p className="bk-step-note">Highlighted dates have openings. Select a date, then a time.</p>
                    <div className="bk-cal-wrap">
                      <div className="bk-cal-head">
                        <div className="bk-cal-month">{MONTHS[calMonth]} {calYear}</div>
                        <div className="bk-cal-nav-btns">
                          <button className="bk-cal-btn" onClick={() => changeMonth(-1)} disabled={isCurrentMonth}>&#8249;</button>
                          <button className="bk-cal-btn" onClick={() => changeMonth(1)}>&#8250;</button>
                        </div>
                      </div>
                      <div className="bk-cal-dnames">
                        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                          <div key={d} className="bk-dname">{d}</div>
                        ))}
                      </div>
                      <div className="bk-cal-grid">{renderCalendarCells()}</div>
                    </div>
                    {selDay && (
                      <div className="bk-slots-wrap">
                        <div className="bk-slots-lbl">Available Times — {selDateDisplay}</div>
                        {loadingSlots ? (
                          <div className="bk-slots-empty">Loading…</div>
                        ) : slots.length===0 ? (
                          <div className="bk-slots-empty">No availability for this date.</div>
                        ) : (
                          <div className="bk-slots-grid">
                            {slots.map(slot => (
                              <div key={slot.raw}
                                className={`bk-slot ${slot.booked?'booked':selTime===slot.raw?'sel':'avail'}`}
                                onClick={() => !slot.booked && pickTime(slot)}>
                                {slot.display}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="bk-nav-row">
                      <button className="bk-btn-back" onClick={() => goStep(1)}>&#8592; Back</button>
                      <button className="bk-btn-next" onClick={() => goStep(3)} disabled={!selDay||!selTime}>
                        Next — Your Info &#8594;
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3 */}
                {step===3 && (
                  <div className="bk-step">
                    <p className="bk-step-note">Almost done. Confirmation goes straight to your inbox.</p>
                    <div className="bk-form-2col">
                      <div className="bk-fgroup">
                        <label className="bk-flabel">First Name *</label>
                        <input className={`bk-finput ${errors.fname?'err':''}`} type="text" placeholder="Marie"
                          value={form.fname} onChange={e=>setForm(f=>({...f,fname:e.target.value}))} />
                        {errors.fname && <span className="bk-ferr">{errors.fname}</span>}
                      </div>
                      <div className="bk-fgroup">
                        <label className="bk-flabel">Last Name *</label>
                        <input className={`bk-finput ${errors.lname?'err':''}`} type="text" placeholder="Dupont"
                          value={form.lname} onChange={e=>setForm(f=>({...f,lname:e.target.value}))} />
                        {errors.lname && <span className="bk-ferr">{errors.lname}</span>}
                      </div>
                    </div>
                    <div className="bk-fgroup">
                      <label className="bk-flabel">Email *</label>
                      <input className={`bk-finput ${errors.email?'err':''}`} type="email" placeholder="marie@example.com"
                        value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} />
                      {errors.email && <span className="bk-ferr">{errors.email}</span>}
                    </div>
                    <div className="bk-fgroup">
                      <label className="bk-flabel">Phone *</label>
                      <input className={`bk-finput ${errors.phone?'err':''}`} type="tel" placeholder="+1 (514) 000-0000"
                        value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} />
                      {errors.phone && <span className="bk-ferr">{errors.phone}</span>}
                    </div>
                    <div className="bk-fgroup">
                      <label className="bk-flabel">How did you find {firstName}?</label>
                      <select className="bk-fselect" value={form.source} onChange={e=>setForm(f=>({...f,source:e.target.value}))}>
                        <option value="">Select one</option>
                        <option value="instagram">Instagram</option>
                        <option value="referral">Friend or Referral</option>
                        <option value="google">Google</option>
                        <option value="tiktok">TikTok</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="bk-fgroup">
                      <label className="bk-flabel">Notes — optional</label>
                      <input className="bk-finput" type="text"
                        placeholder="Allergies, hair goals, reference photo link…"
                        value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} />
                    </div>
                    <div className="bk-policy">
                      By confirming, you agree to {firstName}&apos;s{' '}
                      <a href="#bk-faq">cancellation policy</a>.
                      Free cancellation up to 24 hours before your appointment.
                      {needsDeposit && ' A $40 deposit is required for this service.'}
                    </div>
                    <div className="bk-nav-row">
                      <button className="bk-btn-back" onClick={() => goStep(2)}>&#8592; Back</button>
                      <button className="bk-btn-next" onClick={submitBooking} disabled={submitting}>
                        {submitting ? 'Confirming…' : 'Confirm Appointment →'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUCCESS */}
          {step===4 && confirmed && (
            <div className="bk-success">
              <div className="bk-success-icon">&#10003;</div>
              <h2 className="bk-success-title">You&apos;re booked.</h2>
              <p className="bk-success-sub">
                Confirmation sent to <strong style={{ color:'var(--tx)' }}>{confirmed.email}</strong>.<br />
                {firstName} will see you soon.
              </p>
              <div className="bk-success-card">
                <div className="bk-sc-row"><span className="bk-sc-k">Stylist</span><span className="bk-sc-v">{workspace.name}</span></div>
                <div className="bk-sc-row"><span className="bk-sc-k">Service</span><span className="bk-sc-v">{confirmed.serviceName}</span></div>
                {confirmed.addons.length>0 && (
                  <div className="bk-sc-row"><span className="bk-sc-k">Add-ons</span><span className="bk-sc-v">{confirmed.addons.join(', ')}</span></div>
                )}
                <div className="bk-sc-row"><span className="bk-sc-k">Date</span><span className="bk-sc-v">{confirmed.displayDate}</span></div>
                <div className="bk-sc-row"><span className="bk-sc-k">Time</span><span className="bk-sc-v">{confirmed.displayTime}</span></div>
                <div className="bk-sc-row"><span className="bk-sc-k">Duration</span><span className="bk-sc-v">{confirmed.duration}</span></div>
                {confirmed.needsDeposit && (
                  <div className="bk-sc-row">
                    <span className="bk-sc-k">Deposit</span>
                    <span className="bk-sc-v" style={{ color:'var(--gold)' }}>$40 — pending collection</span>
                  </div>
                )}
              </div>
              <div className="bk-success-actions">
                <button className="bk-btn-ghost" onClick={() => alert(`Add to calendar:\n${confirmed.serviceName}\n${confirmed.displayDate} at ${confirmed.displayTime}`)}>
                  Add to Calendar
                </button>
                <button className="bk-btn-gold" onClick={() => window.location.reload()}>
                  Book Another
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="bk-reviews">
        <div className="bk-reviews-inner">
          <div className="bk-eyebrow">Client Love</div>
          <h2 className="bk-heading" style={{ marginBottom:44 }}>What they <em>say</em></h2>
          <div className="bk-reviews-grid">
            {[
              { init:'A', name:'Amara D.', svc:'Color & Balayage',
                text:"Completely transformed my hair. The result was exactly what I had in my head but couldn't describe. I won't go anywhere else." },
              { init:'S', name:'Sabrina M.', svc:'Natural Hair Treatment',
                text:'Finding a stylist who truly understands texture is rare. Exceptional — knowledgeable, gentle, precise.' },
              { init:'C', name:'Christine L.', svc:'Precision Cut',
                text:'The booking experience alone sets this apart. Easy, clean, professional. And the results? Never looked better in 32 years.' },
            ].map(r => (
              <div key={r.name} className="bk-review-card">
                <div className="bk-review-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
                <p className="bk-review-text">{r.text}</p>
                <div className="bk-review-author">
                  <div className="bk-review-av">{r.init}</div>
                  <div>
                    <div className="bk-review-name">{r.name}</div>
                    <div className="bk-review-svc">{r.svc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="bk-faq" className="bk-faq">
        <div className="bk-eyebrow">Know Before You Go</div>
        <h2 className="bk-heading">Good <em>questions</em></h2>
        <div className="bk-faq-grid">
          {[
            { q:"What's the cancellation policy?",
              a:"Free cancellation up to 24 hours before your appointment. Cancellations within 24 hours forfeit the deposit (50% for non-deposit services)." },
            { q:"Do you require a deposit?",
              a:"Services over $100 require a $40 deposit at booking. Applied to your total. Fully refundable with 24+ hours notice." },
            { q:"How should I arrive?",
              a:"Come with clean, dry hair unless specified. For color services, save inspiration photos on your phone — the more reference, the better." },
            { q:"Do you work with all hair textures?",
              a:"Yes. Every service is adapted to your hair type, from fine straight to tight coils. Unsure? Book a free Consultation first." },
          ].map(item => (
            <div key={item.q} className="bk-faq-item">
              <div className="bk-faq-q">{item.q}</div>
              <div className="bk-faq-a">{item.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bk-footer">
        <div className="bk-footer-logo">Organized.</div>
        <div className="bk-footer-socials">
          {socialLinks.map(({ key, icon, label, href }) => (
            <a key={key} href={href} target="_blank" rel="noreferrer"
               className="bk-footer-social" title={label} aria-label={label}>
              {icon}
            </a>
          ))}
        </div>
        <div className="bk-footer-right">
          Powered by{' '}
          <a href="https://beorganized.io" target="_blank" rel="noreferrer">beorganized.io</a>
        </div>
      </footer>
    </>
  )
}

// ─── STYLES — Warm Ivory · Premium Light Theme ───────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root{
  --bg:#F9F5EF; --bg-2:#F1EAE0; --bg-card:#FFFFFF;
  --gold:#B89030; --gold-lt:#C9A84C;
  --gold-dim:rgba(184,144,48,0.09); --gold-bdr:rgba(184,144,48,0.28);
  --tx:#1C1814; --tx-m:#9A8E7C; --tx-s:#5A5040;
  --bdr:rgba(30,18,8,0.08); --bdr-m:rgba(30,18,8,0.14);
  --sh-sm:0 1px 8px rgba(30,18,8,0.06);
  --sh:0 2px 20px rgba(30,18,8,0.08);
  --sh-md:0 4px 32px rgba(30,18,8,0.11);
  --dk:#1A1410; --dk2:#221A10;
  --err:#b94040; --ok:#3a9e6a;
}

html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--tx);font-family:'DM Sans',sans-serif;overflow-x:hidden;min-height:100vh}
body::before{content:'';position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E");pointer-events:none;z-index:9999;opacity:.6;mix-blend-mode:multiply}

/* NAV */
.bk-nav{position:fixed;top:0;left:0;right:0;z-index:500;padding:16px 40px;display:flex;align-items:center;justify-content:space-between;background:rgba(249,245,239,0.94);backdrop-filter:blur(16px);border-bottom:1px solid var(--bdr);box-shadow:0 1px 0 var(--bdr)}
.bk-logo{font-family:'Playfair Display',serif;font-size:18px;letter-spacing:.04em;color:var(--gold)}
.bk-logo span{color:var(--tx-m);font-size:12px;margin-left:8px;font-family:'DM Sans',sans-serif;font-weight:300}
.bk-nav-right{display:flex;align-items:center;gap:28px}
.bk-nav-links{display:flex;gap:28px;list-style:none}
.bk-nav-links a{font-size:12px;color:var(--tx-m);text-decoration:none;letter-spacing:.08em;text-transform:uppercase;transition:color .2s}
.bk-nav-links a:hover{color:var(--gold)}

/* BUTTONS */
.bk-btn-gold{background:var(--gold);color:#FAF7F0;border:none;padding:11px 26px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;letter-spacing:.07em;cursor:pointer;border-radius:2px;text-transform:uppercase;transition:all .25s}
.bk-btn-gold:hover{background:var(--gold-lt);transform:translateY(-1px);box-shadow:0 6px 22px rgba(184,144,48,.25)}
.bk-btn-gold:disabled{background:var(--bdr-m);color:var(--tx-m);cursor:not-allowed;transform:none;box-shadow:none}
.bk-btn-ghost{background:transparent;color:var(--tx-s);border:1px solid var(--bdr-m);padding:11px 22px;font-family:'DM Sans',sans-serif;font-size:12px;letter-spacing:.07em;cursor:pointer;border-radius:2px;text-transform:uppercase;transition:all .25s}
.bk-btn-ghost:hover{border-color:var(--gold-bdr);color:var(--gold)}

/* HERO */
.bk-hero{min-height:100vh;display:grid;grid-template-columns:54% 46%;position:relative;overflow:hidden}
.bk-hero-left{display:flex;flex-direction:column;justify-content:center;padding:130px 64px 80px;position:relative;z-index:2;background:var(--bg)}
.bk-hero-left::after{content:'';position:absolute;right:0;top:8%;bottom:8%;width:1px;background:linear-gradient(to bottom,transparent,var(--bdr-m),transparent)}

.bk-tag{display:inline-flex;align-items:center;gap:8px;background:var(--gold-dim);border:1px solid var(--gold-bdr);border-radius:100px;padding:6px 16px 6px 10px;font-size:11px;color:var(--gold);letter-spacing:.12em;text-transform:uppercase;margin-bottom:36px;width:fit-content;animation:bkFadeUp .7s ease both}
.bk-tag-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--gold);animation:bkPulse 2s infinite;flex-shrink:0}
@keyframes bkPulse{0%,100%{opacity:1}50%{opacity:.2}}
@keyframes bkFadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}

.bk-hero-name{font-family:'Playfair Display',serif;font-size:clamp(48px,5.5vw,74px);font-weight:500;line-height:1.0;margin-bottom:12px;color:var(--tx);animation:bkFadeUp .7s .08s ease both}
.bk-hero-name em{font-style:italic;color:var(--gold)}
.bk-hero-title{font-size:12px;color:var(--tx-m);letter-spacing:.2em;text-transform:uppercase;margin-bottom:28px;animation:bkFadeUp .7s .16s ease both}
.bk-hero-bio{font-size:15px;line-height:1.85;color:var(--tx-s);max-width:380px;margin-bottom:32px;font-weight:300;animation:bkFadeUp .7s .24s ease both}
.bk-hero-loc{font-size:12px;color:var(--tx-m);letter-spacing:.06em;margin-top:28px;animation:bkFadeUp .7s .48s ease both}
.bk-loc-dot{color:var(--gold);margin-right:4px}

/* SOCIAL ICONS */
.bk-socials{display:flex;gap:10px;margin-bottom:32px;animation:bkFadeUp .7s .32s ease both}
.bk-social-link{width:36px;height:36px;border-radius:50%;border:1px solid var(--bdr-m);display:flex;align-items:center;justify-content:center;color:var(--tx-m);text-decoration:none;transition:all .22s;background:transparent}
.bk-social-link:hover{border-color:var(--gold);color:var(--gold);background:var(--gold-dim);transform:translateY(-2px);box-shadow:0 4px 12px rgba(184,144,48,.15)}

.bk-hero-cta{display:flex;gap:10px;animation:bkFadeUp .7s .4s ease both}

/* HERO RIGHT */
.bk-hero-right{position:relative;overflow:hidden}
.bk-hero-photo{position:absolute;inset:0;background:linear-gradient(150deg,var(--dk2) 0%,var(--dk) 60%,#0D0A06 100%);display:flex;align-items:center;justify-content:center}
.bk-cover-img{width:100%;height:100%;object-fit:cover;filter:brightness(.72) saturate(.8)}
.bk-portrait-wrap{position:relative;width:260px;height:400px}
.bk-p-glow{position:absolute;top:-30px;left:50%;transform:translateX(-50%);width:200px;height:200px;background:radial-gradient(circle,rgba(201,168,76,.07) 0%,transparent 70%);border-radius:50%}
.bk-p-head{position:absolute;top:0;left:50%;transform:translateX(-50%);width:100px;height:110px;background:linear-gradient(160deg,#2e2416,#1a1208);border-radius:50%;border:1px solid rgba(201,168,76,.09)}
.bk-p-neck{position:absolute;bottom:290px;left:50%;transform:translateX(-50%);width:38px;height:52px;background:linear-gradient(160deg,#2e2416,#1a1208)}
.bk-p-body{position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:180px;height:300px;background:linear-gradient(160deg,#261e0e,#130e06);border-radius:90px 90px 60px 60px;border:1px solid rgba(201,168,76,.07)}
.bk-p-accent{position:absolute;top:48%;left:50%;transform:translate(-50%,-50%);font-size:16px;color:rgba(201,168,76,.13);letter-spacing:12px}
.bk-hero-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,transparent 50%,var(--dk) 100%)}
.bk-fc{position:absolute;background:rgba(20,14,8,.92);border:1px solid rgba(201,168,76,.16);border-radius:3px;padding:16px 20px;backdrop-filter:blur(20px);animation:bkFadeUp .8s .55s ease both}
.bk-fc-1{bottom:52px;left:-24px;min-width:180px}
.bk-fc-2{top:38%;right:24px;animation-delay:.7s}
.bk-fc-lbl{font-size:9px;color:rgba(201,168,76,.6);letter-spacing:.18em;text-transform:uppercase;margin-bottom:5px}
.bk-fc-val{font-family:'Playfair Display',serif;font-size:17px;color:#E8C97A}
.bk-fc-sub{font-size:11px;color:rgba(201,168,76,.5);margin-top:3px}

/* SHARED TYPOGRAPHY */
.bk-eyebrow{font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:var(--gold);margin-bottom:14px}
.bk-heading{font-family:'Playfair Display',serif;font-size:clamp(28px,3.5vw,42px);font-weight:500;line-height:1.15;color:var(--tx)}
.bk-heading em{font-style:italic;color:var(--gold)}

/* GALLERY */
.bk-gallery{padding:96px 64px;max-width:1440px;margin:0 auto;background:var(--bg)}
.bk-gallery-head{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:44px;gap:20px}
.bk-ig-link{display:inline-flex;align-items:center;gap:8px;font-size:12px;color:var(--tx-m);text-decoration:none;letter-spacing:.06em;border:1px solid var(--bdr-m);padding:9px 18px;border-radius:2px;transition:all .2s;white-space:nowrap}
.bk-ig-link:hover{color:var(--gold);border-color:var(--gold-bdr)}

.bk-gallery-grid{display:grid;grid-template-columns:repeat(12,1fr);grid-template-rows:260px 260px;gap:6px}
.bk-gi{position:relative;overflow:hidden;border-radius:3px;cursor:pointer}
.bk-gi:nth-child(1){grid-column:1/5;grid-row:1/3}
.bk-gi:nth-child(2){grid-column:5/8;grid-row:1}
.bk-gi:nth-child(3){grid-column:8/13;grid-row:1}
.bk-gi:nth-child(4){grid-column:5/9;grid-row:2}
.bk-gi:nth-child(5){grid-column:9/13;grid-row:2}
.bk-gi-bg{position:absolute;inset:0;transition:transform .5s cubic-bezier(.25,.46,.45,.94);display:flex;align-items:center;justify-content:center}
.bk-gi:hover .bk-gi-bg{transform:scale(1.04)}
.gi-1{background:linear-gradient(145deg,#D4B896 0%,#C4A478 40%,#B8945E 100%)}
.gi-2{background:linear-gradient(140deg,#C8C0B4 0%,#B8ACA0 100%)}
.gi-3{background:linear-gradient(155deg,#D4B8AC 0%,#C8A498 100%)}
.gi-4{background:linear-gradient(145deg,#B8C4B8 0%,#A8B8A4 100%)}
.gi-5{background:linear-gradient(150deg,#D0C8B8 0%,#C0B8A4 100%)}
.bk-gi-tex{position:absolute;inset:0;background:linear-gradient(to bottom right,rgba(255,255,255,.18) 0%,transparent 60%)}
.bk-gi-glyph{font-size:52px;color:rgba(255,255,255,.22);font-family:'Playfair Display',serif;user-select:none;z-index:1}
.bk-gi:nth-child(1) .bk-gi-glyph{font-size:80px}
.bk-gi-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(20,14,8,.65) 0%,transparent 55%);opacity:0;transition:opacity .3s;display:flex;align-items:flex-end;padding:20px}
.bk-gi:hover .bk-gi-overlay{opacity:1}
.bk-gi-tag{font-size:10px;color:#F9F5EF;letter-spacing:.12em;text-transform:uppercase;border:1px solid rgba(255,255,255,.3);padding:5px 12px;border-radius:1px;background:rgba(20,14,8,.3)}

/* SERVICES */
.bk-services{padding:96px 64px;background:var(--bg-2);border-top:1px solid var(--bdr);border-bottom:1px solid var(--bdr)}
.bk-services-inner{max-width:1200px;margin:0 auto}
.bk-services-head{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:48px}
.bk-services-note{font-size:12px;color:var(--tx-m);font-weight:300;max-width:200px;text-align:right;line-height:1.6}
.bk-svc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.bk-svc-card{background:var(--bg-card);padding:32px 28px;cursor:pointer;border:1px solid var(--bdr);border-radius:3px;box-shadow:var(--sh-sm);transition:all .25s;position:relative;overflow:hidden}
.bk-svc-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:var(--gold);transform:scaleX(0);transform-origin:left;transition:transform .3s}
.bk-svc-card:hover{border-color:var(--gold-bdr);box-shadow:var(--sh);transform:translateY(-2px)}
.bk-svc-card:hover::after{transform:scaleX(1)}
.bk-svc-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
.bk-svc-icon{width:36px;height:36px;border:1px solid var(--bdr-m);border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:15px;transition:all .25s;color:var(--tx-s)}
.bk-svc-card:hover .bk-svc-icon{background:var(--gold-dim);border-color:var(--gold-bdr);color:var(--gold)}
.bk-svc-arrow{font-size:16px;color:var(--bdr-m);transition:color .2s,transform .2s}
.bk-svc-card:hover .bk-svc-arrow{color:var(--gold);transform:translateX(3px)}
.bk-svc-name{font-family:'Playfair Display',serif;font-size:18px;margin-bottom:6px;color:var(--tx)}
.bk-svc-desc{font-size:12px;color:var(--tx-m);line-height:1.6;margin-bottom:8px;font-weight:300}
.bk-svc-dur{font-size:11px;color:var(--tx-m);letter-spacing:.08em;margin-bottom:16px}
.bk-svc-price{font-family:'Playfair Display',serif;font-size:22px;color:var(--gold)}

/* BOOKING */
.bk-booking{padding:96px 64px;background:var(--bg);border-bottom:1px solid var(--bdr)}
.bk-booking-inner{max-width:1100px;margin:0 auto}
.bk-progress{display:flex;align-items:center;margin-bottom:52px}
.bk-wp-step{display:flex;align-items:center;gap:10px;flex-shrink:0}
.bk-wp-num{width:30px;height:30px;border-radius:50%;border:1px solid var(--bdr-m);background:var(--bg-card);display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--tx-m);transition:all .3s;font-weight:500;box-shadow:var(--sh-sm)}
.bk-wp-lbl{font-size:12px;color:var(--tx-m);letter-spacing:.05em;white-space:nowrap;transition:color .3s}
.bk-wp-step.active .bk-wp-num{border-color:var(--gold);background:var(--gold-dim);color:var(--gold)}
.bk-wp-step.active .bk-wp-lbl{color:var(--tx-s)}
.bk-wp-step.done .bk-wp-num{background:var(--gold);border-color:var(--gold);color:#FAF7F0;font-weight:700}
.bk-wp-step.done .bk-wp-lbl{color:var(--gold)}
.bk-wp-line{flex:1;height:1px;background:var(--bdr-m);margin:0 16px;transition:background .4s}
.bk-wp-line.done{background:var(--gold)}

/* WIZARD LAYOUT */
.bk-wiz-layout{display:grid;grid-template-columns:260px 1fr;gap:52px;align-items:start}
.bk-summary{position:sticky;top:90px;background:var(--bg-card);border:1px solid var(--bdr);border-radius:3px;padding:24px;box-shadow:var(--sh)}
.bk-sum-title{font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:var(--tx-m);margin-bottom:18px}
.bk-sum-row{margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid var(--bdr)}
.bk-sum-row:last-of-type{border-bottom:none;margin-bottom:0;padding-bottom:0}
.bk-sum-key{font-size:9px;color:var(--tx-m);letter-spacing:.14em;text-transform:uppercase;margin-bottom:4px}
.bk-sum-val{font-family:'Playfair Display',serif;font-size:15px;color:var(--tx);line-height:1.3}
.bk-sum-sub{font-size:11px;color:var(--tx-m);margin-top:3px}
.bk-sum-empty{font-size:12px;color:var(--bdr-m)}
.bk-deposit{margin-top:16px;padding:12px 14px;background:var(--gold-dim);border:1px solid var(--gold-bdr);border-radius:2px;font-size:11px;color:var(--tx-s);line-height:1.65}
.bk-deposit strong{color:var(--gold)}

/* STEP CONTENT */
.bk-step-note{font-size:13px;color:var(--tx-m);font-weight:300;margin-bottom:24px;line-height:1.6}
.bk-s1-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.bk-s1-card{background:var(--bg-card);border:1px solid var(--bdr);border-radius:2px;padding:20px;cursor:pointer;transition:all .2s;position:relative;box-shadow:var(--sh-sm)}
.bk-s1-card:hover{border-color:var(--gold-bdr);box-shadow:var(--sh)}
.bk-s1-card.sel{border-color:var(--gold);box-shadow:0 0 0 2px rgba(184,144,48,.15),var(--sh)}
.bk-s1-check{position:absolute;top:12px;right:12px;width:16px;height:16px;border-radius:50%;border:1px solid var(--bdr-m);display:flex;align-items:center;justify-content:center;font-size:9px;transition:all .2s;color:transparent}
.bk-s1-card.sel .bk-s1-check{background:var(--gold);border-color:var(--gold);color:#FAF7F0;font-weight:700}
.bk-s1-icon{font-size:18px;color:var(--tx-m);margin-bottom:10px}
.bk-s1-card.sel .bk-s1-icon{color:var(--gold)}
.bk-s1-name{font-family:'Playfair Display',serif;font-size:15px;margin-bottom:5px;color:var(--tx)}
.bk-s1-meta{font-size:11px;color:var(--tx-m)}
.bk-s1-price{margin-top:10px;font-family:'Playfair Display',serif;font-size:16px;color:var(--gold)}
.bk-addons{margin-top:24px;padding-top:22px;border-top:1px solid var(--bdr)}
.bk-addons-label{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--tx-m);margin-bottom:12px}
.bk-addons-chips{display:flex;flex-wrap:wrap;gap:8px}
.bk-chip{padding:7px 14px;border:1px solid var(--bdr-m);border-radius:100px;font-size:12px;color:var(--tx-s);cursor:pointer;transition:all .2s;background:var(--bg-card)}
.bk-chip:hover{border-color:var(--gold-bdr);color:var(--gold)}
.bk-chip.on{border-color:var(--gold);background:var(--gold-dim);color:var(--gold)}

/* CALENDAR */
.bk-cal-wrap{background:var(--bg-card);border:1px solid var(--bdr);border-radius:3px;overflow:hidden;box-shadow:var(--sh-sm)}
.bk-cal-head{padding:16px 22px;border-bottom:1px solid var(--bdr);display:flex;align-items:center;justify-content:space-between}
.bk-cal-month{font-family:'Playfair Display',serif;font-size:16px;color:var(--tx)}
.bk-cal-nav-btns{display:flex;gap:6px}
.bk-cal-btn{width:30px;height:30px;border:1px solid var(--bdr-m);background:transparent;color:var(--tx-m);cursor:pointer;border-radius:2px;font-size:14px;transition:all .2s}
.bk-cal-btn:hover{border-color:var(--gold-bdr);color:var(--gold);background:var(--gold-dim)}
.bk-cal-btn:disabled{opacity:.3;cursor:default;pointer-events:none}
.bk-cal-dnames{display:grid;grid-template-columns:repeat(7,1fr);padding:10px 20px 4px}
.bk-dname{text-align:center;font-size:9px;color:var(--tx-m);letter-spacing:.12em;text-transform:uppercase}
.bk-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);padding:4px 20px 20px;gap:2px}
.bk-day{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:12px;border-radius:2px;cursor:pointer;transition:all .15s;color:var(--tx-m);position:relative;user-select:none}
.bk-day.avail{color:var(--tx);font-weight:500;cursor:pointer}
.bk-day.avail::after{content:'';position:absolute;bottom:2px;left:50%;transform:translateX(-50%);width:3px;height:3px;border-radius:50%;background:var(--gold)}
.bk-day.avail:hover{background:var(--gold-dim);color:var(--gold)}
.bk-day.today{border:1px solid var(--gold-bdr);color:var(--gold)}
.bk-day.sel{background:var(--gold)!important;color:#FAF7F0!important;font-weight:600}
.bk-day.sel::after{display:none}
.bk-day.past,.bk-day.off,.bk-day.empty{color:rgba(30,18,8,.2);cursor:default}

/* SLOTS */
.bk-slots-wrap{margin-top:18px}
.bk-slots-lbl{font-size:10px;color:var(--tx-m);letter-spacing:.14em;text-transform:uppercase;margin-bottom:10px}
.bk-slots-empty{font-size:13px;color:var(--tx-m);padding:20px 0;font-style:italic}
.bk-slots-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.bk-slot{padding:9px 6px;text-align:center;border:1px solid var(--bdr);background:var(--bg-card);color:var(--tx-m);font-size:12px;cursor:pointer;border-radius:2px;transition:all .15s}
.bk-slot.avail{color:var(--tx-s)}
.bk-slot.avail:hover{border-color:var(--gold-bdr);color:var(--gold);background:var(--gold-dim)}
.bk-slot.sel{border-color:var(--gold);background:var(--gold-dim);color:var(--gold);font-weight:500}
.bk-slot.booked{color:rgba(30,18,8,.2);cursor:not-allowed;border-color:transparent;background:var(--bg-2)}

/* FORM */
.bk-form-2col{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.bk-fgroup{display:flex;flex-direction:column;gap:6px;margin-bottom:13px}
.bk-flabel{font-size:10px;color:var(--tx-m);letter-spacing:.12em;text-transform:uppercase}
.bk-finput,.bk-fselect{background:var(--bg-card);border:1px solid var(--bdr-m);color:var(--tx);padding:12px 16px;font-family:'DM Sans',sans-serif;font-size:14px;border-radius:2px;outline:none;transition:border-color .2s,box-shadow .2s;width:100%}
.bk-finput:focus,.bk-fselect:focus{border-color:var(--gold-bdr);box-shadow:0 0 0 3px rgba(184,144,48,.08)}
.bk-finput.err{border-color:var(--err)}
.bk-finput::placeholder{color:rgba(30,18,8,.2)}
.bk-fselect{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%239A8E7C' d='M5 7L1 2h8z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;background-color:var(--bg-card);cursor:pointer}
.bk-ferr{font-size:11px;color:var(--err)}
.bk-policy{padding:14px 16px;background:var(--gold-dim);border:1px solid var(--gold-bdr);border-radius:2px;font-size:11px;color:var(--tx-s);line-height:1.65;margin-bottom:4px}
.bk-policy a{color:var(--gold);text-decoration:none;font-weight:500}
.bk-nav-row{display:flex;justify-content:space-between;align-items:center;margin-top:28px;padding-top:22px;border-top:1px solid var(--bdr)}
.bk-btn-back{background:transparent;color:var(--tx-m);border:1px solid var(--bdr-m);padding:11px 22px;font-family:'DM Sans',sans-serif;font-size:12px;letter-spacing:.06em;cursor:pointer;border-radius:2px;transition:all .2s;text-transform:uppercase}
.bk-btn-back:hover{color:var(--tx-s)}
.bk-btn-next{background:var(--gold);color:#FAF7F0;border:none;padding:13px 32px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;letter-spacing:.06em;cursor:pointer;border-radius:2px;transition:all .25s}
.bk-btn-next:hover{background:var(--gold-lt);transform:translateY(-1px);box-shadow:0 8px 28px rgba(184,144,48,.22)}
.bk-btn-next:disabled{background:var(--bdr);color:var(--tx-m);cursor:not-allowed;transform:none;box-shadow:none}

/* SUCCESS */
.bk-success{text-align:center;padding:72px 40px 48px;animation:bkFadeUp .5s ease both}
.bk-success-icon{width:68px;height:68px;border-radius:50%;background:rgba(58,158,106,.08);border:1px solid rgba(58,158,106,.25);display:flex;align-items:center;justify-content:center;margin:0 auto 28px;font-size:26px;color:var(--ok);animation:bkScaleIn .4s .1s ease both}
@keyframes bkScaleIn{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}
.bk-success-title{font-family:'Playfair Display',serif;font-size:34px;margin-bottom:12px;color:var(--tx)}
.bk-success-sub{font-size:14px;color:var(--tx-s);font-weight:300;line-height:1.7;margin-bottom:40px}
.bk-success-card{background:var(--bg-card);border:1px solid var(--bdr);border-radius:3px;padding:24px 32px;max-width:420px;margin:0 auto 36px;text-align:left;box-shadow:var(--sh)}
.bk-sc-row{display:flex;justify-content:space-between;align-items:flex-start;padding:9px 0;border-bottom:1px solid var(--bdr);font-size:13px;gap:16px}
.bk-sc-row:last-child{border-bottom:none}
.bk-sc-k{color:var(--tx-m);flex-shrink:0}
.bk-sc-v{color:var(--tx-s);font-weight:500;text-align:right}
.bk-success-actions{display:flex;gap:10px;justify-content:center}

/* REVIEWS */
.bk-reviews{padding:96px 64px;background:var(--bg-2);border-top:1px solid var(--bdr);border-bottom:1px solid var(--bdr)}
.bk-reviews-inner{max-width:1200px;margin:0 auto}
.bk-reviews-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.bk-review-card{background:var(--bg-card);border:1px solid var(--bdr);padding:28px;border-radius:3px;box-shadow:var(--sh-sm);transition:box-shadow .25s,transform .25s}
.bk-review-card:hover{box-shadow:var(--sh);transform:translateY(-2px)}
.bk-review-stars{font-size:11px;color:var(--gold);letter-spacing:2px;margin-bottom:18px}
.bk-review-text{font-size:14px;line-height:1.8;color:var(--tx-s);margin-bottom:22px;font-weight:300}
.bk-review-author{display:flex;align-items:center;gap:10px}
.bk-review-av{width:34px;height:34px;border-radius:50%;background:var(--gold-dim);border:1px solid var(--gold-bdr);display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--gold);flex-shrink:0}
.bk-review-name{font-size:13px;font-weight:500;color:var(--tx)}
.bk-review-svc{font-size:10px;color:var(--tx-m);margin-top:2px;letter-spacing:.06em}

/* FAQ */
.bk-faq{padding:96px 64px;max-width:1200px;margin:0 auto}
.bk-faq-grid{display:grid;grid-template-columns:1fr 1fr;gap:40px 80px;margin-top:52px}
.bk-faq-q{font-family:'Playfair Display',serif;font-size:16px;margin-bottom:10px;color:var(--tx)}
.bk-faq-a{font-size:13px;color:var(--tx-m);line-height:1.75;font-weight:300}

/* FOOTER */
.bk-footer{padding:32px 64px;border-top:1px solid var(--bdr);background:var(--bg-2);display:flex;align-items:center;justify-content:space-between;gap:20px}
.bk-footer-logo{font-family:'Playfair Display',serif;font-size:17px;color:var(--gold)}
.bk-footer-socials{display:flex;gap:8px}
.bk-footer-social{width:32px;height:32px;border-radius:50%;border:1px solid var(--bdr-m);display:flex;align-items:center;justify-content:center;color:var(--tx-m);text-decoration:none;transition:all .2s}
.bk-footer-social:hover{border-color:var(--gold-bdr);color:var(--gold);background:var(--gold-dim)}
.bk-footer-right{font-size:11px;color:var(--tx-m)}
.bk-footer-right a{color:var(--gold);text-decoration:none;font-weight:500}

/* MOBILE */
@media(max-width:960px){
  .bk-nav{padding:14px 24px}
  .bk-nav-links{display:none}
  .bk-hero{grid-template-columns:1fr;min-height:auto}
  .bk-hero-right{height:44vh;order:-1}
  .bk-hero-left{padding:28px 24px 56px}
  .bk-hero-left::after{display:none}
  .bk-hero-name{font-size:44px}
  .bk-gallery,.bk-services,.bk-booking,.bk-reviews,.bk-faq{padding:56px 24px}
  .bk-gallery-grid{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:none}
  .bk-gi{grid-column:auto!important;grid-row:auto!important;height:180px}
  .bk-gi:nth-child(1){grid-column:1/3!important;height:240px}
  .bk-services-head{flex-direction:column;align-items:flex-start;gap:8px}
  .bk-services-note{text-align:left;max-width:none}
  .bk-svc-grid{grid-template-columns:1fr}
  .bk-wiz-layout{grid-template-columns:1fr}
  .bk-summary{position:static}
  .bk-s1-grid{grid-template-columns:1fr}
  .bk-slots-grid{grid-template-columns:repeat(3,1fr)}
  .bk-form-2col{grid-template-columns:1fr}
  .bk-reviews-grid{grid-template-columns:1fr}
  .bk-faq-grid{grid-template-columns:1fr;gap:28px}
  .bk-footer{flex-direction:column;gap:12px;text-align:center;padding:28px 24px}
}
`
