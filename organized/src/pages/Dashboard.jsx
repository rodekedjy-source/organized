import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const fmt = (n) => `$${Number(n || 0).toLocaleString()}`

export default function Dashboard({ session }) {
  const [page, setPage] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [workspace, setWorkspace] = useState(null)
  const [toast, setToast] = useState('')
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => { fetchWorkspace() }, [session])

  async function fetchWorkspace() {
    const { data } = await supabase.from('workspaces').select('*').eq('user_id', session.user.id).single()
    setWorkspace(data)
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000) }

 async function handleSignOut() { await supabase.auth.signOut(); window.location.href = '/' }

  const navItems = [
    { key: 'overview', label: 'Overview' },
    { key: 'services', label: 'Services' },
    { key: 'appointments', label: 'Appointments' },
    { key: 'products', label: 'Products' },
    { key: 'formations', label: 'Formations' },
    { key: 'clients', label: 'Clients' },
    { key: 'availability', label: 'Availability' },
    { key: 'settings', label: 'Settings' },
  ]

  return (
    <>
      <style>{css}</style>
      <div className="db-shell">
        <div className="db-topbar">
          <div style={{display:'flex',alignItems:'center',gap:'.85rem'}}>
            <button className={`hamburger ${sidebarOpen?'open':''}`} onClick={()=>setSidebarOpen(o=>!o)}>
              <span/><span/><span/>
            </button>
            <div className="db-logo" style={{cursor:'pointer'}} onClick={()=>{setPage('overview');setSidebarOpen(false)}}>Organized<span>.</span></div>
          </div>
          <div className="db-topbar-right">
            <div style={{position:'relative'}}>
              <div className="db-avatar" onClick={()=>setShowMenu(o=>!o)}>
                {session.user.email?.[0]?.toUpperCase()}
              </div>
              {showMenu && (
                <div style={{position:'absolute',right:0,top:'42px',background:'#fff',border:'1px solid #e4e2dc',borderRadius:'10px',boxShadow:'0 8px 24px rgba(0,0,0,.1)',minWidth:'180px',zIndex:100,overflow:'hidden'}}>
                  <div style={{padding:'.65rem 1rem',fontSize:'.75rem',color:'#7a7774',borderBottom:'1px solid #e4e2dc',fontWeight:400}}>{session.user.email}</div>
                  <div style={{padding:'.65rem 1rem',fontSize:'.82rem',color:'#111110',cursor:'pointer'}} onClick={()=>{setPage('settings');setShowMenu(false)}}>Settings</div>
                  <div style={{padding:'.65rem 1rem',fontSize:'.82rem',color:'#c0392b',cursor:'pointer',borderTop:'1px solid #e4e2dc'}} onClick={handleSignOut}>Sign out</div>
                </div>
              )}
            </div>
          </div>
        </div>

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
              <div className="db-plan-sub">beorganized.io/{workspace?.slug || '...'}</div>
              <div className="db-plan-bar"><div className="db-plan-fill"/></div>
            </div>
          </aside>

          <main className="db-main">
            {page === 'overview' && <Overview workspace={workspace} toast={showToast} setPage={setPage}/>}
            {page === 'services' && <Services workspace={workspace} toast={showToast}/>}
            {page === 'appointments' && <Appointments workspace={workspace} toast={showToast}/>}
            {page === 'products' && <Products workspace={workspace} toast={showToast}/>}
            {page === 'formations' && <Formations workspace={workspace} toast={showToast}/>}
            {page === 'clients' && <Clients workspace={workspace} toast={showToast}/>}
            {page === 'availability' && <Availability workspace={workspace} toast={showToast}/>}
            {page === 'settings' && <Settings workspace={workspace} toast={showToast} refetch={fetchWorkspace}/>}
          </main>
        </div>
        {toast && <div className="db-toast">{toast}</div>}
      </div>
    </>
  )
}

function Overview({ workspace, toast, setPage }) {
  const [appts, setAppts] = useState([])
  const [stats, setStats] = useState({ revenue:0, appointments:0, products:0, students:0, pending:0 })

  useEffect(() => {
    if (!workspace) return
    fetchData()
    const channel = supabase
      .channel('overview-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `workspace_id=eq.${workspace.id}` }, () => fetchData())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [workspace])

  async function fetchData() {
    const today = new Date().toISOString().split('T')[0]
    const [a, p, e] = await Promise.all([
      supabase.from('appointments').select('*').eq('workspace_id', workspace.id).is('deleted_at', null),
      supabase.from('products').select('*').eq('workspace_id', workspace.id).is('deleted_at', null),
      supabase.from('enrollments').select('*').eq('workspace_id', workspace.id).is('deleted_at', null),
    ])
    const apptData = a.data || []
    const completedRevenue = apptData.filter(x => x.status === 'completed').reduce((s,x) => s + Number(x.amount || 0), 0)
    const pending = apptData.filter(x => x.status === 'pending').length
    setStats({
      revenue: completedRevenue,
      appointments: apptData.length,
      products: (p.data || []).length,
      students: (e.data || []).length,
      pending,
    })
    const todayAppts = apptData.filter(x => x.scheduled_at?.startsWith(today))
    setAppts(todayAppts)
  }

  function copyLink() {
    if (workspace?.slug) {
      navigator.clipboard.writeText(`${window.location.origin}/${workspace.slug}`)
      toast('Booking link copied!')
    }
  }

  return (
    <div>
      <div className="db-page-head">
        <div>
          <div className="db-page-title">Overview</div>
          <div className="db-page-sub">{new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
        </div>
        <div style={{display:'flex',gap:'.6rem',flexWrap:'wrap'}}>
          <button className="db-btn db-btn-secondary db-btn-xs" onClick={copyLink}>Copy booking link</button>
        </div>
      </div>

      <div className="db-stats-row">
        {[
         {label:'Total Revenue',   value:fmt(stats.revenue),      delta:'All time',          page:'appointments'},
{label:'Appointments',    value:stats.appointments,       delta:'Total bookings',    page:'appointments'},
{label:'Products',        value:stats.products,           delta:'Listed',            page:'products'},
{label:'Students',        value:stats.students,           delta:'Total enrollments', page:'formations'},
       ].map((s,i)=>(
  <button key={i} className="db-stat-card db-stat-card-btn" onClick={()=>setPage(s.page)}>
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
    </div>
  )
}

function Appointments({ workspace, toast }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!workspace) return
    fetchData()
    const channel = supabase
      .channel('appointments-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `workspace_id=eq.${workspace.id}` }, () => fetchData())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [workspace])

  async function fetchData() {
    const { data } = await supabase.from('appointments').select('*').eq('workspace_id', workspace.id).is('deleted_at', null).order('scheduled_at',{ascending:false})
    setData(data||[])
    setLoading(false)
  }

  async function updateStatus(id, status, label) {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id)
    if (error) { toast(`Error: ${error.message}`); return }
    toast(`Appointment ${label}.`)
  }

  const filtered = filter === 'all' ? data : data.filter(a => a.status === filter)
  const pendingCount = data.filter(a => a.status === 'pending').length

  return (
    <div>
      <div className="db-page-head">
        <div>
          <div className="db-page-title">Appointments</div>
          <div className="db-page-sub">
            Manage your bookings
            {pendingCount > 0 && <span style={{color:'#b5893a',fontWeight:500}}> · {pendingCount} pending</span>}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{display:'flex',gap:'.4rem',marginBottom:'1.25rem',flexWrap:'wrap'}}>
        {[['all','All'],['pending','Pending'],['confirmed','Confirmed'],['completed','Completed'],['cancelled','Cancelled']].map(([k,l]) => (
          <button key={k}
            className={`db-btn db-btn-xs ${filter===k ? 'db-btn-primary' : 'db-btn-secondary'}`}
            onClick={() => setFilter(k)}>
            {l} {k !== 'all' ? `(${data.filter(a=>a.status===k).length})` : `(${data.length})`}
          </button>
        ))}
      </div>

      <div className="db-card">
        {loading ? <div style={{padding:'2rem',color:'var(--ink-3)'}}>Loading...</div>
        : filtered.length===0 ? <div style={{padding:'2rem',textAlign:'center',color:'var(--ink-3)',fontSize:'.85rem'}}>No appointments {filter !== 'all' ? `with status "${filter}"` : 'yet'}.</div>
        : <table className="db-tbl">
          <thead><tr><th>Client</th><th>Contact</th><th>Date</th><th>Time</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map(a=>(
            <tr key={a.id}>
              <td className="db-tbl-name">{a.client_name}</td>
              <td style={{fontSize:'.75rem',color:'var(--ink-3)'}}>
                {a.client_email && <div>{a.client_email}</div>}
                {a.client_phone && <div>{a.client_phone}</div>}
                {!a.client_email && !a.client_phone && '—'}
              </td>
              <td>{new Date(a.scheduled_at).toLocaleDateString()}</td>
              <td>{new Date(a.scheduled_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</td>
              <td className="db-tbl-amount">{fmt(a.amount)}</td>
              <td><span className={`db-badge db-badge-${a.status}`}>{a.status}</span></td>
              <td>
                <div style={{display:'flex',gap:'.35rem',flexWrap:'wrap'}}>
                  {a.status==='pending' && (
                    <>
                      <button className="db-btn db-btn-xs" style={{background:'#2e7d52',color:'#fff',border:'none'}} onClick={()=>updateStatus(a.id,'confirmed','confirmed')}>Confirm</button>
                      <button className="db-btn db-btn-xs" style={{background:'#fff',color:'#c0392b',border:'1px solid #fecaca'}} onClick={()=>updateStatus(a.id,'cancelled','declined')}>Decline</button>
                    </>
                  )}
                  {a.status==='confirmed' && (
                    <>
                      <button className="db-btn db-btn-xs" style={{background:'#b5893a',color:'#fff',border:'none'}} onClick={()=>updateStatus(a.id,'completed','completed')}>Complete</button>
                      <button className="db-btn db-btn-xs" style={{background:'#fff',color:'#c0392b',border:'1px solid #fecaca'}} onClick={()=>updateStatus(a.id,'cancelled','cancelled')}>Cancel</button>
                      <button className="db-btn db-btn-xs db-btn-secondary" onClick={()=>updateStatus(a.id,'no_show','marked as no-show')}>No-show</button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}</tbody>
        </table>
        }
      </div>
    </div>
  )
}

function Services({ workspace, toast }) {
  const [data, setData] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({name:'',price:'',duration_min:'',description:''})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { if (workspace) fetchData() }, [workspace])

  async function fetchData() {
    const { data } = await supabase.from('services').select('*').eq('workspace_id',workspace.id).is('deleted_at', null).order('display_order',{ascending:true})
    setData(data||[])
  }

  async function add(e) {
    e.preventDefault()
    setError('')
    const price = parseFloat(form.price)
    const duration = parseInt(form.duration_min)
    if (isNaN(price) || price < 0) return setError('Price must be 0 or more.')
    if (form.duration_min && (isNaN(duration) || duration <= 0)) return setError('Duration must be a positive number.')

    setLoading(true)
    const { error: dbError } = await supabase.from('services').insert({
      workspace_id: workspace.id,
      name: form.name.trim(),
      price: price,
      duration_min: duration || null,
      description: form.description,
      is_free: price === 0,
    })

    if (dbError) {
      let msg = dbError.message
      if (msg.includes('chk_services_price')) msg = 'Price must be 0 or more.'
      else if (msg.includes('chk_services_duration')) msg = 'Duration must be a positive number.'
      else if (msg.includes('chk_services_name')) msg = 'Please enter a service name.'
      setError(msg)
      setLoading(false)
      return
    }

    toast(`${form.name} added.`)
    setForm({name:'',price:'',duration_min:'',description:''})
    setShowForm(false)
    setLoading(false)
    fetchData()
  }

  async function remove(id, name) {
    await supabase.from('services').update({ deleted_at: new Date().toISOString() }).eq('id', id)
    toast(`${name} removed.`)
    fetchData()
  }

  async function toggle(id, current) {
    await supabase.from('services').update({is_active:!current}).eq('id',id)
    fetchData()
  }

  return (
    <div>
      <div className="db-page-head">
        <div>
          <div className="db-page-title">Services</div>
          <div className="db-page-sub">What you offer — appears on your public profile</div>
        </div>
        <button className="db-btn db-btn-primary" onClick={()=>{setShowForm(s=>!s);setError('')}}>
          {showForm ? 'Cancel' : '+ Add service'}
        </button>
      </div>

      {showForm && (
        <div className="db-card" style={{marginBottom:'1.25rem'}}>
          <div className="db-card-head"><div className="db-card-title">New service</div></div>
          <form onSubmit={add} style={{padding:'1.4rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
            {error && <div className="db-form-error">{error}</div>}
            <div className="db-field"><label>Service name</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Box Braids" required/></div>
            <div className="db-field"><label>Price (CAD) — enter 0 for free</label><input type="number" step="0.01" min="0" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="180" required/></div>
            <div className="db-field"><label>Duration (minutes)</label><input type="number" min="1" value={form.duration_min} onChange={e=>setForm(f=>({...f,duration_min:e.target.value}))} placeholder="240"/></div>
            <div className="db-field"><label>Description (optional)</label><input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Short description of the service"/></div>
            <button type="submit" className="db-btn db-btn-primary" style={{width:'100%',justifyContent:'center',padding:'.75rem'}} disabled={loading}>
              {loading ? 'Saving...' : 'Save service'}
            </button>
          </form>
        </div>
      )}

      <div className="db-card">
        {data.length === 0 ? (
          <div style={{padding:'3rem',textAlign:'center',color:'var(--ink-3)',fontSize:'.85rem'}}>
            No services yet. Add your first service to start receiving bookings.
          </div>
        ) : (
          <table className="db-tbl">
            <thead><tr><th>Service</th><th>Price</th><th>Duration</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {data.map(s => (
                <tr key={s.id}>
                  <td className="db-tbl-name">{s.name}</td>
                  <td className="db-tbl-amount">{s.is_free ? 'Free' : fmt(s.price)}</td>
                  <td>{s.duration_min ? `${s.duration_min} min` : '—'}</td>
                  <td>
                    <span className={`db-badge ${s.is_active ? 'db-badge-confirmed' : 'db-badge-cancelled'}`}>
                      {s.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td style={{display:'flex',gap:'.4rem'}}>
                    <button className="db-btn db-btn-secondary db-btn-xs" onClick={()=>toggle(s.id,s.is_active)}>
                      {s.is_active ? 'Hide' : 'Show'}
                    </button>
                    <button className="db-btn db-btn-xs" style={{color:'#c0392b',border:'1px solid #fecaca',background:'#fff'}} onClick={()=>remove(s.id,s.name)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function Products({ workspace, toast }) {
  const [data, setData] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({name:'',price:'',stock:'',description:''})
  const [error, setError] = useState('')

  useEffect(() => { if (workspace) fetchData() }, [workspace])

  async function fetchData() {
    const { data } = await supabase.from('products').select('*').eq('workspace_id',workspace.id).is('deleted_at', null).order('created_at',{ascending:false})
    setData(data||[])
  }

  async function add(e) {
    e.preventDefault()
    setError('')
    const price = parseFloat(form.price)
    const stock = parseInt(form.stock) || 0
    if (isNaN(price) || price < 0) return setError('Price must be 0 or more.')
    if (stock < 0) return setError('Stock cannot be negative.')

    const { error: dbError } = await supabase.from('products').insert({
      workspace_id: workspace.id, name: form.name.trim(), price, stock, description: form.description
    })

    if (dbError) {
      let msg = dbError.message
      if (msg.includes('chk_products_price')) msg = 'Price must be 0 or more.'
      else if (msg.includes('chk_products_stock')) msg = 'Stock cannot be negative.'
      else if (msg.includes('chk_products_name')) msg = 'Please enter a product name.'
      setError(msg)
      return
    }

    toast(`${form.name} added.`)
    setForm({name:'',price:'',stock:'',description:''})
    setShowForm(false)
    fetchData()
  }

  return (
    <div>
      <div className="db-page-head">
        <div><div className="db-page-title">Products</div><div className="db-page-sub">Sell from your profile page</div></div>
        <button className="db-btn db-btn-primary" onClick={()=>{setShowForm(s=>!s);setError('')}}>{showForm?'Cancel':'Add product'}</button>
      </div>

      {showForm && (
        <div className="db-card" style={{marginBottom:'1.25rem'}}>
          <div className="db-card-head"><div className="db-card-title">New product</div></div>
          <form onSubmit={add} style={{padding:'1.4rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
            {error && <div className="db-form-error">{error}</div>}
            <div className="db-field"><label>Product name</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Moisture Serum" required/></div>
            <div className="db-field"><label>Price (CAD)</label><input type="number" step="0.01" min="0" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="28" required/></div>
            <div className="db-field"><label>Stock quantity</label><input type="number" min="0" value={form.stock} onChange={e=>setForm(f=>({...f,stock:e.target.value}))} placeholder="10"/></div>
            <div className="db-field"><label>Description (optional)</label><input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/></div>
            <button type="submit" className="db-btn db-btn-primary" style={{width:'100%',justifyContent:'center',padding:'.75rem'}}>Save product</button>
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
              <span className={`db-badge ${p.stock===0?'db-badge-cancelled':p.stock<10?'db-badge-pending':'db-badge-confirmed'}`}>{p.stock===0?'Out of stock':`${p.stock} in stock`}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Formations({ workspace, toast }) {
  const [data, setData] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({title:'',price:'',duration_label:'',description:'',max_students:''})
  const [error, setError] = useState('')

  useEffect(() => { if (workspace) fetchData() }, [workspace])

  async function fetchData() {
    const { data } = await supabase.from('offerings').select('*').eq('workspace_id',workspace.id).is('deleted_at', null).order('created_at',{ascending:false})
    setData(data||[])
  }

  async function add(e) {
    e.preventDefault()
    setError('')
    const price = parseFloat(form.price)
    if (isNaN(price) || price < 0) return setError('Price must be 0 or more.')

    const { error: dbError } = await supabase.from('offerings').insert({
      workspace_id: workspace.id,
      title: form.title.trim(),
      price,
      duration_label: form.duration_label,
      description: form.description,
      max_students: form.max_students ? parseInt(form.max_students) : null,
    })

    if (dbError) {
      setError(dbError.message)
      return
    }

    toast(`"${form.title}" created.`)
    setForm({title:'',price:'',duration_label:'',description:'',max_students:''})
    setShowForm(false)
    fetchData()
  }

  return (
    <div>
      <div className="db-page-head">
        <div><div className="db-page-title">Formations</div><div className="db-page-sub">Sell courses and workshops</div></div>
        <button className="db-btn db-btn-primary" onClick={()=>{setShowForm(s=>!s);setError('')}}>{showForm?'Cancel':'Create formation'}</button>
      </div>

      {showForm && (
        <div className="db-card" style={{marginBottom:'1.25rem'}}>
          <div className="db-card-head"><div className="db-card-title">New formation</div></div>
          <form onSubmit={add} style={{padding:'1.4rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
            {error && <div className="db-form-error">{error}</div>}
            <div className="db-field"><label>Title</label><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Box Braids Masterclass" required/></div>
            <div className="db-field"><label>Price (CAD)</label><input type="number" step="0.01" min="0" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="149" required/></div>
            <div className="db-field"><label>Max students (optional)</label><input type="number" min="1" value={form.max_students} onChange={e=>setForm(f=>({...f,max_students:e.target.value}))} placeholder="e.g. 12"/></div>
            <div className="db-field"><label>Duration</label><input value={form.duration_label} onChange={e=>setForm(f=>({...f,duration_label:e.target.value}))} placeholder="e.g. 6h"/></div>
            <div className="db-field"><label>Description</label><input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="What students will learn"/></div>
            <button type="submit" className="db-btn db-btn-primary" style={{width:'100%',justifyContent:'center',padding:'.75rem'}}>Save formation</button>
          </form>
        </div>
      )}

      <div className="db-card">
        {data.length===0 ? <div style={{padding:'2rem',textAlign:'center',color:'var(--ink-3)',fontSize:'.85rem'}}>No formations yet.</div>
        : data.map((f,i)=>(
          <div key={f.id} style={{display:'flex',alignItems:'center',gap:'1.25rem',padding:'1.25rem 1.4rem',borderBottom:'1px solid var(--border)'}}>
            <div style={{fontFamily:'Playfair Display,serif',fontSize:'2rem',color:'var(--border)',minWidth:'32px'}}>0{i+1}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:600,fontSize:'.88rem'}}>{f.title}</div>
              <div style={{fontSize:'.78rem',color:'var(--ink-3)'}}>{f.description}</div>
              <div style={{fontSize:'.73rem',color:'var(--ink-3)',marginTop:'.35rem'}}>
                {f.duration_label}
                {f.max_students && ` · Max ${f.max_students} students`}
              </div>
            </div>
            <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.3rem'}}>{fmt(f.price)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Clients({ workspace }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (workspace) fetchData() }, [workspace])

  async function fetchData() {
    const { data } = await supabase.from('clients').select('*').eq('workspace_id',workspace.id).is('deleted_at', null).order('created_at',{ascending:false})
    setData(data||[])
    setLoading(false)
  }

  return (
    <div>
      <div className="db-page-head">
        <div>
          <div className="db-page-title">Clients</div>
          <div className="db-page-sub">Your client base — {data.length} total</div>
        </div>
      </div>
      <div className="db-card">
        {loading ? <div style={{padding:'2rem',color:'var(--ink-3)'}}>Loading...</div>
        : data.length===0 ? <div style={{padding:'2rem',textAlign:'center',color:'var(--ink-3)',fontSize:'.85rem'}}>No clients yet. They appear here automatically when they book.</div>
        : <table className="db-tbl">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Visits</th><th>Spent</th><th>Last visit</th><th>Tag</th></tr></thead>
          <tbody>{data.map(c=>(
            <tr key={c.id}>
              <td className="db-tbl-name">{c.full_name}</td>
              <td>{c.email||'—'}</td>
              <td>{c.phone||'—'}</td>
              <td>{c.total_visits}</td>
              <td className="db-tbl-amount">{fmt(c.total_spent)}</td>
              <td style={{fontSize:'.78rem',color:'var(--ink-3)'}}>
                {c.last_visit_at ? new Date(c.last_visit_at).toLocaleDateString() : '—'}
              </td>
              <td>{c.tag?<span className={`db-badge db-badge-${c.tag==='vip'?'vip':c.tag==='new'?'new':'confirmed'}`}>{c.tag.toUpperCase()}</span>:'—'}</td>
            </tr>
          ))}</tbody>
        </table>
        }
      </div>
    </div>
  )
}

const DAY_LABELS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

function Availability({ workspace, toast }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [blockedDates, setBlockedDates] = useState([])
  const [newBlocked, setNewBlocked] = useState({ date:'', reason:'' })

  useEffect(() => { if (workspace) fetchData() }, [workspace])

  async function fetchData() {
    const [{ data: avail }, { data: blocked }] = await Promise.all([
      supabase.from('availability').select('*').eq('workspace_id', workspace.id).order('day_of_week'),
      supabase.from('blocked_dates').select('*').eq('workspace_id', workspace.id).order('blocked_date', { ascending: true }),
    ])
    setData(avail || [])
    setBlockedDates(blocked || [])
    setLoading(false)
  }

  function updateDay(dayOfWeek, field, value) {
    setData(prev => prev.map(d => d.day_of_week === dayOfWeek ? { ...d, [field]: value } : d))
  }

  async function saveAll() {
    setSaving(true)
    for (const day of data) {
      const { error } = await supabase.from('availability')
        .update({ is_open: day.is_open, open_time: day.open_time, close_time: day.close_time })
        .eq('id', day.id)
      if (error) {
        let msg = error.message
        if (msg.includes('chk_availability_times')) msg = `${DAY_LABELS[day.day_of_week]}: opening time must be before closing time.`
        toast(`Error: ${msg}`)
        setSaving(false)
        return
      }
    }
    toast('Availability saved.')
    setSaving(false)
  }

  async function addBlockedDate(e) {
    e.preventDefault()
    if (!newBlocked.date) return
    const { error } = await supabase.from('blocked_dates').insert({
      workspace_id: workspace.id,
      blocked_date: newBlocked.date,
      reason: newBlocked.reason || null,
    })
    if (error) { toast(`Error: ${error.message}`); return }
    toast('Date blocked.')
    setNewBlocked({ date:'', reason:'' })
    fetchData()
  }

  async function removeBlocked(id) {
    await supabase.from('blocked_dates').delete().eq('id', id)
    toast('Date unblocked.')
    fetchData()
  }

  if (loading) return <div style={{padding:'2rem',color:'var(--ink-3)'}}>Loading...</div>

  return (
    <div>
      <div className="db-page-head">
        <div>
          <div className="db-page-title">Availability</div>
          <div className="db-page-sub">Set your business hours and blocked dates</div>
        </div>
        <button className="db-btn db-btn-primary" onClick={saveAll} disabled={saving}>
          {saving ? 'Saving...' : 'Save hours'}
        </button>
      </div>

      {/* Weekly hours */}
      <div className="db-card">
        <div className="db-card-head"><div className="db-card-title">Weekly hours</div></div>
        <div style={{padding:'0'}}>
          {data.map(day => (
            <div key={day.day_of_week} style={{
              display:'flex', alignItems:'center', gap:'1rem', padding:'.85rem 1.4rem',
              borderBottom:'1px solid var(--border)', flexWrap:'wrap'
            }}>
              <div style={{width:'100px',fontWeight:500,fontSize:'.85rem'}}>{DAY_LABELS[day.day_of_week]}</div>
              <label style={{display:'flex',alignItems:'center',gap:'.4rem',cursor:'pointer',fontSize:'.82rem'}}>
                <input
                  type="checkbox"
                  checked={day.is_open}
                  onChange={e => updateDay(day.day_of_week, 'is_open', e.target.checked)}
                  style={{accentColor:'#b5893a'}}
                />
                {day.is_open ? 'Open' : 'Closed'}
              </label>
              {day.is_open && (
                <div style={{display:'flex',alignItems:'center',gap:'.4rem',marginLeft:'auto'}}>
                  <input
                    type="time"
                    value={day.open_time?.slice(0,5) || '09:00'}
                    onChange={e => updateDay(day.day_of_week, 'open_time', e.target.value + ':00')}
                    className="db-time-input"
                  />
                  <span style={{fontSize:'.78rem',color:'var(--ink-3)'}}>to</span>
                  <input
                    type="time"
                    value={day.close_time?.slice(0,5) || '18:00'}
                    onChange={e => updateDay(day.day_of_week, 'close_time', e.target.value + ':00')}
                    className="db-time-input"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Blocked dates */}
      <div className="db-card">
        <div className="db-card-head"><div className="db-card-title">Blocked dates</div></div>
        <form onSubmit={addBlockedDate} style={{padding:'1rem 1.4rem',display:'flex',gap:'.6rem',alignItems:'flex-end',flexWrap:'wrap',borderBottom:'1px solid var(--border)'}}>
          <div className="db-field" style={{flex:'1',minWidth:'140px'}}>
            <label>Date</label>
            <input type="date" value={newBlocked.date} onChange={e => setNewBlocked(f=>({...f,date:e.target.value}))} required/>
          </div>
          <div className="db-field" style={{flex:'2',minWidth:'160px'}}>
            <label>Reason (optional)</label>
            <input value={newBlocked.reason} onChange={e => setNewBlocked(f=>({...f,reason:e.target.value}))} placeholder="e.g. Holiday, vacation"/>
          </div>
          <button type="submit" className="db-btn db-btn-primary" style={{marginBottom:'0'}}>Block date</button>
        </form>
        {blockedDates.length === 0 ? (
          <div style={{padding:'1.5rem',textAlign:'center',color:'var(--ink-3)',fontSize:'.85rem'}}>No blocked dates.</div>
        ) : (
          <div>
            {blockedDates.map(b => (
              <div key={b.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'.75rem 1.4rem',borderBottom:'1px solid var(--border)'}}>
                <div>
                  <span style={{fontWeight:500,fontSize:'.85rem'}}>{new Date(b.blocked_date + 'T12:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'})}</span>
                  {b.reason && <span style={{fontSize:'.78rem',color:'var(--ink-3)',marginLeft:'.5rem'}}>— {b.reason}</span>}
                </div>
                <button className="db-btn db-btn-xs" style={{color:'#c0392b',border:'1px solid #fecaca',background:'#fff'}} onClick={() => removeBlocked(b.id)}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Settings({ workspace, toast, refetch }) {
  const [form, setForm] = useState({
    name: workspace?.name||'',
    tagline: workspace?.tagline||'',
    location: workspace?.location||'',
    instagram: workspace?.instagram||'',
    phone: workspace?.phone||''
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save(e) {
    e.preventDefault()
    if (!workspace?.id) { toast('Error: workspace not loaded. Refresh and try again.'); return }
    setLoading(true)
    setSaved(false)

    try {
      const { error } = await supabase
        .from('workspaces')
        .update({
          name: form.name, tagline: form.tagline,
          location: form.location, instagram: form.instagram,
          phone: form.phone,
        })
        .eq('id', workspace.id)

      if (error) {
        let msg = error.message
        if (msg.includes('chk_workspaces_name')) msg = 'Business name cannot be empty.'
        toast(`Error: ${msg}`)
      } else {
        setSaved(true); toast('Profile saved.'); refetch()
      }
    } catch(err) {
      toast(`Error: ${err.message}`)
    }
    setLoading(false)
  }

  async function publish() {
    await supabase.from('workspaces').update({is_published:!workspace.is_published}).eq('id',workspace.id)
    toast(workspace.is_published ? 'Profile unpublished.' : 'Profile is now live!')
    refetch()
  }

  return (
    <div>
      <div className="db-page-head" style={{flexWrap:'wrap',gap:'.75rem'}}>
        <div>
          <div className="db-page-title">Settings</div>
          <div className="db-page-sub">Manage your profile</div>
        </div>
        <button className={`db-btn ${workspace?.is_published ? 'db-btn-secondary' : 'db-btn-primary'}`} onClick={publish}>
          {workspace?.is_published ? 'Unpublish' : 'Publish profile'}
        </button>
      </div>

      {workspace?.is_published && (
        <div style={{padding:'.75rem 1rem',background:'#ecfdf5',border:'1px solid #a7f3d0',borderRadius:'8px',fontSize:'.82rem',color:'#2e7d52',marginBottom:'1.25rem'}}>
          Your profile is live at <strong>{window.location.origin}/{workspace.slug}</strong>
        </div>
      )}

      <div className="db-card">
        <div className="db-card-head"><div className="db-card-title">Business profile</div></div>
        <form onSubmit={save} style={{padding:'1.4rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
          <div className="db-field"><label>Business name</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required/></div>
          <div className="db-field"><label>Tagline</label><input value={form.tagline} onChange={e=>setForm(f=>({...f,tagline:e.target.value}))} placeholder="e.g. Natural Hair Specialist · Montreal, QC"/></div>
          <div className="db-field"><label>Location</label><input value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))}/></div>
          <div className="db-field"><label>Phone</label><input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/></div>
          <div className="db-field"><label>Instagram</label><input value={form.instagram} onChange={e=>setForm(f=>({...f,instagram:e.target.value}))} placeholder="@yourstudio"/></div>
          <button type="submit" className="db-btn db-btn-primary" style={{width:'100%',padding:'.75rem',justifyContent:'center'}} disabled={loading}>
            {loading ? 'Saving...' : saved ? 'Saved ✓' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  )
}

const css = `
.db-shell{min-height:100vh;display:flex;flex-direction:column;}
.db-topbar{height:56px;background:#fff;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 1.5rem;position:sticky;top:0;z-index:50;gap:.75rem;}
.db-logo{font-family:'Playfair Display',serif;font-size:1.25rem;font-weight:600;color:var(--ink);}
.db-logo span{color:var(--gold);}
.db-topbar-right{display:flex;align-items:center;gap:.75rem;}
.db-avatar{width:34px;height:34px;border-radius:50%;background:var(--gold-lt);border:1px solid var(--gold);display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:600;color:var(--gold);cursor:pointer;}
.hamburger{background:none;border:none;cursor:pointer;display:flex;flex-direction:column;justify-content:center;gap:5px;width:34px;height:34px;padding:4px;border-radius:7px;transition:background .15s;}
.hamburger:hover{background:var(--border);}
.hamburger span{display:block;height:2px;width:20px;background:var(--ink);border-radius:2px;transition:all .25s ease;transform-origin:center;}
.hamburger.open span:nth-child(1){transform:translateY(6.5px) rotate(45deg);}
.hamburger.open span:nth-child(2){opacity:0;transform:scaleX(0);}
.hamburger.open span:nth-child(3){transform:translateY(-6.5px) rotate(-45deg);}
.db-body{display:flex;flex:1;position:relative;overflow:hidden;min-height:calc(100vh - 56px);}
.db-backdrop{position:fixed;inset:0;top:56px;background:rgba(0,0,0,.25);z-index:39;}
.db-sidebar{width:230px;background:#fff;border-right:1px solid var(--border);display:flex;flex-direction:column;padding:1.25rem 0;position:fixed;top:56px;left:0;bottom:0;z-index:40;transform:translateX(-100%);transition:transform .28s cubic-bezier(.4,0,.2,1);box-shadow:4px 0 24px rgba(0,0,0,.08);}
.db-sidebar.open{transform:translateX(0);}
.db-sidebar-label{font-size:.68rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);padding:.75rem 1.25rem .35rem;}
.db-nav-item{display:flex;align-items:center;padding:.55rem 1.25rem;cursor:pointer;color:var(--ink-3);font-size:.84rem;transition:all .15s;border-left:2px solid transparent;}
.db-nav-item:hover{color:var(--ink);background:var(--bg);}
.db-nav-item.active{color:var(--ink);background:var(--bg);border-left-color:var(--gold);font-weight:500;}
.db-sidebar-footer{margin-top:auto;padding:1rem 1.25rem;border-top:1px solid var(--border);}
.db-plan-label{font-size:.8rem;font-weight:600;color:var(--ink);}
.db-plan-sub{font-size:.72rem;color:var(--ink-3);margin-top:.1rem;}
.db-plan-bar{height:4px;background:var(--border);border-radius:2px;margin-top:.5rem;}
.db-plan-fill{height:100%;width:62%;background:var(--gold);border-radius:2px;}
.db-main{flex:1;padding:2rem 2.25rem;overflow-y:auto;background:var(--bg);}
.db-page-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1.75rem;}
.db-page-title{font-family:'Playfair Display',serif;font-size:1.75rem;font-weight:500;color:var(--ink);}
.db-page-sub{font-size:.82rem;color:var(--ink-3);margin-top:.25rem;}
.db-btn{display:inline-flex;align-items:center;gap:.4rem;padding:.5rem 1.1rem;border-radius:8px;font-size:.82rem;font-weight:500;cursor:pointer;border:none;font-family:inherit;transition:all .15s;}
.db-btn-primary{background:var(--ink);color:#fff;}
.db-btn-primary:hover{background:#2a2a2a;}
.db-btn-secondary{background:#fff;color:var(--ink);border:1px solid var(--border-2);}
.db-btn-secondary:hover{border-color:var(--ink-3);}
.db-btn-xs{padding:.25rem .65rem;font-size:.72rem;}
.db-stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:1.5rem;}
.db-stat-card{background:#fff;border:1px solid var(--border);border-radius:10px;padding:1.25rem 1.4rem;}
.db-stat-card-btn{width:100%;text-align:left;cursor:pointer;font-family:inherit;position:relative;transition:transform .18s cubic-bezier(.34,1.56,.64,1),box-shadow .18s ease,border-color .18s ease;}
.db-stat-card-btn:hover{transform:translateY(-2px) scale(1.02);box-shadow:0 8px 24px rgba(0,0,0,.09);border-color:var(--gold);}
.db-stat-card-btn:active{transform:scale(0.97);box-shadow:none;}
.db-stat-arrow{position:absolute;bottom:1rem;right:1.2rem;font-size:.85rem;color:var(--gold);opacity:0;transform:translateX(-4px);transition:opacity .18s ease,transform .18s ease;}
.db-stat-card-btn:hover .db-stat-arrow{opacity:1;transform:translateX(0);}
.db-stat-label{font-size:.72rem;font-weight:500;color:var(--ink-3);letter-spacing:.05em;text-transform:uppercase;margin-bottom:.5rem;}
.db-stat-value{font-family:'Playfair Display',serif;font-size:1.85rem;font-weight:500;color:var(--ink);line-height:1;}
.db-stat-delta{font-size:.73rem;color:var(--ink-3);margin-top:.4rem;}
.db-card{background:#fff;border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:1.25rem;}
.db-card-head{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.4rem;border-bottom:1px solid var(--border);}
.db-card-title{font-size:.88rem;font-weight:600;}
.db-tbl{width:100%;border-collapse:collapse;}
.db-tbl th{padding:.65rem 1.25rem;font-size:.7rem;font-weight:600;color:var(--ink-3);text-transform:uppercase;letter-spacing:.07em;text-align:left;background:#faf9f7;border-bottom:1px solid var(--border);}
.db-tbl td{padding:.85rem 1.25rem;font-size:.83rem;color:var(--ink-2);border-bottom:1px solid var(--border);vertical-align:middle;}
.db-tbl tr:last-child td{border-bottom:none;}
.db-tbl tbody tr:hover td{background:#faf9f7;}
.db-tbl-name{font-weight:500;color:var(--ink)!important;}
.db-tbl-amount{font-weight:600;color:var(--ink)!important;}
.db-badge{display:inline-flex;align-items:center;gap:.3rem;padding:2px 9px;border-radius:20px;font-size:.7rem;font-weight:500;}
.db-badge::before{content:'';width:5px;height:5px;border-radius:50%;flex-shrink:0;}
.db-badge-confirmed{background:#ecfdf5;color:#2e7d52;} .db-badge-confirmed::before{background:#2e7d52;}
.db-badge-pending{background:#fefce8;color:#854d0e;} .db-badge-pending::before{background:#ca8a04;}
.db-badge-cancelled{background:#fef2f2;color:#c0392b;} .db-badge-cancelled::before{background:#c0392b;}
.db-badge-completed{background:#eff6ff;color:#1d4ed8;} .db-badge-completed::before{background:#1d4ed8;}
.db-badge-no_show{background:#f5f3ee;color:#7a7672;} .db-badge-no_show::before{background:#7a7672;}
.db-badge-vip{background:#fdf4e7;color:#b5893a;} .db-badge-vip::before{background:#b5893a;}
.db-badge-new{background:#eff6ff;color:#1d4ed8;} .db-badge-new::before{background:#1d4ed8;}
.db-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;}
.db-prod-card{background:#fff;border:1px solid var(--border);border-radius:10px;overflow:hidden;}
.db-prod-img{height:120px;background:#f5f3ee;display:flex;align-items:center;justify-content:center;font-size:.72rem;color:var(--ink-3);letter-spacing:.06em;text-transform:uppercase;border-bottom:1px solid var(--border);}
.db-prod-body{padding:1rem;}
.db-prod-name{font-weight:600;font-size:.85rem;margin-bottom:.2rem;}
.db-prod-price{font-family:'Playfair Display',serif;font-size:1.1rem;margin-bottom:.5rem;}
.db-field{display:flex;flex-direction:column;}
.db-field label{font-size:.75rem;font-weight:500;color:var(--ink-3);margin-bottom:.4rem;letter-spacing:.03em;}
.db-field input{padding:.7rem 1rem;border:1px solid var(--border);border-radius:8px;font-size:.88rem;font-family:inherit;color:var(--ink);background:#fff;outline:none;transition:border .15s;box-sizing:border-box;}
.db-field input:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(181,137,58,.1);}
.db-form-error{padding:.65rem 1rem;border-radius:8px;font-size:.8rem;background:#fef2f2;color:#c0392b;border:1px solid #fecaca;}
.db-time-input{padding:.45rem .6rem;border:1px solid var(--border);border-radius:6px;font-size:.82rem;font-family:inherit;color:var(--ink);outline:none;transition:border .15s;}
.db-time-input:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(181,137,58,.1);}
.db-toast{position:fixed;bottom:1.75rem;right:1.75rem;background:var(--ink);color:#fff;padding:.85rem 1.4rem;border-radius:9px;font-size:.82rem;z-index:200;box-shadow:0 8px 24px rgba(0,0,0,.2);border-left:3px solid var(--gold);}
@media(max-width:600px){.db-stats-row{grid-template-columns:repeat(2,1fr);}.db-grid-3{grid-template-columns:repeat(2,1fr);}.db-main{padding:1.25rem;}.db-page-head{flex-direction:column;align-items:flex-start;}.db-tbl th,.db-tbl td{padding:.6rem .75rem;font-size:.75rem;}}
`
