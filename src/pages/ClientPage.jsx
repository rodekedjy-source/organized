import { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { enrollFree } from '../api/offerings'

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const TODAY  = new Date()
const TODAY_DATE = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate())

// ─────────────────────────────────────────────────────────────────────────────
// SLOT GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
function generateSlots(openTime, closeTime, durationMin, existingAppts) {
  const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
  const toLabel = (min) => {
    const h = Math.floor(min / 60), m = min % 60
    const ampm = h >= 12 ? 'PM' : 'AM', h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
    return `${h12}:${String(m).padStart(2,'0')} ${ampm}`
  }
  const openMin = toMin(openTime), closeMin = toMin(closeTime), slots = []
  for (let cur = openMin; cur + durationMin <= closeMin; cur += 30) {
    const slotEnd = cur + durationMin
    const isBooked = existingAppts.some((a) => {
      const d = new Date(a.scheduled_at)
      const s = d.getHours() * 60 + d.getMinutes(), e = s + (a.duration_min || 60)
      return cur < e && slotEnd > s
    })
    slots.push({ label: toLabel(cur), minutes: cur, available: !isBooked })
  }
  return slots
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATES — 3 visual themes for the public page
// ─────────────────────────────────────────────────────────────────────────────
const TEMPLATES = {
  warm: {
    // ── hero animation (FIX 1 orb, FIX 6 base color) ───────────────────────
    '--hero-base':'#D4C4A8','--hero-base-2':'#C8B898',
    '--hero-orb':'rgba(255,245,210,0.40)','--hero-duration':'12s',
    // ── hero text — white on the beige hero (FIX 3) ────────────────────────
    '--hero-text':'#FFFFFF',
    '--hero-text-muted':'rgba(255,255,255,0.75)',
    '--hero-text-soft':'rgba(255,255,255,0.55)',
    // ── template vars ──────────────────────────────────────────────────────
    '--body-bg':'#FAF5EE',
    '--text-primary':'#1A0E00','--text-secondary':'#6B5030','--accent':'#B8924A',
    '--btn-bg':'#B8924A','--btn-text':'#1A0E00',
    '--btn-ghost-text':'#FFFFFF','--btn-ghost-border':'rgba(255,255,255,0.50)',
    '--nav-bg':'#1A0900','--nav-text':'#F0DEB8',       // FIX 3 — dark chocolate nav
    '--tab-bg':'#1A0900','--tab-text':'#A08050','--tab-active-border':'#B8924A',
    '--card-bg':'#FFFFFF','--card-border':'#E8DDD0','--price-color':'#B8924A',
    // ── remap global vars so ALL existing CSS auto-adapts ─────────────────
    '--dark':'#FAF5EE','--dark-2':'#FFFFFF','--dark-3':'#F5F0E8',
    '--dark-4':'#E8DDD0','--dark-5':'#D4C4A8',
    '--text':'#1A0E00','--text-muted':'#6B5030','--text-soft':'#8B6840',
    '--gold':'#B8924A','--gold-light':'#D4A860',
    '--gold-dim':'rgba(184,146,74,0.10)','--gold-border':'rgba(184,146,74,0.25)',
  },
  dark: {
    // ── hero animation (FIX 1 orb bump) ────────────────────────────────────
    '--hero-base':'#080808','--hero-base-2':'#0F0A04',
    '--hero-orb':'rgba(201,168,76,0.18)','--hero-duration':'16s',
    // ── hero text — white/gold on pitch black (FIX 2) ──────────────────────
    '--hero-text':'#FFFFFF',
    '--hero-text-muted':'#C9A84C',
    '--hero-text-soft':'#AAAAAA',
    // ── template vars ──────────────────────────────────────────────────────
    '--body-bg':'#FFFFFF',
    '--text-primary':'#0A0A0A','--text-secondary':'#555555','--accent':'#C9A84C',
    '--btn-bg':'#C9A84C','--btn-text':'#080808',
    '--nav-bg':'#000000','--nav-text':'#C9A84C',
    '--tab-bg':'#000000','--tab-text':'#C9A84C','--tab-active-border':'#C9A84C',
    '--card-bg':'#FFFFFF','--card-border':'#E8E0D0','--price-color':'#C9A84C',
    // ── remap global vars ─────────────────────────────────────────────────
    '--dark':'#F8F8F8','--dark-2':'#FFFFFF','--dark-3':'#F0F0F0',
    '--dark-4':'#E8E0D0','--dark-5':'#CCC',
    '--text':'#0A0A0A','--text-muted':'#555555','--text-soft':'#888888',
    '--gold':'#C9A84C','--gold-light':'#E8C97A',
    '--gold-dim':'rgba(201,168,76,0.12)','--gold-border':'rgba(201,168,76,0.25)',
  },
  rose: {
    // ── hero animation (FIX 1 orb) ─────────────────────────────────────────
    '--hero-base':'#F2C4CE','--hero-base-2':'#E8A8B8',
    '--hero-orb':'rgba(255,220,230,0.40)','--hero-duration':'14s',
    // ── hero text — dark on light pink hero ────────────────────────────────
    '--hero-text':'#2A0E18',
    '--hero-text-muted':'#8B4A60',
    '--hero-text-soft':'#6B3048',
    // ── template vars ──────────────────────────────────────────────────────
    '--body-bg':'#FFF8FA',
    '--text-primary':'#2A0E18','--text-secondary':'#8B4A60','--accent':'#C4607A',
    '--btn-bg':'#3D1A24','--btn-text':'#FFE4EC',       // FIX 4 — nav-matched button
    '--nav-bg':'#3D1A24','--nav-text':'#FFE4EC',
    '--tab-bg':'#3D1A24','--tab-text':'#FFE4EC','--tab-active-border':'#C4849A',
    '--card-bg':'#FFFFFF','--card-border':'#F5DCE4','--price-color':'#C4607A',
    // ── remap global vars ─────────────────────────────────────────────────
    '--dark':'#FFF8FA','--dark-2':'#FFFFFF','--dark-3':'#FFF0F4',
    '--dark-4':'#F5DCE4','--dark-5':'#E8C0D0',
    '--text':'#2A0E18','--text-muted':'#8B4A60','--text-soft':'#6B3048',
    '--gold':'#C4607A','--gold-light':'#DC7A94',
    '--gold-dim':'rgba(196,96,122,0.10)','--gold-border':'rgba(196,96,122,0.22)',
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// FAQ BUILDER
// ─────────────────────────────────────────────────────────────────────────────
function buildFAQ(workspace, services) {
  if (!workspace) return []
  const faq = workspace.faq_settings || {}, items = []
  const depositSvcs = services.filter(s => Number(s.deposit_amount) > 0)
  if (depositSvcs.length > 0) items.push({q:'Is a deposit required?',a:`Yes, a deposit of $${depositSvcs[0].deposit_amount} is required. It is collected at the studio and applied to your total. Non-refundable for cancellations under ${faq.cancellation_hours||48} hours.`})
  items.push({q:'Can I cancel or reschedule?',a:`You can cancel or reschedule up to ${faq.cancellation_hours||48} hours before your appointment at no charge. Use the link in your confirmation email.`})
  if (workspace.offers_domicile) items.push({q:'Do you offer home visits?',a:`Yes, within ${workspace.domicile_radius_km||25} km for an additional fee of $${workspace.domicile_fee||45}. Space requirements apply.`})
  items.push({q:'Do you work with all hair types?',a: faq.hair_types?.length ? `Yes — ${faq.hair_types.join(', ')} textures are welcome. Every session begins with a consultation.` : 'Yes, all hair types and textures are welcome. Every session begins with a consultation.'})
  items.push({q:'How should I prepare?',a: faq.prep_notes || 'Come with clean, dry hair. Bring reference photos if you have them. Avoid heavy styling products the day of your appointment.'})
  return items.slice(0,5)
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function Stars({rating}) {
  return <span style={{color:'var(--gold)',fontSize:12,letterSpacing:2}}>{'★'.repeat(Math.round(rating))}{'☆'.repeat(5-Math.round(rating))}</span>
}
function formatDateLabel(y,m,d) { return `${MONTHS[m]} ${d}, ${y}` }

const CA_PROVINCES = [
  ['AB','Alberta'],['BC','British Columbia'],['MB','Manitoba'],['NB','New Brunswick'],
  ['NL','Newfoundland and Labrador'],['NS','Nova Scotia'],['NT','Northwest Territories'],
  ['NU','Nunavut'],['ON','Ontario'],['PE','Prince Edward Island'],['QC','Quebec'],
  ['SK','Saskatchewan'],['YT','Yukon'],
]
const US_STATES = [
  ['AL','Alabama'],['AK','Alaska'],['AZ','Arizona'],['AR','Arkansas'],['CA','California'],
  ['CO','Colorado'],['CT','Connecticut'],['DE','Delaware'],['FL','Florida'],['GA','Georgia'],
  ['HI','Hawaii'],['ID','Idaho'],['IL','Illinois'],['IN','Indiana'],['IA','Iowa'],
  ['KS','Kansas'],['KY','Kentucky'],['LA','Louisiana'],['ME','Maine'],['MD','Maryland'],
  ['MA','Massachusetts'],['MI','Michigan'],['MN','Minnesota'],['MS','Mississippi'],['MO','Missouri'],
  ['MT','Montana'],['NE','Nebraska'],['NV','Nevada'],['NH','New Hampshire'],['NJ','New Jersey'],
  ['NM','New Mexico'],['NY','New York'],['NC','North Carolina'],['ND','North Dakota'],['OH','Ohio'],
  ['OK','Oklahoma'],['OR','Oregon'],['PA','Pennsylvania'],['RI','Rhode Island'],['SC','South Carolina'],
  ['SD','South Dakota'],['TN','Tennessee'],['TX','Texas'],['UT','Utah'],['VT','Vermont'],
  ['VA','Virginia'],['WA','Washington'],['WV','West Virginia'],['WI','Wisconsin'],['WY','Wyoming'],
]

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ClientPage() {
  const { slug } = useParams()

  // ── Data ──────────────────────────────────────────────────────────────────
  const [workspace,    setWorkspace]    = useState(null)
  const [services,     setServices]     = useState([])
  const [availability, setAvailability] = useState([])
  const [blockedDates, setBlockedDates] = useState([])
  const [products,     setProducts]     = useState([])
  const [offerings,    setOfferings]    = useState([])
  const [reviews,      setReviews]      = useState([])
  const [portfolio,    setPortfolio]    = useState([])
  const [loading,      setLoading]      = useState(true)
  const [notFound,     setNotFound]     = useState(false)

  // ── Theme — driven by workspace.theme, no user override ──────────────────
  const [theme, setTheme] = useState('warm')   // default warm avoids dark flash on first paint
  useEffect(() => {
    if (!workspace) return
    setTheme(workspace.theme || 'warm')
  }, [workspace])
  // Apply template CSS vars synchronously before paint.
  // IMPORTANT: also depends on `loading` so the effect re-fires when the full
  // page mounts — when theme stays 'warm' (initial) → 'warm' (from DB),
  // setTheme is a no-op and theme never "changes", so [theme] alone would
  // never fire once #client-page-root actually exists in the DOM.
  useLayoutEffect(() => {
    const template = TEMPLATES[theme] || TEMPLATES.warm
    const root = document.getElementById('client-page-root')
    if (!root) return
    Object.entries(template).forEach(([key, val]) => {
      if (key.startsWith('--')) root.style.setProperty(key, val)
    })
  }, [theme, loading])

  // (hero background is pure CSS animation — no canvas needed)

  // ── UI State ──────────────────────────────────────────────────────────────
  const [activeTab,      setActiveTab]      = useState('book')
  const [heroFading,     setHeroFading]     = useState(false)
  const [portfolioOpen,  setPortfolioOpen]  = useState(false)
  const [lbOpen,         setLbOpen]         = useState(false)
  const [lbIdx,          setLbIdx]          = useState(0)
  const lbTouchX = useRef(0)
  const [policyOpen,     setPolicyOpen]     = useState(false)
  const [cartOpen,       setCartOpen]       = useState(false)
  const [cartItems,      setCartItems]      = useState([])
  const [openFAQ,        setOpenFAQ]        = useState(null)
  const [floatOpen,      setFloatOpen]      = useState(false)
  const [freeItemsMsg,   setFreeItemsMsg]   = useState('')
  const [shopFilter,     setShopFilter]     = useState('all')
  const [learnFilter,    setLearnFilter]    = useState('all')

  // ── Enrollment state ──────────────────────────────────────────────────────
  const [enrollOpen,      setEnrollOpen]      = useState(false)
  const [enrollOffering,  setEnrollOffering]  = useState(null)
  const [enrollForm,      setEnrollForm]      = useState({ name: '', email: '', phone: '' })
  const [enrollSubmitting,setEnrollSubmitting]= useState(false)
  const [enrollDone,      setEnrollDone]      = useState(false)
  const [enrollError,     setEnrollError]     = useState('')
  const [offeringDetail,  setOfferingDetail]  = useState(null)
  const [odSlideIdx,      setOdSlideIdx]      = useState(0)
  const [odLightboxImg,   setOdLightboxImg]   = useState(null)
  const odTouchX = useRef(0)
  const [productDetail,   setProductDetail]   = useState(null)
  const [pdSlideIdx,      setPdSlideIdx]      = useState(0)
  const [pdLightboxImg,   setPdLightboxImg]   = useState(null)
  const pdTouchX = useRef(0)

  // ── Checkout state (shop + learn paid) ───────────────────────────────────
  const [checkoutOpen,       setCheckoutOpen]       = useState(false)
  const [checkoutItem,       setCheckoutItem]       = useState(null)
  const [checkoutSecret,     setCheckoutSecret]     = useState(null)
  const [checkoutPiId,       setCheckoutPiId]       = useState(null)
  const [checkoutForm,       setCheckoutForm]       = useState({ name:'', email:'' })
  const [checkoutStep,       setCheckoutStep]       = useState(1)
  const [checkoutError,      setCheckoutError]      = useState('')
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false)
  const [checkoutDone,       setCheckoutDone]       = useState(false)
  const [checkoutAddress,    setCheckoutAddress]    = useState({ street:'', apt:'', city:'', province:'', postal:'', country:'Canada' })
  const [checkoutPhone,      setCheckoutPhone]      = useState('')
  const [checkoutAgreed,     setCheckoutAgreed]     = useState(false)
  const [postalError,        setPostalError]        = useState('')
  const [cardholderName,     setCardholderName]     = useState('')
  const checkoutStripeRef   = useRef(null)
  const checkoutElementsRef = useRef(null)
  const checkoutCardRef     = useRef(null)

  // ── Booking state ─────────────────────────────────────────────────────────
  const [bkOpen,         setBkOpen]         = useState(false)
  const [bkPage,         setBkPage]         = useState(1)
  const [bkService,      setBkService]      = useState(null)
  const [bkAddons,       setBkAddons]       = useState([])
  const [bkVisit,        setBkVisit]        = useState('studio')
  const [bkPolicy,       setBkPolicy]       = useState(false)
  const [bkDom,          setBkDom]          = useState({street:'',city:'',postal:'',access:''})
  const [bkCalY,         setBkCalY]         = useState(TODAY.getFullYear())
  const [bkCalM,         setBkCalM]         = useState(TODAY.getMonth())
  const [bkDay,          setBkDay]          = useState(null)
  const [bkTime,         setBkTime]         = useState(null)
  const [bkSlots,        setBkSlots]        = useState([])
  const [bkSlotsLoading, setBkSlotsLoading] = useState(false)
  const [bkForm,         setBkForm]         = useState({fname:'',lname:'',email:'',phone:'',source:'',notes:''})
  const [bkErrors,       setBkErrors]       = useState({})
  const [bkSubmitting,   setBkSubmitting]   = useState(false)
  const [bkAppointment,  setBkAppointment]  = useState(null)
  const [bkSubmitErr,    setBkSubmitErr]    = useState(null)
  // Deposit / Stripe
  const [bkPolicyAgreed, setBkPolicyAgreed] = useState(false)  // booking-policy step 0 checkbox
  const [bkDepositPi,    setBkDepositPi]    = useState(null)   // { client_secret, payment_intent_id }
  const [bkPaymentLoading, setBkPaymentLoading] = useState(false)
  const [bkPaymentErr,   setBkPaymentErr]   = useState(null)
  const stripeRef   = useRef(null)
  const elementsRef = useRef(null)

  // ── Fetch all data ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!slug) return
    let cancelled = false
    async function fetchAll() {
      setLoading(true); setNotFound(false)
      try {
        const { data: ws } = await supabase.from('workspaces')
          .select('id,name,slug,tagline,bio,avatar_url,instagram,tiktok,phone,email,location,timezone,currency,is_published,theme,accepts_bookings,accepts_orders,offers_domicile,domicile_fee,domicile_radius_km,domicile_notes,address_visibility,neighborhood,address_street,address_city,address_province,address_postal,share_address,show_address_on_page,faq_settings,featured_product_id,featured_product_note,working_hours,deposit_required,deposit_type,deposit_value,review_requests_enabled,payment_mode,policy_enabled,policy_deposit_pct,policy_cancel_hours,policy_late_fee,policy_no_show_fee,policy_custom')
          .eq('slug', slug).eq('is_published', true).maybeSingle()
        if (!ws) { if (!cancelled) { setNotFound(true); setLoading(false) }; return }
        if (!cancelled) setWorkspace(ws)
        const today = new Date().toISOString().split('T')[0]
        const [
          {data:svc},{data:avail},{data:blk},{data:prod},{data:offer},{data:rev},{data:port}
        ] = await Promise.all([
          supabase.from('services').select('id,name,description,duration_min,price,is_free,display_order,addons,deposit_amount,category,image_url').eq('workspace_id',ws.id).eq('is_active',true).is('deleted_at',null).order('display_order',{ascending:true}),
          supabase.from('availability').select('day_of_week,is_open,open_time,close_time').eq('workspace_id',ws.id).order('day_of_week',{ascending:true}),
          supabase.from('blocked_dates').select('blocked_date').eq('workspace_id',ws.id).gte('blocked_date',today),
          supabase.from('products').select('id,name,description,price,currency,stock,image_url,images,discount_price,discount_ends_at').eq('workspace_id',ws.id).eq('is_active',true).is('deleted_at',null).order('created_at',{ascending:false}),
          supabase.from('offerings').select('id,title,description,price,currency,duration_label,format,max_students,is_active,type,content_url,content_type,files,workshop_date,workshop_location,spots_total,spots_taken').eq('workspace_id',ws.id).eq('is_active',true).is('deleted_at',null).order('created_at',{ascending:false}),
          supabase.from('reviews').select('reviewer_name,rating,body,service_label,service_name,created_at').eq('workspace_id',ws.id).eq('is_visible',true).eq('is_approved',true).order('created_at',{ascending:false}).limit(12),
          supabase.from('portfolio_photos').select('id,url,caption,display_order').eq('workspace_id',ws.id).order('display_order',{ascending:true}),
        ])
        if (!cancelled) {
          setServices(svc||[]); setAvailability(avail||[])
          setBlockedDates((blk||[]).map(b=>b.blocked_date))
          setProducts(prod||[]); setOfferings(offer||[])
          setReviews(rev||[]); setPortfolio(port||[])
        }
      } catch(e) { console.error(e) } finally { if (!cancelled) setLoading(false) }
    }
    fetchAll()
    return () => { cancelled = true }
  }, [slug])

  // ── Realtime — live sync for workspace, services, products ────────────────
  useEffect(() => {
    if (!workspace?.id) return
    const wsId = workspace.id

    const channel = supabase.channel(`cp_realtime_${wsId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'workspaces', filter: `id=eq.${wsId}` }, payload => {
        setWorkspace(prev => prev ? { ...prev, ...payload.new } : prev)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services', filter: `workspace_id=eq.${wsId}` }, async () => {
        const { data } = await supabase.from('services').select('id,name,description,duration_min,price,is_free,display_order,addons,deposit_amount,category,image_url').eq('workspace_id', wsId).eq('is_active', true).is('deleted_at', null).order('display_order', { ascending: true })
        if (data) setServices(data)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products', filter: `workspace_id=eq.${wsId}` }, async () => {
        const { data } = await supabase.from('products').select('id,name,description,price,currency,stock,image_url,images').eq('workspace_id', wsId).eq('is_active', true).is('deleted_at', null).order('created_at', { ascending: false })
        if (data) setProducts(data)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'availability', filter: `workspace_id=eq.${wsId}` }, () => {
        supabase.from('availability').select('day_of_week,is_open,open_time,close_time').eq('workspace_id', wsId).order('day_of_week', { ascending: true })
          .then(({ data }) => { if (data) setAvailability(data) })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [workspace?.id])

  // ── BUG 9 — scroll lock for all overlays ─────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = (bkOpen||portfolioOpen||cartOpen||policyOpen||lbOpen||enrollOpen||!!offeringDetail||!!productDetail||checkoutOpen) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [bkOpen, portfolioOpen, cartOpen, policyOpen, lbOpen, enrollOpen, offeringDetail, productDetail, checkoutOpen])
  useEffect(() => { setOdSlideIdx(0); setOdLightboxImg(null) }, [offeringDetail?.id])
  useEffect(() => { setPdSlideIdx(0); setPdLightboxImg(null) }, [productDetail?.id])

  // ── Cart sessionStorage — restore on workspace load ───────────────────────
  useEffect(() => {
    if (!workspace?.id) return
    try {
      const saved = sessionStorage.getItem('organized_cart_' + workspace.id)
      if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed) && parsed.length > 0) setCartItems(parsed) }
    } catch(e) {}
  }, [workspace?.id])
  // ── Cart sessionStorage — save whenever cart changes ─────────────────────
  useEffect(() => {
    if (!workspace?.id) return
    sessionStorage.setItem('organized_cart_' + workspace.id, JSON.stringify(cartItems))
  }, [cartItems]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── BUG 6 — init Stripe on deposit page ───────────────────────────────────
  useEffect(() => {
    if (bkPage !== 4 || !workspace || !bkService || workspace.payment_mode === 'cash_only') return
    const depositAmt = (() => {
      if (workspace.deposit_required) {
        if (workspace.deposit_type === 'percentage') return Math.round(Number(bkService.price) * Number(workspace.deposit_value) / 100 * 100) / 100
        return Number(workspace.deposit_value) || 0
      }
      return Number(bkService.deposit_amount) > 0 ? Number(bkService.deposit_amount) : 0
    })()
    if (depositAmt < 0.50) return
    setBkPaymentLoading(true); setBkPaymentErr(null); setBkDepositPi(null)
    async function initStripe() {
      if (!window.Stripe) {
        await new Promise((res, rej) => {
          const s = document.createElement('script'); s.src = 'https://js.stripe.com/v3/'
          s.onload = res; s.onerror = rej; document.head.appendChild(s)
        })
      }
      const pk = import.meta.env.VITE_STRIPE_PK
      if (!pk) { setBkPaymentErr('Payment not configured. Please contact the studio directly.'); setBkPaymentLoading(false); return }
      stripeRef.current = window.Stripe(pk)
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: { workspace_id: workspace.id, amount: depositAmt, currency: workspace.currency?.toLowerCase()||'cad', client_name: `${bkForm.fname} ${bkForm.lname}`, client_email: bkForm.email, description: `Deposit — ${bkService.name}` }
      })
      if (error || !data?.client_secret) { setBkPaymentErr(data?.error || 'Could not initialize payment. Please try again.'); setBkPaymentLoading(false); return }
      setBkDepositPi(data)
      const elements = stripeRef.current.elements({ clientSecret: data.client_secret })
      elementsRef.current = elements
      const card = elements.create('card', { style: { base: { color:'#F0EAE0', fontFamily:'DM Sans,sans-serif', fontSize:'14px', '::placeholder':{ color:'#6B5B4E' } } } })
      card.mount('#bk-card-element')
      setBkPaymentLoading(false)
    }
    initStripe().catch(e => { setBkPaymentErr('Payment initialization failed. Try again.'); setBkPaymentLoading(false) })
  }, [bkPage]) // eslint-disable-line

  // ── isDateAvailable ───────────────────────────────────────────────────────
  const isDateAvailable = useCallback((y, m, d) => {
    const dateStr = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    if (blockedDates.includes(dateStr)) return false
    const dow = new Date(dateStr+'T12:00:00').getDay()
    const a = availability.find(x => x.day_of_week === dow)
    return !!(a && a.is_open)
  }, [availability, blockedDates])

  // ── Load slots ────────────────────────────────────────────────────────────
  const loadSlots = useCallback(async (day, svc) => {
    if (!workspace || !svc) return
    const dateStr = `${bkCalY}-${String(bkCalM+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    const dow = new Date(dateStr+'T12:00:00').getDay()
    const avail = availability.find(a => a.day_of_week === dow)
    if (!avail || !avail.is_open) { setBkSlots([]); return }
    setBkSlotsLoading(true)
    const { data: existing } = await supabase.from('appointments')
      .select('scheduled_at,duration_min').eq('workspace_id', workspace.id)
      .gte('scheduled_at', `${dateStr}T00:00:00+00:00`).lte('scheduled_at', `${dateStr}T23:59:59+00:00`)
      .not('status','in','("cancelled")').is('deleted_at',null)
    setBkSlots(generateSlots(avail.open_time, avail.close_time, svc.duration_min || 60, existing||[]))
    setBkSlotsLoading(false)
  }, [workspace, availability, bkCalY, bkCalM])

  // ── Open booking ──────────────────────────────────────────────────────────
  const openBooking = (svc) => {
    setBkService(svc); setBkAddons([]); setBkVisit('studio'); setBkPolicy(false)
    setBkDom({street:'',city:'',postal:'',access:''}); setBkDay(null); setBkTime(null)
    setBkSlots([]); setBkCalY(TODAY.getFullYear()); setBkCalM(TODAY.getMonth())
    setBkForm({fname:'',lname:'',email:'',phone:'',source:'',notes:''})
    setBkErrors({}); setBkAppointment(null); setBkSubmitErr(null); setBkPolicyAgreed(false)
    setBkPage(hasPolicyGate ? 0 : 1); setBkOpen(true); document.body.style.overflow = 'hidden'
  }
  const closeBooking = () => { setBkOpen(false); document.body.style.overflow = '' }

  // ── Enrollment handler ────────────────────────────────────────────────────
  async function handleEnroll() {
    if (!enrollForm.name.trim() || !enrollForm.email.trim()) return
    if (Number(enrollOffering?.price) > 0) {
      setEnrollOpen(false)
      return
    }
    setEnrollSubmitting(true)
    setEnrollError('')
    try {
      console.log('enrollOffering:', enrollOffering)
      const { error } = await enrollFree(enrollOffering.id, workspace.id, { name: enrollForm.name, email: enrollForm.email, phone: enrollForm.phone })
      if (error) { console.error('enrollFree error:', error.message, error.code, error.details); setEnrollError('Could not complete enrollment: ' + error.message); return }
      const emailResp = await supabase.functions.invoke('send-enrollment-email', {
        body: {
          client_name: enrollForm.name,
          client_email: enrollForm.email,
          offering_title: enrollOffering.title,
          offering_type: enrollOffering.type,
          content_url: enrollOffering.content_url,
          content_type: enrollOffering.content_type,
          files: enrollOffering.files || [],
          workspace_name: workspace.name,
          booking_link: `https://beorganized.io/${workspace.slug}`,
          workshop_date: enrollOffering.workshop_date,
          workshop_location: enrollOffering.workshop_location,
        }
      })
      console.log('email response:', emailResp)
      // Persist enrollment to localStorage so detail page gates content
      const enrolled = JSON.parse(localStorage.getItem('enrolled_offerings') || '[]')
      if (!enrolled.includes(enrollOffering.id)) {
        enrolled.push(enrollOffering.id)
        localStorage.setItem('enrolled_offerings', JSON.stringify(enrolled))
      }
      setEnrollDone(true)
    } finally {
      setEnrollSubmitting(false)
    }
  }

  // ── isEnrolled helper ─────────────────────────────────────────────────────
  function isEnrolled(offeringId) {
    try {
      const enrolled = JSON.parse(localStorage.getItem('enrolled_offerings') || '[]')
      return enrolled.includes(offeringId)
    } catch { return false }
  }

  // ── Checkout (shop + paid enrollments) ───────────────────────────────────
  function openCheckout(type, item) {
    setCheckoutItem({ type, item, quantity: 1 })
    setCheckoutForm({ name:'', email:'' })
    setCheckoutStep(1)
    setCheckoutError('')
    setCheckoutDone(false)
    setCheckoutSecret(null)
    setCheckoutAddress({ street:'', apt:'', city:'', province:'', postal:'', country:'Canada' })
    setCheckoutPhone('')
    setCheckoutAgreed(false)
    setPostalError('')
    setCardholderName('')
    setCheckoutOpen(true)
  }

  async function initCheckoutStripe() {
    setCheckoutSubmitting(true)
    setCheckoutError('')
    try {
      if (!window.Stripe) {
        await new Promise((res, rej) => {
          const s = document.createElement('script'); s.src = 'https://js.stripe.com/v3/'
          s.onload = res; s.onerror = rej; document.head.appendChild(s)
        })
      }
      const pk = import.meta.env.VITE_STRIPE_PK
      if (!pk) { setCheckoutError('Payment not configured. Contact the studio directly.'); return }
      checkoutStripeRef.current = window.Stripe(pk)
      const price = checkoutItem.type === 'product' && isDiscountActive(checkoutItem.item)
        ? Number(checkoutItem.item.discount_price)
        : Number(checkoutItem.item.price)
      const shippingAddress = [
        checkoutAddress.street,
        checkoutAddress.apt ? checkoutAddress.apt : null,
        checkoutAddress.city,
        `${checkoutAddress.province} ${checkoutAddress.postal}`.trim(),
        checkoutAddress.country,
      ].filter(Boolean).join(', ')
      console.log('checkout payload:', {
        workspace_id: workspace.id,
        amount: checkoutItem.type === 'product'
          ? (isDiscountActive(checkoutItem.item)
            ? checkoutItem.item.discount_price
            : checkoutItem.item.price)
          : checkoutItem.item.price,
        order_type: checkoutItem.type,
        item_id: checkoutItem.item.id,
        client_name: checkoutForm.name,
        client_email: checkoutForm.email,
      })
      const { data, error } = await supabase.functions.invoke('create-checkout-payment-intent', {
        body: {
          workspace_id: workspace.id,
          amount: price,
          currency: checkoutItem.item.currency?.toLowerCase() || workspace.currency?.toLowerCase() || 'cad',
          client_name: checkoutForm.name,
          client_email: checkoutForm.email,
          order_type: checkoutItem.type,
          item_id: checkoutItem.item.id,
          item_name: (checkoutItem.type === 'product' || checkoutItem.type === 'cart') ? checkoutItem.item.name : checkoutItem.item.title,
          quantity: checkoutItem.quantity || 1,
          shipping_address: shippingAddress,
          cart_items: checkoutItem.type === 'cart' && checkoutItem.items?.length
            ? JSON.stringify(checkoutItem.items.map(i => ({
                name: i.name,
                quantity: i.qty,
                unit_price: isDiscountActive(i) ? Number(i.discount_price) : Number(i.price),
                product_id: i.id,
              })))
            : undefined,
        }
      })
      if (error || !data?.client_secret) { setCheckoutError('Could not initialize payment: ' + (data?.error || error?.message || JSON.stringify(error))); return }
      setCheckoutSecret(data.client_secret)
      setCheckoutPiId(data.payment_intent_id)
      const elements = checkoutStripeRef.current.elements({ clientSecret: data.client_secret })
      checkoutElementsRef.current = elements
      const card = elements.create('card', {
        hidePostalCode: true,
        style: { base: { fontFamily: 'DM Sans, sans-serif', fontSize: '15px', color: '#1A0900', '::placeholder': { color: '#A08050' } } }
      })
      checkoutCardRef.current = card
      setCheckoutStep(2)
      setTimeout(() => { card.mount('#checkout-card-element') }, 80)
    } catch(e) {
      setCheckoutError('Could not initialize payment: ' + (e?.message || JSON.stringify(e)))
    } finally {
      setCheckoutSubmitting(false)
    }
  }

  async function confirmCheckout() {
    if (!checkoutStripeRef.current || !checkoutCardRef.current || !checkoutSecret) return
    setCheckoutSubmitting(true)
    setCheckoutError('')
    const countryCode = checkoutAddress.country === 'Canada' ? 'CA'
      : checkoutAddress.country === 'United States' ? 'US'
      : checkoutAddress.country
    try {
      const { paymentIntent, error } = await checkoutStripeRef.current.confirmCardPayment(
        checkoutSecret,
        {
          payment_method: {
            card: checkoutCardRef.current,
            billing_details: {
              name: cardholderName || checkoutForm.name,
              email: checkoutForm.email,
              address: {
                line1: checkoutAddress.street,
                line2: checkoutAddress.apt || null,
                city: checkoutAddress.city,
                state: checkoutAddress.province,
                postal_code: checkoutAddress.postal,
                country: countryCode,
              }
            }
          }
        }
      )
      if (error) { setCheckoutError(error.message); return }
      if (paymentIntent.status === 'succeeded') {
        setCheckoutDone(true)
        if (checkoutItem?.type === 'cart' || checkoutItem?.type === 'product') {
          setCartItems([])
          if (workspace?.id) sessionStorage.removeItem('organized_cart_' + workspace.id)
        }
      }
    } finally {
      setCheckoutSubmitting(false)
    }
  }

  // ── Go to page ────────────────────────────────────────────────────────────
  const goToPage = (n) => {
    if (n === 2 && bkVisit === 'home') {
      const errs = {}
      if (!bkDom.street.trim()) errs.street = true
      if (!bkPolicy) errs.policy = true
      if (Object.keys(errs).length) { setBkErrors(e=>({...e,...errs})); return }
    }
    if (n === 3 && (!bkDay || !bkTime)) return
    setBkErrors({}); setBkPage(n)
  }

  // ── Deposit amount (computed) ─────────────────────────────────────────────
  const depositAmount = (() => {
    if (!workspace || !bkService) return 0
    if (workspace.deposit_required) {
      if (workspace.deposit_type === 'percentage') return Math.round(Number(bkService.price) * Number(workspace.deposit_value) / 100 * 100) / 100
      return Number(workspace.deposit_value) || 0
    }
    return Number(bkService?.deposit_amount) > 0 ? Number(bkService.deposit_amount) : 0
  })()
  const depositRequired = depositAmount >= 0.50

  // ── Create appointment (shared by direct and post-deposit flows) ──────────
  const createAppointment = async (paymentIntentId = null) => {
    setBkSubmitting(true); setBkSubmitErr(null)
    try {
      const dateStr = `${bkCalY}-${String(bkCalM+1).padStart(2,'0')}-${String(bkDay).padStart(2,'0')}`
      const [tp, ampm] = bkTime.split(' '); let [h, m] = tp.split(':').map(Number)
      if (ampm==='PM'&&h!==12) h+=12; if (ampm==='AM'&&h===12) h=0
      const scheduledAt = new Date(`${dateStr}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`)
      const endsAt = new Date(scheduledAt.getTime() + bkService.duration_min*60000)
      const addonsJson = bkAddons.map(name => { const match = name.match(/\+\$(\d+)/); return {name: name.replace(/\s*\+\$\d+/,''), price: match?Number(match[1]):0} })
      const { data, error } = await supabase.from('appointments').insert({
        workspace_id: workspace.id,
        client_name: `${bkForm.fname.trim()} ${bkForm.lname.trim()}`,
        client_email: bkForm.email.trim() || null,
        client_phone: bkForm.phone.trim() || null,
        service_id: bkService.id, service_name: bkService.name,
        scheduled_at: scheduledAt.toISOString(), ends_at: endsAt.toISOString(),
        duration_min: bkService.duration_min,
        amount: bkService.is_free ? 0 : Number(bkService.price),
        currency: workspace.currency||'CAD',
        status: 'pending',
        payment_status: paymentIntentId ? 'deposit_captured' : 'none',
        deposit_amount: paymentIntentId ? depositAmount : 0,
        notes: bkForm.notes.trim()||null, how_found: bkForm.source||null,
        visit_type: bkVisit,
        travel_fee: bkVisit==='home' ? Number(workspace.domicile_fee||45) : 0,
        client_address: bkVisit==='home' ? bkDom.street.trim() : null,
        client_address_notes: bkVisit==='home' ? (bkDom.access.trim()||null) : null,
        addons: addonsJson,
      }).select('id,cancellation_token,scheduled_at,service_name,client_name,client_email').single()
      if (error) throw error
      setBkAppointment(data); setBkPage(5)
    } catch(err) {
      const msg = err.message || ''
      if (msg.includes('conflict')||msg.includes('overlap')) {
        setBkSubmitErr('This time slot was just taken. Please choose another.')
        setBkPage(2); setBkTime(null)
      } else {
        setBkSubmitErr(msg || 'Something went wrong. Please try again.')
      }
    } finally { setBkSubmitting(false) }
  }

  // ── Submit (validate + route to deposit or direct) ────────────────────────
  const submitBooking = async () => {
    const errs = {}
    if (!bkForm.fname.trim()) errs.fname = true
    if (!bkForm.lname.trim()) errs.lname = true
    // BUG 8 — email OR phone required (not both)
    const hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bkForm.email)
    const hasPhone = bkForm.phone.replace(/\D/g,'').length >= 7
    if (!hasEmail && !hasPhone) { errs.email = true; errs.phone = true }
    setBkErrors(errs)
    if (Object.keys(errs).length || !bkService || !bkDay || !bkTime || !workspace) return
    // BUG 6 — if deposit required AND not cash-only, go to deposit page first
    if (depositRequired && workspace.payment_mode !== 'cash_only') { setBkPage(4); return }
    await createAppointment(null)
  }

  // ── Confirm deposit payment (Stripe) ──────────────────────────────────────
  const confirmDeposit = async () => {
    if (!stripeRef.current || !elementsRef.current || !bkDepositPi) return
    setBkPaymentLoading(true); setBkPaymentErr(null)
    const { paymentIntent, error } = await stripeRef.current.confirmCardPayment(
      bkDepositPi.client_secret,
      { payment_method: { card: elementsRef.current.getElement('card') } }
    )
    if (error) { setBkPaymentErr(error.message); setBkPaymentLoading(false); return }
    await createAppointment(paymentIntent.id)
    setBkPaymentLoading(false)
  }

  // ── Download ICS ──────────────────────────────────────────────────────────
  const downloadICS = () => {
    if (!bkAppointment||!bkService) return
    const pad = n => String(n).padStart(2,'0')
    const d = new Date(bkAppointment.scheduled_at), end = new Date(d.getTime()+(bkService.duration_min||60)*60000)
    const fmt = dt => `${dt.getFullYear()}${pad(dt.getMonth()+1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(dt.getMinutes())}00`
    const ics = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Organized//BeOrganized.io//EN','BEGIN:VEVENT',`UID:${bkAppointment.id}@beorganized.io`,`DTSTAMP:${fmt(new Date())}`,`DTSTART:${fmt(d)}`,`DTEND:${fmt(end)}`,`SUMMARY:${bkService.name} appointment`,'END:VEVENT','END:VCALENDAR'].join('\r\n')
    const a = document.createElement('a'); a.href='data:text/calendar;charset=utf-8,'+encodeURIComponent(ics); a.download='appointment.ics'; document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }

  // ── Cart ──────────────────────────────────────────────────────────────────
  // ── Lightbox ──────────────────────────────────────────────────────────────
  const lbPhotos = portfolio.filter(p => p.url)
  const openLb  = (p) => { const i = lbPhotos.findIndex(ph=>ph.id===p.id); if(i<0) return; setLbIdx(i); setLbOpen(true); document.body.style.overflow='hidden' }
  const closeLb = () => { setLbOpen(false); document.body.style.overflow='' }
  const lbPrev  = () => setLbIdx(i => (i - 1 + lbPhotos.length) % lbPhotos.length)
  const lbNext  = () => setLbIdx(i => (i + 1) % lbPhotos.length)

  // ── Cart ──────────────────────────────────────────────────────────────────
  const cartCount = cartItems.reduce((s,i)=>s+i.qty,0)
  const cartTotal = cartItems.reduce((s,i)=>s+i.price*i.qty,0)
  const addToCart = (p) => setCartItems(prev => { const ex=prev.find(i=>i.id===p.id); return ex ? prev.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i) : [...prev,{...p,qty:1}] })
  const changeQty = (id,delta) => setCartItems(prev => prev.map(i=>i.id===id?{...i,qty:i.qty+delta}:i).filter(i=>i.qty>0))

  // ── Calendar computed ─────────────────────────────────────────────────────
  const isCurMonth = bkCalY===TODAY.getFullYear()&&bkCalM===TODAY.getMonth()
  const firstDay = new Date(bkCalY,bkCalM,1).getDay()
  const daysInMonth = new Date(bkCalY,bkCalM+1,0).getDate()
  const prevMonth = () => { if (bkCalM===0){setBkCalM(11);setBkCalY(y=>y-1)}else setBkCalM(m=>m-1); setBkDay(null);setBkTime(null);setBkSlots([]) }
  const nextMonth = () => { if (bkCalM===11){setBkCalM(0);setBkCalY(y=>y+1)}else setBkCalM(m=>m+1); setBkDay(null);setBkTime(null);setBkSlots([]) }

  // ── Policy helpers ────────────────────────────────────────────────────────
  const policyLines = (() => {
    if (!workspace) return []
    const lines = []
    if (workspace.policy_deposit_pct > 0)
      lines.push(`A $${workspace.policy_deposit_pct} deposit is required to confirm your booking.`)
    if (workspace.policy_cancel_hours > 0)
      lines.push(`Free cancellation up to ${workspace.policy_cancel_hours} hours before your appointment.`)
    if (workspace.policy_late_fee) {
      const customLate = workspace.policy_custom?.toLowerCase().includes('late')
      if (!customLate) lines.push('A fee may apply for late arrivals.')
    }
    if (workspace.policy_no_show_fee) {
      const customNoShow = workspace.policy_custom?.toLowerCase().includes('no-show') ||
        workspace.policy_custom?.toLowerCase().includes('no show') ||
        workspace.policy_custom?.toLowerCase().includes('noshow')
      if (!customNoShow) lines.push('In case of no-show, the deposit is non-refundable.')
    }
    if (workspace.policy_custom?.trim()) {
      workspace.policy_custom.trim().split('\n')
        .filter(l => l.trim())
        .forEach(l => lines.push(l.trim()))
    }
    return lines
  })()
  const hasPolicyGate = workspace?.policy_enabled && policyLines.length > 0

  // ── Computed ──────────────────────────────────────────────────────────────
  const isDiscountActive = (p) => {
    if (!p.discount_price) return false
    if (!p.discount_ends_at) return true
    return new Date(p.discount_ends_at) > new Date()
  }
  // ── Cart computed: paid vs free split ────────────────────────────────────
  const paidItems = cartItems.filter(i => isDiscountActive(i) ? Number(i.discount_price) > 0 : Number(i.price) > 0)
  const freeItems = cartItems.filter(i => isDiscountActive(i) ? Number(i.discount_price) === 0 : Number(i.price) === 0)
  const paidTotal = paidItems.reduce((s,i) => s + (isDiscountActive(i) ? Number(i.discount_price) : Number(i.price)) * i.qty, 0)

  function openCartCheckout() {
    if (paidItems.length === 1) {
      openCheckout('product', paidItems[0])
      setCartOpen(false)
      return
    }
    const totalQty = paidItems.reduce((s,i) => s+i.qty, 0)
    setCheckoutItem({
      type: 'cart',
      items: paidItems,
      quantity: totalQty,
      item: { id: 'cart-' + Date.now(), name: `${paidItems.length} item${paidItems.length!==1?'s':''}`, price: paidTotal, currency: paidItems[0].currency || 'CAD' }
    })
    setCheckoutForm({ name:'', email:'' })
    setCheckoutStep(1)
    setCheckoutError('')
    setCheckoutDone(false)
    setCheckoutSecret(null)
    setCheckoutAddress({ street:'', apt:'', city:'', province:'', postal:'', country:'Canada' })
    setCheckoutPhone('')
    setCheckoutAgreed(false)
    setPostalError('')
    setCardholderName('')
    setCheckoutOpen(true)
    setCartOpen(false)
  }

  function getFreeItems() {
    setFreeItemsMsg("Check your inbox — we'll be in touch!")
    setTimeout(() => {
      setCartItems([])
      if (workspace?.id) sessionStorage.removeItem('organized_cart_' + workspace.id)
      setFreeItemsMsg('')
      setCartOpen(false)
    }, 2000)
  }

  const featuredProduct = workspace?.featured_product_id ? products.find(p=>p.id===workspace.featured_product_id)||products[0] : products[0]
  const otherProducts   = products.filter(p=>p.id!==featuredProduct?.id)
  const avgRating       = reviews.length ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1) : null
  const faqItems        = buildFAQ(workspace, services)
  const mapsUrl         = workspace ? `https://maps.google.com/?q=${encodeURIComponent([workspace.address_street,workspace.address_city,workspace.address_province].filter(Boolean).join(', '))}` : '#'
  const mapAddress      = [workspace?.address_street,workspace?.address_city,workspace?.address_province,workspace?.address_postal].filter(Boolean).join(', ') || workspace?.location || ''

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) return <div style={{minHeight:'100vh',background:'#080706',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{fontFamily:'Playfair Display,serif',fontSize:24,color:'#C9A84C'}}>Organized.</div></div>
  if (notFound) return <div style={{minHeight:'100vh',background:'#080706',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'#F0EAE0',textAlign:'center',padding:32}}><div style={{fontFamily:'Playfair Display,serif',fontSize:64,color:'#C9A84C',lineHeight:1}}>404</div><div style={{fontFamily:'Playfair Display,serif',fontSize:24,marginTop:16}}>Profile not found</div><div style={{fontSize:14,color:'#9A8E7E',marginTop:8}}>This page does not exist or has not been published yet.</div></div>

  // ── Hero content per tab ─────────────────────────────────────────────────
  const HERO_CONTENT = {
    book:  { tag:'Accepting New Clients', eyebrow:workspace.tagline||workspace.location||'Beauty Professional', bio:workspace.bio||'Expert beauty services — crafting confidence one appointment at a time.', stats:[['200+','Clients'],['10','Years'],['4.9','Rating']], ctas:['Book your Service','View our portfolio'], pills:['Color & Highlights','Precision Cut','Keratin Treatment'], edLabel:'Portfolio · Studio' },
    shop:  { tag:'Studio Curated Products', eyebrow:`${workspace.name} · Hair & Beauty Edit`, bio:'Products personally tested and used in the studio. Every item on this shelf is a recommendation.', stats:[[String(products.length),'Products'],['$29+','Starting'],['Free','Advice']], ctas:['Browse Products','Open my Bag'], pills:['Hair Care','Styling','Treatment'], edLabel:'The Edit · Shop' },
    learn: { tag:'Workshops & Online Courses', eyebrow:'Education · All Levels Welcome', bio:'From intensive in-person workshops to self-paced online programs — grow on your terms.', stats:[[String(offerings.length),'Programs'],['120+','Graduates'],['4.8','Rating']], ctas:['View Workshops','Browse Online'], pills:['In-Person','Online Courses','All Levels'], edLabel:'Knowledge · Learn' }
  }
  const hc = HERO_CONTENT[activeTab] || HERO_CONTENT.book
  function switchTab(tab) {
    if (tab === activeTab) return
    setHeroFading(true)
    setTimeout(() => { setActiveTab(tab); setHeroFading(false) }, 220)
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div id="client-page-root" style={{backgroundColor:'var(--body-bg)'}}>
      <style>{CSS}</style>

      {/* NAV */}
      <nav className="cb-nav">
        <div className="cb-nav-logo">{workspace.name}<span>via Organized.</span></div>
        <div className="cb-nav-right">
          <button className="cb-icon-btn" onClick={()=>setCartOpen(true)} style={{position:'relative'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            {cartCount>0&&<span className="cb-cart-badge">{cartCount}</span>}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="cb-hero">
        <div className="hero-left">
          <div className={`hero-context-tag${heroFading?' hero-fading':''}`}>
            <span className="hero-tag-dot"/><span>{hc.tag}</span>
          </div>
          <h1 className="hero-name">{(() => {
            const np = (workspace.name||'').trim().split(/\s+/)
            if (np.length === 1) return np[0]
            return <><div className="hero-name-line">{np[0]}</div><div className="hero-name-line">{np.slice(1).join(' ')}</div></>
          })()}</h1>
          <div className={`hero-eyebrow${heroFading?' hero-fading':''}`}>{hc.eyebrow}</div>
          <p className={`hero-bio${heroFading?' hero-fading':''}`}>{hc.bio}</p>
          <div className={`hero-stats${heroFading?' hero-fading':''}`}>
            {hc.stats.map(([num,lbl],i)=>(
              <div key={i} className="stat-item">
                <span className="stat-num">{num}</span>
                <span className="stat-label">{lbl}</span>
              </div>
            ))}
          </div>
          <div className={`hero-cta-row${heroFading?' hero-fading':''}`}>
            <button className="cb-btn-primary" onClick={()=>document.querySelector('.tab-bar-wrap')?.scrollIntoView({behavior:'smooth'})}>{hc.ctas[0]}</button>
            <button className="cb-btn-ghost" onClick={()=>setPortfolioOpen(true)}>{hc.ctas[1]}</button>
          </div>
          <div className="hero-socials">
            {workspace.instagram&&<a href={`https://instagram.com/${workspace.instagram.replace('@','')}`} target="_blank" rel="noreferrer"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>{workspace.instagram}</a>}
            {workspace.instagram&&workspace.tiktok&&<span className="soc-divider"/>}
            {workspace.tiktok&&<a href={`https://tiktok.com/@${workspace.tiktok.replace('@','')}`} target="_blank" rel="noreferrer"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>TikTok</a>}
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-right-bg"/>
          <div className="hero-right-leak"/>
          <div className="editorial-letter">{(workspace.name||'N')[0]}</div>
          <div className="editorial-frame">
            <div className="corner corner-tl"/><div className="corner corner-tr"/>
            <div className="corner corner-bl"/><div className="corner corner-br"/>
          </div>
          <div className="editorial-center">
            <div className="ed-label" style={{opacity:heroFading?0:1,transition:'opacity .25s'}}>{hc.edLabel}</div>
            <div className="ed-title-line"/>
            <div className="ed-services">
              {hc.pills.map((pill,i)=>(
                <div key={i} className={`ed-svc-pill${heroFading?' hero-fading':''}`} style={{transitionDelay:`${i*40}ms`}}>{pill}</div>
              ))}
            </div>
          </div>
          {avgRating&&<div className="fc fc-1"><div className="fc-lbl">Rating</div><div className="fc-val">★ {avgRating}</div><div className="fc-sub">{reviews.length} reviews</div></div>}
          <div className="fc fc-2"><div className="fc-lbl">Location</div><div className="fc-val" style={{fontSize:14}}>{workspace.neighborhood||workspace.address_city||workspace.location||'Studio'}</div></div>
        </div>
      </section>

      {/* TAB BAR */}
      <div className="tab-bar-wrap">
        <div className="tab-bar">
          {[{id:'book',label:'Book an Appointment'},{id:'shop',label:'Shop',hide:products.length===0},{id:'learn',label:'Learn',hide:offerings.length===0}].filter(t=>!t.hide).map(t=>(
            <button key={t.id} className={`tab-btn${activeTab===t.id?' active':''}`} onClick={()=>switchTab(t.id)}>
              {activeTab===t.id&&<span className="tab-dot"/>}{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════ BOOK PANEL ═══════════ */}
      {activeTab==='book'&&<div className="cb-panel">

        {/* Services */}
        <section className="cb-section">
          <div className="cb-inner">
            <div className="cb-eyebrow">Menu</div>
            <h2 className="cb-heading">Services &amp; <em>Pricing</em></h2>
            <p className="cb-sub">Pricing may vary by hair length. Consultation included in every service.</p>
            {workspace.accepts_bookings===false&&<div style={{padding:'14px 18px',background:'rgba(201,168,76,.06)',border:'1px solid rgba(201,168,76,.18)',borderRadius:2,marginBottom:20,fontSize:13,color:'var(--text-muted)',letterSpacing:'.04em'}}>Bookings are currently closed. Check back soon or contact us directly.</div>}
            <div className="cb-services-grid" style={{marginTop:32}}>
              {services.map(svc=>(
                <div key={svc.id} className="cb-svc-card" onClick={()=>workspace.accepts_bookings!==false&&openBooking(svc)} style={workspace.accepts_bookings===false?{cursor:'default'}:{}}>
                  {svc.image_url&&<div style={{margin:'-32px -28px 24px',height:180,overflow:'hidden',flexShrink:0}}><img src={svc.image_url} alt={svc.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>}
                  <div className="cb-svc-cat">{svc.category||'Service'}</div>
                  <div className="cb-svc-name">{svc.name}</div>
                  <div className="cb-svc-dur">{svc.duration_min ? svc.duration_min + ' min' : '1h'}</div>
                  <div className="cb-svc-footer">
                    <div className="cb-svc-price">{svc.is_free?'Free':`$${Number(svc.price).toFixed(0)}`}</div>
                    {workspace.accepts_bookings!==false&&<button className="cb-svc-book">Book →</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews */}
        {reviews.length>0&&workspace.review_requests_enabled!==false&&<section className="cb-section cb-alt">
          <div className="cb-inner">
            <div className="cb-eyebrow">Testimonials</div>
            <h2 className="cb-heading">What clients <em>say</em></h2>
            {avgRating&&<div style={{display:'flex',alignItems:'center',gap:10,marginTop:8,marginBottom:32}}><span style={{fontFamily:'Playfair Display,serif',fontSize:32,color:'var(--gold)'}}>{avgRating}</span><Stars rating={Number(avgRating)}/><span style={{fontSize:12,color:'var(--text-muted)'}}>{reviews.length} reviews</span></div>}
            <div className="cb-reviews-grid">
              {reviews.slice(0,3).map((r,i)=>(
                <div key={i} className="cb-review-card">
                  <div className="cb-review-quote">"</div>
                  <Stars rating={r.rating}/>
                  <p className="cb-review-body">{r.body}</p>
                  <div className="cb-review-author">
                    <div className="cb-review-avatar">{r.reviewer_name?.[0]||'?'}</div>
                    <div><div className="cb-review-name">{r.reviewer_name}</div><div className="cb-review-svc">{r.service_name||r.service_label||''}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>}

        {/* Location */}
        {workspace.show_address_on_page!==false&&workspace.address_street&&workspace.address_visibility!=='hidden'&&<section className="cb-section">
          <div className="cb-inner">
            <div className="cb-eyebrow">Find Us</div>
            <h2 className="cb-heading">The <em>Studio</em></h2>
            <div className="cb-location-grid" style={{marginTop:32}}>
              <div className="cb-location-map">
                <div className="cb-map-grid"/>
                <div className="cb-map-pin-wrap"><div className="cb-map-pulse"/><div className="cb-map-pulse cb-pulse2"/><div className="cb-map-pin"/></div>
              </div>
              <div className="cb-location-details">
                <div className="cb-loc-row">
                  <div className="cb-loc-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
                  <div>
                    <div className="cb-loc-label">Address</div>
                    <div className="cb-loc-val">{workspace.address_visibility==='full'?`${workspace.address_street}, ${workspace.address_city}`:`${workspace.neighborhood||workspace.address_city} — full address in confirmation email`}</div>
                  </div>
                </div>
                {workspace.working_hours&&<div className="cb-loc-row">
                  <div className="cb-loc-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
                  <div><div className="cb-loc-label">Hours</div><div className="cb-loc-val" style={{whiteSpace:'pre-line'}}>{workspace.working_hours}</div></div>
                </div>}
                {workspace.address_visibility==='full'&&<a className="cb-directions-btn" href={mapsUrl} target="_blank" rel="noreferrer">Get Directions →</a>}
              </div>
            </div>
            {/* Google Maps embed */}
            {mapAddress && <div style={{padding:'0 0 4px'}}>
              <div style={{fontSize:11,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:8,opacity:0.6}}>📍 Notre emplacement</div>
              <iframe src={`https://www.google.com/maps?q=${encodeURIComponent(mapAddress)}&output=embed`} width="100%" height="200" style={{border:0,borderRadius:12,display:'block'}} allowFullScreen loading="lazy" title="Location"/>
            </div>}
          </div>
        </section>}

        {/* Google Maps — show when show_address_on_page is enabled and no structured address block above */}
        {workspace?.show_address_on_page && mapAddress && <section className="cb-section">
          <div className="cb-inner">
            <div className="cb-eyebrow">Find Us</div>
            <h2 className="cb-heading">The <em>Studio</em></h2>
            <div style={{padding:'0 16px 24px'}}>
              <div style={{fontSize:11,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:8,opacity:0.6}}>📍 Notre emplacement</div>
              <iframe src={`https://www.google.com/maps?q=${encodeURIComponent(mapAddress)}&output=embed`} width="100%" height="200" style={{border:0,borderRadius:12,display:'block'}} allowFullScreen loading="lazy" title="Location"/>
            </div>
          </div>
        </section>}

        {/* FAQ */}
        {faqItems.length>0&&<section className="cb-section cb-alt">
          <div className="cb-inner">
            <div className="cb-eyebrow">Questions</div>
            <h2 className="cb-heading">Before you <em>arrive</em></h2>
            <div className="cb-faq-list" style={{marginTop:32}}>
              {faqItems.map((item,i)=>(
                <div key={i} className="cb-faq-item">
                  <button className="cb-faq-q" onClick={()=>setOpenFAQ(openFAQ===i?null:i)}>
                    <span>{item.q}</span><span className={`cb-faq-icon${openFAQ===i?' open':''}`}>+</span>
                  </button>
                  {openFAQ===i&&<p className="cb-faq-a">{item.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>}

        <footer className="cb-footer"><div className="cb-footer-inner"><div className="cb-footer-brand">{workspace.name}<span>Powered by <a href="https://beorganized.io" target="_blank" rel="noreferrer">Organized.</a></span></div><div style={{fontSize:11,color:'var(--dark-5)'}}>© {new Date().getFullYear()}</div></div></footer>
      </div>}

      {/* ═══════════ SHOP PANEL ═══════════ */}
      {activeTab==='shop'&&<div className="cb-panel">
        <div className="cb-shop-hero">
          <div><div className="cb-eyebrow">The Edit</div><h2 className="cb-heading">Shop <em>Picks</em></h2><p className="cb-sub">Products personally tested and recommended. Studio pickup or delivery.</p></div>
          <div className="cb-shop-filters">{['all','hair-care','styling','treatment'].map(f=><button key={f} className={`cb-filter-tab${shopFilter===f?' active':''}`} onClick={()=>setShopFilter(f)}>{f==='all'?'All':f.replace('-',' ').replace(/\b\w/g,l=>l.toUpperCase())}</button>)}</div>
        </div>
        {featuredProduct&&<div className="cb-featured" style={{cursor:'pointer'}} onClick={()=>setProductDetail(featuredProduct)}>
          <div className="cb-featured-img" style={{position:'relative'}}>
            {(featuredProduct.image_url||featuredProduct.images?.[0])?<img src={featuredProduct.image_url||featuredProduct.images?.[0]} alt={featuredProduct.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div className="cb-ph">✦</div>}
            {isDiscountActive(featuredProduct)&&<div className="cb-badge-sale">SALE</div>}
          </div>
          <div className="cb-featured-info">
            <div className="cb-featured-badge">Recommended Pick</div>
            <div className="cb-featured-name">{featuredProduct.name}</div>
            {workspace.featured_product_note&&<blockquote className="cb-featured-quote">"{workspace.featured_product_note}"</blockquote>}
            <p className="cb-product-desc">{featuredProduct.description}</p>
            <div className="cb-featured-footer">
              {isDiscountActive(featuredProduct)?(
                <div className="cb-price-row">
                  <span className="cb-price-original">${Number(featuredProduct.price).toFixed(0)}</span>
                  <span className="cb-price-discounted">${Number(featuredProduct.discount_price).toFixed(0)}</span>
                </div>
              ):(
                <div className="cb-product-price">${Number(featuredProduct.price).toFixed(0)}</div>
              )}
              <button className="cb-add-bag" disabled={featuredProduct.stock===0} onClick={e=>{e.stopPropagation();addToCart(featuredProduct)}}>{featuredProduct.stock===0?'Sold Out':'Add to Bag'}</button>
            </div>
          </div>
        </div>}
        <div className="cb-products-grid">
          {otherProducts.map(p=>(
            <div key={p.id} className={`cb-product-card${p.stock===0?' sold-out':''}`} onClick={()=>setProductDetail(p)}>
              <div className="cb-product-img">{(p.image_url||p.images?.[0])?<img src={p.image_url||p.images?.[0]} alt={p.name} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/>:<div className="cb-ph">✦</div>}
                {p.stock===0&&<div className="cb-badge cb-badge-so">Sold Out</div>}
                {p.stock>0&&p.stock<=3&&<div className="cb-badge cb-badge-lim">Only {p.stock} left</div>}
                {isDiscountActive(p)&&<div className="cb-badge-sale">SALE</div>}
              </div>
              <div className="cb-product-info">
                <div className="cb-product-name">{p.name}</div>
                <p className="cb-product-desc">{p.description}</p>
                <div className="cb-product-footer">
                  {isDiscountActive(p)?(
                    <div className="cb-price-row">
                      <span className="cb-price-original">${Number(p.price).toFixed(0)}</span>
                      <span className="cb-price-discounted">${Number(p.discount_price).toFixed(0)}</span>
                    </div>
                  ):(
                    <div className="cb-product-price">${Number(p.price).toFixed(0)}</div>
                  )}
                  <button className="cb-add-bag" disabled={p.stock===0} onClick={e=>{e.stopPropagation();addToCart(p)}}>{p.stock===0?'Sold Out':'Add to Bag'}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <footer className="cb-footer"><div className="cb-footer-inner"><div className="cb-footer-brand">{workspace.name}<span>Powered by <a href="https://beorganized.io" target="_blank" rel="noreferrer">Organized.</a></span></div></div></footer>
      </div>}

      {/* ═══════════ LEARN PANEL ═══════════ */}
      {activeTab==='learn'&&(()=>{
        const hasOnline=offerings.some(o=>o.type!=='workshop')
        const hasWorkshop=offerings.some(o=>o.type==='workshop')
        const filtered=learnFilter==='all'?offerings:offerings.filter(o=>learnFilter==='workshop'?o.type==='workshop':o.type!=='workshop')
        return(
        <div className="cb-panel">
          <div className="cb-learn-header">
            <div className="cb-eyebrow">Knowledge</div>
            <h2 className="cb-heading">Formations &amp; <em>Workshops</em></h2>
            <p className="cb-sub">Learn the techniques behind the craft.</p>
            {hasOnline&&hasWorkshop&&(
              <div className="cb-shop-filters" style={{marginTop:20}}>
                {[['all','All'],['online','Online'],['workshop','Workshops']].map(([f,l])=>(
                  <button key={f} className={`cb-filter-tab${learnFilter===f?' active':''}`} onClick={()=>setLearnFilter(f)}>{l}</button>
                ))}
              </div>
            )}
          </div>
          <div style={{padding:'20px 20px 4px'}}>
            {filtered.map((o,idx)=>{
              const isWorkshop=o.type==='workshop'
              const isFree=Number(o.price)===0
              const spotsLeft=isWorkshop&&o.spots_total>0?o.spots_total-(o.spots_taken||0):null
              const isFull=spotsLeft!==null&&spotsLeft<=0
              const fillPct=o.spots_total>0?Math.min(100,((o.spots_taken||0)/o.spots_total)*100):0
              const almostFull=fillPct>=80
              const openDetail=()=>setOfferingDetail(o)
              const openEnroll=()=>{setEnrollOffering(o);setEnrollForm({name:'',email:'',phone:''});setEnrollDone(false);setEnrollError('');setEnrollOpen(true)}
              if(isWorkshop){return(
                <div key={o.id} className="cb-workshop-item">
                  <div onClick={openDetail} style={{cursor:'pointer'}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10,flexWrap:'wrap'}}>
                      <span className="cb-type-badge inperson">Workshop</span>
                      {o.workshop_date&&<span style={{fontSize:10,color:'var(--text-muted)',letterSpacing:'.04em'}}>{new Date(o.workshop_date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>}
                    </div>
                    <div className="cb-offering-title" style={{marginTop:0,marginBottom:6,fontSize:18}}>{o.title}</div>
                    {o.description&&<p className="cb-offering-desc" style={{marginBottom:12,WebkitLineClamp:2,display:'-webkit-box',WebkitBoxOrient:'vertical',overflow:'hidden'}}>{o.description}</p>}
                    {o.spots_total>0&&(
                      <div style={{marginBottom:14}}>
                        <div style={{display:'flex',justifyContent:'space-between',fontSize:10,marginBottom:4}}>
                          <span style={{color:almostFull?'#e05c5c':'var(--text-muted)',fontWeight:almostFull?600:400}}>{almostFull?'Almost full —':''} {spotsLeft} spot{spotsLeft!==1?'s':''} left</span>
                          <span style={{color:'var(--text-soft)'}}>{o.spots_taken||0}/{o.spots_total}</span>
                        </div>
                        <div style={{height:4,background:'var(--dark-4)',borderRadius:2}}><div style={{height:'100%',background:almostFull?'#e05c5c':'var(--gold)',borderRadius:2,width:`${fillPct}%`,transition:'width .4s'}}/></div>
                      </div>
                    )}
                  </div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,paddingTop:12,borderTop:'1px solid var(--dark-4)'}}>
                    <div className="cb-offering-price" style={{fontSize:18}}>{isFree?'Free':`$${Number(o.price).toFixed(0)}`}</div>
                    <button className="cb-enroll-btn" disabled={isFull} style={isFull?{opacity:.5,cursor:'default'}:{}} onClick={openEnroll}>
                      {isFull?'Sold Out':'Reserve a Spot →'}
                    </button>
                  </div>
                </div>
              )}
              const num=String(idx+1).padStart(2,'0')
              return(
                <div key={o.id} className="cb-offering-item">
                  <div className="cb-offering-accent" onClick={openDetail} style={{cursor:'pointer'}}>
                    <div className="cb-offering-num">{num}</div>
                    <div className="cb-offering-type-tag">Online Course</div>
                  </div>
                  <div className="cb-offering-body">
                    <div onClick={openDetail} style={{cursor:'pointer',flex:1}}>
                      <div className="cb-offering-title" style={{marginTop:0,marginBottom:4,fontSize:16}}>{o.title}</div>
                      {o.description&&<p className="cb-offering-desc" style={{marginBottom:6,WebkitLineClamp:2,display:'-webkit-box',WebkitBoxOrient:'vertical',overflow:'hidden'}}>{o.description}</p>}
                      {o.duration_label&&<div style={{fontSize:11,color:'var(--text-muted)',marginBottom:4}}>⏱ {o.duration_label}</div>}
                    </div>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,marginTop:8,paddingTop:8,borderTop:'1px solid var(--dark-4)'}}>
                      <div className="cb-offering-price" style={{fontSize:16}}>{isFree?'Free':`$${Number(o.price).toFixed(0)}`}</div>
                      <button className="cb-enroll-btn" onClick={openEnroll}>
                        {isFree?'Get Access — Free':`Enroll — $${Number(o.price).toFixed(0)}`}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <footer className="cb-footer"><div className="cb-footer-inner"><div className="cb-footer-brand">{workspace.name}<span>Powered by <a href="https://beorganized.io" target="_blank" rel="noreferrer">Organized.</a></span></div></div></footer>
        </div>
        )
      })()}

      {/* ═══════════ ENROLLMENT MODAL ═══════════ */}
      {enrollOpen&&enrollOffering&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',zIndex:800,display:'flex',alignItems:'flex-end',justifyContent:'center'}} onClick={()=>setEnrollOpen(false)}>
          <div style={{background:'var(--dark-2)',borderRadius:'20px 20px 0 0',width:'100%',maxWidth:520,padding:'1.5rem 1.5rem 2.5rem',boxSizing:'border-box'}} onClick={e=>e.stopPropagation()}>
            {!enrollDone?(<>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.25rem'}}>
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:'var(--gold)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:4}}>{enrollOffering.type==='workshop'?'Reserve a Spot':'Enroll Now'}</div>
                  <div style={{fontFamily:'Playfair Display,serif',fontSize:20,color:'var(--text)'}}>{enrollOffering.title}</div>
                </div>
                <button onClick={()=>setEnrollOpen(false)} style={{background:'none',border:'none',color:'var(--text-muted)',fontSize:22,cursor:'pointer',padding:0,lineHeight:1}}>✕</button>
              </div>
              {Number(enrollOffering.price)===0?(<>
                <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:'1.25rem',lineHeight:1.65}}>Enter your info to get access.</p>
                <div style={{display:'flex',flexDirection:'column',gap:'.65rem',marginBottom:'1.25rem'}}>
                  {[{key:'name',ph:'Full name',type:'text'},{key:'email',ph:'Email address',type:'email'},{key:'phone',ph:'Phone (optional)',type:'tel'}].map(({key,ph,type})=>(
                    <input key={key} type={type} value={enrollForm[key]} onChange={e=>setEnrollForm(f=>({...f,[key]:e.target.value}))} placeholder={ph} style={{width:'100%',background:'var(--dark-3)',border:'1px solid var(--dark-4)',borderRadius:10,padding:'12px 14px',color:'var(--text)',fontFamily:'DM Sans,sans-serif',fontSize:14,outline:'none',boxSizing:'border-box'}}/>
                  ))}
                </div>
                {enrollError&&<p style={{fontSize:12,color:'#e05c5c',marginBottom:'.6rem',lineHeight:1.5}}>{enrollError}</p>}
                <button onClick={handleEnroll} disabled={enrollSubmitting||!enrollForm.name.trim()||!enrollForm.email.trim()} className="cb-enroll-btn" style={{width:'100%',padding:14,fontSize:13,opacity:(enrollSubmitting||!enrollForm.name.trim()||!enrollForm.email.trim())?0.5:1,cursor:enrollSubmitting?'default':'pointer'}}>
                  {enrollSubmitting?'Submitting…':'Get Access →'}
                </button>
              </>):(<>
                <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:'1.25rem'}}>Price: <strong style={{color:'var(--gold)'}}>${Number(enrollOffering.price).toFixed(0)}</strong></p>
                <button onClick={()=>{setEnrollOpen(false);openCheckout('enrollment',enrollOffering)}} className="cb-enroll-btn" style={{width:'100%',padding:14,fontSize:13}}>Pay &amp; Enroll — ${Number(enrollOffering.price).toFixed(0)} →</button>
              </>)}
            </>):(
              <div style={{textAlign:'center',padding:'2rem 0'}}>
                <div style={{fontSize:48,marginBottom:'1rem'}}>✅</div>
                <div style={{fontFamily:'Playfair Display,serif',fontSize:22,color:'var(--text)',marginBottom:8}}>You're in!</div>
                <p style={{fontSize:13,color:'var(--text-muted)',lineHeight:1.65}}>Check your inbox — we sent access details to <strong>{enrollForm.email}</strong>.</p>
                <button onClick={()=>setEnrollOpen(false)} style={{marginTop:'1.5rem',background:'none',border:'1px solid var(--dark-4)',color:'var(--text-muted)',padding:'10px 24px',borderRadius:8,cursor:'pointer',fontSize:13}}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════ FORMATION DETAIL ═══════════ */}
      {offeringDetail&&(()=>{
        const od=offeringDetail
        const isW=od.type==='workshop'
        const isFr=Number(od.price)===0
        const sl=isW&&od.spots_total>0?od.spots_total-(od.spots_taken||0):null
        const isFu=sl!==null&&sl<=0
        const imgs=(od.files||[]).filter(f=>f.kind==='image')
        const pdfs=(od.files||[]).filter(f=>f.kind==='pdf')
        const vids=(od.files||[]).filter(f=>f.kind==='video')
        const fillPct=od.spots_total>0?Math.min(100,((od.spots_taken||0)/od.spots_total)*100):0
        const almostFull=fillPct>=80
        const wDate=od.workshop_date?new Date(od.workshop_date):null
        const wDateStr=wDate?wDate.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}):''
        const wTimeStr=wDate?wDate.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}):''
        const hasContent=pdfs.length>0||vids.length>0||!!od.content_url
        const enrolled=isEnrolled(od.id)
        const openEnroll=()=>{setOfferingDetail(null);setEnrollOffering(od);setEnrollForm({name:'',email:'',phone:''});setEnrollDone(false);setEnrollError('');setEnrollOpen(true)}
        return(
          <div className="cb-overlay open" style={{overflowY:'auto',overflowX:'hidden'}}>
            {odLightboxImg&&<div className="od-img-lightbox" onClick={()=>setOdLightboxImg(null)}><img src={odLightboxImg} alt=""/></div>}
            {/* 1. Sticky header */}
            <div className="od-header">
              <button className="od-back" onClick={()=>setOfferingDetail(null)}>← Back</button>
              <span className="od-type-badge">{isW?'Workshop':'Online Course'}</span>
              <div className="od-header-price">{isFr?'Free':`$${Number(od.price).toFixed(0)}`}</div>
            </div>
            {/* 2. Image slider */}
            <div className="od-slider" onTouchStart={e=>{odTouchX.current=e.touches[0].clientX}} onTouchEnd={e=>{const dx=e.changedTouches[0].clientX-odTouchX.current;if(Math.abs(dx)>40){if(dx<0)setOdSlideIdx(i=>Math.min(i+1,imgs.length-1));else setOdSlideIdx(i=>Math.max(i-1,0))}}}>
              {imgs.length>0?(
                <>
                  <div className="od-slides" style={{transform:`translateX(-${odSlideIdx*100}%)`}}>
                    {imgs.map((img,i)=><img key={i} src={img.url} alt={img.name} className="od-slide" onClick={()=>setOdLightboxImg(img.url)}/>)}
                  </div>
                  {imgs.length>1&&<>
                    <div className="od-counter">{odSlideIdx+1} / {imgs.length}</div>
                    <div className="od-dots">{imgs.map((_,i)=><div key={i} className={`od-dot${i===odSlideIdx?' active':''}`}/>)}</div>
                  </>}
                </>
              ):<div className="od-placeholder">✦</div>}
            </div>
            {/* 3. Content */}
            <div className="od-content">
              {/* a. Title */}
              <div className="od-title">{od.title}</div>
              {/* b. CTA row */}
              <div className="od-cta-row">
                <div className="od-price-large">{isFr?<em>Free</em>:`$${Number(od.price).toFixed(0)}`}</div>
                <button className="od-enroll-btn" disabled={isFu} onClick={openEnroll}>
                  {isFu?'Sold Out':isW?'Reserve a Spot →':isFr?'Get Access →':`Enroll — $${Number(od.price).toFixed(0)} →`}
                </button>
              </div>
              {/* c. Type + spots row */}
              <div className="od-type-row">
                <span className={`cb-type-badge ${isW?'inperson':'online'}`}>{isW?'Workshop':'Online Course'}</span>
                {isW&&sl!==null&&<span style={{fontSize:'0.72rem',color:sl<(od.spots_total||1)*0.2?'#C0392B':'var(--text-muted)'}}>{sl} spot{sl!==1?'s':''} left</span>}
              </div>
              {/* d. Event details card */}
              {isW&&<div className="od-event-card">
                <div className="od-event-label">Event Details</div>
                {wDateStr&&<div className="od-event-row"><div className="od-event-icon"><span style={{fontSize:13}}>📅</span></div><div><div className="od-event-info-label">Date</div><div className="od-event-info-value">{wDateStr}</div></div></div>}
                {wTimeStr&&<div className="od-event-row"><div className="od-event-icon"><span style={{fontSize:13}}>🕐</span></div><div><div className="od-event-info-label">Time</div><div className="od-event-info-value">{wTimeStr}</div></div></div>}
                {od.duration_label&&<div className="od-event-row"><div className="od-event-icon"><span style={{fontSize:13}}>⏱</span></div><div><div className="od-event-info-label">Duration</div><div className="od-event-info-value">{od.duration_label}</div></div></div>}
                <div className="od-event-row"><div className="od-event-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div><div><div className="od-event-info-label">Location</div><div className="od-event-info-value" style={{color:'var(--text-muted)',fontSize:'0.8rem'}}>Address confirmed after enrollment</div></div></div>
                {od.spots_total>0&&<div className="od-spots-section">
                  <div className="od-spots-row">
                    <span className="od-spots-text" style={almostFull?{color:'#C0392B',fontWeight:600}:{}}>{almostFull?'Almost full — ':''}{sl} spot{sl!==1?'s':''} remaining</span>
                    <span className="od-spots-count">{od.spots_taken||0}/{od.spots_total}</span>
                  </div>
                  <div className="od-spots-bar"><div className={`od-spots-fill${almostFull?' urgent':''}`} style={{width:`${fillPct}%`}}/></div>
                </div>}
              </div>}
              {/* e. Divider */}
              <div style={{height:1,background:'var(--dark-4)',marginBottom:20}}/>
              {/* f. Description */}
              {od.description&&<><div className="od-section-label">About</div><p className="od-description">{od.description}</p></>}
              {/* g. Policy */}
              {workspace?.policy_enabled&&policyLines.length>0&&<>
                <div className="od-section-label" style={{marginTop:8}}>Booking Policy</div>
                {policyLines.map((line,i)=><div key={i} className="cb-policy-line">{line}</div>)}
                <div style={{marginBottom:20}}/>
              </>}
              {/* h. Content gate */}
              {hasContent&&(enrolled?(
                <div style={{marginBottom:20}}>
                  {pdfs.map((f,i)=><a key={i} href={f.url} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',gap:'.5rem',padding:'.65rem 1rem',border:'1px solid var(--dark-4)',borderRadius:9,marginBottom:'.5rem',color:'var(--text)',textDecoration:'none',fontSize:13}}>📄 {f.name}</a>)}
                  {vids.map((v,i)=><video key={i} src={v.url} controls style={{width:'100%',borderRadius:10,marginBottom:'.75rem'}}/>)}
                  {od.content_url&&<a href={od.content_url} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',gap:'.5rem',padding:'.65rem 1rem',background:'var(--gold-dim)',border:'1px solid var(--gold-border)',borderRadius:9,marginBottom:'.5rem',color:'var(--gold)',textDecoration:'none',fontSize:13,fontWeight:600}}>→ Access Content</a>}
                </div>
              ):(
                <div className="cb-content-gate" style={{marginBottom:20}}>
                  <div className="cb-gate-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
                  <p className="cb-gate-title">Enroll to access</p>
                  <p className="cb-gate-sub">{isFr?'Free — enter your email to get instant access':'Purchase this course to unlock the content'}</p>
                  <button className="cb-enroll-btn" style={{marginTop:16}} onClick={openEnroll}>{isFr?'Get Access — Free':`Enroll — $${Number(od.price).toFixed(0)}`}</button>
                </div>
              ))}
              {/* i. Footer */}
              <div className="od-footer">
                <div className="od-footer-powered">Powered by</div>
                <span className="od-footer-brand" onClick={()=>window.open('https://beorganized.io','_blank')}>Organized.</span>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ═══════════ PRODUCT DETAIL ═══════════ */}
      {productDetail&&(()=>{
        const p=productDetail
        const imgs=(p.images&&p.images.length>0)?p.images:(p.image_url?[p.image_url]:[])
        const disc=isDiscountActive(p)
        const displayPrice=disc?Number(p.discount_price):Number(p.price)
        return(
          <div className="cb-overlay open" style={{overflowY:'auto',overflowX:'hidden'}}>
            {pdLightboxImg&&<div className="od-img-lightbox" onClick={()=>setPdLightboxImg(null)}><img src={pdLightboxImg} alt=""/></div>}
            {/* 1. Sticky header */}
            <div className="od-header">
              <button className="od-back" onClick={()=>setProductDetail(null)}>← Back</button>
              <span className="od-type-badge">Product</span>
              <div className="od-header-price">{disc?`$${Number(p.discount_price).toFixed(0)}`:`$${Number(p.price).toFixed(0)}`}</div>
            </div>
            {/* 2. Image slider */}
            <div className="od-slider" onTouchStart={e=>{pdTouchX.current=e.touches[0].clientX}} onTouchEnd={e=>{const dx=e.changedTouches[0].clientX-pdTouchX.current;if(Math.abs(dx)>40){if(dx<0)setPdSlideIdx(i=>Math.min(i+1,imgs.length-1));else setPdSlideIdx(i=>Math.max(i-1,0))}}}>
              {imgs.length>0?(
                <>
                  <div className="od-slides" style={{transform:`translateX(-${pdSlideIdx*100}%)`}}>
                    {imgs.map((img,i)=><img key={i} src={img} alt={p.name} className="od-slide" onClick={()=>setPdLightboxImg(img)}/>)}
                  </div>
                  {imgs.length>1&&<>
                    <div className="od-counter">{pdSlideIdx+1} / {imgs.length}</div>
                    <div className="od-dots">{imgs.map((_,i)=><div key={i} className={`od-dot${i===pdSlideIdx?' active':''}`}/>)}</div>
                  </>}
                </>
              ):<div className="od-placeholder">✦</div>}
            </div>
            {/* 3. Content */}
            <div className="od-content">
              {/* a. Product name */}
              <div className="od-title">{p.name}</div>
              {/* b. Price + CTA row */}
              <div className="od-cta-row">
                <div>
                  {disc&&<span className="od-price-original">${Number(p.price).toFixed(0)}</span>}
                  <span className="od-price-large">${displayPrice.toFixed(0)}</span>
                </div>
                {p.stock===0?(
                  <button disabled className="od-enroll-btn">Sold Out</button>
                ):(
                  <button className="od-enroll-btn" onClick={()=>addToCart(p)}>Add to Bag →</button>
                )}
              </div>
              {/* c. Stock badge row */}
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,flexWrap:'wrap'}}>
                {p.stock===0?(
                  <span className="od-stock-badge od-stock-out">Sold Out</span>
                ):p.stock<=3?(
                  <span className="od-stock-badge od-stock-low">Only {p.stock} left</span>
                ):(
                  <span className="od-stock-badge od-stock-in">In Stock</span>
                )}
                {disc&&p.discount_ends_at&&(
                  <span style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>Sale ends {new Date(p.discount_ends_at).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span>
                )}
              </div>
              {/* d. Divider */}
              <div style={{height:1,background:'var(--dark-4)',marginBottom:20}}/>
              {/* e. Description */}
              {p.description&&<><div className="od-section-label">About This Product</div><p className="od-description">{p.description}</p></>}
              {/* f. Shipping info */}
              <div className="od-event-card" style={{marginBottom:20}}>
                <div className="od-event-label">Shipping &amp; Pickup</div>
                <div className="od-event-row">
                  <div className="od-event-icon">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                  </div>
                  <div>
                    <div className="od-event-info-label">Pickup</div>
                    <div className="od-event-info-value">Available for studio pickup</div>
                  </div>
                </div>
                <div className="od-event-row">
                  <div className="od-event-icon">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                  </div>
                  <div>
                    <div className="od-event-info-label">Shipping</div>
                    <div className="od-event-info-value">Shipping available — contact studio for details</div>
                  </div>
                </div>
              </div>
              {/* g. Footer */}
              <div className="od-footer">
                <div className="od-footer-powered">Powered by</div>
                <span className="od-footer-brand" onClick={()=>window.open('https://beorganized.io','_blank')}>Organized.</span>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ═══════════ CHECKOUT MODAL ═══════════ */}
      {checkoutOpen&&checkoutItem&&(()=>{
        const coPrice = checkoutItem.type==='product'&&isDiscountActive(checkoutItem.item)
          ? Number(checkoutItem.item.discount_price) : Number(checkoutItem.item.price)
        const coName  = (checkoutItem.type==='product'||checkoutItem.type==='cart') ? checkoutItem.item.name : checkoutItem.item.title
        const step1Valid = checkoutForm.name.trim()&&checkoutForm.email.trim()&&checkoutAddress.street.trim()&&checkoutAddress.city.trim()&&checkoutAddress.province.trim()&&checkoutAddress.postal.trim()&&checkoutAddress.country.trim()&&!postalError
        return(
          <div className="cb-overlay open" style={{zIndex:950,background:'var(--body-bg,#FAF5EE)',overflowY:'auto',overflowX:'hidden'}}>
            {/* Header */}
            <div className="od-header">
              <button className="od-back" onClick={()=>{checkoutStep===2&&!checkoutDone?setCheckoutStep(1):setCheckoutOpen(false)}}>
                {checkoutStep===2&&!checkoutDone?'← Back':'✕'}
              </button>
              <span className="od-type-badge">{checkoutItem.type==='product'?'Purchase':'Enrollment'}</span>
              <div className="od-header-price">${coPrice.toFixed(0)}</div>
            </div>

            {!checkoutDone?(
              <div className="od-content">

                {/* ── STEP 1 — Contact + Shipping ─────────────────── */}
                {checkoutStep===1&&(<>
                  <div className="co-section-label">Contact</div>
                  <input type="text" className="co-field" placeholder="Full name" required autoComplete="name" value={checkoutForm.name} onChange={e=>setCheckoutForm(f=>({...f,name:e.target.value}))}/>
                  <input type="email" className="co-field" placeholder="Email address" required autoComplete="email" value={checkoutForm.email} onChange={e=>setCheckoutForm(f=>({...f,email:e.target.value}))}/>
                  <input type="tel" className="co-field" placeholder="Phone (optional)" autoComplete="tel" value={checkoutPhone} onChange={e=>setCheckoutPhone(e.target.value)}/>

                  <div className="co-section-label">Shipping Address</div>
                  {/* Country selector */}
                  <div style={{display:'flex',gap:'.5rem',marginBottom:'.75rem'}}>
                    {[['Canada','🇨🇦'],['United States','🇺🇸']].map(([c,flag])=>(
                      <button key={c} type="button"
                        onClick={()=>setCheckoutAddress(a=>({...a,country:c,province:'',postal:''}))||setPostalError('')}
                        style={{
                          flex:1,padding:'.6rem',borderRadius:99,border:'1.5px solid',
                          borderColor:checkoutAddress.country===c?'var(--gold)':'var(--border)',
                          background:checkoutAddress.country===c?'var(--gold)':'transparent',
                          color:checkoutAddress.country===c?'#fff':'var(--ink)',
                          fontWeight:700,fontSize:'.82rem',cursor:'pointer',fontFamily:'inherit',
                          display:'flex',alignItems:'center',justifyContent:'center',gap:'.4rem',
                        }}
                      >{flag} {c}</button>
                    ))}
                  </div>
                  <input type="text" className="co-field" placeholder="Street address" required autoComplete="street-address"
                    value={checkoutAddress.street} onChange={e=>setCheckoutAddress(a=>({...a,street:e.target.value}))}/>
                  <input type="text" className="co-field" placeholder="Apt / Suite (optional)" autoComplete="address-line2"
                    value={checkoutAddress.apt} onChange={e=>setCheckoutAddress(a=>({...a,apt:e.target.value}))}/>
                  <input type="text" className="co-field" placeholder="City" required autoComplete="address-level2"
                    value={checkoutAddress.city} onChange={e=>setCheckoutAddress(a=>({...a,city:e.target.value}))}/>
                  <select className="co-field" required autoComplete="address-level1"
                    value={checkoutAddress.province} onChange={e=>setCheckoutAddress(a=>({...a,province:e.target.value}))}>
                    <option value="">{checkoutAddress.country==='United States'?'State':'Province'}</option>
                    {(checkoutAddress.country==='United States'?US_STATES:CA_PROVINCES).map(([abbr,name])=>(
                      <option key={abbr} value={abbr}>{name}</option>
                    ))}
                  </select>
                  <input type="text" className="co-field"
                    placeholder={checkoutAddress.country==='United States'?'12345':'A1A 1A1'}
                    maxLength={checkoutAddress.country==='United States'?10:7}
                    required autoComplete="postal-code"
                    value={checkoutAddress.postal}
                    style={postalError?{borderColor:'#e05c5c'}:{}}
                    onChange={e=>{
                      let v = e.target.value
                      if (checkoutAddress.country==='Canada') {
                        v = v.toUpperCase().replace(/[^A-Z0-9]/g,'')
                        if (v.length>3) v = v.slice(0,3)+' '+v.slice(3,6)
                      }
                      setCheckoutAddress(a=>({...a,postal:v}))
                      setPostalError('')
                    }}
                    onBlur={e=>{
                      const v = e.target.value.trim()
                      if (!v) return
                      if (checkoutAddress.country==='Canada') {
                        if (!/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(v)) setPostalError('Invalid postal code')
                      } else {
                        if (!/^\d{5}(-\d{4})?$/.test(v)) setPostalError('Invalid ZIP code')
                      }
                    }}
                  />
                  {postalError&&<div style={{fontSize:'0.72rem',color:'#e05c5c',marginTop:-8,marginBottom:6,paddingLeft:2}}>{postalError}</div>}

                  {checkoutError&&<p style={{fontSize:12,color:'#e05c5c',margin:'4px 0 12px',lineHeight:1.5}}>{checkoutError}</p>}
                  <button className="co-pay-btn" style={{marginTop:8,opacity:(!step1Valid||checkoutSubmitting)?0.4:1}} disabled={!step1Valid||checkoutSubmitting} onClick={initCheckoutStripe}>
                    {checkoutSubmitting?'Initializing…':'Continue to Payment →'}
                  </button>
                </>)}

                {/* ── STEP 2 — Payment + Summary ───────────────────── */}
                {checkoutStep===2&&(<>
                  {/* Order summary */}
                  <div className="co-summary-card">
                    <div className="co-summary-row">
                      <span>{coName}</span>
                      {checkoutItem.type==='product'&&<span>× {checkoutItem.quantity||1}</span>}
                    </div>
                    <div className="co-summary-row">
                      <span>Unit price</span>
                      <span>${coPrice.toFixed(2)}</span>
                    </div>
                    <div className="co-summary-row">
                      <span>Subtotal</span>
                      <span>${(coPrice*(checkoutItem.quantity||1)).toFixed(2)}</span>
                    </div>
                    <div className="co-summary-row">
                      <span>Shipping</span>
                      <span style={{color:'var(--text-muted)',fontStyle:'italic'}}>Calculated by studio</span>
                    </div>
                    <div className="co-summary-row co-summary-total">
                      <span>Total</span>
                      <span>${(coPrice*(checkoutItem.quantity||1)).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Card fields */}
                  <div className="co-section-label">Payment</div>
                  <input type="text" className="co-field" placeholder="Name on card" autoComplete="cc-name" value={cardholderName} onChange={e=>setCardholderName(e.target.value)}/>
                  <div id="checkout-card-element" className="co-card-element"/>

                  {/* Policy checkbox */}
                  <label className="cb-policy-agree" style={{marginBottom:20}}>
                    <input type="checkbox" onChange={e=>setCheckoutAgreed(e.target.checked)} checked={checkoutAgreed}/>
                    <span>I agree to the{' '}<span style={{color:'var(--accent)'}}>shop policy</span>{' '}and understand all sales are final unless otherwise stated.</span>
                  </label>

                  {checkoutError&&<p style={{fontSize:12,color:'#e05c5c',marginBottom:12,lineHeight:1.5}}>{checkoutError}</p>}
                  <button className="co-pay-btn" disabled={!checkoutAgreed||checkoutSubmitting} onClick={confirmCheckout}>
                    {checkoutSubmitting?'Processing…':`Pay $${coPrice.toFixed(0)} →`}
                  </button>
                  <div className="co-secure">🔒 Secured by Stripe</div>
                </>)}

              </div>
            ):(
              <div className="od-content" style={{display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',paddingTop:56}}>
                <div style={{fontSize:56,marginBottom:16}}>✅</div>
                <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.6rem',color:'var(--text)',marginBottom:12}}>Payment confirmed!</div>
                <p style={{fontSize:'0.88rem',color:'var(--text-muted)',lineHeight:1.75,maxWidth:280}}>
                  {(checkoutItem.type==='product'||checkoutItem.type==='cart')
                    ?'Your order is being prepared. We\'ll be in touch shortly.'
                    :'Check your inbox — access details are on their way.'}
                </p>
                <button onClick={()=>setCheckoutOpen(false)} style={{marginTop:28,background:'none',border:'1px solid var(--dark-4)',color:'var(--text-muted)',padding:'10px 28px',borderRadius:8,cursor:'pointer',fontSize:13,fontFamily:'DM Sans,sans-serif'}}>Close</button>
              </div>
            )}
          </div>
        )
      })()}

      {/* ═══════════ BOOKING OVERLAY ═══════════ */}
      <div className={`cb-overlay${bkOpen?' open':''}`}>
        <div className="cb-ov-header">
          <button className="cb-ov-back" onClick={bkPage===0||bkPage===1||bkPage===5?closeBooking:()=>setBkPage(p=>p-1)}>{bkPage===0||bkPage===1||bkPage===5?'✕':'← Back'}</button>
          <div style={{textAlign:'center'}}><div style={{fontFamily:'Playfair Display,serif',fontSize:14,color:'var(--text)'}}>{bkService?.name||''}</div><div style={{fontSize:10,color:'var(--text-muted)',marginTop:2}}>{bkService?(bkService.is_free?'Free':`$${Number(bkService.price).toFixed(0)}`)+' · '+(bkService.duration_min?bkService.duration_min+' min':'1h'):''}</div></div>
          <button className="cb-ov-back" style={{textAlign:'right'}} onClick={closeBooking}>✕</button>
        </div>
        <div className="cb-dots">{[1,2,3].map(n=><div key={n} className={`cb-dot${bkPage===n?' active':bkPage>n?' done':''}`}/>)}</div>

        <div className="cb-ov-pages">
          <div className="cb-ov-inner" style={{transform:`translateX(-${bkPage*100}%)`}}>

            {/* PAGE 0 — Policy Gate (shown only when policy_enabled + has content) */}
            <div className="cb-ov-page">
              <div className="cb-ov-content">
                <div className="cb-page-eye">Before You Book</div>
                <h3 className="cb-page-title">Please read<br/>our policy</h3>
                <p style={{fontSize:13,color:'var(--text-muted)',fontWeight:300,lineHeight:1.65,marginBottom:8}}>Please read and agree to our booking policy before continuing.</p>
                {policyLines.map((line,i)=>(
                  <div key={i} className="cb-policy-line">{line}</div>
                ))}
                <label className="cb-policy-agree">
                  <input type="checkbox" checked={bkPolicyAgreed} onChange={e=>setBkPolicyAgreed(e.target.checked)}/>
                  <span>I have read and agree to the booking policy</span>
                </label>
              </div>
              <div className="cb-ov-footer">
                <button className="cb-btn-primary" style={{width:'100%',padding:16,opacity:bkPolicyAgreed?1:.45,cursor:bkPolicyAgreed?'pointer':'not-allowed'}} disabled={!bkPolicyAgreed} onClick={()=>setBkPage(1)}>Continue</button>
              </div>
            </div>

            {/* PAGE 1 — Visit */}
            <div className="cb-ov-page">
              <div className="cb-ov-content">
                <div className="cb-page-eye">Step 1 of 3</div>
                <h3 className="cb-page-title">Where would you<br/>like your service?</h3>
                {bkService?.addons?.length>0&&<div style={{marginBottom:20,paddingBottom:16,borderBottom:'1px solid var(--dark-4)'}}>
                  <div style={{fontSize:8,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--text-muted)',marginBottom:10}}>Enhance your session</div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                    {bkService.addons.map(addon=>{const name=typeof addon==='string'?addon:addon.name; const price=typeof addon==='object'&&addon.price?` +$${addon.price}`:''; const lbl=name+price; return <div key={lbl} className={`cb-addon-chip${bkAddons.includes(lbl)?' on':''}`} onClick={()=>setBkAddons(a=>a.includes(lbl)?a.filter(x=>x!==lbl):[...a,lbl])}>{lbl}</div>})}
                  </div>
                </div>}
                <div className="cb-visit-cards">
                  <div className={`cb-visit-card${bkVisit==='studio'?' selected':''}`} onClick={()=>setBkVisit('studio')}>
                    <div className="cb-vc-radio"/><div className="cb-vc-title">Studio Visit</div>
                    <div className="cb-vc-sub">{workspace.address_visibility!=='hidden'&&workspace.neighborhood?`Visit the studio in ${workspace.neighborhood}.`:'Come to the studio. Full professional setup included.'}</div>
                    <div className="cb-vc-fee">No additional fee</div>
                  </div>
                  {workspace.offers_domicile&&<div className={`cb-visit-card${bkVisit==='home'?' selected':''}`} onClick={()=>setBkVisit('home')}>
                    <div className="cb-vc-radio"/><div className="cb-vc-title">Home Visit</div>
                    <div className="cb-vc-sub">Stylist comes to your address. Within {workspace.domicile_radius_km||25} km. Travel fee applies.</div>
                    <div className="cb-vc-fee"><span className="cb-vc-fee-amt">+${workspace.domicile_fee||45}</span> travel fee</div>
                  </div>}
                </div>
                {bkVisit==='home'&&<div>
                  <div style={{border:'1px solid var(--dark-4)',padding:'16px 14px',marginBottom:8}}>
                    <div style={{fontSize:8,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--text-muted)',marginBottom:12,paddingBottom:10,borderBottom:'1px solid var(--dark-4)'}}>Your Address</div>
                    <input className={`cb-input${bkErrors.street?' err':''}`} placeholder="Street address, Apt number" value={bkDom.street} onChange={e=>setBkDom(d=>({...d,street:e.target.value}))} autoComplete="street-address"/>
                    {bkErrors.street&&<div className="cb-err">Please enter your street address</div>}
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                      <input className="cb-input" placeholder="City" value={bkDom.city} onChange={e=>setBkDom(d=>({...d,city:e.target.value}))} autoComplete="address-level2"/>
                      <input className="cb-input" placeholder="Postal code" value={bkDom.postal} onChange={e=>setBkDom(d=>({...d,postal:e.target.value}))} autoComplete="postal-code"/>
                    </div>
                    <textarea className="cb-input" placeholder="Floor, door code, parking notes… (optional)" value={bkDom.access} onChange={e=>setBkDom(d=>({...d,access:e.target.value}))} style={{minHeight:60,resize:'none',marginBottom:0}}/>
                  </div>
                  <div style={{display:'flex',alignItems:'flex-start',gap:12,border:'1px solid var(--dark-4)',padding:'14px',cursor:'pointer',marginBottom:6}} onClick={()=>{setBkPolicy(p=>!p);setBkErrors(e=>({...e,policy:false}))}}>
                    <div style={{width:16,height:16,border:`1px solid ${bkPolicy?'var(--gold)':'var(--dark-5)'}`,borderRadius:1,background:bkPolicy?'var(--gold)':'var(--dark-3)',flexShrink:0,marginTop:1,display:'flex',alignItems:'center',justifyContent:'center',transition:'all .2s'}}>
                      {bkPolicy&&<svg width="9" height="6" viewBox="0 0 9 6" fill="none"><polyline points="1,3 3.5,5.5 8,1" stroke="#141210" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                    </div>
                    <div style={{fontSize:13,color:'var(--text-soft)',fontWeight:300,lineHeight:1.6}}>I have read and agree to the <button style={{background:'none',border:'none',color:'var(--gold)',fontFamily:'inherit',fontSize:'inherit',cursor:'pointer',padding:0,textDecoration:'underline',textDecorationColor:'rgba(201,168,76,.3)'}} onClick={e=>{e.stopPropagation();setPolicyOpen(true)}}>home service policy</button></div>
                  </div>
                  {bkErrors.policy&&<div className="cb-err">Please confirm you have read the home service policy</div>}
                </div>}
              </div>
              <div className="cb-ov-footer"><button className="cb-btn-primary" style={{width:'100%',padding:16}} onClick={()=>goToPage(2)}>Continue</button></div>
            </div>

            {/* PAGE 2 — Date & Time */}
            <div className="cb-ov-page">
              <div className="cb-ov-content">
                <div className="cb-page-eye">Step 2 of 3</div>
                <h3 className="cb-page-title">Pick your date<br/>&amp; time</h3>
                <div className="cb-cal">
                  <div className="cb-cal-head"><div className="cb-cal-month">{MONTHS[bkCalM]} {bkCalY}</div><div style={{display:'flex',gap:5}}><button className="cb-cal-nav" onClick={prevMonth} disabled={isCurMonth}>‹</button><button className="cb-cal-nav" onClick={nextMonth}>›</button></div></div>
                  <div className="cb-cal-dnames">{['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=><div key={d} className="cb-cal-dname">{d}</div>)}</div>
                  <div className="cb-cal-grid">
                    {Array(firstDay).fill(null).map((_,i)=><div key={`e${i}`}/>)}
                    {Array.from({length:daysInMonth},(_,i)=>i+1).map(day=>{
                      const thisDate=new Date(bkCalY,bkCalM,day)
                      const isPast=thisDate<TODAY_DATE,isToday=thisDate.getTime()===TODAY_DATE.getTime()
                      const isAvail=!isPast&&!isToday&&isDateAvailable(bkCalY,bkCalM,day)
                      const isSel=bkDay===day
                      return <div key={day} className={`cb-cal-day${isSel?' sel':''}${isPast?' past':''}${isToday?' today':''}${isAvail?' avail':' off'}`} onClick={()=>{if(isAvail){setBkDay(day);setBkTime(null);loadSlots(day,bkService)}}}>{day}</div>
                    })}
                  </div>
                </div>
                {bkDay&&<div>
                  <div style={{fontSize:9,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--text-muted)',marginBottom:10}}>{bkSlotsLoading?'Loading...':`Available times — ${formatDateLabel(bkCalY,bkCalM,bkDay)}`}</div>
                  {!bkSlotsLoading&&<div className="cb-time-grid">
                    {bkSlots.map(slot=><div key={slot.label} className={`cb-time-slot${!slot.available?' booked':''}${bkTime===slot.label?' sel':''}`} onClick={()=>slot.available&&setBkTime(slot.label)}>{slot.label}</div>)}
                    {bkSlots.length===0&&<div style={{gridColumn:'1/-1',fontSize:13,color:'var(--text-muted)',padding:'16px 0'}}>No available slots for this day.</div>}
                  </div>}
                </div>}
              </div>
              <div className="cb-ov-footer"><button className="cb-btn-primary" style={{width:'100%',padding:16}} disabled={!bkDay||!bkTime} onClick={()=>goToPage(3)}>Continue</button></div>
            </div>

            {/* PAGE 3 — Your Info */}
            <div className="cb-ov-page">
              <div className="cb-ov-content">
                <div className="cb-page-eye">Step 3 of 3</div>
                <h3 className="cb-page-title">Your details</h3>
                {/* Recap */}
                <div className="cb-recap">
                  <div className="cb-recap-header"><div style={{fontSize:8,letterSpacing:'0.22em',textTransform:'uppercase',color:'var(--text-muted)'}}>Summary</div><div style={{fontSize:10,color:'var(--success)'}}>Ready to confirm</div></div>
                  <div>
                    {[['Service',bkService?.name],['Visit',bkVisit==='home'?'Home Visit':'Studio Visit'],bkVisit==='home'&&['Address',bkDom.street],['Date',bkDay?formatDateLabel(bkCalY,bkCalM,bkDay):''],['Time',bkTime],bkAddons.length>0&&['Add-ons',bkAddons.join(', ')]].filter(Boolean).map(([k,v])=>v&&<div key={k} className="cb-recap-row"><span className="cb-recap-key">{k}</span><span className="cb-recap-val">{v}</span></div>)}
                    <div style={{height:1,background:'rgba(255,255,255,.05)',margin:'4px 18px',borderTop:'1px dashed rgba(255,255,255,.05)'}}/>
                    <div className="cb-recap-row"><span className="cb-recap-key">Total</span><span className="cb-recap-val" style={{color:'var(--gold)',fontFamily:'Playfair Display,serif',fontSize:15}}>{bkService?.is_free?'Free':`$${Number(bkService?.price||0).toFixed(0)}`}{bkVisit==='home'?` + $${workspace.domicile_fee||45} travel`:''}</span></div>
                    {depositRequired&&<div className="cb-recap-row"><span className="cb-recap-key">Deposit</span><span className="cb-recap-val" style={{color:'var(--gold)'}}>{workspace.payment_mode==='cash_only'?`$${depositAmount.toFixed(2)} cash at appointment`:`$${depositAmount.toFixed(2)} required`}</span></div>}
                    {workspace.payment_mode==='cash_only'&&<div className="cb-recap-row"><span className="cb-recap-key">Payment</span><span className="cb-recap-val" style={{color:'var(--text-muted)',fontSize:11}}>Cash only — collected at appointment</span></div>}
                  </div>
                </div>
                {/* Form */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:0}}>
                  <div><input className={`cb-input${bkErrors.fname?' err':''}`} placeholder="First name" value={bkForm.fname} onChange={e=>setBkForm(f=>({...f,fname:e.target.value}))} autoComplete="given-name"/>{bkErrors.fname&&<div className="cb-err">Required</div>}</div>
                  <div><input className={`cb-input${bkErrors.lname?' err':''}`} placeholder="Last name" value={bkForm.lname} onChange={e=>setBkForm(f=>({...f,lname:e.target.value}))} autoComplete="family-name"/>{bkErrors.lname&&<div className="cb-err">Required</div>}</div>
                </div>
                <input className={`cb-input${bkErrors.email?' err':''}`} placeholder="Email address" type="email" value={bkForm.email} onChange={e=>setBkForm(f=>({...f,email:e.target.value}))} autoComplete="email"/>
                {bkErrors.email&&!bkErrors.phone&&<div className="cb-err">Enter a valid email</div>}
                {bkErrors.email&&bkErrors.phone&&<div className="cb-err">Please provide an email or phone number</div>}
                <input className={`cb-input${bkErrors.phone?' err':''}`} placeholder="Phone number" type="tel" value={bkForm.phone} onChange={e=>setBkForm(f=>({...f,phone:e.target.value}))} autoComplete="tel"/>
                {bkErrors.phone&&!bkErrors.email&&<div className="cb-err">Enter a valid phone number</div>}
                <select className="cb-input cb-select" value={bkForm.source} onChange={e=>setBkForm(f=>({...f,source:e.target.value}))}>
                  <option value="">How did you find us? (optional)</option>
                  <option value="instagram">Instagram</option><option value="tiktok">TikTok</option>
                  <option value="friend">Friend or family</option><option value="google">Google</option>
                  <option value="returning">Returning client</option><option value="other">Other</option>
                </select>
                <textarea className="cb-input" placeholder="Notes — hair history, allergies, references… (optional)" value={bkForm.notes} onChange={e=>setBkForm(f=>({...f,notes:e.target.value}))} style={{minHeight:68,resize:'none'}}/>
                <div style={{fontSize:11,color:'var(--text-muted)',fontWeight:300,lineHeight:1.7,marginTop:4}}>By confirming you agree to the cancellation policy. {workspace.faq_settings?.cancellation_hours||48}-hour notice required.</div>
                {bkSubmitErr&&<div style={{fontSize:13,color:'var(--error)',background:'rgba(208,96,90,.08)',border:'1px solid rgba(208,96,90,.2)',padding:'12px 14px',marginTop:10,borderRadius:1}}>{bkSubmitErr}</div>}
              </div>
              <div className="cb-ov-footer"><button className="cb-btn-primary" style={{width:'100%',padding:16}} disabled={bkSubmitting} onClick={submitBooking}>{bkSubmitting?'Confirming…':'Confirm Booking'}</button></div>
            </div>

            {/* PAGE 4 — Deposit (shown only when depositRequired) */}
            <div className="cb-ov-page">
              <div className="cb-ov-content">
                <div className="cb-page-eye">Secure Deposit</div>
                <h3 className="cb-page-title">Confirm your<br/>deposit</h3>
                <div className="cb-recap" style={{marginBottom:20}}>
                  <div className="cb-recap-row"><span className="cb-recap-key">Service</span><span className="cb-recap-val">{bkService?.name}</span></div>
                  <div className="cb-recap-row"><span className="cb-recap-key">Deposit</span><span className="cb-recap-val" style={{color:'var(--gold)',fontFamily:'Playfair Display,serif'}}>${depositAmount.toFixed(2)}</span></div>
                  <div className="cb-recap-row"><span className="cb-recap-key">Note</span><span className="cb-recap-val" style={{fontSize:11,color:'var(--text-muted)'}}>Applied to your total at the studio.</span></div>
                </div>
                {bkPaymentLoading&&<div style={{textAlign:'center',padding:'32px 0',color:'var(--text-muted)',fontSize:13}}>Initializing payment…</div>}
                <div id="bk-card-element" style={{background:'var(--dark-2)',border:`1px solid ${bkPaymentErr?'rgba(208,96,90,.4)':'var(--dark-4)'}`,borderRadius:2,padding:'14px 12px',marginBottom:12,display:bkPaymentLoading?'none':'block'}}/>
                {bkPaymentErr&&<div style={{fontSize:13,color:'var(--error)',background:'rgba(208,96,90,.08)',border:'1px solid rgba(208,96,90,.2)',padding:'12px 14px',marginTop:8,borderRadius:1}}>{bkPaymentErr}</div>}
                <div style={{fontSize:11,color:'var(--text-muted)',marginTop:12,lineHeight:1.6}}>🔒 Secured by Stripe. Your card is authorized now and captured only if you cancel inside the non-refundable window.</div>
              </div>
              <div className="cb-ov-footer"><button className="cb-btn-primary" style={{width:'100%',padding:16}} disabled={bkPaymentLoading||bkSubmitting||!bkDepositPi} onClick={confirmDeposit}>{bkSubmitting?'Booking…':bkPaymentLoading?'Initializing…':`Pay Deposit · $${depositAmount.toFixed(2)}`}</button></div>
            </div>

            {/* PAGE 5 — Success */}
            <div className="cb-ov-page">
              <div className="cb-ov-content" style={{display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',paddingTop:32}}>
                <div style={{width:56,height:56,border:'1px solid rgba(86,187,134,.2)',background:'rgba(86,187,134,.06)',borderRadius:2,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--success)',fontSize:22,marginBottom:22}}>✓</div>
                <h3 style={{fontFamily:'Playfair Display,serif',fontSize:26,fontStyle:'italic',color:'var(--text)',marginBottom:10}}>You are booked, <em>{bkForm.fname}</em></h3>
                <p style={{fontSize:13,color:'var(--text-muted)',fontWeight:300,lineHeight:1.75,marginBottom:28,maxWidth:260}}>A confirmation has been sent to <strong style={{color:'var(--text-soft)'}}>{bkForm.email||bkForm.phone}</strong></p>
                {bkAppointment&&<div style={{width:'100%',maxWidth:320,background:'var(--dark-2)',border:'1px solid var(--dark-4)',textAlign:'left',marginBottom:24}}>
                  <div style={{padding:'12px 18px',borderBottom:'1px solid var(--dark-4)',display:'flex',justifyContent:'space-between'}}><span style={{fontSize:8,letterSpacing:'0.22em',textTransform:'uppercase',color:'var(--text-muted)'}}>Appointment</span><span style={{fontSize:10,color:'var(--success)'}}>Confirmed</span></div>
                  <div>
                    {[['Service',bkService?.name],['Visit',bkVisit==='home'?'Home Visit':'Studio Visit'],['Date',bkDay?formatDateLabel(bkCalY,bkCalM,bkDay):''],['Time',bkTime],['Total',bkService?.is_free?'Free':`$${Number(bkService?.price||0).toFixed(0)}`+(bkVisit==='home'?` + $${workspace.domicile_fee||45}`:'')+( depositAmount>0?` (deposit $${depositAmount.toFixed(2)} paid)`:'')]].map(([k,v])=><div key={k} className="cb-recap-row"><span className="cb-recap-key">{k}</span><span className="cb-recap-val">{v}</span></div>)}
                  </div>
                </div>}
                <div style={{display:'flex',flexDirection:'column',gap:8,width:'100%',maxWidth:320}}>
                  <button className="cb-btn-primary" style={{width:'100%',padding:14}} onClick={()=>{setBkOpen(false);window.scrollTo(0,0)}}>Retour à la page d'accueil</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PORTFOLIO OVERLAY */}
      <div className={`cb-portfolio-overlay${portfolioOpen?' open':''}`}>
        <div className="cb-portfolio-nav"><button className="cb-ov-back" onClick={()=>setPortfolioOpen(false)}>← Back to Studio</button><div style={{fontFamily:'Playfair Display,serif',fontSize:15,color:'var(--gold)'}}>Portfolio</div><div/></div>
        <div style={{padding:'48px 24px 80px',flex:1}}>
          <div className="cb-eyebrow" style={{marginBottom:8}}>The Work</div><h2 className="cb-heading" style={{marginBottom:28}}>Crafted with <em>intention</em></h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:4}}>
            {(portfolio.length>0?portfolio:Array(6).fill(null)).map((p,i)=>(
              <div key={p?.id||i} style={{aspectRatio:'3/4',background:'var(--dark-3)',overflow:'hidden',cursor:p?.url?'pointer':'default'}} onClick={p?.url?()=>openLb(p):undefined}>
                {p?.url&&<img src={p.url} alt={p.caption||''} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform .4s ease'}} onMouseEnter={e=>e.currentTarget.style.transform='scale(1.04)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}/>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* POLICY OVERLAY */}
      <div className={`cb-portfolio-overlay${policyOpen?' open':''}`}>
        <div className="cb-portfolio-nav"><button className="cb-ov-back" onClick={()=>setPolicyOpen(false)}>← Back to booking</button><div style={{fontFamily:'Playfair Display,serif',fontSize:15,color:'var(--gold)'}}>Home Service Policy</div><div/></div>
        <div style={{padding:'48px 24px 24px',flex:1}}>
          {[['Travel Fee',`A travel fee of $${workspace?.domicile_fee||45} applies to all home visit appointments. Collected at time of service, non-refundable.`],['Service Radius',`Home visits are available within ${workspace?.domicile_radius_km||25} km. Addresses outside this radius cannot be serviced.`],['Space Requirements','You must prepare: a chair at a table with adequate lighting, access to a sink, and sufficient clear space for equipment.'],['Parking & Access','Parking must be available within reasonable distance. Include all access details in your booking notes.'],['Cancellation',`The standard ${workspace?.faq_settings?.cancellation_hours||48}-hour cancellation policy applies. Late cancellations forfeit the travel fee in addition to any deposit.`]].map(([t,b])=><div key={t} style={{marginBottom:24}}><div style={{fontSize:11,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--gold)',marginBottom:8,paddingBottom:8,borderBottom:'1px solid var(--dark-4)'}}>{t}</div><p style={{fontSize:14,color:'var(--text-soft)',fontWeight:300,lineHeight:1.85}}>{b}</p></div>)}
        </div>
        <div style={{position:'sticky',bottom:0,padding:'16px 24px 28px',background:'rgba(10,5,2,.97)',borderTop:'1px solid var(--dark-4)'}}><button className="cb-btn-primary" style={{width:'100%',padding:14}} onClick={()=>{setBkPolicy(true);setPolicyOpen(false)}}>I have read — Return to booking</button></div>
      </div>

      {/* LIGHTBOX */}
      {lbOpen&&lbPhotos.length>0&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.96)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center'}}
          onClick={closeLb}
          onTouchStart={e=>{lbTouchX.current=e.touches[0].clientX}}
          onTouchEnd={e=>{const dx=e.changedTouches[0].clientX-lbTouchX.current;if(dx>50)lbPrev();else if(dx<-50)lbNext()}}
        >
          <button onClick={closeLb} style={{position:'absolute',top:20,right:20,background:'transparent',border:'1px solid rgba(201,168,76,.3)',color:'var(--gold)',width:40,height:40,borderRadius:2,cursor:'pointer',fontSize:20,display:'flex',alignItems:'center',justifyContent:'center',zIndex:10}}>×</button>
          <div style={{position:'absolute',top:22,left:'50%',transform:'translateX(-50%)',fontSize:10,letterSpacing:'.2em',color:'rgba(201,168,76,.55)',textTransform:'uppercase',userSelect:'none'}}>{lbIdx+1} / {lbPhotos.length}</div>
          {lbPhotos.length>1&&<button onClick={e=>{e.stopPropagation();lbPrev()}} style={{position:'absolute',left:16,background:'transparent',border:'1px solid rgba(201,168,76,.3)',color:'var(--gold)',width:44,height:44,borderRadius:2,cursor:'pointer',fontSize:22,display:'flex',alignItems:'center',justifyContent:'center',zIndex:10}}>←</button>}
          <img src={lbPhotos[lbIdx].url} alt={lbPhotos[lbIdx].caption||''} style={{maxHeight:'88vh',maxWidth:'88vw',objectFit:'contain',borderRadius:2,userSelect:'none'}} onClick={e=>e.stopPropagation()} draggable={false}/>
          {lbPhotos.length>1&&<button onClick={e=>{e.stopPropagation();lbNext()}} style={{position:'absolute',right:16,background:'transparent',border:'1px solid rgba(201,168,76,.3)',color:'var(--gold)',width:44,height:44,borderRadius:2,cursor:'pointer',fontSize:22,display:'flex',alignItems:'center',justifyContent:'center',zIndex:10}}>→</button>}
          {lbPhotos[lbIdx].caption&&<div style={{position:'absolute',bottom:24,left:'50%',transform:'translateX(-50%)',fontSize:11,color:'rgba(240,234,224,.5)',letterSpacing:'.1em',whiteSpace:'nowrap',userSelect:'none'}}>{lbPhotos[lbIdx].caption}</div>}
        </div>
      )}

      {/* CART DRAWER */}
      {cartOpen&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.7)',zIndex:700}} onClick={()=>setCartOpen(false)}/>}
      <div className={`cb-cart-drawer${cartOpen?' open':''}`}>
        <div style={{padding:'18px 20px',borderBottom:'1px solid var(--dark-4)',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
          <div><div style={{fontSize:9,letterSpacing:'0.22em',textTransform:'uppercase',color:'var(--text-muted)'}}>Shopping Bag</div><div style={{fontFamily:'Playfair Display,serif',fontSize:14,color:'var(--gold-light)',marginTop:4}}>{cartCount} item{cartCount!==1?'s':''}</div></div>
          <button className="cb-ov-back" onClick={()=>setCartOpen(false)}>✕</button>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'16px 20px'}}>
          {cartItems.length===0?<div style={{textAlign:'center',padding:'60px 0',color:'var(--text-muted)',fontSize:13}}>Your bag is empty.</div>:cartItems.map(item=><div key={item.id} style={{display:'flex',gap:12,padding:'14px 0',borderBottom:'1px solid var(--dark-4)'}}>
            <div style={{width:44,height:44,background:'var(--dark-4)',borderRadius:2,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>✦</div>
            <div style={{flex:1}}><div style={{fontSize:13,color:'var(--text)'}}>{item.name}</div><div style={{fontSize:13,color:'var(--gold)',fontFamily:'Playfair Display,serif'}}>${(isDiscountActive(item)?Number(item.discount_price):Number(item.price)).toFixed(0)}</div><div style={{display:'flex',alignItems:'center',gap:10,marginTop:8}}><button className="cb-qty-btn" onClick={()=>changeQty(item.id,-1)}>−</button><span style={{fontSize:13,color:'var(--text)'}}>{item.qty}</span><button className="cb-qty-btn" onClick={()=>changeQty(item.id,1)}>+</button></div></div>
          </div>)}
        </div>
        {cartItems.length>0&&<div style={{padding:'16px 20px 24px',borderTop:'1px solid var(--dark-4)',flexShrink:0}}>
          {freeItemsMsg&&<div style={{fontSize:12,color:'var(--gold)',marginBottom:10,textAlign:'center',letterSpacing:'.04em'}}>{freeItemsMsg}</div>}
          {paidItems.length>0&&(
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <span style={{fontSize:11,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--text-muted)'}}>Subtotal</span>
              <span style={{fontFamily:'Playfair Display,serif',fontSize:22,color:'var(--gold)'}}>${paidTotal.toFixed(0)}</span>
            </div>
          )}
          {freeItems.length>0&&paidItems.length>0&&(
            <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:10,textAlign:'center'}}>{freeItems.length} free item{freeItems.length!==1?'s':''} included</div>
          )}
          {paidItems.length>0?(
            <button className="cb-btn-primary" style={{width:'100%',padding:14}} onClick={openCartCheckout}>Checkout — ${paidTotal.toFixed(0)} →</button>
          ):(
            <button className="cb-btn-primary" style={{width:'100%',padding:14}} onClick={getFreeItems}>Get Your Items →</button>
          )}
        </div>}
      </div>

      {/* FLOAT */}
      <div style={{position:'fixed',bottom:24,right:24,zIndex:450,display:'flex',flexDirection:'column',alignItems:'flex-end',gap:8}}>
        {floatOpen&&<div style={{display:'flex',flexDirection:'column',gap:8,alignItems:'flex-end'}}>
          {workspace.phone&&<div style={{display:'flex',alignItems:'center',gap:10}}><span style={{background:'var(--dark-3)',border:'1px solid var(--dark-4)',padding:'6px 12px',borderRadius:1,fontSize:11,color:'var(--text-soft)',whiteSpace:'nowrap'}}>Call</span><a href={`tel:${workspace.phone}`} style={{width:40,height:40,background:'var(--dark-3)',border:'1px solid var(--dark-5)',display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none',fontSize:16,borderRadius:2}}>📞</a></div>}
          {workspace.instagram&&<div style={{display:'flex',alignItems:'center',gap:10}}><span style={{background:'var(--dark-3)',border:'1px solid var(--dark-4)',padding:'6px 12px',borderRadius:1,fontSize:11,color:'var(--text-soft)',whiteSpace:'nowrap'}}>Instagram</span><a href={`https://instagram.com/${workspace.instagram.replace('@','')}`} target="_blank" rel="noreferrer" style={{width:40,height:40,background:'var(--dark-3)',border:'1px solid var(--dark-5)',display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none',fontSize:16,borderRadius:2}}>✦</a></div>}
        </div>}
        <button onClick={()=>setFloatOpen(f=>!f)} style={{width:48,height:48,borderRadius:2,background:'var(--gold)',color:'#141210',border:'none',cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 20px rgba(201,168,76,.28)',transition:'all .25s'}}>{floatOpen?'✕':'✦'}</button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{overflow-x:clip}body{overflow-x:clip}
:root{--gold:#C9A84C;--gold-light:#E8C97A;--gold-dim:rgba(201,168,76,0.12);--gold-border:rgba(201,168,76,0.25);--dark:#090909;--dark-2:#101010;--dark-3:#181818;--dark-4:#242424;--dark-5:#333;--text:#F0EAE0;--text-muted:#9A8E7E;--text-soft:#CCC0A8;--error:#d0605a;--success:#56bb86;--ease:cubic-bezier(.25,.46,.45,.94)}
[data-theme="light"]{--gold:#9A6E10;--gold-light:#B88A28;--gold-dim:rgba(154,110,16,0.08);--gold-border:rgba(154,110,16,0.20);--dark:#FFFFFF;--dark-2:#F7F7F7;--dark-3:#F0F0F0;--dark-4:#E4E4E4;--dark-5:#CCC;--text:#141210;--text-muted:#6B6158;--text-soft:#3A342E}
/* ── TEMPLATE VARS — defaults (dark); overridden per-theme via JS ── */
#client-page-root{--hero-base:#080808;--hero-base-2:#0F0A04;--hero-orb:rgba(201,168,76,0.18);--hero-duration:16s;--hero-text:#FFFFFF;--hero-text-muted:#C9A84C;--hero-text-soft:#AAAAAA;--body-bg:#FFFFFF;--text-primary:#0A0A0A;--text-secondary:#555555;--accent:#C9A84C;--btn-bg:#C9A84C;--btn-text:#080808;--nav-bg:#000000;--nav-text:#C9A84C;--tab-bg:#000000;--tab-text:#C9A84C;--tab-active-border:#C9A84C;--card-bg:#FFFFFF;--card-border:#E8E0D0;--price-color:#C9A84C}
*,*::before,*::after{transition:background-color .4s ease,color .4s ease,border-color .4s ease}
.cb-overlay,.cb-portfolio-overlay,.cb-ov-inner,.cb-cart-drawer{transition:none!important}

.cb-nav{position:fixed;top:0;left:0;right:0;z-index:500;padding:0 20px;height:64px;display:flex;align-items:center;justify-content:space-between;background:var(--nav-bg,rgba(10,5,2,0.98));border-bottom:1px solid rgba(201,168,76,0.1);backdrop-filter:blur(20px)}
[data-theme="light"] .cb-nav{background:rgba(14,7,2,0.98)!important}
.cb-nav-logo{font-family:'Playfair Display',serif;font-size:17px;color:var(--gold);display:flex;align-items:center;gap:8px}
.cb-nav-logo span{font-family:'DM Sans',sans-serif;font-size:11px;color:rgba(201,168,76,0.45);font-weight:300}
.cb-nav-right{display:flex;align-items:center;gap:10px}
.cb-icon-btn{background:transparent;border:1px solid rgba(201,168,76,0.2);color:rgba(201,168,76,0.65);width:36px;height:36px;border-radius:2px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;transition:all .2s;position:relative}
.cb-icon-btn:hover{border-color:var(--gold);color:var(--gold-light)}
.cb-cart-badge{position:absolute;top:-6px;right:-6px;background:var(--gold);color:#141210;font-size:9px;font-weight:700;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center}

/* ── HERO ── */
@keyframes orbDrift{0%{transform:translate(0%,0%)}25%{transform:translate(60%,20%)}50%{transform:translate(40%,60%)}75%{transform:translate(10%,40%)}100%{transform:translate(0%,0%)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.2}}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
/* floating orb via pseudo-element; svh for iOS chrome safety */
.cb-hero{min-height:80svh;display:grid;grid-template-columns:52% 48%;padding-top:64px;position:relative;overflow:hidden;background:var(--hero-base,#080808)}
.cb-hero::before{content:'';position:absolute;width:70%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,var(--hero-orb,rgba(201,168,76,0.18)) 0%,transparent 70%);filter:blur(40px);animation:orbDrift var(--hero-duration,16s) ease-in-out infinite;pointer-events:none;z-index:0;top:-10%;left:-10%}
@media(max-width:430px){.cb-hero::before{filter:blur(50px);width:80%}}
/* FIX 5 — content top-aligned, reduced top padding */
.hero-left,.hero-right{position:relative;z-index:1}
.hero-left{display:flex;flex-direction:column;justify-content:flex-start;padding:44px 60px 60px 40px;position:relative;z-index:2;background:transparent}
.hero-left::after{content:'';position:absolute;right:0;top:12%;bottom:12%;width:1px;background:linear-gradient(to bottom,transparent,rgba(201,168,76,0.18),transparent)}
.hero-context-tag{display:inline-flex;align-items:center;gap:8px;background:var(--gold-dim);border:1px solid var(--gold-border);border-radius:100px;padding:5px 16px 5px 10px;font-size:10px;color:var(--gold-light);letter-spacing:.14em;text-transform:uppercase;margin-bottom:20px;width:fit-content;transition:opacity .25s ease,transform .25s ease}
.hero-tag-dot{width:6px;height:6px;border-radius:50%;background:var(--gold);flex-shrink:0;animation:pulse 2.5s infinite}
/* FIX 2+3 — hero text uses --hero-text vars (separate from body --text) */
.hero-name{font-family:'Playfair Display',serif;font-size:clamp(52px,5.5vw,78px);font-weight:500;line-height:.95;margin-bottom:26px;animation:fadeUp .8s .16s ease both;color:var(--hero-text,var(--text))}
.hero-name-line{display:block;line-height:1.0}
.hero-name em{font-style:italic;color:var(--gold)}
.hero-eyebrow{font-size:10px;color:var(--hero-text-muted,var(--text-muted));letter-spacing:.22em;text-transform:uppercase;margin-bottom:20px;transition:opacity .25s ease,transform .25s ease}
.hero-bio{font-size:15px;line-height:1.85;color:var(--hero-text-soft,var(--text-soft));max-width:360px;margin-bottom:40px;font-weight:300;transition:opacity .25s ease,transform .25s ease}
.hero-stats{display:flex;gap:40px;margin-bottom:44px;transition:opacity .25s ease,transform .25s ease}
.stat-item{display:flex;flex-direction:column;gap:4px}
.stat-num{font-family:'Playfair Display',serif;font-size:28px;color:var(--gold);font-weight:500;line-height:1}
.stat-label{font-size:9px;color:var(--hero-text-muted,var(--text-muted));letter-spacing:.14em;text-transform:uppercase}
.hero-cta-row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:36px;transition:opacity .25s ease,transform .25s ease}
@media(max-width:640px){.hero-cta-row{flex-direction:column}.hero-cta-row button{width:100%;text-align:center}}
.hero-fading{opacity:0!important;transform:translateY(4px)!important}
.hero-socials{display:flex;align-items:center;gap:20px}
.hero-socials a{display:flex;align-items:center;gap:7px;font-size:11px;color:var(--hero-text-muted,var(--text-muted));text-decoration:none;letter-spacing:.06em;transition:color .2s}
.hero-socials a:hover{color:var(--gold-light)}
.hero-socials svg{width:14px;height:14px;fill:currentColor}
.soc-divider{width:1px;height:14px;background:var(--dark-5)}
/* Hero right panel */
.hero-right{position:relative;overflow:hidden}
.hero-right-bg{position:absolute;inset:0;background:radial-gradient(ellipse 55% 60% at 70% 22%,rgba(60,35,10,.8) 0%,transparent 65%),radial-gradient(ellipse 50% 70% at 30% 80%,rgba(40,22,5,.55) 0%,transparent 60%),linear-gradient(155deg,#1a1108 0%,#0d0a05 45%,#0a0906 100%)}
.hero-right-leak{position:absolute;top:-60px;right:-60px;width:340px;height:340px;background:radial-gradient(circle,rgba(201,168,76,.07) 0%,transparent 70%);border-radius:50%;pointer-events:none}
.editorial-letter{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-family:'Playfair Display',serif;font-size:clamp(180px,20vw,260px);font-weight:600;font-style:italic;color:rgba(201,168,76,.035);line-height:1;user-select:none;pointer-events:none}
.editorial-frame{position:absolute;inset:32px;border:1px solid rgba(201,168,76,.07);pointer-events:none}
.editorial-frame::before{content:'';position:absolute;inset:10px;border:1px solid rgba(201,168,76,.03)}
.corner{position:absolute;width:14px;height:14px;border-color:rgba(201,168,76,.28);border-style:solid}
.corner-tl{top:32px;left:32px;border-width:1px 0 0 1px}
.corner-tr{top:32px;right:32px;border-width:1px 1px 0 0}
.corner-bl{bottom:32px;left:32px;border-width:0 0 1px 1px}
.corner-br{bottom:32px;right:32px;border-width:0 1px 1px 0}
.editorial-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 48px}
.ed-label{font-size:9px;letter-spacing:.28em;text-transform:uppercase;color:rgba(201,168,76,.38);margin-bottom:14px}
.ed-title-line{width:40px;height:1px;background:rgba(201,168,76,.22);margin:18px auto}
.ed-services{display:flex;flex-direction:column;gap:9px;align-items:center}
.ed-svc-pill{font-size:10px;color:rgba(201,168,76,.45);letter-spacing:.16em;text-transform:uppercase;border:1px solid rgba(201,168,76,.12);padding:5px 16px;border-radius:100px;transition:opacity .25s ease,transform .25s ease}
.fc{position:absolute;background:rgba(10,8,5,.96);border:1px solid rgba(201,168,76,.14);border-radius:2px;padding:16px 20px;backdrop-filter:blur(24px);animation:fadeUp .9s .6s ease both}
.fc-1{bottom:60px;left:-20px;min-width:180px}
.fc-2{top:36%;right:24px;animation-delay:.75s}
.fc-lbl{font-size:8px;color:var(--text-muted);letter-spacing:.2em;text-transform:uppercase;margin-bottom:6px}
.fc-val{font-family:'Playfair Display',serif;font-size:17px;color:var(--gold-light)}
.fc-sub{font-size:10px;color:var(--text-soft);margin-top:3px}
@media(max-width:768px){.cb-hero{grid-template-columns:1fr;min-height:auto}.hero-left{padding:44px 24px 52px}.hero-left::after{display:none}.hero-right{display:none}}

/* ── BUTTONS ── */
.cb-btn-primary{background:var(--btn-bg,var(--gold));color:var(--btn-text,#141210);border:none;padding:14px 28px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;border-radius:1px;transition:all .25s}
.cb-btn-primary:hover{background:var(--gold-light);box-shadow:0 8px 28px rgba(201,168,76,.25)}
.cb-btn-primary:disabled{background:var(--dark-5);color:var(--text-muted);cursor:not-allowed;box-shadow:none}
.cb-btn-ghost{background:transparent;color:var(--btn-ghost-text,rgba(250,246,241,.7));border:1px solid var(--btn-ghost-border,rgba(250,246,241,.25));padding:14px 28px;font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;border-radius:1px;transition:all .25s}
.cb-btn-ghost:hover{border-color:rgba(250,246,241,.5);color:rgba(250,246,241,.9)}

/* ── TAB BAR ── */
.tab-bar-wrap{position:sticky;top:64px;z-index:400;background:var(--tab-bg,rgba(10,5,2,.99));border-bottom:1px solid rgba(201,168,76,.10);backdrop-filter:blur(20px)}
.tab-bar{width:100%;display:flex;align-items:stretch;overflow:hidden}
.tab-btn{background:transparent;border:none;color:var(--text-muted);font-family:'DM Sans',sans-serif;font-size:10px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;padding:16px 8px;cursor:pointer;position:relative;transition:color .25s;display:flex;align-items:center;justify-content:center;gap:6px;flex:1;min-width:0;text-align:center;white-space:normal}
.tab-btn::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:var(--tab-active-border,var(--gold));transform:scaleX(0);transition:transform .3s var(--ease)}
.tab-btn:hover{color:var(--text-soft)}
.tab-btn.active{color:var(--tab-text,var(--gold-light))}
.tab-btn.active::after{transform:scaleX(1)}
.tab-dot{width:5px;height:5px;border-radius:50%;background:var(--gold)}

.cb-panel{background:var(--body-bg,var(--dark))}
.cb-section{padding:64px 24px;background:var(--body-bg,var(--dark))}
.cb-alt{background:var(--dark-2);border-top:1px solid var(--dark-4);border-bottom:1px solid var(--dark-4)}
.cb-inner{max-width:1100px;margin:0 auto}
.cb-eyebrow{font-size:9px;letter-spacing:.26em;text-transform:uppercase;color:var(--gold);margin-bottom:10px}
.cb-heading{font-family:'Playfair Display',serif;font-size:clamp(26px,5vw,40px);font-weight:500;line-height:1.15;color:var(--text)}
.cb-heading em{font-style:italic;color:var(--gold)}
.cb-sub{font-size:13px;color:var(--text-muted);font-weight:300;line-height:1.75;margin-top:10px}

.cb-services-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1px;background:var(--card-border,var(--dark-4));border:1px solid var(--card-border,var(--dark-4))}
.cb-svc-card{background:var(--card-bg,var(--dark-2));padding:32px 28px;cursor:pointer;transition:background .3s;position:relative;overflow:hidden}
.cb-svc-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(to right,transparent,var(--gold),transparent);transform:scaleX(0);transform-origin:left;transition:transform .4s var(--ease)}
.cb-svc-card:hover{background:var(--dark-3)}.cb-svc-card:hover::after{transform:scaleX(1)}
.cb-svc-cat{font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:var(--text-muted);margin-bottom:16px}
.cb-svc-name{font-family:'Playfair Display',serif;font-size:20px;color:var(--text);margin-bottom:6px}
.cb-svc-dur{font-size:12px;color:var(--text-muted);margin-bottom:24px}
.cb-svc-footer{display:flex;align-items:flex-end;justify-content:space-between}
.cb-svc-price{font-family:'Playfair Display',serif;font-size:24px;color:var(--price-color,var(--gold))}
.cb-svc-book{font-size:10px;color:var(--text-muted);letter-spacing:.1em;text-transform:uppercase;border:1px solid var(--dark-5);padding:7px 14px;border-radius:1px;cursor:pointer;background:transparent;font-family:'DM Sans',sans-serif;transition:all .2s}
.cb-svc-card:hover .cb-svc-book{border-color:var(--gold-border);color:var(--gold-light)}

.cb-reviews-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1px;background:var(--card-border,var(--dark-4));border:1px solid var(--card-border,var(--dark-4))}
.cb-review-card{background:var(--card-bg,var(--dark-2));padding:28px 24px;position:relative;transition:background .3s}
.cb-review-card:hover{background:var(--dark-3)}
.cb-review-quote{position:absolute;top:16px;right:20px;font-family:'Playfair Display',serif;font-size:56px;color:rgba(201,168,76,.05);font-style:italic;line-height:1}
.cb-review-body{font-size:13px;line-height:1.85;color:var(--text-soft);margin:12px 0 20px;font-style:italic;font-family:'Playfair Display',serif}
.cb-review-author{display:flex;align-items:center;gap:10px}
.cb-review-avatar{width:34px;height:34px;border-radius:50%;background:var(--gold-dim);border:1px solid var(--gold-border);display:flex;align-items:center;justify-content:center;font-size:13px;color:var(--gold);font-family:'Playfair Display',serif;flex-shrink:0}
.cb-review-name{font-size:13px;font-weight:500;color:var(--text)}
.cb-review-svc{font-size:10px;color:var(--text-muted);margin-top:2px;letter-spacing:.06em}

.cb-location-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--dark-4);border:1px solid var(--dark-4)}
@media(max-width:640px){.cb-location-grid{grid-template-columns:1fr}}
.cb-location-map{background:linear-gradient(155deg,#141a14,#0e120e,#0b0f0b);min-height:260px;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}
.cb-map-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(201,168,76,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.04) 1px,transparent 1px);background-size:48px 48px}
.cb-map-pin-wrap{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:12px}
.cb-map-pin{width:40px;height:40px;background:var(--gold);border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(201,168,76,.3)}
.cb-map-pin::after{content:'';width:14px;height:14px;background:var(--dark);border-radius:50%;transform:rotate(45deg)}
.cb-map-pulse{position:absolute;border-radius:50%;border:1px solid rgba(201,168,76,.2);animation:mapPulse 2.5s infinite;width:70px;height:70px}
.cb-pulse2{width:110px;height:110px;animation-delay:.5s}
@keyframes mapPulse{0%{opacity:1;transform:scale(.6)}100%{opacity:0;transform:scale(1.4)}}
.cb-location-details{background:var(--dark-2);padding:36px 28px;display:flex;flex-direction:column;gap:22px}
.cb-loc-row{display:flex;gap:14px;align-items:flex-start}
.cb-loc-icon{width:34px;height:34px;border:1px solid rgba(201,168,76,.14);border-radius:2px;display:flex;align-items:center;justify-content:center;color:var(--gold);flex-shrink:0}
.cb-loc-label{font-size:8px;letter-spacing:.18em;text-transform:uppercase;color:var(--text-muted);margin-bottom:5px}
.cb-loc-val{font-size:14px;color:var(--text);line-height:1.55}
.cb-directions-btn{display:inline-flex;align-items:center;background:var(--gold);color:#141210;border:none;padding:12px 22px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;border-radius:1px;text-decoration:none;transition:all .25s}
.cb-directions-btn:hover{background:var(--gold-light)}

.cb-faq-item{border-bottom:1px solid var(--dark-4)}.cb-faq-item:first-child{border-top:1px solid var(--dark-4)}
.cb-faq-q{width:100%;background:transparent;border:none;color:var(--text);font-family:'DM Sans',sans-serif;font-size:14px;text-align:left;padding:18px 0;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:16px;transition:color .2s}
.cb-faq-q:hover{color:var(--gold-light)}
.cb-faq-icon{font-size:18px;color:var(--text-muted);transition:transform .3s;flex-shrink:0}
.cb-faq-icon.open{transform:rotate(45deg);color:var(--gold)}
.cb-faq-a{font-size:14px;color:var(--text-soft);font-weight:300;line-height:1.85;padding-bottom:18px}

.cb-footer{background:var(--dark-2);border-top:1px solid var(--dark-4);padding:36px 24px}
.cb-footer-inner{max-width:1100px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:24px}
.cb-footer-brand{font-family:'Playfair Display',serif;font-size:15px;color:var(--gold)}
.cb-footer-brand span{font-family:'DM Sans',sans-serif;font-size:10px;color:var(--text-muted);display:block;margin-top:4px;letter-spacing:.1em}
.cb-footer-brand a{color:var(--text-muted);text-decoration:none}

.cb-shop-hero{padding:56px 24px 40px;background:var(--dark-2);border-bottom:1px solid var(--dark-4);display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap}
.cb-shop-filters{display:flex;gap:5px;flex-wrap:wrap}
.cb-filter-tab{padding:7px 16px;border:1px solid var(--dark-5);background:transparent;color:var(--text-muted);font-family:'DM Sans',sans-serif;font-size:10px;letter-spacing:.08em;cursor:pointer;border-radius:100px;transition:all .2s;text-transform:uppercase}
.cb-filter-tab.active{border-color:var(--gold);background:var(--gold-dim);color:var(--gold-light)}
.cb-filter-tab:hover{border-color:var(--gold-border);color:var(--gold-light)}

.cb-featured{display:grid;grid-template-columns:1fr 1.4fr;background:var(--dark-2);border-bottom:1px solid var(--dark-4);min-height:300px}
@media(max-width:640px){.cb-featured{grid-template-columns:1fr}.cb-featured-img{height:200px}}
.cb-featured-img{position:relative;overflow:hidden;background:var(--dark-3);display:flex;align-items:center;justify-content:center}
.cb-featured-info{padding:40px 32px;display:flex;flex-direction:column;justify-content:center}
.cb-featured-badge{display:inline-flex;font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold-light);background:var(--gold-dim);border:1px solid var(--gold-border);padding:4px 12px;border-radius:100px;margin-bottom:14px;width:fit-content}
.cb-featured-name{font-family:'Playfair Display',serif;font-size:24px;color:var(--text);margin-bottom:10px}
.cb-featured-quote{font-size:13px;color:var(--text-soft);font-style:italic;border-left:2px solid var(--gold);padding-left:14px;margin-bottom:10px;line-height:1.75;font-family:'Playfair Display',serif}
.cb-featured-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:16px;border-top:1px solid var(--dark-4);margin-top:12px}

.cb-products-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;padding:16px 0}
@media(max-width:360px){.cb-products-grid{grid-template-columns:1fr}}
.cb-product-card{background:var(--dark-2);transition:background .3s}
.cb-product-card:not(.sold-out){cursor:pointer}.cb-product-card:not(.sold-out):hover{background:var(--dark-3)}
.cb-product-card.sold-out{opacity:.55}
.cb-product-img{position:relative;padding-bottom:90%;background:var(--dark-3);overflow:hidden}
.cb-ph{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:40px;color:rgba(201,168,76,.1)}
.cb-badge{position:absolute;top:10px;left:10px;font-size:8px;letter-spacing:.16em;text-transform:uppercase;padding:4px 10px;border-radius:100px}
.cb-badge-so{background:rgba(255,255,255,.04);border:1px solid var(--dark-5);color:var(--text-muted)}
.cb-badge-lim{background:rgba(192,80,74,.12);border:1px solid rgba(192,80,74,.28);color:#e88080}
.cb-badge-sale{position:absolute;top:8px;left:8px;background:var(--nav-bg);color:var(--nav-text);font-size:.6rem;font-weight:700;letter-spacing:.12em;padding:3px 8px;border-radius:2px;text-transform:uppercase;pointer-events:none;z-index:2}
.cb-price-row{display:flex;align-items:center;gap:8px}
.cb-price-original{font-size:.85rem;color:var(--text-muted);text-decoration:line-through;opacity:.6}
.cb-price-discounted{font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:700;color:var(--accent)}
.cb-product-info{padding:18px}
.cb-product-name{font-family:'Playfair Display',serif;font-size:16px;color:var(--text);margin-bottom:6px}
.cb-product-desc{font-size:12px;color:var(--text-muted);font-weight:300;line-height:1.65;margin-bottom:14px}
.cb-product-footer{display:flex;align-items:center;justify-content:space-between;gap:8px}
.cb-product-price{font-family:'Playfair Display',serif;font-size:20px;color:var(--price-color,var(--gold))}
.cb-add-bag{background:transparent;border:1px solid var(--dark-5);color:var(--text-muted);font-family:'DM Sans',sans-serif;font-size:10px;letter-spacing:.1em;text-transform:uppercase;padding:7px 14px;border-radius:1px;cursor:pointer;transition:all .2s;white-space:nowrap}
.cb-add-bag:not(:disabled):hover{border-color:var(--gold);color:var(--gold-light);background:var(--gold-dim)}
.cb-add-bag:disabled{opacity:.4;cursor:not-allowed}

.cb-learn-header{padding:56px 24px 32px;background:var(--dark-2);border-bottom:1px solid var(--dark-4)}
.cb-type-badge{font-size:9px;letter-spacing:.18em;text-transform:uppercase;padding:5px 12px;border-radius:100px}
.cb-type-badge.inperson{background:var(--gold-dim);border:1px solid var(--gold-border);color:var(--gold-light)}
.cb-type-badge.online{background:rgba(86,187,134,.08);border:1px solid rgba(86,187,134,.22);color:#56bb86}
.cb-offering-title{font-family:'Playfair Display',serif;font-size:20px;color:var(--text);margin-top:16px;margin-bottom:10px}
.cb-offering-desc{font-size:13px;color:var(--text-muted);font-weight:300;line-height:1.75;margin-bottom:12px}
.cb-offering-meta{display:flex;gap:18px;margin-bottom:12px;font-size:12px;color:var(--text-soft)}
.cb-offering-price{font-family:'Playfair Display',serif;font-size:24px;color:var(--price-color,var(--gold))}
.cb-offering-item{display:flex;background:var(--dark-2);border-radius:12px;overflow:hidden;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.cb-offering-accent{width:90px;flex-shrink:0;background:var(--accent,var(--gold));display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px 8px}
.cb-offering-num{font-family:'Playfair Display',serif;font-size:2rem;color:#fff;opacity:.9;line-height:1}
.cb-offering-type-tag{font-size:.55rem;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.7);text-align:center;margin-top:6px}
.cb-offering-body{flex:1;padding:16px;display:flex;flex-direction:column;gap:0;min-width:0}
.cb-workshop-item{border-left:4px solid var(--accent,var(--gold));background:var(--dark-2);border-radius:0 12px 12px 0;padding:16px;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.cb-content-gate{display:flex;flex-direction:column;align-items:center;text-align:center;padding:32px 24px;background:var(--dark-2);border-radius:12px;margin:16px 0}
.cb-gate-icon{color:var(--accent,var(--gold));margin-bottom:12px}
.cb-gate-title{font-family:'Playfair Display',serif;font-size:1.1rem;color:var(--text);margin:0 0 8px}
.cb-gate-sub{font-size:.82rem;color:var(--text-muted);margin:0;line-height:1.5}
.od-header{position:sticky;top:0;z-index:10;background:var(--nav-bg);display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.08);flex-shrink:0}
.od-back{color:var(--nav-text);font-size:0.75rem;letter-spacing:.06em;opacity:.8;background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:6px;font-family:'DM Sans',sans-serif}
.od-type-badge{font-size:0.6rem;letter-spacing:.12em;text-transform:uppercase;padding:4px 12px;border-radius:20px;border:1px solid rgba(255,255,255,0.2);color:var(--nav-text);opacity:.8}
.od-header-price{font-family:'Playfair Display',serif;color:var(--accent);font-size:1rem}
.od-slider{height:260px;position:relative;overflow:hidden;background:var(--nav-bg);flex-shrink:0}
.od-slides{display:flex;height:100%;transition:transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)}
.od-slide{min-width:100%;height:100%;object-fit:cover;flex-shrink:0;cursor:zoom-in}
.od-placeholder{min-width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2.5rem;color:var(--accent);opacity:.3}
.od-dots{position:absolute;bottom:12px;left:50%;transform:translateX(-50%);display:flex;gap:5px;pointer-events:none}
.od-dot{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,0.4);transition:all .2s}
.od-dot.active{background:#fff;width:14px;border-radius:3px}
.od-counter{position:absolute;top:12px;right:12px;font-size:0.6rem;letter-spacing:.1em;color:rgba(255,255,255,0.8);background:rgba(0,0,0,0.35);padding:3px 9px;border-radius:20px;font-family:'DM Sans',sans-serif}
.od-img-lightbox{position:fixed;inset:0;z-index:999;background:rgba(0,0,0,.96);display:flex;align-items:center;justify-content:center}
.od-img-lightbox img{max-width:95vw;max-height:90vh;object-fit:contain}
.od-content{padding:20px 20px 40px}
.od-title{font-family:'Playfair Display',serif;font-size:1.8rem;font-weight:700;color:var(--text);line-height:1.2;margin-bottom:16px}
.od-cta-row{display:flex;align-items:center;gap:12px;margin-bottom:16px}
.od-price-large{font-family:'Playfair Display',serif;font-size:1.5rem;color:var(--accent);flex-shrink:0;font-style:italic}
.od-enroll-btn{flex:1;background:var(--nav-bg);color:var(--nav-text);border:none;border-radius:8px;padding:14px;font-family:'DM Sans',sans-serif;font-size:0.72rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:opacity .2s}
.od-enroll-btn:disabled{opacity:.4;cursor:default}
.od-type-row{display:flex;align-items:center;gap:10px;margin-bottom:20px}
.od-event-card{background:rgba(0,0,0,0.04);border-radius:12px;padding:16px;margin-bottom:20px;border:1px solid var(--dark-4)}
.od-event-label{font-size:0.58rem;letter-spacing:.15em;text-transform:uppercase;color:var(--accent);font-weight:600;margin-bottom:14px}
.od-event-row{display:flex;align-items:flex-start;gap:10px;margin-bottom:12px}
.od-event-row:last-of-type{margin-bottom:0}
.od-event-icon{width:28px;height:28px;border-radius:6px;background:rgba(201,168,76,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.od-event-info-label{font-size:0.62rem;letter-spacing:.06em;text-transform:uppercase;color:var(--text-muted)}
.od-event-info-value{font-size:0.85rem;color:var(--text);font-weight:500;margin-top:2px}
.od-spots-section{margin-top:14px;padding-top:14px;border-top:1px solid var(--dark-4)}
.od-spots-row{display:flex;justify-content:space-between;margin-bottom:6px}
.od-spots-text{font-size:0.75rem;color:var(--text-muted)}
.od-spots-count{font-size:0.75rem;font-weight:600;color:var(--text)}
.od-spots-bar{height:4px;background:var(--dark-4);border-radius:2px;overflow:hidden}
.od-spots-fill{height:100%;background:var(--accent);border-radius:2px;transition:width .4s ease}
.od-spots-fill.urgent{background:#C0392B}
.od-section-label{font-size:0.58rem;letter-spacing:.15em;text-transform:uppercase;color:var(--accent);font-weight:600;margin-bottom:10px}
.od-description{font-size:0.88rem;line-height:1.75;color:var(--text-muted);margin-bottom:24px}
.od-footer{margin-top:32px;background:var(--nav-bg);padding:28px 20px;text-align:center;border-radius:12px}
.od-footer-powered{font-size:0.55rem;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,0.35);margin-bottom:6px}
.od-footer-brand{font-family:'Playfair Display',serif;font-size:1.15rem;color:var(--accent);cursor:pointer;letter-spacing:.06em;display:block;margin-top:4px}
.cb-enroll-btn{background:var(--btn-bg,var(--gold));color:var(--btn-text,#141210);border:none;padding:11px 20px;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;border-radius:1px;transition:all .25s;white-space:nowrap}
.cb-enroll-btn:hover{background:var(--gold-light)}

.cb-overlay{position:fixed;inset:0;z-index:900;background:var(--body-bg,#FAFAF8);display:flex;flex-direction:column;transform:translateY(100%);transition:transform 0.38s cubic-bezier(0.32,0.72,0,1);will-change:transform;overflow:hidden}
.cb-overlay.open{transform:translateY(0)}
.cb-ov-header{display:flex;align-items:center;justify-content:space-between;padding:0 20px;height:58px;border-bottom:1px solid var(--dark-4);background:var(--dark-2);flex-shrink:0}
.cb-ov-back{background:transparent;border:none;color:var(--text-muted);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:12px;padding:8px 0;transition:color .2s;letter-spacing:.04em;min-width:56px}
.cb-ov-back:hover{color:var(--text)}
.cb-dots{display:flex;align-items:center;justify-content:center;gap:7px;padding:14px 0;flex-shrink:0}
.cb-dot{width:5px;height:5px;border-radius:50%;background:var(--dark-5);transition:all .3s}
.cb-dot.active{width:18px;border-radius:3px;background:var(--gold)}.cb-dot.done{background:rgba(201,168,76,.35)}
.cb-ov-pages{flex:1;overflow:hidden;position:relative}
.cb-ov-inner{display:flex;height:100%;transition:transform .38s cubic-bezier(.25,.46,.45,.94)!important}
.cb-ov-page{min-width:100%;height:100%;overflow-y:auto;-webkit-overflow-scrolling:touch;display:flex;flex-direction:column}
.cb-ov-content{flex:1;padding:28px 20px 16px}
.cb-ov-footer{padding:14px 20px 28px;background:var(--dark);border-top:1px solid var(--dark-4);flex-shrink:0}
.cb-policy-line{border-left:2px solid var(--accent,var(--gold));padding:6px 0 6px 12px;margin:8px 0;font-size:.85rem;color:var(--text-muted);line-height:1.6}
.cb-policy-agree{display:flex;align-items:flex-start;gap:10px;margin-top:20px;cursor:pointer;font-size:.85rem;color:var(--text-muted);line-height:1.5}
.cb-policy-agree input[type="checkbox"]{margin-top:2px;accent-color:var(--accent,var(--gold));width:16px;height:16px;flex-shrink:0;cursor:pointer}
.cb-page-eye{font-size:8px;letter-spacing:.26em;text-transform:uppercase;color:var(--gold);margin-bottom:8px}
.cb-page-title{font-family:'Playfair Display',serif;font-size:22px;color:var(--text);line-height:1.2;margin-bottom:24px}

.cb-addon-chip{padding:6px 14px;border:1px solid var(--dark-5);border-radius:100px;font-size:11px;color:var(--text-soft);cursor:pointer;transition:all .2s}
.cb-addon-chip.on{border-color:var(--gold);background:var(--gold-dim);color:var(--gold-light)}

.cb-visit-cards{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px}
.cb-visit-card{border:1px solid var(--dark-5);background:var(--dark-2);padding:18px 14px;cursor:pointer;transition:all .25s;border-radius:1px;position:relative}
.cb-visit-card.selected{border-color:var(--gold);background:var(--dark-3)}
.cb-visit-card.selected::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:var(--gold)}
.cb-vc-radio{width:14px;height:14px;border-radius:50%;border:1px solid var(--dark-5);margin-bottom:12px;transition:all .2s}
.cb-visit-card.selected .cb-vc-radio{border-color:var(--gold);background:var(--gold)}
.cb-vc-title{font-family:'Playfair Display',serif;font-size:15px;color:var(--text);margin-bottom:6px}
.cb-vc-sub{font-size:11px;color:var(--text-muted);font-weight:300;line-height:1.6;margin-bottom:10px}
.cb-vc-fee{font-size:11px;color:var(--text-soft)}.cb-vc-fee-amt{font-family:'Playfair Display',serif;color:var(--gold);font-size:13px}

.cb-input{width:100%;background:var(--dark-3);border:1px solid var(--dark-4);color:var(--text);padding:11px 14px;font-family:'DM Sans',sans-serif;font-size:14px;border-radius:1px;outline:none;transition:border-color .2s;margin-bottom:8px;display:block;-webkit-appearance:none}
.cb-input:focus{border-color:var(--gold-border)}.cb-input.err{border-color:var(--error)}.cb-input::placeholder{color:var(--text-muted)}
.cb-select{cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%239A8E7E' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center}
.cb-select option{background:#111;color:var(--text)}
.cb-err{font-size:11px;color:var(--error);margin-bottom:6px;margin-top:-4px}

.cb-cal{background:var(--dark-2);border:1px solid var(--dark-4);border-radius:1px;overflow:hidden;margin-bottom:14px}
.cb-cal-head{padding:14px 16px;border-bottom:1px solid var(--dark-4);display:flex;align-items:center;justify-content:space-between}
.cb-cal-month{font-family:'Playfair Display',serif;font-size:15px;color:var(--text)}
.cb-cal-nav{width:28px;height:28px;border:1px solid var(--dark-5);background:transparent;color:var(--text-soft);cursor:pointer;border-radius:1px;font-size:14px;transition:all .2s}
.cb-cal-nav:disabled{opacity:.2;cursor:default}.cb-cal-nav:not(:disabled):hover{border-color:var(--gold-border);color:var(--gold)}
.cb-cal-dnames{display:grid;grid-template-columns:repeat(7,1fr);padding:10px 14px 4px}
.cb-cal-dname{text-align:center;font-size:9px;color:var(--text-muted);letter-spacing:.1em;text-transform:uppercase}
.cb-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);padding:4px 14px 14px;gap:2px}
.cb-cal-day{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:12px;border-radius:2px;cursor:default;transition:all .15s;color:var(--dark-5);position:relative;user-select:none}
.cb-cal-day.avail{color:var(--text);cursor:pointer}
.cb-cal-day.avail::after{content:'';position:absolute;bottom:2px;left:50%;transform:translateX(-50%);width:3px;height:3px;border-radius:50%;background:var(--gold)}
.cb-cal-day.avail:hover{background:var(--gold-dim);color:var(--gold-light)}
.cb-cal-day.today{border:1px solid rgba(201,168,76,.22);color:var(--gold-light)}
.cb-cal-day.sel{background:var(--gold)!important;color:#141210!important;font-weight:600;cursor:pointer}.cb-cal-day.sel::after{display:none}
.cb-time-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.cb-time-slot{padding:10px 6px;text-align:center;border:1px solid var(--dark-5);background:var(--dark-2);color:var(--text-soft);font-size:12px;cursor:pointer;border-radius:1px;transition:all .15s}
.cb-time-slot.booked{color:var(--dark-5);cursor:not-allowed;background:var(--dark-3);border-color:transparent;text-decoration:line-through}
.cb-time-slot:not(.booked):hover{border-color:var(--gold-border);color:var(--gold-light);background:var(--gold-dim)}
.cb-time-slot.sel{border-color:var(--gold);background:var(--gold-dim);color:var(--gold-light)}

.cb-recap{border:1px solid var(--dark-4);background:var(--dark-2);margin-bottom:18px;overflow:hidden}
.cb-recap-header{padding:12px 18px;border-bottom:1px solid var(--dark-4);display:flex;align-items:center;justify-content:space-between}
.cb-recap-row{display:flex;justify-content:space-between;align-items:flex-start;padding:9px 18px;border-bottom:1px solid rgba(255,255,255,.04);gap:14px;font-size:13px}
.cb-recap-row:last-child{border-bottom:none}
.cb-recap-key{color:var(--text-muted);flex-shrink:0;font-size:12px}.cb-recap-val{color:var(--text-soft);text-align:right;font-weight:400}

.cb-portfolio-overlay{position:fixed;inset:0;background:var(--dark);z-index:1000;transform:translateX(100%);transition:transform .42s cubic-bezier(.25,.46,.45,.94)!important;overflow-y:auto;display:flex;flex-direction:column}
.cb-portfolio-overlay.open{transform:translateX(0)}
.cb-portfolio-nav{position:sticky;top:0;padding:0 20px;height:62px;display:flex;align-items:center;justify-content:space-between;background:rgba(10,5,2,.97);border-bottom:1px solid var(--dark-4);backdrop-filter:blur(20px);z-index:10;flex-shrink:0}

.cb-cart-drawer{position:fixed;top:0;right:0;width:340px;max-width:100vw;height:100vh;background:var(--dark-2);border-left:1px solid var(--dark-4);z-index:800;transform:translateX(100%);transition:transform .38s cubic-bezier(.25,.46,.45,.94)!important;display:flex;flex-direction:column}
.cb-cart-drawer.open{transform:translateX(0)}
.cb-qty-btn{width:22px;height:22px;border:1px solid var(--dark-5);background:transparent;color:var(--text-muted);cursor:pointer;border-radius:1px;font-size:14px;display:flex;align-items:center;justify-content:center;transition:all .15s}
.cb-qty-btn:hover{border-color:var(--gold-border);color:var(--gold)}

.od-stock-badge{display:inline-flex;align-items:center;gap:5px;font-size:0.65rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;padding:4px 12px;border-radius:20px;margin-bottom:20px}
.od-stock-in{background:rgba(26,120,80,0.1);color:#1A7850}
.od-stock-low{background:rgba(192,57,43,0.1);color:#C0392B}
.od-stock-out{background:rgba(0,0,0,0.06);color:var(--text-muted)}
.od-price-original{font-size:0.9rem;color:var(--text-muted);text-decoration:line-through;margin-right:6px;display:block;margin-bottom:2px}

.co-section-label{font-size:0.6rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--accent);font-weight:600;margin:20px 0 10px}
.co-field{width:100%;padding:12px 14px;border:1px solid var(--dark-4);border-radius:8px;font-family:'DM Sans',sans-serif;font-size:0.88rem;color:var(--text);background:#fff;margin-bottom:10px;outline:none;transition:border-color 0.2s;box-sizing:border-box;-webkit-appearance:none;display:block}
.co-field:focus{border-color:var(--accent)}
.co-field-row{display:flex;gap:10px}
.co-field-row .co-field{flex:1;min-width:0}
.co-suggestions{background:#fff;border:1px solid var(--dark-4);border-radius:8px;margin-top:-8px;margin-bottom:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08)}
.co-suggestion{padding:10px 14px;font-size:0.82rem;color:var(--text);cursor:pointer;border-bottom:1px solid var(--dark-4);line-height:1.4}
.co-suggestion:last-child{border-bottom:none}
.co-suggestion:active,.co-suggestion:hover{background:var(--dark-3)}
.co-summary-card{background:var(--dark-2);border-radius:10px;padding:16px;margin-bottom:20px}
.co-summary-row{display:flex;justify-content:space-between;font-size:0.82rem;color:var(--text-muted);margin-bottom:6px}
.co-summary-row:last-child{margin-bottom:0}
.co-summary-total{font-size:1rem;font-weight:700;color:var(--accent);border-top:1px solid var(--dark-4);padding-top:10px;margin-top:10px}
.co-card-element{border:1px solid var(--dark-4);border-radius:8px;padding:14px;background:#fff;margin-bottom:16px}
.co-pay-btn{width:100%;background:var(--nav-bg);color:var(--nav-text);border:none;border-radius:8px;padding:16px;font-family:'DM Sans',sans-serif;font-size:0.78rem;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer;margin-bottom:12px;transition:opacity 0.2s}
.co-pay-btn:disabled{opacity:0.4;cursor:default}
.co-secure{text-align:center;font-size:0.7rem;color:var(--text-muted);letter-spacing:0.05em}
`
