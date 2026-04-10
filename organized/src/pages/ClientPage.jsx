import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const fmt = (n) => `$${Number(n || 0).toLocaleString()}`

function generateTimeSlots(openTime, closeTime, durationMin) {
  const slots = []
  const [oh, om] = openTime.split(':').map(Number)
  const [ch, cm] = closeTime.split(':').map(Number)
  const openMinutes = oh * 60 + om
  const closeMinutes = ch * 60 + cm
  const step = durationMin || 60
  for (let m = openMinutes; m + step <= closeMinutes; m += step) {
    const h = Math.floor(m / 60)
    const min = m % 60
    slots.push(`${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`)
  }
  return slots
}

function formatTime(t) {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${String(m).padStart(2,'0')} ${ampm}`
}

export default function ClientPage() {
  const { slug } = useParams()
  const [workspace, setWorkspace] = useState(null)
  const [services, setServices] = useState([])
  const [products, setProducts] = useState([])
  const [availability, setAvailability] = useState([])
  const [blockedDates, setBlockedDates] = useState([])
  const [existingAppts, setExistingAppts] = useState([])
  const [tab, setTab] = useState('book')
  const [modal, setModal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [toast, setToast] = useState('')

  // Booking flow state
  const [bookStep, setBookStep] = useState(1) // 1=date, 2=time, 3=info
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [bookForm, setBookForm] = useState({ name:'', email:'', phone:'', notes:'' })
  const [booking, setBooking] = useState(false)
  const [booked, setBooked] = useState(false)
  const [bookError, setBookError] = useState('')

  // Calendar month state
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [calYear, setCalYear] = useState(new Date().getFullYear())

  function notify(msg) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => { loadProfile() }, [slug])

  // Live updates: poll blocked dates, availability, and appointments every 5 seconds
  // This is more reliable than Realtime for anonymous users
  useEffect(() => {
    if (!workspace) return

    function refreshLiveData() {
      supabase.from('blocked_dates').select('*').eq('workspace_id', workspace.id)
        .then(({ data }) => {
          const dates = (data || []).map(b => b.blocked_date)
          setBlockedDates(prev => {
            // Only update state if data actually changed
            if (JSON.stringify(prev) !== JSON.stringify(dates)) {
              // If selected date was just blocked, reset
              if (selectedDate) {
                const selectedStr = selectedDate.toISOString().split('T')[0]
                if (dates.includes(selectedStr) && !prev.includes(selectedStr)) {
                  setSelectedDate(null)
                  setSelectedTime(null)
                  setBookStep(1)
                  setBookError('This date was just blocked by the business. Please choose another date.')
                }
              }
              return dates
            }
            return prev
          })
        })

      supabase.from('availability').select('*').eq('workspace_id', workspace.id)
        .then(({ data }) => setAvailability(data || []))

      if (selectedDate) {
        loadApptsForDate(selectedDate)
      }
    }

    const interval = setInterval(refreshLiveData, 5000)
    return () => clearInterval(interval)
  }, [workspace, selectedDate])

  async function loadProfile() {
    const { data: ws } = await supabase.from('workspaces').select('*').eq('slug', slug).eq('is_published', true).single()
    if (!ws) { setNotFound(true); setLoading(false); return }
    setWorkspace(ws)

    const [{ data: svc }, { data: prod }, { data: avail }, { data: blocked }] = await Promise.all([
      supabase.from('services').select('*').eq('workspace_id', ws.id).eq('is_active', true).is('deleted_at', null).order('display_order'),
      supabase.from('products').select('*').eq('workspace_id', ws.id).eq('is_active', true).is('deleted_at', null),
      supabase.from('availability').select('*').eq('workspace_id', ws.id),
      supabase.from('blocked_dates').select('*').eq('workspace_id', ws.id),
    ])

    setServices(svc || [])
    setProducts(prod || [])
    setAvailability(avail || [])
    setBlockedDates((blocked || []).map(b => b.blocked_date))
    setLoading(false)
  }

  // Fetch booked appointments for a given date to calculate available slots
  async function loadApptsForDate(date) {
    const dateStr = date.toISOString().split('T')[0]
    const { data } = await supabase
      .from('appointments')
      .select('scheduled_at,ends_at,duration_min')
      .eq('workspace_id', workspace.id)
      .in('status', ['pending','confirmed'])
      .gte('scheduled_at', `${dateStr}T00:00:00`)
      .lt('scheduled_at', `${dateStr}T23:59:59`)
    setExistingAppts(data || [])
  }

  function openBooking(svc) {
    setModal(svc)
    setBookStep(1)
    setSelectedDate(null)
    setSelectedTime(null)
    setBookForm({ name:'', email:'', phone:'', notes:'' })
    setBooked(false)
    setBookError('')
    // Set calendar to current month
    const now = new Date()
    setCalMonth(now.getMonth())
    setCalYear(now.getFullYear())
  }

  // Check if a day is available
  function isDayOpen(date) {
    const dow = date.getDay()
    const avail = availability.find(a => a.day_of_week === dow)
    if (avail && !avail.is_open) return false
    const dateStr = date.toISOString().split('T')[0]
    if (blockedDates.includes(dateStr)) return false
    // Don't allow past dates
    const today = new Date()
    today.setHours(0,0,0,0)
    if (date < today) return false
    return true
  }

  // Get available time slots for selected date
  function getAvailableSlots() {
    if (!selectedDate || !modal) return []
    const dow = selectedDate.getDay()
    const avail = availability.find(a => a.day_of_week === dow)
    if (!avail || !avail.is_open) return []

    const allSlots = generateTimeSlots(avail.open_time, avail.close_time, modal.duration_min || 60)
    const duration = modal.duration_min || 60

    // Filter out slots that conflict with existing appointments
    return allSlots.filter(slot => {
      const [sh, sm] = slot.split(':').map(Number)
      const slotStart = sh * 60 + sm
      const slotEnd = slotStart + duration

      return !existingAppts.some(appt => {
        const apptDate = new Date(appt.scheduled_at)
        const apptStart = apptDate.getHours() * 60 + apptDate.getMinutes()
        const apptDuration = appt.duration_min || 60
        const apptEnd = apptStart + apptDuration
        return slotStart < apptEnd && slotEnd > apptStart
      })
    })
  }

  function selectDate(date) {
    setSelectedDate(date)
    setSelectedTime(null)
    setBookStep(2)
    setBookError('')
    loadApptsForDate(date)
  }

  function selectTime(time) {
    setSelectedTime(time)
    setBookStep(3)
    setBookError('')
  }

  async function submitBooking(e) {
    e.preventDefault()
    if (!bookForm.name) return setBookError('Please enter your name.')
    if (!selectedDate || !selectedTime) return setBookError('Please select a date and time.')
    setBooking(true)
    setBookError('')

    const scheduledAt = new Date(`${selectedDate.toISOString().split('T')[0]}T${selectedTime}:00`)

    const { error } = await supabase.from('appointments').insert({
      workspace_id: workspace.id,
      service_id: modal.id,
      client_name: bookForm.name,
      client_email: bookForm.email || null,
      client_phone: bookForm.phone || null,
      notes: bookForm.notes || null,
      scheduled_at: scheduledAt.toISOString(),
      duration_min: modal.duration_min || 60,
      amount: modal.price,
      status: 'pending',
    })

    if (error) {
      // Parse backend error messages from our triggers
      let msg = 'Something went wrong. Please try again.'
      if (error.message.includes('already booked')) msg = 'This time slot was just taken. Please choose another time.'
      else if (error.message.includes('closed on this day')) msg = 'The business is closed on this day.'
      else if (error.message.includes('outside business hours')) msg = 'This time is outside business hours.'
      else if (error.message.includes('unavailable')) msg = 'This date is unavailable.'
      setBookError(msg)
      setBooking(false)
      // If slot conflict, go back to time selection
      if (msg.includes('just taken')) {
        setBookStep(2)
        loadApptsForDate(selectedDate)
      }
      return
    }

    setBooked(true)
    setBooking(false)
  }

  // Calendar rendering
  function renderCalendar() {
    const firstDay = new Date(calYear, calMonth, 1).getDay()
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
    const weeks = []
    let week = Array(firstDay).fill(null)

    for (let d = 1; d <= daysInMonth; d++) {
      week.push(d)
      if (week.length === 7) { weeks.push(week); week = [] }
    }
    if (week.length) { while (week.length < 7) week.push(null); weeks.push(week) }

    return weeks
  }

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
    else setCalMonth(m => m - 1)
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
    else setCalMonth(m => m + 1)
  }

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0d0c0a'}}>
      <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.5rem',color:'#b5893a'}}>Organized.</div>
    </div>
  )

  if (notFound) return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#0d0c0a',color:'#fff',textAlign:'center',padding:'2rem'}}>
      <div style={{fontFamily:'Playfair Display,serif',fontSize:'3rem',color:'#b5893a',marginBottom:'1rem'}}>404</div>
      <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.5rem'}}>Profile not found</div>
      <div style={{fontSize:'.82rem',color:'rgba(255,255,255,.4)',marginTop:'.5rem'}}>This profile doesn't exist or is not published yet.</div>
    </div>
  )

  const availableSlots = getAvailableSlots()

  return (
    <div style={{background:'#fff',minHeight:'100vh'}}>
      <style>{clientCSS}</style>

      {/* Top bar */}
      <div className="cp-topbar">
        <div className="cp-topbar-name">{workspace.name}</div>
        {workspace.instagram && (
          <a href={`https://instagram.com/${workspace.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="cp-ig-link">
            {workspace.instagram}
          </a>
        )}
      </div>

      {/* Hero */}
      <div className="cp-hero">
        <div className="cp-hero-glow"/>
        <div className="cp-avatar">{workspace.name[0]}</div>
        <div className="cp-hero-name">{workspace.name}</div>
        <div className="cp-hero-sub">{workspace.tagline || workspace.location || ''}</div>
        {workspace.phone && <div className="cp-hero-sub">{workspace.phone}</div>}
      </div>

      {/* Tabs */}
      <div className="cp-tabs">
        {[['book','Book a service'],['shop','Shop']].map(([k,l]) => (
          <div key={k} className={`cp-tab ${tab===k?'active':''}`} onClick={() => setTab(k)}>{l}</div>
        ))}
      </div>

      {/* Content */}
      <div className="cp-content">

        {tab === 'book' && (
          <>
            <div className="cp-section-title">Services</div>
            {services.length === 0 ? (
              <div className="cp-empty">No services listed yet.</div>
            ) : (
              <div className="cp-service-list">
                {services.map(svc => (
                  <div key={svc.id} className="cp-service-card" onClick={() => openBooking(svc)}>
                    <div className="cp-service-bar"/>
                    <div style={{flex:1}}>
                      <div className="cp-service-name">{svc.name}</div>
                      <div className="cp-service-meta">
                        {svc.duration_min ? `${svc.duration_min} min` : ''}
                        {svc.description ? ` · ${svc.description}` : ''}
                      </div>
                    </div>
                    <div className="cp-service-price">{svc.is_free ? 'Free' : fmt(svc.price)}</div>
                    <button className="cp-book-btn">Book</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'shop' && (
          <>
            <div className="cp-section-title">Products</div>
            {products.length === 0 ? (
              <div className="cp-empty">No products available yet.</div>
            ) : (
              <div className="cp-product-grid">
                {products.map(p => (
                  <div key={p.id} className="cp-product-card">
                    <div className="cp-product-img">PRODUCT</div>
                    <div className="cp-product-body">
                      <div className="cp-product-name">{p.name}</div>
                      <div className="cp-product-price">{fmt(p.price)}</div>
                      {p.stock === 0 ? (
                        <div className="cp-out-of-stock">Out of stock</div>
                      ) : (
                        <button className="cp-order-btn" onClick={() => notify(`Contact the studio to order ${p.name}.`)}>Order</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="cp-footer">
        <p>Powered by <strong>Organized.</strong> — beorganized.io</p>
      </div>

      {/* Booking Modal */}
      {modal && (
        <div className="cp-overlay" onClick={() => setModal(null)}>
          <div className="cp-modal" onClick={e => e.stopPropagation()}>

            {booked ? (
              <div style={{textAlign:'center',padding:'1rem 0'}}>
                <div className="cp-success-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2e7d52" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div className="cp-modal-title" style={{textAlign:'center'}}>Request sent!</div>
                <div className="cp-modal-sub" style={{textAlign:'center',lineHeight:1.6}}>
                  Your booking for <strong>{modal.name}</strong> on{' '}
                  <strong>{selectedDate?.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</strong> at{' '}
                  <strong>{formatTime(selectedTime)}</strong> has been sent.
                  <br/>The studio will confirm shortly.
                </div>
                <button className="cp-btn-primary" style={{marginTop:'1.5rem'}} onClick={() => setModal(null)}>Done</button>
              </div>
            ) : (
              <>
                {/* Modal header */}
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.25rem'}}>
                  <div>
                    <div className="cp-modal-title">Book — {modal.name}</div>
                    <div className="cp-modal-sub">
                      {fmt(modal.price)} · {modal.duration_min || 60} min
                    </div>
                  </div>
                  <div className="cp-steps-indicator">
                    {[1,2,3].map(s => (
                      <div key={s} className={`cp-step-dot ${bookStep>=s?'active':''} ${bookStep>s?'done':''}`}/>
                    ))}
                  </div>
                </div>

                {bookError && <div className="cp-error">{bookError}</div>}

                {/* Step 1: Date */}
                {bookStep === 1 && (
                  <div>
                    <div className="cp-step-label">Choose a date</div>
                    <div className="cp-calendar">
                      <div className="cp-cal-header">
                        <button type="button" className="cp-cal-nav" onClick={prevMonth}>‹</button>
                        <div className="cp-cal-month">{MONTH_NAMES[calMonth]} {calYear}</div>
                        <button type="button" className="cp-cal-nav" onClick={nextMonth}>›</button>
                      </div>
                      <div className="cp-cal-days-header">
                        {DAY_NAMES.map(d => <div key={d} className="cp-cal-day-name">{d}</div>)}
                      </div>
                      {renderCalendar().map((week, wi) => (
                        <div key={wi} className="cp-cal-week">
                          {week.map((day, di) => {
                            if (!day) return <div key={di} className="cp-cal-cell empty"/>
                            const date = new Date(calYear, calMonth, day)
                            const open = isDayOpen(date)
                            const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString()
                            const isToday = new Date().toDateString() === date.toDateString()
                            return (
                              <div
                                key={di}
                                className={`cp-cal-cell ${open?'open':'closed'} ${isSelected?'selected':''} ${isToday?'today':''}`}
                                onClick={() => open && selectDate(date)}
                              >
                                {day}
                              </div>
                            )
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

                {/* Step 2: Time */}
                {bookStep === 2 && (
                  <div>
                    <div className="cp-step-label">
                      {selectedDate?.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})} — Pick a time
                    </div>
                    {availableSlots.length === 0 ? (
                      <div className="cp-empty" style={{padding:'1.5rem'}}>
                        No available slots for this date. Try another day.
                      </div>
                    ) : (
                      <div className="cp-time-grid">
                        {availableSlots.map(slot => (
                          <div
                            key={slot}
                            className={`cp-time-slot ${selectedTime===slot?'selected':''}`}
                            onClick={() => selectTime(slot)}
                          >
                            {formatTime(slot)}
                          </div>
                        ))}
                      </div>
                    )}
                    <button type="button" className="cp-btn-ghost" style={{marginTop:'.75rem'}} onClick={() => { setBookStep(1); setSelectedDate(null) }}>
                      ← Back to calendar
                    </button>
                  </div>
                )}

                {/* Step 3: Info */}
                {bookStep === 3 && (
                  <form onSubmit={submitBooking}>
                    <div className="cp-step-label">
                      {selectedDate?.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})} at {formatTime(selectedTime)} — Your info
                    </div>
                    <div className="cp-form-field">
                      <label>Full name *</label>
                      <input value={bookForm.name} onChange={e => setBookForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Amara Diallo" required/>
                    </div>
                    <div className="cp-form-field">
                      <label>Email</label>
                      <input type="email" value={bookForm.email} onChange={e => setBookForm(f=>({...f,email:e.target.value}))} placeholder="your@email.com"/>
                    </div>
                    <div className="cp-form-field">
                      <label>Phone</label>
                      <input value={bookForm.phone} onChange={e => setBookForm(f=>({...f,phone:e.target.value}))} placeholder="+1 (514) 555-0123"/>
                    </div>
                    <div className="cp-form-field">
                      <label>Notes (optional)</label>
                      <input value={bookForm.notes} onChange={e => setBookForm(f=>({...f,notes:e.target.value}))} placeholder="Special requests..."/>
                    </div>
                    <div style={{display:'flex',gap:'.6rem',marginTop:'.5rem'}}>
                      <button type="button" className="cp-btn-ghost" onClick={() => { setBookStep(2); setSelectedTime(null) }}>← Back</button>
                      <button type="submit" className="cp-btn-primary" style={{flex:1}} disabled={booking}>
                        {booking ? 'Sending...' : 'Confirm booking'}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {toast && <div className="cp-toast">{toast}</div>}
    </div>
  )
}

const clientCSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'DM Sans',sans-serif;color:#0d0c0a;}

.cp-topbar{background:#0d0c0a;padding:0 2rem;height:54px;display:flex;align-items:center;justify-content:space-between;}
.cp-topbar-name{font-family:'Playfair Display',serif;font-size:1.1rem;color:#fff;font-weight:500;}
.cp-ig-link{font-size:.75rem;color:rgba(255,255,255,.4);text-decoration:none;transition:color .15s;}
.cp-ig-link:hover{color:#b5893a;}

.cp-hero{background:#0d0c0a;padding:3.5rem 2rem 2.5rem;text-align:center;position:relative;overflow:hidden;}
.cp-hero-glow{position:absolute;inset:0;background:radial-gradient(ellipse 70% 60% at 50% 0%,rgba(181,137,58,.12),transparent);pointer-events:none;}
.cp-avatar{width:76px;height:76px;border-radius:50%;background:#2a2a2a;border:1px solid rgba(181,137,58,.4);margin:0 auto .9rem;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:1.6rem;color:#b5893a;position:relative;z-index:1;}
.cp-hero-name{font-family:'Playfair Display',serif;font-size:2rem;color:#fff;font-weight:400;position:relative;z-index:1;}
.cp-hero-sub{font-size:.82rem;color:rgba(255,255,255,.4);margin-top:.4rem;position:relative;z-index:1;}

.cp-tabs{display:flex;background:#fff;border-bottom:1px solid #e4e0d8;justify-content:center;}
.cp-tab{padding:.9rem 2rem;font-size:.82rem;font-weight:500;color:#7a7672;cursor:pointer;border-bottom:2px solid transparent;transition:all .15s;}
.cp-tab.active{color:#0d0c0a;border-bottom-color:#b5893a;}
.cp-tab:hover{color:#0d0c0a;}

.cp-content{max-width:800px;margin:0 auto;padding:2.5rem 1.5rem;}
.cp-section-title{font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:400;margin-bottom:1.25rem;}
.cp-empty{color:#7a7672;font-size:.85rem;text-align:center;padding:2rem;}

.cp-service-list{display:flex;flex-direction:column;gap:.6rem;}
.cp-service-card{display:flex;align-items:center;gap:1rem;padding:1.1rem 1.25rem;border:1px solid #e4e0d8;border-radius:9px;cursor:pointer;background:#fff;transition:border-color .15s,box-shadow .15s;}
.cp-service-card:hover{border-color:#b5893a;box-shadow:0 2px 12px rgba(181,137,58,.08);}
.cp-service-bar{width:3px;height:36px;border-radius:2px;background:#e8d9bf;flex-shrink:0;}
.cp-service-name{font-weight:500;font-size:.9rem;}
.cp-service-meta{font-size:.75rem;color:#7a7672;margin-top:.1rem;}
.cp-service-price{font-family:'Playfair Display',serif;font-size:1.2rem;}
.cp-book-btn{background:#0d0c0a;color:#fff;border:none;border-radius:7px;padding:.45rem .9rem;font-size:.76rem;font-weight:500;cursor:pointer;font-family:inherit;transition:background .15s;}
.cp-book-btn:hover{background:#2a2a2a;}

.cp-product-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;}
.cp-product-card{border:1px solid #e4e0d8;border-radius:9px;overflow:hidden;transition:box-shadow .15s;}
.cp-product-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.06);}
.cp-product-img{height:110px;background:#f7f5f0;display:flex;align-items:center;justify-content:center;font-size:.72rem;color:#7a7672;}
.cp-product-body{padding:.9rem 1rem;}
.cp-product-name{font-size:.85rem;font-weight:500;}
.cp-product-price{font-family:'Playfair Display',serif;font-size:1.05rem;margin-top:.2rem;}
.cp-out-of-stock{font-size:.72rem;color:#c0392b;margin-top:.5rem;font-weight:500;}
.cp-order-btn{width:100%;margin-top:.7rem;padding:.5rem;border:1px solid #e4e0d8;border-radius:6px;background:none;font-size:.76rem;cursor:pointer;font-family:inherit;transition:all .15s;}
.cp-order-btn:hover{border-color:#0d0c0a;}

.cp-footer{background:#0d0c0a;padding:2rem;text-align:center;}
.cp-footer p{font-size:.75rem;color:rgba(255,255,255,.25);}
.cp-footer strong{color:rgba(255,255,255,.5);}

/* Modal */
.cp-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:100;display:flex;align-items:center;justify-content:center;padding:1rem;}
.cp-modal{background:#fff;border-radius:14px;padding:2rem;width:460px;max-width:95vw;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.2);}
.cp-modal-title{font-family:'Playfair Display',serif;font-size:1.3rem;}
.cp-modal-sub{font-size:.78rem;color:#7a7672;margin-top:.15rem;}

.cp-steps-indicator{display:flex;gap:6px;}
.cp-step-dot{width:8px;height:8px;border-radius:50%;background:#e4e0d8;transition:all .2s;}
.cp-step-dot.active{background:#b5893a;}
.cp-step-dot.done{background:#2e7d52;}

.cp-step-label{font-size:.8rem;font-weight:500;color:#7a7672;margin-bottom:1rem;}

.cp-error{padding:.65rem 1rem;border-radius:8px;font-size:.8rem;margin-bottom:1rem;background:#fef2f2;color:#c0392b;border:1px solid #fecaca;}

.cp-success-icon{width:56px;height:56px;border-radius:50%;background:#ecfdf5;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;}

/* Calendar */
.cp-calendar{border:1px solid #e4e0d8;border-radius:10px;overflow:hidden;}
.cp-cal-header{display:flex;align-items:center;justify-content:space-between;padding:.75rem 1rem;background:#faf9f7;}
.cp-cal-month{font-size:.88rem;font-weight:500;}
.cp-cal-nav{background:none;border:none;font-size:1.1rem;cursor:pointer;padding:.2rem .5rem;border-radius:4px;color:#7a7672;transition:all .15s;}
.cp-cal-nav:hover{background:#e4e0d8;color:#0d0c0a;}
.cp-cal-days-header{display:grid;grid-template-columns:repeat(7,1fr);border-bottom:1px solid #e4e0d8;}
.cp-cal-day-name{text-align:center;font-size:.68rem;font-weight:600;color:#7a7672;padding:.5rem 0;text-transform:uppercase;letter-spacing:.05em;}
.cp-cal-week{display:grid;grid-template-columns:repeat(7,1fr);}
.cp-cal-cell{text-align:center;padding:.6rem 0;font-size:.82rem;cursor:default;transition:all .12s;border-radius:0;}
.cp-cal-cell.empty{background:transparent;}
.cp-cal-cell.open{cursor:pointer;color:#0d0c0a;font-weight:400;}
.cp-cal-cell.open:hover{background:rgba(181,137,58,.1);color:#b5893a;font-weight:500;}
.cp-cal-cell.closed{color:#d0cec8;text-decoration:line-through;}
.cp-cal-cell.selected{background:#b5893a;color:#fff;font-weight:600;}
.cp-cal-cell.today{font-weight:700;}
.cp-cal-legend{display:flex;gap:1.25rem;justify-content:center;margin-top:.75rem;font-size:.72rem;color:#7a7672;}
.cp-legend-dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:.3rem;vertical-align:middle;}
.cp-legend-dot.open{background:#0d0c0a;}
.cp-legend-dot.closed{background:#d0cec8;}

/* Time grid */
.cp-time-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;}
.cp-time-slot{text-align:center;padding:.7rem .5rem;border:1px solid #e4e0d8;border-radius:8px;font-size:.82rem;cursor:pointer;transition:all .15s;}
.cp-time-slot:hover{border-color:#b5893a;background:rgba(181,137,58,.05);}
.cp-time-slot.selected{background:#b5893a;color:#fff;border-color:#b5893a;font-weight:500;}

/* Form */
.cp-form-field{margin-bottom:.85rem;}
.cp-form-field label{display:block;font-size:.75rem;font-weight:500;color:#7a7672;margin-bottom:.35rem;}
.cp-form-field input{width:100%;padding:.65rem .9rem;border:1px solid #e4e0d8;border-radius:7px;font-size:.84rem;font-family:inherit;color:#0d0c0a;outline:none;transition:border .15s;box-sizing:border-box;}
.cp-form-field input:focus{border-color:#b5893a;box-shadow:0 0 0 3px rgba(181,137,58,.1);}

/* Buttons */
.cp-btn-primary{background:#0d0c0a;color:#fff;border:none;border-radius:7px;padding:.65rem 1.25rem;font-size:.82rem;font-weight:500;cursor:pointer;font-family:inherit;transition:background .15s;display:flex;align-items:center;justify-content:center;}
.cp-btn-primary:hover{background:#2a2a2a;}
.cp-btn-primary:disabled{background:#ccc;cursor:not-allowed;}
.cp-btn-ghost{padding:.5rem 1rem;border-radius:8px;border:1px solid #e4e0d8;font-size:.78rem;cursor:pointer;background:#fff;font-family:inherit;color:#7a7672;transition:all .15s;}
.cp-btn-ghost:hover{border-color:#7a7672;color:#0d0c0a;}

.cp-toast{position:fixed;bottom:1.75rem;right:1.75rem;background:#0d0c0a;color:#fff;padding:.85rem 1.4rem;border-radius:9px;font-size:.82rem;z-index:200;border-left:3px solid #b5893a;box-shadow:0 8px 24px rgba(0,0,0,.2);}

@media(max-width:600px){
  .cp-product-grid{grid-template-columns:repeat(2,1fr);}
  .cp-time-grid{grid-template-columns:repeat(2,1fr);}
  .cp-content{padding:1.5rem 1rem;}
  .cp-modal{padding:1.5rem;}
}
`
