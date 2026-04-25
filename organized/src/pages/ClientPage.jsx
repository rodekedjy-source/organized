/**
 * ClientPage.jsx — Page publique · Book · Shop · Learn
 * Route:  /:slug
 * Import: '../lib/supabase'
 * Hero: WebGL fluid shader (warm cream organic animation)
 */

import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// ── WebGL Shader strings ──────────────────────────────────────────────────────
const VERT = `attribute vec2 a_pos;void main(){gl_Position=vec4(a_pos,0.,1.);}`

const FRAG = `
precision mediump float;
uniform float u_t;
uniform vec2 u_r;

float h(vec2 p){p=fract(p*vec2(234.34,435.345));p+=dot(p,p+34.23);return fract(p.x*p.y);}
float n(vec2 p){
  vec2 i=floor(p),f=fract(p);
  f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p){
  float v=0.,a=.5;
  mat2 m=mat2(.8,-.6,.6,.8);
  for(int i=0;i<6;i++){v+=a*n(p);p=m*p*2.1;a*=.5;}
  return v;
}

void main(){
  vec2 uv=gl_FragCoord.xy/u_r;
  float t=u_t*.08;
  uv.y=1.-uv.y;
  vec2 q=vec2(fbm(uv+t*.25),fbm(uv+vec2(5.2,1.3)));
  vec2 r=vec2(fbm(uv+4.*q+vec2(1.7,9.2)+.15*t),fbm(uv+4.*q+vec2(8.3,2.8)+.126*t));
  float f=fbm(uv+4.*r);

  /* Warm cream ↔ warm dark palette */
  vec3 c=mix(vec3(.86,.79,.68),vec3(.13,.09,.05),clamp(f*f*3.8,0.,1.));
  c=mix(c,vec3(.93,.88,.80),clamp(length(q)*.45,0.,1.));
  c=mix(c,vec3(.50,.36,.22),clamp(f*f*f+.6*f*f+.4*f,0.,1.));
  gl_FragColor=vec4(c,1.);
}
`

// ── Shader hook ───────────────────────────────────────────────────────────────
function useShader(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl')
    if (!gl) return

    function compile(type, src) {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }

    const prog = gl.createProgram()
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const uT = gl.getUniformLocation(prog, 'u_t')
    const uR = gl.getUniformLocation(prog, 'u_r')

    let raf, start = null

    function resize() {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    function draw(ts) {
      if (!start) start = ts
      const t = (ts - start) / 1000
      gl.uniform1f(uT, t)
      gl.uniform2f(uR, canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      gl.deleteProgram(prog)
      gl.deleteBuffer(buf)
    }
  }, [canvasRef])
}

// ── Constants ─────────────────────────────────────────────────────────────────
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const Icons = {
  instagram: (<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>),
  tiktok:    (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.14 8.14 0 0 0 4.77 1.52V6.75a4.85 4.85 0 0 1-1-.06z"/></svg>),
  facebook:  (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>),
  twitter:   (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>),
  globe:     (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><line x1="2" y1="12" x2="22" y2="12"/></svg>),
  star:      (<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>),
  back:      (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>),
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const pad    = n => String(n).padStart(2,'0')
const toMin  = t => { const [h,m]=t.split(':').map(Number); return h*60+m }
const frMin  = m => `${pad(Math.floor(m/60))}:${pad(m%60)}`
const fmt12  = t => { const [h,m]=t.split(':').map(Number); const p=h>=12?'PM':'AM'; const h12=h===0?12:h>12?h-12:h; return `${h12}:${pad(m)} ${p}` }
const fmtDur = m => { if(!m)return''; if(m<60)return`${m} min`; const h=Math.floor(m/60),r=m%60; return r?`${h}h ${r}min`:`${h} hr` }
const fmtP   = p => !p||p===0 ? 'Free' : `$${Math.round(p)}`
const fmtSP  = s => s.is_free||s.price===0 ? 'Free' : `$${Math.round(s.price)} & up`

const svcIcon = n => { const x=n.toLowerCase(); if(x.includes('color')||x.includes('balayage'))return'✦'; if(x.includes('cut')||x.includes('coupe'))return'◆'; if(x.includes('natural')||x.includes('texture'))return'❋'; if(x.includes('keratin'))return'◈'; if(x.includes('bridal'))return'◇'; if(x.includes('consult'))return'○'; return'◉' }
const svcAdn = n => { const x=n.toLowerCase(); if(x.includes('color')||x.includes('balayage'))return['Toning +$40','Deep Condition +$30','Olaplex +$50']; if(x.includes('cut'))return['Blowout +$35','Deep Treatment +$45']; if(x.includes('natural')||x.includes('texture'))return['Scalp Massage +$20','Steam Treatment +$30']; if(x.includes('keratin'))return['Express Blowout +$40','Olaplex +$50']; if(x.includes('bridal'))return['Trial Run +$120','Bridesmaid Styling +$85/person']; return[] }

function buildSocials(ws){
  const l=[]
  if(ws.instagram) l.push({k:'ig',icon:Icons.instagram,label:'Instagram',href:`https://instagram.com/${ws.instagram.replace('@','')}`})
  if(ws.tiktok)    l.push({k:'tt',icon:Icons.tiktok,label:'TikTok',href:`https://tiktok.com/@${ws.tiktok.replace('@','')}`})
  if(ws.facebook)  l.push({k:'fb',icon:Icons.facebook,label:'Facebook',href:ws.facebook.startsWith('http')?ws.facebook:`https://facebook.com/${ws.facebook}`})
  if(ws.twitter)   l.push({k:'tw',icon:Icons.twitter,label:'X',href:`https://x.com/${ws.twitter.replace('@','')}`})
  if(ws.website)   l.push({k:'ww',icon:Icons.globe,label:'Website',href:ws.website.startsWith('http')?ws.website:`https://${ws.website}`})
  return l
}

const FAQS = {
  book: [
    {q:"What's the cancellation policy?",     a:"Free cancellation up to 24 hours before your appointment. Cancellations within 24 hours forfeit the deposit."},
    {q:"Do you require a deposit?",            a:"Services over $100 require a $40 deposit at booking — applied to your total, fully refundable with 24h+ notice."},
    {q:"How should I arrive?",                 a:"Clean, dry hair unless specified. Bring inspiration photos — the more reference, the better the result."},
    {q:"Do you work with all textures?",       a:"Yes. Every service adapts to your hair type, from fine straight to tight coils. Unsure? Book a free Consultation first."},
  ],
  shop: [
    {q:"How do I pay for my order?",           a:"After placing your order, you'll be contacted with payment details. We accept e-Transfer, Interac, and major cards."},
    {q:"Pickup or delivery?",                  a:"Pickup is always available. Local delivery may be offered — the stylist will confirm at order time."},
    {q:"What if a product is out of stock?",   a:"Products shown are in stock. If stock runs out after ordering, you'll be notified and fully refunded."},
    {q:"Can I return a product?",              a:"Contact the stylist within 7 days of receiving your order. Unopened products may be returned for store credit."},
  ],
  learn: [
    {q:"What's included in a formation?",      a:"All course materials are included. Duration, format, and full details are listed on each formation card."},
    {q:"Online or in-person?",                 a:"Both formats are available depending on the formation — indicated on each card."},
    {q:"Do I need prior experience?",          a:"No prior experience required unless specified. Formations welcome all levels."},
    {q:"How and when do I pay?",               a:"After enrolling, you'll be contacted with payment instructions and session confirmation."},
  ],
}

function StarRow({ rating }) {
  return (
    <div style={{display:'flex',gap:2}}>
      {Array.from({length:5},(_,i)=>(
        <span key={i} style={{color:i<rating?'#B89030':'rgba(184,144,48,0.2)',display:'flex'}}>{Icons.star}</span>
      ))}
    </div>
  )
}

function ReviewCard({ review }) {
  return (
    <div className="cp-rev-card">
      <div className="cp-rev-top">
        <StarRow rating={review.rating}/>
        {review.service_label&&<div className="cp-rev-svc">{review.service_label}</div>}
      </div>
      {review.body&&<p className="cp-rev-body">{review.body}</p>}
      <div className="cp-rev-author">
        <div className="cp-rev-av">{review.reviewer_name.charAt(0).toUpperCase()}</div>
        <div className="cp-rev-name">{review.reviewer_name}</div>
      </div>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ClientPage() {
  const { slug } = useParams()
  const canvasRef = useRef(null)
  useShader(canvasRef)

  useLayoutEffect(() => {
    const el = document.createElement('style')
    el.id = 'cp-page-styles'
    el.textContent = STYLES
    document.head.appendChild(el)
    return () => document.getElementById('cp-page-styles')?.remove()
  }, [])

  // Data
  const [ws,        setWs]        = useState(null)
  const [services,  setServices]  = useState([])
  const [products,  setProducts]  = useState([])
  const [offerings, setOfferings] = useState([])
  const [portfolio, setPortfolio] = useState([])
  const [wsReviews, setWsReviews] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  const [activeTab,  setActiveTab]  = useState('book')
  const [prodDetail, setProdDetail] = useState(null)
  const [offDetail,  setOffDetail]  = useState(null)

  const today = new Date()
  const [calYear,   setCalYear]   = useState(today.getFullYear())
  const [calMonth,  setCalMonth]  = useState(today.getMonth())
  const [availDays, setAvailDays] = useState([])
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

  const [shopModal, setShopModal] = useState(null)
  const [shopForm,  setShopForm]  = useState({fname:'',lname:'',email:'',phone:'',qty:1})
  const [shopSub,   setShopSub]   = useState(false)
  const [shopDone,  setShopDone]  = useState(null)

  const [learnModal, setLearnModal] = useState(null)
  const [learnForm,  setLearnForm]  = useState({fname:'',lname:'',email:'',phone:''})
  const [learnSub,   setLearnSub]   = useState(false)
  const [learnDone,  setLearnDone]  = useState(null)

  useEffect(() => {
    if (!slug) return
    ;(async () => {
      try {
        const { data: workspace, error: wErr } = await supabase
          .from('workspaces')
          .select('id,name,slug,tagline,bio,avatar_url,cover_url,instagram,tiktok,website,facebook,twitter,location,currency,timezone,is_published,accepts_bookings,accepts_orders')
          .eq('slug', slug).single()
        if (wErr || !workspace) throw new Error('Not found')

        const [{ data: svcs },{ data: prods },{ data: offs },{ data: revs }] = await Promise.all([
          supabase.from('services').select('id,name,description,duration_min,price,currency,is_free,display_order').eq('workspace_id', workspace.id).eq('is_active', true).is('deleted_at', null).order('display_order', { ascending: true }),
          supabase.from('products').select('id,name,description,price,currency,stock,image_url,images').eq('workspace_id', workspace.id).eq('is_active', true).is('deleted_at', null).gt('stock', 0),
          supabase.from('offerings').select('id,title,description,price,currency,duration_label,format,max_students').eq('workspace_id', workspace.id).eq('is_active', true).is('deleted_at', null),
          supabase.from('reviews').select('*').eq('workspace_id', workspace.id).eq('entity_type', 'workspace').eq('is_visible', true).order('created_at', { ascending: false }).limit(12),
        ])

        setWs(workspace); setServices(svcs||[]); setProducts(prods||[]); setOfferings(offs||[]); setWsReviews(revs||[])
        document.title = `${workspace.name} — Organized.`
        const hasSvcs = (svcs||[]).length > 0 && workspace.accepts_bookings !== false
        setActiveTab(hasSvcs ? 'book' : (prods||[]).length > 0 ? 'shop' : 'learn')
      } catch(e) { setError(e.message) }
      finally    { setLoading(false) }
    })()
  }, [slug])

  async function openProdDetail(p) {
    const { data: revs } = await supabase.from('reviews').select('*').eq('entity_id', p.id).eq('entity_type', 'product').eq('is_visible', true).order('created_at', { ascending: false })
    setProdDetail({ ...p, reviews: revs||[] })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function openOffDetail(o) {
    const { data: revs } = await supabase.from('reviews').select('*').eq('entity_id', o.id).eq('entity_type', 'offering').eq('is_visible', true).order('created_at', { ascending: false })
    setOffDetail({ ...o, reviews: revs||[] })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
        if (dt<=todayMid||!dows.has(dt.getDay())||blkSet.has(`${calYear}-${pad(calMonth+1)}-${pad(d)}`)) continue
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
      const ds = `${calYear}-${pad(calMonth+1)}-${pad(day)}`
      const dow = new Date(calYear, calMonth, day).getDay()
      const dur = selSvc?.duration_min || 60
      const [{ data: wins },{ data: appts }] = await Promise.all([
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
          gen.push({ raw:frMin(cur), display:fmt12(frMin(cur)), booked:booked.some(b=>cur<b.e&&end>b.s) })
          cur+=30
        }
      }
      setSlots(gen)
    } catch(e) { console.error(e) }
    finally { setLoadSlots(false) }
  }

  function pickSvc(s){ setSelSvc(s); setSelAddons([]) }
  function toggleAddon(a){ setSelAddons(p=>p.includes(a)?p.filter(x=>x!==a):[...p,a]) }
  function pickDay(d){ setSelDay(d); setSelTime(null); fetchSlots(d) }
  function pickTime(sl){ if(!sl.booked) setSelTime(sl.raw) }
  function changeMonth(dir){
    const now=new Date(); let y=calYear,m=calMonth+dir
    if(m<0){m=11;y--} if(m>11){m=0;y++}
    if(y<now.getFullYear()||(y===now.getFullYear()&&m<now.getMonth())) return
    setCalYear(y); setCalMonth(m); setSelDay(null); setSelTime(null); setSlots([])
  }
  function goStep(n){
    if(n===2&&!selSvc||n===3&&(!selDay||!selTime)) return
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
      const {error:iErr}=await supabase.from('appointments').insert({
        workspace_id:ws.id, service_id:selSvc.id, service_name:selSvc.name,
        client_name:`${bkForm.fname.trim()} ${bkForm.lname.trim()}`,
        client_email:bkForm.email.trim(), client_phone:bkForm.phone.trim(),
        notes:((selAddons.length?`[Add-ons: ${selAddons.join(', ')}]\n`:'')+bkForm.notes).trim()||null,
        scheduled_at:sAt.toISOString(), duration_min:dur, ends_at:eAt.toISOString(),
        status:'pending', amount:selSvc.is_free?0:selSvc.price,
        currency:selSvc.currency||ws.currency||'CAD', payment_status:'unpaid',
      })
      if(iErr){if(iErr.code==='23505'){alert('Slot taken — pick another.');setSelTime(null);fetchSlots(selDay);setBkStep(2);return} throw iErr}
      setBkDone({ serviceName:selSvc.name, displayDate:`${MONTHS[calMonth]} ${selDay}, ${calYear}`, displayTime:fmt12(selTime), duration:fmtDur(dur), email:bkForm.email.trim(), addons:selAddons, needsDeposit:!selSvc.is_free&&selSvc.price>=100 })
      setBkStep(4)
    } catch(e){alert('Something went wrong.');console.error(e)}
    finally{setBkSub(false)}
  }

  function openShop(p){ setShopModal(p); setShopDone(null); setShopForm({fname:'',lname:'',email:'',phone:'',qty:1}) }
  async function submitOrder(){
    const f=shopForm
    if(!f.fname.trim()||!f.lname.trim()||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())||f.phone.replace(/\D/g,'').length<7){ alert('Fill all required fields.'); return }
    setShopSub(true)
    try {
      const p=shopModal
      await supabase.from('orders').insert({ workspace_id:ws.id, product_id:p.id, client_name:`${f.fname.trim()} ${f.lname.trim()}`, client_email:f.email.trim(), client_phone:f.phone.trim(), quantity:f.qty||1, unit_price:p.price, total_amount:p.price*(f.qty||1), currency:p.currency||ws.currency||'CAD', status:'pending', payment_status:'unpaid' })
      setShopDone({productName:p.name,qty:f.qty,email:f.email.trim()})
    } catch(e){alert('Something went wrong.');console.error(e)}
    finally{setShopSub(false)}
  }

  function openLearn(o){ setLearnModal(o); setLearnDone(null); setLearnForm({fname:'',lname:'',email:'',phone:''}) }
  async function submitEnrollment(){
    const f=learnForm
    if(!f.fname.trim()||!f.lname.trim()||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())||f.phone.replace(/\D/g,'').length<7){ alert('Fill all required fields.'); return }
    setLearnSub(true)
    const o=learnModal
    try {
      await supabase.from('enrollments').insert({ workspace_id:ws.id, offering_id:o.id, client_name:`${f.fname.trim()} ${f.lname.trim()}`, client_email:f.email.trim(), client_phone:f.phone.trim(), amount_paid:0, currency:o.currency||ws.currency||'CAD', payment_status:'unpaid', status:'active' })
      setLearnDone({title:o.title,email:f.email.trim()})
    } catch(e){alert('Something went wrong.');console.error(e)}
    finally{setLearnSub(false)}
  }

  function renderCal(){
    const fd=new Date(calYear,calMonth,1).getDay()
    const dim=new Date(calYear,calMonth+1,0).getDate()
    const todayMid=new Date(); todayMid.setHours(0,0,0,0)
    const avSet=new Set(availDays); const cells=[]
    for(let i=0;i<fd;i++) cells.push(<div key={`e${i}`} className="cp-day empty"/>)
    for(let d=1;d<=dim;d++){
      const date=new Date(calYear,calMonth,d)
      const isToday=date.toDateString()===todayMid.toDateString()
      const isPast=date<todayMid; const isAvail=avSet.has(d)&&!isPast&&!isToday; const isSel=selDay===d
      let cls='cp-day'+(isSel?' sel':isPast?' past':isToday?' today':isAvail?' avail':' off')
      cells.push(<div key={d} className={cls} onClick={isAvail&&!isSel?()=>pickDay(d):undefined}>{d}</div>)
    }
    return cells
  }

  const Splash=({msg})=>(
    <div style={{minHeight:'100vh',background:'#C8B89A',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontFamily:'Playfair Display,Georgia,serif',fontSize:24,color:'#3A2A18',marginBottom:12}}>Organized.</div>
        <div style={{fontSize:12,color:'rgba(58,42,24,0.5)',letterSpacing:'0.14em',textTransform:'uppercase'}}>{msg}</div>
      </div>
    </div>
  )

  if(loading)           return <Splash msg="Loading…"/>
  if(error||!ws)        return <Splash msg="This page doesn't exist."/>
  if(!ws.is_published)  return <Splash msg="Not available yet."/>

  const socials   = buildSocials(ws)
  const firstName = ws.name.split(' ')[0]
  const hasBook   = services.length > 0 && ws.accepts_bookings !== false
  const hasShop   = products.length > 0 && ws.accepts_orders !== false
  const hasLearn  = offerings.length > 0
  const hasPF     = portfolio.length > 0
  const tabs      = [...(hasBook?[{id:'book',label:'Book a Service'}]:[]),...(hasShop?[{id:'shop',label:'Shop'}]:[]),...(hasLearn?[{id:'learn',label:'Formations'}]:[])]
  const addons    = selSvc ? svcAdn(selSvc.name) : []
  const needsDep  = selSvc && !selSvc.is_free && selSvc.price >= 100
  const selDateD  = selDay ? `${MONTHS[calMonth]} ${selDay}, ${calYear}` : null
  const selDTD    = selDateD&&selTime ? `${selDateD} · ${fmt12(selTime)}` : selDateD
  const isCurMo   = calYear===today.getFullYear()&&calMonth===today.getMonth()
  const faqItems  = FAQS[activeTab] || FAQS.book
  const nextAvail = availDays.length > 0 ? `${MONTHS[calMonth]} ${availDays[0]}` : 'See calendar'

  function switchTab(id){
    setActiveTab(id); setProdDetail(null); setOffDetail(null)
    setTimeout(()=>document.getElementById('cp-content-start')?.scrollIntoView({behavior:'smooth',block:'start'}),50)
  }

  return (
    <>
      {/* NAV */}
      <nav className="cp-nav">
        <div className="cp-logo">Organized.<span>by {ws.name}</span></div>
        {hasBook && (
          <button className="cp-nav-cta" onClick={()=>{ setActiveTab('book'); document.getElementById('cp-content-start')?.scrollIntoView({behavior:'smooth'}) }}>
            Book Now
          </button>
        )}
      </nav>

      {/* ═══ SHADER WRAP — hero + tabs on warm fluid bg ═══ */}
      <div className="cp-shader-wrap">

        {/* WebGL canvas — fills the entire wrap */}
        <canvas ref={canvasRef} className="cp-shader-canvas" />

        {/* HERO */}
        <section className="cp-hero">
          {/* Left — dark overlay for text legibility */}
          <div className="cp-hero-left">
            <div className="cp-hero-overlay-left" />
            <div className="cp-hero-content">
              <div className="cp-hero-tag">
                {ws.accepts_bookings!==false
                  ? <><span className="cp-tag-dot"/>&nbsp;Accepting bookings</>
                  : 'Viewing only'}
              </div>

              <h1 className="cp-hero-name">
                {ws.name.split(' ')[0]}
                {ws.name.split(' ').length > 1 && <><br/><em>{ws.name.split(' ').slice(1).join(' ')}</em></>}
              </h1>

              {ws.tagline && <p className="cp-hero-title">{ws.tagline}</p>}
              {ws.location && <p className="cp-hero-sub"><span className="cp-gold-dot">◉</span>{ws.location}</p>}
              {ws.bio && <p className="cp-hero-bio">{ws.bio}</p>}

              {socials.length > 0 && (
                <div className="cp-socials">
                  {socials.map(({k,icon,label,href})=>(
                    <a key={k} href={href} target="_blank" rel="noreferrer" className="cp-social" title={label}>{icon}</a>
                  ))}
                </div>
              )}

              <div className="cp-hero-cta">
                {hasBook && (
                  <button className="cp-btn-dark" onClick={()=>{ setActiveTab('book'); document.getElementById('cp-content-start')?.scrollIntoView({behavior:'smooth'}) }}>
                    Book a Session
                  </button>
                )}
                {hasShop && (
                  <button className="cp-btn-outline" onClick={()=>{ setActiveTab('shop'); document.getElementById('cp-content-start')?.scrollIntoView({behavior:'smooth'}) }}>
                    Shop
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right — cover photo with shader showing through when no photo */}
          <div className="cp-hero-right">
            {ws.cover_url && (
              <>
                <img src={ws.cover_url} alt={ws.name} className="cp-cover-img"/>
                <div className="cp-cover-overlay"/>
              </>
            )}
            {!ws.cover_url && (
              <div className="cp-portrait-wrap">
                <div className="cp-p-head"/><div className="cp-p-neck"/>
                <div className="cp-p-body"/><div className="cp-p-glow"/>
              </div>
            )}

            {hasBook && (
              <div className="cp-fc">
                <div className="cp-fc-lbl">Next Available</div>
                <div className="cp-fc-val">{nextAvail}</div>
              </div>
            )}
          </div>
        </section>

        {/* TABS BAR — bottom of shader wrap */}
        <div className="cp-tabs-bar" id="cp-content-start">
          {tabs.map(t=>(
            <button key={t.id} className={`cp-tab-btn ${activeTab===t.id?'active':''}`} onClick={()=>switchTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ CONTENT — ivory sections ═══ */}

      {/* BOOK */}
      {activeTab==='book' && hasBook && (
        <section id="cp-book-anchor" className="cp-section">
          <div className="cp-inner">
            <div className="cp-eyebrow">Booking</div>
            <h2 className="cp-heading">Reserve your <em>moment</em></h2>

            {bkStep < 4 && (
              <>
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
                <div className="cp-wiz-layout">
                  <div className="cp-summary">
                    <div className="cp-sum-title">Summary</div>
                    <div className="cp-sum-row"><div className="cp-sum-k">Stylist</div><div className="cp-sum-v">{ws.name}</div></div>
                    <div className="cp-sum-row"><div className="cp-sum-k">Service</div>{selSvc?<><div className="cp-sum-v">{selSvc.name}</div>{selSvc.duration_min&&<div className="cp-sum-s">{fmtDur(selSvc.duration_min)}</div>}</>:<div className="cp-sum-e">—</div>}</div>
                    <div className="cp-sum-row"><div className="cp-sum-k">Date & Time</div>{selDTD?<div className="cp-sum-v">{selDTD}</div>:<div className="cp-sum-e">—</div>}</div>
                    <div className="cp-sum-row"><div className="cp-sum-k">Price</div>{selSvc?<div className="cp-sum-v">{fmtSP(selSvc)}</div>:<div className="cp-sum-e">—</div>}</div>
                    {needsDep&&<div className="cp-deposit"><strong>$40 deposit</strong> required. Applied to your total. Refundable with 24h+ notice.</div>}
                  </div>
                  <div>
                    {bkStep===1&&(
                      <div>
                        <p className="cp-step-note">Select the service you'd like to book.</p>
                        <div className="cp-s1-grid">
                          {services.map(s=>(
                            <div key={s.id} className={`cp-s1-card ${selSvc?.id===s.id?'sel':''}`} onClick={()=>pickSvc(s)}>
                              <div className="cp-s1-chk">✓</div>
                              <div className="cp-s1-icon">{svcIcon(s.name)}</div>
                              <div className="cp-s1-name">{s.name}</div>
                              {s.duration_min&&<div className="cp-s1-meta">{fmtDur(s.duration_min)}</div>}
                              <div className="cp-s1-price">{fmtSP(s)}</div>
                            </div>
                          ))}
                        </div>
                        {selSvc&&addons.length>0&&<div className="cp-addons"><div className="cp-addons-lbl">Pair it with</div><div className="cp-chips">{addons.map(a=><div key={a} className={`cp-chip ${selAddons.includes(a)?'on':''}`} onClick={()=>toggleAddon(a)}>{a}</div>)}</div></div>}
                        <div className="cp-nav-row"><span/><button className="cp-btn-next" onClick={()=>goStep(2)} disabled={!selSvc}>Next — Pick a Time &#8594;</button></div>
                      </div>
                    )}
                    {bkStep===2&&(
                      <div>
                        <p className="cp-step-note">Highlighted dates have openings. Select a date then a time.</p>
                        <div className="cp-cal-wrap">
                          <div className="cp-cal-head"><div className="cp-cal-month">{MONTHS[calMonth]} {calYear}</div><div className="cp-cal-nav"><button className="cp-cal-btn" onClick={()=>changeMonth(-1)} disabled={isCurMo}>&#8249;</button><button className="cp-cal-btn" onClick={()=>changeMonth(1)}>&#8250;</button></div></div>
                          <div className="cp-dnames">{['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=><div key={d} className="cp-dname">{d}</div>)}</div>
                          <div className="cp-cal-grid">{renderCal()}</div>
                        </div>
                        {selDay&&<div className="cp-slots-wrap"><div className="cp-slots-lbl">Available Times — {selDateD}</div>{loadSlots?<div className="cp-slots-empty">Loading…</div>:slots.length===0?<div className="cp-slots-empty">No availability for this date.</div>:<div className="cp-slots-grid">{slots.map(sl=><div key={sl.raw} className={`cp-slot ${sl.booked?'booked':selTime===sl.raw?'sel':'avail'}`} onClick={()=>!sl.booked&&pickTime(sl)}>{sl.display}</div>)}</div>}</div>}
                        <div className="cp-nav-row"><button className="cp-btn-back" onClick={()=>goStep(1)}>&#8592; Back</button><button className="cp-btn-next" onClick={()=>goStep(3)} disabled={!selDay||!selTime}>Next — Your Info &#8594;</button></div>
                      </div>
                    )}
                    {bkStep===3&&(
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
                        <div className="cp-nav-row"><button className="cp-btn-back" onClick={()=>goStep(2)}>&#8592; Back</button><button className="cp-btn-next" onClick={submitBooking} disabled={bkSub}>{bkSub?'Confirming…':'Confirm Appointment →'}</button></div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {bkStep===4&&bkDone&&(
              <div className="cp-success">
                <div className="cp-success-icon">✓</div>
                <h2 className="cp-success-title">You&apos;re booked.</h2>
                <p className="cp-success-sub">Confirmation sent to <strong>{bkDone.email}</strong>.<br/>{firstName} will see you soon.</p>
                <div className="cp-success-card">
                  <div className="cp-sc-row"><span className="cp-sc-k">Stylist</span><span className="cp-sc-v">{ws.name}</span></div>
                  <div className="cp-sc-row"><span className="cp-sc-k">Service</span><span className="cp-sc-v">{bkDone.serviceName}</span></div>
                  {bkDone.addons.length>0&&<div className="cp-sc-row"><span className="cp-sc-k">Add-ons</span><span className="cp-sc-v">{bkDone.addons.join(', ')}</span></div>}
                  <div className="cp-sc-row"><span className="cp-sc-k">Date</span><span className="cp-sc-v">{bkDone.displayDate}</span></div>
                  <div className="cp-sc-row"><span className="cp-sc-k">Time</span><span className="cp-sc-v">{bkDone.displayTime}</span></div>
                  <div className="cp-sc-row"><span className="cp-sc-k">Duration</span><span className="cp-sc-v">{bkDone.duration}</span></div>
                  {bkDone.needsDeposit&&<div className="cp-sc-row"><span className="cp-sc-k">Deposit</span><span className="cp-sc-v" style={{color:'var(--gold-d)'}}>$40 — pending</span></div>}
                </div>
                <button className="cp-btn-gold" onClick={()=>window.location.reload()}>Book Another</button>
              </div>
            )}
          </div>

          {wsReviews.length>0&&(
            <div className="cp-inner" style={{marginTop:72}}>
              <div className="cp-eyebrow">Client Love</div>
              <h3 className="cp-heading" style={{marginBottom:32}}>What they <em>say</em></h3>
              <div className="cp-rev-grid">{wsReviews.map(r=><ReviewCard key={r.id} review={r}/>)}</div>
            </div>
          )}
        </section>
      )}

      {hasPF&&activeTab==='book'&&(
        <section className="cp-section cp-section-alt">
          <div className="cp-inner">
            <div className="cp-eyebrow">Portfolio</div>
            <h2 className="cp-heading">The <em>work</em></h2>
            <div className="cp-portfolio-grid">
              {portfolio.map((photo,i)=>(
                <div key={photo.id||i} className={`cp-pf-item ${i===0?'cp-pf-main':''}`}>
                  <img src={photo.url} alt={photo.caption||`Portfolio ${i+1}`}/>
                  {photo.caption&&<div className="cp-pf-caption">{photo.caption}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SHOP */}
      {activeTab==='shop'&&hasShop&&(
        <>
          {!prodDetail?(
            <section className="cp-section">
              <div className="cp-inner">
                <div className="cp-eyebrow">Shop</div>
                <h2 className="cp-heading">Products by <em>{firstName}</em></h2>
                <div className="cp-prod-grid">
                  {products.map(p=>{
                    const imgSrc=p.image_url||(p.images&&p.images[0])||null
                    return (
                      <div key={p.id} className="cp-prod-card" onClick={()=>openProdDetail(p)} style={{cursor:'pointer'}}>
                        <div className="cp-prod-img">
                          {imgSrc?<img src={imgSrc} alt={p.name}/>:<div className="cp-prod-ph">◈</div>}
                          {p.stock<=3&&<div className="cp-prod-badge">Only {p.stock} left</div>}
                        </div>
                        <div className="cp-prod-body">
                          <div className="cp-prod-name">{p.name}</div>
                          {p.description&&<div className="cp-prod-desc">{p.description}</div>}
                          <div className="cp-prod-foot">
                            <div className="cp-prod-price">{fmtP(p.price)}</div>
                            <span className="cp-prod-see">View →</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          ):(
            <section className="cp-section">
              <div className="cp-inner">
                <button className="cp-back-btn" onClick={()=>setProdDetail(null)}>{Icons.back}&nbsp;Back to Shop</button>
                <div className="cp-detail-layout">
                  <div className="cp-detail-img">
                    {(prodDetail.image_url||(prodDetail.images&&prodDetail.images[0]))?<img src={prodDetail.image_url||(prodDetail.images&&prodDetail.images[0])} alt={prodDetail.name}/>:<div className="cp-detail-ph">◈</div>}
                  </div>
                  <div className="cp-detail-info">
                    <div className="cp-eyebrow">Product</div>
                    <h2 className="cp-detail-title">{prodDetail.name}</h2>
                    <div className="cp-detail-price">{fmtP(prodDetail.price)}</div>
                    {prodDetail.description&&<p className="cp-detail-desc">{prodDetail.description}</p>}
                    {prodDetail.stock<=3&&<div style={{marginTop:12,fontSize:12,color:'var(--gold-d)',fontWeight:500}}>Only {prodDetail.stock} left in stock</div>}
                    <button className="cp-btn-gold" style={{marginTop:24}} onClick={()=>openShop(prodDetail)}>Order This Product</button>
                  </div>
                </div>
                {prodDetail.reviews.length>0&&(
                  <div style={{marginTop:56}}>
                    <div className="cp-eyebrow">Reviews</div>
                    <h3 className="cp-heading" style={{marginBottom:28}}>What clients <em>say</em></h3>
                    <div className="cp-rev-grid">{prodDetail.reviews.map(r=><ReviewCard key={r.id} review={r}/>)}</div>
                  </div>
                )}
                {prodDetail.reviews.length===0&&<p style={{marginTop:48,fontSize:13,color:'var(--tx-m)',fontStyle:'italic'}}>No reviews yet for this product.</p>}
              </div>
            </section>
          )}
        </>
      )}

      {/* LEARN */}
      {activeTab==='learn'&&hasLearn&&(
        <>
          {!offDetail?(
            <section className="cp-section">
              <div className="cp-inner">
                <div className="cp-eyebrow">Formations</div>
                <h2 className="cp-heading">Learn from <em>{firstName}</em></h2>
                <div className="cp-off-grid">
                  {offerings.map(o=>(
                    <div key={o.id} className="cp-off-card" onClick={()=>openOffDetail(o)} style={{cursor:'pointer'}}>
                      <div className="cp-off-top"><div className="cp-off-icon">◈</div>{o.format&&<div className="cp-off-fmt">{o.format}</div>}</div>
                      <div className="cp-off-title">{o.title}</div>
                      {o.description&&<div className="cp-off-desc">{o.description}</div>}
                      <div className="cp-off-meta">{o.duration_label&&<span>&#9201; {o.duration_label}</span>}{o.max_students&&<span>&#128101; Max {o.max_students}</span>}</div>
                      <div className="cp-off-foot"><div className="cp-off-price">{fmtP(o.price)}</div><span className="cp-prod-see">View →</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ):(
            <section className="cp-section">
              <div className="cp-inner">
                <button className="cp-back-btn" onClick={()=>setOffDetail(null)}>{Icons.back}&nbsp;Back to Formations</button>
                <div className="cp-detail-layout">
                  <div className="cp-off-detail-badge">
                    <div className="cp-off-icon" style={{width:72,height:72,fontSize:32,marginBottom:16}}>◈</div>
                    {offDetail.format&&<div className="cp-off-fmt">{offDetail.format}</div>}
                    <div style={{marginTop:20,display:'flex',flexDirection:'column',gap:10}}>
                      {offDetail.duration_label&&<div style={{fontSize:13,color:'var(--tx-s)'}}>&#9201; {offDetail.duration_label}</div>}
                      {offDetail.max_students&&<div style={{fontSize:13,color:'var(--tx-s)'}}>&#128101; Max {offDetail.max_students} students</div>}
                    </div>
                  </div>
                  <div className="cp-detail-info">
                    <div className="cp-eyebrow">Formation</div>
                    <h2 className="cp-detail-title">{offDetail.title}</h2>
                    <div className="cp-detail-price">{fmtP(offDetail.price)}</div>
                    {offDetail.description&&<p className="cp-detail-desc">{offDetail.description}</p>}
                    <button className="cp-btn-gold" style={{marginTop:24}} onClick={()=>openLearn(offDetail)}>Enroll Now</button>
                  </div>
                </div>
                {offDetail.reviews.length>0&&(
                  <div style={{marginTop:56}}>
                    <div className="cp-eyebrow">Reviews</div>
                    <h3 className="cp-heading" style={{marginBottom:28}}>What students <em>say</em></h3>
                    <div className="cp-rev-grid">{offDetail.reviews.map(r=><ReviewCard key={r.id} review={r}/>)}</div>
                  </div>
                )}
                {offDetail.reviews.length===0&&<p style={{marginTop:48,fontSize:13,color:'var(--tx-m)',fontStyle:'italic'}}>No reviews yet for this formation.</p>}
              </div>
            </section>
          )}
        </>
      )}

      {/* FAQ */}
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

      {/* FOOTER */}
      <footer className="cp-footer">
        <div className="cp-footer-logo">Organized.</div>
        <div className="cp-footer-socials">{socials.map(({k,icon,label,href})=><a key={k} href={href} target="_blank" rel="noreferrer" className="cp-footer-social" title={label}>{icon}</a>)}</div>
        <div className="cp-footer-right">Powered by <a href="https://beorganized.io" target="_blank" rel="noreferrer">beorganized.io</a></div>
      </footer>

      {/* SHOP MODAL */}
      {shopModal&&(
        <div className="cp-overlay" onClick={e=>{if(e.target.classList.contains('cp-overlay')){setShopModal(null);setShopDone(null)}}}>
          <div className="cp-modal">
            <button className="cp-modal-close" onClick={()=>{setShopModal(null);setShopDone(null)}}>✕</button>
            {!shopDone?(<>
              <div className="cp-modal-title">Order — {shopModal.name}</div>
              <div className="cp-modal-price">{fmtP(shopModal.price)}</div>
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
            </>):(<div className="cp-success" style={{padding:'20px 0 4px'}}>
              <div className="cp-success-icon">✓</div>
              <h3 className="cp-success-title" style={{fontSize:22}}>Order placed!</h3>
              <p className="cp-success-sub">Confirmation to {shopDone.email}.</p>
              <button className="cp-btn-ghost" onClick={()=>{setShopModal(null);setShopDone(null)}}>Close</button>
            </div>)}
          </div>
        </div>
      )}

      {/* LEARN MODAL */}
      {learnModal&&(
        <div className="cp-overlay" onClick={e=>{if(e.target.classList.contains('cp-overlay')){setLearnModal(null);setLearnDone(null)}}}>
          <div className="cp-modal">
            <button className="cp-modal-close" onClick={()=>{setLearnModal(null);setLearnDone(null)}}>✕</button>
            {!learnDone?(<>
              <div className="cp-modal-title">Enroll — {learnModal.title}</div>
              {learnModal.price>0&&<div className="cp-modal-price">{fmtP(learnModal.price)}</div>}
              <div className="cp-2col">
                <div className="cp-fg"><label className="cp-fl">First Name *</label><input className="cp-fi" type="text" placeholder="Marie" value={learnForm.fname} onChange={e=>setLearnForm(f=>({...f,fname:e.target.value}))}/></div>
                <div className="cp-fg"><label className="cp-fl">Last Name *</label><input className="cp-fi" type="text" placeholder="Dupont" value={learnForm.lname} onChange={e=>setLearnForm(f=>({...f,lname:e.target.value}))}/></div>
              </div>
              <div className="cp-fg"><label className="cp-fl">Email *</label><input className="cp-fi" type="email" placeholder="marie@example.com" value={learnForm.email} onChange={e=>setLearnForm(f=>({...f,email:e.target.value}))}/></div>
              <div className="cp-fg"><label className="cp-fl">Phone *</label><input className="cp-fi" type="tel" placeholder="+1 (514) 000-0000" value={learnForm.phone} onChange={e=>setLearnForm(f=>({...f,phone:e.target.value}))}/></div>
              <button className="cp-btn-gold cp-btn-block" onClick={submitEnrollment} disabled={learnSub}>{learnSub?'Enrolling…':'Confirm Enrollment →'}</button>
              <p className="cp-modal-note">{firstName} will contact you with payment and session details.</p>
            </>):(<div className="cp-success" style={{padding:'20px 0 4px'}}>
              <div className="cp-success-icon">✓</div>
              <h3 className="cp-success-title" style={{fontSize:22}}>Enrolled!</h3>
              <p className="cp-success-sub">Confirmation to {learnDone.email}.</p>
              <button className="cp-btn-ghost" onClick={()=>{setLearnModal(null);setLearnDone(null)}}>Close</button>
            </div>)}
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
  --bg:#F9F5EF; --bg2:#F1EAE0; --card:#FFFFFF;
  --gold:#C9A84C; --gold-d:#B89030;
  --gold-dim:rgba(184,144,48,.10); --gold-bdr:rgba(184,144,48,.28);
  --tx:#1C1814; --tx-m:#9A8E7C; --tx-s:#5A5040;
  --bdr:rgba(30,18,8,.08); --bdr-m:rgba(30,18,8,.14);
  --sh-sm:0 1px 8px rgba(30,18,8,.06); --sh:0 2px 20px rgba(30,18,8,.09);
  --err:#b94040; --ok:#3a9e6a;
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--tx);font-family:'DM Sans',sans-serif;overflow-x:hidden}
body::before{content:'';position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E");pointer-events:none;z-index:9999;opacity:.5;mix-blend-mode:multiply}

/* NAV — subtle on shader */
.cp-nav{position:fixed;top:0;left:0;right:0;z-index:600;padding:14px 40px;display:flex;align-items:center;justify-content:space-between;background:rgba(180,155,120,0.15);backdrop-filter:blur(20px);border-bottom:1px solid rgba(180,140,80,0.12)}
.cp-logo{font-family:'Playfair Display',serif;font-size:18px;letter-spacing:.04em;color:#2C1E0E;text-shadow:0 1px 12px rgba(255,240,200,.6)}
.cp-logo span{color:rgba(44,30,14,0.45);font-size:11px;margin-left:7px;font-family:'DM Sans',sans-serif;font-weight:300}
.cp-nav-cta{background:rgba(44,30,14,0.12);border:1px solid rgba(44,30,14,0.2);color:#2C1E0E;font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:.09em;text-transform:uppercase;cursor:pointer;padding:8px 18px;border-radius:2px;transition:all .22s;backdrop-filter:blur(8px)}
.cp-nav-cta:hover{background:rgba(44,30,14,0.22);border-color:rgba(44,30,14,0.4)}

/* SHADER WRAP — canvas fills this */
.cp-shader-wrap{position:relative;overflow:hidden}

.cp-shader-canvas{
  position:absolute;inset:0;width:100%;height:100%;
  display:block;z-index:0;
}

/* HERO */
.cp-hero{min-height:100vh;display:grid;grid-template-columns:52% 48%;position:relative;z-index:1}

/* Left — semi-dark overlay so text is legible over the warm shader */
.cp-hero-left{position:relative;display:flex;align-items:stretch}
.cp-hero-overlay-left{
  position:absolute;inset:0;
  background:linear-gradient(110deg,rgba(22,14,6,0.52) 0%,rgba(22,14,6,0.3) 60%,transparent 100%);
  pointer-events:none;z-index:0;
}
.cp-hero-content{
  position:relative;z-index:1;
  display:flex;flex-direction:column;justify-content:center;
  padding:130px 64px 80px;
}
.cp-hero-left::after{content:'';position:absolute;right:0;top:10%;bottom:10%;width:1px;background:linear-gradient(to bottom,transparent,rgba(200,160,80,.15),transparent);z-index:1}

/* Tag */
.cp-hero-tag{display:inline-flex;align-items:center;gap:8px;background:rgba(255,240,200,0.12);border:1px solid rgba(200,160,80,.25);border-radius:100px;padding:6px 16px 6px 10px;font-size:11px;color:rgba(255,235,160,.95);letter-spacing:.12em;text-transform:uppercase;margin-bottom:32px;width:fit-content;animation:cpFadeUp .6s ease both;backdrop-filter:blur(8px)}
.cp-tag-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#E8C97A;animation:cpPulse 2s infinite;flex-shrink:0}
@keyframes cpPulse{0%,100%{opacity:1}50%{opacity:.2}}
@keyframes cpFadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes cpScaleIn{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}

/* Text colors — white over the dark overlay */
.cp-gold-dot{color:#E8C97A;margin-right:5px}
.cp-hero-name{font-family:'Playfair Display',serif;font-size:clamp(48px,5.5vw,72px);font-weight:500;line-height:1;margin-bottom:12px;color:#FAF5EC;text-shadow:0 2px 24px rgba(0,0,0,0.25);animation:cpFadeUp .6s .08s ease both}
.cp-hero-name em{font-style:italic;color:#E8C97A}
.cp-hero-title{font-size:12px;color:rgba(250,245,236,.5);letter-spacing:.2em;text-transform:uppercase;margin-bottom:8px;animation:cpFadeUp .6s .15s ease both}
.cp-hero-sub{font-size:13px;color:rgba(250,245,236,.4);margin-bottom:20px;animation:cpFadeUp .6s .2s ease both}
.cp-hero-bio{font-size:14px;line-height:1.85;color:rgba(250,245,236,.55);max-width:380px;margin-bottom:28px;font-weight:300;animation:cpFadeUp .6s .24s ease both}
.cp-socials{display:flex;gap:9px;margin-bottom:28px;animation:cpFadeUp .6s .3s ease both}
.cp-social{width:34px;height:34px;border-radius:50%;border:1px solid rgba(250,245,236,.15);display:flex;align-items:center;justify-content:center;color:rgba(250,245,236,.5);text-decoration:none;transition:all .22s;backdrop-filter:blur(8px)}
.cp-social:hover{border-color:rgba(232,201,122,.45);color:#E8C97A;background:rgba(200,160,80,.1);transform:translateY(-2px)}
.cp-hero-cta{display:flex;gap:10px;animation:cpFadeUp .6s .35s ease both}

/* CTA buttons on shader */
.cp-btn-dark{background:rgba(22,14,6,0.7);color:#F5EDD8;border:1px solid rgba(200,160,80,.2);padding:13px 28px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;letter-spacing:.08em;cursor:pointer;border-radius:2px;text-transform:uppercase;transition:all .25s;backdrop-filter:blur(8px)}
.cp-btn-dark:hover{background:rgba(22,14,6,0.88);border-color:rgba(200,160,80,.4);transform:translateY(-1px);box-shadow:0 6px 24px rgba(0,0,0,.25)}
.cp-btn-outline{background:transparent;color:rgba(250,245,236,.7);border:1px solid rgba(250,245,236,.2);padding:13px 22px;font-family:'DM Sans',sans-serif;font-size:12px;letter-spacing:.08em;cursor:pointer;border-radius:2px;text-transform:uppercase;transition:all .25s;backdrop-filter:blur(8px)}
.cp-btn-outline:hover{border-color:rgba(232,201,122,.4);color:#E8C97A}

/* Hero right */
.cp-hero-right{position:relative;overflow:hidden}
.cp-cover-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.cp-cover-overlay{position:absolute;inset:0;background:linear-gradient(to left,transparent 60%,rgba(22,14,6,.3) 100%),linear-gradient(to top,rgba(22,14,6,.4) 0%,transparent 40%)}
.cp-portrait-wrap{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
.cp-p-glow{position:absolute;top:10%;left:50%;transform:translateX(-50%);width:280px;height:280px;background:radial-gradient(circle,rgba(200,160,80,.12) 0%,transparent 70%);border-radius:50%}
.cp-p-head{position:absolute;top:80px;left:50%;transform:translateX(-50%);width:110px;height:120px;background:rgba(80,55,30,0.35);border-radius:50%;border:1px solid rgba(200,160,80,.1)}
.cp-p-neck{position:absolute;top:188px;left:50%;transform:translateX(-50%);width:42px;height:55px;background:rgba(80,55,30,0.35)}
.cp-p-body{position:absolute;bottom:60px;left:50%;transform:translateX(-50%);width:200px;height:260px;background:rgba(60,40,20,0.3);border-radius:100px 100px 70px 70px;border:1px solid rgba(200,160,80,.07)}

/* Floating card */
.cp-fc{position:absolute;bottom:56px;left:-20px;background:rgba(18,12,6,0.82);border:1px solid rgba(200,160,80,.2);border-radius:3px;padding:14px 20px;backdrop-filter:blur(20px);min-width:170px}
.cp-fc-lbl{font-size:9px;color:rgba(232,201,122,.55);letter-spacing:.18em;text-transform:uppercase;margin-bottom:5px}
.cp-fc-val{font-family:'Playfair Display',serif;font-size:17px;color:#E8C97A}

/* TABS BAR — inside shader wrap, bottom edge */
.cp-tabs-bar{display:flex;position:sticky;top:52px;z-index:500;background:rgba(18,12,6,0.88);backdrop-filter:blur(20px);border-top:1px solid rgba(200,160,80,.1);border-bottom:1px solid rgba(200,160,80,.06)}
.cp-tab-btn{flex:1;background:transparent;border:none;color:rgba(245,240,230,.38);font-family:'DM Sans',sans-serif;font-size:12px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;padding:18px 12px;border-bottom:2px solid transparent;transition:all .25s;font-weight:400}
.cp-tab-btn:hover{color:rgba(245,240,230,.65)}
.cp-tab-btn.active{color:#E8C97A;border-bottom-color:#E8C97A;background:rgba(200,160,80,.05)}

/* CONTENT SECTIONS */
.cp-section{padding:80px 64px;background:var(--bg)}
.cp-section-alt{background:var(--bg2)}
.cp-inner{max-width:1100px;margin:0 auto}
.cp-eyebrow{font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:var(--gold-d);margin-bottom:12px}
.cp-heading{font-family:'Playfair Display',serif;font-size:clamp(26px,3.2vw,38px);font-weight:500;line-height:1.15;color:var(--tx);margin-bottom:44px}
.cp-heading em{font-style:italic;color:var(--gold-d)}

.cp-btn-gold{background:var(--gold-d);color:#FAF7F0;border:none;padding:12px 26px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;letter-spacing:.07em;cursor:pointer;border-radius:2px;text-transform:uppercase;transition:all .25s;display:inline-block}
.cp-btn-gold:hover{background:var(--gold);transform:translateY(-1px);box-shadow:0 6px 20px rgba(184,144,48,.2)}
.cp-btn-gold:disabled{background:rgba(30,18,8,.1);color:var(--tx-m);cursor:not-allowed;transform:none;box-shadow:none}
.cp-btn-ghost{background:transparent;color:var(--tx-s);border:1px solid var(--bdr-m);padding:11px 20px;font-family:'DM Sans',sans-serif;font-size:12px;letter-spacing:.07em;cursor:pointer;border-radius:2px;text-transform:uppercase;transition:all .25s}
.cp-btn-ghost:hover{border-color:var(--gold-bdr);color:var(--gold-d)}
.cp-btn-next{background:var(--gold-d);color:#FAF7F0;border:none;padding:12px 28px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;letter-spacing:.06em;cursor:pointer;border-radius:2px;transition:all .25s}
.cp-btn-next:hover{background:var(--gold);transform:translateY(-1px);box-shadow:0 8px 24px rgba(184,144,48,.2)}
.cp-btn-next:disabled{background:rgba(30,18,8,.1);color:var(--tx-m);cursor:not-allowed;transform:none;box-shadow:none}
.cp-btn-back{background:transparent;color:var(--tx-m);border:1px solid var(--bdr-m);padding:10px 18px;font-family:'DM Sans',sans-serif;font-size:12px;letter-spacing:.06em;cursor:pointer;border-radius:2px;transition:all .2s;text-transform:uppercase}
.cp-back-btn{display:inline-flex;align-items:center;gap:8px;background:transparent;border:none;color:var(--tx-m);font-family:'DM Sans',sans-serif;font-size:13px;cursor:pointer;padding:0;margin-bottom:36px;transition:color .2s}
.cp-back-btn:hover{color:var(--gold-d)}
.cp-btn-block{width:100%;margin-top:4px;text-align:center;display:block;padding:13px}

/* Progress */
.cp-progress{display:flex;align-items:center;margin-bottom:40px}
.cp-wp{display:flex;align-items:center;gap:9px;flex-shrink:0}
.cp-wp-n{width:27px;height:27px;border-radius:50%;border:1px solid var(--bdr-m);background:var(--card);display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--tx-m);transition:all .3s;font-weight:500;box-shadow:var(--sh-sm)}
.cp-wp-l{font-size:11px;color:var(--tx-m);letter-spacing:.05em;white-space:nowrap}
.cp-wp.active .cp-wp-n{border-color:var(--gold-d);background:rgba(184,144,48,.09);color:var(--gold-d)}
.cp-wp.active .cp-wp-l{color:var(--tx-s)}
.cp-wp.done .cp-wp-n{background:var(--gold-d);border-color:var(--gold-d);color:#FAF7F0;font-weight:700}
.cp-wp.done .cp-wp-l{color:var(--gold-d)}
.cp-wl{flex:1;height:1px;background:var(--bdr-m);margin:0 14px;transition:background .4s}
.cp-wl.done{background:var(--gold-d)}

/* Wizard */
.cp-wiz-layout{display:grid;grid-template-columns:240px 1fr;gap:48px;align-items:start}
.cp-summary{position:sticky;top:120px;background:var(--card);border:1px solid var(--bdr);border-radius:3px;padding:22px;box-shadow:var(--sh)}
.cp-sum-title{font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:var(--tx-m);margin-bottom:16px}
.cp-sum-row{margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid var(--bdr)}
.cp-sum-row:last-of-type{border-bottom:none;margin-bottom:0;padding-bottom:0}
.cp-sum-k{font-size:9px;color:var(--tx-m);letter-spacing:.14em;text-transform:uppercase;margin-bottom:4px}
.cp-sum-v{font-family:'Playfair Display',serif;font-size:14px;color:var(--tx);line-height:1.3}
.cp-sum-s{font-size:11px;color:var(--tx-m);margin-top:2px}
.cp-sum-e{font-size:12px;color:rgba(30,18,8,.2)}
.cp-deposit{margin-top:14px;padding:11px 13px;background:rgba(184,144,48,.07);border:1px solid rgba(184,144,48,.2);border-radius:2px;font-size:11px;color:var(--tx-s);line-height:1.65}
.cp-deposit strong{color:var(--gold-d)}
.cp-step-note{font-size:13px;color:var(--tx-m);font-weight:300;margin-bottom:22px;line-height:1.6}

/* Services grid */
.cp-s1-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.cp-s1-card{background:var(--card);border:1px solid var(--bdr);border-radius:2px;padding:18px;cursor:pointer;transition:all .2s;position:relative;box-shadow:var(--sh-sm)}
.cp-s1-card:hover{border-color:rgba(184,144,48,.3);box-shadow:var(--sh)}
.cp-s1-card.sel{border-color:var(--gold-d);box-shadow:0 0 0 2px rgba(184,144,48,.12),var(--sh)}
.cp-s1-chk{position:absolute;top:10px;right:10px;width:15px;height:15px;border-radius:50%;border:1px solid var(--bdr-m);display:flex;align-items:center;justify-content:center;font-size:9px;color:transparent;transition:all .2s}
.cp-s1-card.sel .cp-s1-chk{background:var(--gold-d);border-color:var(--gold-d);color:#FAF7F0;font-weight:700}
.cp-s1-icon{font-size:17px;color:var(--tx-m);margin-bottom:9px}
.cp-s1-card.sel .cp-s1-icon{color:var(--gold-d)}
.cp-s1-name{font-family:'Playfair Display',serif;font-size:14px;margin-bottom:4px;color:var(--tx)}
.cp-s1-meta{font-size:11px;color:var(--tx-m)}
.cp-s1-price{margin-top:9px;font-family:'Playfair Display',serif;font-size:15px;color:var(--gold-d)}

/* Addons */
.cp-addons{margin-top:22px;padding-top:20px;border-top:1px solid var(--bdr)}
.cp-addons-lbl{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--tx-m);margin-bottom:11px}
.cp-chips{display:flex;flex-wrap:wrap;gap:7px}
.cp-chip{padding:6px 13px;border:1px solid var(--bdr-m);border-radius:100px;font-size:12px;color:var(--tx-s);cursor:pointer;transition:all .2s;background:var(--card)}
.cp-chip:hover{border-color:rgba(184,144,48,.3);color:var(--gold-d)}
.cp-chip.on{border-color:var(--gold-d);background:rgba(184,144,48,.08);color:var(--gold-d)}

/* Calendar */
.cp-cal-wrap{background:var(--card);border:1px solid var(--bdr);border-radius:3px;overflow:hidden;box-shadow:var(--sh-sm)}
.cp-cal-head{padding:14px 20px;border-bottom:1px solid var(--bdr);display:flex;align-items:center;justify-content:space-between}
.cp-cal-month{font-family:'Playfair Display',serif;font-size:15px;color:var(--tx)}
.cp-cal-nav{display:flex;gap:5px}
.cp-cal-btn{width:28px;height:28px;border:1px solid var(--bdr-m);background:transparent;color:var(--tx-m);cursor:pointer;border-radius:2px;font-size:13px;transition:all .2s}
.cp-cal-btn:hover{border-color:rgba(184,144,48,.3);color:var(--gold-d);background:rgba(184,144,48,.06)}
.cp-cal-btn:disabled{opacity:.3;cursor:default;pointer-events:none}
.cp-dnames{display:grid;grid-template-columns:repeat(7,1fr);padding:9px 18px 3px}
.cp-dname{text-align:center;font-size:9px;color:var(--tx-m);letter-spacing:.12em;text-transform:uppercase}
.cp-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);padding:3px 18px 18px;gap:2px}
.cp-day{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:12px;border-radius:2px;cursor:pointer;transition:all .15s;color:var(--tx-m);position:relative;user-select:none}
.cp-day.avail{color:var(--tx);font-weight:500}
.cp-day.avail::after{content:'';position:absolute;bottom:2px;left:50%;transform:translateX(-50%);width:3px;height:3px;border-radius:50%;background:var(--gold-d)}
.cp-day.avail:hover{background:rgba(184,144,48,.08);color:var(--gold-d)}
.cp-day.today{border:1px solid rgba(184,144,48,.25);color:var(--gold-d)}
.cp-day.sel{background:var(--gold-d)!important;color:#FAF7F0!important;font-weight:600}
.cp-day.sel::after{display:none}
.cp-day.past,.cp-day.off,.cp-day.empty{color:rgba(30,18,8,.18);cursor:default}

/* Slots */
.cp-slots-wrap{margin-top:16px}
.cp-slots-lbl{font-size:10px;color:var(--tx-m);letter-spacing:.14em;text-transform:uppercase;margin-bottom:9px}
.cp-slots-empty{font-size:13px;color:var(--tx-m);padding:18px 0;font-style:italic}
.cp-slots-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:5px}
.cp-slot{padding:8px 5px;text-align:center;border:1px solid var(--bdr);background:var(--card);color:var(--tx-m);font-size:12px;cursor:pointer;border-radius:2px;transition:all .15s}
.cp-slot.avail{color:var(--tx-s)}
.cp-slot.avail:hover{border-color:rgba(184,144,48,.3);color:var(--gold-d);background:rgba(184,144,48,.06)}
.cp-slot.sel{border-color:var(--gold-d);background:rgba(184,144,48,.08);color:var(--gold-d);font-weight:500}
.cp-slot.booked{color:rgba(30,18,8,.2);cursor:not-allowed;border-color:transparent;background:var(--bg2)}

/* Form */
.cp-2col{display:grid;grid-template-columns:1fr 1fr;gap:11px}
.cp-fg{display:flex;flex-direction:column;gap:5px;margin-bottom:12px}
.cp-fl{font-size:10px;color:var(--tx-m);letter-spacing:.12em;text-transform:uppercase}
.cp-fi,.cp-fsel{background:var(--card);border:1px solid var(--bdr-m);color:var(--tx);padding:11px 14px;font-family:'DM Sans',sans-serif;font-size:14px;border-radius:2px;outline:none;transition:border-color .2s,box-shadow .2s;width:100%}
.cp-fi:focus,.cp-fsel:focus{border-color:rgba(184,144,48,.35);box-shadow:0 0 0 3px rgba(184,144,48,.06)}
.cp-fi.err{border-color:var(--err)}
.cp-fi::placeholder{color:rgba(30,18,8,.18)}
.cp-fsel{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%239A8E7C' d='M5 7L1 2h8z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 13px center;background-color:var(--card);cursor:pointer}
.cp-ferr{font-size:11px;color:var(--err)}
.cp-policy{padding:12px 14px;background:rgba(184,144,48,.07);border:1px solid rgba(184,144,48,.18);border-radius:2px;font-size:11px;color:var(--tx-s);line-height:1.65;margin-bottom:4px}
.cp-policy a{color:var(--gold-d);text-decoration:none;font-weight:500}
.cp-nav-row{display:flex;justify-content:space-between;align-items:center;margin-top:24px;padding-top:20px;border-top:1px solid var(--bdr)}

/* Success */
.cp-success{text-align:center;padding:56px 32px 40px;animation:cpFadeUp .5s ease both}
.cp-success-icon{width:64px;height:64px;border-radius:50%;background:rgba(58,158,106,.08);border:1px solid rgba(58,158,106,.22);display:flex;align-items:center;justify-content:center;margin:0 auto 22px;font-size:24px;color:var(--ok);animation:cpScaleIn .4s .1s ease both}
.cp-success-title{font-family:'Playfair Display',serif;font-size:30px;margin-bottom:10px;color:var(--tx)}
.cp-success-sub{font-size:13px;color:var(--tx-s);font-weight:300;line-height:1.7;margin-bottom:28px}
.cp-success-card{background:var(--card);border:1px solid var(--bdr);border-radius:3px;padding:20px 24px;max-width:380px;margin:0 auto 24px;text-align:left;box-shadow:var(--sh)}
.cp-sc-row{display:flex;justify-content:space-between;align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--bdr);font-size:13px;gap:14px}
.cp-sc-row:last-child{border-bottom:none}
.cp-sc-k{color:var(--tx-m);flex-shrink:0}
.cp-sc-v{color:var(--tx-s);font-weight:500;text-align:right}

/* Reviews */
.cp-rev-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.cp-rev-card{background:var(--card);border:1px solid var(--bdr);border-radius:3px;padding:22px;box-shadow:var(--sh-sm);transition:box-shadow .25s}
.cp-rev-card:hover{box-shadow:var(--sh)}
.cp-rev-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:8px}
.cp-rev-svc{font-size:10px;color:var(--tx-m);letter-spacing:.06em;border:1px solid var(--bdr-m);padding:3px 9px;border-radius:100px}
.cp-rev-body{font-size:13px;color:var(--tx-s);line-height:1.75;margin-bottom:18px;font-weight:300}
.cp-rev-author{display:flex;align-items:center;gap:9px}
.cp-rev-av{width:30px;height:30px;border-radius:50%;background:rgba(184,144,48,.1);border:1px solid rgba(184,144,48,.25);display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--gold-d);flex-shrink:0;font-weight:500}
.cp-rev-name{font-size:13px;font-weight:500;color:var(--tx)}

/* Portfolio */
.cp-portfolio-grid{display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:220px 220px;gap:6px}
.cp-pf-item{position:relative;overflow:hidden;border-radius:3px}
.cp-pf-main{grid-column:1/3;grid-row:1/3}
.cp-pf-item img{width:100%;height:100%;object-fit:cover;transition:transform .5s}
.cp-pf-item:hover img{transform:scale(1.04)}
.cp-pf-caption{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to top,rgba(0,0,0,.65) 0%,transparent 100%);color:#fff;font-size:11px;padding:16px 12px 10px;opacity:0;transition:opacity .3s}
.cp-pf-item:hover .cp-pf-caption{opacity:1}

/* Shop */
.cp-prod-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.cp-prod-card{background:var(--card);border:1px solid var(--bdr);border-radius:3px;overflow:hidden;box-shadow:var(--sh-sm);transition:box-shadow .25s,transform .25s}
.cp-prod-card:hover{box-shadow:var(--sh);transform:translateY(-2px)}
.cp-prod-img{position:relative;aspect-ratio:1;background:var(--bg2);display:flex;align-items:center;justify-content:center;overflow:hidden}
.cp-prod-img img{width:100%;height:100%;object-fit:cover}
.cp-prod-ph{font-size:48px;color:rgba(184,144,48,.2)}
.cp-prod-badge{position:absolute;top:10px;right:10px;background:var(--gold-d);color:#FAF7F0;font-size:10px;letter-spacing:.08em;padding:4px 10px;border-radius:100px;text-transform:uppercase}
.cp-prod-body{padding:18px}
.cp-prod-name{font-family:'Playfair Display',serif;font-size:16px;margin-bottom:5px;color:var(--tx)}
.cp-prod-desc{font-size:12px;color:var(--tx-m);line-height:1.55;margin-bottom:12px;font-weight:300}
.cp-prod-foot{display:flex;align-items:center;justify-content:space-between}
.cp-prod-price{font-family:'Playfair Display',serif;font-size:18px;color:var(--gold-d)}
.cp-prod-see{font-size:12px;color:var(--tx-m);letter-spacing:.06em;transition:color .2s}
.cp-prod-card:hover .cp-prod-see{color:var(--gold-d)}

/* Detail */
.cp-detail-layout{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:start}
.cp-detail-img{border-radius:3px;overflow:hidden;background:var(--bg2);aspect-ratio:1;display:flex;align-items:center;justify-content:center}
.cp-detail-img img{width:100%;height:100%;object-fit:cover}
.cp-detail-ph{font-size:72px;color:rgba(184,144,48,.2)}
.cp-off-detail-badge{display:flex;flex-direction:column;align-items:flex-start;background:var(--bg2);border:1px solid var(--bdr);border-radius:3px;padding:36px;box-shadow:var(--sh-sm)}
.cp-detail-title{font-family:'Playfair Display',serif;font-size:clamp(22px,3vw,34px);margin-bottom:8px;color:var(--tx);line-height:1.15}
.cp-detail-price{font-family:'Playfair Display',serif;font-size:28px;color:var(--gold-d);margin-bottom:20px}
.cp-detail-desc{font-size:14px;color:var(--tx-s);line-height:1.8;font-weight:300}

/* Learn */
.cp-off-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
.cp-off-card{background:var(--card);border:1px solid var(--bdr);border-radius:3px;padding:26px;box-shadow:var(--sh-sm);transition:box-shadow .25s,transform .25s}
.cp-off-card:hover{box-shadow:var(--sh);transform:translateY(-2px)}
.cp-off-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.cp-off-icon{width:36px;height:36px;border:1px solid rgba(184,144,48,.25);border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:15px;color:var(--gold-d);background:rgba(184,144,48,.07)}
.cp-off-fmt{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--tx-m);border:1px solid var(--bdr-m);padding:4px 10px;border-radius:100px}
.cp-off-title{font-family:'Playfair Display',serif;font-size:18px;margin-bottom:7px;color:var(--tx)}
.cp-off-desc{font-size:12px;color:var(--tx-m);line-height:1.6;margin-bottom:12px;font-weight:300}
.cp-off-meta{display:flex;gap:16px;font-size:11px;color:var(--tx-m);margin-bottom:16px}
.cp-off-foot{display:flex;align-items:center;justify-content:space-between}
.cp-off-price{font-family:'Playfair Display',serif;font-size:20px;color:var(--gold-d)}

/* FAQ */
.cp-faq-inner{max-width:900px}
.cp-faq-grid{display:grid;grid-template-columns:1fr 1fr;gap:36px 60px;margin-top:44px}
.cp-faq-q{font-family:'Playfair Display',serif;font-size:16px;margin-bottom:9px;color:var(--tx)}
.cp-faq-a{font-size:13px;color:var(--tx-m);line-height:1.75;font-weight:300}

/* Footer */
.cp-footer{padding:28px 64px;border-top:1px solid var(--bdr);background:var(--bg2);display:flex;align-items:center;justify-content:space-between;gap:20px}
.cp-footer-logo{font-family:'Playfair Display',serif;font-size:16px;color:var(--gold-d)}
.cp-footer-socials{display:flex;gap:7px}
.cp-footer-social{width:30px;height:30px;border-radius:50%;border:1px solid var(--bdr-m);display:flex;align-items:center;justify-content:center;color:var(--tx-m);text-decoration:none;transition:all .2s}
.cp-footer-social:hover{border-color:rgba(184,144,48,.3);color:var(--gold-d);background:rgba(184,144,48,.07)}
.cp-footer-right{font-size:11px;color:var(--tx-m)}
.cp-footer-right a{color:var(--gold-d);text-decoration:none;font-weight:500}

/* Modals */
.cp-overlay{position:fixed;inset:0;background:rgba(20,12,4,.55);z-index:800;display:flex;align-items:flex-end;justify-content:center;backdrop-filter:blur(6px)}
.cp-modal{background:var(--card);border-radius:14px 14px 0 0;padding:28px 28px 40px;width:100%;max-width:480px;max-height:88vh;overflow-y:auto;position:relative;animation:cpFadeUp .3s ease}
.cp-modal-close{position:absolute;top:16px;right:16px;width:28px;height:28px;border-radius:50%;border:1px solid var(--bdr-m);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;color:var(--tx-m);background:var(--card);transition:all .2s}
.cp-modal-close:hover{background:var(--bg2);color:var(--tx)}
.cp-modal-title{font-family:'Playfair Display',serif;font-size:20px;margin-bottom:6px;margin-right:32px;color:var(--tx)}
.cp-modal-price{font-family:'Playfair Display',serif;font-size:22px;color:var(--gold-d);margin-bottom:20px}
.cp-modal-note{font-size:11px;color:var(--tx-m);margin-top:12px;line-height:1.6}

/* MOBILE */
@media(max-width:960px){
  .cp-nav{padding:12px 20px}
  .cp-logo span{display:none}
  .cp-hero{grid-template-columns:1fr;min-height:auto}
  .cp-hero-right{height:42vh;position:relative;order:-1}
  .cp-hero-content{padding:28px 24px 52px}
  .cp-hero-name{font-size:42px}
  .cp-section{padding:52px 24px}
  .cp-wiz-layout{grid-template-columns:1fr}
  .cp-summary{position:static}
  .cp-s1-grid,.cp-2col{grid-template-columns:1fr}
  .cp-slots-grid{grid-template-columns:repeat(3,1fr)}
  .cp-prod-grid{grid-template-columns:1fr 1fr}
  .cp-off-grid{grid-template-columns:1fr}
  .cp-rev-grid{grid-template-columns:1fr}
  .cp-detail-layout{grid-template-columns:1fr}
  .cp-faq-grid{grid-template-columns:1fr;gap:24px}
  .cp-portfolio-grid{grid-template-columns:1fr 1fr;grid-template-rows:none}
  .cp-pf-main{grid-column:1/3;height:240px}
  .cp-pf-item{height:180px}
  .cp-footer{flex-direction:column;gap:10px;text-align:center;padding:24px}
  .cp-tabs-bar{top:49px}
}
@media(max-width:480px){
  .cp-prod-grid{grid-template-columns:1fr 1fr}
  .cp-hero-name{font-size:36px}
}
`
