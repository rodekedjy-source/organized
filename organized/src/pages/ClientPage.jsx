import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ClientPage() {
  const { slug } = useParams()
  const [workspace, setWorkspace] = useState(null)
  const [services, setServices]   = useState([])
  const [products, setProducts]   = useState([])
  const [tab, setTab]             = useState('book')
  const [modal, setModal]         = useState(null)
  const [loading, setLoading]     = useState(true)
  const [notFound, setNotFound]   = useState(false)
  const [toast, setToast]         = useState('')
  const [bookForm, setBookForm]   = useState({ name:'', phone:'', date:'', notes:'' })
  const [booking, setBooking]     = useState(false)
  const [booked, setBooked]       = useState(false)

  function notify(msg) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => { loadProfile() }, [slug])

  async function loadProfile() {
    const { data: ws } = await supabase.from('workspaces').select('*').eq('slug', slug).single()
    if (!ws) { setNotFound(true); setLoading(false); return }
    setWorkspace(ws)
    const [{ data: svc }, { data: prod }] = await Promise.all([
      supabase.from('services').select('*').eq('workspace_id', ws.id).eq('is_active', true).order('display_order'),
      supabase.from('products').select('*').eq('workspace_id', ws.id).eq('is_active', true),
    ])
    setServices(svc || [])
    setProducts(prod || [])
    setLoading(false)
  }

  async function submitBooking(e) {
    e.preventDefault()
    if (!bookForm.name || !bookForm.date) return
    setBooking(true)
    const { error } = await supabase.from('appointments').insert({
      workspace_id: workspace.id,
      client_name:  bookForm.name,
      client_phone: bookForm.phone,
      notes:        `Service: ${modal.name}. ${bookForm.notes}`,
      scheduled_at: new Date(bookForm.date).toISOString(),
      amount:       modal.price,
      status:       'pending',
    })
    if (error) { notify('Something went wrong. Please try again.'); setBooking(false); return }
    setBooked(true)
    setBooking(false)
  }

  if (loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0d0c0a'}}><div style={{fontFamily:'Playfair Display,serif',fontSize:'1.5rem',color:'#b5893a'}}>Organized.</div></div>
  if (notFound) return <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#0d0c0a',color:'#fff',textAlign:'center',padding:'2rem'}}><div style={{fontFamily:'Playfair Display,serif',fontSize:'3rem',color:'#b5893a',marginBottom:'1rem'}}>404</div><div style={{fontFamily:'Playfair Display,serif',fontSize:'1.5rem'}}>Profile not found</div></div>

  return (
    <div style={{background:'#fff',minHeight:'100vh'}}>
      <div style={{background:'#0d0c0a',padding:'0 2rem',height:'54px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.1rem',color:'#fff',fontWeight:500}}>{workspace.name}</div>
      </div>
      <div style={{background:'#0d0c0a',padding:'3.5rem 2rem 2.5rem',textAlign:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(181,137,58,.12), transparent)',pointerEvents:'none'}}/>
        <div style={{width:'76px',height:'76px',borderRadius:'50%',background:'#2a2a2a',border:'1px solid rgba(181,137,58,.4)',margin:'0 auto .9rem',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Playfair Display,serif',fontSize:'1.6rem',color:'#b5893a',position:'relative',zIndex:1}}>{workspace.name[0]}</div>
        <div style={{fontFamily:'Playfair Display,serif',fontSize:'2rem',color:'#fff',fontWeight:400,position:'relative',zIndex:1}}>{workspace.name}</div>
        <div style={{fontSize:'.82rem',color:'rgba(255,255,255,.4)',marginTop:'.4rem',position:'relative',zIndex:1}}>{workspace.tagline || workspace.location || ''}</div>
      </div>
      <div style={{display:'flex',background:'#fff',borderBottom:'1px solid #e4e0d8',justifyContent:'center'}}>
        {[['book','Book a service'],['shop','Shop']].map(([k,l]) => (
          <div key={k} style={{padding:'.9rem 2rem',fontSize:'.82rem',fontWeight:500,color:tab===k?'#0d0c0a':'#7a7672',cursor:'pointer',borderBottom:tab===k?'2px solid #b5893a':'2px solid transparent',transition:'all .15s'}} onClick={() => setTab(k)}>{l}</div>
        ))}
      </div>
      <div style={{maxWidth:'800px',margin:'0 auto',padding:'2.5rem 1.5rem'}}>
        {tab === 'book' && (
          <>
            <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.4rem',fontWeight:400,marginBottom:'1.25rem'}}>Services</div>
            {services.length === 0 ? <div style={{color:'#7a7672',fontSize:'.85rem',textAlign:'center',padding:'2rem'}}>No services listed yet.</div> : (
              <div style={{display:'flex',flexDirection:'column',gap:'.6rem'}}>
                {services.map((svc,i) => (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:'1rem',padding:'1.1rem 1.25rem',border:'1px solid #e4e0d8',borderRadius:'9px',cursor:'pointer',background:'#fff'}} onClick={() => { setModal(svc); setBooked(false); setBookForm({name:'',phone:'',date:'',notes:''}) }}>
                    <div style={{width:'3px',height:'36px',borderRadius:'2px',background:'#e8d9bf',flexShrink:0}}/>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:500,fontSize:'.9rem'}}>{svc.name}</div>
                      <div style={{fontSize:'.75rem',color:'#7a7672',marginTop:'.1rem'}}>{svc.duration_min ? `${svc.duration_min} min` : ''}</div>
                    </div>
                    <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.2rem'}}>{svc.is_free ? 'Free' : `$${svc.price}`}</div>
                    <button style={{background:'#0d0c0a',color:'#fff',border:'none',borderRadius:'7px',padding:'.45rem .9rem',fontSize:'.76rem',fontWeight:500,cursor:'pointer',fontFamily:'inherit'}}>Book</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {tab === 'shop' && (
          <>
            <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.4rem',fontWeight:400,marginBottom:'1.25rem'}}>Products</div>
            {products.length === 0 ? <div style={{color:'#7a7672',fontSize:'.85rem',textAlign:'center',padding:'2rem'}}>No products available yet.</div> : (
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem'}}>
                {products.map(p => (
                  <div key={p.id} style={{border:'1px solid #e4e0d8',borderRadius:'9px',overflow:'hidden'}}>
                    <div style={{height:'110px',background:'#f7f5f0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.72rem',color:'#7a7672'}}>PRODUCT</div>
                    <div style={{padding:'.9rem 1rem'}}>
                      <div style={{fontSize:'.85rem',fontWeight:500}}>{p.name}</div>
                      <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.05rem',marginTop:'.2rem'}}>${p.price}</div>
                      <button style={{width:'100%',marginTop:'.7rem',padding:'.5rem',border:'1px solid #e4e0d8',borderRadius:'6px',background:'none',fontSize:'.76rem',cursor:'pointer',fontFamily:'inherit'}} onClick={() => notify(`Contact the studio to order ${p.name}.`)}>Order</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <div style={{background:'#0d0c0a',padding:'2rem',textAlign:'center'}}>
        <p style={{fontSize:'.75rem',color:'rgba(255,255,255,.25)'}}>Powered by <strong style={{color:'rgba(255,255,255,.5)'}}>Organized.</strong> — beorganized.io</p>
      </div>
      {modal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.35)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={() => setModal(null)}>
          <div style={{background:'#fff',borderRadius:'14px',padding:'2rem',width:'420px',maxWidth:'90vw'}} onClick={e => e.stopPropagation()}>
            {booked ? (
              <div style={{textAlign:'center',padding:'1rem 0'}}>
                <div style={{width:'56px',height:'56px',borderRadius:'50%',background:'#ecfdf5',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem'}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2e7d52" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg></div>
                <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.4rem',marginBottom:'.5rem'}}>Request sent</div>
                <div style={{fontSize:'.82rem',color:'#7a7672',lineHeight:1.6}}>Your booking request for <strong>{modal.name}</strong> has been sent. The studio will confirm shortly.</div>
                <button style={{background:'#0d0c0a',color:'#fff',border:'none',borderRadius:'7px',padding:'.65rem 1.25rem',fontSize:'.82rem',cursor:'pointer',fontFamily:'inherit',marginTop:'1.5rem'}} onClick={() => setModal(null)}>Close</button>
              </div>
            ) : (
              <form onSubmit={submitBooking}>
                <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.4rem',marginBottom:'.25rem'}}>Book — {modal.name}</div>
                <div style={{fontSize:'.78rem',color:'#7a7672',marginBottom:'1.5rem'}}>${modal.price}</div>
                {[['name','Full name','e.g. Amara Diallo','text'],['phone','Phone number','+1 (514) 555-0123','text'],['date','Preferred date','','date'],['notes','Notes (optional)','Special requests...','text']].map(([key,label,placeholder,type]) => (
                  <div key={key} style={{marginBottom:'.85rem'}}>
                    <label style={{display:'block',fontSize:'.75rem',fontWeight:500,color:'#7a7672',marginBottom:'.35rem'}}>{label}</label>
                    <input style={{width:'100%',padding:'.65rem .9rem',border:'1px solid #e4e0d8',borderRadius:'7px',fontSize:'.84rem',fontFamily:'inherit',color:'#0d0c0a',outline:'none'}} type={type} value={bookForm[key]} onChange={e=>setBookForm(f=>({...f,[key]:e.target.value}))} placeholder={placeholder} required={key==='name'||key==='date'}/>
                  </div>
                ))}
                <div style={{display:'flex',gap:'.6rem',justifyContent:'flex-end'}}>
                  <button type="button" style={{padding:'.5rem 1.1rem',borderRadius:'8px',border:'1px solid #d0cec8',fontSize:'.82rem',cursor:'pointer',background:'#fff',fontFamily:'inherit'}} onClick={() => setModal(null)}>Cancel</button>
                  <button type="submit" style={{background:'#0d0c0a',color:'#fff',border:'none',borderRadius:'7px',padding:'.5rem 1.1rem',fontSize:'.82rem',fontWeight:500,cursor:'pointer',fontFamily:'inherit'}} disabled={booking}>{booking ? 'Sending...' : 'Send request'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {toast && <div style={{position:'fixed',bottom:'1.75rem',right:'1.75rem',background:'#0d0c0a',color:'#fff',padding:'.85rem 1.4rem',borderRadius:'9px',fontSize:'.82rem',zIndex:200,borderLeft:'3px solid #b5893a'}}>{toast}</div>}
    </div>
  )
}
