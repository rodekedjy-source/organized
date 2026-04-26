import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// ─── Global CSS ───────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { overflow-x: hidden; }

  .cp-nav-book   { transition: opacity .2s, transform .15s; }
  .cp-nav-book:hover { opacity: .85; transform: translateY(-1px); }
  .cp-tab-btn    { transition: color .15s; }
  .cp-tab-btn:hover { color: #C9A84C !important; }
  .cp-social     { transition: opacity .2s; }
  .cp-social:hover { opacity: .5 !important; }

  .cp-svc-card   { transition: background .25s; cursor: pointer; }
  .cp-svc-card:hover { background: #1a1a1a !important; }
  .cp-svc-card:hover .cp-svc-line { transform: scaleX(1) !important; }
  .cp-svc-line   { transition: transform .3s ease; }

  .cp-grid-card  { transition: border-color .2s; cursor: pointer; }
  .cp-grid-card:hover { border-color: rgba(201,168,76,.3) !important; }

  .cp-faq-row    { cursor: pointer; transition: background .15s; }
  .cp-faq-row:hover { background: rgba(255,255,255,.02) !important; }

  .cp-pf-item    { overflow: hidden; }
  .cp-pf-item img { transition: transform .4s ease; display:block; width:100%; height:100%; object-fit:cover; }
  .cp-pf-item:hover img { transform: scale(1.04); }

  .cp-back-btn   { transition: opacity .2s; }
  .cp-back-btn:hover { opacity: .7; }

  @keyframes cpFadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cpPulse  { 0%,100%{opacity:1} 50%{opacity:.2} }
  @keyframes cpSpin   { to{transform:rotate(360deg)} }

  .cp-a1 { animation: cpFadeUp .8s .05s ease forwards; opacity:0; }
  .cp-a2 { animation: cpFadeUp .8s .2s  ease forwards; opacity:0; }
  .cp-a3 { animation: cpFadeUp .8s .35s ease forwards; opacity:0; }
  .cp-a4 { animation: cpFadeUp .8s .5s  ease forwards; opacity:0; }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .cp-svc-grid { grid-template-columns: repeat(2,1fr) !important; }
  }
  @media (max-width: 600px) {
    .cp-svc-grid  { grid-template-columns: 1fr !important; }
    .cp-rev-grid  { grid-template-columns: 1fr !important; }
    .cp-pf-grid   { grid-template-columns: repeat(2,1fr) !important; }
    .cp-hero-wrap { padding: 52px 20px 80px !important; }
    .cp-nav-wrap  { padding: 16px 20px !important; }
    .cp-pad       { padding: 52px 20px 100px !important; }
    .cp-footer    { flex-direction:column; gap:8px; text-align:center; padding:20px !important; }
  }
  /* Products always 2-per-row — never collapse to 1 on mobile */
  .cp-shop-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
`

// ─── Shader ───────────────────────────────────────────────────────────────────
function ShaderBg() {
  const ref = useRef(null)
  const raf = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) return

    const vs = `attribute vec2 a; void main(){gl_Position=vec4(a,0,1);}`
    const fs = `
      precision mediump float;
      uniform float t; uniform vec2 r;

      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n(vec2 p){
        vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
        return mix(mix(h(i),h(i+vec2(1,0)),u.x),
                   mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);
      }
      float fbm(vec2 p){
        float v=0.,a=.5;
        mat2 m=mat2(.8,.6,-.6,.8);
        for(int i=0;i<6;i++){v+=a*n(p);p=m*p*2.+vec2(100.);a*=.5;}
        return v;
      }
      void main(){
        vec2 uv = gl_FragCoord.xy / r;

        /* ── Domain-warped FBM — same technique as 21st.dev shader ── */
        vec2 q = vec2(fbm(uv + .015*t),
                      fbm(uv + vec2(1.)));
        vec2 s = vec2(fbm(uv + q + vec2(1.7,9.2) + .10*t),
                      fbm(uv + q + vec2(8.3,2.8) + .08*t));
        float f = fbm(uv + s);

        /* ── Warm palette: deep umber → caramel → ivory champagne ── */
        vec3 dark = vec3(.08,.065,.05);
        vec3 mid  = vec3(.55,.45,.33);
        vec3 lite = vec3(.84,.74,.58);

        vec3 c = mix(dark, mid,  clamp(f*f*3.2, 0.,1.));
             c = mix(c,    lite, clamp(length(q)*.6,0.,1.));
        /* Tone-map for brighter, luminous look */
        c = (f*f*f + .65*f*f + .5*f) * c * 1.35;

        /* Soft vignette */
        vec2 vig = uv*(1.-uv.yx);
        c *= pow(clamp(vig.x*vig.y*14.,.0,1.), .15);

        gl_FragColor = vec4(c, 1.);
      }
    `

    function sh(type, src) {
      const s = gl.createShader(type); gl.shaderSource(s,src); gl.compileShader(s); return s
    }
    const prog = gl.createProgram()
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs))
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs))
    gl.linkProgram(prog); gl.useProgram(prog)

    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog,'a')
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0)

    const uT = gl.getUniformLocation(prog,'t')
    const uR = gl.getUniformLocation(prog,'r')

    function resize(){ canvas.width=canvas.offsetWidth; canvas.height=canvas.offsetHeight; gl.viewport(0,0,canvas.width,canvas.height) }
    resize(); window.addEventListener('resize',resize)

    const t0 = performance.now()
    function draw(){ gl.uniform1f(uT,(performance.now()-t0)/1000); gl.uniform2f(uR,canvas.width,canvas.height); gl.drawArrays(gl.TRIANGLE_STRIP,0,4); raf.current=requestAnimationFrame(draw) }
    draw()
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener('resize',resize) }
  }, [])

  return <canvas ref={ref} style={{position:'absolute',inset:0,width:'100%',height:'100%',display:'block'}} />
}

// ─── Social Icons ─────────────────────────────────────────────────────────────
const IconIG     = () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
const IconX      = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.733-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
const IconTikTok = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/></svg>
const IconFB     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQ = [
  { q: 'How do I reschedule or cancel?', a: 'Contact the studio directly by phone or message. Cancellations less than 24 hours before the appointment may incur a fee.' },
  { q: 'What should I prepare before arriving?', a: 'Arrive with clean, dry hair unless your service requires otherwise. Bring a reference photo if you have one — it makes the result more accurate.' },
  { q: 'Are consultations available?', a: 'Yes. A standalone consultation is recommended for first-time clients or any complex colour work.' },
  { q: 'What payment methods are accepted?', a: 'Cash, debit, and all major credit cards. E-transfer may be available — confirm when booking.' },
  { q: 'How far in advance should I book?', a: 'Standard services: 1–2 weeks. Colour or bridal appointments: 3–4 weeks minimum.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const G = '#C9A84C'
const MUTED = 'rgba(245,240,232,0.35)'
const SOFT  = 'rgba(245,240,232,0.55)'

function Label({ children }) {
  return <div style={{fontSize:10,letterSpacing:'0.22em',textTransform:'uppercase',color:G,marginBottom:12}}>{children}</div>
}
function SecTitle({ children }) {
  return <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(26px,4vw,42px)',fontWeight:500,lineHeight:1.15,marginBottom:40}}>{children}</h2>
}
function Stars({ n=5 }) {
  return <span style={{fontSize:11,color:G,letterSpacing:2}}>{'★'.repeat(Math.min(5,n))}</span>
}

// ─── Product Detail Page ──────────────────────────────────────────────────────
function ProductDetail({ item, onBack, isFormation }) {
  return (
    <div style={{minHeight:'60vh'}}>
      {/* Back */}
      <button
        className="cp-back-btn"
        onClick={onBack}
        style={{display:'flex',alignItems:'center',gap:8,background:'none',border:'none',color:MUTED,fontSize:12,letterSpacing:'0.1em',textTransform:'uppercase',cursor:'pointer',fontFamily:'inherit',marginBottom:32,padding:0}}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Back to {isFormation ? 'Learn' : 'Shop'}
      </button>

      {/* Image */}
      {item.image_url ? (
        <img src={item.image_url} alt={item.name}
          style={{width:'100%',maxHeight:420,objectFit:'cover',display:'block',borderRadius:2,marginBottom:32}} />
      ) : (
        <div style={{width:'100%',height:240,background:'#1a1a1a',borderRadius:2,marginBottom:32,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'rgba(245,240,232,0.1)',letterSpacing:'0.12em',textTransform:'uppercase'}}>
          No photo
        </div>
      )}

      {/* Info */}
      <div style={{maxWidth:640}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(24px,5vw,36px)',fontWeight:500,marginBottom:8,lineHeight:1.1}}>
          {item.name || item.title}
        </div>

        <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:24}}>
          {item.price > 0 && (
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:28,color:G}}>${item.price}</div>
          )}
          {(item.duration || item.duration_min) && (
            <div style={{fontSize:12,color:MUTED,letterSpacing:'0.08em'}}>
              {item.duration || `${item.duration_min} min`}
            </div>
          )}
        </div>

        {item.description && (
          <p style={{fontSize:14,lineHeight:1.9,color:SOFT,fontWeight:300,marginBottom:32}}>
            {item.description}
          </p>
        )}

        <button
          style={{background:G,color:'#0A0A0A',border:'none',padding:'14px 32px',fontSize:13,fontWeight:500,letterSpacing:'0.06em',cursor:'pointer',borderRadius:2,fontFamily:'inherit',width:'100%',maxWidth:320}}
        >
          {isFormation ? 'Enquire to Enroll' : 'Enquire to Order'}
        </button>

        <p style={{fontSize:11,color:MUTED,marginTop:12}}>Contact the studio to complete your order.</p>
      </div>

      {/* Divider */}
      <div style={{height:1,background:'#1e1e1e',margin:'48px 0'}} />
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ClientPage() {
  const { slug } = useParams()

  const [ws,          setWs]          = useState(null)
  const [services,    setServices]    = useState([])
  const [products,    setProducts]    = useState([])
  const [offerings,   setOfferings]   = useState([])
  const [reviews,     setReviews]     = useState([])
  const [portfolio,   setPortfolio]   = useState([])
  const [tab,         setTab]         = useState('book')
  const [bookModal,   setBookModal]   = useState(null)
  const [productPage, setProductPage] = useState(null)
  const [learnPage,   setLearnPage]   = useState(null)
  const [faqOpen,     setFaqOpen]     = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [notFound,    setNotFound]    = useState(false)
  const [toast,       setToast]       = useState('')
  const [bookForm,    setBookForm]    = useState({name:'',email:'',phone:'',date:'',time:'',notes:''})
  const [booking,     setBooking]     = useState(false)
  const [booked,      setBooked]      = useState(false)

  function notify(msg){ setToast(msg); setTimeout(()=>setToast(''),3500) }

  useEffect(()=>{
    const id='cp-css'; if(!document.getElementById(id)){const s=document.createElement('style');s.id=id;s.textContent=CSS;document.head.appendChild(s)}
    load()
  },[slug])

  async function load(){
    const {data:w} = await supabase.from('workspaces').select('*').eq('slug',slug).single()
    if(!w){setNotFound(true);setLoading(false);return}
    setWs(w)
    const [s,p,o,r,ph] = await Promise.all([
      supabase.from('services').select('*').eq('workspace_id',w.id).eq('is_active',true).order('display_order'),
      supabase.from('products').select('*').eq('workspace_id',w.id).eq('is_active',true),
      supabase.from('offerings').select('*').eq('workspace_id',w.id),
      supabase.from('reviews').select('*').eq('workspace_id',w.id).eq('is_approved',true).order('created_at',{ascending:false}).limit(12),
      supabase.from('portfolio_photos').select('*').eq('workspace_id',w.id).order('display_order').limit(9),
    ])
    setServices(s.data||[]); setProducts(p.data||[]); setOfferings(o.data||[])
    setReviews(r.data||[]); setPortfolio(ph.data||[])
    setLoading(false)
  }

  async function submitBooking(e){
    e.preventDefault(); if(!bookForm.name||!bookForm.date||!bookForm.time) return
    setBooking(true)
    const {error} = await supabase.from('appointments').insert({
      workspace_id: ws.id, client_name: bookForm.name, client_phone: bookForm.phone,
      notes:`Service: ${bookModal.name}.${bookForm.notes?' '+bookForm.notes:''}`,
      scheduled_at: new Date(`${bookForm.date}T${bookForm.time}:00`).toISOString(),
      amount: bookModal.price, status:'pending',
    })
    if(error){notify('Something went wrong. Please try again.');setBooking(false);return}
    setBooked(true); setBooking(false)
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if(loading) return(
    <div style={{background:'#0A0A0A',color:'#F5F0E8',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <style>{CSS}</style>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:18}}>
        <div style={{width:24,height:24,border:`1.5px solid ${G}`,borderTopColor:'transparent',borderRadius:'50%',animation:'cpSpin .8s linear infinite'}}/>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:13,color:G,letterSpacing:'0.08em'}}>Organized.</div>
      </div>
    </div>
  )

  if(notFound) return(
    <div style={{background:'#0A0A0A',color:'#F5F0E8',minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'2rem',fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:'3.5rem',color:G,marginBottom:12}}>404</div>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.5rem',marginBottom:8}}>Studio not found</div>
      <div style={{fontSize:13,color:MUTED}}>Double-check the link and try again.</div>
    </div>
  )

  const socials=[
    {key:'instagram_url',Icon:IconIG,label:'Instagram'},
    {key:'twitter_url', Icon:IconX, label:'X'},
    {key:'tiktok_url',  Icon:IconTikTok,label:'TikTok'},
    {key:'facebook_url',Icon:IconFB,label:'Facebook'},
  ].filter(s=>ws[s.key])

  // When a detail page is active, reset when tab changes
  function switchTab(t){ setTab(t); setProductPage(null); setLearnPage(null) }

  return(
    <div style={{background:'#0A0A0A',color:'#F5F0E8',minHeight:'100vh',fontFamily:"'DM Sans',system-ui,sans-serif"}}>

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <div style={{position:'relative'}}>
        <ShaderBg />

        {/* Minimal overlay — let the shader breathe */}
        <div style={{
          position:'absolute',inset:0,pointerEvents:'none',
          background:'linear-gradient(to bottom, rgba(8,7,5,0.55) 0%, rgba(8,7,5,0.04) 35%, rgba(8,7,5,0.04) 65%, rgba(8,7,5,0.6) 100%)',
        }}/>

        {/* Film grain */}
        <div style={{position:'absolute',inset:0,pointerEvents:'none',opacity:.28,backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`}}/>

        {/* NAV */}
        <nav className="cp-nav-wrap" style={{position:'relative',zIndex:2,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 40px'}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:G,letterSpacing:'0.05em'}}>
            Organized.<span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:300,color:MUTED,marginLeft:6}}>by {ws.name}</span>
          </div>
          <button className="cp-nav-book"
            onClick={()=>{ switchTab('book'); setTimeout(()=>document.getElementById('cp-tabs')?.scrollIntoView({behavior:'smooth'}),50) }}
            style={{background:G,color:'#0A0A0A',border:'none',padding:'10px 22px',fontSize:12,fontWeight:500,letterSpacing:'0.06em',cursor:'pointer',borderRadius:2,fontFamily:'inherit'}}>
            Book Now
          </button>
        </nav>

        {/* HERO CONTENT */}
        <div className="cp-hero-wrap" style={{position:'relative',zIndex:2,display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',padding:'60px 40px 100px'}}>

          <div className="cp-a1" style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(201,168,76,.1)',border:'1px solid rgba(201,168,76,.18)',borderRadius:100,padding:'6px 16px',fontSize:10,color:'#E8C97A',letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:28}}>
            <span style={{width:5,height:5,borderRadius:'50%',background:G,animation:'cpPulse 2s infinite',flexShrink:0}}/>
            {ws.city || ws.location || 'Hair Studio'}
          </div>

          <h1 className="cp-a2" style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(46px,7vw,78px)',fontWeight:500,lineHeight:1.05,marginBottom:12,textShadow:'0 2px 20px rgba(0,0,0,0.3)'}}>
            {ws.name}
          </h1>

          {ws.tagline && (
            <p className="cp-a3" style={{fontSize:11,letterSpacing:'0.18em',textTransform:'uppercase',color:MUTED,marginBottom:26}}>
              {ws.tagline}
            </p>
          )}

          {(ws.bio||ws.description) && (
            <p className="cp-a3" style={{fontSize:15,lineHeight:1.9,color:SOFT,maxWidth:420,marginBottom:36,fontWeight:300,textShadow:'0 1px 8px rgba(0,0,0,0.3)'}}>
              {ws.bio||ws.description}
            </p>
          )}

          {socials.length>0 && (
            <div className="cp-a4" style={{display:'flex',alignItems:'center',gap:24}}>
              {socials.map(({key,Icon,label})=>(
                <a key={key} href={ws[key]} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="cp-social" style={{color:'rgba(245,240,232,0.45)',display:'flex',lineHeight:0}}>
                  <Icon/>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══ TABS ══════════════════════════════════════════════════════════ */}
      <div id="cp-tabs" style={{position:'sticky',top:0,zIndex:50,background:'#111',borderBottom:'1px solid #1e1e1e',display:'flex',justifyContent:'center',boxShadow:'0 4px 24px rgba(0,0,0,.5)'}}>
        {[['book','Booking'],['shop','Shop'],['learn','Learn']].map(([k,l])=>(
          <button key={k} className="cp-tab-btn" onClick={()=>switchTab(k)}
            style={{background:'none',border:'none',padding:'16px 32px',fontSize:11,fontWeight:500,letterSpacing:'0.14em',textTransform:'uppercase',color:tab===k?G:MUTED,cursor:'pointer',fontFamily:'inherit',borderBottom:tab===k?`2px solid ${G}`:'2px solid transparent'}}>
            {l}
          </button>
        ))}
      </div>

      {/* ══ CONTENT ═══════════════════════════════════════════════════════ */}
      <div className="cp-pad" style={{maxWidth:1100,margin:'0 auto',padding:'80px 40px 140px'}}>

        {/* ── BOOKING ───────────────────────────────────────────────── */}
        {tab==='book' && (
          <div style={{display:'flex',flexDirection:'column',gap:96}}>

            {/* Portfolio */}
            {portfolio.length>0 && (
              <section>
                <Label>Portfolio</Label>
                <SecTitle>The <em style={{fontStyle:'italic',color:G}}>work</em></SecTitle>
                <div className="cp-pf-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                  {portfolio.map((ph,i)=>(
                    <div key={ph.id||i} className="cp-pf-item" style={{aspectRatio:'1',borderRadius:2,background:'#1a1a1a'}}>
                      <img src={ph.url} alt=""/>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Services */}
            <section>
              <Label>What We Offer</Label>
              <SecTitle>Services</SecTitle>
              {services.length===0 ? <p style={{color:MUTED,fontSize:13}}>No services listed yet.</p> : (
                <div className="cp-svc-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1px',background:'#1e1e1e',border:'1px solid #1e1e1e'}}>
                  {services.map((svc,i)=>(
                    <div key={svc.id||i} className="cp-svc-card"
                      style={{background:'#111',padding:'36px 28px',position:'relative',overflow:'hidden'}}
                      onClick={()=>{setBookModal(svc);setBooked(false);setBookForm({name:'',email:'',phone:'',date:'',time:'',notes:''})}}>
                      <div className="cp-svc-line" style={{position:'absolute',bottom:0,left:0,right:0,height:2,background:G,transform:'scaleX(0)',transformOrigin:'left'}}/>
                      <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:500,marginBottom:8}}>{svc.name}</div>
                      <div style={{fontSize:11,color:MUTED,letterSpacing:'0.08em',marginBottom:20}}>{svc.duration_min?`${svc.duration_min} min`:'\u00A0'}</div>
                      <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,color:G}}>{svc.is_free?'Free':`$${svc.price}`}</div>
                      <div style={{marginTop:18,fontSize:10,letterSpacing:'0.12em',color:MUTED,textTransform:'uppercase'}}>Book &rarr;</div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Reviews */}
            <section>
              <Label>Client Love</Label>
              <SecTitle>What they <em style={{fontStyle:'italic',color:G}}>say</em></SecTitle>
              {reviews.length===0 ? (
                <div style={{padding:'48px 40px',border:'1px solid #1a1a1a',textAlign:'center'}}>
                  <p style={{fontSize:13,color:MUTED,lineHeight:1.9}}>
                    Reviews from clients will appear here.<br/>
                    After each appointment, clients receive an invitation to share their experience.
                  </p>
                </div>
              ) : (
                <div className="cp-rev-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
                  {reviews.map((rv,i)=>(
                    <div key={rv.id||i} style={{background:'#111',border:'1px solid #1e1e1e',padding:'28px 28px 24px',borderRadius:2}}>
                      <div style={{fontFamily:"'Playfair Display',serif",fontSize:44,color:'rgba(201,168,76,.12)',lineHeight:1,marginBottom:12}}>&ldquo;</div>
                      <p style={{fontSize:13,lineHeight:1.9,color:SOFT,fontWeight:300,marginBottom:20}}>{rv.body||rv.text||rv.comment}</p>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div style={{width:34,height:34,borderRadius:'50%',background:'rgba(201,168,76,.08)',border:'1px solid rgba(201,168,76,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:G,fontWeight:500}}>
                          {(rv.client_name||rv.reviewer_name||rv.name||'?')[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{fontSize:12,fontWeight:500}}>{rv.client_name||rv.reviewer_name||rv.name}</div>
                          <Stars n={rv.rating||5}/>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* FAQ */}
            <section>
              <Label>Good to Know</Label>
              <SecTitle>FAQ</SecTitle>
              <div style={{borderTop:'1px solid #1e1e1e'}}>
                {FAQ.map((item,i)=>(
                  <div key={i} className="cp-faq-row" style={{borderBottom:'1px solid #1e1e1e'}}
                    onClick={()=>setFaqOpen(faqOpen===i?null:i)}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'22px 4px',gap:16}}>
                      <div style={{fontSize:14,fontWeight:500,lineHeight:1.4}}>{item.q}</div>
                      <div style={{fontSize:22,color:G,flexShrink:0,fontWeight:300,lineHeight:1,transform:faqOpen===i?'rotate(45deg)':'none',transition:'transform .2s'}}>+</div>
                    </div>
                    {faqOpen===i && (
                      <div style={{paddingBottom:24,paddingRight:32,fontSize:13,lineHeight:1.9,color:MUTED,fontWeight:300}}>{item.a}</div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ── SHOP ──────────────────────────────────────────────────── */}
        {tab==='shop' && (
          <>
            {productPage ? (
              <ProductDetail item={productPage} onBack={()=>setProductPage(null)} isFormation={false}/>
            ) : (
              <>
                <Label>Available Now</Label>
                <SecTitle>Products</SecTitle>
                {products.length===0 ? (
                  <p style={{color:MUTED,fontSize:13}}>No products listed yet.</p>
                ) : (
                  <div className="cp-shop-grid">
                    {products.map(p=>(
                      <div key={p.id} className="cp-grid-card"
                        style={{border:'1px solid #1e1e1e',background:'#111',borderRadius:2}}
                        onClick={()=>setProductPage(p)}>
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} style={{width:'100%',aspectRatio:'1',objectFit:'cover',display:'block'}}/>
                        ) : (
                          <div style={{width:'100%',aspectRatio:'1',background:'#1a1a1a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:'rgba(245,240,232,0.1)',letterSpacing:'0.12em',textTransform:'uppercase'}}>No photo</div>
                        )}
                        <div style={{padding:'14px 14px 18px'}}>
                          <div style={{fontSize:13,fontWeight:600,marginBottom:4,lineHeight:1.3}}>{p.name}</div>
                          {p.description && <div style={{fontSize:11,color:MUTED,lineHeight:1.6,marginBottom:10,fontWeight:300}}>{p.description.slice(0,60)}{p.description.length>60?'…':''}</div>}
                          <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:G}}>${p.price}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ── LEARN ─────────────────────────────────────────────────── */}
        {tab==='learn' && (
          <>
            {learnPage ? (
              <ProductDetail item={learnPage} onBack={()=>setLearnPage(null)} isFormation={true}/>
            ) : (
              <>
                <Label>Formations</Label>
                <SecTitle>Learn</SecTitle>
                {offerings.length===0 ? (
                  <p style={{color:MUTED,fontSize:13}}>No formations available yet.</p>
                ) : (
                  <div className="cp-shop-grid">
                    {offerings.map(o=>(
                      <div key={o.id} className="cp-grid-card"
                        style={{border:'1px solid #1e1e1e',background:'#111',borderRadius:2}}
                        onClick={()=>setLearnPage(o)}>
                        {o.image_url ? (
                          <img src={o.image_url} alt={o.name||o.title} style={{width:'100%',aspectRatio:'1.5',objectFit:'cover',display:'block'}}/>
                        ) : (
                          <div style={{width:'100%',aspectRatio:'1.5',background:'#1a1a1a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:'rgba(245,240,232,0.1)',letterSpacing:'0.12em',textTransform:'uppercase'}}>No photo</div>
                        )}
                        <div style={{padding:'14px 14px 18px'}}>
                          <div style={{fontSize:13,fontWeight:600,marginBottom:4,lineHeight:1.3}}>{o.name||o.title}</div>
                          {o.description && <div style={{fontSize:11,color:MUTED,lineHeight:1.6,marginBottom:10,fontWeight:300}}>{o.description.slice(0,60)}{o.description.length>60?'…':''}</div>}
                          <div style={{display:'flex',alignItems:'center',gap:12}}>
                            {o.price>0 && <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:G}}>${o.price}</div>}
                            {(o.duration||o.duration_min) && <div style={{fontSize:11,color:MUTED}}>{o.duration||`${o.duration_min} min`}</div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* ══ FOOTER ════════════════════════════════════════════════════════ */}
      <div className="cp-footer" style={{borderTop:'1px solid #1a1a1a',padding:'26px 40px',background:'#0A0A0A',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,color:G}}>Organized.</div>
        <div style={{fontSize:11,color:MUTED}}>
          Powered by{' '}
          <a href="https://beorganized.io" target="_blank" rel="noopener noreferrer"
            style={{color:'rgba(245,240,232,0.4)',textDecoration:'none'}}>beorganized.io</a>
        </div>
      </div>

      {/* ══ BOOKING MODAL ═════════════════════════════════════════════════ */}
      {bookModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.78)',backdropFilter:'blur(5px)',zIndex:200,display:'flex',alignItems:'flex-end',justifyContent:'center'}}
          onClick={()=>setBookModal(null)}>
          <div style={{background:'#111',width:'100%',maxWidth:520,borderRadius:'12px 12px 0 0',padding:'2rem 1.75rem',maxHeight:'92vh',overflowY:'auto',border:'1px solid #1e1e1e',borderBottom:'none'}}
            onClick={e=>e.stopPropagation()}>
            <div style={{width:30,height:3,borderRadius:2,background:'#2a2a2a',margin:'-0.25rem auto 1.75rem'}}/>
            {booked ? (
              <div style={{textAlign:'center',padding:'2rem 0 1rem'}}>
                <div style={{width:48,height:48,borderRadius:'50%',border:`1px solid rgba(201,168,76,.3)`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',color:G,fontSize:20}}>&#10003;</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.4rem',marginBottom:8}}>Request sent</div>
                <div style={{fontSize:13,color:MUTED,lineHeight:1.8,maxWidth:280,margin:'0 auto'}}>
                  Your request for <strong style={{color:SOFT}}>{bookModal.name}</strong> has been sent. The studio will confirm shortly.
                </div>
                <button onClick={()=>setBookModal(null)}
                  style={{marginTop:28,background:G,color:'#0A0A0A',border:'none',padding:'12px 28px',fontSize:13,fontWeight:500,cursor:'pointer',borderRadius:2,fontFamily:'inherit',letterSpacing:'0.05em'}}>
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={submitBooking}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.4rem',marginBottom:4}}>{bookModal.name}</div>
                <div style={{fontSize:12,color:MUTED,marginBottom:24,display:'flex',gap:12}}>
                  {bookModal.duration_min && <span>{bookModal.duration_min} min</span>}
                  {bookModal.price>0 && <span>&mdash; ${bookModal.price}</span>}
                </div>
                {[
                  ['name','Full name','text',true],
                  ['email','Email','email',false],
                  ['phone','Phone','tel',false],
                  ['date','Preferred date','date',true],
                  ['time','Preferred time','time',true],
                  ['notes','Notes (optional)','text',false],
                ].map(([k,l,t,req])=>(
                  <div key={k} style={{marginBottom:12}}>
                    <label style={{display:'block',fontSize:10,letterSpacing:'0.14em',textTransform:'uppercase',color:MUTED,marginBottom:6}}>{l}</label>
                    <input type={t} value={bookForm[k]} onChange={e=>setBookForm(f=>({...f,[k]:e.target.value}))} required={req}
                      style={{width:'100%',background:'#1a1a1a',border:'1px solid #2a2a2a',color:'#F5F0E8',padding:'12px 14px',fontSize:14,fontFamily:'inherit',borderRadius:2,outline:'none',boxSizing:'border-box'}}/>
                  </div>
                ))}
                <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:20}}>
                  <button type="button" onClick={()=>setBookModal(null)}
                    style={{padding:'12px 20px',border:'1px solid #2a2a2a',background:'none',color:MUTED,fontSize:13,cursor:'pointer',borderRadius:2,fontFamily:'inherit'}}>
                    Cancel
                  </button>
                  <button type="submit" disabled={booking}
                    style={{background:G,color:'#0A0A0A',border:'none',padding:'12px 24px',fontSize:13,fontWeight:500,cursor:'pointer',borderRadius:2,fontFamily:'inherit',letterSpacing:'0.04em',opacity:booking?.6:1}}>
                    {booking?'Sending...':'Send request \u2192'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ══ TOAST ═════════════════════════════════════════════════════════ */}
      {toast && (
        <div style={{position:'fixed',bottom:28,right:24,background:'#111',color:'#F5F0E8',padding:'12px 20px',borderRadius:2,fontSize:13,zIndex:300,borderLeft:`2px solid ${G}`,boxShadow:'0 4px 24px rgba(0,0,0,.5)',maxWidth:'calc(100vw - 3rem)'}}>
          {toast}
        </div>
      )}
    </div>
  )
}
