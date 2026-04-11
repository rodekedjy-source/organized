import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const T = {
  gold:       '#C9A84C',
  goldHover:  '#b5893a',
  goldFaint:  'rgba(201,168,76,.10)',
  ink:        '#111110',
  inkSoft:    '#2a2925',
  cream:      '#f7f5f0',
  creamDark:  '#ede9e1',
  white:      '#ffffff',
  muted:      '#7a7672',
  border:     'rgba(0,0,0,.08)',
  borderDark: 'rgba(0,0,0,.13)',
  success:    '#2d7d4f',
  successBg:  'rgba(45,125,79,.10)',
  danger:     '#c0392b',
  dangerBg:   'rgba(192,57,43,.10)',
  pending:    '#92670c',
  pendingBg:  'rgba(146,103,12,.10)',
  shadow:     '0 2px 16px rgba(0,0,0,.06)',
  shadowMd:   '0 4px 24px rgba(0,0,0,.10)',
  radius:     '12px',
  radiusSm:   '8px',
}

/* ─────────────────────────────────────────────
   SHARED STYLES
───────────────────────────────────────────── */
const s = {
  // Layout
  shell:       { display:'flex', minHeight:'100vh', background:T.cream, fontFamily:"'DM Sans', system-ui, sans-serif" },
  sidebar:     { width:240, background:T.ink, display:'flex', flexDirection:'column', flexShrink:0, position:'sticky', top:0, height:'100vh', overflowY:'auto' },
  main:        { flex:1, overflowY:'auto', minWidth:0 },

  // Topbar
  topbar:      { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 1.75rem', height:60, background:T.white, borderBottom:`1px solid ${T.border}`, position:'sticky', top:0, zIndex:10 },
  topbarTitle: { fontFamily:"'Playfair Display', Georgia, serif", fontSize:'1.15rem', fontWeight:700, color:T.ink, letterSpacing:'-0.01em' },
  topbarDot:   { color:T.gold },
  topbarRight: { display:'flex', alignItems:'center', gap:'1rem' },
  avatar:      { width:34, height:34, borderRadius:'50%', background:T.goldFaint, border:`2px solid ${T.gold}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.8rem', fontWeight:700, color:T.gold, cursor:'pointer' },

  // Sidebar
  sidebarTop:  { padding:'1.5rem 1.4rem 1rem', borderBottom:`1px solid rgba(255,255,255,.06)` },
  sidebarLogo: { fontFamily:"'Playfair Display', Georgia, serif", fontSize:'1.1rem', fontWeight:700, color:T.white, letterSpacing:'-0.01em' },
  sidebarDot:  { color:T.gold },
  sidebarSub:  { fontSize:'.7rem', color:'rgba(255,255,255,.35)', marginTop:2, letterSpacing:'.04em' },
  sidebarNav:  { flex:1, padding:'1rem 0' },
  navSection:  { padding:'.3rem 1.4rem .15rem', fontSize:'.62rem', fontWeight:700, letterSpacing:'.12em', color:'rgba(255,255,255,.25)', textTransform:'uppercase', marginTop:'1rem' },
  navItem:     (active) => ({
    display:'flex', alignItems:'center', gap:'.7rem', padding:'.65rem 1.4rem',
    cursor:'pointer', fontSize:'.83rem', fontWeight:500, transition:'all .18s',
    color: active ? T.gold : 'rgba(255,255,255,.55)',
    background: active ? T.goldFaint : 'transparent',
    borderLeft: `3px solid ${active ? T.gold : 'transparent'}`,
    borderRadius: '0 6px 6px 0',
  }),
  navIcon:     { fontSize:'.95rem', width:18, textAlign:'center', flexShrink:0 },
  navBadge:    { marginLeft:'auto', background:T.gold, color:T.ink, fontSize:'.62rem', fontWeight:800, borderRadius:20, padding:'2px 7px', minWidth:18, textAlign:'center' },
  sidebarFooter: { padding:'1rem 1.4rem', borderTop:`1px solid rgba(255,255,255,.06)` },
  sidebarPlan: { background:'rgba(255,255,255,.04)', borderRadius:T.radiusSm, padding:'.75rem', fontSize:'.75rem', color:'rgba(255,255,255,.4)' },
  planBar:     { height:3, background:'rgba(255,255,255,.1)', borderRadius:99, marginTop:8 },
  planFill:    { height:3, width:'62%', background:T.gold, borderRadius:99 },

  // Content
  content:     { padding:'2rem 2rem', maxWidth:960, margin:'0 auto' },
  pageHead:    { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem', gap:'1rem', flexWrap:'wrap' },
  pageTitle:   { fontFamily:"'Playfair Display', Georgia, serif", fontSize:'2rem', fontWeight:700, color:T.ink, lineHeight:1.1 },
  pageSub:     { color:T.muted, fontSize:'.83rem', marginTop:4 },

  // Stat cards (clickable)
  statGrid:    { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(190px, 1fr))', gap:'1rem', marginBottom:'1.75rem' },
  statCard:    (hovered) => ({
    background:T.white, borderRadius:T.radius, padding:'1.4rem',
    border:`1px solid ${hovered ? T.gold : T.border}`,
    boxShadow: hovered ? `0 8px 32px rgba(201,168,76,.15)` : T.shadow,
    cursor:'pointer', transition:'all .22s cubic-bezier(.34,1.56,.64,1)',
    transform: hovered ? 'translateY(-3px)' : 'none',
    position:'relative', overflow:'hidden',
  }),
  statArrow:   (hovered) => ({
    position:'absolute', top:12, right:14, fontSize:'.9rem',
    color:T.gold, opacity: hovered ? 1 : 0,
    transform: hovered ? 'translateX(0)' : 'translateX(-6px)',
    transition:'all .2s',
  }),
  statIcon:    { fontSize:'1.3rem', marginBottom:'.6rem', display:'block' },
  statValue:   { fontSize:'1.8rem', fontWeight:800, color:T.ink, letterSpacing:'-0.03em', lineHeight:1 },
  statLabel:   { fontSize:'.75rem', color:T.muted, marginTop:4, fontWeight:500, textTransform:'uppercase', letterSpacing:'.06em' },
  statChange:  (pos) => ({ fontSize:'.75rem', color: pos ? T.success : T.danger, marginTop:6, fontWeight:600 }),

  // Cards
  card:        { background:T.white, borderRadius:T.radius, border:`1px solid ${T.border}`, boxShadow:T.shadow, overflow:'hidden', marginBottom:'1.25rem' },
  cardHead:    { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1.1rem 1.4rem', borderBottom:`1px solid ${T.border}` },
  cardTitle:   { fontSize:'.88rem', fontWeight:700, color:T.ink, letterSpacing:'-.01em' },
  cardPad:     { padding:'1.4rem' },

  // Buttons
  btnPrimary:  { background:T.gold, color:T.ink, border:'none', borderRadius:T.radiusSm, padding:'.6rem 1.3rem', fontSize:'.83rem', fontWeight:700, cursor:'pointer', letterSpacing:'.02em', transition:'background .18s' },
  btnOutline:  { background:'transparent', color:T.ink, border:`1px solid ${T.borderDark}`, borderRadius:T.radiusSm, padding:'.55rem 1.1rem', fontSize:'.82rem', fontWeight:600, cursor:'pointer', transition:'all .18s' },
  btnDanger:   { background:T.dangerBg, color:T.danger, border:`1px solid ${T.danger}20`, borderRadius:T.radiusSm, padding:'.4rem .85rem', fontSize:'.78rem', fontWeight:600, cursor:'pointer', transition:'all .18s' },
  btnSuccess:  { background:T.successBg, color:T.success, border:`1px solid ${T.success}20`, borderRadius:T.radiusSm, padding:'.4rem .85rem', fontSize:'.78rem', fontWeight:600, cursor:'pointer', transition:'all .18s' },
  btnXs:       { padding:'.3rem .7rem', borderRadius:6, fontSize:'.75rem', fontWeight:600, cursor:'pointer', border:'none', transition:'all .18s' },

  // Badges
  badgeConfirmed: { background:T.successBg, color:T.success, fontSize:'.7rem', fontWeight:700, borderRadius:99, padding:'3px 9px', letterSpacing:'.03em' },
  badgePending:   { background:T.pendingBg, color:T.pending, fontSize:'.7rem', fontWeight:700, borderRadius:99, padding:'3px 9px', letterSpacing:'.03em' },
  badgeDanger:    { background:T.dangerBg, color:T.danger, fontSize:'.7rem', fontWeight:700, borderRadius:99, padding:'3px 9px', letterSpacing:'.03em' },

  // Table
  tbl:         { width:'100%', borderCollapse:'collapse', fontSize:'.83rem' },
  th:          { padding:'.65rem 1rem', textAlign:'left', fontSize:'.7rem', fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'.07em', borderBottom:`1px solid ${T.border}`, whiteSpace:'nowrap' },
  td:          { padding:'.8rem 1rem', borderBottom:`1px solid ${T.border}`, color:T.ink, verticalAlign:'middle' },

  // Form
  formGroup:   { marginBottom:'1rem' },
  label:       { display:'block', fontSize:'.78rem', fontWeight:700, color:T.ink, marginBottom:5, letterSpacing:'.02em' },
  input:       { width:'100%', padding:'.65rem .85rem', border:`1px solid ${T.borderDark}`, borderRadius:T.radiusSm, fontSize:'.85rem', color:T.ink, background:T.white, outline:'none', boxSizing:'border-box', transition:'border .18s' },
  textarea:    { width:'100%', padding:'.65rem .85rem', border:`1px solid ${T.borderDark}`, borderRadius:T.radiusSm, fontSize:'.85rem', color:T.ink, background:T.white, outline:'none', resize:'vertical', minHeight:80, boxSizing:'border-box', fontFamily:'inherit' },

  // Empty state
  empty:       { padding:'3.5rem 2rem', textAlign:'center', color:T.muted },
  emptyIcon:   { fontSize:'2.5rem', marginBottom:'1rem', display:'block' },
  emptyTitle:  { fontSize:'.95rem', fontWeight:700, color:T.ink, marginBottom:6 },
  emptyText:   { fontSize:'.82rem', lineHeight:1.6, maxWidth:320, margin:'0 auto 1.25rem' },

  // Appointment card (mobile)
  apptCard:    (status) => ({
    background:T.white, borderRadius:T.radius, border:`1px solid ${status==='confirmed' ? T.success+'30' : T.border}`,
    padding:'1rem 1.1rem', marginBottom:'.75rem',
    borderLeft:`3px solid ${status==='confirmed' ? T.success : status==='pending' ? T.gold : T.muted}`,
  }),

  // Divider
  divider:     { height:1, background:T.border, margin:'1.25rem 0' },

  // Loading skeleton
  skeleton:    { background:`linear-gradient(90deg, ${T.creamDark} 25%, ${T.cream} 50%, ${T.creamDark} 75%)`, backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite', borderRadius:6, height:20, marginBottom:8 },

  // Toast
  toast:       (show) => ({
    position:'fixed', bottom:24, left:'50%', transform:`translateX(-50%) translateY(${show?0:8}px)`,
    background:T.ink, color:T.white, padding:'.7rem 1.4rem', borderRadius:99,
    fontSize:'.83rem', fontWeight:500, opacity: show ? 1 : 0,
    transition:'all .28s cubic-bezier(.34,1.56,.64,1)', zIndex:9999, pointerEvents:'none',
    boxShadow:T.shadowMd, letterSpacing:'.02em', whiteSpace:'nowrap',
  }),

  // Mobile menu overlay
  overlay:     { position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:50, backdropFilter:'blur(4px)' },
  drawer:      (open) => ({
    position:'fixed', top:0, left:0, height:'100%', width:260,
    background:T.ink, zIndex:51, transform:`translateX(${open?0:-100}%)`,
    transition:'transform .32s cubic-bezier(.32,.72,0,1)', boxShadow:T.shadowMd,
    display:'flex', flexDirection:'column', overflowY:'auto',
  }),
}

/* ─────────────────────────────────────────────
   TOAST
───────────────────────────────────────────── */
function Toast({ msg }) {
  return <div style={s.toast(!!msg)}>{msg}</div>
}

/* ─────────────────────────────────────────────
   LOADING SKELETON
───────────────────────────────────────────── */
function Skeleton({ lines = 3 }) {
  return (
    <div style={{ padding:'1.4rem' }}>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} style={{ ...s.skeleton, width: i === 0 ? '60%' : i === lines - 1 ? '40%' : '100%', opacity: 1 - i * 0.15 }} />
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────
   NAV CONFIG
───────────────────────────────────────────── */
const NAV = [
  { key:'overview',     label:'Overview',     icon:'◻', section:'main' },
  { key:'appointments', label:'Appointments', icon:'◷', section:'main' },
  { key:'clients',      label:'Clients',      icon:'◉', section:'main' },
  { key:'services',     label:'Services',     icon:'✦', section:'manage' },
  { key:'products',     label:'Products',     icon:'◈', section:'manage' },
  { key:'formations',   label:'Formations',   icon:'◎', section:'manage' },
  { key:'settings',     label:'Settings',     icon:'◌', section:'account' },
]

/* ─────────────────────────────────────────────
   SIDEBAR CONTENT (shared between desktop + drawer)
───────────────────────────────────────────── */
function SidebarContent({ page, setPage, workspace, pendingCount, onLogout, onClose }) {
  const sections = {
    main:    NAV.filter(n => n.section === 'main'),
    manage:  NAV.filter(n => n.section === 'manage'),
    account: NAV.filter(n => n.section === 'account'),
  }

  function go(key) {
    setPage(key)
    onClose?.()
  }

  return (
    <>
      <div style={s.sidebarTop}>
        <div style={s.sidebarLogo}>Organized<span style={s.sidebarDot}>.</span></div>
        <div style={s.sidebarSub}>{workspace?.business_name || 'My business'}</div>
      </div>

      <nav style={s.sidebarNav}>
        {/* Main */}
        <div style={s.navSection}>Main</div>
        {sections.main.map(n => (
          <div key={n.key} style={s.navItem(page === n.key)} onClick={() => go(n.key)}>
            <span style={s.navIcon}>{n.icon}</span>
            {n.label}
            {n.key === 'appointments' && pendingCount > 0 && (
              <span style={s.navBadge}>{pendingCount}</span>
            )}
          </div>
        ))}

        {/* Manage */}
        <div style={s.navSection}>Manage</div>
        {sections.manage.map(n => (
          <div key={n.key} style={s.navItem(page === n.key)} onClick={() => go(n.key)}>
            <span style={s.navIcon}>{n.icon}</span>
            {n.label}
          </div>
        ))}

        {/* Account */}
        <div style={s.navSection}>Account</div>
        {sections.account.map(n => (
          <div key={n.key} style={s.navItem(page === n.key)} onClick={() => go(n.key)}>
            <span style={s.navIcon}>{n.icon}</span>
            {n.label}
          </div>
        ))}

        {/* Business page link */}
        <div
          style={{ ...s.navItem(false), marginTop:4 }}
          onClick={() => {
            if (workspace?.slug) window.open(`/${workspace.slug}`, '_blank')
            onClose?.()
          }}
        >
          <span style={s.navIcon}>↗</span>
          My booking page
        </div>
      </nav>

      <div style={s.sidebarFooter}>
        <div style={s.sidebarPlan}>
          <strong style={{ color:'rgba(255,255,255,.7)', fontSize:'.78rem' }}>Pro Plan</strong>
          <div style={{ marginTop:2 }}>62% quota used</div>
          <div style={s.planBar}><div style={s.planFill} /></div>
        </div>
        <div
          style={{ display:'flex', alignItems:'center', gap:'.6rem', padding:'.85rem 0 0', cursor:'pointer', color:'rgba(255,255,255,.35)', fontSize:'.8rem', transition:'color .18s' }}
          onClick={onLogout}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.35)'}
        >
          <span>⎋</span> Log out
        </div>
      </div>
    </>
  )
}

/* ─────────────────────────────────────────────
   OVERVIEW
───────────────────────────────────────────── */
function Overview({ workspace, setPage, notify }) {
  const [stats, setStats]   = useState(null)
  const [todayAppts, setTodayAppts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!workspace?.id) return
    const today = new Date().toISOString().split('T')[0]

    const [apptRes, prodRes, enrollRes] = await Promise.all([
      supabase.from('appointments').select('*').eq('workspace_id', workspace.id),
      supabase.from('products').select('id').eq('workspace_id', workspace.id),
      supabase.from('enrollments').select('id').eq('workspace_id', workspace.id),
    ])

    const all    = apptRes.data || []
    const confirmed = all.filter(a => a.status === 'confirmed')
    const pending   = all.filter(a => a.status === 'pending')

    // Revenue only from confirmed appointments
    const revenue = confirmed.reduce((s, x) => s + Number(x.amount || 0), 0)

    // Month revenue
    const thisMonth = new Date().toISOString().slice(0, 7)
    const monthRevenue = confirmed
      .filter(a => a.scheduled_at?.startsWith(thisMonth))
      .reduce((s, x) => s + Number(x.amount || 0), 0)

    setStats({
      revenue,
      monthRevenue,
      appointments: all.length,
      pending: pending.length,
      products: (prodRes.data || []).length,
      students: (enrollRes.data || []).length,
    })

    setTodayAppts(all.filter(a => a.scheduled_at?.startsWith(today)))
    setLoading(false)
  }, [workspace?.id])

  useEffect(() => { fetchData() }, [fetchData])

  // Realtime
  useEffect(() => {
    if (!workspace?.id) return
    const ch = supabase.channel('overview-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `workspace_id=eq.${workspace.id}` }, fetchData)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [workspace?.id, fetchData])

  const CARDS = stats ? [
    { key:'appointments', icon:'◷', label:'Total Bookings',      value: stats.appointments,          sub: `${stats.pending} pending`, subPos: stats.pending === 0, format: 'num' },
    { key:'revenue',      icon:'◈', label:'Confirmed Revenue',   value: `$${stats.revenue.toFixed(2)}`, sub: `$${stats.monthRevenue.toFixed(2)} this month`, subPos: true, format: 'str' },
    { key:'products',     icon:'◈', label:'Products',            value: stats.products,              sub: 'In your shop',           subPos: true, format: 'num' },
    { key:'formations',   icon:'◎', label:'Students Enrolled',   value: stats.students,              sub: 'Total enrollments',      subPos: true, format: 'num' },
  ] : []

  const [hovered, setHovered] = useState(null)

  return (
    <>
      <div style={s.pageHead}>
        <div>
          <div style={s.pageTitle}>Overview</div>
          <div style={s.pageSub}>{new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}</div>
        </div>
        <button
          style={s.btnPrimary}
          onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/${workspace?.slug}`); notify('Booking link copied!') }}
        >
          Copy booking link
        </button>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div style={s.statGrid}>
          {[1,2,3,4].map(i => <div key={i} style={{ ...s.card, padding:'1.4rem' }}><Skeleton lines={2} /></div>)}
        </div>
      ) : (
        <div style={s.statGrid}>
          {CARDS.map(c => (
            <div
              key={c.key}
              style={s.statCard(hovered === c.key)}
              onMouseEnter={() => setHovered(c.key)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setPage(c.key)}
            >
              <span style={s.statArrow(hovered === c.key)}>→</span>
              <span style={s.statIcon}>{c.icon}</span>
              <div style={s.statValue}>{c.value}</div>
              <div style={s.statLabel}>{c.label}</div>
              <div style={s.statChange(c.subPos)}>{c.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Today's schedule */}
      <div style={s.card}>
        <div style={s.cardHead}>
          <span style={s.cardTitle}>Today's schedule</span>
          <span style={s.badgePending}>{todayAppts.length} appointments</span>
        </div>

        {loading ? <Skeleton lines={4} /> : todayAppts.length === 0 ? (
          <div style={s.empty}>
            <span style={s.emptyIcon}>◷</span>
            <div style={s.emptyTitle}>No appointments today</div>
            <div style={s.emptyText}>Share your booking link to start receiving bookings from clients.</div>
            <button
              style={s.btnPrimary}
              onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/${workspace?.slug}`); notify('Booking link copied!') }}
            >
              Copy booking link
            </button>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={s.tbl}>
              <thead>
                <tr>
                  <th style={s.th}>Client</th>
                  <th style={s.th}>Service</th>
                  <th style={s.th}>Time</th>
                  <th style={s.th}>Amount</th>
                  <th style={s.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {todayAppts.sort((a,b) => new Date(a.scheduled_at) - new Date(b.scheduled_at)).map(a => (
                  <tr key={a.id}>
                    <td style={{ ...s.td, fontWeight:600 }}>{a.client_name}</td>
                    <td style={s.td}>{a.notes || '—'}</td>
                    <td style={s.td}>{new Date(a.scheduled_at).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })}</td>
                    <td style={{ ...s.td, color:T.gold, fontWeight:700 }}>${Number(a.amount || 0).toFixed(2)}</td>
                    <td style={s.td}>
                      <span style={a.status === 'confirmed' ? s.badgeConfirmed : s.badgePending}>{a.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick link */}
      <div style={{ ...s.card, padding:'1.25rem 1.4rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <div style={{ fontSize:'.85rem', fontWeight:700, color:T.ink }}>Your booking page is live</div>
          <div style={{ fontSize:'.78rem', color:T.muted, marginTop:2 }}>
            {window.location.origin}/{workspace?.slug}
          </div>
        </div>
        <div style={{ display:'flex', gap:'.7rem' }}>
          <button style={s.btnOutline} onClick={() => window.open(`/${workspace?.slug}`, '_blank')}>View page</button>
          <button style={s.btnPrimary} onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/${workspace?.slug}`); notify('Link copied!') }}>Copy link</button>
        </div>
      </div>
    </>
  )
}

/* ─────────────────────────────────────────────
   APPOINTMENTS
───────────────────────────────────────────── */
function Appointments({ workspace, notify }) {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]           = useState(true)
  const [filter, setFilter]             = useState('all') // all | pending | confirmed

  const fetchData = useCallback(async () => {
    if (!workspace?.id) return
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .eq('workspace_id', workspace.id)
      .order('scheduled_at', { ascending: false })
    setAppointments(data || [])
    setLoading(false)
  }, [workspace?.id])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (!workspace?.id) return
    const ch = supabase.channel('appts-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `workspace_id=eq.${workspace.id}` }, fetchData)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [workspace?.id, fetchData])

  async function confirm(id) {
    await supabase.from('appointments').update({ status: 'confirmed' }).eq('id', id)
    notify('Appointment confirmed ✓')
    fetchData()
  }

  async function decline(id) {
    await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id)
    notify('Appointment declined')
    fetchData()
  }

  const filtered = appointments.filter(a => filter === 'all' ? true : a.status === filter)

  return (
    <>
      <div style={s.pageHead}>
        <div>
          <div style={s.pageTitle}>Appointments</div>
          <div style={s.pageSub}>{appointments.length} total · {appointments.filter(a=>a.status==='pending').length} pending</div>
        </div>
        <button
          style={s.btnPrimary}
          onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/${workspace?.slug}`); notify('Booking link copied!') }}
        >
          Copy booking link
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:'.5rem', marginBottom:'1.25rem' }}>
        {['all','pending','confirmed'].map(f => (
          <button
            key={f}
            style={{
              ...s.btnXs,
              background: filter === f ? T.gold : T.white,
              color: filter === f ? T.ink : T.muted,
              border: `1px solid ${filter === f ? T.gold : T.border}`,
              fontWeight: filter === f ? 700 : 500,
              padding:'.45rem .9rem',
            }}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={s.card}><Skeleton lines={5} /></div>
      ) : filtered.length === 0 ? (
        <div style={s.card}>
          <div style={s.empty}>
            <span style={s.emptyIcon}>◷</span>
            <div style={s.emptyTitle}>{filter === 'all' ? 'No appointments yet' : `No ${filter} appointments`}</div>
            <div style={s.emptyText}>
              {filter === 'all'
                ? 'Share your booking link with clients to start receiving appointments.'
                : `You have no ${filter} appointments right now.`}
            </div>
            {filter === 'all' && (
              <button style={s.btnPrimary} onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/${workspace?.slug}`); notify('Link copied!') }}>
                Copy booking link
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div style={{ display:'none' }} className="mobile-appts">
            {filtered.map(a => (
              <div key={a.id} style={s.apptCard(a.status)}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <div style={{ fontWeight:700, color:T.ink }}>{a.client_name}</div>
                  <span style={a.status==='confirmed' ? s.badgeConfirmed : a.status==='cancelled' ? s.badgeDanger : s.badgePending}>{a.status}</span>
                </div>
                <div style={{ fontSize:'.8rem', color:T.muted, marginBottom:4 }}>{a.notes || 'No service noted'}</div>
                <div style={{ fontSize:'.8rem', color:T.muted, marginBottom:10 }}>
                  {new Date(a.scheduled_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })} at{' '}
                  {new Date(a.scheduled_at).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ color:T.gold, fontWeight:700, fontSize:'.88rem' }}>${Number(a.amount||0).toFixed(2)}</span>
                  {a.status === 'pending' && (
                    <div style={{ display:'flex', gap:'.5rem' }}>
                      <button style={{ ...s.btnDanger, padding:'.35rem .75rem' }} onClick={() => decline(a.id)}>Decline</button>
                      <button style={{ ...s.btnSuccess, padding:'.35rem .75rem' }} onClick={() => confirm(a.id)}>Confirm</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div style={s.card} className="desktop-appts">
            <div style={{ overflowX:'auto' }}>
              <table style={s.tbl}>
                <thead>
                  <tr>
                    <th style={s.th}>Client</th>
                    <th style={s.th}>Service</th>
                    <th style={s.th}>Date</th>
                    <th style={s.th}>Time</th>
                    <th style={s.th}>Amount</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => (
                    <tr key={a.id}>
                      <td style={{ ...s.td, fontWeight:600 }}>{a.client_name}</td>
                      <td style={s.td}>{a.notes || '—'}</td>
                      <td style={s.td}>{new Date(a.scheduled_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}</td>
                      <td style={s.td}>{new Date(a.scheduled_at).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })}</td>
                      <td style={{ ...s.td, color:T.gold, fontWeight:700 }}>${Number(a.amount||0).toFixed(2)}</td>
                      <td style={s.td}>
                        <span style={a.status==='confirmed' ? s.badgeConfirmed : a.status==='cancelled' ? s.badgeDanger : s.badgePending}>{a.status}</span>
                      </td>
                      <td style={s.td}>
                        {a.status === 'pending' && (
                          <div style={{ display:'flex', gap:'.4rem' }}>
                            <button style={s.btnDanger} onClick={() => decline(a.id)}>Decline</button>
                            <button style={s.btnSuccess} onClick={() => confirm(a.id)}>Confirm</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 640px) {
          .mobile-appts  { display: block !important; }
          .desktop-appts { display: none !important; }
        }
      `}</style>
    </>
  )
}

/* ─────────────────────────────────────────────
   CLIENTS
───────────────────────────────────────────── */
function Clients({ workspace, notify }) {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!workspace?.id) return
    supabase
      .from('appointments')
      .select('client_name, client_email, client_phone, amount, status, scheduled_at')
      .eq('workspace_id', workspace.id)
      .order('scheduled_at', { ascending: false })
      .then(({ data }) => {
        // Deduplicate by email
        const map = {}
        ;(data || []).forEach(a => {
          const key = a.client_email || a.client_name
          if (!map[key]) {
            map[key] = { name: a.client_name, email: a.client_email, phone: a.client_phone, bookings: 0, spent: 0, last: a.scheduled_at }
          }
          map[key].bookings++
          if (a.status === 'confirmed') map[key].spent += Number(a.amount || 0)
        })
        setClients(Object.values(map))
        setLoading(false)
      })
  }, [workspace?.id])

  return (
    <>
      <div style={s.pageHead}>
        <div>
          <div style={s.pageTitle}>Clients</div>
          <div style={s.pageSub}>{clients.length} unique clients</div>
        </div>
      </div>

      <div style={s.card}>
        {loading ? <Skeleton lines={5} /> : clients.length === 0 ? (
          <div style={s.empty}>
            <span style={s.emptyIcon}>◉</span>
            <div style={s.emptyTitle}>No clients yet</div>
            <div style={s.emptyText}>Clients appear here automatically when they book through your page.</div>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={s.tbl}>
              <thead>
                <tr>
                  <th style={s.th}>Name</th>
                  <th style={s.th}>Email</th>
                  <th style={s.th}>Bookings</th>
                  <th style={s.th}>Total Spent</th>
                  <th style={s.th}>Last visit</th>
                </tr>
              </thead>
              <tbody>
                {clients.sort((a,b) => b.spent - a.spent).map((c, i) => (
                  <tr key={i}>
                    <td style={{ ...s.td, fontWeight:600 }}>
                      {c.name}
                      {c.spent > 200 && <span style={{ ...s.badgeConfirmed, marginLeft:6 }}>VIP</span>}
                    </td>
                    <td style={s.td}>{c.email || '—'}</td>
                    <td style={s.td}>{c.bookings}</td>
                    <td style={{ ...s.td, color:T.gold, fontWeight:700 }}>${c.spent.toFixed(2)}</td>
                    <td style={s.td}>{new Date(c.last).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

/* ─────────────────────────────────────────────
   SERVICES
───────────────────────────────────────────── */
function Services({ workspace, notify }) {
  const [services, setServices] = useState([])
  const [loading, setLoading]   = useState(true)
  const [adding, setAdding]     = useState(false)
  const [form, setForm]         = useState({ name:'', price:'', duration:'', description:'' })

  const fetchData = useCallback(async () => {
    if (!workspace?.id) return
    const { data } = await supabase.from('services').select('*').eq('workspace_id', workspace.id).order('created_at', { ascending: false })
    setServices(data || [])
    setLoading(false)
  }, [workspace?.id])

  useEffect(() => { fetchData() }, [fetchData])

  async function addService() {
    if (!form.name || !form.price) return notify('Name and price are required.')
    const { error } = await supabase.from('services').insert({
      workspace_id: workspace.id,
      name:         form.name,
      price:        parseFloat(form.price),
      duration:     parseInt(form.duration) || null,
      description:  form.description,
    })
    if (error) return notify('Error adding service.')
    notify('Service added.')
    setForm({ name:'', price:'', duration:'', description:'' })
    setAdding(false)
    fetchData()
  }

  async function deleteService(id) {
    await supabase.from('services').delete().eq('id', id)
    notify('Service removed.')
    fetchData()
  }

  return (
    <>
      <div style={s.pageHead}>
        <div>
          <div style={s.pageTitle}>Services</div>
          <div style={s.pageSub}>What you offer to clients</div>
        </div>
        <button style={s.btnPrimary} onClick={() => setAdding(true)}>+ Add service</button>
      </div>

      {adding && (
        <div style={{ ...s.card, ...s.cardPad, marginBottom:'1.25rem' }}>
          <div style={{ ...s.cardTitle, marginBottom:'1rem' }}>New service</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div style={s.formGroup}>
              <label style={s.label}>Service name *</label>
              <input style={s.input} placeholder="e.g. Box braids" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Price ($) *</label>
              <input style={s.input} placeholder="0.00" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Duration (min)</label>
              <input style={s.input} placeholder="e.g. 90" type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
            </div>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Description</label>
            <textarea style={s.textarea} placeholder="Brief description…" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div style={{ display:'flex', gap:'.75rem' }}>
            <button style={s.btnPrimary} onClick={addService}>Add service</button>
            <button style={s.btnOutline} onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={s.card}>
        {loading ? <Skeleton lines={4} /> : services.length === 0 ? (
          <div style={s.empty}>
            <span style={s.emptyIcon}>✦</span>
            <div style={s.emptyTitle}>No services yet</div>
            <div style={s.emptyText}>Add your services so clients can choose what to book.</div>
            <button style={s.btnPrimary} onClick={() => setAdding(true)}>Add your first service</button>
          </div>
        ) : (
          <table style={s.tbl}>
            <thead>
              <tr>
                <th style={s.th}>Service</th>
                <th style={s.th}>Price</th>
                <th style={s.th}>Duration</th>
                <th style={s.th}>Description</th>
                <th style={s.th}></th>
              </tr>
            </thead>
            <tbody>
              {services.map(sv => (
                <tr key={sv.id}>
                  <td style={{ ...s.td, fontWeight:600 }}>{sv.name}</td>
                  <td style={{ ...s.td, color:T.gold, fontWeight:700 }}>${Number(sv.price).toFixed(2)}</td>
                  <td style={s.td}>{sv.duration ? `${sv.duration} min` : '—'}</td>
                  <td style={{ ...s.td, color:T.muted, maxWidth:220, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{sv.description || '—'}</td>
                  <td style={s.td}>
                    <button style={{ ...s.btnXs, background:T.dangerBg, color:T.danger }} onClick={() => deleteService(sv.id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

/* ─────────────────────────────────────────────
   PRODUCTS
───────────────────────────────────────────── */
function Products({ workspace, notify }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [adding, setAdding]     = useState(false)
  const [form, setForm]         = useState({ name:'', price:'', stock:'', description:'' })

  const fetchData = useCallback(async () => {
    if (!workspace?.id) return
    const { data } = await supabase.from('products').select('*').eq('workspace_id', workspace.id).order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }, [workspace?.id])

  useEffect(() => { fetchData() }, [fetchData])

  async function addProduct() {
    if (!form.name || !form.price) return notify('Name and price are required.')
    const { error } = await supabase.from('products').insert({
      workspace_id: workspace.id,
      name:         form.name,
      price:        parseFloat(form.price),
      stock:        parseInt(form.stock) || 0,
      description:  form.description,
    })
    if (error) return notify('Error adding product.')
    notify('Product added.')
    setForm({ name:'', price:'', stock:'', description:'' })
    setAdding(false)
    fetchData()
  }

  async function deleteProduct(id) {
    await supabase.from('products').delete().eq('id', id)
    notify('Product removed.')
    fetchData()
  }

  return (
    <>
      <div style={s.pageHead}>
        <div>
          <div style={s.pageTitle}>Products</div>
          <div style={s.pageSub}>Items available in your shop</div>
        </div>
        <button style={s.btnPrimary} onClick={() => setAdding(true)}>+ Add product</button>
      </div>

      {adding && (
        <div style={{ ...s.card, ...s.cardPad, marginBottom:'1.25rem' }}>
          <div style={{ ...s.cardTitle, marginBottom:'1rem' }}>New product</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div style={s.formGroup}>
              <label style={s.label}>Product name *</label>
              <input style={s.input} placeholder="e.g. Silk hair serum" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Price ($) *</label>
              <input style={s.input} placeholder="0.00" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Stock quantity</label>
              <input style={s.input} placeholder="0" type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
            </div>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Description</label>
            <textarea style={s.textarea} placeholder="What is this product?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div style={{ display:'flex', gap:'.75rem' }}>
            <button style={s.btnPrimary} onClick={addProduct}>Add product</button>
            <button style={s.btnOutline} onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={s.card}>
        {loading ? <Skeleton lines={4} /> : products.length === 0 ? (
          <div style={s.empty}>
            <span style={s.emptyIcon}>◈</span>
            <div style={s.emptyTitle}>No products yet</div>
            <div style={s.emptyText}>Add products to sell on your booking page — hair care, accessories, anything you offer.</div>
            <button style={s.btnPrimary} onClick={() => setAdding(true)}>Add your first product</button>
          </div>
        ) : (
          <table style={s.tbl}>
            <thead>
              <tr>
                <th style={s.th}>Product</th>
                <th style={s.th}>Price</th>
                <th style={s.th}>Stock</th>
                <th style={s.th}>Description</th>
                <th style={s.th}></th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td style={{ ...s.td, fontWeight:600 }}>{p.name}</td>
                  <td style={{ ...s.td, color:T.gold, fontWeight:700 }}>${Number(p.price).toFixed(2)}</td>
                  <td style={s.td}>
                    <span style={p.stock === 0 ? s.badgeDanger : p.stock < 5 ? s.badgePending : s.badgeConfirmed}>
                      {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                    </span>
                  </td>
                  <td style={{ ...s.td, color:T.muted, maxWidth:220, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.description || '—'}</td>
                  <td style={s.td}>
                    <button style={{ ...s.btnXs, background:T.dangerBg, color:T.danger }} onClick={() => deleteProduct(p.id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

/* ─────────────────────────────────────────────
   FORMATIONS
───────────────────────────────────────────── */
function Formations({ workspace, notify }) {
  const [formations, setFormations] = useState([])
  const [loading, setLoading]       = useState(true)
  const [adding, setAdding]         = useState(false)
  const [form, setForm]             = useState({ title:'', price:'', spots:'', description:'' })

  const fetchData = useCallback(async () => {
    if (!workspace?.id) return
    const { data } = await supabase.from('formations').select('*').eq('workspace_id', workspace.id).order('created_at', { ascending: false })
    setFormations(data || [])
    setLoading(false)
  }, [workspace?.id])

  useEffect(() => { fetchData() }, [fetchData])

  async function addFormation() {
    if (!form.title || !form.price) return notify('Title and price are required.')
    const { error } = await supabase.from('formations').insert({
      workspace_id: workspace.id,
      title:        form.title,
      price:        parseFloat(form.price),
      spots:        parseInt(form.spots) || null,
      description:  form.description,
    })
    if (error) return notify('Error adding formation.')
    notify('Formation added.')
    setForm({ title:'', price:'', spots:'', description:'' })
    setAdding(false)
    fetchData()
  }

  async function deleteFormation(id) {
    await supabase.from('formations').delete().eq('id', id)
    notify('Formation removed.')
    fetchData()
  }

  return (
    <>
      <div style={s.pageHead}>
        <div>
          <div style={s.pageTitle}>Formations</div>
          <div style={s.pageSub}>Courses and training you offer</div>
        </div>
        <button style={s.btnPrimary} onClick={() => setAdding(true)}>+ Add formation</button>
      </div>

      {adding && (
        <div style={{ ...s.card, ...s.cardPad, marginBottom:'1.25rem' }}>
          <div style={{ ...s.cardTitle, marginBottom:'1rem' }}>New formation</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div style={s.formGroup}>
              <label style={s.label}>Title *</label>
              <input style={s.input} placeholder="e.g. Braiding masterclass" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Price ($) *</label>
              <input style={s.input} placeholder="0.00" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Spots available</label>
              <input style={s.input} placeholder="Leave blank for unlimited" type="number" value={form.spots} onChange={e => setForm(f => ({ ...f, spots: e.target.value }))} />
            </div>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Description</label>
            <textarea style={s.textarea} placeholder="What will students learn?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div style={{ display:'flex', gap:'.75rem' }}>
            <button style={s.btnPrimary} onClick={addFormation}>Add formation</button>
            <button style={s.btnOutline} onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={s.card}>
        {loading ? <Skeleton lines={4} /> : formations.length === 0 ? (
          <div style={s.empty}>
            <span style={s.emptyIcon}>◎</span>
            <div style={s.emptyTitle}>No formations yet</div>
            <div style={s.emptyText}>Create courses and training programs to diversify your income beyond bookings.</div>
            <button style={s.btnPrimary} onClick={() => setAdding(true)}>Add your first formation</button>
          </div>
        ) : (
          <table style={s.tbl}>
            <thead>
              <tr>
                <th style={s.th}>Title</th>
                <th style={s.th}>Price</th>
                <th style={s.th}>Spots</th>
                <th style={s.th}>Description</th>
                <th style={s.th}></th>
              </tr>
            </thead>
            <tbody>
              {formations.map(f => (
                <tr key={f.id}>
                  <td style={{ ...s.td, fontWeight:600 }}>{f.title}</td>
                  <td style={{ ...s.td, color:T.gold, fontWeight:700 }}>${Number(f.price).toFixed(2)}</td>
                  <td style={s.td}>{f.spots || 'Unlimited'}</td>
                  <td style={{ ...s.td, color:T.muted, maxWidth:220, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.description || '—'}</td>
                  <td style={s.td}>
                    <button style={{ ...s.btnXs, background:T.dangerBg, color:T.danger }} onClick={() => deleteFormation(f.id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

/* ─────────────────────────────────────────────
   SETTINGS
───────────────────────────────────────────── */
function Settings({ workspace, notify, onWorkspaceUpdate }) {
  const [form, setForm] = useState({
    business_name: workspace?.business_name || '',
    bio:           workspace?.bio           || '',
    city:          workspace?.city          || '',
    phone:         workspace?.phone         || '',
    instagram:     workspace?.instagram     || '',
  })
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!workspace?.id) return
    setSaving(true)
    const { error } = await supabase.from('workspaces').update(form).eq('id', workspace.id)
    setSaving(false)
    if (error) return notify('Error saving settings.')
    notify('Settings saved.')
    onWorkspaceUpdate?.({ ...workspace, ...form })
  }

  return (
    <>
      <div style={s.pageHead}>
        <div>
          <div style={s.pageTitle}>Settings</div>
          <div style={s.pageSub}>Your business profile</div>
        </div>
      </div>

      <div style={{ ...s.card, ...s.cardPad }}>
        <div style={{ ...s.cardTitle, marginBottom:'1.25rem' }}>Business information</div>

        <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
          <div style={s.formGroup}>
            <label style={s.label}>Business name</label>
            <input style={s.input} value={form.business_name} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))} />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Bio</label>
            <textarea style={s.textarea} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell clients about yourself and your work…" />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div style={s.formGroup}>
              <label style={s.label}>City</label>
              <input style={s.input} value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Phone</label>
              <input style={s.input} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Instagram handle</label>
            <input style={s.input} value={form.instagram} placeholder="@yourusername" onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} />
          </div>
        </div>

        <button style={{ ...s.btnPrimary, opacity: saving ? .7 : 1 }} onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </div>

      <div style={{ ...s.card, ...s.cardPad, marginTop:'1.25rem' }}>
        <div style={{ ...s.cardTitle, marginBottom:4 }}>Your booking link</div>
        <div style={{ fontSize:'.8rem', color:T.muted, marginBottom:'1rem' }}>Share this link with clients so they can book with you.</div>
        <div style={{ display:'flex', alignItems:'center', gap:'.75rem', flexWrap:'wrap' }}>
          <div style={{ flex:1, background:T.cream, border:`1px solid ${T.border}`, borderRadius:T.radiusSm, padding:'.6rem .9rem', fontSize:'.83rem', color:T.muted, minWidth:180 }}>
            {window.location.origin}/{workspace?.slug}
          </div>
          <button style={s.btnPrimary} onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/${workspace?.slug}`); notify('Link copied!') }}>Copy</button>
          <button style={s.btnOutline} onClick={() => window.open(`/${workspace?.slug}`, '_blank')}>Preview</button>
        </div>
      </div>
    </>
  )
}

/* ─────────────────────────────────────────────
   DASHBOARD ROOT
───────────────────────────────────────────── */
export default function Dashboard() {
  const [user, setUser]           = useState(null)
  const [workspace, setWorkspace] = useState(null)
  const [page, setPage]           = useState('overview')
  const [toastMsg, setToastMsg]   = useState('')
  const [pendingCount, setPendingCount] = useState(0)
  const [drawerOpen, setDrawerOpen]     = useState(false)
  const toastTimer = useRef(null)

  // Auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) { window.location.href = '/'; return }
      setUser(data.user)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') window.location.href = '/'
      if (session?.user) setUser(session.user)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // Workspace
  useEffect(() => {
    if (!user) return
    supabase.from('workspaces').select('*').eq('user_id', user.id).single()
      .then(({ data }) => { if (data) setWorkspace(data) })
  }, [user])

  // Pending badge count
  useEffect(() => {
    if (!workspace?.id) return
    const refresh = async () => {
      const { data } = await supabase.from('appointments').select('id').eq('workspace_id', workspace.id).eq('status', 'pending')
      setPendingCount((data || []).length)
    }
    refresh()
    const ch = supabase.channel('pending-badge')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `workspace_id=eq.${workspace.id}` }, refresh)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [workspace?.id])

  function notify(msg) {
    setToastMsg(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(''), 2800)
  }

  async function logout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  function renderPage() {
    const props = { workspace, notify }
    switch (page) {
      case 'overview':     return <Overview     {...props} setPage={setPage} />
      case 'appointments': return <Appointments {...props} />
      case 'clients':      return <Clients      {...props} />
      case 'services':     return <Services     {...props} />
      case 'products':     return <Products     {...props} />
      case 'formations':   return <Formations   {...props} />
      case 'settings':     return <Settings     {...props} onWorkspaceUpdate={setWorkspace} />
      default:             return null
    }
  }

  const initials = workspace?.business_name
    ? workspace.business_name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || '?'

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${T.cream}; }
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700&display=swap');
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .main-content { padding: 1.25rem !important; }
        }
        @media (min-width: 769px) {
          .hamburger { display: none !important; }
        }
        input:focus, textarea:focus { border-color: ${T.gold} !important; box-shadow: 0 0 0 3px ${T.goldFaint}; }
        button:active { transform: scale(.97); }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: ${T.cream}; }
      `}</style>

      <div style={s.shell}>
        {/* Desktop sidebar */}
        <aside className="sidebar-desktop" style={s.sidebar}>
          <SidebarContent
            page={page} setPage={setPage}
            workspace={workspace} pendingCount={pendingCount}
            onLogout={logout}
          />
        </aside>

        {/* Mobile drawer */}
        {drawerOpen && <div style={s.overlay} onClick={() => setDrawerOpen(false)} />}
        <div style={s.drawer(drawerOpen)}>
          <SidebarContent
            page={page} setPage={setPage}
            workspace={workspace} pendingCount={pendingCount}
            onLogout={logout} onClose={() => setDrawerOpen(false)}
          />
        </div>

        {/* Main area */}
        <div style={s.main}>
          {/* Topbar */}
          <div style={s.topbar}>
            <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
              {/* Hamburger */}
              <button
                className="hamburger"
                style={{ background:'none', border:'none', cursor:'pointer', padding:4, display:'flex', flexDirection:'column', gap:5 }}
                onClick={() => setDrawerOpen(true)}
              >
                <span style={{ display:'block', width:22, height:2, background:T.ink, borderRadius:99 }} />
                <span style={{ display:'block', width:16, height:2, background:T.ink, borderRadius:99 }} />
                <span style={{ display:'block', width:22, height:2, background:T.ink, borderRadius:99 }} />
              </button>
              <div style={s.topbarTitle}>
                Organized<span style={s.topbarDot}>.</span>
              </div>
            </div>
            <div style={s.topbarRight}>
              {pendingCount > 0 && (
                <div
                  style={{ background:T.goldFaint, border:`1px solid ${T.gold}`, borderRadius:99, padding:'3px 10px', fontSize:'.73rem', fontWeight:700, color:T.gold, cursor:'pointer' }}
                  onClick={() => setPage('appointments')}
                >
                  {pendingCount} pending
                </div>
              )}
              <div style={s.avatar}>{initials}</div>
            </div>
          </div>

          {/* Page content */}
          <div className="main-content" style={{ padding:'2rem' }}>
            {renderPage()}
          </div>
        </div>
      </div>

      <Toast msg={toastMsg} />
    </>
  )
}
