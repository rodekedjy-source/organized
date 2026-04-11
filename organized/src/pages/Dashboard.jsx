import { useState, useEffect } from ‘react’
import { supabase } from ‘../lib/supabase’

const fmt = (n) => `$${Number(n || 0).toLocaleString()}`

export default function Dashboard({ session }) {
const [page, setPage] = useState(‘overview’)
const [sidebarOpen, setSidebarOpen] = useState(false)
const [workspace, setWorkspace] = useState(null)
const [toast, setToast] = useState(’’)
const [showMenu, setShowMenu] = useState(false)

useEffect(() => { fetchWorkspace() }, [session])

async function fetchWorkspace() {
const { data } = await supabase.from(‘workspaces’).select(’*’).eq(‘user_id’, session.user.id).single()
setWorkspace(data)
}

function showToast(msg) { setToast(msg); setTimeout(() => setToast(’’), 3000) }

// FIX: logout → landing page
async function handleSignOut() {
await supabase.auth.signOut()
window.location.href = ‘/’
}

const navItems = [
{ key: ‘overview’,      label: ‘Overview’ },
{ key: ‘services’,      label: ‘Services’ },
{ key: ‘appointments’,  label: ‘Appointments’ },
{ key: ‘products’,      label: ‘Products’ },
{ key: ‘formations’,    label: ‘Formations’ },
{ key: ‘clients’,       label: ‘Clients’ },
{ key: ‘settings’,      label: ‘Settings’ },
]

return (
<>
<style>{css}</style>
<div className="db-shell">
<div className="db-topbar">
<div style={{display:‘flex’,alignItems:‘center’,gap:’.85rem’}}>
<button className={`hamburger ${sidebarOpen?'open':''}`} onClick={()=>setSidebarOpen(o=>!o)}>
<span/><span/><span/>
</button>
<div className=“db-logo” style={{cursor:‘pointer’}} onClick={()=>{setPage(‘overview’);setSidebarOpen(false)}}>
Organized<span>.</span>
</div>
</div>
<div className="db-topbar-right">
<div style={{position:‘relative’}}>
<div className=“db-avatar” onClick={()=>setShowMenu(o=>!o)}>
{session.user.email?.[0]?.toUpperCase()}
</div>
{showMenu && (
<div style={{position:‘absolute’,right:0,top:‘42px’,background:’#fff’,border:‘1px solid #e4e2dc’,borderRadius:‘10px’,boxShadow:‘0 8px 24px rgba(0,0,0,.1)’,minWidth:‘180px’,zIndex:100,overflow:‘hidden’}}>
<div style={{padding:’.65rem 1rem’,fontSize:’.75rem’,color:’#7a7774’,borderBottom:‘1px solid #e4e2dc’,fontWeight:400}}>{session.user.email}</div>
<div style={{padding:’.65rem 1rem’,fontSize:’.82rem’,color:’#111110’,cursor:‘pointer’}} onClick={()=>{setPage(‘settings’);setShowMenu(false)}}>Settings</div>
<div style={{padding:’.65rem 1rem’,fontSize:’.82rem’,color:’#c0392b’,cursor:‘pointer’,borderTop:‘1px solid #e4e2dc’}} onClick={handleSignOut}>Sign out</div>
</div>
)}
</div>
</div>
</div>

```
    <div className="db-body">
      {sidebarOpen && <div className="db-backdrop" onClick={()=>setSidebarOpen(false)}/>}
      <aside className={`db-sidebar ${sidebarOpen?'open':''}`}>
        <div className="db-sidebar-label">Workspace</div>
        {navItems.map(n => (
          <div key={n.key} className={`db-nav-item ${page===n.key?'active':''}`}
            onClick={()=>{setPage(n.key);setSidebarOpen(false)}}>
            {n.label}
          </div>
        ))}
        <div className="db-sidebar-label" style={{marginTop:'1rem'}}>Account</div>
        <div className="db-nav-item" onClick={handleSignOut}>Sign out</div>
        <div className="db-sidebar-footer">
          <div className="db-plan-label">Pro Plan</div>
          {/* FIX: slug clickable → ouvre la business page dans un nouvel onglet */}
          <a
            className="db-plan-sub db-slug-link"
            href={workspace?.slug ? `https://beorganized.io/${workspace.slug}` : undefined}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => { if (!workspace?.slug) e.preventDefault() }}
          >
            beorganized.io/{workspace?.slug || '...'}
          </a>
          <div className="db-plan-bar"><div className="db-plan-fill"/></div>
        </div>
      </aside>

      <main className="db-main">
        {/* FIX: passe setPage à Overview */}
        {page === 'overview'      && <Overview     workspace={workspace} toast={showToast} setPage={setPage}/>}
        {page === 'services'      && <Services     workspace={workspace} toast={showToast}/>}
        {page === 'appointments'  && <Appointments workspace={workspace} toast={showToast}/>}
        {page === 'products'      && <Products     workspace={workspace} toast={showToast}/>}
        {page === 'formations'    && <Formations   workspace={workspace} toast={showToast}/>}
        {page === 'clients'       && <Clients      workspace={workspace} toast={showToast}/>}
        {page === 'settings'      && <Settings     workspace={workspace} toast={showToast} refetch={fetchWorkspace}/>}
      </main>
    </div>

    {toast && <div className="db-toast">{toast}</div>}
  </div>
</>
```

)
}

// ─── OVERVIEW ────────────────────────────────────────────────────────────────

function Overview({ workspace, toast, setPage }) {
const [appts, setAppts] = useState([])
const [allAppts, setAllAppts] = useState([])
const [stats, setStats] = useState({ revenue:0, appointments:0, products:0, students:0 })
const [showRevenue, setShowRevenue] = useState(false)

useEffect(() => {
if (!workspace) return
fetchData()
const channel = supabase
.channel(‘overview-changes’)
.on(‘postgres_changes’, {
event: ‘*’, schema: ‘public’, table: ‘appointments’,
filter: `workspace_id=eq.${workspace.id}`
}, () => fetchData())
.subscribe()
return () => supabase.removeChannel(channel)
}, [workspace])

async function fetchData() {
const today = new Date().toISOString().split(‘T’)[0]
const [a, p, e] = await Promise.all([
supabase.from(‘appointments’).select(’*’).eq(‘workspace_id’, workspace.id),
supabase.from(‘products’).select(’*’).eq(‘workspace_id’, workspace.id),
supabase.from(‘enrollments’).select(’*’).eq(‘workspace_id’, workspace.id),
])
const apptData = a.data || []
const revenue = apptData.reduce((s,x) => s + Number(x.amount || 0), 0)
setStats({
revenue,
appointments: apptData.length,
products: (p.data || []).length,
students: (e.data || []).length,
})
setAllAppts(apptData)
setAppts(apptData.filter(x => x.scheduled_at?.startsWith(today)))
}

const cards = [
{ label:‘Revenue’,      value:fmt(stats.revenue),   delta:‘Tous les temps’,     page:‘revenue’      },
{ label:‘Appointments’, value:stats.appointments,   delta:‘Total réservations’, page:‘appointments’ },
{ label:‘Products’,     value:stats.products,       delta:‘Listed’,             page:‘products’     },
{ label:‘Students’,     value:stats.students,       delta:‘Total enrollments’,  page:‘formations’   },
]

return (
<div>
<div className="db-page-head">
<div>
<div className="db-page-title">Overview</div>
<div className="db-page-sub">{new Date().toLocaleDateString(‘en-US’,{weekday:‘long’,year:‘numeric’,month:‘long’,day:‘numeric’})}</div>
</div>
<div style={{display:‘flex’,gap:’.6rem’,flexWrap:‘wrap’}}>
<button className=“db-btn db-btn-secondary db-btn-xs” onClick={()=>toast(‘Booking link copied!’)}>Copy link</button>
<button className=“db-btn db-btn-primary db-btn-xs” onClick={()=>toast(‘New appointment coming soon.’)}>+ New</button>
</div>
</div>

```
  {/* FIX: cartes cliquables avec animation */}
  <div className="db-stats-row">
    {cards.map((s, i) => (
      <button
        key={i}
        className="db-stat-card db-stat-card-btn"
        onClick={() => s.page === 'revenue' ? setShowRevenue(true) : setPage(s.page)}
      >
        <div className="db-stat-label">{s.label}</div>
        <div className="db-stat-value">{s.value}</div>
        <div className="db-stat-delta">{s.delta}</div>
        <div className="db-stat-arrow">→</div>
      </button>
    ))}
  </div>

  <div className="db-card">
    <div className="db-card-head">
      <div className="db-card-title">Today's appointments</div>
      <span className="db-badge db-badge-confirmed">{appts.length} scheduled</span>
    </div>
    {appts.length === 0
      ? <div style={{padding:'2rem',textAlign:'center',color:'var(--ink-3)',fontSize:'.85rem'}}>No appointments today.</div>
      : <table className="db-tbl">
          <thead><tr><th>Client</th><th>Time</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>{appts.map(a=>(
            <tr key={a.id}>
              <td className="db-tbl-name">{a.client_name}</td>
              <td>{new Date(a.scheduled_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</td>
              <td className="db-tbl-amount">{fmt(a.amount)}</td>
              <td><span className={`db-badge db-badge-${a.status}`}>{a.status}</span></td>
            </tr>
          ))}</tbody>
        </table>
    }
  </div>

  {/* Revenue panel */}
  {showRevenue && <RevenuePanel appts={allAppts} onClose={()=>setShowRevenue(false)}/>}
</div>
```

)
}

// ─── REVENUE PANEL ───────────────────────────────────────────────────────────

function RevenuePanel({ appts, onClose }) {
const now = new Date()
const year = now.getFullYear()
const month = now.getMonth()
const monthName = now.toLocaleDateString(‘fr-FR’, { month: ‘long’, year: ‘numeric’ })
const daysInMonth = new Date(year, month + 1, 0).getDate()

const dailyRevenue = Array.from({ length: daysInMonth }, (_, i) => {
const day = i + 1
const dayStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
const total = appts
.filter(a => a.scheduled_at?.startsWith(dayStr) && a.status === ‘confirmed’)
.reduce((s, a) => s + Number(a.amount || 0), 0)
return { day, total }
})

const nonZero  = dailyRevenue.filter(d => d.total > 0)
const maxVal   = Math.max(…dailyRevenue.map(d => d.total), 1)
const highest  = nonZero.length ? nonZero.reduce((a,b) => a.total > b.total ? a : b) : null
const lowest   = nonZero.length > 1 ? nonZero.reduce((a,b) => a.total < b.total ? a : b) : null
const avg      = nonZero.length ? Math.round(nonZero.reduce((s,d) => s + d.total, 0) / nonZero.length) : 0
const total    = nonZero.reduce((s,d) => s + d.total, 0)

const narrative = nonZero.length === 0
? `Aucun revenu confirmé ce mois-ci. Dès que tu confirmes des rendez-vous, ton analyse apparaîtra ici.`
: `En ${monthName}, tu as généré ${fmt(total)} au total sur ${nonZero.length} jour${nonZero.length>1?'s':''} actif${nonZero.length>1?'s':''}.${highest ? ` Ton meilleur jour était le ${highest.day} avec ${fmt(highest.total)}.`: ''} ${avg > 0 ?`Ta moyenne par jour actif est de ${fmt(avg)}.`: ''}${lowest && lowest.day !== highest?.day ?` Ton jour le plus bas était le ${lowest.day} avec ${fmt(lowest.total)}.` : ''}`

return (
<div className="rev-overlay" onClick={onClose}>
<div className=“rev-panel” onClick={e => e.stopPropagation()}>

```
    <div className="rev-panel-head">
      <div>
        <div className="rev-panel-title">Revenus</div>
        <div className="rev-panel-sub">{monthName}</div>
      </div>
      <button className="rev-close" onClick={onClose}>✕</button>
    </div>

    {/* Total en grand */}
    <div className="rev-total">{fmt(total)}</div>

    {/* Graphique barres SVG */}
    <div className="rev-chart-wrap">
      <svg width="100%" height="100" viewBox={`0 0 ${daysInMonth * 14} 100`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c9a96e"/>
            <stop offset="100%" stopColor="#e8d5b0"/>
          </linearGradient>
        </defs>
        {dailyRevenue.map(({ day, total: t }) => {
          const barH = t > 0 ? Math.max((t / maxVal) * 88, 6) : 3
          const x = (day - 1) * 14 + 2
          const isHighest = highest?.day === day
          return (
            <g key={day}>
              <rect
                x={x} y={100 - barH} width={10} height={barH} rx={3}
                fill={isHighest ? '#b5893a' : t > 0 ? 'url(#barGrad)' : '#f0ece4'}
              />
            </g>
          )
        })}
      </svg>
      <div className="rev-axis">
        {[1, 8, 15, 22, daysInMonth].map(d => (
          <span key={d} style={{position:'absolute',left:`${((d-1)/daysInMonth)*100}%`,transform:'translateX(-50%)'}}>
            {d}
          </span>
        ))}
      </div>
    </div>

    {/* Pills stats */}
    {nonZero.length > 0 && (
      <div className="rev-pills">
        {highest && (
          <div className="rev-pill">
            <span className="rev-pill-icon">↑</span>
            <div>
              <div className="rev-pill-label">Meilleur jour</div>
              <div className="rev-pill-val">{fmt(highest.total)} · {highest.day} {monthName.split(' ')[0]}</div>
            </div>
          </div>
        )}
        <div className="rev-pill">
          <span className="rev-pill-icon rev-pill-avg">⌀</span>
          <div>
            <div className="rev-pill-label">Moyenne / jour actif</div>
            <div className="rev-pill-val">{fmt(avg)}</div>
          </div>
        </div>
        {lowest && lowest.day !== highest?.day && (
          <div className="rev-pill">
            <span className="rev-pill-icon rev-pill-low">↓</span>
            <div>
              <div className="rev-pill-label">Jour le plus bas</div>
              <div className="rev-pill-val">{fmt(lowest.total)} · {lowest.day} {monthName.split(' ')[0]}</div>
            </div>
          </div>
        )}
      </div>
    )}

    {/* Narrative */}
    <div className="rev-narrative">{narrative}</div>
  </div>
</div>
```

)
}

// ─── APPOINTMENTS ─────────────────────────────────────────────────────────────

function Appointments({ workspace, toast }) {
const [data, setData] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
if (!workspace) return
fetchData()
const channel = supabase
.channel(‘appointments-changes’)
.on(‘postgres_changes’, {
event: ‘*’, schema: ‘public’, table: ‘appointments’,
filter: `workspace_id=eq.${workspace.id}`
}, () => fetchData())
.subscribe()
return () => supabase.removeChannel(channel)
}, [workspace])

async function fetchData() {
const { data } = await supabase.from(‘appointments’).select(’*’).eq(‘workspace_id’, workspace.id).order(‘scheduled_at’,{ascending:false})
setData(data||[])
setLoading(false)
}

async function confirm(id) {
await supabase.from(‘appointments’).update({status:‘confirmed’}).eq(‘id’,id)
toast(‘Appointment confirmed.’)
}

return (
<div>
<div className="db-page-head">
<div><div className="db-page-title">Appointments</div><div className="db-page-sub">Manage your bookings</div></div>
</div>
<div className="db-card">
{loading
? <div style={{padding:‘2rem’,color:‘var(–ink-3)’}}>Loading…</div>
: data.length===0
? <div style={{padding:‘2rem’,textAlign:‘center’,color:‘var(–ink-3)’,fontSize:’.85rem’}}>No appointments yet.</div>
: <table className="db-tbl">
<thead><tr><th>Client</th><th>Date</th><th>Time</th><th>Amount</th><th>Status</th><th></th></tr></thead>
<tbody>{data.map(a=>(
<tr key={a.id}>
<td className="db-tbl-name">{a.client_name}</td>
<td>{new Date(a.scheduled_at).toLocaleDateString()}</td>
<td>{new Date(a.scheduled_at).toLocaleTimeString([],{hour:‘2-digit’,minute:‘2-digit’})}</td>
<td className="db-tbl-amount">{fmt(a.amount)}</td>
<td><span className={`db-badge db-badge-${a.status}`}>{a.status}</span></td>
<td>{a.status===‘pending’&&<button className=“db-btn db-btn-secondary db-btn-xs” onClick={()=>confirm(a.id)}>Confirm</button>}</td>
</tr>
))}</tbody>
</table>
}
</div>
</div>
)
}

// ─── SERVICES ─────────────────────────────────────────────────────────────────

function Services({ workspace, toast }) {
const [data, setData] = useState([])
const [showForm, setShowForm] = useState(false)
const [form, setForm] = useState({name:’’,price:’’,duration_min:’’,description:’’})
const [loading, setLoading] = useState(false)

useEffect(() => { if (workspace) fetchData() }, [workspace])

async function fetchData() {
const { data } = await supabase.from(‘services’).select(’*’).eq(‘workspace_id’,workspace.id).order(‘display_order’,{ascending:true})
setData(data||[])
}

async function add(e) {
e.preventDefault()
setLoading(true)
await supabase.from(‘services’).insert({
workspace_id: workspace.id,
name: form.name,
price: parseFloat(form.price) || 0,
duration_min: parseInt(form.duration_min) || null,
description: form.description,
is_free: parseFloat(form.price) === 0,
})
toast(`${form.name} added.`)
setForm({name:’’,price:’’,duration_min:’’,description:’’})
setShowForm(false)
setLoading(false)
fetchData()
}

async function remove(id, name) {
await supabase.from(‘services’).delete().eq(‘id’,id)
toast(`${name} removed.`)
fetchData()
}

async function toggle(id, current) {
await supabase.from(‘services’).update({is_active:!current}).eq(‘id’,id)
fetchData()
}

return (
<div>
<div className="db-page-head">
<div>
<div className="db-page-title">Services</div>
<div className="db-page-sub">What you offer — appears on your public profile</div>
</div>
<button className=“db-btn db-btn-primary” onClick={()=>setShowForm(s=>!s)}>
{showForm ? ‘Cancel’ : ‘+ Add service’}
</button>
</div>
{showForm && (
<div className=“db-card” style={{marginBottom:‘1.25rem’}}>
<div className="db-card-head"><div className="db-card-title">New service</div></div>
<form onSubmit={add} style={{padding:‘1.4rem’,display:‘flex’,flexDirection:‘column’,gap:‘1rem’}}>
<div className="db-field"><label>Service name</label><input value={form.name} onChange={e=>setForm(f=>({…f,name:e.target.value}))} placeholder=“e.g. Box Braids” required/></div>
<div className="db-field"><label>Price (CAD) — enter 0 for free</label><input type=“number” value={form.price} onChange={e=>setForm(f=>({…f,price:e.target.value}))} placeholder=“180” required/></div>
<div className="db-field"><label>Duration (minutes)</label><input type=“number” value={form.duration_min} onChange={e=>setForm(f=>({…f,duration_min:e.target.value}))} placeholder=“240”/></div>
<div className="db-field"><label>Description (optional)</label><input value={form.description} onChange={e=>setForm(f=>({…f,description:e.target.value}))} placeholder=“Short description of the service”/></div>
<button type=“submit” className=“db-btn db-btn-primary” style={{width:‘100%’,justifyContent:‘center’,padding:’.75rem’}} disabled={loading}>
{loading ? ‘Saving…’ : ‘Save service’}
</button>
</form>
</div>
)}
<div className="db-card">
{data.length === 0
? <div style={{padding:‘3rem’,textAlign:‘center’,color:‘var(–ink-3)’,fontSize:’.85rem’}}>No services yet. Add your first service to start receiving bookings.</div>
: <table className="db-tbl">
<thead><tr><th>Service</th><th>Price</th><th>Duration</th><th>Status</th><th></th></tr></thead>
<tbody>{data.map(s=>(
<tr key={s.id}>
<td className="db-tbl-name">{s.name}</td>
<td className="db-tbl-amount">{s.is_free ? ‘Free’ : fmt(s.price)}</td>
<td>{s.duration_min ? `${s.duration_min} min` : ‘—’}</td>
<td><span className={`db-badge ${s.is_active ? 'db-badge-confirmed' : 'db-badge-cancelled'}`}>{s.is_active ? ‘Active’ : ‘Hidden’}</span></td>
<td style={{display:‘flex’,gap:’.4rem’}}>
<button className=“db-btn db-btn-secondary db-btn-xs” onClick={()=>toggle(s.id,s.is_active)}>{s.is_active ? ‘Hide’ : ‘Show’}</button>
<button className=“db-btn db-btn-xs” style={{color:’#c0392b’,border:‘1px solid #fecaca’,background:’#fff’}} onClick={()=>remove(s.id,s.name)}>Delete</button>
</td>
</tr>
))}</tbody>
</table>
}
</div>
</div>
)
}

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────

function Products({ workspace, toast }) {
const [data, setData] = useState([])
const [showForm, setShowForm] = useState(false)
const [form, setForm] = useState({name:’’,price:’’,stock:’’,description:’’})

useEffect(() => { if (workspace) fetchData() }, [workspace])

async function fetchData() {
const { data } = await supabase.from(‘products’).select(’*’).eq(‘workspace_id’,workspace.id).order(‘created_at’,{ascending:false})
setData(data||[])
}

async function add(e) {
e.preventDefault()
await supabase.from(‘products’).insert({workspace_id:workspace.id,name:form.name,price:parseFloat(form.price),stock:parseInt(form.stock)||0,description:form.description})
toast(`${form.name} added.`)
setForm({name:’’,price:’’,stock:’’,description:’’})
setShowForm(false)
fetchData()
}

return (
<div>
<div className="db-page-head">
<div><div className="db-page-title">Products</div><div className="db-page-sub">Sell from your profile page</div></div>
<button className=“db-btn db-btn-primary” onClick={()=>setShowForm(s=>!s)}>{showForm?‘Cancel’:‘Add product’}</button>
</div>
{showForm && (
<div className=“db-card” style={{marginBottom:‘1.25rem’}}>
<div className="db-card-head"><div className="db-card-title">New product</div></div>
<form onSubmit={add} style={{padding:‘1.4rem’,display:‘flex’,flexDirection:‘column’,gap:‘1rem’}}>
<div className="db-field"><label>Product name</label><input value={form.name} onChange={e=>setForm(f=>({…f,name:e.target.value}))} placeholder=“e.g. Moisture Serum” required/></div>
<div className="db-field"><label>Price (CAD)</label><input type=“number” value={form.price} onChange={e=>setForm(f=>({…f,price:e.target.value}))} placeholder=“28” required/></div>
<div className="db-field"><label>Stock quantity</label><input type=“number” value={form.stock} onChange={e=>setForm(f=>({…f,stock:e.target.value}))} placeholder=“10”/></div>
<div className="db-field"><label>Description (optional)</label><input value={form.description} onChange={e=>setForm(f=>({…f,description:e.target.value}))}/></div>
<button type=“submit” className=“db-btn db-btn-primary” style={{width:‘100%’,justifyContent:‘center’,padding:’.75rem’}}>Save product</button>
</form>
</div>
)}
<div className="db-grid-3">
{data.map(p=>(
<div key={p.id} className="db-prod-card">
<div className="db-prod-img">PRODUCT</div>
<div className="db-prod-body">
<div className="db-prod-name">{p.name}</div>
<div className="db-prod-price">{fmt(p.price)}</div>
<span className={`db-badge ${p.stock===0?'db-badge-cancelled':p.stock<10?'db-badge-pending':'db-badge-confirmed'}`}>
{p.stock===0?‘Out of stock’:`${p.stock} in stock`}
</span>
</div>
</div>
))}
</div>
</div>
)
}

// ─── FORMATIONS ───────────────────────────────────────────────────────────────

function Formations({ workspace, toast }) {
const [data, setData] = useState([])
const [showForm, setShowForm] = useState(false)
const [form, setForm] = useState({title:’’,price:’’,duration_label:’’,description:’’})

useEffect(() => { if (workspace) fetchData() }, [workspace])

async function fetchData() {
const { data } = await supabase.from(‘offerings’).select(’*’).eq(‘workspace_id’,workspace.id).order(‘created_at’,{ascending:false})
setData(data||[])
}

async function add(e) {
e.preventDefault()
await supabase.from(‘offerings’).insert({workspace_id:workspace.id,title:form.title,price:parseFloat(form.price),duration_label:form.duration_label,description:form.description})
toast(`"${form.title}" created.`)
setForm({title:’’,price:’’,duration_label:’’,description:’’})
setShowForm(false)
fetchData()
}

return (
<div>
<div className="db-page-head">
<div><div className="db-page-title">Formations</div><div className="db-page-sub">Sell courses and workshops</div></div>
<button className=“db-btn db-btn-primary” onClick={()=>setShowForm(s=>!s)}>{showForm?‘Cancel’:‘Create formation’}</button>
</div>
{showForm && (
<div className=“db-card” style={{marginBottom:‘1.25rem’}}>
<div className="db-card-head"><div className="db-card-title">New formation</div></div>
<form onSubmit={add} style={{padding:‘1.4rem’,display:‘flex’,flexDirection:‘column’,gap:‘1rem’}}>
<div className="db-field"><label>Title</label><input value={form.title} onChange={e=>setForm(f=>({…f,title:e.target.value}))} placeholder=“e.g. Box Braids Masterclass” required/></div>
<div className="db-field"><label>Price (CAD)</label><input type=“number” value={form.price} onChange={e=>setForm(f=>({…f,price:e.target.value}))} placeholder=“149” required/></div>
<div className="db-field"><label>Duration</label><input value={form.duration_label} onChange={e=>setForm(f=>({…f,duration_label:e.target.value}))} placeholder=“e.g. 6h”/></div>
<div className="db-field"><label>Description</label><input value={form.description} onChange={e=>setForm(f=>({…f,description:e.target.value}))} placeholder=“What students will learn”/></div>
<button type=“submit” className=“db-btn db-btn-primary” style={{width:‘100%’,justifyContent:‘center’,padding:’.75rem’}}>Save formation</button>
</form>
</div>
)}
<div className="db-card">
{data.length===0
? <div style={{padding:‘2rem’,textAlign:‘center’,color:‘var(–ink-3)’,fontSize:’.85rem’}}>No formations yet.</div>
: data.map((f,i)=>(
<div key={f.id} style={{display:‘flex’,alignItems:‘center’,gap:‘1.25rem’,padding:‘1.25rem 1.4rem’,borderBottom:‘1px solid var(–border)’}}>
<div style={{fontFamily:‘Playfair Display,serif’,fontSize:‘2rem’,color:‘var(–border)’,minWidth:‘32px’}}>0{i+1}</div>
<div style={{flex:1}}>
<div style={{fontWeight:600,fontSize:’.88rem’}}>{f.title}</div>
<div style={{fontSize:’.78rem’,color:‘var(–ink-3)’}}>{f.description}</div>
<div style={{fontSize:’.73rem’,color:‘var(–ink-3)’,marginTop:’.35rem’}}>{f.duration_label}</div>
</div>
<div style={{fontFamily:‘Playfair Display,serif’,fontSize:‘1.3rem’}}>{fmt(f.price)}</div>
</div>
))
}
</div>
</div>
)
}

// ─── CLIENTS ──────────────────────────────────────────────────────────────────

function Clients({ workspace }) {
const [data, setData] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => { if (workspace) fetchData() }, [workspace])

async function fetchData() {
const { data } = await supabase.from(‘clients’).select(’*’).eq(‘workspace_id’,workspace.id).order(‘created_at’,{ascending:false})
setData(data||[])
setLoading(false)
}

return (
<div>
<div className="db-page-head"><div><div className="db-page-title">Clients</div><div className="db-page-sub">Your client base</div></div></div>
<div className="db-card">
{loading
? <div style={{padding:‘2rem’,color:‘var(–ink-3)’}}>Loading…</div>
: data.length===0
? <div style={{padding:‘2rem’,textAlign:‘center’,color:‘var(–ink-3)’,fontSize:’.85rem’}}>No clients yet. They appear here when they book.</div>
: <table className="db-tbl">
<thead><tr><th>Name</th><th>Email</th><th>Visits</th><th>Spent</th><th>Tag</th></tr></thead>
<tbody>{data.map(c=>(
<tr key={c.id}>
<td className="db-tbl-name">{c.full_name}</td>
<td>{c.email||’—’}</td>
<td>{c.total_visits}</td>
<td className="db-tbl-amount">{fmt(c.total_spent)}</td>
<td>{c.tag?<span className={`db-badge db-badge-${c.tag==='vip'?'vip':c.tag==='new'?'new':'confirmed'}`}>{c.tag.toUpperCase()}</span>:’—’}</td>
</tr>
))}</tbody>
</table>
}
</div>
</div>
)
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────

function Settings({ workspace, toast, refetch }) {
const [form, setForm] = useState({
name: workspace?.name||’’,
tagline: workspace?.tagline||’’,
location: workspace?.location||’’,
instagram: workspace?.instagram||’’,
phone: workspace?.phone||’’
})
const [loading, setLoading] = useState(false)
const [saved, setSaved] = useState(false)

async function save(e) {
e.preventDefault()
if (!workspace?.id) { toast(‘Error: workspace not loaded. Refresh and try again.’); return }
setLoading(true)
setSaved(false)
try {
const { error } = await supabase.from(‘workspaces’).update({
name: form.name, tagline: form.tagline, location: form.location,
instagram: form.instagram, phone: form.phone,
}).eq(‘id’, workspace.id)
if (error) { toast(`Error: ${error.message}`) }
else { setSaved(true); toast(‘Profile saved.’); refetch() }
} catch(err) { toast(`Error: ${err.message}`) }
setLoading(false)
}

async function publish() {
await supabase.from(‘workspaces’).update({is_published:!workspace.is_published}).eq(‘id’,workspace.id)
toast(workspace.is_published ? ‘Profile unpublished.’ : ‘Profile is now live!’)
refetch()
}

return (
<div>
<div className=“db-page-head” style={{flexWrap:‘wrap’,gap:’.75rem’}}>
<div><div className="db-page-title">Settings</div><div className="db-page-sub">Manage your profile</div></div>
<button className="db-btn db-btn-secondary" onClick={publish}>
{workspace?.is_published ? ‘Unpublish’ : ‘Publish profile’}
</button>
</div>
<div className="db-card">
<div className="db-card-head"><div className="db-card-title">Business profile</div></div>
<form onSubmit={save} style={{padding:‘1.4rem’,display:‘flex’,flexDirection:‘column’,gap:‘1rem’}}>
<div className="db-field"><label>Business name</label><input value={form.name} onChange={e=>setForm(f=>({…f,name:e.target.value}))} required/></div>
<div className="db-field"><label>Tagline</label><input value={form.tagline} onChange={e=>setForm(f=>({…f,tagline:e.target.value}))} placeholder=“e.g. Natural Hair Specialist · Montreal, QC”/></div>
<div className="db-field"><label>Location</label><input value={form.location} onChange={e=>setForm(f=>({…f,location:e.target.value}))}/></div>
<div className="db-field"><label>Phone</label><input value={form.phone} onChange={e=>setForm(f=>({…f,phone:e.target.value}))}/></div>
<div className="db-field"><label>Instagram</label><input value={form.instagram} onChange={e=>setForm(f=>({…f,instagram:e.target.value}))} placeholder=”@yourstudio”/></div>
<button type=“submit” className=“db-btn db-btn-primary” style={{width:‘100%’,padding:’.75rem’,justifyContent:‘center’}} disabled={loading}>
{loading ? ‘Saving…’ : saved ? ‘Saved ✓’ : ‘Save changes’}
</button>
</form>
</div>
</div>
)
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

const css = `
.db-shell{min-height:100vh;display:flex;flex-direction:column;}
.db-topbar{height:56px;background:#fff;border-bottom:1px solid var(–border);display:flex;align-items:center;justify-content:space-between;padding:0 1.5rem;position:sticky;top:0;z-index:50;gap:.75rem;}
.db-logo{font-family:‘Playfair Display’,serif;font-size:1.25rem;font-weight:600;color:var(–ink);}
.db-logo span{color:var(–gold);}
.db-topbar-right{display:flex;align-items:center;gap:.75rem;}
.db-avatar{width:34px;height:34px;border-radius:50%;background:var(–gold-lt);border:1px solid var(–gold);display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:600;color:var(–gold);cursor:pointer;}
.hamburger{background:none;border:none;cursor:pointer;display:flex;flex-direction:column;justify-content:center;gap:5px;width:34px;height:34px;padding:4px;border-radius:7px;transition:background .15s;}
.hamburger:hover{background:var(–border);}
.hamburger span{display:block;height:2px;width:20px;background:var(–ink);border-radius:2px;transition:all .25s ease;transform-origin:center;}
.hamburger.open span:nth-child(1){transform:translateY(6.5px) rotate(45deg);}
.hamburger.open span:nth-child(2){opacity:0;transform:scaleX(0);}
.hamburger.open span:nth-child(3){transform:translateY(-6.5px) rotate(-45deg);}
.db-body{display:flex;flex:1;position:relative;overflow:hidden;min-height:calc(100vh - 56px);}
.db-backdrop{position:fixed;inset:0;top:56px;background:rgba(0,0,0,.25);z-index:39;}
.db-sidebar{width:230px;background:#fff;border-right:1px solid var(–border);display:flex;flex-direction:column;padding:1.25rem 0;position:fixed;top:56px;left:0;bottom:0;z-index:40;transform:translateX(-100%);transition:transform .28s cubic-bezier(.4,0,.2,1);box-shadow:4px 0 24px rgba(0,0,0,.08);}
.db-sidebar.open{transform:translateX(0);}
.db-sidebar-label{font-size:.68rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(–ink-3);padding:.75rem 1.25rem .35rem;}
.db-nav-item{display:flex;align-items:center;padding:.55rem 1.25rem;cursor:pointer;color:var(–ink-3);font-size:.84rem;transition:all .15s;border-left:2px solid transparent;}
.db-nav-item:hover{color:var(–ink);background:var(–bg);}
.db-nav-item.active{color:var(–ink);background:var(–bg);border-left-color:var(–gold);font-weight:500;}
.db-sidebar-footer{margin-top:auto;padding:1rem 1.25rem;border-top:1px solid var(–border);}
.db-plan-label{font-size:.8rem;font-weight:600;color:var(–ink);}
.db-plan-sub{font-size:.72rem;color:var(–ink-3);margin-top:.1rem;}
.db-plan-bar{height:4px;background:var(–border);border-radius:2px;margin-top:.5rem;}
.db-plan-fill{height:100%;width:62%;background:var(–gold);border-radius:2px;}
.db-main{flex:1;padding:2rem 2.25rem;overflow-y:auto;background:var(–bg);}
.db-page-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1.75rem;}
.db-page-title{font-family:‘Playfair Display’,serif;font-size:1.75rem;font-weight:500;color:var(–ink);}
.db-page-sub{font-size:.82rem;color:var(–ink-3);margin-top:.25rem;}
.db-btn{display:inline-flex;align-items:center;gap:.4rem;padding:.5rem 1.1rem;border-radius:8px;font-size:.82rem;font-weight:500;cursor:pointer;border:none;font-family:inherit;transition:all .15s;}
.db-btn-primary{background:var(–ink);color:#fff;}
.db-btn-primary:hover{background:#2a2a2a;}
.db-btn-secondary{background:#fff;color:var(–ink);border:1px solid var(–border-2);}
.db-btn-secondary:hover{border-color:var(–ink-3);}
.db-btn-xs{padding:.25rem .65rem;font-size:.72rem;}

.db-stats-row{display:grid;grid-template-columns:repeat(2,1fr);gap:1rem;margin-bottom:1.5rem;}
.db-stat-card{background:#fff;border:1px solid var(–border);border-radius:12px;padding:1.25rem 1.4rem;position:relative;}
.db-stat-card-btn{width:100%;text-align:left;cursor:pointer;font-family:inherit;transition:transform .2s cubic-bezier(.34,1.4,.64,1),box-shadow .2s ease,border-color .2s ease;}
.db-stat-card-btn:hover{transform:translateY(-3px) scale(1.02);box-shadow:0 10px 28px rgba(0,0,0,.1);border-color:var(–gold);}
.db-stat-card-btn:active{transform:scale(0.96);box-shadow:none;transition:transform .08s ease;}
.db-stat-arrow{position:absolute;bottom:1rem;right:1.1rem;font-size:.85rem;color:var(–gold);opacity:0;transform:translateX(-5px);transition:opacity .18s ease,transform .18s ease;}
.db-stat-card-btn:hover .db-stat-arrow{opacity:1;transform:translateX(0);}
.db-stat-label{font-size:.72rem;font-weight:500;color:var(–ink-3);letter-spacing:.05em;text-transform:uppercase;margin-bottom:.5rem;}
.db-stat-value{font-family:‘Playfair Display’,serif;font-size:1.85rem;font-weight:500;color:var(–ink);line-height:1;}
.db-stat-delta{font-size:.73rem;color:var(–ink-3);margin-top:.4rem;}

.db-card{background:#fff;border:1px solid var(–border);border-radius:10px;overflow:hidden;margin-bottom:1.25rem;}
.db-card-head{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.4rem;border-bottom:1px solid var(–border);}
.db-card-title{font-size:.88rem;font-weight:600;}
.db-tbl{width:100%;border-collapse:collapse;}
.db-tbl th{padding:.65rem 1.25rem;font-size:.7rem;font-weight:600;color:var(–ink-3);text-transform:uppercase;letter-spacing:.07em;text-align:left;background:#faf9f7;border-bottom:1px solid var(–border);}
.db-tbl td{padding:.85rem 1.25rem;font-size:.83rem;color:var(–ink-2);border-bottom:1px solid var(–border);vertical-align:middle;}
.db-tbl tr:last-child td{border-bottom:none;}
.db-tbl tbody tr:hover td{background:#faf9f7;}
.db-tbl-name{font-weight:500;color:var(–ink)!important;}
.db-tbl-amount{font-weight:600;color:var(–ink)!important;}
.db-badge{display:inline-flex;align-items:center;gap:.3rem;padding:2px 9px;border-radius:20px;font-size:.7rem;font-weight:500;}
.db-badge::before{content:’’;width:5px;height:5px;border-radius:50%;flex-shrink:0;}
.db-badge-confirmed{background:#ecfdf5;color:#2e7d52;} .db-badge-confirmed::before{background:#2e7d52;}
.db-badge-pending{background:#fefce8;color:#854d0e;} .db-badge-pending::before{background:#ca8a04;}
.db-badge-cancelled{background:#fef2f2;color:#c0392b;} .db-badge-cancelled::before{background:#c0392b;}
.db-badge-completed{background:#eff6ff;color:#1d4ed8;} .db-badge-completed::before{background:#1d4ed8;}
.db-badge-vip{background:#fdf4e7;color:#b5893a;} .db-badge-vip::before{background:#b5893a;}
.db-badge-new{background:#eff6ff;color:#1d4ed8;} .db-badge-new::before{background:#1d4ed8;}
.db-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;}
.db-prod-card{background:#fff;border:1px solid var(–border);border-radius:10px;overflow:hidden;}
.db-prod-img{height:120px;background:#f5f3ee;display:flex;align-items:center;justify-content:center;font-size:.72rem;color:var(–ink-3);letter-spacing:.06em;text-transform:uppercase;border-bottom:1px solid var(–border);}
.db-prod-body{padding:1rem;}
.db-prod-name{font-weight:600;font-size:.85rem;margin-bottom:.2rem;}
.db-prod-price{font-family:‘Playfair Display’,serif;font-size:1.1rem;margin-bottom:.5rem;}
.db-field{display:flex;flex-direction:column;}
.db-field label{font-size:.75rem;font-weight:500;color:var(–ink-3);margin-bottom:.4rem;letter-spacing:.03em;}
.db-field input{padding:.7rem 1rem;border:1px solid var(–border);border-radius:8px;font-size:.88rem;font-family:inherit;color:var(–ink);background:#fff;outline:none;transition:border .15s;}
.db-field input:focus{border-color:var(–gold);box-shadow:0 0 0 3px rgba(181,137,58,.1);}
.db-toast{position:fixed;bottom:1.75rem;right:1.75rem;background:var(–ink);color:#fff;padding:.85rem 1.4rem;border-radius:9px;font-size:.82rem;z-index:200;box-shadow:0 8px 24px rgba(0,0,0,.2);border-left:3px solid var(–gold);}

.db-slug-link{display:block;color:var(–ink-3);text-decoration:none;transition:color .15s;}
.db-slug-link:hover{color:var(–gold);text-decoration:underline;cursor:pointer;}

.rev-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:200;display:flex;align-items:flex-end;animation:revFadeIn .2s ease;}
.rev-panel{background:#fff;width:100%;max-width:520px;margin:0 auto;border-radius:20px 20px 0 0;padding:1.75rem 1.5rem 3rem;animation:revSlideUp .32s cubic-bezier(.34,1.15,.64,1);}
@keyframes revSlideUp{from{transform:translateY(100%);}to{transform:translateY(0);}}
@keyframes revFadeIn{from{opacity:0;}to{opacity:1;}}
.rev-panel-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:.5rem;}
.rev-panel-title{font-family:‘Playfair Display’,serif;font-size:1.5rem;font-weight:500;color:var(–ink);}
.rev-panel-sub{font-size:.78rem;color:var(–ink-3);margin-top:.15rem;text-transform:capitalize;}
.rev-close{background:var(–bg);border:none;width:32px;height:32px;border-radius:50%;font-size:.85rem;cursor:pointer;color:var(–ink-3);display:flex;align-items:center;justify-content:center;transition:background .15s;}
.rev-close:hover{background:var(–border);}
.rev-total{font-family:‘Playfair Display’,serif;font-size:2.8rem;font-weight:500;color:var(–ink);margin-bottom:1.5rem;letter-spacing:-.01em;}
.rev-chart-wrap{position:relative;margin-bottom:1.5rem;background:var(–bg);border-radius:10px;padding:1rem 1rem .25rem;}
.rev-axis{position:relative;height:20px;font-size:.68rem;color:var(–ink-3);margin-top:.4rem;}
.rev-pills{display:flex;flex-direction:column;gap:.6rem;margin-bottom:1.25rem;}
.rev-pill{display:flex;align-items:center;gap:.85rem;background:var(–bg);border-radius:10px;padding:.75rem 1rem;}
.rev-pill-icon{width:30px;height:30px;border-radius:50%;background:#ecfdf5;color:#2e7d52;display:flex;align-items:center;justify-content:center;font-size:.9rem;font-weight:700;flex-shrink:0;}
.rev-pill-avg{background:#fdf4e7;color:#b5893a;}
.rev-pill-low{background:#fef2f2;color:#c0392b;}
.rev-pill-label{font-size:.7rem;color:var(–ink-3);margin-bottom:.1rem;}
.rev-pill-val{font-size:.9rem;font-weight:600;color:var(–ink);}
.rev-narrative{font-size:.82rem;color:var(–ink-3);line-height:1.7;padding:.9rem 1rem;background:var(–bg);border-radius:10px;border-left:3px solid var(–gold);}

@media(max-width:600px){
.db-stats-row{grid-template-columns:repeat(2,1fr);}
.db-grid-3{grid-template-columns:repeat(2,1fr);}
.db-main{padding:1.25rem;}
.db-page-head{flex-direction:column;align-items:flex-start;}
.db-tbl th,.db-tbl td{padding:.6rem .75rem;font-size:.75rem;}
.rev-panel{border-radius:16px 16px 0 0;padding:1.5rem 1.25rem 2.5rem;}
.rev-total{font-size:2.2rem;}
}
`
