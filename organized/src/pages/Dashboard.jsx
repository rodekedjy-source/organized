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
  async function handleSignOut() { await supabase.auth.signOut() }

  const navItems = [
    { key: 'overview', label: 'Overview' },
    { key: 'appointments', label: 'Appointments' },
    { key: 'products', label: 'Products' },
    { key: 'formations', label: 'Formations' },
    { key: 'clients', label: 'Clients' },
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
            <div className="db-logo">Organized<span>.</span></div>
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
            {page === 'overview'     && <Overview workspace={workspace} toast={showToast}/>}
            {page === 'appointments' && <Appointments workspace={workspace} toast={showToast}/>}
            {page === 'products'     && <Products workspace={workspace} toast={showToast}/>}
            {page === 'formations'   && <Formations workspace={workspace} toast={showToast}/>}
            {page === 'clients'      && <Clients workspace={workspace} toast={showToast}/>}
            {page === 'settings'     && <Settings workspace={workspace} toast={showToast} refetch={fetchWorkspace}/>}
          </main>
        </div>
        {toast && <div className="db-toast">{toast}</div>}
      </div>
    </>
  )
}

function Overview({ workspace, toast }) {
  const [appts, setAppts] = useState([])
  const [stats, setStats] = useState({ revenue:0, appointments:0, products:0, students:0 })

  useEffect(() => {
    if (!workspace) return
    fetchData()
  }, [workspace])

  async function fetchData() {
    const today = new Date().toISOString().split('T')[0]
    const [a, p, e] = await Promise.all([
      supabase.from('appointments').select('*').eq('workspace_id', workspace.id),
      supabase.from('products').select('id', {count:'exact'}).eq('workspace_id', workspace.id),
      supabase.from('enrollments').select('id', {count:'exact'}).eq('workspace_id', workspace.id),
    ])
    const revenue = (a.data||[]).reduce((s,x)=>s+Number(x.amount||0),0)
    setStats({ revenue, appointments: a.count||0, products: p.count||0, students: e.count||0 })
    const todayAppts = (a.data||[]).filter(x => x.scheduled_at?.startsWith(today))
    setAppts(todayAppts)
  }

  return (
    <div>
      <div className="db-page-head">
        <div>
          <div className="db-page-title">Overview</div>
          <div className="db-page-sub">{new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
        </div>
        <div style={{display:'flex',gap:'.6rem'}}>
          <button className="db-btn db-btn-secondary" onClick={()=>toast('Booking link copied!')}>Copy booking link</button>
          <button className="db-btn db-btn-primary" onClick={()=>toast('New appointment coming soon.')}>New appointment</button>
        </div>
      </div>
      <div className="db-stats-row">
        {[
          {label:'Total Revenue', value:fmt(stats.revenue), delta:'All time'},
          {label:'Appointments', value:stats.appointments, delta:'Total bookings'},
          {label:'Products', value:stats.products, delta:'Listed'},
          {label:'Students', value:stats.students, delta:'Total enrollments'},
        ].map((s,i)=>(
          <div key={i} className="db-stat-card">
            <div className="db-stat-label">{s.label}</div>
            <div className="db-stat-value">{s.value}</div>
            <div className="db-stat-delta">{s.delta}</div>
          </div>
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

  useEffect(() => { if (workspace) fetch() }, [workspace])

  async function fetch() {
    const { data } = await supabase.from('appointments').select('*').eq('workspace_id', workspace.id).order('scheduled_at',{ascending:false})
    setData(data||[])
    setLoading(false)
  }

  async function confirm(id) {
    await supabase.from('appointments').update({status:'confirmed'}).eq('id',id)
    fetch(); toast('Appointment confirmed.')
  }

  return (
    <div>
      <div className="db-page-head">
        <div><div className="db-page-title">Appointments</div><div className="db-page-sub">Manage your bookings</div></div>
      </div>
      <div className="db-card">
        {loading ? <div style={{padding:'2rem',color:'var(--ink-3)'}}>Loading...</div>
        : data.length===0 ? <div style={{padding:'2rem',textAlign:'center',color:'var(--ink-3)',fontSize:'.85rem'}}>No appointments yet.</div>
        : <table className="db-tbl">
            <thead><tr><th>Client</th><th>Date</th><th>Time</th><th>Amount</th><th>Status</th><th></th></tr></thead>
            <tbody>{data.map(a=>(
              <tr key={a.id}>
                <td className="db-tbl-name">{a.client_name}</td>
                <td>{new Date(a.scheduled_at).toLocaleDateString()}</td>
                <td>{new Date(a.scheduled_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</td>
                <td className="db-tbl-amount">{fmt(a.amount)}</td>
                <td><span className={`db-badge db-badge-${a.status}`}>{a.status}</span></td>
                <td>{a.status==='pending'&&<button className="db-btn db-btn-secondary db-btn-xs" onClick={()=>confirm(a.id)}>Confirm</button>}</td>
              </tr>
            ))}</tbody>
          </table>
        }
      </div>
    </div>
  )
}

function Products({ workspace, toast }) {
  const [data, setData] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({name:'',price:'',stock:'',description:''})

  useEffect(() => { if (workspace) fetchData() }, [workspace])

  async function fetchData() {
    const { data } = await supabase.from('products').select('*').eq('workspace_id',workspace.id).order('created_at',{ascending:false})
    setData(data||[])
  }

  async function add(e) {
    e.preventDefault()
    await supabase.from('products').insert({workspace_id:workspace.id,name:form.name,price:parseFloat(form.price),stock:parseInt(form.stock)||0,description:form.description})
    toast(`${form.name} added.`)
    setForm({name:'',price:'',stock:'',description:''})
    setShowForm(false)
    fetchData()
  }

  return (
    <div>
      <div className="db-page-head">
        <div><div className="db-page-title">Products</div><div className="db-page-sub">Sell from your profile page</div></div>
        <button className="db-btn db-btn-primary" onClick={()=>setShowForm(s=>!s)}>{showForm?'Cancel':'Add product'}</button>
      </div>
      {showForm && (
        <div className="db-card" style={{marginBottom:'1.25rem'}}>
          <form onSubmit={add} style={{padding:'1.4rem',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
            <div className="db-field" style={{gridColumn:'1/-1'}}><label>Name</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required/></div>
            <div className="db-field"><label>Price</label><input type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} required/></div>
            <div className="db-field"><label>Stock</label><input type="number" value={form.stock} onChange={e=>setForm(f=>({...f,stock:e.target.value}))}/></div>
            <div className="db-field" style={{gridColumn:'1/-1'}}><label>Description</label><input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/></div>
            <button type="submit" className="db-btn db-btn-primary" style={{gridColumn:'1/-1'}}>Save</button>
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
  const [form, setForm] = useState({title:'',price:'',duration_label:'',description:''})

  useEffect(() => { if (workspace) fetchData() }, [workspace])

  async function fetchData() {
    const { data } = await supabase.from('offerings').select('*').eq('workspace_id',workspace.id).order('created_at',{ascending:false})
    setData(data||[])
  }

  async function add(e) {
    e.preventDefault()
    await supabase.from('offerings').insert({workspace_id:workspace.id,title:form.title,price:parseFloat(form.price),duration_label:form.duration_label,description:form.description})
    toast(`"${form.title}" created.`)
    setForm({title:'',price:'',duration_label:'',description:''})
    setShowForm(false)
    fetchData()
  }

  return (
    <div>
      <div className="db-page-head">
        <div><div className="db-page-title">Formations</div><div className="db-page-sub">Sell courses and workshops</div></div>
        <button className="db-btn db-btn-primary" onClick={()=>setShowForm(s=>!s)}>{showForm?'Cancel':'Create formation'}</button>
      </div>
      {showForm && (
        <div className="db-card" style={{marginBottom:'1.25rem'}}>
          <form onSubmit={add} style={{padding:'1.4rem',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
            <div className="db-field" style={{gridColumn:'1/-1'}}><label>Title</label><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required/></div>
            <div className="db-field"><label>Price</label><input type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} required/></div>
            <div className="db-field"><label>Duration</label><input value={form.duration_label} onChange={e=>setForm(f=>({...f,duration_label:e.target.value}))} placeholder="e.g. 6h"/></div>
            <div className="db-field" style={{gridColumn:'1/-1'}}><label>Description</label><input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/></div>
            <button type="submit" className="db-btn db-btn-primary" style={{gridColumn:'1/-1'}}>Save</button>
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
              <div style={{fontSize:'.73rem',color:'var(--ink-3)',marginTop:'.35rem'}}>{f.duration_label}</div>
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
    const { data } = await supabase.from('clients').select('*').eq('workspace_id',workspace.id).order('created_at',{ascending:false})
    setData(data||[])
    setLoading(false)
  }

  return (
    <div>
      <div className="db-page-head"><div><div className="db-page-title">Clients</div><div className="db-page-sub">Your client base</div></div></div>
      <div className="db-card">
        {loading ? <div style={{padding:'2rem',color:'var(--ink-3)'}}>Loading...</div>
        : data.length===0 ? <div style={{padding:'2rem',textAlign:'center',color:'var(--ink-3)',fontSize:'.85rem'}}>No clients yet. They appear here when they book.</div>
        : <table className="db-tbl">
            <thead><tr><th>Name</th><th>Email</th><th>Visits</th><th>Spent</th><th>Tag</th></tr></thead>
            <tbody>{data.map(c=>(
              <tr key={c.id}>
                <td className="db-tbl-name">{c.full_name}</td>
                <td>{c.email||'—'}</td>
                <td>{c.total_visits}</td>
                <td className="db-tbl-amount">{fmt(c.total_spent)}</td>
                <td>{c.tag?<span className={`db-badge db-badge-${c.tag==='vip'?'vip':c.tag==='new'?'new':'confirmed'}`}>{c.tag.toUpperCase()}</span>:'—'}</td>
              </tr>
            ))}</tbody>
          </table>
        }
      </div>
    </div>
  )
}

function Settings({ workspace, toast, refetch }) {
  const [form, setForm] = useState({name:workspace?.name||'',tagline:workspace?.tagline||'',location:workspace?.location||'',instagram:workspace?.instagram||'',phone:workspace?.phone||''})
  const [loading, setLoading] = useState(false)

  async function save(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('workspaces').update(form).eq('id',workspace.id)
    if (error) toast('Error saving.')
    else { toast('Saved.'); refetch() }
    setLoading(false)
  }

  async function publish() {
    await supabase.from('workspaces').update({is_published:!workspace.is_published}).eq('id',workspace.id)
    toast(workspace.is_published ? 'Profile unpublished.' : 'Profile is now live!')
    refetch()
  }

  return (
    <div>
      <div className="db-page-head">
        <div><div className="db-page-title">Settings</div><div className="db-page-sub">Manage your profile</div></div>
        <button className="db-btn db-btn-secondary" onClick={publish}>
          {workspace?.is_published ? 'Unpublish profile' : 'Publish profile'}
        </button>
      </div>
      <div className="db-card">
        <div className="db-card-head"><div className="db-card-title">Business profile</div></div>
        <form onSubmit={save} style={{padding:'1.4rem',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
          <div className="db-field" style={{gridColumn:'1/-1'}}><label>Business name</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
          <div className="db-field" style={{gridColumn:'1/-1'}}><label>Tagline</label><input value={form.tagline} onChange={e=>setForm(f=>({...f,tagline:e.target.value}))} placeholder="Natural Hair Specialist · Montreal, QC"/></div>
          <div className="db-field"><label>Location</label><input value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))}/></div>
          <div className="db-field"><label>Phone</label><input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/></div>
          <div className="db-field" style={{gridColumn:'1/-1'}}><label>Instagram</label><input value={form.instagram} onChange={e=>setForm(f=>({...f,instagram:e.target.value}))} placeholder="@yourstudio"/></div>
          <button type="submit" className="db-btn db-btn-primary" style={{gridColumn:'1/-1'}} disabled={loading}>{loading?'Saving...':'Save changes'}</button>
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
  .hamburger span{display:block;height:1.5px;background:var(--ink);border-radius:2px;transition:all .25s ease;transform-origin:center;}
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
  .db-field input{padding:.7rem 1rem;border:1px solid var(--border);border-radius:8px;font-size:.88rem;font-family:inherit;color:var(--ink);background:#fff;outline:none;transition:border .15s;}
  .db-field input:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(181,137,58,.1);}
  .db-toast{position:fixed;bottom:1.75rem;right:1.75rem;background:var(--ink);color:#fff;padding:.85rem 1.4rem;border-radius:9px;font-size:.82rem;z-index:200;box-shadow:0 8px 24px rgba(0,0,0,.2);border-left:3px solid var(--gold);}
  @media(max-width:600px){.db-stats-row{grid-template-columns:repeat(2,1fr);}.db-grid-3{grid-template-columns:repeat(2,1fr);}.db-main{padding:1.25rem;}}
`
