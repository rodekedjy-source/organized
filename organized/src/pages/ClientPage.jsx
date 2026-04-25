import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const DAY_NAMES  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const DAY_FULL   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTH_NAMES= ['January','February','March','April','May','June','July','August','September','October','November','December']
const fmt = (n) => `$${Number(n||0).toLocaleString()}`

function generateTimeSlots(openTime,closeTime,durationMin){
  const slots=[]
  const[oh,om]=openTime.split(':').map(Number)
  const[ch,cm]=closeTime.split(':').map(Number)
  const openMinutes=oh*60+om,closeMinutes=ch*60+cm,step=durationMin||60
  for(let m=openMinutes;m+step<=closeMinutes;m+=step){
    const h=Math.floor(m/60),min=m%60
    slots.push(`${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`)
  }
  return slots
}

function formatTime(t){
  const[h,m]=t.split(':').map(Number)
  const ampm=h>=12?'PM':'AM',h12=h===0?12:h>12?h-12:h
  return `${h12}:${String(m).padStart(2,'0')} ${ampm}`
}

function getOpenStatus(availability){
  if(!availability||availability.length===0) return{isOpen:false,label:''}
  const now=new Date(),dow=now.getDay()
  const todayAvail=availability.find(a=>a.day_of_week===dow)
  if(!todayAvail||!todayAvail.is_open) return{isOpen:false,label:'Closed today'}
  const nowMin=now.getHours()*60+now.getMinutes()
  const[oh,om]=todayAvail.open_time.split(':').map(Number)
  const[ch,cm]=todayAvail.close_time.split(':').map(Number)
  const openMin=oh*60+om,closeMin=ch*60+cm
  if(nowMin<openMin) return{isOpen:false,label:`Opens at ${formatTime(todayAvail.open_time.slice(0,5))}`}
  if(nowMin>=closeMin) return{isOpen:false,label:'Closed now'}
  return{isOpen:true,label:`Open · Closes ${formatTime(todayAvail.close_time.slice(0,5))}`}
}

export default function ClientPage(){
  const{slug}=useParams()
  const[workspace,setWorkspace]=useState(null)
  const[services,setServices]=useState([])
  const[products,setProducts]=useState([])
  const[availability,setAvailability]=useState([])
  const[blockedDates,setBlockedDates]=useState([])
  const[existingAppts,setExistingAppts]=useState([])
  const[loading,setLoading]=useState(true)
  const[notFound,setNotFound]=useState(false)
  const[toast,setToast]=useState('')
  const[activeSection,setActiveSection]=useState('services')
  const[modal,setModal]=useState(null)
  const[bookStep,setBookStep]=useState(1)
  const[selectedDate,setSelectedDate]=useState(null)
  const[selectedTime,setSelectedTime]=useState(null)
  const[bookForm,setBookForm]=useState({name:'',email:'',phone:'',notes:''})
  const[booking,setBooking]=useState(false)
  const[booked,setBooked]=useState(false)
  const[bookError,setBookError]=useState('')
  const[calMonth,setCalMonth]=useState(new Date().getMonth())
  const[calYear,setCalYear]=useState(new Date().getFullYear())
  const servicesRef=useRef(null),aboutRef=useRef(null),addressRef=useRef(null),tabsRef=useRef(null)

  function notify(msg){setToast(msg);setTimeout(()=>setToast(''),3000)}

  useEffect(()=>{loadProfile()},[slug])

  useEffect(()=>{
    function onScroll(){
      const threshold=(tabsRef.current?tabsRef.current.getBoundingClientRect().bottom:54)+20
      for(const{key,ref}of[{key:'address',ref:addressRef},{key:'about',ref:aboutRef},{key:'services',ref:servicesRef}]){
        if(ref.current&&ref.current.getBoundingClientRect().top<=threshold){setActiveSection(key);break}
      }
    }
    window.addEventListener('scroll',onScroll,{passive:true})
    return()=>window.removeEventListener('scroll',onScroll)
  },[])

  useEffect(()=>{
    if(!workspace)return
    function refresh(){
      supabase.from('blocked_dates').select('*').eq('workspace_id',workspace.id).then(({data})=>{
        const dates=(data||[]).map(b=>b.blocked_date)
        setBlockedDates(prev=>{
          if(JSON.stringify(prev)!==JSON.stringify(dates)){
            if(selectedDate){
              const s=selectedDate.toISOString().split('T')[0]
              if(dates.includes(s)&&!prev.includes(s)){setSelectedDate(null);setSelectedTime(null);setBookStep(1);setBookError('This date was just blocked by the business.')}
            }
            return dates
          }
          return prev
        })
      })
      supabase.from('availability').select('*').eq('workspace_id',workspace.id).then(({data})=>setAvailability(data||[]))
      if(selectedDate)loadApptsForDate(selectedDate)
    }
    const iv=setInterval(refresh,5000)
    return()=>clearInterval(iv)
  },[workspace,selectedDate])

  async function loadProfile(){
    const{data:ws}=await supabase.from('workspaces').select('*').eq('slug',slug).eq('is_published',true).single()
    if(!ws){setNotFound(true);setLoading(false);return}
    setWorkspace(ws)
    const[{data:svc},{data:prod},{data:avail},{data:blocked}]=await Promise.all([
      supabase.from('services').select('*').eq('workspace_id',ws.id).eq('is_active',true).is('deleted_at',null).order('display_order'),
      supabase.from('products').select('*').eq('workspace_id',ws.id).eq('is_active',true).is('deleted_at',null),
      supabase.from('availability').select('*').eq('workspace_id',ws.id),
      supabase.from('blocked_dates').select('*').eq('workspace_id',ws.id),
    ])
    setServices(svc||[]);setProducts(prod||[]);setAvailability(avail||[]);setBlockedDates((blocked||[]).map(b=>b.blocked_date));setLoading(false)
  }

  async function loadApptsForDate(date){
    const dateStr=date.toISOString().split('T')[0]
    const{data}=await supabase.from('appointments').select('scheduled_at,ends_at,duration_min').eq('workspace_id',workspace.id).in('status',['pending','confirmed']).gte('scheduled_at',`${dateStr}T00:00:00`).lt('scheduled_at',`${dateStr}T23:59:59`)
    setExistingAppts(data||[])
  }

  function scrollToSection(key){
    const refs={services:servicesRef,about:aboutRef,address:addressRef}
    const ref=refs[key];if(!ref?.current)return
    const top=ref.current.getBoundingClientRect().top+window.scrollY
    const tabsH=tabsRef.current?tabsRef.current.offsetHeight:54
    window.scrollTo({top:top-tabsH-8,behavior:'smooth'})
    setActiveSection(key)
  }

  function openBooking(svc){
    setModal(svc);setBookStep(1);setSelectedDate(null);setSelectedTime(null)
    setBookForm({name:'',email:'',phone:'',notes:''});setBooked(false);setBookError('')
    const now=new Date();setCalMonth(now.getMonth());setCalYear(now.getFullYear())
  }

  function isDayOpen(date){
    const dow=date.getDay()
    const avail=availability.find(a=>a.day_of_week===dow)
    if(avail&&!avail.is_open)return false
    const dateStr=date.toISOString().split('T')[0]
    if(blockedDates.includes(dateStr))return false
    const today=new Date();today.setHours(0,0,0,0)
    if(date<today)return false
    return true
  }

  function getAvailableSlots(){
    if(!selectedDate||!modal)return[]
    const dow=selectedDate.getDay()
    const avail=availability.find(a=>a.day_of_week===dow)
    if(!avail||!avail.is_open)return[]
    const allSlots=generateTimeSlots(avail.open_time,avail.close_time,modal.duration_min||60)
    const duration=modal.duration_min||60
    const now=new Date(),isToday=selectedDate.toDateString()===now.toDateString()
    const nowMinutes=now.getHours()*60+now.getMinutes()
    return allSlots.filter(slot=>{
      const[sh,sm]=slot.split(':').map(Number)
      const slotStart=sh*60+sm,slotEnd=slotStart+duration
      if(isToday&&slotStart<=nowMinutes)return false
      return!existingAppts.some(appt=>{
        const apptDate=new Date(appt.scheduled_at)
        const apptStart=apptDate.getHours()*60+apptDate.getMinutes()
        const apptDuration=appt.duration_min||60,apptEnd=apptStart+apptDuration
        return slotStart<apptEnd&&slotEnd>apptStart
      })
    })
  }

  function selectDate(date){setSelectedDate(date);setSelectedTime(null);setBookStep(2);setBookError('');loadApptsForDate(date)}
  function selectTime(time){setSelectedTime(time);setBookStep(3);setBookError('')}

  async function submitBooking(e){
    e.preventDefault()
    if(!bookForm.name)return setBookError('Please enter your name.')
    if(!bookForm.email&&!bookForm.phone)return setBookError('Please provide at least an email or phone number.')
    if(!selectedDate||!selectedTime)return setBookError('Please select a date and time.')
    setBooking(true);setBookError('')
    const scheduledAt=new Date(`${selectedDate.toISOString().split('T')[0]}T${selectedTime}:00`)
    const{error}=await supabase.from('appointments').insert({
      workspace_id:workspace.id,service_id:modal.id,client_name:bookForm.name,
      client_email:bookForm.email||null,client_phone:bookForm.phone||null,
      notes:bookForm.notes||null,scheduled_at:scheduledAt.toISOString(),
      duration_min:modal.duration_min||60,amount:modal.price,status:'pending',
    })
    if(error){
      let msg='Something went wrong. Please try again.'
      if(error.message.includes('already booked'))msg='This time slot was just taken. Please choose another time.'
      else if(error.message.includes('closed on this day'))msg='The business is closed on this day.'
      else if(error.message.includes('outside business hours'))msg='This time is outside business hours.'
      else if(error.message.includes('unavailable'))msg='This date is unavailable.'
      setBookError(msg);setBooking(false)
      if(msg.includes('just taken')){setBookStep(2);loadApptsForDate(selectedDate)}
      return
    }
    setBooked(true);setBooking(false)
  }

  function renderCalendar(){
    const firstDay=new Date(calYear,calMonth,1).getDay()
    const daysInMonth=new Date(calYear,calMonth+1,0).getDate()
    const weeks=[];let week=Array(firstDay).fill(null)
    for(let d=1;d<=daysInMonth;d++){
      week.push(d)
      if(week.length===7){weeks.push(week);week=[]}
    }
    if(week.length){while(week.length<7)week.push(null);weeks.push(week)}
    return weeks
  }

  function prevMonth(){if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1)}else setCalMonth(m=>m-1)}
  function nextMonth(){if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1)}else setCalMonth(m=>m+1)}

  if(loading)return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0d0c0a'}}>
      <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.5rem',color:'#b5893a'}}>Organized.</div>
    </div>
  )
  if(notFound)return(
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#0d0c0a',color:'#fff',textAlign:'center',padding:'2rem'}}>
      <div style={{fontFamily:'Playfair Display,serif',fontSize:'3rem',color:'#b5893a',marginBottom:'1rem'}}>404</div>
      <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.5rem'}}>Profile not found</div>
      <div style={{fontSize:'.82rem',color:'rgba(255,255,255,.4)',marginTop:'.5rem'}}>This profile doesn't exist or is not published yet.</div>
    </div>
  )

  const availableSlots=getAvailableSlots()
  const openStatus=getOpenStatus(availability)
  const hasAddress=workspace.share_address&&workspace.address_street
  const fullAddress=[workspace.address_street,workspace.address_city,workspace.address_province,workspace.address_postal].filter(Boolean).join(', ')
  const mapsEmbedUrl=`https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed&z=15`
  const tabs=[{key:'services',label:'Services'},{key:'about',label:'About'},...(hasAddress?[{key:'address',label:'Address'}]:[]) ]

  return(
    <div style={{background:'#f5f3ef',minHeight:'100vh'}}>
      <style>{clientCSS}</style>

      {/* HERO */}
      <div className="cp-hero" style={workspace.cover_url?{backgroundImage:`url(${workspace.cover_url})`}:{}}>
        <div className="cp-hero-overlay"/>
        <div className="cp-hero-content">
          {workspace.avatar_url
            ?<img src={workspace.avatar_url} alt={workspace.name} className="cp-avatar-img"/>
            :<div className="cp-avatar">{workspace.name[0]}</div>
          }
          <h1 className="cp-hero-name">{workspace.name}</h1>
          {workspace.tagline&&<div className="cp-hero-tagline">{workspace.tagline}</div>}
          {openStatus.label&&(
            <div className="cp-open-status">
              <span className={`cp-open-dot ${openStatus.isOpen?'open':'closed'}`}/>
              {openStatus.label}
            </div>
          )}
          <div className="cp-hero-links">
            {workspace.phone&&(
              <a href={`tel:${workspace.phone}`} className="cp-hero-link">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13"><path d="M2 2.5A1.5 1.5 0 013.5 1h1.586a1 1 0 01.707.293l1.414 1.414a1 1 0 010 1.414L6.293 5.12a9.06 9.06 0 004.586 4.586l1-1a1 1 0 011.414 0l1.414 1.414A1 1 0 0115 10.914V12.5A1.5 1.5 0 0113.5 14C7.149 14 2 8.851 2 2.5z"/></svg>
                {workspace.phone}
              </a>
            )}
            {workspace.instagram&&(
              <a href={`https://instagram.com/${workspace.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="cp-hero-link">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13"><rect x="1" y="1" width="14" height="14" rx="4"/><circle cx="8" cy="8" r="3"/><circle cx="12" cy="4" r=".5" fill="currentColor" stroke="none"/></svg>
                {workspace.instagram}
              </a>
            )}
            {workspace.tiktok&&(
              <a href={`https://tiktok.com/@${workspace.tiktok.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="cp-hero-link">
                <svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13"><path d="M11.5 1A3.5 3.5 0 008 4.5V11a2 2 0 11-2-2V7a5 5 0 105 5V6.5A6.48 6.48 0 0014 7V4.5A3.5 3.5 0 0011.5 1z"/></svg>
                {workspace.tiktok}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* STICKY TABS */}
      <div className="cp-tabs" ref={tabsRef}>
        {tabs.map(({key,label})=>(
          <button key={key} className={`cp-tab${activeSection===key?' active':''}`} onClick={()=>scrollToSection(key)}>{label}</button>
        ))}
      </div>

      {/* SERVICES */}
      <div ref={servicesRef} className="cp-section">
        <div className="cp-section-inner">
          <h2 className="cp-section-title">Services</h2>
          {services.length===0?(
            <div className="cp-empty">No services listed yet.</div>
          ):(
            <div className="cp-service-list">
              {services.map(svc=>(
                <div key={svc.id} className="cp-service-card">
                  <div className="cp-service-bar"/>
                  <div style={{flex:1,minWidth:0}}>
                    <div className="cp-service-name">{svc.name}</div>
                    <div className="cp-service-meta">{svc.duration_min?`${svc.duration_min} min`:''}{svc.description?` · ${svc.description}`:''}</div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:'.75rem',flexShrink:0}}>
                    <div className="cp-service-price">{svc.is_free?'Free':fmt(svc.price)}</div>
                    <button className="cp-book-btn" onClick={()=>openBooking(svc)}>Book</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ABOUT */}
      <div ref={aboutRef} className="cp-section cp-section-alt">
        <div className="cp-section-inner">
          <h2 className="cp-section-title">About</h2>
          {workspace.bio&&<p className="cp-bio">{workspace.bio}</p>}

          {availability.length>0&&(
            <div className="cp-card">
              <div className="cp-card-label">Hours</div>
              {DAY_FULL.map((day,i)=>{
                const avail=availability.find(a=>a.day_of_week===i)
                const isToday=new Date().getDay()===i
                return(
                  <div key={i} className={`cp-hours-row${isToday?' today':''}`}>
                    <span className="cp-hours-day">{day}</span>
                    {avail?.is_open
                      ?<span className="cp-hours-time">{formatTime(avail.open_time.slice(0,5))} – {formatTime(avail.close_time.slice(0,5))}</span>
                      :<span className="cp-hours-closed">Closed</span>
                    }
                  </div>
                )
              })}
            </div>
          )}

          {(workspace.phone||workspace.email||workspace.website)&&(
            <div className="cp-card">
              <div className="cp-card-label">Contact</div>
              {workspace.phone&&(
                <a href={`tel:${workspace.phone}`} className="cp-contact-row">
                  <svg viewBox="0 0 16 16" fill="none" stroke="#b5893a" strokeWidth="1.5" width="15" height="15" style={{flexShrink:0}}><path d="M2 2.5A1.5 1.5 0 013.5 1h1.586a1 1 0 01.707.293l1.414 1.414a1 1 0 010 1.414L6.293 5.12a9.06 9.06 0 004.586 4.586l1-1a1 1 0 011.414 0l1.414 1.414A1 1 0 0115 10.914V12.5A1.5 1.5 0 0113.5 14C7.149 14 2 8.851 2 2.5z"/></svg>
                  {workspace.phone}
                </a>
              )}
              {workspace.email&&(
                <a href={`mailto:${workspace.email}`} className="cp-contact-row">
                  <svg viewBox="0 0 16 16" fill="none" stroke="#b5893a" strokeWidth="1.5" width="15" height="15" style={{flexShrink:0}}><rect x="1" y="3" width="14" height="10" rx="2"/><path d="M1 5l7 5 7-5"/></svg>
                  {workspace.email}
                </a>
              )}
              {workspace.website&&(
                <a href={workspace.website} target="_blank" rel="noopener noreferrer" className="cp-contact-row">
                  <svg viewBox="0 0 16 16" fill="none" stroke="#b5893a" strokeWidth="1.5" width="15" height="15" style={{flexShrink:0}}><circle cx="8" cy="8" r="7"/><path d="M1 8h14M8 1c-2 2-3 4.5-3 7s1 5 3 7M8 1c2 2 3 4.5 3 7s-1 5-3 7"/></svg>
                  {workspace.website.replace(/^https?:\/\//,'')}
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ADDRESS */}
      {hasAddress&&(
        <div ref={addressRef} className="cp-section">
          <div className="cp-section-inner">
            <h2 className="cp-section-title">Address</h2>
            <div className="cp-card">
              <a href={`https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`} target="_blank" rel="noopener noreferrer" className="cp-address-text">
                <svg viewBox="0 0 16 16" fill="none" stroke="#b5893a" strokeWidth="1.5" width="15" height="15" style={{flexShrink:0,marginTop:2}}><path d="M8 1C5.24 1 3 3.24 3 6c0 4 5 9 5 9s5-5 5-9c0-2.76-2.24-5-5-5z"/><circle cx="8" cy="6" r="2"/></svg>
                {fullAddress}
              </a>
              <div className="cp-map-container">
                <iframe title="Location" src={mapsEmbedUrl} width="100%" height="220" style={{border:0,borderRadius:10,display:'block'}} loading="lazy" referrerPolicy="no-referrer-when-downgrade"/>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="cp-footer">
        <p>Powered by <strong>Organized.</strong> — beorganized.io</p>
      </div>

      {/* FLOATING BOOK BUTTON */}
      {!modal&&services.length>0&&(
        <div className="cp-float-wrap">
          <button className="cp-float-btn" onClick={()=>scrollToSection('services')}>Book an appointment</button>
        </div>
      )}

      {/* BOOKING MODAL */}
      {modal&&(
        <div className="cp-overlay" onClick={()=>setModal(null)}>
          <div className="cp-modal" onClick={e=>e.stopPropagation()}>
            {booked?(
              <div style={{textAlign:'center',padding:'1rem 0'}}>
                <div className="cp-success-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2e7d52" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg></div>
                <div className="cp-modal-title" style={{textAlign:'center'}}>Request sent!</div>
                <div className="cp-modal-sub" style={{textAlign:'center',lineHeight:1.6,marginTop:'.5rem'}}>
                  Your booking for <strong>{modal.name}</strong> on{' '}
                  <strong>{selectedDate?.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</strong> at{' '}
                  <strong>{formatTime(selectedTime)}</strong> has been sent.<br/>The studio will confirm shortly.
                </div>
                <button className="cp-btn-primary" style={{marginTop:'1.5rem',width:'100%'}} onClick={()=>setModal(null)}>Done</button>
              </div>
            ):(
              <>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.25rem'}}>
                  <div>
                    <div className="cp-modal-title">Book — {modal.name}</div>
                    <div className="cp-modal-sub">{fmt(modal.price)} · {modal.duration_min||60} min</div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:'.75rem'}}>
                    <div className="cp-steps-indicator">
                      {[1,2,3].map(s=><div key={s} className={`cp-step-dot${bookStep>=s?' active':''}${bookStep>s?' done':''}`}/>)}
                    </div>
                    <button onClick={()=>setModal(null)} style={{background:'none',border:'none',color:'#7a7672',cursor:'pointer',fontSize:'1.3rem',lineHeight:1,padding:'2px 4px'}}>×</button>
                  </div>
                </div>
                {bookError&&<div className="cp-error">{bookError}</div>}

                {bookStep===1&&(
                  <div>
                    <div className="cp-step-label">Choose a date</div>
                    <div className="cp-calendar">
                      <div className="cp-cal-header">
                        <button type="button" className="cp-cal-nav" onClick={prevMonth}>‹</button>
                        <div className="cp-cal-month">{MONTH_NAMES[calMonth]} {calYear}</div>
                        <button type="button" className="cp-cal-nav" onClick={nextMonth}>›</button>
                      </div>
                      <div className="cp-cal-days-header">{DAY_NAMES.map(d=><div key={d} className="cp-cal-day-name">{d}</div>)}</div>
                      {renderCalendar().map((week,wi)=>(
                        <div key={wi} className="cp-cal-week">
                          {week.map((day,di)=>{
                            if(!day)return<div key={di} className="cp-cal-cell empty"/>
                            const date=new Date(calYear,calMonth,day)
                            const open=isDayOpen(date)
                            const isSelected=selectedDate&&selectedDate.toDateString()===date.toDateString()
                            const isToday=new Date().toDateString()===date.toDateString()
                            return<div key={di} className={`cp-cal-cell${open?' open':' closed'}${isSelected?' selected':''}${isToday?' today':''}`} onClick={()=>open&&selectDate(date)}>{day}</div>
                          })}
                        </div>
                      ))}
                    </div>
                    <div className="cp-cal-legend">
                      <span><span className="cp-legend-dot open"/>Available</span>
                      <span><span className="cp-legend-dot closed"/>Closed</span>
                    </div>
                  </div>
                )}

                {bookStep===2&&(
                  <div>
                    <div className="cp-step-label">{selectedDate?.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})} — Pick a time</div>
                    {availableSlots.length===0?(
                      <div className="cp-empty" style={{padding:'1.5rem'}}>No available slots for this date. Try another day.</div>
                    ):(
                      <div className="cp-time-grid">
                        {availableSlots.map(slot=><div key={slot} className={`cp-time-slot${selectedTime===slot?' selected':''}`} onClick={()=>selectTime(slot)}>{formatTime(slot)}</div>)}
                      </div>
                    )}
                    <button type="button" className="cp-btn-ghost" style={{marginTop:'.75rem'}} onClick={()=>{setBookStep(1);setSelectedDate(null)}}>← Back to calendar</button>
                  </div>
                )}

                {bookStep===3&&(
                  <form onSubmit={submitBooking}>
                    <div className="cp-step-label">{selectedDate?.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})} at {formatTime(selectedTime)} — Your info</div>
                    <div className="cp-form-field">
                      <label>Full name *</label>
                      <input value={bookForm.name} onChange={e=>setBookForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Amara Diallo" required/>
                    </div>
                    <div className="cp-form-field">
                      <label>Email <span style={{color:'#b5893a',fontSize:'.78rem',fontWeight:400}}>(at least one required)</span></label>
                      <input type="email" value={bookForm.email} onChange={e=>setBookForm(f=>({...f,email:e.target.value}))} placeholder="your@email.com"/>
                    </div>
                    <div className="cp-form-field">
                      <label>Phone <span style={{color:'#b5893a',fontSize:'.78rem',fontWeight:400}}>(at least one required)</span></label>
                      <input value={bookForm.phone} onChange={e=>setBookForm(f=>({...f,phone:e.target.value}))} placeholder="+1 (514) 555-0123"/>
                    </div>
                    <div className="cp-form-field">
                      <label>Notes (optional)</label>
                      <input value={bookForm.notes} onChange={e=>setBookForm(f=>({...f,notes:e.target.value}))} placeholder="Special requests..."/>
                    </div>
                    <div style={{display:'flex',gap:'.6rem',marginTop:'.5rem'}}>
                      <button type="button" className="cp-btn-ghost" onClick={()=>{setBookStep(2);setSelectedTime(null)}}>← Back</button>
                      <button type="submit" className="cp-btn-primary" style={{flex:1}} disabled={booking}>{booking?'Sending...':'Confirm booking'}</button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {toast&&<div className="cp-toast">{toast}</div>}
    </div>
  )
}

const clientCSS=`
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
body{font-family:'DM Sans',sans-serif;color:#1a1814;-webkit-text-size-adjust:100%;}

.cp-hero{background:#0d0c0a;background-size:cover;background-position:center;padding:3.5rem 1.5rem 2.5rem;text-align:center;position:relative;overflow:hidden;min-height:300px;display:flex;align-items:center;justify-content:center;}
.cp-hero-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(13,12,10,.55) 0%,rgba(13,12,10,.82) 60%,#0d0c0a 100%);z-index:0;}
.cp-hero-content{position:relative;z-index:1;width:100%;}
.cp-avatar-img{width:84px;height:84px;border-radius:50%;object-fit:cover;border:2px solid rgba(181,137,58,.6);margin:0 auto .9rem;display:block;box-shadow:0 4px 20px rgba(0,0,0,.4);}
.cp-avatar{width:84px;height:84px;border-radius:50%;background:#1e1b17;border:2px solid rgba(181,137,58,.4);margin:0 auto .9rem;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:2rem;color:#b5893a;}
.cp-hero-name{font-family:'Playfair Display',serif;font-size:2rem;color:#fff;font-weight:500;}
.cp-hero-tagline{font-size:.82rem;color:rgba(255,255,255,.45);margin-top:.4rem;}
.cp-open-status{display:inline-flex;align-items:center;gap:.4rem;margin-top:.75rem;padding:.3rem .75rem;border-radius:20px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);font-size:.72rem;color:rgba(255,255,255,.65);}
.cp-open-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
.cp-open-dot.open{background:#4ade80;box-shadow:0 0 6px rgba(74,222,128,.5);}
.cp-open-dot.closed{background:#f87171;}
.cp-hero-links{display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center;margin-top:.85rem;}
.cp-hero-link{display:inline-flex;align-items:center;gap:.35rem;padding:.3rem .7rem;border-radius:20px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);font-size:.72rem;color:rgba(255,255,255,.6);text-decoration:none;transition:all .15s;}
.cp-hero-link:hover{background:rgba(181,137,58,.15);border-color:rgba(181,137,58,.3);color:#b5893a;}

.cp-tabs{position:sticky;top:0;z-index:50;background:#fff;border-bottom:1px solid #e4e0d8;display:flex;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
.cp-tabs::-webkit-scrollbar{display:none;}
.cp-tab{padding:.85rem 1.25rem;font-size:.82rem;font-weight:500;color:#7a7672;cursor:pointer;border:none;background:none;border-bottom:2px solid transparent;transition:all .15s;white-space:nowrap;font-family:inherit;flex-shrink:0;}
.cp-tab.active{color:#0d0c0a;border-bottom-color:#b5893a;}

.cp-section{padding:2rem 0;}
.cp-section-alt{background:#fff;}
.cp-section-inner{max-width:640px;margin:0 auto;padding:0 1.25rem;}
.cp-section-title{font-family:'Playfair Display',serif;font-size:1.35rem;font-weight:500;margin-bottom:1.25rem;color:#1a1814;}
.cp-empty{color:#7a7672;font-size:.85rem;text-align:center;padding:2rem;}
.cp-bio{font-size:.88rem;color:#3d3a35;line-height:1.75;margin-bottom:1.25rem;}

.cp-card{background:#fff;border:1px solid #e4e0d8;border-radius:12px;padding:1.1rem 1.25rem;margin-bottom:1rem;}
.cp-section-alt .cp-card{background:#f9f7f4;}
.cp-card-label{font-size:.62rem;font-weight:700;color:#b5893a;text-transform:uppercase;letter-spacing:.1em;margin-bottom:.85rem;}

.cp-hours-row{display:flex;justify-content:space-between;align-items:center;padding:.4rem 0;border-bottom:1px solid #f0ece4;font-size:.82rem;}
.cp-hours-row:last-child{border-bottom:none;}
.cp-hours-row.today .cp-hours-day{font-weight:600;color:#1a1814;}
.cp-hours-row.today .cp-hours-time{color:#b5893a;font-weight:600;}
.cp-hours-day{color:#3d3a35;}
.cp-hours-time{color:#7a7672;}
.cp-hours-closed{color:#c0c0bc;font-size:.78rem;}

.cp-contact-row{display:flex;align-items:center;gap:.65rem;padding:.55rem 0;border-bottom:1px solid #f0ece4;font-size:.85rem;color:#3d3a35;text-decoration:none;transition:color .15s;}
.cp-contact-row:last-child{border-bottom:none;}
.cp-contact-row:hover{color:#b5893a;}

.cp-address-text{display:flex;gap:.65rem;font-size:.85rem;color:#3d3a35;text-decoration:none;line-height:1.5;margin-bottom:1rem;transition:color .15s;}
.cp-address-text:hover{color:#b5893a;}
.cp-map-container{border-radius:10px;overflow:hidden;border:1px solid #e4e0d8;}

.cp-service-list{display:flex;flex-direction:column;gap:.5rem;}
.cp-service-card{display:flex;align-items:center;gap:1rem;padding:1rem 1.1rem;border:1px solid #e4e0d8;border-radius:10px;background:#fff;transition:border-color .15s,box-shadow .15s;}
.cp-service-card:hover{border-color:#b5893a;box-shadow:0 2px 12px rgba(181,137,58,.08);}
.cp-service-bar{width:3px;height:36px;border-radius:2px;background:#e8d9bf;flex-shrink:0;}
.cp-service-name{font-weight:500;font-size:.9rem;color:#1a1814;}
.cp-service-meta{font-size:.75rem;color:#7a7672;margin-top:.1rem;}
.cp-service-price{font-family:'Playfair Display',serif;font-size:1.1rem;color:#1a1814;}
.cp-book-btn{background:#1a1814;color:#fff;border:none;border-radius:8px;padding:.5rem 1rem;font-size:.78rem;font-weight:500;cursor:pointer;font-family:inherit;transition:background .15s;min-height:44px;}
.cp-book-btn:hover{background:#2a2a2a;}

.cp-float-wrap{position:fixed;bottom:0;left:0;right:0;padding:.85rem 1.25rem 1.25rem;background:linear-gradient(to top,rgba(245,243,239,1) 60%,transparent);z-index:40;pointer-events:none;}
.cp-float-btn{width:100%;max-width:400px;display:block;margin:0 auto;background:#1a1814;color:#fff;border:none;border-radius:12px;padding:.9rem 1.5rem;font-size:.9rem;font-weight:600;cursor:pointer;font-family:inherit;box-shadow:0 4px 24px rgba(0,0,0,.22);pointer-events:all;transition:background .15s;}
.cp-float-btn:hover{background:#2a2a2a;}

.cp-footer{background:#0d0c0a;padding:2rem 1.5rem 6rem;text-align:center;}
.cp-footer p{font-size:.72rem;color:rgba(255,255,255,.2);}
.cp-footer strong{color:rgba(255,255,255,.4);}

.cp-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:100;display:flex;align-items:flex-end;justify-content:center;}
.cp-modal{background:#fff;border-radius:20px 20px 0 0;padding:1.75rem 1.5rem 2rem;width:100%;max-width:500px;max-height:90vh;overflow-y:auto;box-shadow:0 -8px 40px rgba(0,0,0,.15);}
.cp-modal-title{font-family:'Playfair Display',serif;font-size:1.2rem;color:#1a1814;}
.cp-modal-sub{font-size:.75rem;color:#7a7672;margin-top:.15rem;}
.cp-steps-indicator{display:flex;gap:5px;}
.cp-step-dot{width:7px;height:7px;border-radius:50%;background:#e4e0d8;transition:all .2s;}
.cp-step-dot.active{background:#b5893a;}
.cp-step-dot.done{background:#2e7d52;}
.cp-step-label{font-size:.78rem;font-weight:500;color:#7a7672;margin-bottom:.9rem;}
.cp-error{padding:.65rem 1rem;border-radius:8px;font-size:.78rem;margin-bottom:1rem;background:#fef2f2;color:#c0392b;border:1px solid #fecaca;}
.cp-success-icon{width:56px;height:56px;border-radius:50%;background:#ecfdf5;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;}

.cp-calendar{border:1px solid #e4e0d8;border-radius:10px;overflow:hidden;}
.cp-cal-header{display:flex;align-items:center;justify-content:space-between;padding:.65rem 1rem;background:#faf9f7;}
.cp-cal-month{font-size:.85rem;font-weight:500;}
.cp-cal-nav{background:none;border:none;font-size:1.1rem;cursor:pointer;padding:.2rem .5rem;border-radius:4px;color:#7a7672;min-height:44px;}
.cp-cal-days-header{display:grid;grid-template-columns:repeat(7,1fr);border-bottom:1px solid #e4e0d8;}
.cp-cal-day-name{text-align:center;font-size:.62rem;font-weight:600;color:#7a7672;padding:.45rem 0;text-transform:uppercase;letter-spacing:.04em;}
.cp-cal-week{display:grid;grid-template-columns:repeat(7,1fr);}
.cp-cal-cell{text-align:center;padding:.55rem 0;font-size:.82rem;cursor:default;transition:all .12s;min-height:40px;display:flex;align-items:center;justify-content:center;}
.cp-cal-cell.open{cursor:pointer;color:#1a1814;}
.cp-cal-cell.open:hover{background:rgba(181,137,58,.1);color:#b5893a;font-weight:500;}
.cp-cal-cell.closed{color:#d0cec8;text-decoration:line-through;}
.cp-cal-cell.selected{background:#b5893a;color:#fff;font-weight:600;border-radius:6px;}
.cp-cal-cell.today{font-weight:700;}
.cp-cal-legend{display:flex;gap:1.25rem;justify-content:center;margin-top:.65rem;font-size:.7rem;color:#7a7672;}
.cp-legend-dot{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:.3rem;vertical-align:middle;}
.cp-legend-dot.open{background:#1a1814;}
.cp-legend-dot.closed{background:#d0cec8;}

.cp-time-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.45rem;}
.cp-time-slot{text-align:center;padding:.65rem .4rem;border:1px solid #e4e0d8;border-radius:8px;font-size:.8rem;cursor:pointer;transition:all .15s;min-height:44px;display:flex;align-items:center;justify-content:center;}
.cp-time-slot:hover{border-color:#b5893a;background:rgba(181,137,58,.05);}
.cp-time-slot.selected{background:#b5893a;color:#fff;border-color:#b5893a;font-weight:500;}

.cp-form-field{margin-bottom:.8rem;}
.cp-form-field label{display:block;font-size:.75rem;font-weight:500;color:#7a7672;margin-bottom:.35rem;}
.cp-form-field input{width:100%;padding:.7rem .9rem;border:1px solid #e4e0d8;border-radius:8px;font-size:16px;font-family:inherit;color:#1a1814;outline:none;transition:border .15s;}
.cp-form-field input:focus{border-color:#b5893a;box-shadow:0 0 0 3px rgba(181,137,58,.1);}

.cp-btn-primary{background:#1a1814;color:#fff;border:none;border-radius:9px;padding:.7rem 1.25rem;font-size:.85rem;font-weight:500;cursor:pointer;font-family:inherit;transition:background .15s;display:flex;align-items:center;justify-content:center;min-height:44px;}
.cp-btn-primary:hover{background:#2a2a2a;}
.cp-btn-primary:disabled{background:#ccc;cursor:not-allowed;}
.cp-btn-ghost{padding:.5rem 1rem;border-radius:8px;border:1px solid #e4e0d8;font-size:.78rem;cursor:pointer;background:#fff;font-family:inherit;color:#7a7672;transition:all .15s;min-height:44px;}
.cp-btn-ghost:hover{border-color:#7a7672;color:#1a1814;}

.cp-toast{position:fixed;bottom:5rem;right:1.25rem;left:1.25rem;background:#1a1814;color:#fff;padding:.85rem 1.25rem;border-radius:10px;font-size:.82rem;z-index:200;border-left:3px solid #b5893a;box-shadow:0 8px 24px rgba(0,0,0,.2);text-align:center;}

@media(min-width:600px){
  .cp-overlay{align-items:center;padding:1rem;}
  .cp-modal{border-radius:16px;padding:2rem;}
  .cp-toast{left:auto;right:1.5rem;text-align:left;}
  .cp-time-grid{grid-template-columns:repeat(4,1fr);}
}
`
