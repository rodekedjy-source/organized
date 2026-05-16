import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { createAppointment } from '../api/appointments'

// ── I18N ──────────────────────────────────────────────────────────────────────
const LANG = {
  en: {
    morning:'Good morning',afternoon:'Good afternoon',evening:'Good evening',
    copy_link:'Copy link',link_copied:'Booking link copied!',
    today_schedule:"Today's schedule",confirmed:'confirmed',
    revenue_week:'Revenue — this week',calendar:'Calendar',tap_date:'Tap a date to view or block',
    day_open:'Your day is open',share_link:'Share your booking link to fill your schedule.',
    copy_booking_link:'Copy booking link',
    appts_title:'Appointments',
    next_appt:'Next appointment',reschedule:'Reschedule',message:'Remind',
    block_date:'Block date',reason:'Reason (optional)',block_btn:'Block this date',
    note_title:'Day note',note_placeholder:'Add a note for this day…',
    save_note:'Save note',note_saved:'Saved ✓',past_day:'This day has passed.',
    add_booking:'+ Add booking',new_booking:'New booking',booking_client:'Client name',
    booking_phone:'Phone (optional)',booking_email:'Email (optional)',
    booking_service:'Service',booking_time:'Time',booking_amount:'Amount',
    booking_status:'Status',booking_save:'Save booking',booking_saving:'Saving…',
    booking_saved:'Booking added!',booking_confirmed:'Confirmed',booking_pending:'Pending',
    booking_no_service:'No service',
  },
  fr: {
    morning:'Bonjour',afternoon:'Bonjour',evening:'Bonsoir',
    copy_link:'Copier le lien',link_copied:'Lien copié !',
    today_schedule:'Planning du jour',confirmed:'confirmé',
    revenue_week:'Revenus — cette semaine',calendar:'Calendrier',tap_date:'Appuyer sur une date pour voir ou bloquer',
    day_open:'La journée est libre',share_link:'Partage ton lien pour remplir ton agenda.',
    copy_booking_link:'Copier le lien de réservation',
    appts_title:'Rendez-vous',
    next_appt:'Prochain rendez-vous',reschedule:'Reprogrammer',message:'Rappeler',
    block_date:'Bloquer une date',reason:'Raison (optionnel)',block_btn:'Bloquer cette date',
    note_title:'Note du jour',note_placeholder:'Ajouter une note pour ce jour…',
    save_note:'Sauvegarder',note_saved:'Enregistré ✓',past_day:'Cette journée est passée.',
    add_booking:'+ Ajouter un RDV',new_booking:'Nouveau rendez-vous',booking_client:'Nom du client',
    booking_phone:'Téléphone (optionnel)',booking_email:'Email (optionnel)',
    booking_service:'Service',booking_time:'Heure',booking_amount:'Montant',
    booking_status:'Statut',booking_save:'Enregistrer le RDV',booking_saving:'Enregistrement…',
    booking_saved:'RDV ajouté !',booking_confirmed:'Confirmé',booking_pending:'En attente',
    booking_no_service:'Sans service',
  },
  es: {
    morning:'Buenos días',afternoon:'Buenas tardes',evening:'Buenas noches',
    copy_link:'Copiar enlace',link_copied:'¡Enlace copiado!',
    today_schedule:'Agenda de hoy',confirmed:'confirmada',
    revenue_week:'Ingresos — esta semana',calendar:'Calendario',tap_date:'Toca una fecha para ver o bloquear',
    day_open:'El día está libre',share_link:'Comparte tu enlace para llenar tu agenda.',
    copy_booking_link:'Copiar enlace de reserva',
    appts_title:'Citas',
    next_appt:'Próxima cita',reschedule:'Reprogramar',message:'Recordar',
    block_date:'Bloquear fecha',reason:'Razón (opcional)',block_btn:'Bloquear esta fecha',
    note_title:'Nota del día',note_placeholder:'Agrega una nota para este día…',
    save_note:'Guardar nota',note_saved:'Guardado ✓',past_day:'Este día ya pasó.',
    add_booking:'+ Agregar cita',new_booking:'Nueva cita',booking_client:'Nombre del cliente',
    booking_phone:'Teléfono (opcional)',booking_email:'Correo (opcional)',
    booking_service:'Servicio',booking_time:'Hora',booking_amount:'Monto',
    booking_status:'Estado',booking_save:'Guardar cita',booking_saving:'Guardando…',
    booking_saved:'¡Cita agregada!',booking_confirmed:'Confirmada',booking_pending:'Pendiente',
    booking_no_service:'Sin servicio',
  },
}
function t(lang, key) { return (LANG[lang] || LANG.en)[key] || LANG.en[key] || key }

// ── LOCAL HELPERS ─────────────────────────────────────────────────────────────
const fmtRev = n => `$${Number(n||0).toLocaleString()}`

function firstName(ws, session) {
  const meta = session?.user?.user_metadata
  if (meta?.full_name) return meta.full_name.trim().split(' ')[0]
  if (meta?.first_name) return meta.first_name.trim()
  if (meta?.name) return meta.name.trim().split(' ')[0]
  const e = session?.user?.email || ''
  const n = e.split('@')[0].replace(/[._-]/g,' ').trim().split(' ')[0]
  return n.charAt(0).toUpperCase() + n.slice(1)
}
function startOfWeek(offset=0) {
  const d = new Date(); d.setHours(0,0,0,0)
  d.setDate(d.getDate() - d.getDay() + offset*7)
  return d
}
function weekRevenue(appts, weekOffset=0) {
  const sw = startOfWeek(weekOffset)
  const ew = new Date(sw); ew.setDate(sw.getDate()+7)
  return appts.filter(a => {
    const tt = new Date(a.scheduled_at)
    return a.status==='confirmed' && tt>=sw && tt<ew
  }).reduce((s,a)=>s+Number(a.amount||0),0)
}
function monthRevenue(appts, monthOffset=0) {
  const now = new Date()
  const y = now.getFullYear(), m = now.getMonth()+monthOffset
  return appts.filter(a => {
    const tt = new Date(a.scheduled_at)
    return a.status==='confirmed' && tt.getFullYear()===y && tt.getMonth()===m
  }).reduce((s,a)=>s+Number(a.amount||0),0)
}
function pct(a,b) { if(!b) return null; return Math.round(((a-b)/b)*100) }
function svcName(a) { return a.services?.name || a.service_name || '—' }

function formatNextApptLabel(dateStr, lang='en') {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
  const apptStr  = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  const time = d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
  if (apptStr === todayStr) {
    if (lang==='fr') return `aujourd'hui à ${time}`
    if (lang==='es') return `hoy a las ${time}`
    return `today at ${time}`
  }
  if (lang==='fr') {
    const dt = d.toLocaleDateString('fr-FR',{day:'numeric',month:'long'})
    return `le ${dt} à ${time}`
  }
  if (lang==='es') {
    const dt = d.toLocaleDateString('es-ES',{day:'numeric',month:'long'})
    return `el ${dt} a las ${time}`
  }
  const dt = d.toLocaleDateString('en-US',{month:'long',day:'numeric'})
  return `${dt} at ${time}`
}

function useScrollLock() {
  useEffect(()=>{
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return ()=>{ document.body.style.overflow = prev }
  },[])
}

// ── ICONS ─────────────────────────────────────────────────────────────────────
const I = {
  cal:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="14" height="12" rx="1.5"/><path d="M1 7h14M5 1v4M11 1v4"/></svg>,
  grad:  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2L1 6l7 4 7-4-7-4z"/><path d="M3 8.5V12c0 1 2 2.5 5 2.5s5-1.5 5-2.5V8.5"/></svg>,
  star:  <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l1.8 4.5H15l-4.2 3 1.6 4.8L8 10.8l-4.4 2.5 1.6-4.8L1 6.5h5.2z"/></svg>,
  clock: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6.5"/><path d="M8 4.5V8l2.5 2"/></svg>,
  link:  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6.5 9.5a3.5 3.5 0 005 0l2-2a3.5 3.5 0 00-5-5l-1 1"/><path d="M9.5 6.5a3.5 3.5 0 00-5 0l-2 2a3.5 3.5 0 005 5l1-1"/></svg>,
}

// ── DAILY INSPIRATION DATA ────────────────────────────────────────────────────
const INSPIRATION_QUOTES=[
  {icon:'✨',text:'The secret of getting ahead is getting started.',author:'Mark Twain'},
  {icon:'💎',text:'Quality is not an act, it is a habit.',author:'Aristotle'},
  {icon:'🌟',text:'Success is the sum of small efforts, repeated day in and day out.',author:'Robert Collier'},
  {icon:'🔥',text:'The only way to do great work is to love what you do.',author:'Steve Jobs'},
  {icon:'🌸',text:'Beauty begins the moment you decide to be yourself.',author:'Coco Chanel'},
  {icon:'⭐',text:"Hard work beats talent when talent doesn't work hard.",author:'Tim Notke'},
  {icon:'🎯',text:'The future belongs to those who believe in the beauty of their dreams.',author:'Eleanor Roosevelt'},
  {icon:'💡',text:'Your most unhappy customers are your greatest source of learning.',author:'Bill Gates'},
  {icon:'🌈',text:'Chase the vision, not the money; the money will end up following you.',author:'Tony Hsieh'},
  {icon:'🦋',text:'Small steps in the right direction can turn out to be the biggest step of your life.',author:'Unknown'},
  {icon:'🎨',text:'Creativity is intelligence having fun.',author:'Albert Einstein'},
  {icon:'🚀',text:'The best time to plant a tree was 20 years ago. The second best time is now.',author:'Chinese Proverb'},
  {icon:'💼',text:'Success usually comes to those who are too busy to be looking for it.',author:'Henry David Thoreau'},
  {icon:'🌙',text:'Each morning we are born again. What we do today is what matters most.',author:'Buddha'},
  {icon:'🏆',text:"Don't be afraid to give up the good to go for the great.",author:'John D. Rockefeller'},
  {icon:'🌺',text:'The woman who does not require validation from anyone is the most feared individual.',author:'Mohadesa Najumi'},
  {icon:'✊',text:'She believed she could, so she did.',author:'Unknown'},
  {icon:'🌱',text:'Plant seeds of happiness, hope, success, and love; it will all come back to you in abundance.',author:'Steve Maraboli'},
  {icon:'🎵',text:'Start where you are. Use what you have. Do what you can.',author:'Arthur Ashe'},
  {icon:'🌊',text:'The secret to your success is found in your daily routine.',author:'John C. Maxwell'},
  {icon:'⚡',text:"Believe you can and you're halfway there.",author:'Theodore Roosevelt'},
  {icon:'🌻',text:'Keep your face always toward the sunshine, and shadows will fall behind you.',author:'Walt Whitman'},
  {icon:'🎯',text:'A year from now you may wish you had started today.',author:'Karen Lamb'},
  {icon:'💪',text:"It always seems impossible until it's done.",author:'Nelson Mandela'},
  {icon:'🌟',text:'Strive not to be a success, but rather to be of value.',author:'Albert Einstein'},
  {icon:'💫',text:"Your talent is God's gift to you. What you do with it is your gift back.",author:'Leo Buscaglia'},
  {icon:'🌿',text:'Every day is a fresh start. Every morning we wake up is the first day of our new life.',author:'Unknown'},
  {icon:'💛',text:'What you do makes a difference, and you have to decide what kind of difference you want to make.',author:'Jane Goodall'},
  {icon:'💪',text:"Don't watch the clock; do what it does. Keep going.",author:'Sam Levenson'},
  {icon:'🧠',text:"The more that you read, the more things you will know. The more that you learn, the more places you'll go.",author:'Dr. Seuss'},
]
const BIBLE_VERSES=[
  {icon:'✝️',text:'I can do all things through Christ who strengthens me.',ref:'Philippians 4:13'},
  {icon:'📖',text:'Commit your work to the Lord, and your plans will be established.',ref:'Proverbs 16:3'},
  {icon:'✝️',text:'And whatever you do, do it heartily, as to the Lord and not to men.',ref:'Colossians 3:23'},
  {icon:'📖',text:'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you.',ref:'Jeremiah 29:11'},
  {icon:'✝️',text:'She is clothed with strength and dignity, and she laughs without fear of the future.',ref:'Proverbs 31:25'},
  {icon:'📖',text:'In all your ways acknowledge him, and he will make straight your paths.',ref:'Proverbs 3:6'},
  {icon:'✝️',text:'Do not be anxious about anything, but in every situation, present your requests to God.',ref:'Philippians 4:6'},
  {icon:'📖',text:'Whoever sows generously will also reap generously.',ref:'2 Corinthians 9:6'},
  {icon:'✝️',text:'Let your light shine before others, that they may see your good deeds.',ref:'Matthew 5:16'},
  {icon:'📖',text:'The Lord is my shepherd, I lack nothing.',ref:'Psalm 23:1'},
  {icon:'✝️',text:'Trust in the Lord with all your heart and lean not on your own understanding.',ref:'Proverbs 3:5'},
  {icon:'📖',text:'Be strong and courageous. Do not be afraid; do not be discouraged.',ref:'Joshua 1:9'},
  {icon:'✝️',text:'She watches over the affairs of her household and does not eat the bread of idleness.',ref:'Proverbs 31:27'},
  {icon:'📖',text:'Let us not become weary in doing good, for at the proper time we will reap a harvest.',ref:'Galatians 6:9'},
  {icon:'✝️',text:'Seek first his kingdom and his righteousness, and all these things will be given to you.',ref:'Matthew 6:33'},
  {icon:'📖',text:'Now to him who is able to do immeasurably more than all we ask or imagine.',ref:'Ephesians 3:20'},
  {icon:'✝️',text:'The plans of the diligent lead to profit as surely as haste leads to poverty.',ref:'Proverbs 21:5'},
  {icon:'📖',text:'With man this is impossible, but with God all things are possible.',ref:'Matthew 19:26'},
  {icon:'✝️',text:'The Lord your God is with you, the Mighty Warrior who saves.',ref:'Zephaniah 3:17'},
  {icon:'📖',text:'Delight yourself in the Lord, and he will give you the desires of your heart.',ref:'Psalm 37:4'},
  {icon:'✝️',text:'God has not given us a spirit of fear, but of power and of love and of a sound mind.',ref:'2 Timothy 1:7'},
  {icon:'📖',text:'She is worth far more than rubies.',ref:'Proverbs 31:10'},
  {icon:'✝️',text:'Ask and it will be given to you; seek and you will find; knock and the door will be opened.',ref:'Matthew 7:7'},
  {icon:'📖',text:'I have learned, in whatever state I am, to be content.',ref:'Philippians 4:11'},
  {icon:'✝️',text:'The Lord bless you and keep you; the Lord make his face shine on you and be gracious to you.',ref:'Numbers 6:24-25'},
  {icon:'📖',text:'Cast all your anxiety on him because he cares for you.',ref:'1 Peter 5:7'},
  {icon:'✝️',text:'Whatever is true, whatever is noble, whatever is right — think about such things.',ref:'Philippians 4:8'},
  {icon:'📖',text:'The Lord will open to you his good treasury to give rain to your land in its season.',ref:'Deuteronomy 28:12'},
  {icon:'✝️',text:'She is clothed in strength and dignity.',ref:'Proverbs 31:25'},
  {icon:'📖',text:'Commit to the Lord whatever you do, and he will establish your plans.',ref:'Proverbs 16:3'},
]
function getDailyEntry(arr){
  const now=new Date()
  const start=new Date(now.getFullYear(),0,0)
  const day=Math.floor((now-start)/86400000)
  return arr[day%arr.length]
}

// ── RESCHEDULE MODAL ──────────────────────────────────────────────────────────
function RescheduleModal({ appt, onClose, onSaved, toast }) {
  useScrollLock()
  const now=new Date()
  const [year,setYear]=useState(now.getFullYear())
  const [month,setMonth]=useState(now.getMonth())
  const [day,setDay]=useState(null)
  const [time,setTime]=useState('09:00')
  const [saving,setSaving]=useState(false)
  const firstDOW=new Date(year,month,1).getDay()
  const daysInMonth=new Date(year,month+1,0).getDate()
  const monthLabel=new Date(year,month,1).toLocaleDateString('en-US',{month:'long',year:'numeric'})
  function prevMonth(){if(month===0){setMonth(11);setYear(y=>y-1)}else setMonth(m=>m-1);setDay(null)}
  function nextMonth(){if(month===11){setMonth(0);setYear(y=>y+1)}else setMonth(m=>m+1);setDay(null)}
  async function save(){
    if(!day||!time) return toast('Pick a date and time first.')
    const [h,m]=time.split(':')
    const dt=new Date(year,month,day,parseInt(h),parseInt(m))
    if(dt<=new Date()) return toast('Please choose a future date and time.')
    setSaving(true)
    const{error}=await supabase.from('appointments').update({scheduled_at:dt.toISOString()}).eq('id',appt.id)
    setSaving(false)
    if(error){toast('Error rescheduling.');return}
    toast(`Rescheduled to ${dt.toLocaleDateString('en-US',{month:'short',day:'numeric'})} at ${time}`)
    onSaved();onClose()
  }
  const cells=[]
  for(let i=0;i<firstDOW;i++) cells.push(null)
  for(let d=1;d<=daysInMonth;d++) cells.push(d)
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}} onClick={onClose}>
      <div style={{background:'var(--surface)',borderRadius:16,padding:'1.75rem',width:'100%',maxWidth:360,boxShadow:'0 24px 64px rgba(0,0,0,.2)'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.25rem'}}>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',color:'var(--ink)'}}>Reschedule</div>
            <div style={{fontSize:'.78rem',color:'var(--ink-3)',marginTop:2}}>{appt.client_name} · {svcName(appt)}</div>
          </div>
          <button style={{background:'var(--bg)',border:'none',width:30,height:30,borderRadius:'50%',cursor:'pointer',color:'var(--ink-3)',fontSize:'1rem',display:'flex',alignItems:'center',justifyContent:'center'}} onClick={onClose}>×</button>
        </div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'.75rem'}}>
          <button className="cal-nav-btn" onClick={prevMonth}>&#8249;</button>
          <span style={{fontSize:'.84rem',fontWeight:600,color:'var(--ink)'}}>{monthLabel}</span>
          <button className="cal-nav-btn" onClick={nextMonth}>&#8250;</button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,marginBottom:'1rem'}}>
          {['S','M','T','W','T','F','S'].map((d,i)=>(
            <div key={i} style={{textAlign:'center',fontSize:'.62rem',fontWeight:600,color:'var(--ink-3)',padding:'3px 0'}}>{d}</div>
          ))}
          {cells.map((d,i)=>{
            const isPast=d&&new Date(year,month,d)<new Date(new Date().setHours(0,0,0,0))
            const isSelected=d===day
            return (
              <div key={i} onClick={()=>d&&!isPast&&setDay(d)}
                style={{textAlign:'center',fontSize:'.78rem',padding:'6px 2px',borderRadius:6,
                  cursor:d&&!isPast?'pointer':'default',
                  background:isSelected?'var(--ink)':'transparent',
                  color:isSelected?'#fff':isPast?'var(--border-2)':d?'var(--ink)':'transparent',
                  fontWeight:isSelected?600:400,transition:'background .12s'}}>{d||''}</div>
            )
          })}
        </div>
        <div style={{marginBottom:'1.25rem'}}>
          <label style={{display:'block',fontSize:'.76rem',fontWeight:500,color:'var(--ink-3)',marginBottom:'.4rem'}}>TIME</label>
          <input type="time" value={time} onChange={e=>setTime(e.target.value)}
            style={{width:'100%',padding:'.6rem .9rem',border:'1px solid var(--border-2)',borderRadius:8,fontSize:'.88rem',fontFamily:'inherit',color:'var(--ink)',background:'var(--surface)',outline:'none'}}/>
        </div>
        <div style={{display:'flex',gap:'.6rem'}}>
          <button className="btn btn-secondary" style={{flex:1,justifyContent:'center'}} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{flex:1,justifyContent:'center'}} onClick={save} disabled={saving||!day}>{saving?'Saving…':'Confirm'}</button>
        </div>
      </div>
    </div>
  )
}

// ── MESSAGE MODAL ─────────────────────────────────────────────────────────────
function MessageModal({ appt, onClose, workspace }) {
  useScrollLock()
  const phone=appt.client_phone||''
  const email=appt.client_email||''
  const name=appt.client_name||'there'
  const biz=workspace?.name||'your stylist'
  const apptDate=new Date(appt.scheduled_at).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})
  const apptTime=new Date(appt.scheduled_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})
  const defaultSMS=`Hi ${name}, this is ${biz}. Reminder: your appointment is on ${apptDate} at ${apptTime}. See you soon!`
  const defaultEmail=`Hi ${name},\n\nA reminder from ${biz} about your upcoming appointment on ${apptDate} at ${apptTime}.\n\nSee you soon!\n\n— ${biz}`
  const [smsBody,setSmsBody]=useState(defaultSMS)
  const [emailBody,setEmailBody]=useState(defaultEmail)
  function openSMS(){window.open(`sms:${phone.replace(/\s/g,'')}?body=${encodeURIComponent(smsBody)}`)}
  function openEmail(){window.open(`mailto:${email}?subject=${encodeURIComponent(`Reminder — ${biz}`)}&body=${encodeURIComponent(emailBody)}`)}
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}} onClick={onClose}>
      <div style={{background:'var(--surface)',borderRadius:16,padding:'1.75rem',width:'100%',maxWidth:400,boxShadow:'0 24px 64px rgba(0,0,0,.2)'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.25rem'}}>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',color:'var(--ink)'}}>Message client</div>
            <div style={{fontSize:'.78rem',color:'var(--ink-3)',marginTop:2}}>{name}</div>
          </div>
          <button style={{background:'var(--bg)',border:'none',width:30,height:30,borderRadius:'50%',cursor:'pointer',color:'var(--ink-3)',fontSize:'1rem',display:'flex',alignItems:'center',justifyContent:'center'}} onClick={onClose}>×</button>
        </div>
        {phone?(
          <div style={{marginBottom:'1.25rem',padding:'1rem',background:'var(--bg)',borderRadius:10,border:'1px solid var(--border)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'.65rem'}}>
              <div>
                <div style={{fontSize:'.72rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.05em'}}>SMS</div>
                <div style={{fontSize:'.85rem',fontWeight:500,color:'var(--ink)',marginTop:2}}>{phone}</div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={openSMS}>Open SMS →</button>
            </div>
            <textarea value={smsBody} onChange={e=>setSmsBody(e.target.value)} rows={3}
              style={{width:'100%',padding:'.55rem .75rem',border:'1px solid var(--border-2)',borderRadius:7,fontSize:'.78rem',fontFamily:'inherit',color:'var(--ink)',background:'var(--surface)',resize:'vertical',outline:'none',lineHeight:1.5}}/>
          </div>
        ):(
          <div style={{marginBottom:'1.25rem',padding:'1rem',background:'var(--bg)',borderRadius:10,border:'1px solid var(--border)',fontSize:'.82rem',color:'var(--ink-3)'}}>No phone number on file.</div>
        )}
        {email?(
          <div style={{padding:'1rem',background:'var(--bg)',borderRadius:10,border:'1px solid var(--border)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'.65rem'}}>
              <div>
                <div style={{fontSize:'.72rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.05em'}}>Email</div>
                <div style={{fontSize:'.85rem',fontWeight:500,color:'var(--ink)',marginTop:2}}>{email}</div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={openEmail}>Open Mail →</button>
            </div>
            <textarea value={emailBody} onChange={e=>setEmailBody(e.target.value)} rows={4}
              style={{width:'100%',padding:'.55rem .75rem',border:'1px solid var(--border-2)',borderRadius:7,fontSize:'.78rem',fontFamily:'inherit',color:'var(--ink)',background:'var(--surface)',resize:'vertical',outline:'none',lineHeight:1.5}}/>
          </div>
        ):(
          <div style={{padding:'1rem',background:'var(--bg)',borderRadius:10,border:'1px solid var(--border)',fontSize:'.82rem',color:'var(--ink-3)'}}>No email address on file.</div>
        )}
        <button className="btn btn-secondary" style={{width:'100%',justifyContent:'center',marginTop:'1rem'}} onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

// ── NEXT UP BANNER ────────────────────────────────────────────────────────────
function NextUpBanner({ appts, workspace, onReloaded, toast, lang='en' }) {
  const now=new Date()
  const next=appts.filter(a=>new Date(a.scheduled_at)>now&&a.status==='confirmed').sort((a,b)=>new Date(a.scheduled_at)-new Date(b.scheduled_at))[0]
  const [showReschedule,setShowReschedule]=useState(false)
  const [showMessage,setShowMessage]=useState(false)
  if(!next) return null
  const dateLabel=formatNextApptLabel(next.scheduled_at,lang)
  return (
    <>
      <div className="next-up-banner">
        <div style={{display:'flex',alignItems:'flex-start',gap:'.85rem',marginBottom:'.9rem'}}>
          <div className="next-up-icon">{I.clock}</div>
          <div style={{flex:1,minWidth:0}}>
            <div className="next-up-label">{t(lang,'next_appt')} — {dateLabel}</div>
            <div className="next-up-name">{next.client_name} · {svcName(next)}</div>
          </div>
          <div style={{textAlign:'right',flexShrink:0}}>
            <div className="next-up-amount" style={{fontSize:'.95rem',fontWeight:600,color:'var(--gold)'}}>{fmtRev(next.amount)}</div>
          </div>
        </div>
        <div style={{display:'flex',justifyContent:'flex-end',gap:'.5rem'}}>
          <button onClick={()=>setShowReschedule(true)}
            style={{background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.15)',color:'rgba(255,255,255,.75)',borderRadius:8,padding:'.5rem 1rem',fontSize:'.78rem',fontWeight:500,cursor:'pointer',fontFamily:'inherit'}}>
            {t(lang,'reschedule')}
          </button>
          <button onClick={()=>setShowMessage(true)}
            style={{background:'var(--gold)',border:'none',color:'#1a1814',borderRadius:8,padding:'.5rem 1.1rem',fontSize:'.78rem',fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
            {t(lang,'message')}
          </button>
        </div>
      </div>
      {showReschedule&&<RescheduleModal appt={next} onClose={()=>setShowReschedule(false)} onSaved={onReloaded} toast={toast}/>}
      {showMessage&&<MessageModal appt={next} workspace={workspace} onClose={()=>setShowMessage(false)}/>}
    </>
  )
}

// ── MONTHLY GOAL ──────────────────────────────────────────────────────────────
function MonthlyGoal({ appts, workspace, refetchWorkspace, lang='en' }) {
  const goal=workspace?.monthly_revenue_goal||3000
  const [editing,setEditing]=useState(false)
  const [draft,setDraft]=useState(goal)
  const [saving,setSaving]=useState(false)
  const rev=monthRevenue(appts)
  const pctVal=Math.min(Math.round((rev/goal)*100),100)
  const remaining=Math.max(goal-rev,0)
  const confirmedAppts=appts.filter(a=>a.status==='confirmed'&&Number(a.amount)>0)
  const avgAppt=confirmedAppts.length?rev/confirmedAppts.length:0
  const apptNeeded=avgAppt>0?Math.ceil(remaining/avgAppt):null
  const monthName=new Date().toLocaleDateString(lang==='fr'?'fr-FR':lang==='es'?'es-ES':'en-US',{month:'long'})
  const [displayPct,setDisplayPct]=useState(0)
  useEffect(()=>{const tt=setTimeout(()=>setDisplayPct(pctVal),120);return()=>clearTimeout(tt)},[pctVal])
  async function saveGoal(){
    if(!workspace?.id) return;setSaving(true)
    await supabase.from('workspaces').update({monthly_revenue_goal:draft}).eq('id',workspace.id)
    await refetchWorkspace();setSaving(false);setEditing(false)
  }
  return (
    <div className="card" style={{marginBottom:0}}>
      <div className="card-head">
        <div>
          <div className="card-title">{lang==='fr'?'Objectif revenus':lang==='es'?'Meta de ingresos':'Revenue Goal'} — {monthName}</div>
          {!editing&&<div className="card-sub">{fmtRev(rev)} {lang==='fr'?'sur':lang==='es'?'de':'of'} {fmtRev(goal)}</div>}
        </div>
        {editing?(
          <div style={{display:'flex',gap:'.4rem',alignItems:'center'}}>
            <input type="number" value={draft} onChange={e=>setDraft(parseInt(e.target.value)||0)}
              style={{width:'90px',padding:'.3rem .6rem',border:'1px solid var(--gold)',borderRadius:'6px',fontSize:'.82rem',fontFamily:'inherit',color:'var(--ink)',background:'var(--surface)'}}/>
            <button className="btn btn-primary btn-xs" onClick={saveGoal} disabled={saving}>{saving?'…':'Save'}</button>
            <button className="btn btn-secondary btn-xs" onClick={()=>setEditing(false)}>✕</button>
          </div>
        ):(
          <button className="btn btn-secondary btn-xs" onClick={()=>{setDraft(goal);setEditing(true)}}>Edit goal</button>
        )}
      </div>
      <div style={{padding:'1.25rem 1.4rem'}}>
        <div className="goal-track"><div className="goal-fill" style={{width:`${displayPct}%`}}/></div>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:'.5rem',fontSize:'.72rem',color:'var(--ink-3)'}}>
          <span style={{color:pctVal>=100?'var(--green)':'var(--ink-3)',fontWeight:pctVal>=100?600:400}}>
            {pctVal>=100?'🎉 Goal reached!':`${pctVal}% reached`}
          </span>
          <span>{fmtRev(remaining)} remaining</span>
        </div>
        {remaining>0&&apptNeeded&&(
          <div className="goal-hint">At your average rate, <strong>{apptNeeded} more appointment{apptNeeded>1?'s':''}</strong> will get you there.</div>
        )}
      </div>
    </div>
  )
}

// ── TOP SERVICE INSIGHT ────────────────────────────────────────────────────────
function TopServiceInsight({ appts }) {
  const map={}
  appts.filter(a=>a.status==='confirmed').forEach(a=>{
    const name=svcName(a);if(name==='—') return
    if(!map[name]) map[name]={count:0,rev:0}
    map[name].count++;map[name].rev+=Number(a.amount||0)
  })
  const entries=Object.entries(map).sort((a,b)=>b[1].rev-a[1].rev)
  if(!entries.length) return (
    <div className="card" style={{marginBottom:0}}>
      <div className="card-head"><div className="card-title">Your top service</div></div>
      <div style={{padding:'1.4rem',fontSize:'.82rem',color:'var(--ink-3)'}}>Confirm your first appointment to see which service drives your business.</div>
    </div>
  )
  const [name,{count,rev}]=entries[0]
  const totalRev=appts.filter(a=>a.status==='confirmed').reduce((s,a)=>s+Number(a.amount||0),0)
  const share=totalRev>0?Math.round((rev/totalRev)*100):0
  return (
    <div className="card" style={{marginBottom:0}}>
      <div className="card-head">
        <div className="card-title">Your top service</div>
        <span className="top-badge">{I.star} #1</span>
      </div>
      <div style={{padding:'1.25rem 1.4rem'}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.35rem',color:'var(--ink)',marginBottom:'.35rem'}}>{name}</div>
        <div style={{fontSize:'.8rem',color:'var(--ink-3)',marginBottom:'1rem'}}>{count} booking{count>1?'s':''} &middot; {fmtRev(rev)} earned</div>
        <div className="top-track"><div className="top-fill" style={{width:`${share}%`}}/></div>
        <div style={{fontSize:'.72rem',color:'var(--ink-3)',marginTop:'.4rem'}}><strong style={{color:'var(--gold)'}}>{share}%</strong> of your total revenue</div>
      </div>
    </div>
  )
}

// ── WEEK CHART ────────────────────────────────────────────────────────────────
function WeekChart({ appts }) {
  const sw=startOfWeek()
  const labels=['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const bars=labels.map((_,i)=>{
    const d=new Date(sw);d.setDate(sw.getDate()+i)
    const ds=d.toISOString().split('T')[0]
    return appts.filter(a=>a.scheduled_at?.startsWith(ds)&&a.status==='confirmed').reduce((s,a)=>s+Number(a.amount||0),0)
  })
  const max=Math.max(...bars,1),total=bars.reduce((s,v)=>s+v,0),peakIdx=bars.indexOf(Math.max(...bars))
  const delta=pct(weekRevenue(appts,0),weekRevenue(appts,-1))
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
        <div className="card-sub">Total: {fmtRev(total)}</div>
        {delta!==null&&(
          <span style={{fontSize:'.72rem',fontWeight:600,color:delta>=0?'var(--green)':'var(--red)',background:delta>=0?'rgba(46,125,82,.08)':'rgba(192,57,43,.08)',padding:'2px 8px',borderRadius:'20px'}}>
            {delta>=0?'↑':'↓'} {Math.abs(delta)}% vs last week
          </span>
        )}
      </div>
      <div className="bar-chart">{bars.map((v,i)=><div key={i} className={`bar${i===peakIdx&&v>0?' peak':''}`} style={{height:`${Math.max((v/max)*100,4)}%`}}/>)}</div>
      <div className="bar-labels">{labels.map(l=><div key={l} className="bar-lbl">{l}</div>)}</div>
    </div>
  )
}

// ── REVENUE PANEL ─────────────────────────────────────────────────────────────
function RevenuePanel({ appts, onClose }) {
  useScrollLock()
  const now=new Date(),year=now.getFullYear(),month=now.getMonth()
  const monthName=now.toLocaleDateString('fr-FR',{month:'long',year:'numeric'})
  const daysInMonth=new Date(year,month+1,0).getDate()
  const daily=Array.from({length:daysInMonth},(_,i)=>{
    const day=i+1,ds=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    const total=appts.filter(a=>a.scheduled_at?.startsWith(ds)&&a.status==='confirmed').reduce((s,a)=>s+Number(a.amount||0),0)
    return{day,total}
  })
  const nonZero=daily.filter(d=>d.total>0),maxVal=Math.max(...daily.map(d=>d.total),1)
  const highest=nonZero.length?nonZero.reduce((a,b)=>a.total>b.total?a:b):null
  const lowest=nonZero.length>1?nonZero.reduce((a,b)=>a.total<b.total?a:b):null
  const avg=nonZero.length?Math.round(nonZero.reduce((s,d)=>s+d.total,0)/nonZero.length):0
  const total=nonZero.reduce((s,d)=>s+d.total,0)
  const vsLast=pct(total,monthRevenue(appts,-1))
  const narrative=nonZero.length===0
    ?`Aucun revenu confirmé ce mois-ci. Dès que tu confirmes des rendez-vous, l'analyse apparaîtra ici.`
    :`En ${monthName}, tu as généré ${fmtRev(total)} sur ${nonZero.length} jour${nonZero.length>1?'s':''} actif${nonZero.length>1?'s':''}.${highest?` Meilleur jour : le ${highest.day} avec ${fmtRev(highest.total)}.`:''} ${avg>0?`Moyenne : ${fmtRev(avg)}/jour.`:''}${lowest&&lowest.day!==highest?.day?` Jour le plus bas : le ${lowest.day} avec ${fmtRev(lowest.total)}.`:''}`
  return (
    <div className="rev-overlay" onClick={onClose}>
      <div className="rev-panel" onClick={e=>e.stopPropagation()}>
        <div className="rev-panel-head">
          <div><div className="rev-panel-title">Revenus</div><div className="rev-panel-sub">{monthName}</div></div>
          <button className="rev-close" onClick={onClose}>&#10005;</button>
        </div>
        <div style={{display:'flex',alignItems:'baseline',gap:'.75rem',marginBottom:'1.5rem'}}>
          <div className="rev-total" style={{marginBottom:0}}>{fmtRev(total)}</div>
          {vsLast!==null&&<span style={{fontSize:'.8rem',fontWeight:600,color:vsLast>=0?'var(--green)':'var(--red)'}}>{vsLast>=0?'↑':'↓'} {Math.abs(vsLast)}% vs last month</span>}
        </div>
        <div className="rev-chart-wrap">
          <svg width="100%" height="100" viewBox={`0 0 ${daysInMonth*14} 100`} preserveAspectRatio="none">
            <defs><linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c9a96e"/><stop offset="100%" stopColor="#e8d5b0"/></linearGradient></defs>
            {daily.map(({day,total:tt})=>{
              const barH=tt>0?Math.max((tt/maxVal)*88,6):3,x=(day-1)*14+2
              return <rect key={day} x={x} y={100-barH} width={10} height={barH} rx={3} fill={highest?.day===day?'#b5893a':tt>0?'url(#bg2)':'#f0ece4'}/>
            })}
          </svg>
          <div className="rev-axis">
            {[1,8,15,22,daysInMonth].map(d=>(<span key={d} style={{position:'absolute',left:`${((d-1)/daysInMonth)*100}%`,transform:'translateX(-50%)'}}>{d}</span>))}
          </div>
        </div>
        {nonZero.length>0&&(
          <div className="rev-pills">
            {highest&&<div className="rev-pill"><span className="rev-pill-icon">&#8593;</span><div><div className="rev-pill-label">Meilleur jour</div><div className="rev-pill-val">{fmtRev(highest.total)} &middot; {highest.day} {monthName.split(' ')[0]}</div></div></div>}
            <div className="rev-pill"><span className="rev-pill-icon rev-pill-avg">&#8960;</span><div><div className="rev-pill-label">Moyenne / jour actif</div><div className="rev-pill-val">{fmtRev(avg)}</div></div></div>
            {lowest&&lowest.day!==highest?.day&&<div className="rev-pill"><span className="rev-pill-icon rev-pill-low">&#8595;</span><div><div className="rev-pill-label">Jour le plus bas</div><div className="rev-pill-val">{fmtRev(lowest.total)} &middot; {lowest.day} {monthName.split(' ')[0]}</div></div></div>}
          </div>
        )}
        <div className="rev-narrative">{narrative}</div>
      </div>
    </div>
  )
}

// ── COACH SLIDER ──────────────────────────────────────────────────────────────
function CoachSlider({ appts, stats, workspace, session, lang='en' }) {
  const now=new Date()
  const mn=now.toLocaleDateString(lang==='fr'?'fr-FR':lang==='es'?'es-ES':'en-US',{month:'long'})
  const uid=session?.user?.id||'guest'
  const faithEnabled=localStorage.getItem(`org_faith_${uid}`)==='true'
  const dailyArr=faithEnabled?BIBLE_VERSES:INSPIRATION_QUOTES
  const dailyEntry=getDailyEntry(dailyArr)
  const tips=[{
    icon:dailyEntry.icon,
    text:`"${dailyEntry.text}"`,
    sub:`— ${faithEnabled?dailyEntry.ref:dailyEntry.author}`,
    isInspiration:true
  }]
  const monthAppts=appts.filter(a=>{const tt=new Date(a.scheduled_at);return tt.getFullYear()===now.getFullYear()&&tt.getMonth()===now.getMonth()})
  const confirmedCount=monthAppts.filter(a=>a.status==='confirmed').length
  const mRev=monthRevenue(appts)
  const activeDays=new Set(appts.filter(a=>{
    const d=new Date(a.scheduled_at)
    return a.status==='confirmed'&&d.getFullYear()===now.getFullYear()&&d.getMonth()===now.getMonth()
  }).map(a=>new Date(a.scheduled_at).toISOString().split('T')[0])).size
  if(activeDays===0) tips.push({icon:'📅',text:lang==='fr'?`Aucun jour actif ce mois-ci. Partage ton lien de réservation pour remplir ton agenda.`:lang==='es'?`Sin días activos este mes. Comparte tu enlace para llenar tu agenda.`:`No active days this month. Share your booking link to fill your calendar.`})
  else if(activeDays<8) tips.push({icon:'📅',text:lang==='fr'?`${activeDays} jour${activeDays>1?'s':''} actif${activeDays>1?'s':''} ce mois. Continue à partager ton lien — chaque slot vide est du revenu qui attend.`:lang==='es'?`${activeDays} día${activeDays>1?'s':''} activo${activeDays>1?'s':''} este mes. Sigue compartiendo tu enlace.`:`${activeDays} active day${activeDays>1?'s':''} this month. Keep sharing your link — every empty slot is revenue waiting.`})
  else if(activeDays<15) tips.push({icon:'📅',text:lang==='fr'?`${activeDays} jours actifs ce mois. Ton agenda se remplit bien — maintiens cette dynamique.`:lang==='es'?`${activeDays} días activos este mes. Tu agenda se está llenando bien.`:`${activeDays} active days this month. Your schedule is filling up — keep the momentum.`})
  else tips.push({icon:'🔥',text:lang==='fr'?`${activeDays} jours actifs ce mois. Agenda presque plein — pense à ajuster tes prix si la demande dépasse ta capacité.`:lang==='es'?`${activeDays} días activos este mes. Agenda casi lleno.`:`${activeDays} active days this month. Almost fully booked — consider adjusting pricing if demand exceeds capacity.`})
  if(confirmedCount>=1&&confirmedCount<3) tips.push({icon:'🎯',text:lang==='fr'?`Premier rendez-vous confirmé ce mois — tu prends de l'élan.`:lang==='es'?`Primera reserva confirmada este mes — estás tomando impulso.`:`First confirmed booking this month — you're building momentum.`})
  if(confirmedCount>=5) tips.push({icon:'💪',text:lang==='fr'?`${confirmedCount} réservations confirmées ce mois. Tu es en pleine forme.`:lang==='es'?`${confirmedCount} reservas confirmadas este mes.`:`${confirmedCount} bookings confirmed this month. You're on a roll.`})
  if(confirmedCount>=10) tips.push({icon:'🔥',text:lang==='fr'?`${confirmedCount} réservations ce mois. Agenda bien rempli.`:lang==='es'?`${confirmedCount} reservas este mes. Agenda completo.`:`${confirmedCount} bookings this month. That's a full schedule.`})
  if(mRev>=500&&mRev<1000) tips.push({icon:'⭐',text:lang==='fr'?`Plus de 500 $ gagnés ce mois — bon départ.`:lang==='es'?`Más de $500 ganados este mes — buen comienzo.`:`Over $500 earned this month — strong start.`})
  if(mRev>=1000) tips.push({icon:'🏆',text:lang==='fr'?`1 000 $+ gagnés ce mois. Tu as franchi un cap.`:lang==='es'?`$1,000+ ganados este mes. Alcanzaste un hito.`:`$1,000+ earned this month. You crossed a milestone.`})
  if(mRev>=3000) tips.push({icon:'🚀',text:lang==='fr'?`3 000 $+ ce mois. Mois exceptionnel.`:lang==='es'?`$3,000+ este mes. Mes excepcional.`:`$3,000+ this month. Exceptional month for your business.`})
  if(stats.students>=10) tips.push({icon:'🎓',text:lang==='fr'?`${stats.students} élèves inscrits à vos formations.`:lang==='es'?`${stats.students} estudiantes matriculados.`:`${stats.students} students enrolled in your formations.`})
  const pending=appts.filter(a=>a.status==='pending')
  if(pending.length>0) tips.push({icon:'📋',text:lang==='fr'?`${pending.length} réservation${pending.length>1?'s':''} non confirmée${pending.length>1?'s':''}. Les confirmer sécurise l'engagement de tes clients.`:lang==='es'?`Tienes ${pending.length} reserva${pending.length>1?'s':''} sin confirmar.`:`You have ${pending.length} unconfirmed booking${pending.length>1?'s':''} waiting. Confirming ${pending.length>1?'them':'it'} secures your client's commitment.`})
  const todayStr=now.toISOString().split('T')[0]
  const noReminder=appts.filter(a=>a.scheduled_at?.startsWith(todayStr)&&a.status==='confirmed'&&!a.reminder_sent_at)
  if(noReminder.length>0) tips.push({icon:'💬',text:lang==='fr'?`${noReminder.length} client${noReminder.length>1?"s n'ont":" n'a"} pas reçu de rappel pour aujourd'hui. Un message rapide réduit les no-shows.`:lang==='es'?`${noReminder.length} cliente${noReminder.length>1?'s no han':' no ha'} recibido recordatorio hoy.`:`${noReminder.length} client${noReminder.length>1?'s have':' has'} not received a reminder for today. A quick message reduces no-shows.`})
  const goal=workspace?.monthly_revenue_goal||3000
  const pctG=Math.round((mRev/goal)*100),remaining=Math.max(goal-mRev,0)
  const confirmed=appts.filter(a=>a.status==='confirmed'&&Number(a.amount)>0)
  const avg=confirmed.length?mRev/confirmed.length:0
  if(pctG<50&&avg>0){const needed=Math.ceil(remaining/avg);tips.push({icon:'📈',text:lang==='fr'?`Tu es à ${pctG}% de ton objectif de ${mn}. ${needed} rendez-vous de plus à ta moyenne comblerait l'écart.`:lang==='es'?`Estás al ${pctG}% de tu meta de ${mn}. ${needed} cita${needed>1?'s':''} más cerrarían la brecha.`:`You're at ${pctG}% of your ${mn} goal. ${needed} more appointment${needed>1?'s':''} at your average would close the gap.`})}
  else if(pctG>=50&&pctG<90) tips.push({icon:'📈',text:lang==='fr'?`Tu es à ${pctG}% de ton objectif mensuel. Bon rythme — garde ton agenda bien rempli.`:lang==='es'?`Estás al ${pctG}% de tu meta mensual. Buen ritmo.`:`You're at ${pctG}% of your monthly goal. Strong progress — keep your schedule filled.`})
  const in3=new Date(now.getTime()+3*24*60*60*1000)
  const upcoming=appts.filter(a=>{const d=new Date(a.scheduled_at);return d>now&&d<=in3&&a.status!=='cancelled'})
  if(upcoming.length===0) tips.push({icon:'🔗',text:lang==='fr'?`Tes 3 prochains jours sont libres. Partager ton lien aujourd'hui pourrait remplir ces créneaux avant la fin de la semaine.`:lang==='es'?`Tus próximos 3 días están libres. Compartir tu enlace hoy podría llenar esos espacios.`:`Your next 3 days are open. Sharing your booking link today could fill those slots before the week ends.`})
  const INTERVAL=5000
  const [idx,setIdx]=useState(0)
  const [visible,setVisible]=useState(true)
  const [progress,setProgress]=useState(0)
  useEffect(()=>{
    if(tips.length<=1) return
    setProgress(0)
    const start=Date.now()
    const raf=requestAnimationFrame(function tick(){
      const p=Math.min((Date.now()-start)/INTERVAL*100,100)
      setProgress(p);if(p<100) requestAnimationFrame(tick)
    })
    const tt=setTimeout(()=>{setVisible(false);setTimeout(()=>{setIdx(i=>(i+1)%tips.length);setVisible(true)},300)},INTERVAL)
    return()=>{clearTimeout(tt);cancelAnimationFrame(raf)}
  },[idx,tips.length])
  if(!tips.length) return null
  const tip=tips[idx]
  return (
    <div className="coach-slider">
      <div className="coach-slider-label">Coach</div>
      <div className={`coach-slider-body${visible?'':' coach-fade-out'}`}>
        <span className="coach-slider-icon">{tip.icon}</span>
        <div style={{flex:1}}>
          <span className="coach-slider-text" style={tip.isInspiration?{fontStyle:'italic'}:{}}>{tip.text}</span>
          {tip.sub&&<div style={{fontSize:'.72rem',color:'var(--gold)',fontWeight:600,marginTop:'.35rem'}}>{tip.sub}</div>}
        </div>
      </div>
      {tips.length>1&&(
        <div className="coach-slider-footer">
          <div className="coach-slider-dots">
            {tips.map((_,i)=>(<button key={i} className={`coach-dot${i===idx?' coach-dot-active':''}`} onClick={()=>{setVisible(false);setTimeout(()=>{setIdx(i);setVisible(true)},300)}}/>))}
          </div>
          <div className="coach-progress-track"><div className="coach-progress-bar" style={{width:`${progress}%`}}/></div>
        </div>
      )}
    </div>
  )
}

// ── DAY PANEL ─────────────────────────────────────────────────────────────────
function DayPanel({ dayStr, allAppts, blockedDates, onClose, onBlock, onUnblock, onBooked, workspace, lang='en' }) {
  useScrollLock()
  const [mode,setMode]=useState('main')
  const [reason,setReason]=useState('')
  const [note,setNote]=useState('')
  const [noteSaving,setNoteSaving]=useState(false)
  const [noteSaved,setNoteSaved]=useState(false)
  const [noteLoading,setNoteLoading]=useState(true)
  const [services,setServices]=useState([])
  const [availability,setAvailability]=useState([])
  const [bookingForm,setBookingForm]=useState({client_name:'',client_phone:'',client_email:'',service_id:'',time:'09:00',amount:'',status:'confirmed'})
  const [bookingSaving,setBookingSaving]=useState(false)
  const [bookingDone,setBookingDone]=useState(false)
  const dayAppts=allAppts.filter(a=>a.scheduled_at?.startsWith(dayStr))
  const blocked=blockedDates.find(b=>b.blocked_date===dayStr)
  const label=new Date(dayStr+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',day:'numeric',month:'long'})
  const todayStr=new Date().toISOString().split('T')[0]
  const isPast=dayStr<todayStr,isToday=dayStr===todayStr
  const dayRevenue=dayAppts.filter(a=>a.status==='confirmed').reduce((s,a)=>s+Number(a.amount||0),0)
  useEffect(()=>{
    if(!workspace?.id){setNoteLoading(false);return}
    setNoteLoading(true)
    supabase.from('day_notes').select('note_text').eq('workspace_id',workspace.id).eq('note_date',dayStr).maybeSingle()
      .then(({data})=>{if(data?.note_text)setNote(data.note_text);setNoteLoading(false)})
  },[dayStr,workspace?.id])
  useEffect(()=>{
    if(mode!=='booking'||!workspace?.id) return
    supabase.from('services').select('id,name,price,duration_min').eq('workspace_id',workspace.id).eq('is_active',true).then(({data})=>setServices(data||[]))
    supabase.from('availability').select('day_of_week,is_open,open_time,close_time').eq('workspace_id',workspace.id).then(({data})=>setAvailability(data||[]))
  },[mode,workspace?.id])
  async function saveNote(){
    if(!workspace?.id) return;setNoteSaving(true);setNoteSaved(false)
    await supabase.from('day_notes').upsert({workspace_id:workspace.id,note_date:dayStr,note_text:note,updated_at:new Date().toISOString()},{onConflict:'workspace_id,note_date'})
    setNoteSaving(false);setNoteSaved(true);setTimeout(()=>setNoteSaved(false),2500)
  }
  function handleServiceChange(id){
    const svc=services.find(s=>s.id===id)
    setBookingForm(f=>({...f,service_id:id,amount:svc?.price!=null?String(svc.price):f.amount}))
  }
  async function saveBooking(){
    if(!bookingForm.client_name.trim()||!bookingForm.time) return
    const dayOfWeek=new Date(dayStr+'T12:00:00').getDay()
    const dayAvail=availability.find(a=>a.day_of_week===dayOfWeek)
    if(!dayAvail||!dayAvail.is_open){toast('This day is closed — check your availability settings');return}
    const[selH,selM]=bookingForm.time.split(':').map(Number)
    const selMin=selH*60+selM
    const[openH,openM]=dayAvail.open_time.split(':').map(Number)
    const[closeH,closeM]=dayAvail.close_time.split(':').map(Number)
    const openMin=openH*60+openM,closeMin=closeH*60+closeM
    if(selMin<openMin||selMin>=closeMin){toast(`Outside business hours — open ${dayAvail.open_time.slice(0,5)} to ${dayAvail.close_time.slice(0,5)}`);return}
    setBookingSaving(true)
    const [h,m]=bookingForm.time.split(':')
    const dt=new Date(dayStr+'T00:00:00');dt.setHours(parseInt(h),parseInt(m),0,0)
    const selectedSvc=services.find(s=>s.id===bookingForm.service_id)
    const{error}=await createAppointment({
      workspace_id:workspace.id,client_name:bookingForm.client_name.trim(),
      client_phone:bookingForm.client_phone.trim()||null,client_email:bookingForm.client_email.trim()||null,
      service_id:bookingForm.service_id||null,service_name:selectedSvc?.name||null,
      duration_min:selectedSvc?.duration_min||60,
      scheduled_at:dt.toISOString(),amount:parseFloat(bookingForm.amount)||0,status:bookingForm.status,
    })
    setBookingSaving(false)
    if(error){toast('Could not save booking — '+error.message);return}
    setBookingDone(true)
    setTimeout(()=>{setBookingDone(false);setMode('main');setBookingForm({client_name:'',client_phone:'',client_email:'',service_id:'',time:'09:00',amount:'',status:'confirmed'});if(onBooked)onBooked()},1400)
  }
  const iS={width:'100%',padding:'.55rem .75rem',border:'1px solid var(--border-2)',borderRadius:8,fontSize:'.82rem',fontFamily:'inherit',color:'var(--ink)',background:'var(--surface)',outline:'none',transition:'border .15s'}
  const lS={display:'block',fontSize:'.72rem',fontWeight:600,color:'var(--ink-3)',marginBottom:'.3rem',textTransform:'uppercase',letterSpacing:'.05em'}
  return (
    <div className="rev-overlay" onClick={onClose}>
      <div className="rev-panel" style={{maxHeight:'92vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
        <div className="rev-panel-head">
          <div style={{display:'flex',alignItems:'center',gap:'.65rem'}}>
            {mode==='booking'&&(
              <button onClick={()=>setMode('main')} style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:8,width:30,height:30,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--ink-3)'}}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" width="12" height="12"><path d="M10 3L5 8l5 5"/></svg>
              </button>
            )}
            <div>
              <div className="rev-panel-title" style={{fontSize:'1.15rem',textTransform:'capitalize'}}>
                {mode==='booking'?t(lang,'new_booking'):label}
              </div>
              {mode==='main'&&isPast&&(
                <div style={{fontSize:'.72rem',color:'var(--ink-3)',marginTop:3,display:'flex',alignItems:'center',gap:'.3rem'}}>
                  <span>📅</span>{t(lang,'past_day')}{dayRevenue>0&&<span style={{color:'var(--green)',fontWeight:600,marginLeft:4}}>· {fmtRev(dayRevenue)} earned</span>}
                </div>
              )}
              {mode==='main'&&isToday&&<div style={{fontSize:'.72rem',color:'var(--gold)',fontWeight:600,marginTop:3}}>Today</div>}
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'.5rem'}}>
            {mode==='main'&&!isPast&&!blocked&&(
              <button className="btn btn-xs btn-primary" onClick={()=>setMode('booking')} style={{whiteSpace:'nowrap'}}>{t(lang,'add_booking')}</button>
            )}
            <button className="rev-close" onClick={onClose}>&#10005;</button>
          </div>
        </div>
        {mode==='booking'&&(
          <div style={{paddingTop:'.5rem'}}>
            <div style={{fontSize:'.68rem',fontWeight:700,color:'var(--gold)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:'1rem'}}>{label}</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.65rem',marginBottom:'.65rem'}}>
              <div><label style={lS}>{t(lang,'booking_client')} *</label>
                <input style={iS} value={bookingForm.client_name} onChange={e=>setBookingForm(f=>({...f,client_name:e.target.value}))} placeholder="Amara Diallo"
                  onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/></div>
              <div><label style={lS}>{t(lang,'booking_time')} *</label>
                <input type="time" style={iS} value={bookingForm.time} onChange={e=>setBookingForm(f=>({...f,time:e.target.value}))}
                  onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.65rem',marginBottom:'.65rem'}}>
              <div><label style={lS}>{t(lang,'booking_service')}</label>
                <select style={{...iS,cursor:'pointer'}} value={bookingForm.service_id} onChange={e=>handleServiceChange(e.target.value)}
                  onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}>
                  <option value="">{t(lang,'booking_no_service')}</option>
                  {services.map(s=>(<option key={s.id} value={s.id}>{s.name}{s.price>0?` — $${s.price}`:' — Free'}</option>))}
                </select></div>
              <div><label style={lS}>{t(lang,'booking_amount')} ($)</label>
                <input type="number" min="0" step="0.01" style={iS} value={bookingForm.amount} onChange={e=>setBookingForm(f=>({...f,amount:e.target.value}))} placeholder="0"
                  onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.65rem',marginBottom:'.65rem'}}>
              <div><label style={lS}>{t(lang,'booking_phone')}</label>
                <input type="tel" style={iS} value={bookingForm.client_phone} onChange={e=>setBookingForm(f=>({...f,client_phone:e.target.value}))} placeholder="+1 (514) …"
                  onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/></div>
              <div><label style={lS}>{t(lang,'booking_email')}</label>
                <input type="email" style={iS} value={bookingForm.client_email} onChange={e=>setBookingForm(f=>({...f,client_email:e.target.value}))} placeholder="client@email.com"
                  onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/></div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'.65rem',marginTop:'.5rem'}}>
              <div style={{display:'flex',background:'var(--surface)',border:'1px solid var(--border-2)',borderRadius:8,overflow:'hidden',flexShrink:0}}>
                {['confirmed','pending'].map(s=>(
                  <button key={s} onClick={()=>setBookingForm(f=>({...f,status:s}))}
                    style={{padding:'.4rem .85rem',border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:'.75rem',fontWeight:500,transition:'all .15s',
                      background:bookingForm.status===s?(s==='confirmed'?'var(--ink)':'#854d0e'):'transparent',
                      color:bookingForm.status===s?'#fff':'var(--ink-3)'}}>
                    {s==='confirmed'?t(lang,'booking_confirmed'):t(lang,'booking_pending')}
                  </button>
                ))}
              </div>
              <button className="btn btn-primary" style={{flex:1,justifyContent:'center',padding:'.55rem',background:bookingDone?'var(--green)':undefined}}
                onClick={saveBooking} disabled={bookingSaving||bookingDone||!bookingForm.client_name.trim()}>
                {bookingDone?'✓ '+t(lang,'booking_saved'):bookingSaving?t(lang,'booking_saving'):t(lang,'booking_save')}
              </button>
            </div>
          </div>
        )}
        {mode==='main'&&(
          <>
            {dayAppts.length>0?(
              <div style={{marginBottom:'1.25rem'}}>
                <div style={{fontSize:'.7rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:'.6rem'}}>{isPast?'What happened that day':'Appointments this day'}</div>
                {dayAppts.map(a=>(
                  <div key={a.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'.75rem 1rem',background:'var(--bg)',borderRadius:10,marginBottom:'.5rem'}}>
                    <div>
                      <div style={{fontWeight:600,fontSize:'.88rem',color:'var(--ink)'}}>{a.client_name}</div>
                      <div style={{fontSize:'.75rem',color:'var(--ink-3)',marginTop:2}}>{new Date(a.scheduled_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} · {svcName(a)}</div>
                    </div>
                    <div style={{display:'flex',gap:'.4rem',alignItems:'center'}}>
                      <span className={`badge badge-${a.status}`}>{a.status}</span>
                      {!isPast&&a.client_email&&(<a className="btn btn-secondary btn-xs" href={`mailto:${a.client_email}`} style={{textDecoration:'none'}}>Message</a>)}
                    </div>
                  </div>
                ))}
                {!isPast&&dayAppts.filter(a=>a.status!=='cancelled').length>0&&!blocked&&(
                  <div style={{fontSize:'.76rem',color:'var(--ink-3)',padding:'.6rem .8rem',background:'var(--bg)',borderRadius:8,marginTop:'.4rem'}}>
                    This day has bookings. Blocking it will not cancel them — message each client first.
                  </div>
                )}
              </div>
            ):(
              <div style={{textAlign:'center',padding:'1rem 0',color:'var(--ink-3)',fontSize:'.85rem',marginBottom:'1rem'}}>
                {isPast?'No appointments were recorded for this day.':'No appointments on this day.'}
              </div>
            )}
            {!isPast&&(
              blocked?(
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(192,57,43,.06)',border:'1px solid rgba(192,57,43,.15)',borderRadius:10,padding:'1rem 1.1rem',marginBottom:'1rem'}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:'.85rem',color:'var(--red)'}}>Blocked</div>
                    {blocked.reason&&<div style={{fontSize:'.75rem',color:'var(--ink-3)',marginTop:2}}>{blocked.reason}</div>}
                  </div>
                  <button className="btn btn-secondary btn-xs" onClick={()=>onUnblock(blocked.id)}>Unblock</button>
                </div>
              ):(
                <div style={{borderTop:'1px solid var(--border)',paddingTop:'1rem',marginBottom:'1rem'}}>
                  <div style={{fontSize:'.7rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:'.75rem'}}>{t(lang,'block_date')}</div>
                  <div className="field" style={{marginBottom:'.75rem'}}>
                    <label>{t(lang,'reason')}</label>
                    <input value={reason} onChange={e=>setReason(e.target.value)} placeholder="Vacation, personal, training..."/>
                  </div>
                  <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:'.75rem'}} onClick={()=>{onBlock(dayStr,reason);setReason('')}}>{t(lang,'block_btn')}</button>
                </div>
              )
            )}
            <div style={{borderTop:'1px solid var(--border)',paddingTop:'1rem'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'.5rem'}}>
                <div style={{fontSize:'.7rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.08em'}}>📝 {t(lang,'note_title')}</div>
                {noteSaved&&<span style={{fontSize:'.72rem',color:'var(--green)',fontWeight:600}}>{t(lang,'note_saved')}</span>}
              </div>
              {noteLoading?<div style={{fontSize:'.78rem',color:'var(--ink-3)',padding:'.4rem 0'}}>Loading...</div>:(
                <>
                  <textarea value={note} onChange={e=>{setNote(e.target.value);setNoteSaved(false)}} placeholder={t(lang,'note_placeholder')} rows={2}
                    style={{width:'100%',padding:'.55rem .75rem',border:'1px solid var(--border-2)',borderRadius:8,fontSize:'.82rem',fontFamily:'inherit',color:'var(--ink)',background:'var(--bg)',resize:'vertical',outline:'none',lineHeight:1.5,transition:'border .15s'}}
                    onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
                  <button className="btn btn-secondary btn-sm" style={{marginTop:'.5rem',width:'100%',justifyContent:'center'}} onClick={saveNote} disabled={noteSaving}>{noteSaving?'Saving…':t(lang,'save_note')}</button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── INTERACTIVE CALENDAR ──────────────────────────────────────────────────────
function InteractiveCal({ allAppts, blockedDates, onDayClick }) {
  const now=new Date()
  const [viewYear,setViewYear]=useState(now.getFullYear())
  const [viewMonth,setViewMonth]=useState(now.getMonth())
  const firstDOW=new Date(viewYear,viewMonth,1).getDay()
  const daysInMonth=new Date(viewYear,viewMonth+1,0).getDate()
  const monthLabel=new Date(viewYear,viewMonth,1).toLocaleDateString('en-US',{month:'long',year:'numeric'})
  const todayD=now.getDate(),todayM=now.getMonth(),todayY=now.getFullYear()
  const apptDays=new Set(allAppts.filter(a=>a.status!=='cancelled').map(a=>{
    if(!a.scheduled_at) return null
    const d=new Date(a.scheduled_at)
    if(d.getFullYear()===viewYear&&d.getMonth()===viewMonth) return d.getDate()
    return null
  }).filter(Boolean))
  const blockedSet=new Set(blockedDates.map(b=>{
    if(!b.blocked_date) return null
    const [y,m,d]=b.blocked_date.split('-').map(Number)
    if(y===viewYear&&m-1===viewMonth) return d
    return null
  }).filter(Boolean))
  const cells=[];for(let i=0;i<firstDOW;i++) cells.push(null);for(let d=1;d<=daysInMonth;d++) cells.push(d)
  function prevM(){if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1)}else setViewMonth(m=>m-1)}
  function nextM(){if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1)}else setViewMonth(m=>m+1)}
  function dayStr(d){return`${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`}
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'.65rem'}}>
        <button className="cal-nav-btn" onClick={prevM}>&#8249;</button>
        <span style={{fontSize:'.84rem',fontWeight:600,color:'var(--ink)'}}>{monthLabel}</span>
        <button className="cal-nav-btn" onClick={nextM}>&#8250;</button>
      </div>
      <div className="cal-grid">
        {['S','M','T','W','T','F','S'].map((d,i)=><div key={i} className="cal-dname">{d}</div>)}
        {cells.map((d,i)=>{
          const isToday=d&&d===todayD&&viewMonth===todayM&&viewYear===todayY
          const hasAppt=d&&apptDays.has(d),isBlocked=d&&blockedSet.has(d)
          return (
            <div key={i}
              className={`cal-d${!d?' cal-empty':''}${isToday?' today':''}${isBlocked?' cal-blocked':''}${hasAppt&&!isBlocked?' cal-has-appt':''}`}
              style={d?{cursor:'pointer',position:'relative'}:{}} onClick={()=>d&&onDayClick(dayStr(d))}>
              {d||''}
              {hasAppt&&!isBlocked&&<span className="cal-dot cal-dot-appt"/>}
              {isBlocked&&<span className="cal-dot cal-dot-blocked"/>}
            </div>
          )
        })}
      </div>
      <div style={{display:'flex',gap:'1rem',marginTop:'.75rem',fontSize:'.7rem',color:'var(--ink-3)'}}>
        <span style={{display:'flex',alignItems:'center',gap:'.3rem'}}><span style={{width:6,height:6,borderRadius:'50%',background:'var(--gold)',display:'inline-block'}}/> Appointment</span>
        <span style={{display:'flex',alignItems:'center',gap:'.3rem'}}><span style={{width:6,height:6,borderRadius:'50%',background:'var(--red)',display:'inline-block'}}/> Blocked</span>
      </div>
    </div>
  )
}

// ── OVERVIEW ──────────────────────────────────────────────────────────────────
export default function OverviewSection({ workspace, session, ownerData, toast, setPage, refetchWorkspace, lang='en' }) {
  const [appts,setAppts]=useState([])
  const [allAppts,setAllAppts]=useState([])
  const [blockedDates,setBlockedDates]=useState([])
  const [selectedDay,setSelectedDay]=useState(null)
  const [stats,setStats]=useState({revenue:0,appointments:0,monthAppts:0,pending:0,confirmed:0,cancelled:0,products:0,students:0})
  const [showRevenue,setShowRevenue]=useState(false)
  const [reminderBannerDismissed, setReminderBannerDismissed] = useState(false)
  const [remindersSent,setRemindersSent]=useState([])
  useEffect(()=>{
    if(!workspace) return
    const cacheKey=`org_cache_${workspace.id}`
    const cached=localStorage.getItem(cacheKey)
    if(cached){
      try{
        const{appts:ca,blocked:cb,stats:cs,today:ct}=JSON.parse(cached)
        if(ca) setAllAppts(ca)
        if(cb) setBlockedDates(cb)
        if(cs) setStats(cs)
        if(ct) setAppts(ct)
      }catch(_){}
    }
    fetchData()
    const ch=supabase.channel('ov-rt').on('postgres_changes',{event:'*',schema:'public',table:'appointments',filter:`workspace_id=eq.${workspace.id}`},fetchData).subscribe()
    const poll=setInterval(fetchData, 8000)
    return()=>{ supabase.removeChannel(ch); clearInterval(poll) }
  },[workspace])
  async function fetchData(){
    const today=new Date().toISOString().split('T')[0],now=new Date()
    const[a,p,e,b]=await Promise.all([
      supabase.from('appointments').select('*, services(name)').eq('workspace_id',workspace.id),
      supabase.from('products').select('id').eq('workspace_id',workspace.id),
      supabase.from('enrollments').select('id').eq('workspace_id',workspace.id),
      supabase.from('blocked_dates').select('*').eq('workspace_id',workspace.id),
    ])
    const ad=a.data||[]
    const bd=b.data||[]
    const pd=p.data||[]
    const ed=e.data||[]
    setAllAppts(ad);setBlockedDates(bd)
    const monthNow=now.getMonth(),yearNow=now.getFullYear()
    const monthApptsCount=ad.filter(x=>{const d=new Date(x.scheduled_at);return d.getFullYear()===yearNow&&d.getMonth()===monthNow}).length
    const newStats={
      revenue:ad.reduce((s,x)=>s+Number(x.amount||0),0),
      appointments:ad.length,
      monthAppts:monthApptsCount,
      pending:ad.filter(x=>x.status==='pending').length,
      confirmed:ad.filter(x=>x.status==='confirmed'&&new Date(x.scheduled_at).getMonth()===monthNow).length,
      cancelled:ad.filter(x=>x.status==='cancelled'&&new Date(x.scheduled_at).getMonth()===monthNow).length,
      products:pd.length,
      students:ed.length
    }
    const todayAppts=ad.filter(x=>x.scheduled_at?.startsWith(today)).sort((a,b)=>new Date(a.scheduled_at)-new Date(b.scheduled_at))
    setStats(newStats)
    setAppts(todayAppts)
    const todayStart=new Date();todayStart.setHours(0,0,0,0)
    setRemindersSent(ad.filter(x=>x.reminder_sent_at&&new Date(x.reminder_sent_at)>=todayStart).map(x=>({name:x.client_name,time:new Date(x.reminder_sent_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})})))
    try{
      localStorage.setItem(`org_cache_${workspace.id}`,JSON.stringify({appts:ad,blocked:bd,stats:newStats,today:todayAppts,ts:Date.now()}))
    }catch(_){}
  }
  async function handleBlock(dayStr,reason){
    const affected=allAppts.filter(a=>a.scheduled_at?.startsWith(dayStr)&&a.status!=='cancelled'&&a.client_email)
    await supabase.from('blocked_dates').insert({workspace_id:workspace.id,blocked_date:dayStr,reason})
    if(affected.length>0){
      try{
        await supabase.functions.invoke('send-cancellation-notice',{body:{appointments:affected.map(a=>({client_name:a.client_name,client_email:a.client_email,scheduled_at:a.scheduled_at})),reason,workspace_name:workspace.name||'Your stylist',owner_email:workspace.email||null}})
        toast(`Date blocked · ${affected.length} client${affected.length>1?'s':''} notified automatically ✓`)
      }catch(_){toast('Date blocked. (Configure edge fn to auto-notify clients)')}
    }else{toast('Date blocked.')}
    setSelectedDay(null);fetchData()
  }
  async function handleUnblock(id){await supabase.from('blocked_dates').delete().eq('id',id);toast('Date unblocked.');setSelectedDay(null);fetchData()}
  const todayCount=appts.length
  const mRev=monthRevenue(allAppts,0),lastMRev=monthRevenue(allAppts,-1),mDelta=pct(mRev,lastMRev)
  const curMonthName = new Date().toLocaleDateString(lang==='fr'?'fr-FR':lang==='es'?'es-ES':'en-US',{month:'long'})
  const cards=[
    {label:(lang==='fr'?'Revenus — ':lang==='es'?'Ingresos — ':'Revenue — ')+curMonthName,value:fmtRev(mRev),
      delta:mDelta!==null?`${mDelta>=0?'↑':'↓'} ${Math.abs(mDelta)}% vs ${lang==='fr'?'mois dernier':lang==='es'?'mes pasado':'last month'}`:'—',up:mDelta===null||mDelta>=0,page:'revenue'},
    {label:t(lang,'appts_title'),value:stats.monthAppts,
      delta:stats.pending>0?`${stats.pending} ${lang==='fr'?'en attente':lang==='es'?'pendientes':'pending'}`:
            stats.cancelled>0?`${stats.cancelled} ${lang==='fr'?'annulé(s)':lang==='es'?'cancelados':'cancelled'}`:
            stats.confirmed>0?`${stats.confirmed} ${lang==='fr'?'confirmé(s)':lang==='es'?'confirmados':'confirmed'}`:'—',
      up:stats.pending===0,isCancelled:stats.pending===0&&stats.cancelled>0,page:'appointments'},
    {label:lang==='fr'?'Produits':lang==='es'?'Productos':'Products',value:stats.products,delta:lang==='fr'?'Listés dans votre boutique':lang==='es'?'Listados en tu tienda':'Listed in your shop',up:true,page:'products'},
    {label:lang==='fr'?'Élèves':lang==='es'?'Estudiantes':'Students',value:stats.students,delta:lang==='fr'?'Total des inscriptions':lang==='es'?'Total de matrículas':'Total enrollments',up:true,page:'formations'},
  ]
  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">{(()=>{const h=new Date().getHours();return h<12?t(lang,'morning'):h<17?t(lang,'afternoon'):t(lang,'evening')})()}, {ownerData?.full_name?.trim().split(' ')[0]||firstName(workspace,session)}</div>
          <div className="page-sub">
            {new Date().toLocaleDateString(lang==='fr'?'fr-FR':lang==='es'?'es-ES':'en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}
            {todayCount>0&&<span style={{color:'var(--gold)',fontWeight:500}}> — {todayCount} {lang==='fr'?`rendez-vous${todayCount>1?'s':''} aujourd'hui`:lang==='es'?`cita${todayCount>1?'s':''} hoy`:`appointment${todayCount>1?'s':''} today`}</span>}
          </div>
        </div>
        <div className="head-actions">
          <button className="btn btn-secondary btn-sm" onClick={()=>{
            const url=workspace?.slug?`${window.location.origin}/book/${workspace.slug}`:''
            if(url){navigator.clipboard?.writeText(url);toast(t(lang,'link_copied'))}
          }}>
            <span style={{width:14,height:14,display:'flex'}}>{I.link}</span>
            {t(lang,'copy_link')}
          </button>
          {workspace?.slug&&(
            <button className="btn btn-primary btn-sm" onClick={()=>window.open(`${window.location.origin}/book/${workspace.slug}`,'_blank')}>
              {lang==='fr'?'Voir ma page':lang==='es'?'Ver mi página':'View page'} →
            </button>
          )}
        </div>
      </div>
      <NextUpBanner appts={allAppts} workspace={workspace} onReloaded={fetchData} toast={toast} lang={lang}/>
      {remindersSent.length>0&&!reminderBannerDismissed&&(
        <div style={{background:'var(--ink)',borderRadius:10,padding:'.65rem 1.1rem',marginBottom:'1rem',display:'flex',alignItems:'center',gap:'.75rem',animation:'milestoneIn .35s ease'}}>
          <span style={{fontSize:'.9rem'}}>💬</span>
          <div style={{flex:1}}>
            <span style={{fontSize:'.75rem',color:'rgba(255,255,255,.5)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.06em'}}>{lang==='fr'?'Rappels envoyés aujourd’hui':lang==='es'?'Recordatorios enviados hoy':'Reminders sent today'}</span>
            <div style={{display:'flex',flexWrap:'wrap',gap:'.35rem',marginTop:'.3rem'}}>
              {remindersSent.map((r,i)=>(<span key={i} style={{background:'rgba(181,137,58,.2)',border:'1px solid rgba(181,137,58,.3)',borderRadius:20,padding:'2px 10px',fontSize:'.72rem',color:'var(--gold)',fontWeight:500}}>✓ {r.name} · {r.time}</span>))}
            </div>
          </div>
          <button onClick={()=>setReminderBannerDismissed(true)} style={{flexShrink:0,padding:'4px 14px',borderRadius:20,background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.15)',color:'rgba(255,255,255,.7)',fontSize:'.72rem',fontWeight:600,cursor:'pointer'}}>OK</button>
        </div>
      )}
      <CoachSlider appts={allAppts} stats={stats} workspace={workspace} session={session} lang={lang}/>
      <div className="stats-scroll">
        {cards.map((s,i)=>(
          <button key={i} className="stat-card stat-card-btn" onClick={()=>s.page==='revenue'?setShowRevenue(true):setPage(s.page)}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className={`stat-delta ${s.isCancelled?'delta-down':s.up?'delta-up':'delta-down'}`}>{s.delta}</div>
            <div className="stat-arrow">&#8594;</div>
          </button>
        ))}
      </div>
      <div className="grid-2" style={{marginBottom:'1.25rem'}}>
        <div className="card" style={{marginBottom:0}}>
          <div className="card-head"><div className="card-title">{t(lang,'revenue_week')}</div></div>
          <div className="card-body"><WeekChart appts={allAppts}/></div>
        </div>
        <MonthlyGoal appts={allAppts} workspace={workspace} refetchWorkspace={refetchWorkspace} lang={lang}/>
      </div>
      <div className="grid-2" style={{marginBottom:'1.25rem'}}>
        <TopServiceInsight appts={allAppts}/>
        <div className="card" style={{marginBottom:0}}>
          <div className="card-head">
            <div className="card-title" style={{cursor:'pointer'}} onClick={()=>setPage('availability')}>{t(lang,'calendar')}</div>
            <span style={{fontSize:'.72rem',color:'var(--ink-3)'}}>{t(lang,'tap_date')}</span>
          </div>
          <div className="card-body"><InteractiveCal allAppts={allAppts} blockedDates={blockedDates} onDayClick={setSelectedDay}/></div>
        </div>
      </div>
      <div className="card">
        <div className="card-head">
          <div className="card-title">{t(lang,'today_schedule')}</div>
          <span className="badge badge-confirmed">{todayCount} {t(lang,'confirmed')}</span>
        </div>
        {todayCount===0?(
          <div className="empty-state">
            <div className="empty-icon">{I.cal}</div>
            <div className="empty-title">{t(lang,'day_open')}</div>
            <div className="empty-sub">{t(lang,'share_link')}</div>
            <button className="btn btn-primary btn-sm" style={{marginTop:'.75rem'}} onClick={()=>{navigator.clipboard?.writeText(`${window.location.origin}/book/${workspace?.slug||''}`);toast(t(lang,'link_copied'))}}>{t(lang,'copy_booking_link')}</button>
          </div>
        ):(
          <div>
            {appts.map(a=>(
              <div key={a.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'.85rem 1.25rem',borderBottom:'1px solid var(--border)',gap:'.75rem'}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:'.88rem',color:'var(--ink)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.client_name}</div>
                  <div style={{fontSize:'.72rem',color:'var(--ink-3)',marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{svcName(a)}</div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontSize:'.85rem',fontWeight:600,color:'var(--ink)'}}>{new Date(a.scheduled_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
                  <div style={{marginTop:3}}><span className={`badge badge-${a.status}`} style={{fontSize:'.65rem'}}>{a.status}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showRevenue&&<RevenuePanel appts={allAppts} onClose={()=>setShowRevenue(false)}/>}
      {selectedDay&&(<DayPanel dayStr={selectedDay} allAppts={allAppts} blockedDates={blockedDates} onClose={()=>setSelectedDay(null)} onBlock={handleBlock} onUnblock={handleUnblock} onBooked={fetchData} workspace={workspace} lang={lang}/>)}
    </div>
  )
}
