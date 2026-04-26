import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

const LANG = {
  en: {
    morning:'Good morning',afternoon:'Good afternoon',evening:'Good evening',
    nav_overview:'Overview',nav_appointments:'Appointments',nav_services:'Services',
    nav_products:'Products',nav_formations:'Formations',nav_clients:'Clients',
    nav_availability:'Availability',nav_settings:'Settings',nav_signout:'Sign out',
    nav_portfolio:'Portfolio',nav_reviews:'Reviews',
    copy_link:'Copy link',link_copied:'Booking link copied!',
    today_schedule:"Today's schedule",confirmed:'confirmed',
    revenue_week:'Revenue — this week',calendar:'Calendar',tap_date:'Tap a date to view or block',
    day_open:'Your day is open',share_link:'Share your booking link to fill your schedule.',
    copy_booking_link:'Copy booking link',
    appts_title:'Appointments',appts_sub:'Manage your bookings',
    services_title:'Services',services_sub:'What you offer — appears on your public profile',
    products_title:'Products',products_sub:'Sell from your profile page',
    formations_title:'Formations',formations_sub:'Sell courses and workshops',
    clients_title:'Clients',clients_sub:'Your client base',
    avail_title:'Availability',avail_sub:'Set your schedule and block dates',
    settings_title:'Settings',settings_sub:'Manage your account and preferences',
    profile:'My Profile',profile_sub:'Name, email address, password',
    business:'My Business',business_sub:'Business info, contact, social media',
    appearance:'Appearance',appearance_sub:'Theme and display preferences',
    language:'Language',language_sub:'English, Français, Español',
    save:'Save changes',saving:'Saving...',saved:'Saved',cancel:'Cancel',confirm:'Confirm',
    update_pw:'Update password',weekly_schedule:'Weekly schedule',
    personal_info:'Personal information',full_name:'Full name',email_addr:'Email address',
    new_password:'New password',biz_name:'Business name',tagline:'Tagline',bio:'Bio',
    location:'Location',contact:'Contact',biz_email:'Business email',phone:'Phone',social:'Social',
    publish:'Publish profile',unpublish:'Unpublish',display_lang:'Display language',
    theme:'Theme',dark_mode:'Dark mode',save_lang:'Save language',
    next_appt:'Next appointment',reschedule:'Reschedule',message:'Remind',
    open_sms:'Open SMS →',open_mail:'Open Mail →',close:'Close',
    pending_confirm:'Pending confirmation',waiting:'waiting',all_appts:'All appointments',
    add_service:'+ Add service',new_service:'New service',save_service:'Save service',
    add_product:'Add product',new_product:'New product',save_product:'Save product',
    create_formation:'Create formation',new_formation:'New formation',save_formation:'Save formation',
    no_appts:'No appointments yet',when_book:"When clients book, they'll appear here.",
    no_services:'No services yet',add_first_service:'Add your first service to start receiving bookings.',
    no_products:'No products yet',add_products:'Add products to sell on your profile.',
    no_formations:'No formations yet',create_first:'Create your first course or workshop.',
    no_clients:'No clients yet',clients_appear:'Clients appear here when they book with you.',
    goal_reached:'🎉 Goal reached!',remaining:'remaining',at_avg:'At your average rate,',
    more_appt:'more appointment',more_appts:'more appointments',will_get:'will get you there.',
    top_service:'Your top service',revenue_goal:'Revenue Goal',
    open:'Open',closed:'Closed',block_date:'Block date',reason:'Reason (optional)',
    block_btn:'Block this date',blocked:'Blocked dates',no_blocked:'No blocked dates.',unblock:'Unblock',
    note_title:'Day note',note_placeholder:'Add a note for this day…',
    save_note:'Save note',note_saved:'Saved ✓',past_day:'This day has passed.',
    add_booking:'+ Add booking',new_booking:'New booking',booking_client:'Client name',
    booking_phone:'Phone (optional)',booking_email:'Email (optional)',
    booking_service:'Service',booking_time:'Time',booking_amount:'Amount',
    booking_status:'Status',booking_save:'Save booking',booking_saving:'Saving…',
    booking_saved:'Booking added!',booking_confirmed:'Confirmed',booking_pending:'Pending',
    booking_no_service:'No service',
    cancel_sub:'Cancel subscription',keep_plan:'Keep my plan',confirm_cancel:'Yes, cancel',
  },
  fr: {
    morning:'Bonjour',afternoon:'Bonjour',evening:'Bonsoir',
    nav_overview:'Accueil',nav_appointments:'Rendez-vous',nav_services:'Services',
    nav_products:'Produits',nav_formations:'Formations',nav_clients:'Clients',
    nav_availability:'Disponibilités',nav_settings:'Paramètres',nav_signout:'Déconnexion',
    nav_portfolio:'Portfolio',nav_reviews:'Avis',
    copy_link:'Copier le lien',link_copied:'Lien copié !',
    today_schedule:'Planning du jour',confirmed:'confirmé',
    revenue_week:'Revenus — cette semaine',calendar:'Calendrier',tap_date:'Appuyer sur une date pour voir ou bloquer',
    day_open:'La journée est libre',share_link:'Partage ton lien pour remplir ton agenda.',
    copy_booking_link:'Copier le lien de réservation',
    appts_title:'Rendez-vous',appts_sub:'Gérez vos réservations',
    services_title:'Services',services_sub:'Ce que vous proposez — visible sur votre profil',
    products_title:'Produits',products_sub:'Vendez depuis votre profil',
    formations_title:'Formations',formations_sub:'Vendez des cours et ateliers',
    clients_title:'Clients',clients_sub:'Votre clientèle',
    avail_title:'Disponibilités',avail_sub:'Définissez votre agenda et bloquez des dates',
    settings_title:'Paramètres',settings_sub:'Gérer votre compte et préférences',
    profile:'Mon Profil',profile_sub:'Nom, email, mot de passe',
    business:'Mon Entreprise',business_sub:'Infos, contact, réseaux sociaux',
    appearance:'Apparence',appearance_sub:"Thème et préférences d'affichage",
    language:'Langue',language_sub:'English, Français, Español',
    save:'Enregistrer',saving:'Enregistrement...',saved:'Enregistré',cancel:'Annuler',confirm:'Confirmer',
    update_pw:'Mettre à jour le mot de passe',weekly_schedule:'Horaires hebdomadaires',
    personal_info:'Informations personnelles',full_name:'Nom complet',email_addr:'Adresse email',
    new_password:'Nouveau mot de passe',biz_name:"Nom de l'entreprise",tagline:'Accroche',bio:'Bio',
    location:'Lieu',contact:'Contact',biz_email:'Email professionnel',phone:'Téléphone',social:'Réseaux sociaux',
    publish:'Publier le profil',unpublish:'Dépublier',display_lang:"Langue d'affichage",
    theme:'Thème',dark_mode:'Mode sombre',save_lang:'Enregistrer la langue',
    next_appt:'Prochain rendez-vous',reschedule:'Reprogrammer',message:'Rappeler',
    open_sms:'Ouvrir SMS →',open_mail:'Ouvrir Mail →',close:'Fermer',
    pending_confirm:'En attente de confirmation',waiting:'en attente',all_appts:'Tous les rendez-vous',
    add_service:'+ Ajouter un service',new_service:'Nouveau service',save_service:'Sauvegarder le service',
    add_product:'Ajouter un produit',new_product:'Nouveau produit',save_product:'Sauvegarder le produit',
    create_formation:'Créer une formation',new_formation:'Nouvelle formation',save_formation:'Sauvegarder',
    no_appts:'Aucun rendez-vous',when_book:'Les rendez-vous apparaissent ici.',
    no_services:'Aucun service',add_first_service:'Ajoutez votre premier service pour recevoir des réservations.',
    no_products:'Aucun produit',add_products:'Ajoutez des produits à vendre sur votre profil.',
    no_formations:'Aucune formation',create_first:'Créez votre premier cours ou atelier.',
    no_clients:'Aucun client',clients_appear:'Les clients apparaissent ici quand ils réservent.',
    goal_reached:'🎉 Objectif atteint !',remaining:'restant',at_avg:'À votre rythme,',
    more_appt:'rendez-vous de plus',more_appts:'rendez-vous de plus',will_get:'vous y amèneront.',
    top_service:'Votre service phare',revenue_goal:'Objectif de revenus',
    open:'Ouvert',closed:'Fermé',block_date:'Bloquer une date',reason:'Raison (optionnel)',
    block_btn:'Bloquer cette date',blocked:'Dates bloquées',no_blocked:'Aucune date bloquée.',unblock:'Débloquer',
    note_title:'Note du jour',note_placeholder:'Ajouter une note pour ce jour…',
    save_note:'Sauvegarder',note_saved:'Enregistré ✓',past_day:'Cette journée est passée.',
    add_booking:'+ Ajouter un RDV',new_booking:'Nouveau rendez-vous',booking_client:'Nom du client',
    booking_phone:'Téléphone (optionnel)',booking_email:'Email (optionnel)',
    booking_service:'Service',booking_time:'Heure',booking_amount:'Montant',
    booking_status:'Statut',booking_save:'Enregistrer le RDV',booking_saving:'Enregistrement…',
    booking_saved:'RDV ajouté !',booking_confirmed:'Confirmé',booking_pending:'En attente',
    booking_no_service:'Sans service',
    cancel_sub:'Terminer mon abonnement',keep_plan:'Conserver mon plan',confirm_cancel:'Oui, annuler',
  },
  es: {
    morning:'Buenos días',afternoon:'Buenas tardes',evening:'Buenas noches',
    nav_overview:'Inicio',nav_appointments:'Citas',nav_services:'Servicios',
    nav_products:'Productos',nav_formations:'Formaciones',nav_clients:'Clientes',
    nav_availability:'Disponibilidad',nav_settings:'Configuración',nav_signout:'Cerrar sesión',
    nav_portfolio:'Portfolio',nav_reviews:'Reseñas',
    copy_link:'Copiar enlace',link_copied:'¡Enlace copiado!',
    today_schedule:'Agenda de hoy',confirmed:'confirmada',
    revenue_week:'Ingresos — esta semana',calendar:'Calendario',tap_date:'Toca una fecha para ver o bloquear',
    day_open:'El día está libre',share_link:'Comparte tu enlace para llenar tu agenda.',
    copy_booking_link:'Copiar enlace de reserva',
    appts_title:'Citas',appts_sub:'Gestiona tus reservas',
    services_title:'Servicios',services_sub:'Lo que ofreces — visible en tu perfil',
    products_title:'Productos',products_sub:'Vende desde tu perfil',
    formations_title:'Formaciones',formations_sub:'Vende cursos y talleres',
    clients_title:'Clientes',clients_sub:'Tu base de clientes',
    avail_title:'Disponibilidad',avail_sub:'Define tu horario y bloquea fechas',
    settings_title:'Configuración',settings_sub:'Gestiona tu cuenta y preferencias',
    profile:'Mi Perfil',profile_sub:'Nombre, correo, contraseña',
    business:'Mi Negocio',business_sub:'Información, contacto, redes sociales',
    appearance:'Apariencia',appearance_sub:'Tema y preferencias de visualización',
    language:'Idioma',language_sub:'English, Français, Español',
    save:'Guardar cambios',saving:'Guardando...',saved:'Guardado',cancel:'Cancelar',confirm:'Confirmar',
    update_pw:'Actualizar contraseña',weekly_schedule:'Horario semanal',
    personal_info:'Información personal',full_name:'Nombre completo',email_addr:'Correo electrónico',
    new_password:'Nueva contraseña',biz_name:'Nombre del negocio',tagline:'Eslogan',bio:'Bio',
    location:'Ubicación',contact:'Contacto',biz_email:'Correo del negocio',phone:'Teléfono',social:'Redes sociales',
    publish:'Publicar perfil',unpublish:'Despublicar',display_lang:'Idioma de visualización',
    theme:'Tema',dark_mode:'Modo oscuro',save_lang:'Guardar idioma',
    next_appt:'Próxima cita',reschedule:'Reprogramar',message:'Recordar',
    open_sms:'Abrir SMS →',open_mail:'Abrir correo →',close:'Cerrar',
    pending_confirm:'Pendiente de confirmación',waiting:'pendiente',all_appts:'Todas las citas',
    add_service:'+ Agregar servicio',new_service:'Nuevo servicio',save_service:'Guardar servicio',
    add_product:'Agregar producto',new_product:'Nuevo producto',save_product:'Guardar producto',
    create_formation:'Crear formación',new_formation:'Nueva formación',save_formation:'Guardar',
    no_appts:'Sin citas aún',when_book:'Las citas aparecen aquí cuando los clientes reservan.',
    no_services:'Sin servicios aún',add_first_service:'Agrega tu primer servicio para recibir reservas.',
    no_products:'Sin productos aún',add_products:'Agrega productos para vender en tu perfil.',
    no_formations:'Sin formaciones aún',create_first:'Crea tu primer curso o taller.',
    no_clients:'Sin clientes aún',clients_appear:'Los clientes aparecen aquí cuando reservan.',
    goal_reached:'🎉 ¡Meta alcanzada!',remaining:'restante',at_avg:'A tu ritmo actual,',
    more_appt:'cita más',more_appts:'citas más',will_get:'te llevarán ahí.',
    top_service:'Tu servicio estrella',revenue_goal:'Meta de ingresos',
    open:'Abierto',closed:'Cerrado',block_date:'Bloquear fecha',reason:'Razón (opcional)',
    block_btn:'Bloquear esta fecha',blocked:'Fechas bloqueadas',no_blocked:'Sin fechas bloqueadas.',unblock:'Desbloquear',
    note_title:'Nota del día',note_placeholder:'Agrega una nota para este día…',
    save_note:'Guardar nota',note_saved:'Guardado ✓',past_day:'Este día ya pasó.',
    add_booking:'+ Agregar cita',new_booking:'Nueva cita',booking_client:'Nombre del cliente',
    booking_phone:'Teléfono (opcional)',booking_email:'Correo (opcional)',
    booking_service:'Servicio',booking_time:'Hora',booking_amount:'Monto',
    booking_status:'Estado',booking_save:'Guardar cita',booking_saving:'Guardando…',
    booking_saved:'¡Cita agregada!',booking_confirmed:'Confirmada',booking_pending:'Pendiente',
    booking_no_service:'Sin servicio',
    cancel_sub:'Cancelar suscripción',keep_plan:'Mantener mi plan',confirm_cancel:'Sí, cancelar',
  }
}
function t(lang,key){return(LANG[lang]||LANG.en)[key]||LANG.en[key]||key}

// ── UTILS ─────────────────────────────────────────────────────────────────────
const fmtRev  = n => `$${Number(n||0).toLocaleString()}`
const fmtFree = n => n===0 ? 'Free' : `$${Number(n||0).toLocaleString()}`

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

// FIX 1: exact date label — "aujourd'hui à 10h45" or "le 24 avril à 10h30"
function formatNextApptLabel(dateStr, lang='en') {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const todayStr = new Date().toISOString().split('T')[0]
  const apptStr  = d.toISOString().split('T')[0]
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

// FIX 4: scroll lock
function useScrollLock() {
  useEffect(()=>{
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return ()=>{ document.body.style.overflow = prev }
  },[])
}

// ── ICONS ─────────────────────────────────────────────────────────────────────
const I = {
  home:  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 6.5L8 2l6 4.5V14a1 1 0 01-1 1H3a1 1 0 01-1-1V6.5z"/><path d="M6 15V9h4v6"/></svg>,
  cal:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="14" height="12" rx="1.5"/><path d="M1 7h14M5 1v4M11 1v4"/></svg>,
  box:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 4.5l7-3 7 3v7l-7 3-7-3v-7z"/><path d="M8 1.5v14M1 4.5l7 3 7-3"/></svg>,
  grad:  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2L1 6l7 4 7-4-7-4z"/><path d="M3 8.5V12c0 1 2 2.5 5 2.5s5-1.5 5-2.5V8.5"/></svg>,
  users: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6" cy="5" r="2.5"/><path d="M1 13c0-2.5 2-4 5-4s5 1.5 5 4"/><circle cx="12" cy="5" r="2"/><path d="M14 13c0-1.5-1-3-3-3"/></svg>,
  gear:  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M3.1 12.9l1.4-1.4M11.5 4.5l1.4-1.4"/></svg>,
  bell:  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1a5 5 0 00-5 5v3.5L1.5 11h13L13 9.5V6a5 5 0 00-5-5zM6 11v.5a2 2 0 004 0V11"/></svg>,
  check: <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="1.5,5 4,7.5 8.5,2.5"/></svg>,
  star:  <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l1.8 4.5H15l-4.2 3 1.6 4.8L8 10.8l-4.4 2.5 1.6-4.8L1 6.5h5.2z"/></svg>,
  clock: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6.5"/><path d="M8 4.5V8l2.5 2"/></svg>,
  link:  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6.5 9.5a3.5 3.5 0 005 0l2-2a3.5 3.5 0 00-5-5l-1 1"/><path d="M9.5 6.5a3.5 3.5 0 00-5 0l-2 2a3.5 3.5 0 005 5l1-1"/></svg>,
  avail: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6.5"/><path d="M8 4v4l2.5 2.5"/></svg>,
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

// ── IMAGE EDITOR MODAL (FIX 9) ────────────────────────────────────────────────
function ImageEditorModal({ imageUrl, workspaceId, productName='', onSave, onClose, toast }) {
  useScrollLock()
  const canvasRef = useRef(null)
  const imgRef    = useRef(null)
  const [rotation, setRotation] = useState(0)
  const [flipH,    setFlipH]    = useState(false)
  const [loaded,   setLoaded]   = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [mode,     setMode]     = useState('adjust') // 'adjust' | 'crop'
  const [showEnhance, setShowEnhance] = useState(false)
  const [cropAspect, setCropAspect]   = useState(null)
  const [crop, setCrop] = useState({ x:0, y:0, w:1, h:1 })

  useEffect(()=>{
    fetch(imageUrl).then(r=>r.blob()).then(blob=>{
      const blobUrl = URL.createObjectURL(blob)
      const img = new Image()
      img.onload = () => { imgRef.current = img; setLoaded(true) }
      img.onerror = () => toast('Could not load image.')
      img.src = blobUrl
    }).catch(()=>toast('Could not load image.'))
  },[imageUrl])

  useEffect(()=>{ if(loaded) draw() },[loaded,rotation,flipH,crop,mode])

  function draw(){
    const canvas=canvasRef.current, img=imgRef.current
    if(!canvas||!img) return
    const rad     = (rotation*Math.PI)/180
    const swapped = rotation===90||rotation===270
    const srcW    = swapped ? img.height : img.width
    const srcH    = swapped ? img.width  : img.height
    canvas.width=srcW; canvas.height=srcH
    const ctx=canvas.getContext('2d')
    ctx.clearRect(0,0,srcW,srcH)
    ctx.save(); ctx.translate(srcW/2,srcH/2); ctx.rotate(rad)
    if(flipH) ctx.scale(-1,1)
    ctx.drawImage(img,-img.width/2,-img.height/2)
    ctx.restore()
    if(mode==='crop'){
      const cx=crop.x*srcW, cy=crop.y*srcH, cw=crop.w*srcW, ch=crop.h*srcH
      ctx.fillStyle='rgba(0,0,0,.55)'
      ctx.fillRect(0,0,srcW,cy); ctx.fillRect(0,cy+ch,srcW,srcH-(cy+ch))
      ctx.fillRect(0,cy,cx,ch); ctx.fillRect(cx+cw,cy,srcW-(cx+cw),ch)
      ctx.strokeStyle='rgba(197,169,106,.85)'; ctx.lineWidth=2
      ctx.strokeRect(cx,cy,cw,ch)
      const hs=14
      ;[[cx,cy],[cx+cw-hs,cy],[cx,cy+ch-hs],[cx+cw-hs,cy+ch-hs]].forEach(([hx,hy])=>{
        ctx.fillStyle='rgba(197,169,106,.95)'; ctx.fillRect(hx,hy,hs,hs)
      })
    }
  }

  function rotate(deg){ setRotation(r=>(r+deg+360)%360) }

  function applyAspect(a){
    setCropAspect(a)
    if(a===null){ setCrop({x:0,y:0,w:1,h:1}); return }
    const canvas=canvasRef.current; if(!canvas) return
    const cw=canvas.width, ch=canvas.height
    let rw=1, rh=1
    if(a===1){ const s=Math.min(cw,ch); rw=s/cw; rh=s/ch }
    else if(a===0.75){ rw=Math.min(1,ch*0.75/cw); rh=Math.min(1,cw/(ch*0.75)) }
    else if(a===1.333){ rh=Math.min(1,cw*0.75/ch); rw=Math.min(1,ch*1.333/cw) }
    setCrop({x:(1-rw)/2, y:(1-rh)/2, w:rw, h:rh})
  }

  async function save(){
    const canvas=canvasRef.current, img=imgRef.current
    if(!canvas||!img){ onSave(imageUrl); onClose(); return }
    setSaving(true)
    const rad     = (rotation*Math.PI)/180
    const swapped = rotation===90||rotation===270
    const srcW    = swapped ? img.height : img.width
    const srcH    = swapped ? img.width  : img.height
    // Build full rotated image in temp canvas
    const tmp=document.createElement('canvas'); tmp.width=srcW; tmp.height=srcH
    const tctx=tmp.getContext('2d')
    tctx.save(); tctx.translate(srcW/2,srcH/2); tctx.rotate(rad)
    if(flipH) tctx.scale(-1,1)
    tctx.drawImage(img,-img.width/2,-img.height/2); tctx.restore()
    // Apply crop
    const cx=Math.round(crop.x*srcW), cy=Math.round(crop.y*srcH)
    const cw=Math.max(1,Math.round(crop.w*srcW)), ch=Math.max(1,Math.round(crop.h*srcH))
    const final=document.createElement('canvas'); final.width=cw; final.height=ch
    final.getContext('2d').drawImage(tmp,cx,cy,cw,ch,0,0,cw,ch)
    final.toBlob(async blob=>{
      if(!blob){ onSave(imageUrl); onClose(); setSaving(false); return }
      const path=`${workspaceId}/edited-${Date.now()}.jpg`
      const{error}=await supabase.storage.from('product-images').upload(path,blob,{upsert:true,contentType:'image/jpeg'})
      if(error){ toast('Could not save.'); onSave(imageUrl); onClose(); setSaving(false); return }
      const{data:ud}=supabase.storage.from('product-images').getPublicUrl(path)
      onSave(ud.publicUrl||imageUrl); setSaving(false); onClose()
    },'image/jpeg',0.92)
  }

  const tabBtn = (active) => ({
    background: active ? 'rgba(197,169,106,.15)' : 'rgba(255,255,255,.06)',
    border: `1px solid ${active ? 'rgba(197,169,106,.4)' : 'rgba(255,255,255,.08)'}`,
    color: active ? 'var(--gold)' : 'rgba(255,255,255,.5)',
    borderRadius: 8, padding: '.35rem .85rem', cursor: 'pointer',
    fontFamily: 'inherit', fontSize: '.72rem', fontWeight: 600,
    letterSpacing: '.04em', transition: 'all .15s'
  })
  const ctrlBtn = () => ({
    background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)',
    color: 'rgba(255,255,255,.75)', borderRadius: 12, width: 68, height: 64,
    cursor: 'pointer', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'background .15s'
  })

  return (
    <div style={{position:'fixed',inset:0,background:'#080706',zIndex:500,display:'flex',flexDirection:'column'}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'.85rem 1.25rem',borderBottom:'1px solid rgba(255,255,255,.06)',flexShrink:0}}>
        <button onClick={onClose} style={tabBtn(false)}>Cancel</button>
        <div style={{display:'flex',gap:'.35rem'}}>
          <button onClick={()=>setMode('adjust')} style={tabBtn(mode==='adjust')}>Adjust</button>
          <button onClick={()=>setMode('crop')}   style={tabBtn(mode==='crop')}>Crop</button>
        </div>
        <button onClick={save} disabled={saving||!loaded}
          style={{background:saving||!loaded?'rgba(197,169,106,.3)':'var(--gold)',border:'none',color:'#1a1814',borderRadius:9,padding:'.45rem 1.1rem',cursor:'pointer',fontFamily:'inherit',fontSize:'.8rem',fontWeight:700,transition:'all .15s'}}>
          {saving ? 'Saving…' : 'Done'}
        </button>
      </div>

      {/* Canvas area */}
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'1.25rem',overflow:'hidden'}}>
        {!loaded && <div style={{color:'rgba(255,255,255,.25)',fontSize:'.75rem',letterSpacing:'.1em',textTransform:'uppercase'}}>Loading…</div>}
        <canvas ref={canvasRef} style={{maxWidth:'100%',maxHeight:'100%',display:loaded?'block':'none',borderRadius:6}}/>
      </div>

      {/* Controls */}
      <div style={{padding:'1rem 1.25rem 2.75rem',background:'rgba(0,0,0,.7)',backdropFilter:'blur(20px)',flexShrink:0}}>
        {mode==='adjust' && (
          <div style={{display:'flex',justifyContent:'center',gap:'.6rem'}}>
            {[
              {label:'↺', sub:'Rotate L', action:()=>rotate(-90)},
              {label:'↻', sub:'Rotate R', action:()=>rotate(90)},
              {label:'⇔', sub:'Mirror',   action:()=>setFlipH(f=>!f)},
            ].map((c,i)=>(
              <button key={i} onClick={c.action} style={ctrlBtn()}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.1)'}
                onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.05)'}>
                <span style={{fontSize:'1.4rem',lineHeight:1,fontWeight:300}}>{c.label}</span>
                <span style={{fontSize:'.55rem',color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.07em'}}>{c.sub}</span>
              </button>
            ))}
            <button onClick={()=>setShowEnhance(true)}
              style={{background:'rgba(197,169,106,.1)',border:'1px solid rgba(197,169,106,.25)',color:'var(--gold)',borderRadius:12,width:68,height:64,cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:5,transition:'all .15s'}}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(197,169,106,.2)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(197,169,106,.1)'}>
              <span style={{fontSize:'.82rem',fontWeight:700,letterSpacing:'.04em'}}>AI</span>
              <span style={{fontSize:'.55rem',color:'rgba(197,169,106,.5)',textTransform:'uppercase',letterSpacing:'.07em'}}>Enhance</span>
            </button>
          </div>
        )}
        {mode==='crop' && (
          <div>
            <div style={{fontSize:'.6rem',color:'rgba(255,255,255,.25)',textTransform:'uppercase',letterSpacing:'.12em',textAlign:'center',marginBottom:'.6rem'}}>Aspect ratio</div>
            <div style={{display:'flex',justifyContent:'center',gap:'.4rem',flexWrap:'wrap'}}>
              {[{label:'Free',val:null},{label:'1:1',val:1},{label:'3:4',val:0.75},{label:'4:3',val:1.333}].map(a=>(
                <button key={a.label} onClick={()=>applyAspect(a.val)}
                  style={{...tabBtn(cropAspect===a.val),padding:'.4rem .8rem',borderRadius:8}}>
                  {a.label}
                </button>
              ))}
            </div>
            <div style={{textAlign:'center',marginTop:'.55rem',fontSize:'.6rem',color:'rgba(255,255,255,.18)',letterSpacing:'.06em'}}>
              Tap Done to apply
            </div>
          </div>
        )}
      </div>

      {showEnhance&&(
        <EnhanceModal imageUrl={imageUrl} imagePreview={imageUrl} workspace={{id:workspaceId}}
          onSelect={newUrl=>{
            fetch(newUrl).then(r=>r.blob()).then(blob=>{
              const blobUrl=URL.createObjectURL(blob)
              const img=new Image()
              img.onload=()=>{imgRef.current=img;draw()}
              img.src=blobUrl
            })
            toast('Photo enhanced.'); setShowEnhance(false)
          }}
          onClose={()=>setShowEnhance(false)} toast={toast}/>
      )}
    </div>
  )
}
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
        {/* Top row: icon + info + amount */}
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
        {/* Bottom row: buttons right-aligned */}
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

// ── MILESTONE BANNER ──────────────────────────────────────────────────────────
function MilestoneBanner({ appts, stats }) {
  const now=new Date()
  const monthAppts=appts.filter(a=>{const tt=new Date(a.scheduled_at);return tt.getFullYear()===now.getFullYear()&&tt.getMonth()===now.getMonth()})
  const confirmedCount=monthAppts.filter(a=>a.status==='confirmed').length
  const mRev=monthRevenue(appts)
  const milestones=[]
  if(confirmedCount>=1&&confirmedCount<3) milestones.push({icon:'🎯',text:`First confirmed booking this month — you're building momentum.`})
  if(confirmedCount>=5) milestones.push({icon:'💪',text:`${confirmedCount} bookings confirmed this month. You're on a roll.`})
  if(confirmedCount>=10) milestones.push({icon:'🔥',text:`${confirmedCount} bookings this month. That's a full schedule.`})
  if(mRev>=500&&mRev<1000) milestones.push({icon:'⭐',text:`Over $500 earned this month — strong start.`})
  if(mRev>=1000) milestones.push({icon:'🏆',text:`$1,000+ earned this month. You crossed a milestone.`})
  if(mRev>=3000) milestones.push({icon:'🚀',text:`$3,000+ this month. Exceptional month for your business.`})
  if(stats.students>=10) milestones.push({icon:'🎓',text:`${stats.students} students enrolled in your formations.`})
  if(!milestones.length) return null
  const m=milestones[milestones.length-1]
  return (
    <div className="milestone-banner">
      <span className="milestone-icon">{m.icon}</span>
      <span className="milestone-text">{m.text}</span>
    </div>
  )
}

// ── MONTHLY GOAL ──────────────────────────────────────────────────────────────
function MonthlyGoal({ appts, workspace, refetchWorkspace }) {
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
  const monthName=new Date().toLocaleDateString('en-US',{month:'long'})
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
          <div className="card-title">Revenue Goal — {monthName}</div>
          {!editing&&<div className="card-sub">{fmtRev(rev)} of {fmtRev(goal)}</div>}
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

// ── REVENUE PANEL (FIX 4 scroll lock) ────────────────────────────────────────
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

// ── COACH SLIDER (FIX 5 — active days) ───────────────────────────────────────
function CoachSlider({ appts, stats, workspace }) {
  const now=new Date()
  const tips=[]
  const monthAppts=appts.filter(a=>{const tt=new Date(a.scheduled_at);return tt.getFullYear()===now.getFullYear()&&tt.getMonth()===now.getMonth()})
  const confirmedCount=monthAppts.filter(a=>a.status==='confirmed').length
  const mRev=monthRevenue(appts)
  // FIX 5: active days
  const activeDays=new Set(appts.filter(a=>{
    const d=new Date(a.scheduled_at)
    return a.status==='confirmed'&&d.getFullYear()===now.getFullYear()&&d.getMonth()===now.getMonth()
  }).map(a=>new Date(a.scheduled_at).toISOString().split('T')[0])).size
  if(activeDays===0) tips.push({icon:'📅',text:`Aucun jour actif ce mois-ci. Partage ton lien de réservation pour remplir ton agenda.`})
  else if(activeDays<8) tips.push({icon:'📅',text:`${activeDays} jour${activeDays>1?'s':''} actif${activeDays>1?'s':''} ce mois. Continue à partager ton lien — chaque slot vide est du revenu qui attend.`})
  else if(activeDays<15) tips.push({icon:'📅',text:`${activeDays} jours actifs ce mois. Ton agenda se remplit bien — maintiens cette dynamique.`})
  else tips.push({icon:'🔥',text:`${activeDays} jours actifs ce mois. Agenda presque plein — pense à ajuster tes prix si la demande dépasse ta capacité.`})
  if(confirmedCount>=1&&confirmedCount<3) tips.push({icon:'🎯',text:`First confirmed booking this month — you're building momentum.`})
  if(confirmedCount>=5) tips.push({icon:'💪',text:`${confirmedCount} bookings confirmed this month. You're on a roll.`})
  if(confirmedCount>=10) tips.push({icon:'🔥',text:`${confirmedCount} bookings this month. That's a full schedule.`})
  if(mRev>=500&&mRev<1000) tips.push({icon:'⭐',text:`Over $500 earned this month — strong start.`})
  if(mRev>=1000) tips.push({icon:'🏆',text:`$1,000+ earned this month. You crossed a milestone.`})
  if(mRev>=3000) tips.push({icon:'🚀',text:`$3,000+ this month. Exceptional month for your business.`})
  if(stats.students>=10) tips.push({icon:'🎓',text:`${stats.students} students enrolled in your formations.`})
  const pending=appts.filter(a=>a.status==='pending')
  if(pending.length>0) tips.push({icon:'📋',text:`You have ${pending.length} unconfirmed booking${pending.length>1?'s':''} waiting. Confirming ${pending.length>1?'them':'it'} secures your client's commitment.`})
  const todayStr=now.toISOString().split('T')[0]
  const noReminder=appts.filter(a=>a.scheduled_at?.startsWith(todayStr)&&a.status==='confirmed'&&!a.reminder_sent_at)
  if(noReminder.length>0) tips.push({icon:'💬',text:`${noReminder.length} client${noReminder.length>1?'s have':' has'} not received a reminder for today. A quick message reduces no-shows.`})
  const goal=workspace?.monthly_revenue_goal||3000
  const pctG=Math.round((mRev/goal)*100),remaining=Math.max(goal-mRev,0)
  const confirmed=appts.filter(a=>a.status==='confirmed'&&Number(a.amount)>0)
  const avg=confirmed.length?mRev/confirmed.length:0
  if(pctG<50&&avg>0){const needed=Math.ceil(remaining/avg);tips.push({icon:'📈',text:`You're at ${pctG}% of your ${now.toLocaleDateString('en-US',{month:'long'})} goal. ${needed} more appointment${needed>1?'s':''} at your average would close the gap.`})}
  else if(pctG>=50&&pctG<90) tips.push({icon:'📈',text:`You're at ${pctG}% of your monthly goal. Strong progress — keep your schedule filled.`})
  const in3=new Date(now.getTime()+3*24*60*60*1000)
  const upcoming=appts.filter(a=>{const d=new Date(a.scheduled_at);return d>now&&d<=in3&&a.status!=='cancelled'})
  if(upcoming.length===0) tips.push({icon:'🔗',text:'Your next 3 days are open. Sharing your booking link today could fill those slots before the week ends.'})
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
        <span className="coach-slider-text">{tip.text}</span>
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

// ── DAY PANEL (FIX 4 scroll lock + FIX 6 booking mode + smaller note) ─────────
function DayPanel({ dayStr, allAppts, blockedDates, onClose, onBlock, onUnblock, onBooked, workspace, lang='en' }) {
  useScrollLock()
  const [mode,setMode]=useState('main') // 'main' | 'booking'
  const [reason,setReason]=useState('')
  const [note,setNote]=useState('')
  const [noteSaving,setNoteSaving]=useState(false)
  const [noteSaved,setNoteSaved]=useState(false)
  const [noteLoading,setNoteLoading]=useState(true)
  const [services,setServices]=useState([])
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
    supabase.from('services').select('id,name,price').eq('workspace_id',workspace.id).eq('is_active',true).then(({data})=>setServices(data||[]))
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
    if(!bookingForm.client_name.trim()||!bookingForm.time) return;setBookingSaving(true)
    const [h,m]=bookingForm.time.split(':')
    const dt=new Date(dayStr+'T00:00:00');dt.setHours(parseInt(h),parseInt(m),0,0)
    const selectedSvc=services.find(s=>s.id===bookingForm.service_id)
    const{error}=await supabase.from('appointments').insert({
      workspace_id:workspace.id,client_name:bookingForm.client_name.trim(),
      client_phone:bookingForm.client_phone.trim()||null,client_email:bookingForm.client_email.trim()||null,
      service_id:bookingForm.service_id||null,service_name:selectedSvc?.name||null,
      scheduled_at:dt.toISOString(),amount:parseFloat(bookingForm.amount)||0,status:bookingForm.status,
    })
    setBookingSaving(false);if(error) return;setBookingDone(true)
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

        {/* FIX 6: Booking mode — its own isolated view */}
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

        {/* Main mode */}
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
                {!isPast&&dayAppts.length>0&&!blocked&&(
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
            {/* FIX 6: smaller note section (rows=2) */}
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
  const apptDays=new Set(allAppts.map(a=>{
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

// ── OVERVIEW (FIX 2: no new_appt, FIX 3: monthly stat cards) ─────────────────
function Overview({ workspace, session, ownerData, toast, setPage, refetchWorkspace, lang='en' }) {
  const [appts,setAppts]=useState([])
  const [allAppts,setAllAppts]=useState([])
  const [blockedDates,setBlockedDates]=useState([])
  const [selectedDay,setSelectedDay]=useState(null)
  const [stats,setStats]=useState({revenue:0,appointments:0,monthAppts:0,pending:0,confirmed:0,cancelled:0,products:0,students:0})
  const [showRevenue,setShowRevenue]=useState(false)
  const [remindersSent,setRemindersSent]=useState([])
  useEffect(()=>{
    if(!workspace) return
    // Show cached data instantly while fresh data loads
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
    return()=>supabase.removeChannel(ch)
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
    // Cache for next visit
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
  // FIX 3: monthly comparison, no "All time"
  const cards=[
    {label:'Revenue — '+new Date().toLocaleDateString('en-US',{month:'long'}),value:fmtRev(mRev),
      delta:mDelta!==null?`${mDelta>=0?'↑':'↓'} ${Math.abs(mDelta)}% vs last month`:'—',up:mDelta===null||mDelta>=0,page:'revenue'},
    {label:'Appointments',value:stats.monthAppts,
      delta:stats.pending>0?`${stats.pending} pending confirmation`:stats.cancelled>0?`${stats.cancelled} cancelled`:stats.confirmed>0?`${stats.confirmed} confirmed`:'—',
      up:stats.pending===0,page:'appointments'},
    {label:'Products',value:stats.products,delta:'Listed in your shop',up:true,page:'products'},
    {label:'Students',value:stats.students,delta:'Total enrollments',up:true,page:'formations'},
  ]
  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">{(()=>{const h=new Date().getHours();return h<12?t(lang,'morning'):h<17?t(lang,'afternoon'):t(lang,'evening')})()}, {ownerData?.full_name?.trim().split(' ')[0]||firstName(workspace,session)}</div>
          <div className="page-sub">
            {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}
            {todayCount>0&&<span style={{color:'var(--gold)',fontWeight:500}}> — {todayCount} appointment{todayCount>1?'s':''} today</span>}
          </div>
        </div>
        {/* FIX 2: only copy link button */}
        <div className="head-actions">
          <button className="btn btn-secondary btn-sm" onClick={()=>{
            const url=workspace?.slug?`https://beorganized.io/${workspace.slug}`:''
            if(url){navigator.clipboard?.writeText(url);toast('Lien copié !')}
          }}>
            <span style={{width:14,height:14,display:'flex'}}>{I.link}</span>
            {workspace?.slug?workspace.slug:t(lang,'copy_link')}
          </button>
        </div>
      </div>
      <NextUpBanner appts={allAppts} workspace={workspace} onReloaded={fetchData} toast={toast} lang={lang}/>
      {remindersSent.length>0&&(
        <div style={{background:'var(--ink)',borderRadius:10,padding:'.65rem 1.1rem',marginBottom:'1rem',display:'flex',alignItems:'center',gap:'.75rem',animation:'milestoneIn .35s ease'}}>
          <span style={{fontSize:'.9rem'}}>💬</span>
          <div style={{flex:1}}>
            <span style={{fontSize:'.75rem',color:'rgba(255,255,255,.5)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.06em'}}>Reminders sent today</span>
            <div style={{display:'flex',flexWrap:'wrap',gap:'.35rem',marginTop:'.3rem'}}>
              {remindersSent.map((r,i)=>(<span key={i} style={{background:'rgba(181,137,58,.2)',border:'1px solid rgba(181,137,58,.3)',borderRadius:20,padding:'2px 10px',fontSize:'.72rem',color:'var(--gold)',fontWeight:500}}>✓ {r.name} · {r.time}</span>))}
            </div>
          </div>
        </div>
      )}
      <CoachSlider appts={allAppts} stats={stats} workspace={workspace}/>
      <div className="stats-scroll">
        {cards.map((s,i)=>(
          <button key={i} className="stat-card stat-card-btn" onClick={()=>s.page==='revenue'?setShowRevenue(true):setPage(s.page)}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className={`stat-delta ${s.up?'delta-up':'delta-down'}`}>{s.delta}</div>
            <div className="stat-arrow">&#8594;</div>
          </button>
        ))}
      </div>
      <div className="grid-2" style={{marginBottom:'1.25rem'}}>
        <div className="card" style={{marginBottom:0}}>
          <div className="card-head"><div className="card-title">{t(lang,'revenue_week')}</div></div>
          <div className="card-body"><WeekChart appts={allAppts}/></div>
        </div>
        <MonthlyGoal appts={allAppts} workspace={workspace} refetchWorkspace={refetchWorkspace}/>
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
            <button className="btn btn-primary btn-sm" style={{marginTop:'.75rem'}} onClick={()=>{navigator.clipboard?.writeText(`https://beorganized.io/${workspace?.slug||''}`);toast(t(lang,'link_copied'))}}>{t(lang,'copy_booking_link')}</button>
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

// ── APPOINTMENTS (FIX 7: remove 4 boxes, mobile card layout) ──────────────────
function Appointments({ workspace, toast, lang='en' }) {
  const [data,setData]=useState([])
  const [loading,setLoading]=useState(true)
  useEffect(()=>{
    if(!workspace) return
    fetchData()
    const ch=supabase.channel('appts-rt').on('postgres_changes',{event:'*',schema:'public',table:'appointments',filter:`workspace_id=eq.${workspace.id}`},fetchData).subscribe()
    return()=>supabase.removeChannel(ch)
  },[workspace])
  async function fetchData(){
    const{data}=await supabase.from('appointments').select('*, services(name)').eq('workspace_id',workspace.id).order('scheduled_at',{ascending:false})
    setData(data||[]);setLoading(false)
  }
  async function confirm(id){await supabase.from('appointments').update({status:'confirmed'}).eq('id',id);toast('Confirmed.')}
  async function decline(id){await supabase.from('appointments').update({status:'cancelled'}).eq('id',id);toast('Declined.')}
  const pending=data.filter(a=>a.status==='pending')
  const rest=data.filter(a=>a.status!=='pending')
  return (
    <div>
      <div className="page-head"><div><div className="page-title">{t(lang,'appts_title')}</div><div className="page-sub">{t(lang,'appts_sub')}</div></div></div>
      {/* FIX 7: pending as mobile cards */}
      {pending.length>0&&(
        <div className="card" style={{marginBottom:'1.25rem'}}>
          <div className="card-head">
            <div className="card-title">{t(lang,'pending_confirm')}</div>
            <span className="badge badge-pending">{pending.length} {t(lang,'waiting')}</span>
          </div>
          {pending.map(a=>(
            <div key={a.id} style={{padding:'1rem 1.25rem',borderBottom:'1px solid var(--border)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'.65rem'}}>
                <div>
                  <div style={{fontWeight:600,fontSize:'.88rem',color:'var(--ink)'}}>{a.client_name}</div>
                  <div style={{fontSize:'.73rem',color:'var(--ink-3)',marginTop:3}}>{svcName(a)} · {new Date(a.scheduled_at).toLocaleDateString('en-CA',{month:'short',day:'numeric'})} · {new Date(a.scheduled_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
                </div>
                <span style={{fontFamily:"'Playfair Display',serif",fontSize:'1rem',color:'var(--ink)',flexShrink:0,marginLeft:'.5rem'}}>{fmtRev(a.amount)}</span>
              </div>
              <div style={{display:'flex',gap:'.5rem'}}>
                <button className="btn btn-primary btn-sm" style={{flex:1,justifyContent:'center'}} onClick={()=>confirm(a.id)}>✓ Confirm</button>
                <button className="btn btn-sm" style={{flex:1,justifyContent:'center',color:'#c0392b',border:'1px solid #fecaca',background:'var(--surface)'}} onClick={()=>decline(a.id)}>✕ Decline</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* FIX 7: all appointments as mobile cards */}
      <div className="card">
        <div className="card-head"><div className="card-title">{t(lang,'all_appts')}</div></div>
        {loading?<div style={{padding:'2rem',color:'var(--ink-3)'}}>Loading...</div>
          :rest.length===0&&pending.length===0?<div className="empty-state"><div className="empty-icon">{I.cal}</div><div className="empty-title">{t(lang,'no_appts')}</div><div className="empty-sub">{t(lang,'when_book')}</div></div>
          :rest.map(a=>(
            <div key={a.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1rem 1.25rem',borderBottom:'1px solid var(--border)'}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:600,fontSize:'.88rem',color:'var(--ink)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.client_name}</div>
                <div style={{fontSize:'.72rem',color:'var(--ink-3)',marginTop:3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{svcName(a)} · {new Date(a.scheduled_at).toLocaleDateString('en-CA',{month:'short',day:'numeric'})} · {new Date(a.scheduled_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'.5rem',flexShrink:0,marginLeft:'.75rem'}}>
                <span style={{fontFamily:"'Playfair Display',serif",fontSize:'.9rem',color:'var(--ink)'}}>{fmtRev(a.amount)}</span>
                <span className={`badge badge-${a.status}`}>{a.status}</span>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

// ── SERVICES (FIX 8: optional duration, card layout) ──────────────────────────
const DURATION_OPTIONS=[
  {label:'30 min',value:30},{label:'45 min',value:45},
  {label:'1 h',value:60},{label:'1 h 15',value:75},{label:'1 h 30',value:90},{label:'1 h 45',value:105},
  {label:'2 h',value:120},{label:'2 h 30',value:150},
  {label:'3 h',value:180},{label:'3 h 30',value:210},
  {label:'4 h',value:240},{label:'5 h',value:300},{label:'6 h',value:360},
]
function fmtDur(min){if(!min) return '—';if(min<60) return `${min} min`;const h=Math.floor(min/60),m=min%60;return m>0?`${h}h ${m}min`:`${h}h`}

function Services({ workspace, toast, lang='en' }) {
  const [data,setData]=useState([])
  const [showForm,setShowForm]=useState(false)
  const [form,setForm]=useState({name:'',price:'',duration_min:'',description:''})
  const [loading,setLoading]=useState(false)
  useEffect(()=>{if(workspace)fetchData()},[workspace])
  async function fetchData(){const{data}=await supabase.from('services').select('*').eq('workspace_id',workspace.id).order('display_order',{ascending:true});setData(data||[])}
  async function add(e){
    e.preventDefault();setLoading(true)
    await supabase.from('services').insert({workspace_id:workspace.id,name:form.name,price:parseFloat(form.price)||0,duration_min:form.duration_min?parseInt(form.duration_min):null,description:form.description,is_free:parseFloat(form.price)===0})
    toast(`${form.name} added.`);setForm({name:'',price:'',duration_min:'',description:''});setShowForm(false);setLoading(false);fetchData()
  }
  async function remove(id,name){await supabase.from('services').delete().eq('id',id);toast(`${name} removed.`);fetchData()}
  async function toggle(id,cur){await supabase.from('services').update({is_active:!cur}).eq('id',id);fetchData()}
  const iS={width:'100%',padding:'.6rem .85rem',border:'1px solid var(--border-2)',borderRadius:9,fontSize:'.85rem',fontFamily:'inherit',color:'var(--ink)',background:'var(--surface)',outline:'none',transition:'border .15s'}
  return (
    <div>
      <div className="page-head">
        <div><div className="page-title">{t(lang,'services_title')}</div><div className="page-sub">{t(lang,'services_sub')}</div></div>
        <button className="btn btn-primary" onClick={()=>setShowForm(s=>!s)}>{showForm?t(lang,'cancel'):t(lang,'add_service')}</button>
      </div>
      {showForm&&(
        <div className="card" style={{marginBottom:'1.25rem'}}>
          <div className="card-head"><div className="card-title">New service</div></div>
          <form onSubmit={add} className="card-body" style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              <div className="field"><label>Service name</label>
                <input style={iS} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Box Braids" required
                  onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/></div>
              <div className="field"><label>Price (CAD)</label>
                <input style={iS} type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="180" required
                  onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/></div>
            </div>
            <div className="field">
              <label style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span>Duration <span style={{fontSize:'.72rem',color:'var(--ink-3)',fontWeight:400}}>(optional)</span></span>
                {form.duration_min&&<span style={{fontSize:'.72rem',color:'var(--gold)',fontWeight:500}}>{DURATION_OPTIONS.find(d=>d.value===parseInt(form.duration_min))?.label||fmtDur(parseInt(form.duration_min))}</span>}
              </label>
              <div style={{display:'flex',flexWrap:'wrap',gap:'.4rem'}}>
                {DURATION_OPTIONS.map(opt=>{
                  const selected=parseInt(form.duration_min)===opt.value
                  return (
                    <button key={opt.value} type="button" onClick={()=>setForm(f=>({...f,duration_min:selected?'':String(opt.value)}))}
                      style={{padding:'.3rem .75rem',borderRadius:20,border:'1.5px solid',fontSize:'.75rem',fontWeight:500,cursor:'pointer',fontFamily:'inherit',transition:'all .14s',
                        borderColor:selected?'var(--gold)':'var(--border-2)',background:selected?'var(--gold-lt)':'var(--surface)',color:selected?'var(--gold)':'var(--ink-3)'}}>
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="field"><label>Description (optional)</label>
              <input style={iS} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="What's included, hair type, etc."
                onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/></div>
            <button type="submit" className="btn btn-primary" style={{justifyContent:'center',padding:'.75rem'}} disabled={loading}>{loading?'Saving...':'Save service'}</button>
          </form>
        </div>
      )}
      <div className="card">
        {data.length===0?(
          <div className="empty-state"><div className="empty-icon">{I.box}</div><div className="empty-title">{t(lang,'no_services')}</div><div className="empty-sub">{t(lang,'add_first_service')}</div></div>
        ):data.map(s=>(
          <div key={s.id} style={{display:'flex',alignItems:'center',gap:'.85rem',padding:'1rem 1.25rem',borderBottom:'1px solid var(--border)'}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:600,fontSize:'.88rem',color:'var(--ink)'}}>{s.name}</div>
              <div style={{fontSize:'.73rem',color:'var(--ink-3)',marginTop:3}}>{s.is_free?'Free':fmtRev(s.price)}{s.duration_min?` · ${fmtDur(s.duration_min)}`:''}</div>
              {s.description&&<div style={{fontSize:'.7rem',color:'var(--ink-3)',marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.description}</div>}
            </div>
            <span className={`badge ${s.is_active?'badge-confirmed':'badge-low'}`} style={{flexShrink:0}}>{s.is_active?'Active':'Hidden'}</span>
            <div style={{display:'flex',gap:'.35rem',flexShrink:0}}>
              <button className="btn btn-secondary btn-xs" onClick={()=>toggle(s.id,s.is_active)}>{s.is_active?'Hide':'Show'}</button>
              <button className="btn btn-xs" style={{color:'#c0392b',border:'1px solid #fecaca',background:'var(--surface)'}} onClick={()=>remove(s.id,s.name)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── AI ENHANCE MODAL ──────────────────────────────────────────────────────────
function EnhanceModal({ imageUrl, imagePreview, workspace, onSelect, onClose, toast, productName='' }) {
  const [style,setStyle]=useState('studio')
  const [phase,setPhase]=useState('pick')
  const [results,setResults]=useState([])
  const [loadingMsg,setLoadingMsg]=useState('')
  const EDGE='https://bwfpioxvfqwnwzkvtebg.supabase.co/functions/v1/enhance-product-image'

  async function run(){
    setPhase('loading');setLoadingMsg('AI is crafting your photos...')
    try{
      const desc=productName?`${productName} beauty product`:'professional hair and beauty product'
      const res=await fetch(EDGE,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({image_url:imageUrl,style,product_description:desc})
      })
      const data=await res.json()
      if(data?.error) throw new Error(data.error)
      if(data?.urls && data.urls.length>0){ setResults(data.urls.filter(Boolean)); setPhase('results'); return }
      throw new Error('No images returned.')
    }catch(e){toast('Enhancement unavailable — '+e.message);setPhase('pick')}
  }
  async function pick(url){
    try{
      const res=await fetch(url),blob=await res.blob()
      const path=`${workspace.id}/enhanced-${Date.now()}.jpg`
      await supabase.storage.from('product-images').upload(path,blob,{upsert:true,contentType:'image/jpeg'})
      const{data:ud}=supabase.storage.from('product-images').getPublicUrl(path)
      onSelect(ud.publicUrl||url);onClose()
    }catch(e){toast('Could not save enhanced image: '+e.message)}
  }
  const labels={studio:['Front view','Angled view'],glamour:['Cosmetic scene','Wellness scene']}
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1050,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
      <style>{`@keyframes spin-en{to{transform:rotate(360deg)}}`}</style>
      <div style={{background:'var(--surface)',borderRadius:'20px',width:'100%',maxWidth:'480px',overflow:'hidden',boxShadow:'0 32px 80px rgba(0,0,0,.4)'}}>
        <div style={{padding:'1.2rem 1.5rem',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:'1rem',fontWeight:600,fontFamily:"'Playfair Display',serif"}}>AI Photo Enhancement</div>
            <div style={{fontSize:'.75rem',color:'var(--ink-3)',marginTop:'.15rem'}}>Transform your photo into a professional visual</div>
          </div>
          <button onClick={onClose} style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:'8px',width:30,height:30,cursor:'pointer',color:'var(--ink-3)',fontSize:'1.1rem',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
        </div>
        <div style={{padding:'1.4rem'}}>
          {phase==='pick'&&(<>
            <img src={imagePreview||imageUrl} style={{width:'100%',height:140,objectFit:'cover',borderRadius:10,marginBottom:'1.25rem'}} alt="product"/>
            <div style={{fontSize:'.7rem',fontWeight:700,color:'var(--ink-3)',marginBottom:'.65rem',textTransform:'uppercase',letterSpacing:'.08em'}}>Choose a style</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.65rem',marginBottom:'1.25rem'}}>
              {[{v:'studio',label:'Studio',desc:'Clean background · sharp lighting'},{v:'glamour',label:'Glamour',desc:'Marble · bokeh · luxury spa'}].map(o=>(
                <div key={o.v} onClick={()=>setStyle(o.v)}
                  style={{border:`1.5px solid ${style===o.v?'var(--gold)':'var(--border)'}`,borderRadius:12,padding:'.9rem',cursor:'pointer',background:style===o.v?'var(--gold-lt)':'var(--bg)',transition:'all .15s'}}>
                  <div style={{width:28,height:3,background:style===o.v?'var(--gold)':'var(--border-2)',borderRadius:2,marginBottom:'.6rem',transition:'background .15s'}}/>
                  <div style={{fontWeight:600,fontSize:'.88rem',color:'var(--ink)',marginBottom:'.2rem'}}>{o.label}</div>
                  <div style={{fontSize:'.72rem',color:'var(--ink-3)',lineHeight:1.5}}>{o.desc}</div>
                </div>
              ))}
            </div>
            <button onClick={run} style={{width:'100%',padding:'.85rem',background:'linear-gradient(135deg,#c5a66a,#a8863d)',color:'#fff',border:'none',borderRadius:10,fontWeight:600,fontSize:'.88rem',cursor:'pointer'}}>Generate Enhanced Photos</button>
          </>)}
          {phase==='loading'&&(
            <div style={{textAlign:'center',padding:'2.5rem 0'}}>
              <div style={{width:44,height:44,borderRadius:'50%',border:'3px solid var(--border)',borderTopColor:'var(--gold)',animation:'spin-en 1s linear infinite',margin:'0 auto 1.1rem'}}/>
              <div style={{fontWeight:600,color:'var(--ink)',marginBottom:'.35rem'}}>{loadingMsg}</div>
              <div style={{fontSize:'.78rem',color:'var(--ink-3)'}}>This takes 20 – 40 seconds</div>
            </div>
          )}
          {phase==='results'&&(<>
            <div style={{fontSize:'.7rem',fontWeight:700,color:'var(--ink-3)',marginBottom:'.65rem',textTransform:'uppercase',letterSpacing:'.08em'}}>Select your photo</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.65rem',marginBottom:'.85rem'}}>
              {results.map((url,i)=>(
                <div key={i} onClick={()=>pick(url)} style={{borderRadius:10,overflow:'hidden',cursor:'pointer',border:'2px solid var(--border)',transition:'border-color .15s',position:'relative'}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor='var(--gold)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                  <img src={url} style={{width:'100%',aspectRatio:'2/3',objectFit:'cover',display:'block'}} alt={`Option ${i+1}`}/>
                  <div style={{position:'absolute',bottom:0,left:0,right:0,background:'linear-gradient(transparent,rgba(0,0,0,.55))',padding:'.4rem .55rem',fontSize:'.7rem',color:'#fff',fontWeight:500}}>{labels[style][i]}</div>
                </div>
              ))}
            </div>
            <button onClick={()=>{setPhase('pick');setResults([])}} style={{width:'100%',padding:'.65rem',background:'none',border:'1px solid var(--border)',borderRadius:9,color:'var(--ink-3)',cursor:'pointer',fontSize:'.82rem'}}>← Try a different style</button>
          </>)}
        </div>
      </div>
    </div>
  )
}

// ── IMAGE HELPERS ─────────────────────────────────────────────────────────────
async function compressImage(file,maxWidth=1400,quality=0.82){
  if(!file.type.startsWith('image/')) return file
  return new Promise(resolve=>{
    const img=new Image(),url=URL.createObjectURL(file)
    img.onload=()=>{
      URL.revokeObjectURL(url)
      const scale=Math.min(1,maxWidth/img.width),w=Math.round(img.width*scale),h=Math.round(img.height*scale)
      const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h
      canvas.getContext('2d').drawImage(img,0,0,w,h)
      canvas.toBlob(blob=>{
        if(!blob){resolve(file);return}
        resolve(new File([blob],file.name.replace(/\.[^.]+$/,'.jpg'),{type:'image/jpeg'}))
      },'image/jpeg',quality)
    }
    img.onerror=()=>{URL.revokeObjectURL(url);resolve(file)}
    img.src=url
  })
}
async function uploadProductImages(files,workspaceId){
  if(!workspaceId) return files.map(file=>({preview:URL.createObjectURL(file),url:null,error:'Workspace not loaded.'}))
  return Promise.all(files.map(async(file,i)=>{
    const preview=URL.createObjectURL(file),compressed=await compressImage(file)
    const ext=compressed.name.split('.').pop(),path=`${workspaceId}/${Date.now()}-${i}-${Math.random().toString(36).slice(2)}.${ext}`
    const{error}=await supabase.storage.from('product-images').upload(path,compressed,{upsert:true})
    if(error) return{preview,url:null,error:error.message}
    const{data:urlData}=supabase.storage.from('product-images').getPublicUrl(path)
    return{preview,url:urlData?.publicUrl||null,error:null}
  }))
}

// ── PRODUCTS (FIX 9: full-page add, tap-to-edit photos) ──────────────────────
function Products({ workspace, toast }) {
  const [data,setData]=useState([])
  const [addMode,setAddMode]=useState(false)
  const [form,setForm]=useState({name:'',price:'',stock:'',description:''})
  const [pendingImgs,setPendingImgs]=useState([])
  const [uploading,setUploading]=useState(false)
  const [saving,setSaving]=useState(false)
  const [editProduct,setEditProduct]=useState(null)
  const [selectMode,setSelectMode]=useState(false)
  const [selected,setSelected]=useState(new Set())
  const [showDotMenu,setShowDotMenu]=useState(false)
  const [deleting,setDeleting]=useState(false)
  const [editorTarget,setEditorTarget]=useState(null)
  const fileInputRef=useRef(null)

  useEffect(()=>{if(workspace)fetchData()},[workspace])
  async function fetchData(){const{data}=await supabase.from('products').select('*').eq('workspace_id',workspace.id).order('created_at',{ascending:false});setData(data||[])}
  function enterSelectMode(){setSelectMode(true);setSelected(new Set());setShowDotMenu(false)}
  function exitSelectMode(){setSelectMode(false);setSelected(new Set())}
  function toggleSelect(id){setSelected(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n})}
  async function deleteSelected(){
    if(!selected.size) return;setDeleting(true)
    await Promise.all([...selected].map(id=>supabase.from('products').delete().eq('id',id)))
    toast(`${selected.size} product${selected.size>1?'s':''} deleted.`);setDeleting(false);exitSelectMode();fetchData()
  }
  async function handleImageSelect(e){
    const files=[...e.target.files];if(!files.length) return;setUploading(true)
    const results=await uploadProductImages(files,workspace.id)
    const failed=results.filter(r=>r.error);if(failed.length>0) toast(`Upload failed: ${failed[0].error}`)
    setPendingImgs(prev=>[...prev,...results]);setUploading(false)
  }
  async function add(e){
    e.preventDefault();setSaving(true)
    const imageUrls=pendingImgs.filter(p=>p.url).map(p=>p.url)
    await supabase.from('products').insert({workspace_id:workspace.id,name:form.name,price:parseFloat(form.price)||0,stock:parseInt(form.stock)||0,description:form.description,images:imageUrls})
    toast(`${form.name} added.`);setForm({name:'',price:'',stock:'',description:''});setPendingImgs([]);setSaving(false);setAddMode(false);fetchData()
  }
  const iS={width:'100%',padding:'.6rem .85rem',border:'1px solid var(--border-2)',borderRadius:9,fontSize:'.85rem',fontFamily:'inherit',color:'var(--ink)',background:'var(--surface)',outline:'none',transition:'border .15s'}

  // FIX 9: full-page add mode
  if(addMode) return (
    <div>
      <div className="page-head">
        <div>
          <button className="settings-back-btn" onClick={()=>{setAddMode(false);setForm({name:'',price:'',stock:'',description:''});setPendingImgs([])}}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" width="13" height="13"><path d="M10 3L5 8l5 5"/></svg> Products
          </button>
          <div className="page-title" style={{marginTop:'.4rem'}}>New product</div>
        </div>
      </div>
      <div className="card">
        <form onSubmit={add} className="card-body" style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div className="field"><label>Product name</label>
              <input style={iS} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Moisture Serum" required
                onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/></div>
            <div className="field"><label>Price (CAD)</label>
              <input style={iS} type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="28" required
                onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/></div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div className="field"><label>Stock</label>
              <input style={iS} type="number" value={form.stock} onChange={e=>setForm(f=>({...f,stock:e.target.value}))} placeholder="10"
                onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/></div>
            <div className="field"><label>Description</label>
              <input style={iS} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="What it does, key ingredients..."
                onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/></div>
          </div>
          <div>
            <div style={{fontSize:'.75rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'.5rem'}}>Photos</div>
            <div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple style={{display:'none'}} onChange={handleImageSelect}/>
              <button type="button" onClick={()=>fileInputRef.current?.click()}
                style={{width:'100%',border:'2px dashed var(--border-2)',borderRadius:12,padding:'1.1rem',textAlign:'center',cursor:'pointer',transition:'all .15s',background:'var(--bg)',fontFamily:'inherit'}}
                onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}>
                <div style={{fontSize:'1.3rem',marginBottom:'.2rem'}}>📷</div>
                <div style={{fontSize:'.78rem',fontWeight:500,color:'var(--ink-2)'}}>{uploading?'Uploading…':'Tap to add photos'}</div>
                <div style={{fontSize:'.68rem',color:'var(--ink-3)',marginTop:'.15rem'}}>JPG · PNG · WEBP · tap photo to edit</div>
              </button>
            </div>
            {pendingImgs.length>0&&(
              <div style={{display:'flex',gap:'.45rem',flexWrap:'wrap',marginTop:'.65rem'}}>
                {pendingImgs.map((img,i)=>(
                  <div key={i} style={{position:'relative',width:72,height:72,borderRadius:9,overflow:'hidden',border:`1px solid ${img.error?'var(--red)':'var(--border)'}`,background:'var(--bg)',flexShrink:0,cursor:img.url?'pointer':'default'}}
                    onClick={()=>img.url&&setEditorTarget({idx:i,url:img.url,preview:img.preview||img.url})}>
                    <img src={img.preview||img.url} alt="" style={{width:'100%',height:'100%',objectFit:'cover',opacity:img.url?1:.5}}/>
                    {!img.url&&!img.error&&<div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.6rem',color:'var(--ink-3)'}}>↑</div>}
                    {img.error&&<div style={{position:'absolute',inset:0,background:'rgba(192,57,43,.75)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.58rem',color:'#fff',fontWeight:600}}>Failed</div>}
                    <button type="button" onClick={e=>{e.stopPropagation();setPendingImgs(prev=>prev.filter((_,idx)=>idx!==i))}}
                      style={{position:'absolute',top:2,right:2,background:'rgba(0,0,0,.6)',border:'none',color:'#fff',width:18,height:18,borderRadius:'50%',cursor:'pointer',fontSize:'.55rem',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
                    {img.url&&<div style={{position:'absolute',bottom:0,left:0,right:0,background:'rgba(0,0,0,.45)',display:'flex',alignItems:'center',justifyContent:'center',padding:'2px',fontSize:'.52rem',color:'rgba(255,255,255,.85)',fontWeight:500}}>Edit</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button type="submit" className="btn btn-primary" style={{justifyContent:'center',padding:'.75rem'}} disabled={saving||uploading}>
            {uploading?'Uploading…':saving?'Saving…':'Save product'}
          </button>
        </form>
      </div>
      {editorTarget&&(
        <ImageEditorModal imageUrl={editorTarget.url} workspaceId={workspace.id} productName={form.name}
          onSave={newUrl=>{setPendingImgs(prev=>prev.map((img,i)=>i===editorTarget.idx?{...img,url:newUrl,preview:newUrl}:img));setEditorTarget(null);toast('Photo saved.')}}
          onClose={()=>setEditorTarget(null)} toast={toast}/>
      )}
    </div>
  )

  return (
    <div>
      <div className="page-head">
        <div><div className="page-title">Products</div><div className="page-sub">Sell from your profile page</div></div>
        <div style={{display:'flex',gap:'.5rem',alignItems:'center',position:'relative'}}>
          {selectMode?(
            <>
              <span style={{fontSize:'.8rem',color:'var(--ink-3)'}}>{selected.size} selected</span>
              <button className="btn btn-xs" style={{color:'var(--red)',border:'1px solid rgba(192,57,43,.25)',background:'var(--surface)'}} onClick={deleteSelected} disabled={!selected.size||deleting}>{deleting?'Deleting…':`Delete ${selected.size||''}`}</button>
              <button className="btn btn-secondary btn-sm" onClick={exitSelectMode}>Cancel</button>
            </>
          ):(
            <>
              <button className="btn btn-primary" onClick={()=>setAddMode(true)}>Add product</button>
              <div style={{position:'relative'}}>
                <button className="btn btn-secondary btn-sm" style={{padding:'.35rem .6rem',fontSize:'1rem'}} onClick={()=>setShowDotMenu(s=>!s)}>⋮</button>
                {showDotMenu&&(
                  <><div style={{position:'fixed',inset:0,zIndex:98}} onClick={()=>setShowDotMenu(false)}/>
                  <div style={{position:'absolute',right:0,top:'calc(100% + 6px)',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,boxShadow:'0 8px 24px rgba(0,0,0,.12)',minWidth:170,zIndex:99,overflow:'hidden'}}>
                    <div style={{padding:'.65rem 1rem',fontSize:'.82rem',color:'var(--red)',cursor:'pointer',display:'flex',alignItems:'center',gap:'.5rem'}} onClick={enterSelectMode}>☑ Select to delete</div>
                  </div></>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      {selectMode&&data.length>0&&(
        <div style={{background:'var(--gold-lt)',border:'1px solid var(--gold-dim)',borderRadius:10,padding:'.65rem 1rem',marginBottom:'1rem',fontSize:'.8rem',color:'var(--ink-2)'}}>
          Tap products to select, then hit Delete.
          <button style={{marginLeft:'.75rem',fontSize:'.75rem',color:'var(--gold)',fontWeight:600,background:'none',border:'none',cursor:'pointer'}} onClick={()=>setSelected(new Set(data.map(p=>p.id)))}>Select all ({data.length})</button>
        </div>
      )}
      <div className="grid-3">
        {data.length===0
          ?<div className="card" style={{gridColumn:'1/-1'}}><div className="empty-state"><div className="empty-icon">{I.box}</div><div className="empty-title">No products yet</div><div className="empty-sub">Add products to sell on your profile.</div></div></div>
          :data.map(p=>{
            const imgs=p.images||[],isSelected=selected.has(p.id)
            return (
              <div key={p.id} className="prod-card" onClick={()=>selectMode?toggleSelect(p.id):setEditProduct(p)}
                style={{cursor:'pointer',position:'relative',outline:isSelected?'2.5px solid var(--gold)':'none',transition:'outline .12s'}}>
                {selectMode&&(<div style={{position:'absolute',top:8,left:8,zIndex:2,width:22,height:22,borderRadius:6,border:`2px solid ${isSelected?'var(--gold)':'rgba(255,255,255,.7)'}`,background:isSelected?'var(--gold)':'rgba(0,0,0,.35)',display:'flex',alignItems:'center',justifyContent:'center',transition:'all .12s'}}>{isSelected&&<svg viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.5" width="10" height="10"><polyline points="1.5,5 4,7.5 8.5,2.5"/></svg>}</div>)}
                <div className="prod-img" style={{position:'relative',overflow:'hidden',background:'var(--bg)'}}>
                  {imgs.length>0?<img src={imgs[0]} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform .3s',filter:isSelected?'brightness(.8)':'none'}} onMouseEnter={e=>{if(!selectMode)e.currentTarget.style.transform='scale(1.06)'}} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}/>
                    :<div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'.3rem'}}><span style={{fontSize:'1.5rem'}}>📷</span><span style={{fontSize:'.65rem',color:'var(--ink-3)'}}>Add photos</span></div>}
                  {imgs.length>1&&<div style={{position:'absolute',bottom:5,right:6,background:'rgba(0,0,0,.5)',color:'#fff',fontSize:'.6rem',padding:'1px 6px',borderRadius:20}}>+{imgs.length-1}</div>}
                </div>
                <div className="prod-body">
                  <div className="prod-name">{p.name}</div>
                  <div className="prod-price">{fmtRev(p.price)}</div>
                  <span className={`badge ${p.stock===0?'badge-low':p.stock<5?'badge-pending':'badge-confirmed'}`}>{p.stock===0?'Out of stock':`${p.stock} in stock`}</span>
                </div>
              </div>
            )
          })}
      </div>
      {editProduct&&!selectMode&&(<ProductEditModal product={editProduct} workspaceId={workspace.id} onClose={()=>setEditProduct(null)} onSaved={fetchData} onDeleted={fetchData} toast={toast}/>)}
    </div>
  )
}

// ── PRODUCT EDIT MODAL ────────────────────────────────────────────────────────
function ProductEditModal({ product, workspaceId, onClose, onSaved, onDeleted, toast }) {
  useScrollLock()
  const [form,setForm]=useState({name:product.name||'',price:String(product.price??''),stock:String(product.stock??''),description:product.description||''})
  const [existingImgs,setExistingImgs]=useState((product.images||[]).map(url=>({url,preview:url})))
  const [newImgs,setNewImgs]=useState([])
  const [uploading,setUploading]=useState(false)
  const [saving,setSaving]=useState(false)
  const [confirmDelete,setConfirmDelete]=useState(false)
  const [activeIdx,setActiveIdx]=useState(0)
  const [zoomed,setZoomed]=useState(false)
  const [tab,setTab]=useState('view')
  const [editorTarget,setEditorTarget]=useState(null)
  const allImages=[...existingImgs.map(i=>i.url),...newImgs.filter(i=>i.url).map(i=>i.url)]
  useEffect(()=>{
    const onKey=e=>{if(e.key==='Escape')onClose();if(e.key==='ArrowRight')setActiveIdx(i=>(i+1)%Math.max(allImages.length,1));if(e.key==='ArrowLeft')setActiveIdx(i=>(i-1+Math.max(allImages.length,1))%Math.max(allImages.length,1))}
    window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)
  },[allImages.length])
  async function handleNewImages(e){const files=[...e.target.files];if(!files.length) return;setUploading(true);const results=await uploadProductImages(files,workspaceId);if(results.filter(r=>r.error).length>0)toast('Upload failed');setNewImgs(prev=>[...prev,...results]);setUploading(false)}
  async function save(){
    setSaving(true)
    const finalImages=[...existingImgs.map(i=>i.url),...newImgs.filter(i=>i.url).map(i=>i.url)]
    const{error}=await supabase.from('products').update({name:form.name,price:parseFloat(form.price)||0,stock:parseInt(form.stock)||0,description:form.description,images:finalImages}).eq('id',product.id)
    setSaving(false);if(error){toast('Error saving.');return};toast(`${form.name} updated.`);onSaved();onClose()
  }
  async function deleteProduct(){await supabase.from('products').delete().eq('id',product.id);toast(`${product.name} deleted.`);onDeleted();onClose()}
  const iS={width:'100%',padding:'.55rem .8rem',border:'1px solid var(--border-2)',borderRadius:9,fontSize:'.84rem',fontFamily:'inherit',color:'var(--ink)',background:'var(--surface)',outline:'none',transition:'border .15s'}
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.72)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem',backdropFilter:'blur(4px)'}} onClick={onClose}>
      <div style={{background:'var(--surface)',borderRadius:18,width:'100%',maxWidth:660,maxHeight:'92vh',overflowY:'auto',boxShadow:'0 32px 80px rgba(0,0,0,.3)',display:'flex',flexDirection:'column'}} onClick={e=>e.stopPropagation()}>
        <div style={{position:'relative',background:'#0d0c0a',borderRadius:'18px 18px 0 0',overflow:'hidden',minHeight:240}}>
          {allImages.length>0?(
            <>
              <div style={{height:280,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',cursor:zoomed?'zoom-out':'zoom-in'}} onClick={()=>tab==='view'&&setZoomed(z=>!z)}>
                <img src={allImages[Math.min(activeIdx,allImages.length-1)]} alt="" style={{maxHeight:'100%',maxWidth:'100%',objectFit:'contain',transition:'transform .3s',transform:zoomed?'scale(1.85)':'scale(1)'}}/>
              </div>
              {allImages.length>1&&(
                <>
                  <button onClick={e=>{e.stopPropagation();setActiveIdx(i=>(i-1+allImages.length)%allImages.length)}} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,.15)',border:'none',color:'#fff',width:34,height:34,borderRadius:'50%',cursor:'pointer',fontSize:'1rem',display:'flex',alignItems:'center',justifyContent:'center'}}>‹</button>
                  <button onClick={e=>{e.stopPropagation();setActiveIdx(i=>(i+1)%allImages.length)}} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,.15)',border:'none',color:'#fff',width:34,height:34,borderRadius:'50%',cursor:'pointer',fontSize:'1rem',display:'flex',alignItems:'center',justifyContent:'center'}}>›</button>
                  <div style={{position:'absolute',bottom:8,right:12,background:'rgba(0,0,0,.5)',color:'#fff',fontSize:'.65rem',padding:'2px 8px',borderRadius:20}}>{Math.min(activeIdx,allImages.length-1)+1}/{allImages.length}</div>
                </>
              )}
            </>
          ):(
            <div style={{height:180,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,.3)',gap:'.5rem'}}><div style={{fontSize:'2rem'}}>📷</div><div style={{fontSize:'.78rem'}}>No photos yet</div></div>
          )}
          <button onClick={onClose} style={{position:'absolute',top:10,right:10,background:'rgba(0,0,0,.5)',border:'none',color:'#fff',width:30,height:30,borderRadius:'50%',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.85rem'}}>✕</button>
          <div style={{position:'absolute',top:10,left:10,display:'flex',background:'rgba(0,0,0,.45)',borderRadius:20,overflow:'hidden'}}>
            {['view','edit'].map(tb=>(<button key={tb} onClick={e=>{e.stopPropagation();setTab(tb);setZoomed(false)}} style={{padding:'4px 14px',border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:'.7rem',fontWeight:600,textTransform:'uppercase',letterSpacing:'.05em',transition:'all .15s',background:tab===tb?'rgba(181,137,58,.9)':'transparent',color:tab===tb?'#111':'rgba(255,255,255,.7)'}}>{tb}</button>))}
          </div>
          {allImages.length>0&&tab==='edit'&&(
            <button onClick={e=>{e.stopPropagation();const url=allImages[Math.min(activeIdx,allImages.length-1)];const isEx=activeIdx<existingImgs.length;setEditorTarget({type:isEx?'existing':'new',idx:isEx?activeIdx:activeIdx-existingImgs.length,url})}}
              style={{position:'absolute',bottom:10,right:10,background:'linear-gradient(135deg,rgba(197,166,106,.92),rgba(168,134,61,.92))',border:'none',color:'#fff',borderRadius:20,padding:'5px 12px',fontSize:'.7rem',fontWeight:700,cursor:'pointer',letterSpacing:'.03em'}}>
              ✨ Edit photo
            </button>
          )}
        </div>
        {allImages.length>1&&(
          <div style={{display:'flex',gap:'.4rem',padding:'.6rem 1rem',overflowX:'auto',background:'#161412',scrollbarWidth:'none'}}>
            {allImages.map((img,i)=>(<div key={i} onClick={()=>setActiveIdx(i)} style={{width:46,height:46,flexShrink:0,borderRadius:7,overflow:'hidden',border:`2px solid ${i===activeIdx?'var(--gold)':'transparent'}`,cursor:'pointer',transition:'border .12s'}}><img src={img} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>))}
          </div>
        )}
        {tab==='view'&&(
          <div style={{padding:'1.25rem 1.5rem'}}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'.5rem'}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.4rem',color:'var(--ink)',fontWeight:500}}>{product.name}</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.35rem',color:'var(--gold)',flexShrink:0,marginLeft:'1rem'}}>{fmtRev(product.price)}</div>
            </div>
            {product.description&&<div style={{fontSize:'.85rem',color:'var(--ink-2)',lineHeight:1.65,marginBottom:'.75rem'}}>{product.description}</div>}
            <span className={`badge ${product.stock===0?'badge-low':product.stock<5?'badge-pending':'badge-confirmed'}`}>{product.stock===0?'Out of stock':`${product.stock} in stock`}</span>
            <div style={{marginTop:'1rem'}}><button className="btn btn-secondary btn-sm" onClick={()=>setTab('edit')}>✏️ Edit this product</button></div>
          </div>
        )}
        {tab==='edit'&&(
          <div style={{padding:'1.25rem 1.5rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.75rem'}}>
              <div className="field"><label>Name</label><input style={iS} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/></div>
              <div className="field"><label>Price (CAD)</label><input style={iS} type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:'.75rem'}}>
              <div className="field"><label>Stock</label><input style={iS} type="number" value={form.stock} onChange={e=>setForm(f=>({...f,stock:e.target.value}))} onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/></div>
              <div className="field"><label>Description</label><input style={iS} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/></div>
            </div>
            {existingImgs.length>0&&(
              <div>
                <div style={{fontSize:'.72rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'.5rem'}}>Current photos — click ✕ to remove</div>
                <div style={{display:'flex',gap:'.45rem',flexWrap:'wrap'}}>
                  {existingImgs.map((img,i)=>(<div key={i} style={{position:'relative',width:68,height:68,borderRadius:9,overflow:'hidden',border:'1px solid var(--border)',flexShrink:0}}><img src={img.url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/><button type="button" onClick={()=>{setExistingImgs(prev=>prev.filter((_,idx)=>idx!==i));if(activeIdx>=allImages.length-1)setActiveIdx(0)}} style={{position:'absolute',top:2,right:2,background:'rgba(192,57,43,.85)',border:'none',color:'#fff',width:18,height:18,borderRadius:'50%',cursor:'pointer',fontSize:'.58rem',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button></div>))}
                </div>
              </div>
            )}
            <div>
              <div style={{fontSize:'.72rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'.5rem'}}>Add more photos</div>
              <label style={{display:'block',border:'2px dashed var(--border-2)',borderRadius:12,padding:'1rem',textAlign:'center',cursor:'pointer',transition:'all .15s',background:'var(--bg)'}} onMouseEnter={e=>e.currentTarget.style.borderColor='var(--gold)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-2)'}>
                <input type="file" accept="image/*" multiple style={{display:'none'}} onChange={handleNewImages}/>
                <div style={{fontSize:'1.1rem',marginBottom:'.2rem'}}>📷</div>
                <div style={{fontSize:'.78rem',color:'var(--ink-2)'}}>{uploading?'Uploading…':'Click to add photos'}</div>
              </label>
              {newImgs.filter(f=>f.url).length>0&&(<div style={{display:'flex',gap:'.45rem',flexWrap:'wrap',marginTop:'.5rem'}}>{newImgs.filter(f=>f.url).map((img,i)=>(<div key={i} style={{position:'relative',width:68,height:68,borderRadius:9,overflow:'hidden',border:'1px solid rgba(46,125,82,.3)',flexShrink:0}}><img src={img.url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/><button type="button" onClick={()=>setNewImgs(prev=>prev.filter((_,idx)=>idx!==i))} style={{position:'absolute',top:2,right:2,background:'none',border:'none',cursor:'pointer',color:'var(--ink-3)',fontSize:'.85rem',padding:'2px'}}>✕</button></div>))}</div>)}
            </div>
            <div style={{display:'flex',gap:'.6rem',paddingTop:'.25rem'}}>
              <button className="btn btn-primary" style={{flex:1,justifyContent:'center',padding:'.7rem'}} onClick={save} disabled={saving||uploading}>{saving?'Saving…':'Save changes'}</button>
              {!confirmDelete?<button className="btn btn-xs" style={{color:'var(--red)',border:'1px solid rgba(192,57,43,.25)',background:'var(--surface)',padding:'.4rem .9rem'}} onClick={()=>setConfirmDelete(true)}>Delete</button>
                :<button className="btn btn-xs" style={{color:'#fff',background:'var(--red)',border:'none',padding:'.4rem .9rem'}} onClick={deleteProduct}>Confirm delete</button>}
            </div>
          </div>
        )}
      </div>
      {editorTarget&&(
        <ImageEditorModal imageUrl={editorTarget.url} workspaceId={workspaceId} productName={product.name}
          onSave={newUrl=>{
            if(editorTarget.type==='existing') setExistingImgs(prev=>prev.map((img,i)=>i===editorTarget.idx?{url:newUrl,preview:newUrl}:img))
            else setNewImgs(prev=>prev.map((img,i)=>i===editorTarget.idx?{...img,url:newUrl,preview:newUrl}:img))
            setEditorTarget(null);toast('Photo saved.')
          }}
          onClose={()=>setEditorTarget(null)} toast={toast}/>
      )}
    </div>
  )
}

// ── FORMATION helpers (unchanged) ─────────────────────────────────────────────
const FILE_ICONS={pdf:'📄',image:'🖼️',video:'🎬',other:'📎'}
function fileType(f){if(f.type?.startsWith('video')) return 'video';if(f.type?.startsWith('image')) return 'image';if(f.type==='application/pdf'||f.name?.endsWith('.pdf')) return 'pdf';return 'other'}
function fmtBytes(b){if(b<1024) return b+'B';if(b<1048576) return (b/1024).toFixed(0)+'KB';return (b/1048576).toFixed(1)+'MB'}
async function uploadFormationFile(file,workspaceId){
  const kind=fileType(file),toUpload=kind==='image'?await compressImage(file):file
  const ext=file.name.split('.').pop(),path=`${workspaceId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const{error}=await supabase.storage.from('formation-files').upload(path,toUpload,{upsert:true,contentType:file.type})
  if(error) return{name:file.name,size:file.size,kind,url:null,preview:null,error:error.message}
  const{data:urlData}=supabase.storage.from('formation-files').getPublicUrl(path)
  return{name:file.name,size:file.size,kind,url:urlData?.publicUrl||null,preview:kind==='image'?URL.createObjectURL(file):null,error:null}
}

function FormationEditModal({ formation, workspaceId, onClose, onSaved, onDeleted, toast }) {
  useScrollLock()
  const [form,setForm]=useState({title:formation.title||'',price:String(formation.price??''),duration_label:formation.duration_label||'',description:formation.description||''})
  const [existingFiles,setExistingFiles]=useState(formation.files||[])
  const [newFiles,setNewFiles]=useState([])
  const [uploading,setUploading]=useState(false)
  const [saving,setSaving]=useState(false)
  const [confirmDelete,setConfirmDelete]=useState(false)
  useEffect(()=>{const h=e=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h)},[])
  async function handleFiles(e){const files=[...e.target.files];if(!files.length) return;setUploading(true);const results=await Promise.all(files.map(f=>uploadFormationFile(f,workspaceId)));if(results.filter(r=>r.error).length>0)toast('Upload failed');setNewFiles(prev=>[...prev,...results]);setUploading(false)}
  async function save(){
    setSaving(true)
    const finalFiles=[...existingFiles,...newFiles.filter(f=>f.url).map(({name,size,kind,url})=>({name,size,kind,url}))]
    const{error}=await supabase.from('offerings').update({title:form.title,price:parseFloat(form.price)||0,duration_label:form.duration_label,description:form.description,files:finalFiles}).eq('id',formation.id)
    setSaving(false);if(error){toast('Error saving.');return};toast(`"${form.title}" updated.`);onSaved();onClose()
  }
  async function deleteFormation(){await supabase.from('offerings').delete().eq('id',formation.id);toast(`"${formation.title}" deleted.`);onDeleted();onClose()}
  const iS={width:'100%',padding:'.58rem .82rem',border:'1px solid var(--border-2)',borderRadius:9,fontSize:'.84rem',fontFamily:'inherit',color:'var(--ink)',background:'var(--surface)',outline:'none',transition:'border .15s'}
  const allFiles=[...existingFiles,...newFiles.filter(f=>f.url)]
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.68)',zIndex:300,display:'flex',alignItems:'flex-end',justifyContent:'center',backdropFilter:'blur(4px)'}} onClick={onClose}>
      <div style={{background:'var(--surface)',borderRadius:'18px 18px 0 0',width:'100%',maxWidth:640,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 -16px 60px rgba(0,0,0,.25)',display:'flex',flexDirection:'column'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1.1rem 1.4rem',borderBottom:'1px solid var(--border)',flexShrink:0}}>
          <div><div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.15rem',fontWeight:500,color:'var(--ink)'}}>Edit formation</div><div style={{fontSize:'.72rem',color:'var(--ink-3)',marginTop:2}}>{formation.title}</div></div>
          <button onClick={onClose} style={{background:'var(--bg)',border:'1px solid var(--border)',width:30,height:30,borderRadius:'50%',cursor:'pointer',color:'var(--ink-3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.85rem'}}>✕</button>
        </div>
        <div style={{padding:'1.25rem 1.4rem',display:'flex',flexDirection:'column',gap:'1rem',overflowY:'auto'}}>
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'.75rem'}}>
            <div className="field"><label>Title</label><input style={iS} value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/></div>
            <div className="field"><label>Price (CAD)</label><input style={iS} type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:'.75rem'}}>
            <div className="field"><label>Duration</label><input style={iS} value={form.duration_label} onChange={e=>setForm(f=>({...f,duration_label:e.target.value}))} placeholder="e.g. 4h · 3 sessions" onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/></div>
            <div className="field"><label>Description</label><input style={iS} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/></div>
          </div>
          {allFiles.length>0&&(<div><div style={{fontSize:'.72rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'.55rem'}}>Files — click ✕ to remove</div><div style={{display:'flex',flexDirection:'column',gap:'.35rem'}}>{existingFiles.map((file,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:'.65rem',padding:'.5rem .85rem',background:'var(--bg)',borderRadius:9,border:'1px solid var(--border)'}}>{file.preview?<img src={file.preview} alt="" style={{width:34,height:34,objectFit:'cover',borderRadius:6,flexShrink:0}}/>:<span style={{fontSize:'1.1rem',flexShrink:0}}>{FILE_ICONS[file.kind]||FILE_ICONS.other}</span>}<div style={{flex:1,overflow:'hidden'}}><div style={{fontSize:'.8rem',fontWeight:500,color:'var(--ink)',textOverflow:'ellipsis',overflow:'hidden',whiteSpace:'nowrap'}}>{file.name}</div><div style={{fontSize:'.68rem',color:'var(--ink-3)'}}>{fmtBytes(file.size)}</div></div><a href={file.url} target="_blank" rel="noopener noreferrer" style={{fontSize:'.7rem',color:'var(--gold)',textDecoration:'none',fontWeight:500,padding:'2px 6px',border:'1px solid var(--gold-dim)',borderRadius:5}}>Open</a><button type="button" onClick={()=>setExistingFiles(prev=>prev.filter((_,idx)=>idx!==i))} style={{background:'rgba(192,57,43,.1)',border:'1px solid rgba(192,57,43,.2)',color:'var(--red)',width:24,height:24,borderRadius:'50%',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.65rem'}}>✕</button></div>))}</div></div>)}
          <div>
            <div style={{fontSize:'.72rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'.5rem'}}>Add or replace files</div>
            <label style={{display:'block',border:'2px dashed var(--border-2)',borderRadius:11,padding:'1rem',textAlign:'center',cursor:'pointer',transition:'all .15s',background:'var(--bg)'}} onMouseEnter={e=>e.currentTarget.style.borderColor='var(--gold)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-2)'}><input type="file" accept="image/*,video/*,application/pdf,.pdf" multiple style={{display:'none'}} onChange={handleFiles}/><div style={{fontSize:'1.2rem',marginBottom:'.2rem'}}>📎</div><div style={{fontSize:'.78rem',fontWeight:500,color:'var(--ink-2)'}}>{uploading?'Uploading…':'Click to upload PDF · image · video'}</div></label>
          </div>
          <div style={{display:'flex',gap:'.6rem',paddingTop:'.25rem',paddingBottom:'.5rem'}}>
            <button className="btn btn-primary" style={{flex:1,justifyContent:'center',padding:'.72rem'}} onClick={save} disabled={saving||uploading}>{saving?'Saving…':uploading?'Uploading…':'Save changes'}</button>
            {!confirmDelete?<button className="btn btn-xs" style={{color:'var(--red)',border:'1px solid rgba(192,57,43,.25)',background:'var(--surface)',padding:'.45rem 1rem'}} onClick={()=>setConfirmDelete(true)}>Delete</button>
              :<button className="btn btn-xs" style={{color:'#fff',background:'var(--red)',border:'none',padding:'.45rem 1rem'}} onClick={deleteFormation}>Confirm delete</button>}
          </div>
        </div>
      </div>
    </div>
  )
}

function Formations({ workspace, toast }) {
  const [data,setData]=useState([])
  const [showForm,setShowForm]=useState(false)
  const [form,setForm]=useState({title:'',price:'',duration_label:'',description:''})
  const [pendingFiles,setPendingFiles]=useState([])
  const [uploading,setUploading]=useState(false)
  const [saving,setSaving]=useState(false)
  const [selectMode,setSelectMode]=useState(false)
  const [selected,setSelected]=useState(new Set())
  const [showDotMenu,setShowDotMenu]=useState(false)
  const [deleting,setDeleting]=useState(false)
  const [editFormation,setEditFormation]=useState(null)
  useEffect(()=>{if(workspace)fetchData()},[workspace])
  async function fetchData(){const{data}=await supabase.from('offerings').select('*').eq('workspace_id',workspace.id).order('created_at',{ascending:false});setData(data||[])}
  function enterSelectMode(){setSelectMode(true);setSelected(new Set());setShowDotMenu(false);setShowForm(false)}
  function exitSelectMode(){setSelectMode(false);setSelected(new Set())}
  function toggleSelect(id){setSelected(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n})}
  async function deleteSelected(){if(!selected.size) return;setDeleting(true);await Promise.all([...selected].map(id=>supabase.from('offerings').delete().eq('id',id)));toast(`${selected.size} formation${selected.size>1?'s':''} deleted.`);setDeleting(false);exitSelectMode();fetchData()}
  async function handleFiles(e){const files=[...e.target.files];if(!files.length) return;setUploading(true);const results=await Promise.all(files.map(f=>uploadFormationFile(f,workspace.id)));if(results.filter(r=>r.error).length>0)toast('Upload failed');setPendingFiles(prev=>[...prev,...results]);setUploading(false)}
  async function add(e){
    e.preventDefault();setSaving(true)
    const filesData=pendingFiles.filter(f=>f.url).map(({name,size,kind,url})=>({name,size,kind,url}))
    await supabase.from('offerings').insert({workspace_id:workspace.id,title:form.title,price:parseFloat(form.price)||0,duration_label:form.duration_label,description:form.description,files:filesData})
    toast(`"${form.title}" created.`);setForm({title:'',price:'',duration_label:'',description:''});setPendingFiles([]);setShowForm(false);setSaving(false);fetchData()
  }
  const iS={width:'100%',padding:'.6rem .85rem',border:'1px solid var(--border-2)',borderRadius:9,fontSize:'.85rem',fontFamily:'inherit',color:'var(--ink)',background:'var(--surface)',outline:'none',transition:'border .15s'}
  return (
    <div>
      <div className="page-head">
        <div><div className="page-title">Formations</div><div className="page-sub">Monetize your expertise — courses, workshops, masterclasses</div></div>
        <div style={{display:'flex',gap:'.5rem',alignItems:'center',position:'relative'}}>
          {selectMode?(<><span style={{fontSize:'.8rem',color:'var(--ink-3)'}}>{selected.size} selected</span><button className="btn btn-xs" style={{color:'var(--red)',border:'1px solid rgba(192,57,43,.25)',background:'var(--surface)'}} onClick={deleteSelected} disabled={!selected.size||deleting}>{deleting?'Deleting…':`Delete ${selected.size||''}`}</button><button className="btn btn-secondary btn-sm" onClick={exitSelectMode}>Cancel</button></>):(
            <><button className="btn btn-primary" onClick={()=>{setShowForm(s=>!s);setSelectMode(false)}}>{showForm?'Cancel':'Create formation'}</button>
            <div style={{position:'relative'}}>
              <button className="btn btn-secondary btn-sm" style={{padding:'.35rem .6rem',fontSize:'1rem'}} onClick={()=>setShowDotMenu(s=>!s)}>⋮</button>
              {showDotMenu&&(<><div style={{position:'fixed',inset:0,zIndex:98}} onClick={()=>setShowDotMenu(false)}/><div style={{position:'absolute',right:0,top:'calc(100% + 6px)',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,boxShadow:'0 8px 24px rgba(0,0,0,.12)',minWidth:175,zIndex:99,overflow:'hidden'}}><div style={{padding:'.65rem 1rem',fontSize:'.82rem',color:'var(--red)',cursor:'pointer',display:'flex',alignItems:'center',gap:'.5rem'}} onClick={enterSelectMode}>☑ Select to delete</div></div></>)}
            </div></>
          )}
        </div>
      </div>
      {showForm&&!selectMode&&(
        <div className="card" style={{marginBottom:'1.25rem'}}>
          <div className="card-head"><div><div className="card-title">New formation</div><div className="card-sub">Share your knowledge. Set your price. Own your revenue.</div></div></div>
          <form onSubmit={add} className="card-body" style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'1rem'}}>
              <div className="field"><label>Formation title</label><input style={iS} value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Box Braids Masterclass" required onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/></div>
              <div className="field"><label>Price (CAD)</label><input style={iS} type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="149" required onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:'1rem'}}>
              <div className="field"><label>Duration</label><input style={iS} value={form.duration_label} onChange={e=>setForm(f=>({...f,duration_label:e.target.value}))} placeholder="e.g. 4h · 3 sessions" onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/></div>
              <div className="field"><label>Description</label><input style={iS} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="What students will learn..." onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/></div>
            </div>
            <div>
              <div style={{fontSize:'.78rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'.6rem'}}>Course content — PDFs, images, videos</div>
              <label style={{display:'block',border:'2px dashed var(--border-2)',borderRadius:12,padding:'1.25rem',textAlign:'center',cursor:'pointer',transition:'all .15s',background:'var(--bg)'}} onMouseEnter={e=>e.currentTarget.style.borderColor='var(--gold)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-2)'}><input type="file" accept="image/*,video/*,application/pdf,.pdf" multiple style={{display:'none'}} onChange={handleFiles}/><div style={{fontSize:'1.5rem',marginBottom:'.35rem'}}>📚</div><div style={{fontSize:'.82rem',fontWeight:500,color:'var(--ink-2)'}}>{uploading?'Uploading…':'Upload course materials'}</div><div style={{fontSize:'.72rem',color:'var(--ink-3)',marginTop:'.2rem'}}>PDF guides · tutorial photos · intro videos</div></label>
              {pendingFiles.length>0&&(<div style={{display:'flex',flexDirection:'column',gap:'.4rem',marginTop:'.65rem'}}>{pendingFiles.map((f,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:'.65rem',padding:'.55rem .85rem',background:'var(--bg)',borderRadius:9,border:`1px solid ${f.error?'var(--red)':'var(--border)'}`}}>{f.preview?<img src={f.preview} alt="" style={{width:38,height:38,objectFit:'cover',borderRadius:6,flexShrink:0}}/>:<span style={{fontSize:'1.2rem',flexShrink:0}}>{FILE_ICONS[f.kind]||FILE_ICONS.other}</span>}<div style={{flex:1,overflow:'hidden'}}><div style={{fontSize:'.8rem',fontWeight:500,color:f.error?'var(--red)':'var(--ink)',textOverflow:'ellipsis',overflow:'hidden',whiteSpace:'nowrap'}}>{f.name}</div><div style={{fontSize:'.7rem',color:'var(--ink-3)'}}>{f.error?f.error:fmtBytes(f.size)}</div></div>{f.url&&<span style={{fontSize:'.7rem',color:'var(--green)',fontWeight:600}}>✓</span>}<button type="button" onClick={()=>setPendingFiles(prev=>prev.filter((_,idx)=>idx!==i))} style={{background:'none',border:'none',cursor:'pointer',color:'var(--ink-3)',fontSize:'.85rem',padding:'2px'}}>✕</button></div>))}</div>)}
            </div>
            <button type="submit" className="btn btn-primary" style={{justifyContent:'center',padding:'.75rem'}} disabled={saving||uploading}>{uploading?'Uploading…':saving?'Saving…':'Create formation'}</button>
          </form>
        </div>
      )}
      {selectMode&&data.length>0&&(<div style={{background:'var(--gold-lt)',border:'1px solid var(--gold-dim)',borderRadius:10,padding:'.65rem 1rem',marginBottom:'1rem',fontSize:'.8rem',color:'var(--ink-2)'}}>Tap formations to select, then hit Delete.<button style={{marginLeft:'.75rem',fontSize:'.75rem',color:'var(--gold)',fontWeight:600,background:'none',border:'none',cursor:'pointer'}} onClick={()=>setSelected(new Set(data.map(f=>f.id)))}>Select all ({data.length})</button></div>)}
      <div className="card">
        {data.length===0?<div className="empty-state"><div className="empty-icon">{I.grad}</div><div className="empty-title">Monetize your expertise</div><div className="empty-sub">Create your first course or workshop and start earning from your knowledge.</div></div>
          :data.map(f=>{
            const isSelected=selected.has(f.id)
            return (
              <div key={f.id} className="formation-row" onClick={()=>selectMode?toggleSelect(f.id):setEditFormation(f)}
                style={{cursor:'pointer',background:isSelected?'var(--gold-lt)':'',transition:'background .12s,box-shadow .12s',position:'relative'}}
                onMouseEnter={e=>{if(!selectMode)e.currentTarget.style.boxShadow='inset 3px 0 0 var(--gold)'}} onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
                {selectMode&&(<div style={{width:22,height:22,borderRadius:6,border:`2px solid ${isSelected?'var(--gold)':'var(--border-2)'}`,background:isSelected?'var(--gold)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all .12s',marginRight:'.5rem'}}>{isSelected&&<svg viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.5" width="10" height="10"><polyline points="1.5,5 4,7.5 8.5,2.5"/></svg>}</div>)}
                {!selectMode&&<div className="formation-icon-block">{I.grad}</div>}
                <div className="formation-info">
                  <div style={{display:'flex',alignItems:'center',gap:'.5rem'}}>
                    <div className="formation-name">{f.title}</div>
                    {!selectMode&&<span style={{fontSize:'.68rem',color:'var(--ink-3)',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:4,padding:'1px 6px'}}>✏️ Edit</span>}
                  </div>
                  <div className="formation-desc">{f.description}</div>
                  <div style={{display:'flex',gap:'.6rem',marginTop:'.4rem',flexWrap:'wrap',alignItems:'center'}}>
                    {f.duration_label&&<div className="formation-meta"><span>{f.duration_label}</span></div>}
                    {(f.files||[]).length>0&&(<div style={{display:'flex',gap:'.25rem',flexWrap:'wrap'}}>{(f.files||[]).slice(0,4).map((file,fi)=>(<a key={fi} href={file.url} target="_blank" rel="noopener noreferrer" title={file.name} onClick={e=>e.stopPropagation()} style={{display:'inline-flex',alignItems:'center',gap:'.2rem',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:6,padding:'2px 7px',fontSize:'.68rem',color:'var(--ink-2)',textDecoration:'none'}} onMouseEnter={e=>e.currentTarget.style.borderColor='var(--gold)'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>{FILE_ICONS[file.kind]||FILE_ICONS.other} {file.name.length>14?file.name.slice(0,14)+'…':file.name}</a>))}{(f.files||[]).length>4&&<span style={{fontSize:'.68rem',color:'var(--ink-3)',alignSelf:'center'}}>+{f.files.length-4} more</span>}</div>)}
                  </div>
                </div>
                <div className="formation-price">{fmtRev(f.price)}</div>
              </div>
            )
          })}
      </div>
      {editFormation&&!selectMode&&(<FormationEditModal formation={editFormation} workspaceId={workspace.id} onClose={()=>setEditFormation(null)} onSaved={fetchData} onDeleted={fetchData} toast={toast}/>)}
    </div>
  )
}

// ── CLIENTS ────────────────────────────────────────────────────────────────────
function ClientHistoryPanel({ client, workspace, onClose }) {
  useScrollLock()
  const [appts,setAppts]=useState([])
  const [loading,setLoading]=useState(true)
  const [tag,setTag]=useState(client.tag||'')
  const [savingTag,setSavingTag]=useState(false)
  useEffect(()=>{
    supabase.from('appointments').select('*, services(name)').eq('workspace_id',workspace.id)
      .eq('client_name',client.full_name).order('scheduled_at',{ascending:false})
      .then(({data})=>{setAppts(data||[]);setLoading(false)})
  },[client.id])
  async function saveTag(newTag){
    setSavingTag(true)
    await supabase.from('clients').update({tag:newTag||null}).eq('id',client.id)
    setTag(newTag);setSavingTag(false)
  }
  const initial=client.full_name?.charAt(0)?.toUpperCase()||'?'
  const tags=[{v:'',label:'None'},{v:'new',label:'New'},{v:'regular',label:'Regular'},{v:'vip',label:'VIP'}]
  return (
    <div className="rev-overlay" onClick={onClose}>
      <div className="rev-panel" style={{maxHeight:'92vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
        <div className="rev-panel-head">
          <div style={{display:'flex',alignItems:'center',gap:'.85rem'}}>
            <div style={{width:44,height:44,borderRadius:'50%',background:'var(--gold-lt)',border:'1px solid var(--gold-dim)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',color:'var(--gold)',flexShrink:0}}>{initial}</div>
            <div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.15rem',color:'var(--ink)'}}>{client.full_name}</div>
              <div style={{fontSize:'.72rem',color:'var(--ink-3)',marginTop:1}}>
                {client.total_visits||0} visit{client.total_visits!==1?'s':''} · {fmtRev(client.total_spent||0)} spent
              </div>
            </div>
          </div>
          <button className="rev-close" onClick={onClose}>&#10005;</button>
        </div>
        {/* Contact info */}
        {(client.email||client.phone)&&(
          <div style={{display:'flex',gap:'.5rem',marginBottom:'1rem',flexWrap:'wrap'}}>
            {client.phone&&<a href={`tel:${client.phone}`} className="btn btn-secondary btn-sm" style={{textDecoration:'none'}}>📞 {client.phone}</a>}
            {client.email&&<a href={`mailto:${client.email}`} className="btn btn-secondary btn-sm" style={{textDecoration:'none'}}>✉ {client.email}</a>}
          </div>
        )}
        {/* Tag */}
        <div style={{marginBottom:'1.25rem'}}>
          <div style={{fontSize:'.7rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:'.5rem'}}>Client tag</div>
          <div style={{display:'flex',gap:'.4rem',flexWrap:'wrap'}}>
            {tags.map(t=>(
              <button key={t.v} onClick={()=>saveTag(t.v)} disabled={savingTag}
                style={{padding:'.3rem .8rem',borderRadius:20,border:'1.5px solid',fontSize:'.75rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit',transition:'all .14s',
                  borderColor:tag===t.v?'var(--gold)':'var(--border-2)',
                  background:tag===t.v?'var(--gold-lt)':'var(--surface)',
                  color:tag===t.v?'var(--gold)':'var(--ink-3)'}}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        {/* Appointment history */}
        <div>
          <div style={{fontSize:'.7rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:'.65rem'}}>Appointment history</div>
          {loading?<div style={{fontSize:'.82rem',color:'var(--ink-3)'}}>Loading...</div>
            :appts.length===0?<div style={{fontSize:'.82rem',color:'var(--ink-3)'}}>No appointments yet.</div>
            :appts.map(a=>(
              <div key={a.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'.75rem .85rem',background:'var(--bg)',borderRadius:10,marginBottom:'.5rem'}}>
                <div>
                  <div style={{fontWeight:500,fontSize:'.85rem',color:'var(--ink)'}}>{a.services?.name||a.service_name||'—'}</div>
                  <div style={{fontSize:'.72rem',color:'var(--ink-3)',marginTop:2}}>
                    {new Date(a.scheduled_at).toLocaleDateString('en-CA',{month:'short',day:'numeric',year:'numeric'})} · {new Date(a.scheduled_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                  </div>
                </div>
                <div style={{display:'flex',gap:'.5rem',alignItems:'center',flexShrink:0}}>
                  <span style={{fontFamily:"'Playfair Display',serif",fontSize:'.9rem',color:'var(--ink)'}}>{fmtRev(a.amount)}</span>
                  <span className={`badge badge-${a.status}`}>{a.status}</span>
                </div>
              </div>
            ))
          }
        </div>
        {client.last_visit_at&&(
          <div style={{fontSize:'.72rem',color:'var(--ink-3)',textAlign:'center',marginTop:'1rem',paddingTop:'1rem',borderTop:'1px solid var(--border)'}}>
            Last visit: {new Date(client.last_visit_at).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}
          </div>
        )}
      </div>
    </div>
  )
}

function Clients({ workspace, lang='en' }) {
  const [data,setData]=useState([])
  const [loading,setLoading]=useState(true)
  const [selected,setSelected]=useState(null)
  const [search,setSearch]=useState('')
  useEffect(()=>{if(workspace)fetchData()},[workspace])
  async function fetchData(){
    const{data}=await supabase.from('clients').select('*').eq('workspace_id',workspace.id).order('total_spent',{ascending:false})
    setData(data||[]);setLoading(false)
  }
  const filtered=data.filter(c=>c.full_name?.toLowerCase().includes(search.toLowerCase()))
  const totalRevenue=data.reduce((s,c)=>s+Number(c.total_spent||0),0)
  const totalVisits=data.reduce((s,c)=>s+Number(c.total_visits||0),0)
  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">{t(lang,'clients_title')}</div>
          <div className="page-sub">{data.length} client{data.length!==1?'s':''} · {fmtRev(totalRevenue)} total · {totalVisits} visit{totalVisits!==1?'s':''}</div>
        </div>
      </div>
      {/* Search */}
      {data.length>3&&(
        <div style={{marginBottom:'1rem',position:'relative'}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search clients…"
            style={{width:'100%',padding:'.6rem .85rem .6rem 2.4rem',border:'1px solid var(--border-2)',borderRadius:10,fontSize:'.85rem',fontFamily:'inherit',color:'var(--ink)',background:'var(--surface)',outline:'none',transition:'border .15s'}}
            onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
          <span style={{position:'absolute',left:'.8rem',top:'50%',transform:'translateY(-50%)',fontSize:'.85rem',color:'var(--ink-3)'}}>🔍</span>
        </div>
      )}
      <div className="card">
        {loading?<div style={{padding:'2rem',color:'var(--ink-3)'}}>Loading...</div>
          :filtered.length===0?<div className="empty-state"><div className="empty-icon">{I.users}</div><div className="empty-title">{search?'No results':'No clients yet'}</div><div className="empty-sub">{search?'Try a different name':t(lang,'clients_appear')}</div></div>
          :filtered.map(c=>{
            const initial=c.full_name?.charAt(0)?.toUpperCase()||'?'
            const isTopSpender=data.indexOf(c)===0&&Number(c.total_spent)>0
            return (
              <div key={c.id} onClick={()=>setSelected(c)}
                style={{display:'flex',alignItems:'center',gap:'.85rem',padding:'1rem 1.25rem',borderBottom:'1px solid var(--border)',cursor:'pointer',transition:'background .12s'}}
                onMouseEnter={e=>e.currentTarget.style.background='var(--bg)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                {/* Avatar */}
                <div style={{width:38,height:38,borderRadius:'50%',background:isTopSpender?'var(--gold-lt)':'var(--bg)',border:`1.5px solid ${isTopSpender?'var(--gold-dim)':'var(--border)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Playfair Display',serif",fontSize:'.95rem',color:isTopSpender?'var(--gold)':'var(--ink-3)',flexShrink:0}}>
                  {initial}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:'.45rem'}}>
                    <div style={{fontWeight:600,fontSize:'.88rem',color:'var(--ink)'}}>{c.full_name}</div>
                    {c.tag&&<span className={`badge badge-${c.tag==='vip'?'vip':c.tag==='new'?'new':'confirmed'}`} style={{fontSize:'.6rem',padding:'.15rem .45rem'}}>{c.tag.toUpperCase()}</span>}
                    {isTopSpender&&<span style={{fontSize:'.6rem',color:'var(--gold)',fontWeight:700}}>⭐ Top</span>}
                  </div>
                  <div style={{fontSize:'.72rem',color:'var(--ink-3)',marginTop:2}}>
                    {c.total_visits||0} visit{c.total_visits!==1?'s':''} · {fmtRev(c.total_spent||0)} spent
                    {c.last_visit_at&&<span style={{marginLeft:'.4rem'}}>· last {new Date(c.last_visit_at).toLocaleDateString('en-CA',{month:'short',day:'numeric'})}</span>}
                  </div>
                </div>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" width="12" height="12" style={{color:'var(--ink-3)',flexShrink:0}}><path d="M6 3l5 5-5 5"/></svg>
              </div>
            )
          })}
      </div>
      {selected&&<ClientHistoryPanel client={selected} workspace={workspace} onClose={()=>{setSelected(null);fetchData()}}/>}
    </div>
  )
}

// ── AVAILABILITY (FIX 10: fix overlap, proper flex layout) ────────────────────
function Availability({ workspace, toast, lang='en' }) {
  const [schedule,setSchedule]=useState([])
  const [blockedDates,setBlockedDates]=useState([])
  const [blockInput,setBlockInput]=useState({date:'',reason:''})
  const [loading,setLoading]=useState(true)
  const dayNames=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  useEffect(()=>{if(workspace)fetchData()},[workspace])
  async function fetchData(){
    const[a,b]=await Promise.all([
      supabase.from('availability').select('*').eq('workspace_id',workspace.id).order('day_of_week'),
      supabase.from('blocked_dates').select('*').eq('workspace_id',workspace.id).order('blocked_date'),
    ])
    let avail=a.data||[]
    if(avail.length===0){
      const defaults=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map((_,i)=>({workspace_id:workspace.id,day_of_week:i,is_open:i>=1&&i<=5,open_time:'09:00:00',close_time:'18:00:00'}))
      const{data:created}=await supabase.from('availability').insert(defaults).select();avail=created||[]
    }
    setSchedule(avail);setBlockedDates(b.data||[]);setLoading(false)
  }
  async function toggleDay(id,cur){
    // Optimistic update — instant UI response before DB confirms
    setSchedule(prev=>prev.map(d=>d.id===id?{...d,is_open:!cur}:d))
    const{error}=await supabase.from('availability').update({is_open:!cur}).eq('id',id)
    if(error){
      // Revert if failed
      setSchedule(prev=>prev.map(d=>d.id===id?{...d,is_open:cur}:d))
      toast('Error updating schedule.')
    } else {
      const dayName=dayNames[schedule.find(d=>d.id===id)?.day_of_week||0]
      toast(`${dayName} marked as ${!cur?'Open':'Closed'}.`)
    }
  }
  async function updateTime(id,field,val){
    // Optimistic update for time inputs too
    setSchedule(prev=>prev.map(d=>d.id===id?{...d,[field]:val}:d))
    await supabase.from('availability').update({[field]:val}).eq('id',id)
  }
  async function addBlock(e){
    e.preventDefault();if(!blockInput.date) return
    await supabase.from('blocked_dates').insert({workspace_id:workspace.id,blocked_date:blockInput.date,reason:blockInput.reason})
    toast('Date blocked.');setBlockInput({date:'',reason:''});fetchData()
  }
  async function removeBlock(id){await supabase.from('blocked_dates').delete().eq('id',id);toast('Date unblocked.');fetchData()}
  if(loading) return <div style={{padding:'2rem',color:'var(--ink-3)'}}>Loading...</div>
  return (
    <div>
      <div className="page-head"><div><div className="page-title">{t(lang,'avail_title')}</div><div className="page-sub">{t(lang,'avail_sub')}</div></div></div>
      <div className="card" style={{marginBottom:'1.25rem'}}>
        <div className="card-head"><div className="card-title">Weekly schedule</div></div>
        <div style={{padding:'0 1.4rem'}}>
          {schedule.map(day=>(
            <div key={day.id} style={{display:'flex',alignItems:'center',gap:'.75rem',padding:'.9rem 0',borderBottom:'1px solid var(--border)',flexWrap:'nowrap'}}>
              {/* FIX 10: fixed width day name */}
              <div style={{width:90,fontWeight:500,fontSize:'.85rem',color:'var(--ink)',flexShrink:0}}>{dayNames[day.day_of_week]}</div>
              {/* FIX 10: toggle button */}
              <button
                onClick={()=>toggleDay(day.id,day.is_open)}
                style={{
                  minWidth:80,padding:'.38rem .9rem',borderRadius:20,border:'2px solid',
                  fontSize:'.78rem',fontWeight:700,cursor:'pointer',fontFamily:'inherit',
                  transition:'all .18s',flexShrink:0,letterSpacing:'.02em',
                  borderColor:day.is_open?'#1a1814':'var(--border-2)',
                  background:day.is_open?'#1a1814':'transparent',
                  color:day.is_open?'#fff':'var(--ink-3)',
                  boxShadow:day.is_open?'0 2px 8px rgba(0,0,0,.15)':'none'
                }}>
                {day.is_open?t(lang,'open'):t(lang,'closed')}
              </button>
              {/* FIX 10: time inputs only when open, properly contained */}
              {day.is_open&&(
                <div style={{display:'flex',alignItems:'center',gap:'.4rem',flex:1,minWidth:0}}>
                  <input type="time" value={day.open_time?.slice(0,5)||'09:00'} className="avail-time"
                    onChange={e=>updateTime(day.id,'open_time',e.target.value)}
                    style={{minWidth:0,flex:1}}/>
                  <span style={{color:'var(--ink-3)',fontSize:'.75rem',flexShrink:0}}>–</span>
                  <input type="time" value={day.close_time?.slice(0,5)||'18:00'} className="avail-time"
                    onChange={e=>updateTime(day.id,'close_time',e.target.value)}
                    style={{minWidth:0,flex:1}}/>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="card-head"><div className="card-title">Blocked dates</div></div>
        <form onSubmit={addBlock} style={{padding:'1.1rem 1.4rem',display:'flex',flexDirection:'column',gap:'.65rem',borderBottom:'1px solid var(--border)'}}>
          <div className="field"><label>Date</label><input type="date" value={blockInput.date} onChange={e=>setBlockInput(f=>({...f,date:e.target.value}))} required/></div>
          <div className="field"><label>Reason (optional)</label><input value={blockInput.reason} onChange={e=>setBlockInput(f=>({...f,reason:e.target.value}))} placeholder="Vacation, training..."/></div>
          <button type="submit" className="btn btn-primary" style={{justifyContent:'center',padding:'.65rem'}}>Block date</button>
        </form>
        {blockedDates.length===0?<div className="empty-state"><div className="empty-title" style={{fontSize:'.85rem'}}>No blocked dates</div></div>
          :blockedDates.map(b=>(
            <div key={b.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'.85rem 1.4rem',borderBottom:'1px solid var(--border)'}}>
              <div>
                <div style={{fontWeight:500,fontSize:'.85rem',color:'var(--ink)'}}>{new Date(b.blocked_date+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
                {b.reason&&<div style={{fontSize:'.75rem',color:'var(--ink-3)',marginTop:2}}>{b.reason}</div>}
              </div>
              <button className="btn btn-xs" style={{color:'var(--red)',border:'1px solid rgba(192,57,43,.2)',background:'var(--surface)'}} onClick={()=>removeBlock(b.id)}>Unblock</button>
            </div>
          ))}
      </div>
    </div>
  )
}

// ── SETTINGS (FIX 11: cancel subscription button in profile) ─────────────────
function Settings({ workspace, toast, refetch, theme, setTheme, session, ownerData, lang='en' }) {
  const [section,setSection]=useState(null)
  const BackBtn=()=>(
    <button className="settings-back-btn" onClick={()=>setSection(null)}>
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" width="13" height="13"><path d="M10 3L5 8l5 5"/></svg> Settings
    </button>
  )
  const sections=[
    {key:'profile',label:t(lang,'profile'),sub:t(lang,'profile_sub')},
    {key:'business',label:t(lang,'business'),sub:t(lang,'business_sub')},
    {key:'appearance',label:t(lang,'appearance'),sub:t(lang,'appearance_sub')},
    {key:'language',label:t(lang,'language'),sub:t(lang,'language_sub')},
  ]
  if(section==='profile') return (
    <div>
      <div className="page-head"><div><BackBtn/><div className="page-title" style={{marginTop:'.4rem'}}>{t(lang,'profile')}</div></div></div>
      <div className="card" style={{marginBottom:'1.25rem'}}>
        <div className="card-head"><div className="card-title">Personal information</div></div>
        <SettingsProfileForm session={session} ownerData={ownerData} toast={toast} refetch={refetch} lang={lang}/>
      </div>
      <div className="card" style={{marginBottom:'1.25rem'}}>
        <div className="card-head"><div className="card-title">Password</div></div>
        <SettingsPasswordForm session={session} toast={toast} lang={lang}/>
      </div>
      {/* FIX 11: Cancel subscription */}
      <CancelSubscriptionCard toast={toast} lang={lang}/>
    </div>
  )
  if(section==='business') return (
    <div>
      <div className="page-head">
        <div><BackBtn/><div className="page-title" style={{marginTop:'.4rem'}}>{t(lang,'business')}</div></div>
        <button className="btn btn-secondary btn-sm" onClick={async()=>{await supabase.from('workspaces').update({is_published:!workspace.is_published}).eq('id',workspace.id);toast(workspace.is_published?'Profile unpublished.':'Profile is now live!');refetch()}}>{workspace?.is_published?t(lang,'unpublish'):t(lang,'publish')}</button>
      </div>
      <SettingsBusinessForm workspace={workspace} toast={toast} refetch={refetch} lang={lang}/>
    </div>
  )
  if(section==='appearance') return (
    <div>
      <div className="page-head"><div><BackBtn/><div className="page-title" style={{marginTop:'.4rem'}}>{t(lang,'appearance')}</div></div></div>
      <div className="card">
        <div className="card-head"><div className="card-title">Theme</div></div>
        <div className="card-body">
          <div style={{fontSize:'.78rem',color:'var(--ink-3)',marginBottom:'1rem'}}>Choose how Organized appears for you.</div>
          <div className="theme-options">
            <div className={`theme-option${theme!=='dark'?' selected':''}`} onClick={()=>setTheme('light')}>
              <div className="theme-preview"><div className="tp-ls"/><div className="tp-lm"><div className="tp-lb"/><div className="tp-lb"/></div></div>
              <div className="theme-label">Light {theme!=='dark'&&<div className="theme-check">{I.check}</div>}</div>
            </div>
            <div className={`theme-option${theme==='dark'?' selected':''}`} onClick={()=>setTheme('dark')}>
              <div className="theme-preview"><div className="tp-ds"/><div className="tp-dm"><div className="tp-db"/><div className="tp-db"/></div></div>
              <div className="theme-label">Dark {theme==='dark'&&<div className="theme-check">{I.check}</div>}</div>
            </div>
          </div>
          <div className="settings-row" style={{marginTop:'1rem'}}>
            <div className="settings-row-label">Dark mode</div>
            <label className="toggle-wrap"><input type="checkbox" checked={theme==='dark'} onChange={e=>setTheme(e.target.checked?'dark':'light')}/><div className="toggle-track"/><div className="toggle-thumb"/></label>
          </div>
        </div>
      </div>
    </div>
  )
  if(section==='language') return (
    <div>
      <div className="page-head"><div><BackBtn/><div className="page-title" style={{marginTop:'.4rem'}}>{t(lang,'language')}</div></div></div>
      <SettingsLanguageForm ownerData={ownerData} toast={toast} refetch={refetch} lang={lang}/>
    </div>
  )
  return (
    <div>
      <div className="page-head"><div><div className="page-title">{t(lang,'settings_title')}</div><div className="page-sub">{t(lang,'settings_sub')}</div></div></div>
      <div className="card">
        {sections.map((s,i)=>(
          <div key={s.key} className="settings-section-row" style={{borderBottom:i<sections.length-1?'1px solid var(--border)':'none'}} onClick={()=>setSection(s.key)}>
            <div><div className="settings-section-label">{s.label}</div><div className="settings-section-sub">{s.sub}</div></div>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" width="14" height="14" style={{color:'var(--ink-3)',flexShrink:0}}><path d="M6 3l5 5-5 5"/></svg>
          </div>
        ))}
      </div>
    </div>
  )
}

// FIX 11: Cancel subscription card
function CancelSubscriptionCard({ toast, lang='en' }) {
  const [showConfirm,setShowConfirm]=useState(false)
  const [cancelling,setCancelling]=useState(false)
  async function cancel(){
    setCancelling(true)
    // Placeholder — connect to your billing provider (Stripe, etc.)
    await new Promise(r=>setTimeout(r,1200))
    setCancelling(false);setShowConfirm(false)
    toast('A cancellation request has been sent. We will contact you shortly.')
  }
  return (
    <div className="card" style={{border:'1px solid rgba(192,57,43,.2)'}}>
      <div className="card-head">
        <div>
          <div className="card-title" style={{color:'var(--red)'}}>{t(lang,'cancel_sub')}</div>
          <div className="card-sub">You can cancel your subscription at any time.</div>
        </div>
      </div>
      <div style={{padding:'1.25rem 1.4rem'}}>
        {!showConfirm?(
          <button className="btn btn-sm" style={{color:'var(--red)',border:'1px solid rgba(192,57,43,.3)',background:'rgba(192,57,43,.04)',justifyContent:'center',width:'100%',padding:'.7rem'}} onClick={()=>setShowConfirm(true)}>
            {t(lang,'cancel_sub')}
          </button>
        ):(
          <div>
            <div style={{fontSize:'.82rem',color:'var(--ink-2)',marginBottom:'1rem',lineHeight:1.6}}>{t(lang,'cancel_sub_confirm')} Your account will remain active until the end of your current billing period.</div>
            <div style={{display:'flex',gap:'.6rem'}}>
              <button className="btn btn-secondary" style={{flex:1,justifyContent:'center'}} onClick={()=>setShowConfirm(false)}>{t(lang,'keep_plan')}</button>
              <button className="btn btn-sm" style={{flex:1,justifyContent:'center',color:'var(--red)',border:'1px solid rgba(192,57,43,.3)',background:'rgba(192,57,43,.06)',padding:'.5rem'}} onClick={cancel} disabled={cancelling}>
                {cancelling?'Processing…':t(lang,'confirm_cancel')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SettingsProfileForm({ session, ownerData, toast, refetch, lang='en' }) {
  const [form,setForm]=useState({full_name:ownerData?.full_name||'',email:session?.user?.email||''})
  const [loading,setLoading]=useState(false),[saved,setSaved]=useState(false)
  useEffect(()=>{setForm(f=>({...f,full_name:ownerData?.full_name||''}))},[ownerData?.full_name])
  async function save(e){
    e.preventDefault();setLoading(true);setSaved(false)
    const uid=session?.user?.id
    if(uid){const{error}=await supabase.from('users').upsert({id:uid,full_name:form.full_name,email:session?.user?.email||''},{onConflict:'id'});if(error){toast('Error saving name: '+error.message);setLoading(false);return}}
    if(form.email&&form.email!==session?.user?.email){const{error}=await supabase.auth.updateUser({email:form.email});if(error){toast('Error updating email: '+error.message);setLoading(false);return}}
    setSaved(true);toast('Profile saved.');if(refetch) await refetch();setLoading(false)
  }
  return (
    <form onSubmit={save} className="card-body" style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
      <div className="field"><label>{t(lang,'full_name')}</label><input value={form.full_name} onChange={e=>setForm(f=>({...f,full_name:e.target.value}))} required/></div>
      <div className="field"><label>{t(lang,'email_addr')}</label><input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required/></div>
      <button type="submit" className="btn btn-primary" style={{justifyContent:'center',padding:'.75rem'}} disabled={loading}>{loading?t(lang,'saving'):saved?t(lang,'saved'):t(lang,'save')}</button>
    </form>
  )
}
function SettingsPasswordForm({ session, toast, lang='en' }) {
  const [pw,setPw]=useState(''),[loading,setLoading]=useState(false)
  async function save(e){e.preventDefault();setLoading(true);const{error}=await supabase.auth.updateUser({password:pw});if(error)toast(`Error: ${error.message}`);else{toast('Confirmation link sent to your email.');setPw('')};setLoading(false)}
  return (
    <form onSubmit={save} className="card-body" style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
      <div className="field"><label>New password</label><input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Minimum 8 characters" minLength={8} required/></div>
      <div style={{fontSize:'.76rem',color:'var(--ink-3)',lineHeight:1.55,padding:'.6rem .85rem',background:'var(--bg)',borderRadius:8}}>A confirmation link will be sent to your email before the change takes effect.</div>
      <button type="submit" className="btn btn-primary" style={{justifyContent:'center',padding:'.75rem'}} disabled={loading}>{loading?t(lang,'saving'):t(lang,'update_pw')}</button>
    </form>
  )
}
function SettingsBusinessForm({ workspace, toast, refetch, lang='en' }) {
  const [form,setForm]=useState({name:workspace?.name||'',tagline:workspace?.tagline||'',bio:workspace?.bio||'',location:workspace?.location||'',email:workspace?.email||'',phone:workspace?.phone||'',instagram:workspace?.instagram||'',tiktok:workspace?.tiktok||''})
  useEffect(()=>{if(workspace)setForm({name:workspace.name||'',tagline:workspace.tagline||'',bio:workspace.bio||'',location:workspace.location||'',email:workspace.email||'',phone:workspace.phone||'',instagram:workspace.instagram||'',tiktok:workspace.tiktok||''})},[workspace?.id])
  const [loading,setLoading]=useState(false),[saved,setSaved]=useState(false)
  async function save(e){
    e.preventDefault();if(!workspace?.id){toast('Workspace not loaded.');return};setLoading(true);setSaved(false)
    const{error}=await supabase.from('workspaces').update({name:form.name,tagline:form.tagline,bio:form.bio,location:form.location,email:form.email,phone:form.phone,instagram:form.instagram,tiktok:form.tiktok}).eq('id',workspace.id)
    if(error)toast(`Error: ${error.message}`);else{setSaved(true);toast('Business profile saved.');await refetch()};setLoading(false)
  }
  return (
    <div className="card">
      <div className="card-head"><div className="card-title">Business profile</div></div>
      <form onSubmit={save} className="card-body" style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
        <div className="field"><label>Business name</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required/></div>
        <div className="field"><label>Tagline</label><input value={form.tagline} onChange={e=>setForm(f=>({...f,tagline:e.target.value}))} placeholder="e.g. Natural Hair Specialist · Montreal, QC"/></div>
        <div className="field"><label>Bio</label><textarea value={form.bio} onChange={e=>setForm(f=>({...f,bio:e.target.value}))} rows={3} placeholder="Tell your clients about your work..." style={{padding:'.6rem .9rem',border:'1px solid var(--border-2)',borderRadius:8,fontFamily:'inherit',fontSize:'.88rem',resize:'vertical',outline:'none',color:'var(--ink)',background:'var(--surface)'}}/></div>
        <div className="field"><label>Location</label><input value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))}/></div>
        <div style={{height:1,background:'var(--border)',margin:'.15rem 0'}}/>
        <div style={{fontSize:'.68rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.08em'}}>Contact</div>
        <div className="field"><label>Business email</label><input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/></div>
        <div className="field"><label>Phone</label><input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/></div>
        <div style={{height:1,background:'var(--border)',margin:'.15rem 0'}}/>
        <div style={{fontSize:'.68rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.08em'}}>Social</div>
        <div className="field"><label>Instagram</label><input value={form.instagram} onChange={e=>setForm(f=>({...f,instagram:e.target.value}))} placeholder="@yourstudio"/></div>
        <div className="field"><label>TikTok</label><input value={form.tiktok} onChange={e=>setForm(f=>({...f,tiktok:e.target.value}))} placeholder="@yourstudio"/></div>
        <button type="submit" className="btn btn-primary" style={{justifyContent:'center',padding:'.75rem'}} disabled={loading}>{loading?t(lang,'saving'):saved?t(lang,'saved'):t(lang,'save')}</button>
      </form>
    </div>
  )
}
function SettingsLanguageForm({ ownerData, toast, refetch, lang='en' }) {
  const [selectedLang,setSelectedLang]=useState(ownerData?.language||'en')
  const [saved,setSaved]=useState(false),[loading,setLoading]=useState(false)
  const langs=[{key:'en',label:'English',region:'United States / Canada'},{key:'fr',label:'Français',region:'France / Canada'},{key:'es',label:'Español',region:'España / Latinoamérica'}]
  async function save(){
    setLoading(true);setSaved(false)
    const uid=ownerData?.id||null
    if(uid){const{error}=await supabase.from('users').update({language:selectedLang}).eq('id',uid);if(error){toast('Error saving language: '+error.message);setLoading(false);return}}
    setSaved(true);toast('Language saved.');if(refetch) await refetch();setLoading(false)
  }
  return (
    <div className="card">
      <div className="card-head"><div className="card-title">{t(lang,'display_lang')}</div></div>
      <div style={{padding:'1rem 1.4rem',display:'flex',flexDirection:'column',gap:'.5rem'}}>
        {langs.map(l=>(<div key={l.key} className={`lang-row${selectedLang===l.key?' lang-active':''}`} onClick={()=>setSelectedLang(l.key)}><div><div className="lang-label">{l.label}</div><div className="lang-sub">{l.region}</div></div><div className={`lang-check-circle${selectedLang===l.key?' lang-check-active':''}`}>{selectedLang===l.key&&<svg viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.5" width="10" height="10"><polyline points="1.5,5 4,7.5 8.5,2.5"/></svg>}</div></div>))}
        <button className="btn btn-primary" style={{justifyContent:'center',padding:'.75rem',marginTop:'.5rem'}} onClick={save} disabled={loading}>{loading?t(lang,'saving'):saved?t(lang,'saved'):t(lang,'save_lang')}</button>
      </div>
    </div>
  )
}

// ── BOOKING MODAL — public client booking form ────────────────────────────────
function BookingModal({ service, workspace, onClose }) {
  const [form,setForm]=useState({name:'',phone:'',email:'',date:'',time:'',notes:''})
  const [saving,setSaving]=useState(false)
  const [done,setDone]=useState(false)
  const [error,setError]=useState('')
  const iS={width:'100%',padding:'.6rem .85rem',border:'1.5px solid #e8e4de',borderRadius:10,fontSize:'.88rem',fontFamily:'inherit',color:'#1a1814',background:'#fff',outline:'none',transition:'border .15s'}
  async function submit(){
    if(!form.name.trim()||!form.date||!form.time){setError('Please fill in name, date and time.');return}
    setSaving(true);setError('')
    const[h,m]=form.time.split(':')
    const dt=new Date(form.date+'T00:00:00');dt.setHours(parseInt(h),parseInt(m),0,0)
    const{error:err}=await supabase.from('appointments').insert({
      workspace_id:workspace.id,
      client_name:form.name.trim(),
      client_phone:form.phone.trim()||null,
      client_email:form.email.trim()||null,
      service_id:service.id,
      service_name:service.name,
      scheduled_at:dt.toISOString(),
      amount:service.price||0,
      status:'pending',
      notes:form.notes.trim()||null,
    })
    setSaving(false)
    if(err){setError('Something went wrong. Please try again.');return}
    setDone(true)
  }
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:200,display:'flex',alignItems:'flex-end',justifyContent:'center'}} onClick={onClose}>
      <div style={{background:'#fff',borderRadius:'20px 20px 0 0',width:'100%',maxWidth:480,maxHeight:'92vh',overflowY:'auto',boxShadow:'0 -8px 48px rgba(0,0,0,.18)'}} onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div style={{padding:'1.25rem 1.5rem',borderBottom:'1px solid #f0ece4',display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',color:'#1a1814'}}>{service.name}</div>
            <div style={{fontSize:'.78rem',color:'#7a7774',marginTop:3}}>
              {service.duration_min&&`${service.duration_min} min · `}{service.price>0?`$${service.price}`:service.price===0?'Free':''}
            </div>
          </div>
          <button onClick={onClose} style={{background:'#f5f3ef',border:'none',width:30,height:30,borderRadius:'50%',cursor:'pointer',color:'#7a7774',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.85rem'}}>✕</button>
        </div>
        <div style={{padding:'1.5rem'}}>
          {done?(
            <div style={{textAlign:'center',padding:'1.5rem 0'}}>
              <div style={{fontSize:'2rem',marginBottom:'.75rem'}}>✅</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.15rem',color:'#1a1814',marginBottom:'.4rem'}}>Request sent!</div>
              <div style={{fontSize:'.82rem',color:'#7a7774',lineHeight:1.6,marginBottom:'1.5rem'}}>
                {workspace?.name||'Your stylist'} will confirm your appointment shortly.
              </div>
              <button onClick={onClose} style={{background:'#1a1814',color:'#fff',border:'none',borderRadius:10,padding:'.65rem 1.5rem',fontSize:'.85rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Done</button>
            </div>
          ):(
            <div style={{display:'flex',flexDirection:'column',gap:'.85rem'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.65rem'}}>
                <div className="field" style={{gridColumn:'1/-1'}}>
                  <label style={{fontSize:'.72rem',fontWeight:600,color:'#7a7774',textTransform:'uppercase',letterSpacing:'.05em',display:'block',marginBottom:'.3rem'}}>Full name *</label>
                  <input style={iS} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Amara Diallo"
                    onFocus={e=>e.target.style.borderColor='#c5a96a'} onBlur={e=>e.target.style.borderColor='#e8e4de'}/>
                </div>
                <div className="field">
                  <label style={{fontSize:'.72rem',fontWeight:600,color:'#7a7774',textTransform:'uppercase',letterSpacing:'.05em',display:'block',marginBottom:'.3rem'}}>Date *</label>
                  <input type="date" style={iS} value={form.date} min={new Date().toISOString().split('T')[0]}
                    onChange={e=>setForm(f=>({...f,date:e.target.value}))}
                    onFocus={e=>e.target.style.borderColor='#c5a96a'} onBlur={e=>e.target.style.borderColor='#e8e4de'}/>
                </div>
                <div className="field">
                  <label style={{fontSize:'.72rem',fontWeight:600,color:'#7a7774',textTransform:'uppercase',letterSpacing:'.05em',display:'block',marginBottom:'.3rem'}}>Time *</label>
                  <input type="time" style={iS} value={form.time} onChange={e=>setForm(f=>({...f,time:e.target.value}))}
                    onFocus={e=>e.target.style.borderColor='#c5a96a'} onBlur={e=>e.target.style.borderColor='#e8e4de'}/>
                </div>
                <div className="field">
                  <label style={{fontSize:'.72rem',fontWeight:600,color:'#7a7774',textTransform:'uppercase',letterSpacing:'.05em',display:'block',marginBottom:'.3rem'}}>Phone</label>
                  <input type="tel" style={iS} value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="+1 (514) …"
                    onFocus={e=>e.target.style.borderColor='#c5a96a'} onBlur={e=>e.target.style.borderColor='#e8e4de'}/>
                </div>
                <div className="field">
                  <label style={{fontSize:'.72rem',fontWeight:600,color:'#7a7774',textTransform:'uppercase',letterSpacing:'.05em',display:'block',marginBottom:'.3rem'}}>Email</label>
                  <input type="email" style={iS} value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="client@email.com"
                    onFocus={e=>e.target.style.borderColor='#c5a96a'} onBlur={e=>e.target.style.borderColor='#e8e4de'}/>
                </div>
                <div className="field" style={{gridColumn:'1/-1'}}>
                  <label style={{fontSize:'.72rem',fontWeight:600,color:'#7a7774',textTransform:'uppercase',letterSpacing:'.05em',display:'block',marginBottom:'.3rem'}}>Notes</label>
                  <input style={iS} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Hair length, allergies, preferences…"
                    onFocus={e=>e.target.style.borderColor='#c5a96a'} onBlur={e=>e.target.style.borderColor='#e8e4de'}/>
                </div>
              </div>
              {error&&<div style={{fontSize:'.78rem',color:'#c0392b',background:'rgba(192,57,43,.06)',border:'1px solid rgba(192,57,43,.15)',borderRadius:8,padding:'.55rem .85rem'}}>{error}</div>}
              <div style={{display:'flex',gap:'.65rem',paddingTop:'.25rem',paddingBottom:'.5rem'}}>
                <button onClick={onClose} style={{flex:1,padding:'.7rem',background:'none',border:'1.5px solid #e8e4de',borderRadius:10,cursor:'pointer',fontFamily:'inherit',fontSize:'.85rem',color:'#7a7774'}}>Cancel</button>
                <button onClick={submit} disabled={saving}
                  style={{flex:2,padding:'.7rem',background:'#1a1814',color:'#fff',border:'none',borderRadius:10,cursor:'pointer',fontFamily:'inherit',fontSize:'.85rem',fontWeight:700,opacity:saving?.7:1}}>
                  {saving?'Sending…':'Send request'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── SHADER WAVE BACKGROUND ────────────────────────────────────────────────────
function ShaderWave() {
  const ref = useRef(null)
  const raf = useRef(null)
  useEffect(()=>{
    const canvas=ref.current; if(!canvas) return
    const gl=canvas.getContext('webgl')||canvas.getContext('experimental-webgl'); if(!gl) return
    const vs=`attribute vec2 a;void main(){gl_Position=vec4(a,0,1);}`
    const fs=`
      precision mediump float;
      uniform float t;uniform vec2 r;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
        return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
      float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(.8,.6,-.6,.8);
        for(int i=0;i<6;i++){v+=a*n(p);p=m*p*2.+vec2(100.);a*=.5;}return v;}
      void main(){
        vec2 uv=gl_FragCoord.xy/r;
        vec2 q=vec2(fbm(uv+.016*t),fbm(uv+vec2(1.)));
        vec2 s=vec2(fbm(uv+q+vec2(1.7,9.2)+.11*t),fbm(uv+q+vec2(8.3,2.8)+.09*t));
        float f=fbm(uv+s);
        vec3 a=vec3(.82,.72,.58),b=vec3(.62,.50,.36),c=vec3(.38,.30,.20);
        vec3 col=mix(c,b,clamp(f*f*3.5,0.,1.));
        col=mix(col,a,clamp(length(q)*.65,0.,1.));
        col=(f*f*f+.6*f*f+.5*f)*col*1.4;
        vec2 vig=uv*(1.-uv.yx);col*=pow(clamp(vig.x*vig.y*15.,0.,1.),.12);
        gl_FragColor=vec4(col,1.);
      }
    `
    function sh(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s}
    const prog=gl.createProgram()
    gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs))
    gl.linkProgram(prog);gl.useProgram(prog)
    const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf)
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW)
    const loc=gl.getAttribLocation(prog,'a');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0)
    const uT=gl.getUniformLocation(prog,'t'),uR=gl.getUniformLocation(prog,'r')
    function resize(){canvas.width=canvas.offsetWidth;canvas.height=canvas.offsetHeight;gl.viewport(0,0,canvas.width,canvas.height)}
    resize();window.addEventListener('resize',resize)
    const t0=performance.now()
    function draw(){gl.uniform1f(uT,(performance.now()-t0)/1000);gl.uniform2f(uR,canvas.width,canvas.height);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);raf.current=requestAnimationFrame(draw)}
    draw()
    return()=>{cancelAnimationFrame(raf.current);window.removeEventListener('resize',resize)}
  },[])
  return <canvas ref={ref} style={{position:'absolute',inset:0,width:'100%',height:'100%',display:'block'}}/>
}

// ── CLIENT PAGE ───────────────────────────────────────────────────────────────
function ClientPage({ workspace, onSwitchToDash }) {
  const [tab,setTab]=useState('book')
  const [services,setServices]=useState([])
  const [products,setProducts]=useState([])
  const [offerings,setOfferings]=useState([])
  const [reviews,setReviews]=useState([])
  const [portfolio,setPortfolio]=useState([])
  const [modal,setModal]=useState(null)
  const [productPage,setProductPage]=useState(null)
  const [learnPage,setLearnPage]=useState(null)
  const [bookForm,setBookForm]=useState({name:'',phone:'',date:'',time:'',notes:''})
  const [booking,setBooking]=useState(false)
  const [booked,setBooked]=useState(false)
  const [faqOpen,setFaqOpen]=useState(null)
  const [cpToast,setCpToast]=useState('')

  function cpNotify(msg){setCpToast(msg);setTimeout(()=>setCpToast(''),3000)}

  useEffect(()=>{
    if(!workspace) return
    Promise.all([
      supabase.from('services').select('*').eq('workspace_id',workspace.id).eq('is_active',true).order('display_order'),
      supabase.from('products').select('*').eq('workspace_id',workspace.id),
      supabase.from('offerings').select('*').eq('workspace_id',workspace.id),
      supabase.from('reviews').select('*').eq('workspace_id',workspace.id).eq('is_approved',true).order('created_at',{ascending:false}).limit(9),
      supabase.from('portfolio_photos').select('*').eq('workspace_id',workspace.id).order('display_order').limit(9),
    ]).then(([s,p,o,r,ph])=>{setServices(s.data||[]);setProducts(p.data||[]);setOfferings(o.data||[]);setReviews(r.data||[]);setPortfolio(ph.data||[])})
  },[workspace])
  const G='#c5a96a'
  const FAQ=[
    {q:'How do I reschedule or cancel?',a:'Contact the studio directly. Cancellations less than 24 hours before may incur a fee.'},
    {q:'What should I prepare before arriving?',a:'Arrive with clean, dry hair unless your service requires otherwise. Bring a reference photo if you have one.'},
    {q:'Are consultations available?',a:'Yes — recommended for first-time clients or complex colour work.'},
    {q:'What payment methods are accepted?',a:'Cash, debit, and major credit cards. E-transfer may be available — confirm when booking.'},
    {q:'How far in advance should I book?',a:'Standard services: 1–2 weeks. Colour or bridal: 3–4 weeks minimum.'},
  ]
  async function submitBooking(e){
    e.preventDefault(); if(!modal||!bookForm.date||!bookForm.time) return
    setBooking(true)
    await supabase.from('appointments').insert({
      workspace_id:workspace.id, client_name:bookForm.name, client_phone:bookForm.phone,
      notes:`Service: ${modal.name}.${bookForm.notes?' '+bookForm.notes:''}`,
      scheduled_at:new Date(`${bookForm.date}T${bookForm.time}:00`).toISOString(),
      amount:modal.price, status:'pending',
    })
    setBooked(true); setBooking(false)
  }
  const initial=workspace?.name?.charAt(0)?.toUpperCase()||'?'
  return (
    <div style={{background:'#faf8f5',minHeight:'100vh',fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"}}>

      {/* ═══ HERO — shader wave ══════════════════════════════════════════ */}
      <div style={{position:'relative',minHeight:440,display:'flex',flexDirection:'column'}}>
        <ShaderWave/>
        {/* Overlay for text legibility */}
        <div style={{position:'absolute',inset:0,pointerEvents:'none',background:'linear-gradient(to bottom,rgba(26,24,20,.5) 0%,rgba(26,24,20,.05) 40%,rgba(26,24,20,.55) 100%)'}}/>
        {/* Grain */}
        <div style={{position:'absolute',inset:0,pointerEvents:'none',opacity:.22,backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`}}/>

        {/* Nav inside hero */}
        <div style={{position:'relative',zIndex:2,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'.9rem 1.25rem'}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1rem',color:'rgba(255,255,255,.85)',fontWeight:500,letterSpacing:'0.04em'}}>
            Organized.<span style={{fontWeight:300,fontSize:'.78rem',color:'rgba(255,255,255,.45)',marginLeft:5}}>by {workspace?.name||'Studio'}</span>
          </div>
          <div style={{display:'flex',gap:'.5rem',alignItems:'center'}}>
            {workspace?.instagram&&(
              <button className="cp-ghost" style={{color:'rgba(255,255,255,.6)',borderColor:'rgba(255,255,255,.15)',background:'rgba(255,255,255,.05)'}}
                onClick={()=>window.open(`https://instagram.com/${workspace.instagram.replace('@','')}`)}>Instagram</button>
            )}
            {/* Toggle: only shown in preview mode */}
            {onSwitchToDash&&(
              <div style={{display:'flex',background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.15)',borderRadius:8,overflow:'hidden'}}>
                <button onClick={onSwitchToDash}
                  style={{padding:'.3rem .7rem',border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:'.72rem',fontWeight:500,background:'transparent',color:'rgba(255,255,255,.55)'}}>
                  Dash
                </button>
                <button style={{padding:'.3rem .7rem',border:'none',fontFamily:'inherit',fontSize:'.72rem',fontWeight:700,background:'rgba(255,255,255,.15)',color:'#fff',cursor:'default'}}>
                  Client
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Hero content — centered, left-aligned on mobile */}
        <div style={{position:'relative',zIndex:2,padding:'2.5rem 1.5rem 3.5rem',flex:1,display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
          {/* Avatar */}
          <div style={{width:64,height:64,borderRadius:'50%',border:'1.5px solid rgba(197,169,106,.5)',background:'rgba(197,169,106,.12)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Playfair Display',serif",fontSize:'1.5rem',color:G,marginBottom:'1rem',fontWeight:500}}>
            {initial}
          </div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(2rem,7vw,3.2rem)',fontWeight:500,color:'#fff',lineHeight:1.08,marginBottom:8,textShadow:'0 2px 16px rgba(0,0,0,.3)'}}>
            {workspace?.name||'Your Studio'}
          </h1>
          {workspace?.tagline&&<p style={{fontSize:'.82rem',letterSpacing:'.14em',textTransform:'uppercase',color:'rgba(255,255,255,.5)',marginBottom:20}}>{workspace.tagline}</p>}
          {(workspace?.bio||workspace?.description)&&<p style={{fontSize:'.9rem',lineHeight:1.75,color:'rgba(255,255,255,.6)',maxWidth:380,marginBottom:24,fontWeight:300}}>{workspace.bio||workspace.description}</p>}
          {/* Socials */}
          <div style={{display:'flex',gap:20,alignItems:'center'}}>
            {workspace?.instagram_url&&<a href={workspace.instagram_url} target="_blank" rel="noopener noreferrer" style={{color:'rgba(255,255,255,.45)',lineHeight:0}}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></a>}
            {workspace?.tiktok_url&&<a href={workspace.tiktok_url} target="_blank" rel="noopener noreferrer" style={{color:'rgba(255,255,255,.45)',lineHeight:0}}><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/></svg></a>}
            {workspace?.facebook_url&&<a href={workspace.facebook_url} target="_blank" rel="noopener noreferrer" style={{color:'rgba(255,255,255,.45)',lineHeight:0}}><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>}
          </div>
        </div>
      </div>

      {/* ═══ STICKY TABS ═══════════════════════════════════════════════════ */}
      <div style={{display:'flex',background:'#fff',borderBottom:'1px solid #ece9e4',position:'sticky',top:0,zIndex:20,boxShadow:'0 1px 12px rgba(0,0,0,.06)'}}>
        {[['book','Booking'],['shop','Shop'],['learn','Learn']].map(([k,l])=>(
          <button key={k} onClick={()=>{setTab(k);setProductPage(null);setLearnPage(null)}}
            style={{flex:1,textAlign:'center',padding:'.85rem .5rem',fontSize:'.78rem',fontWeight:600,letterSpacing:'.08em',textTransform:'uppercase',color:tab===k?'#1a1814':'#9a9490',cursor:'pointer',border:'none',background:'none',borderBottom:`2px solid ${tab===k?G:'transparent'}`,transition:'all .15s',fontFamily:'inherit'}}>
            {l}
          </button>
        ))}
      </div>

      {/* ═══ CONTENT ════════════════════════════════════════════════════════ */}
      <div style={{padding:'1.75rem 1.25rem 5rem',minHeight:300}}>

        {/* ── BOOKING TAB ─────────────────────────────────────────────── */}
        {tab==='book'&&(
          <div style={{display:'flex',flexDirection:'column',gap:'2.5rem'}}>

            {/* Portfolio */}
            {portfolio.length>0&&(
              <section>
                <div style={{fontSize:'.68rem',letterSpacing:'.16em',textTransform:'uppercase',color:G,marginBottom:10}}>Portfolio</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
                  {portfolio.map((ph,i)=>(
                    <div key={ph.id||i} style={{aspectRatio:'1',borderRadius:8,overflow:'hidden',background:'#f0ece4'}}>
                      <img src={ph.url} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Services */}
            <section>
              <div style={{fontSize:'.68rem',letterSpacing:'.16em',textTransform:'uppercase',color:G,marginBottom:10}}>What We Offer</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.3rem',color:'#1a1814',marginBottom:'1rem'}}>Services</div>
              {services.length===0
                ?<p style={{color:'#9a9490',fontSize:'.85rem'}}>No services listed yet.</p>
                :<div style={{display:'flex',flexDirection:'column',gap:'.65rem'}}>
                  {services.map((s,i)=>(
                    <div key={i} onClick={()=>{setModal(s);setBooked(false);setBookForm({name:'',phone:'',date:'',time:'',notes:''})}}
                      style={{display:'flex',alignItems:'center',gap:'1rem',background:'#fff',border:'1px solid #ece9e4',borderRadius:14,padding:'1rem 1.1rem',cursor:'pointer',transition:'box-shadow .15s'}}
                      onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,.08)'}
                      onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
                      <div style={{width:3,height:36,background:`linear-gradient(to bottom,${G},rgba(197,169,106,.3))`,borderRadius:2,flexShrink:0}}/>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:600,fontSize:'.9rem',color:'#1a1814'}}>{s.name}</div>
                        {s.duration_min&&<div style={{fontSize:'.72rem',color:'#9a9490',marginTop:2}}>{s.duration_min} min</div>}
                      </div>
                      <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1rem',color:'#1a1814',flexShrink:0}}>{fmtFree(s.price)}</div>
                      <button style={{background:'#1a1814',color:'#fff',border:'none',borderRadius:9,padding:'.45rem .95rem',fontSize:'.78rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit',flexShrink:0}}>Book</button>
                    </div>
                  ))}
                </div>
              }
            </section>

            {/* Reviews */}
            <section>
              <div style={{fontSize:'.68rem',letterSpacing:'.16em',textTransform:'uppercase',color:G,marginBottom:10}}>Client Love</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.3rem',color:'#1a1814',marginBottom:'1rem'}}>What they <em style={{fontStyle:'italic',color:G}}>say</em></div>
              {reviews.length===0
                ?<div style={{padding:'2rem',border:'1px solid #ece9e4',borderRadius:14,textAlign:'center',color:'#9a9490',fontSize:'.82rem',lineHeight:1.8}}>
                    Reviews appear here after clients complete their appointments.
                  </div>
                :<div style={{display:'flex',flexDirection:'column',gap:'.75rem'}}>
                  {reviews.map((rv,i)=>(
                    <div key={rv.id||i} style={{background:'#fff',border:'1px solid #ece9e4',borderRadius:14,padding:'1.25rem'}}>
                      <div style={{fontFamily:"'Playfair Display',serif",fontSize:'2rem',color:'rgba(197,169,106,.25)',lineHeight:1,marginBottom:8}}>&ldquo;</div>
                      <p style={{fontSize:'.85rem',lineHeight:1.75,color:'#3d3a35',marginBottom:14}}>{rv.body||rv.text||rv.comment}</p>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{width:30,height:30,borderRadius:'50%',background:`rgba(197,169,106,.12)`,border:`1px solid rgba(197,169,106,.3)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:G,fontWeight:600}}>
                          {(rv.client_name||rv.reviewer_name||'?')[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{fontSize:'.78rem',fontWeight:600,color:'#1a1814'}}>{rv.client_name||rv.reviewer_name}</div>
                          <div style={{fontSize:10,color:G,letterSpacing:1}}>{'★'.repeat(rv.rating||5)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              }
            </section>

            {/* FAQ */}
            <section>
              <div style={{fontSize:'.68rem',letterSpacing:'.16em',textTransform:'uppercase',color:G,marginBottom:10}}>Good to Know</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.3rem',color:'#1a1814',marginBottom:'1rem'}}>FAQ</div>
              <div style={{borderTop:'1px solid #ece9e4'}}>
                {FAQ.map((item,i)=>(
                  <div key={i} style={{borderBottom:'1px solid #ece9e4'}} onClick={()=>setFaqOpen(faqOpen===i?null:i)}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1rem 4px',cursor:'pointer',gap:12}}>
                      <div style={{fontSize:'.88rem',fontWeight:500,color:'#1a1814',lineHeight:1.4}}>{item.q}</div>
                      <div style={{fontSize:'1.25rem',color:G,flexShrink:0,fontWeight:300,transform:faqOpen===i?'rotate(45deg)':'none',transition:'transform .2s'}}>+</div>
                    </div>
                    {faqOpen===i&&<div style={{paddingBottom:'1rem',paddingRight:'1.5rem',fontSize:'.82rem',lineHeight:1.8,color:'#7a7774'}}>{item.a}</div>}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ── SHOP TAB ────────────────────────────────────────────────── */}
        {tab==='shop'&&(
          <>
            {productPage ? (
              <div>
                <button onClick={()=>setProductPage(null)} style={{display:'flex',alignItems:'center',gap:6,background:'none',border:'none',color:'#9a9490',fontSize:'.75rem',letterSpacing:'.1em',textTransform:'uppercase',cursor:'pointer',fontFamily:'inherit',marginBottom:24,padding:0}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                  Back to Shop
                </button>
                {productPage.image_url
                  ?<img src={productPage.image_url} alt={productPage.name} style={{width:'100%',aspectRatio:'1.2',objectFit:'cover',borderRadius:14,display:'block',marginBottom:20}}/>
                  :<div style={{width:'100%',aspectRatio:'1.2',background:'#f0ece4',borderRadius:14,marginBottom:20,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.75rem',color:'#c8c2b8',letterSpacing:'.08em',textTransform:'uppercase'}}>No photo</div>
                }
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.6rem',fontWeight:500,marginBottom:6,color:'#1a1814'}}>{productPage.name}</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.4rem',color:G,marginBottom:16}}>${productPage.price}</div>
                {productPage.description&&<p style={{fontSize:'.88rem',lineHeight:1.8,color:'#5a5650',marginBottom:24}}>{productPage.description}</p>}
                <button onClick={()=>cpNotify('Contact the studio to order this product.')} style={{width:'100%',background:'#1a1814',color:'#fff',border:'none',borderRadius:12,padding:'1rem',fontSize:'.88rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit',letterSpacing:'.04em'}}>Enquire to Order</button>
              </div>
            ) : (
              <>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.3rem',color:'#1a1814',marginBottom:'1.25rem'}}>Products</div>
                {products.length===0
                  ?<p style={{color:'#9a9490',fontSize:'.85rem'}}>No products listed yet.</p>
                  :<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                    {products.map(p=>(
                      <div key={p.id} onClick={()=>setProductPage(p)} style={{background:'#fff',border:'1px solid #ece9e4',borderRadius:12,overflow:'hidden',cursor:'pointer'}}>
                        <div style={{aspectRatio:'1',background:'#f0ece4',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                          {p.image_url?<img src={p.image_url} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                            :<span style={{fontSize:'.6rem',color:'#c8c2b8',letterSpacing:'.06em',textTransform:'uppercase'}}>No photo</span>}
                        </div>
                        <div style={{padding:'.85rem'}}>
                          <div style={{fontWeight:600,fontSize:'.85rem',color:'#1a1814',marginBottom:4}}>{p.name}</div>
                          {p.description&&<div style={{fontSize:'.72rem',color:'#9a9490',lineHeight:1.5,marginBottom:6}}>{p.description.slice(0,50)}{p.description.length>50?'…':''}</div>}
                          <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1rem',color:'#1a1814'}}>${p.price}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                }
              </>
            )}
          </>
        )}

        {/* ── LEARN TAB ───────────────────────────────────────────────── */}
        {tab==='learn'&&(
          <>
            {learnPage ? (
              <div>
                <button onClick={()=>setLearnPage(null)} style={{display:'flex',alignItems:'center',gap:6,background:'none',border:'none',color:'#9a9490',fontSize:'.75rem',letterSpacing:'.1em',textTransform:'uppercase',cursor:'pointer',fontFamily:'inherit',marginBottom:24,padding:0}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                  Back to Learn
                </button>
                {learnPage.image_url
                  ?<img src={learnPage.image_url} alt={learnPage.name||learnPage.title} style={{width:'100%',aspectRatio:'1.75',objectFit:'cover',borderRadius:14,display:'block',marginBottom:20}}/>
                  :<div style={{width:'100%',aspectRatio:'1.75',background:'#f0ece4',borderRadius:14,marginBottom:20,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.75rem',color:'#c8c2b8',letterSpacing:'.08em',textTransform:'uppercase'}}>No photo</div>
                }
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.6rem',fontWeight:500,marginBottom:6,color:'#1a1814'}}>{learnPage.name||learnPage.title}</div>
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
                  {learnPage.price>0&&<div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.4rem',color:G}}>${learnPage.price}</div>}
                  {(learnPage.duration||learnPage.duration_min)&&<div style={{fontSize:'.78rem',color:'#9a9490'}}>{learnPage.duration||`${learnPage.duration_min} min`}</div>}
                </div>
                {learnPage.description&&<p style={{fontSize:'.88rem',lineHeight:1.8,color:'#5a5650',marginBottom:24}}>{learnPage.description}</p>}
                <button onClick={()=>cpNotify('Contact the studio to enroll in this formation.')} style={{width:'100%',background:'#1a1814',color:'#fff',border:'none',borderRadius:12,padding:'1rem',fontSize:'.88rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit',letterSpacing:'.04em'}}>Enquire to Enroll</button>
              </div>
            ) : (
              <>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.3rem',color:'#1a1814',marginBottom:'1.25rem'}}>Formations</div>
                {offerings.length===0
                  ?<p style={{color:'#9a9490',fontSize:'.85rem'}}>No formations available yet.</p>
                  :<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                    {offerings.map(o=>(
                      <div key={o.id} onClick={()=>setLearnPage(o)} style={{background:'#fff',border:'1px solid #ece9e4',borderRadius:12,overflow:'hidden',cursor:'pointer'}}>
                        <div style={{aspectRatio:'1.4',background:'#f0ece4',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                          {o.image_url?<img src={o.image_url} alt={o.name||o.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                            :<span style={{fontSize:'.6rem',color:'#c8c2b8',letterSpacing:'.06em',textTransform:'uppercase'}}>No photo</span>}
                        </div>
                        <div style={{padding:'.85rem'}}>
                          <div style={{fontWeight:600,fontSize:'.85rem',color:'#1a1814',marginBottom:4}}>{o.name||o.title}</div>
                          {o.description&&<div style={{fontSize:'.72rem',color:'#9a9490',lineHeight:1.5,marginBottom:6}}>{o.description.slice(0,50)}{o.description.length>50?'…':''}</div>}
                          <div style={{display:'flex',gap:8,alignItems:'center'}}>
                            {o.price>0&&<div style={{fontFamily:"'Playfair Display',serif",fontSize:'1rem',color:'#1a1814'}}>${o.price}</div>}
                            {(o.duration||o.duration_min)&&<div style={{fontSize:'.72rem',color:'#9a9490'}}>{o.duration||`${o.duration_min} min`}</div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                }
              </>
            )}
          </>
        )}
      </div>

      {/* ═══ FOOTER ═══════════════════════════════════════════════════════ */}
      <div style={{textAlign:'center',padding:'2rem 1.25rem',fontSize:'.72rem',color:'#b0aba4',background:'#1a1814'}}>
        Powered by <strong style={{color:G}}>Organized.</strong> — beorganized.io
      </div>

      {/* ═══ BOOKING MODAL ════════════════════════════════════════════════ */}
      {modal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(26,24,20,.55)',backdropFilter:'blur(4px)',zIndex:100,display:'flex',alignItems:'flex-end',justifyContent:'center'}} onClick={()=>setModal(null)}>
          <div style={{background:'#fff',width:'100%',maxWidth:520,borderRadius:'18px 18px 0 0',padding:'2rem 1.75rem',maxHeight:'92vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{width:32,height:4,borderRadius:2,background:'#e0dbd4',margin:'-0.5rem auto 1.5rem'}}/>
            {booked?(
              <div style={{textAlign:'center',padding:'1.5rem 0 1rem'}}>
                <div style={{width:52,height:52,borderRadius:'50%',background:'#f0faf5',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1.25rem'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2e7d52" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.4rem',marginBottom:6}}>Request sent</div>
                <div style={{fontSize:'.82rem',color:'#7a7774',lineHeight:1.7,maxWidth:260,margin:'0 auto'}}>Your request for <strong>{modal.name}</strong> has been sent. The studio will confirm shortly.</div>
                <button onClick={()=>setModal(null)} style={{marginTop:24,background:'#1a1814',color:'#fff',border:'none',borderRadius:10,padding:'12px 28px',fontSize:'.85rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Done</button>
              </div>
            ):(
              <form onSubmit={submitBooking}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.35rem',marginBottom:4,color:'#1a1814'}}>{modal.name}</div>
                <div style={{fontSize:'.78rem',color:'#9a9490',marginBottom:20,display:'flex',gap:10}}>
                  {modal.duration_min&&<span>{modal.duration_min} min</span>}
                  {modal.price>0&&<span>— ${modal.price}</span>}
                </div>
                {[['name','Full name','text',true],['phone','Phone','tel',false],['date','Preferred date','date',true],['time','Preferred time','time',true],['notes','Notes (optional)','text',false]].map(([k,l,t,req])=>(
                  <div key={k} style={{marginBottom:12}}>
                    <label style={{display:'block',fontSize:'.7rem',letterSpacing:'.12em',textTransform:'uppercase',color:'#9a9490',marginBottom:5}}>{l}</label>
                    <input type={t} value={bookForm[k]} onChange={e=>setBookForm(f=>({...f,[k]:e.target.value}))} required={req}
                      style={{width:'100%',border:'1px solid #e4e0d8',borderRadius:8,padding:'11px 14px',fontSize:'1rem',fontFamily:'inherit',color:'#1a1814',outline:'none',background:'#fdfcfa',boxSizing:'border-box'}}/>
                  </div>
                ))}
                <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:16}}>
                  <button type="button" onClick={()=>setModal(null)} style={{padding:'11px 18px',border:'1px solid #d8d4cc',borderRadius:8,fontSize:'.82rem',cursor:'pointer',background:'#fff',fontFamily:'inherit',color:'#7a7774'}}>Cancel</button>
                  <button type="submit" disabled={booking} style={{background:'#1a1814',color:'#fff',border:'none',borderRadius:8,padding:'11px 22px',fontSize:'.82rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit',opacity:booking?.6:1}}>{booking?'Sending…':'Send request →'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {cpToast&&<div style={{position:'fixed',bottom:24,right:20,background:'#1a1814',color:'#fff',padding:'11px 18px',borderRadius:8,fontSize:'.82rem',zIndex:200,borderLeft:`2px solid ${G}`,boxShadow:'0 4px 20px rgba(0,0,0,.25)',maxWidth:'calc(100vw - 2.5rem)'}}>{cpToast}</div>}
    </div>
  )
}

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [session,setSession]=useState(null)
  const [workspace,setWorkspace]=useState(null)
  const [ownerData,setOwnerData]=useState(null)
  const [loading,setLoading]=useState(true)
  const [page,setPage]=useState('overview')
  const [pageStack,setPageStack]=useState([])
  const [menuOpen,setMenuOpen]=useState(false)
  const [toastMsg,setToastMsg]=useState(null)
  const [clientView,setClientView]=useState(false)
  const [theme,setThemeState]=useState(()=>localStorage.getItem('org-theme')||'light')
  const [subscription,setSubscription]=useState(null)
  const [lang,setLang]=useState('en')
  const [pendingReviews,setPendingReviews]=useState(0)
  const [avatarExpanded,setAvatarExpanded]=useState(false)
  const [avatarUploading,setAvatarUploading]=useState(false)
  const navigate = useNavigate()

  // Lock body scroll when sidebar is open
  useEffect(()=>{
    if(menuOpen){
      document.body.style.overflow='hidden'
    } else {
      document.body.style.overflow=''
    }
    return()=>{ document.body.style.overflow='' }
  },[menuOpen])

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{setSession(session);if(session)fetchWorkspace(session)})
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_,s)=>{setSession(s);if(s)fetchWorkspace(s);else setLoading(false)})
    return()=>subscription.unsubscribe()
  },[])

  async function fetchWorkspace(s=session){
    if(!s) return
    const[{data:ws},{data:user}]=await Promise.all([
      supabase.from('workspaces').select('*').eq('user_id',s.user.id).maybeSingle(),
      supabase.from('users').select('*').eq('id',s.user.id).maybeSingle(),
    ])
    setWorkspace(ws)
    setOwnerData(user)
    if(user?.language) setLang(user.language)
    // fetch subscription
    if(ws?.id){
      const{data:sub}=await supabase.from('subscriptions').select('*').eq('workspace_id',ws.id).maybeSingle()
      setSubscription(sub)
    }
    setLoading(false)
    // Pending reviews badge
    if(ws?.id){
      supabase.from('reviews').select('id',{count:'exact'}).eq('workspace_id',ws.id).eq('is_approved',false)
        .then(({count})=>setPendingReviews(count||0))
    }
  }

  function setTheme(t){
    setThemeState(t)
    localStorage.setItem('org-theme',t)
    document.documentElement.setAttribute('data-theme',t)
  }
  useEffect(()=>{ document.documentElement.setAttribute('data-theme',theme) },[theme])

  function toast(msg,dur=3200){
    setToastMsg(msg)
    setTimeout(()=>setToastMsg(null),dur)
  }

  function navigateTo(p){
    setPageStack(prev=>[...prev,page])
    setPage(p)
    setMenuOpen(false)
  }
  function goBack(){
    if(pageStack.length>0){const prev=pageStack[pageStack.length-1];setPageStack(s=>s.slice(0,-1));setPage(prev)}
  }

  async function handleSignOut(){ await supabase.auth.signOut(); navigate('/') }

  const NAV=[
    {key:'overview',label:'nav_overview',icon:I.home},
    {key:'appointments',label:'nav_appointments',icon:I.cal},
    {key:'services',label:'nav_services',icon:I.box},
    {key:'products',label:'nav_products',icon:I.box},
    {key:'formations',label:'nav_formations',icon:I.grad},
    {key:'clients',label:'nav_clients',icon:I.users},
    {key:'portfolio',label:'nav_portfolio',icon:I.box},
    {key:'reviews',label:'nav_reviews',icon:I.home},
    {key:'availability',label:'nav_availability',icon:I.avail},
    {key:'settings',label:'nav_settings',icon:I.gear},
  ]

  if(loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.6rem',color:'var(--ink)',marginBottom:'.5rem'}}>Organized<span style={{color:'var(--gold)'}}>.</span></div>
        <div style={{fontSize:'.8rem',color:'var(--ink-3)'}}>Loading your workspace…</div>
      </div>
    </div>
  )

  const initials=(()=>{const n=ownerData?.full_name||firstName(workspace,session)||'';const parts=n.trim().split(' ');return parts.length>1?parts[0][0]+parts[1][0]:parts[0]?.[0]||'?'})()

  if(clientView) return (
    <div>
      <style>{css}</style>
      <ClientPage workspace={workspace} onSwitchToDash={()=>setClientView(false)}/>
    </div>
  )

  function renderPage(){
    const props={workspace,toast,lang,session,ownerData,refetchWorkspace:fetchWorkspace,theme,setTheme,setPage:navigateTo}
    switch(page){
      case 'overview':     return <Overview {...props}/>
      case 'appointments': return <Appointments {...props}/>
      case 'services':     return <Services {...props}/>
      case 'products':     return <Products {...props}/>
      case 'formations':   return <Formations {...props}/>
      case 'clients':      return <Clients {...props}/>
      case 'portfolio':    return <Portfolio {...props}/>
      case 'reviews':      return <Reviews {...props}/>
      case 'availability': return <Availability {...props}/>
      case 'settings':     return <Settings {...props}/>
      default:             return <Overview {...props}/>
    }
  }



  return (
    <div className="app-wrap">
      <style>{css}</style>
      {/* TOPBAR */}
      <div className="topbar">
        <div style={{display:'flex',alignItems:'center',gap:'.6rem'}}>
          <button className="menu-btn" onClick={()=>setMenuOpen(o=>!o)}>
            <span/><span/><span/>
          </button>
          {pageStack.length>0&&(
            <button className="back-btn" onClick={goBack}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" width="13" height="13"><path d="M10 3L5 8l5 5"/></svg>
            </button>
          )}
          <div className="brand" onClick={()=>{setPage('overview');setPageStack([]);window.scrollTo({top:0,behavior:'smooth'})}}>
            Organized<span className="brand-dot">.</span>
          </div>
        </div>
        <div className="view-toggle">
          <button className={`vt-btn${!clientView?' active':''}`} onClick={()=>setClientView(false)}>Dash</button>
          <button className={`vt-btn${clientView?' active':''}`} onClick={()=>setClientView(true)}>Client</button>
        </div>

      </div>

      {/* SIDEBAR */}
      {menuOpen&&<div className="overlay-bg" onClick={()=>setMenuOpen(false)}/>}
      <div className={`sidebar${menuOpen?' open':''}`}>
        <div className="sidebar-head">
          <div className="sb-brand">Organized<span style={{color:'var(--gold)'}}>.</span></div>
          <button className="sb-close" onClick={()=>setMenuOpen(false)}>✕</button>
        </div>
        <div className="sb-user" style={{flexDirection:'column',alignItems:'center',padding:'1.25rem',gap:'.6rem'}}>
          {/* Avatar — click opens full overlay */}
          <div style={{position:'relative',cursor:'pointer'}} onClick={()=>setAvatarExpanded(true)}>
            {ownerData?.avatar_url
              ? <img src={ownerData.avatar_url} alt="avatar" style={{width:56,height:56,borderRadius:'50%',objectFit:'cover',border:'2px solid var(--gold)'}}/>
              : <div className="sb-av" style={{width:56,height:56,fontSize:'1.1rem'}}>{initials}</div>
            }
            <div style={{position:'absolute',bottom:0,right:0,width:20,height:20,borderRadius:'50%',background:'var(--gold)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 4px rgba(0,0,0,.2)'}}>
              <svg viewBox="0 0 16 16" fill="none" stroke="var(--ink)" strokeWidth="1.5" width="10" height="10"><path d="M1 12V5a1 1 0 011-1h1.5l1-2h5l1 2H13a1 1 0 011 1v7a1 1 0 01-1 1H2a1 1 0 01-1-1z"/><circle cx="8" cy="8.5" r="2"/></svg>
            </div>
          </div>

          {/* Full-screen avatar overlay — premium style */}
          {avatarExpanded&&(
            <div onClick={()=>setAvatarExpanded(false)} style={{position:'fixed',inset:0,zIndex:200,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-between',paddingBottom:'3rem',animation:'fadeIn .22s ease',overflow:'hidden'}}>
              {/* Blurred ambient background */}
              <div style={{position:'absolute',inset:0,background:'#1a1814',zIndex:0}}/>
              {ownerData?.avatar_url&&(
                <img src={ownerData.avatar_url} alt="" aria-hidden style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',filter:'blur(40px) brightness(.45) saturate(1.4)',transform:'scale(1.1)',zIndex:1}}/>
              )}
              {!ownerData?.avatar_url&&(
                <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 40%, rgba(197,169,106,.25) 0%, transparent 70%)',zIndex:1}}/>
              )}

              {/* Close tap area top */}
              <div style={{flex:1,width:'100%',zIndex:2}}/>

              {/* Avatar large */}
              <div onClick={e=>e.stopPropagation()} style={{position:'relative',zIndex:3,display:'flex',flexDirection:'column',alignItems:'center',gap:'1rem'}}>
                <div style={{position:'relative'}}>
                  {ownerData?.avatar_url
                    ? <img src={ownerData.avatar_url} alt="avatar" style={{width:'62vw',height:'62vw',maxWidth:240,maxHeight:240,borderRadius:'50%',objectFit:'cover',boxShadow:'0 0 0 3px rgba(197,169,106,.6), 0 24px 80px rgba(0,0,0,.5)'}}/>
                    : <div style={{width:'62vw',height:'62vw',maxWidth:240,maxHeight:240,borderRadius:'50%',background:'var(--gold)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Playfair Display',serif",fontSize:'4rem',fontWeight:700,color:'#1a1814',boxShadow:'0 0 0 3px rgba(197,169,106,.6), 0 24px 80px rgba(0,0,0,.5)'}}>{initials}</div>
                  }

                </div>
                {/* Name */}
                <div style={{textAlign:'center'}}>
                  <div style={{color:'#fff',fontWeight:600,fontSize:'1.1rem',textShadow:'0 1px 8px rgba(0,0,0,.5)'}}>{ownerData?.full_name||firstName(workspace,session)}</div>
                  <div style={{color:'rgba(255,255,255,.4)',fontSize:'.75rem',marginTop:3}}>{session?.user?.email}</div>
                </div>
              </div>

              {/* Spacer */}
              <div style={{flex:1,zIndex:2}}/>

              {/* Bottom actions — circular buttons */}
              <div onClick={e=>e.stopPropagation()} style={{position:'relative',zIndex:3,display:'flex',gap:'2rem',alignItems:'flex-end',justifyContent:'center',paddingBottom:'.5rem'}}>
                {/* Change photo */}
                <label style={{cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'.5rem'}}>
                  <div style={{width:56,height:56,borderRadius:'50%',background:'rgba(30,27,23,.85)',border:'1px solid rgba(255,255,255,.12)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 20px rgba(0,0,0,.35)'}}>
                    {avatarUploading
                      ? <div style={{width:18,height:18,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>
                      : <svg viewBox="0 0 16 16" fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="1.5" width="20" height="20"><path d="M1 12V5a1 1 0 011-1h1.5l1-2h5l1 2H13a1 1 0 011 1v7a1 1 0 01-1 1H2a1 1 0 01-1-1z"/><circle cx="8" cy="8.5" r="2"/></svg>
                    }
                  </div>
                  <span style={{color:'rgba(255,255,255,.7)',fontSize:'.72rem',fontWeight:500}}>{avatarUploading?'Uploading…':'Change photo'}</span>
                  <input type="file" accept="image/*" style={{display:'none'}} disabled={avatarUploading} onChange={async(e)=>{
                    const file=e.target.files?.[0]; if(!file||!session) return
                    setAvatarUploading(true)
                    try {
                      const ext=file.name.split('.').pop()
                      const path=`${session.user.id}/avatar.${ext}`
                      const {error:upErr}=await supabase.storage.from('avatars').upload(path,file,{upsert:true,contentType:file.type})
                      if(upErr) throw upErr
                      const {data:{publicUrl}}=supabase.storage.from('avatars').getPublicUrl(path)
                      const bust=publicUrl+'?t='+Date.now()
                      await supabase.from('users').update({avatar_url:bust}).eq('id',session.user.id)
                      setOwnerData(d=>({...d,avatar_url:bust}))
                      setAvatarExpanded(false)
                      toast('Profile photo updated')
                    } catch(err){ toast('Upload failed — try again') }
                    finally{ setAvatarUploading(false) }
                  }}/>
                </label>

                {/* Remove photo — only if photo exists */}
                {ownerData?.avatar_url&&(
                  <div onClick={async()=>{
                    await supabase.from('users').update({avatar_url:null}).eq('id',session.user.id)
                    setOwnerData(d=>({...d,avatar_url:null}))
                    setAvatarExpanded(false)
                    toast('Photo removed')
                  }} style={{cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'.5rem'}}>
                    <div style={{width:56,height:56,borderRadius:'50%',background:'rgba(30,27,23,.85)',border:'1px solid rgba(255,255,255,.12)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 20px rgba(0,0,0,.35)'}}>
                      <svg viewBox="0 0 16 16" fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="1.5" width="18" height="18"><path d="M3 4h10M5 4V2h6v2M6 7v5M10 7v5M4 4l1 9h6l1-9"/></svg>
                    </div>
                    <span style={{color:'rgba(255,255,255,.7)',fontSize:'.72rem',fontWeight:500}}>Remove</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div style={{textAlign:'center'}}>
            <div className="sb-name">{ownerData?.full_name||firstName(workspace,session)}</div>
            <div className="sb-email">{session?.user?.email}</div>
          </div>
        </div>
        <nav className="sb-nav">
          {NAV.map(n=>(
            <div key={n.key} className={`sb-item${page===n.key?' sb-active':''}`} onClick={()=>{navigateTo(n.key)}}
              style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{display:'flex',alignItems:'center',gap:'.9rem'}}>
                <span className="sb-icon">{n.icon}</span>
                <span>{t(lang,n.label)}</span>
              </div>
              {n.key==='reviews'&&pendingReviews>0&&(
                <span style={{background:'#f59e0b',color:'#fff',borderRadius:100,padding:'1px 7px',fontSize:'.65rem',fontWeight:700,flexShrink:0}}>{pendingReviews}</span>
              )}
            </div>
          ))}
        </nav>
        <div className="sb-footer">
          {workspace?.slug&&(
            <div style={{marginBottom:'.65rem',padding:'.75rem .9rem',background:'var(--gold-lt)',border:'1px solid var(--gold-dim)',borderRadius:12,cursor:'pointer'}}
              onClick={()=>window.open(`https://beorganized.io/${workspace.slug}`,'_blank')}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
                <div style={{fontSize:'.6rem',fontWeight:700,color:'var(--gold)',textTransform:'uppercase',letterSpacing:'.08em'}}>
                  {subscription?.plan==='pro'?'Pro Plan':subscription?.plan==='studio'?'Studio Plan':subscription?.plan==='starter'?'Starter Plan':'Beta'}
                </div>
                <svg viewBox="0 0 12 12" fill="none" stroke="var(--gold)" strokeWidth="1.5" width="10" height="10"><path d="M2 10L10 2M10 2H5M10 2v5"/></svg>
              </div>
              <div style={{fontSize:'.8rem',color:'var(--ink)',fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>beorganized.io/{workspace.slug}</div>
              <div style={{marginTop:6,height:3,background:'rgba(0,0,0,.08)',borderRadius:10,overflow:'hidden'}}>
                <div style={{height:'100%',width:subscription?.plan?'100%':'35%',background:'linear-gradient(90deg,#a8863d,var(--gold))',borderRadius:10,transition:'width .6s ease'}}/>
              </div>
              <div style={{fontSize:'.62rem',color:'var(--ink-3)',marginTop:4}}>Ouvre ta page · Clique pour visiter</div>
            </div>
          )}
          <button className="sb-signout" onClick={handleSignOut}>{t(lang,'nav_signout')}</button>
        </div>
      </div>

      {/* MAIN */}
      <main className="main-content">
        {renderPage()}
      </main>

      {/* TOAST */}
      {toastMsg&&(
        <div className="toast-wrap">
          <div className="toast">{toastMsg}</div>
        </div>
      )}
    </div>
  )
}

// ── CSS ───────────────────────────────────────────────────────────────────────
// ── PORTFOLIO ──────────────────────────────────────────────────────────────────
function Portfolio({ workspace, toast }) {
  const [photos,setPhotos]=useState([])
  const [uploading,setUploading]=useState(false)
  useEffect(()=>{ if(workspace) load() },[workspace])
  async function load(){
    const{data}=await supabase.from('portfolio_photos').select('*').eq('workspace_id',workspace.id).order('display_order')
    setPhotos(data||[])
  }
  async function handleUpload(e){
    const files=Array.from(e.target.files); if(!files.length) return
    setUploading(true)
    for(const file of files){
      const ext=file.name.split('.').pop()
      const path=`${workspace.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const{error}=await supabase.storage.from('portfolio').upload(path,file,{contentType:file.type})
      if(error){toast('Upload failed'); continue}
      const{data:u}=supabase.storage.from('portfolio').getPublicUrl(path)
      await supabase.from('portfolio_photos').insert({workspace_id:workspace.id,url:u.publicUrl,display_order:photos.length})
    }
    toast(`${files.length} photo${files.length>1?'s':''} uploaded.`)
    setUploading(false); load()
  }
  async function remove(ph){
    const marker='/object/public/portfolio/'
    const path=ph.url.includes(marker)?ph.url.split(marker)[1]:null
    if(path) await supabase.storage.from('portfolio').remove([path])
    await supabase.from('portfolio_photos').delete().eq('id',ph.id)
    toast('Photo removed.'); load()
  }
  return(
    <div>
      <div className="page-head">
        <div><div className="page-title">Portfolio</div><div className="page-sub">Photos shown on your public client page</div></div>
        <label style={{background:'var(--gold)',color:'var(--ink)',border:'none',borderRadius:10,padding:'.5rem 1rem',fontSize:'.82rem',fontWeight:600,cursor:'pointer',opacity:uploading?.6:1}}>
          {uploading?'Uploading…':'+ Upload photos'}
          <input type="file" accept="image/*" multiple style={{display:'none'}} onChange={handleUpload} disabled={uploading}/>
        </label>
      </div>
      {photos.length===0
        ?<div className="card" style={{textAlign:'center',padding:'3rem'}}><div style={{fontSize:'.85rem',color:'var(--ink-3)'}}>No photos yet. Upload some to showcase your work.</div></div>
        :<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:10}}>
          {photos.map(ph=>(
            <div key={ph.id} style={{position:'relative',borderRadius:10,overflow:'hidden',aspectRatio:'1',background:'var(--bg)'}}>
              <img src={ph.url} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
              <button onClick={()=>remove(ph)} style={{position:'absolute',top:6,right:6,width:26,height:26,borderRadius:'50%',background:'rgba(0,0,0,.55)',color:'#fff',border:'none',cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
            </div>
          ))}
        </div>
      }
    </div>
  )
}

// ── REVIEWS ────────────────────────────────────────────────────────────────────
function Reviews({ workspace, toast }) {
  const [reviews,setReviews]=useState([])
  const [filter,setFilter]=useState('pending')
  const [loading,setLoading]=useState(true)
  useEffect(()=>{ if(workspace) load() },[workspace])
  async function load(){
    const{data}=await supabase.from('reviews').select('*').eq('workspace_id',workspace.id).order('created_at',{ascending:false})
    setReviews(data||[]); setLoading(false)
  }
  async function approve(id){
    await supabase.from('reviews').update({is_approved:true}).eq('id',id)
    toast('Review approved — now visible on your client page.'); load()
  }
  async function reject(id){
    await supabase.from('reviews').delete().eq('id',id)
    toast('Review removed.'); load()
  }
  const pending=reviews.filter(r=>!r.is_approved).length
  const filtered=reviews.filter(r=>filter==='all'?true:filter==='pending'?!r.is_approved:r.is_approved)
  return(
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Reviews {pending>0&&<span style={{background:'#f59e0b',color:'#fff',borderRadius:100,padding:'1px 8px',fontSize:'.7rem',fontWeight:700,marginLeft:8,verticalAlign:'middle'}}>{pending}</span>}</div>
          <div className="page-sub">Approve reviews before they appear on your client page</div>
        </div>
      </div>
      <div style={{display:'flex',gap:6,marginBottom:'1rem'}}>
        {[['pending','Pending'],['approved','Approved'],['all','All']].map(([k,l])=>{
          const label = k==='pending'&&pending>0 ? l+' ('+pending+')' : l
          const active = filter===k
          return(
            <button key={k} onClick={()=>setFilter(k)}
              style={{padding:'.4rem .9rem',borderRadius:8,
                border:'1px solid '+(active?'var(--gold)':'var(--border-2)'),
                background:active?'var(--gold-lt)':'transparent',
                color:active?'var(--ink)':'var(--ink-3)',
                fontSize:'.78rem',fontWeight:active?600:400,
                cursor:'pointer',fontFamily:'inherit'}}>
              {label}
            </button>
          )
        })}
      </div>
      {loading?<div style={{padding:'2rem',color:'var(--ink-3)',fontSize:'.85rem'}}>Loading…</div>
        :filtered.length===0?<div className="card" style={{textAlign:'center',padding:'3rem'}}><div style={{fontSize:'.85rem',color:'var(--ink-3)'}}>{filter==='pending'?'No pending reviews.':'No reviews yet.'}</div></div>
        :<div style={{display:'flex',flexDirection:'column',gap:'.75rem'}}>
          {filtered.map(rv=>(
            <div key={rv.id} className="card" style={{padding:'1.25rem'}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'1rem'}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,flexWrap:'wrap'}}>
                    <div style={{fontWeight:600,fontSize:'.88rem'}}>{rv.client_name||rv.reviewer_name||'Anonymous'}</div>
                    <span style={{fontSize:11,color:'var(--gold)',letterSpacing:1}}>{'★'.repeat(rv.rating||5)}</span>
                    {rv.service_name&&<span style={{fontSize:'.7rem',color:'var(--ink-3)',background:'var(--bg)',borderRadius:4,padding:'2px 7px'}}>{rv.service_name}</span>}
                    <span style={{fontSize:'.7rem',fontWeight:600,color:rv.is_approved?'#15803d':'#92400e',background:rv.is_approved?'#f0fdf4':'#fffbeb',borderRadius:4,padding:'2px 7px'}}>{rv.is_approved?'Published':'Pending'}</span>
                  </div>
                  <p style={{fontSize:'.83rem',color:'var(--ink-2)',lineHeight:1.7,margin:0}}>{rv.body||'—'}</p>
                  <div style={{fontSize:'.72rem',color:'var(--ink-3)',marginTop:6}}>{new Date(rv.created_at).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})}</div>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:6,flexShrink:0}}>
                  {!rv.is_approved&&<button onClick={()=>approve(rv.id)} style={{padding:'.4rem .9rem',background:'var(--gold)',border:'none',borderRadius:8,fontSize:'.78rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit',color:'var(--ink)'}}>Approve</button>}
                  <button onClick={()=>reject(rv.id)} style={{padding:'.4rem .9rem',background:'none',border:'1px solid #fca5a5',borderRadius:8,fontSize:'.78rem',cursor:'pointer',fontFamily:'inherit',color:'#c0392b'}}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  )
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&display=swap');

:root {
  --gold:#c5a96a; --gold-lt:rgba(197,169,106,.08); --gold-dim:rgba(197,169,106,.25);
  --ink:#1a1814; --ink-2:#3d3a35; --ink-3:#7a7774;
  --bg:#f5f3ef; --surface:#ffffff; --border:rgba(0,0,0,.07); --border-2:rgba(0,0,0,.12);
  --green:#2e7d52; --red:#c0392b; --orange:#c07d2b;
}
[data-theme="dark"]{
  --ink:#f0ece4; --ink-2:#c8c2b8; --ink-3:#7a7774;
  --bg:#141210; --surface:#1e1b17; --border:rgba(255,255,255,.07); --border-2:rgba(255,255,255,.12);
  --gold:#d4a952;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{font-size:16px;-webkit-text-size-adjust:100%}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--ink);min-height:100vh;-webkit-font-smoothing:antialiased}

.app-wrap{min-height:100vh;display:flex;flex-direction:column}

/* TOPBAR */
.topbar{position:sticky;top:0;z-index:50;background:var(--surface);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:.6rem 1.1rem;gap:.75rem}
.menu-btn{background:none;border:none;cursor:pointer;display:flex;flex-direction:column;gap:4px;padding:4px}
.menu-btn span{display:block;width:20px;height:1.5px;background:var(--ink);border-radius:2px;transition:all .2s}
.back-btn{background:var(--bg);border:1px solid var(--border);width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--ink-3)}
.brand{font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:500;color:var(--ink);cursor:pointer;white-space:nowrap}
.brand-dot{color:var(--gold)}
.view-toggle{display:flex;background:var(--bg);border:1px solid var(--border);border-radius:8px;overflow:hidden;flex-shrink:0}
.vt-btn{padding:.3rem .75rem;border:none;cursor:pointer;font-size:.78rem;font-family:inherit;font-weight:500;background:transparent;color:var(--ink-3);transition:all .15s}
.vt-btn.active{background:var(--surface);color:var(--ink);font-weight:600;box-shadow:0 1px 4px rgba(0,0,0,.08)}
.av-btn{width:34px;height:34px;border-radius:50%;background:var(--gold);color:var(--ink);font-weight:700;font-size:.82rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Playfair Display',serif}

/* SIDEBAR */
.overlay-bg{position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:60;backdrop-filter:blur(2px)}
.sidebar{position:fixed;left:0;top:0;bottom:0;width:280px;background:var(--surface);z-index:70;display:flex;flex-direction:column;transform:translateX(-100%);transition:transform .28s cubic-bezier(.4,0,.2,1);box-shadow:8px 0 32px rgba(0,0,0,.12)}
.sidebar.open{transform:translateX(0)}
.sidebar-head{display:flex;align-items:center;justify-content:space-between;padding:1.1rem 1.25rem;border-bottom:1px solid var(--border)}
.sb-brand{font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:500;color:var(--ink)}
.sb-close{background:none;border:none;cursor:pointer;color:var(--ink-3);font-size:1.1rem;padding:4px}
.sb-user{display:flex;align-items:center;gap:.85rem;padding:1.1rem 1.25rem;border-bottom:1px solid var(--border)}
.sb-av{width:40px;height:40px;border-radius:50%;background:var(--gold);color:var(--ink);font-weight:700;font-size:.9rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Playfair Display',serif}
.sb-name{font-weight:600;font-size:.88rem;color:var(--ink)}
.sb-email{font-size:.72rem;color:var(--ink-3);margin-top:1px}
.sb-nav{flex:1;overflow-y:auto;padding:.5rem 0}
.sb-item{display:flex;align-items:center;gap:.9rem;padding:.8rem 1.25rem;cursor:pointer;font-size:.88rem;color:var(--ink-2);border-radius:0;transition:background .12s}
.sb-item:hover{background:var(--bg)}
.sb-active{color:var(--ink);font-weight:600;background:var(--gold-lt) !important}
.sb-active .sb-icon{color:var(--gold)}
.sb-icon{width:16px;height:16px;display:flex;flex-shrink:0}
.sb-footer{padding:1rem 1.25rem;border-top:1px solid var(--border)}
.sb-signout{width:100%;padding:.6rem;background:none;border:1px solid var(--border);border-radius:8px;cursor:pointer;font-family:inherit;font-size:.82rem;color:var(--ink-3);transition:all .15s}
.sb-signout:hover{background:var(--bg);color:var(--ink)}

/* MAIN */
.main-content{flex:1;padding:1.1rem;max-width:780px;margin:0 auto;width:100%}

/* PAGE HEAD */
.page-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.35rem;gap:.75rem;flex-wrap:wrap}
.page-title{font-family:'Playfair Display',serif;font-size:1.65rem;font-weight:500;color:var(--ink);line-height:1.15}
.page-sub{font-size:.8rem;color:var(--ink-3);margin-top:.25rem}
.head-actions{display:flex;gap:.5rem;align-items:center;flex-shrink:0}

/* CARDS */
.card{background:var(--surface);border-radius:14px;border:1px solid var(--border);margin-bottom:1.25rem;overflow:hidden}
.card-head{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.4rem;border-bottom:1px solid var(--border)}
.card-title{font-weight:600;font-size:.9rem;color:var(--ink)}
.card-sub{font-size:.75rem;color:var(--ink-3);margin-top:2px}
.card-body{padding:1.25rem 1.4rem}

/* NEXT UP BANNER */
.next-up-banner{background:#1a1814;border-radius:16px;padding:1.1rem 1.25rem;display:flex;flex-direction:column;margin-bottom:1.25rem;box-shadow:0 4px 24px rgba(0,0,0,.28)}
.next-up-left{display:flex;align-items:center;gap:.85rem;flex:1;min-width:0}
.next-up-icon{width:38px;height:38px;border-radius:50%;background:rgba(197,169,106,.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--gold)}
.next-up-icon svg{width:17px;height:17px}
.next-up-label{font-size:.72rem;color:rgba(255,255,255,.5);font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-bottom:2px}
.next-up-name{font-family:'Playfair Display',serif;font-size:1rem;color:#fff}
.next-up-right{text-align:right;flex-shrink:0}
.next-up-time{font-size:1.05rem;font-weight:600;color:#fff}
.next-up-amount{font-size:.75rem;color:var(--gold);font-weight:500;margin-top:1px}

/* COACH SLIDER */
.coach-slider{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:1rem 1.25rem 1.1rem;margin-bottom:1.25rem}
.coach-slider-label{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:var(--gold);margin-bottom:.6rem}
.coach-slider-body{display:flex;align-items:flex-start;gap:.75rem;min-height:44px;transition:opacity .25s}
.coach-fade-out{opacity:0}
.coach-slider-icon{font-size:1.05rem;flex-shrink:0;margin-top:1px}
.coach-slider-text{font-size:.85rem;color:var(--ink-2);line-height:1.6}
.coach-slider-footer{display:flex;align-items:center;gap:.65rem;margin-top:.85rem}
.coach-slider-dots{display:flex;gap:.3rem}
.coach-dot{width:7px;height:7px;border-radius:50%;background:var(--border-2);border:none;cursor:pointer;padding:0;transition:background .15s}
.coach-dot-active{background:var(--gold)}
.coach-progress-track{flex:1;height:2px;background:var(--border);border-radius:2px;overflow:hidden}
.coach-progress-bar{height:100%;background:var(--gold);border-radius:2px;transition:width .1s linear}

/* STAT CARDS */
.stats-scroll{display:flex;gap:.75rem;overflow-x:auto;margin-bottom:1.25rem;padding-bottom:.25rem;scrollbar-width:none}
.stats-scroll::-webkit-scrollbar{display:none}
.stat-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:1rem 1.2rem;min-width:160px;flex-shrink:0;text-align:left}
.stat-card-btn{cursor:pointer;transition:box-shadow .15s}
.stat-card-btn:hover{box-shadow:0 4px 16px rgba(0,0,0,.08)}
.stat-label{font-size:.65rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-3);margin-bottom:.5rem}
.stat-value{font-family:'Playfair Display',serif;font-size:1.6rem;font-weight:500;color:var(--ink);line-height:1}
.stat-delta{font-size:.7rem;font-weight:600;margin-top:.35rem}
.stat-arrow{font-size:.7rem;color:var(--ink-3);margin-top:.25rem}
.delta-up{color:var(--green)}
.delta-down{color:var(--red)}

/* GRIDS */
.grid-2{display:grid;grid-template-columns:1fr;gap:1.25rem}
.grid-3{display:grid;grid-template-columns:repeat(2,1fr);gap:.85rem;margin-bottom:1.25rem}
@media(min-width:580px){.grid-2{grid-template-columns:1fr 1fr}}
@media(min-width:640px){.grid-3{grid-template-columns:repeat(3,1fr)}}

/* BAR CHART */
.bar-chart{display:flex;align-items:flex-end;gap:4px;height:72px;width:100%}
.bar{flex:1;background:var(--border);border-radius:4px 4px 0 0;transition:height .3s ease;min-height:4px}
.bar.peak{background:linear-gradient(to top,#a8863d,#d4a952)}
.bar-labels{display:flex;justify-content:space-between;margin-top:.45rem}
.bar-lbl{flex:1;text-align:center;font-size:.6rem;color:var(--ink-3)}

/* REVENUE PANEL */
.rev-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:100;display:flex;align-items:flex-end;justify-content:center}
.rev-panel{background:var(--surface);border-radius:18px 18px 0 0;width:100%;max-width:640px;padding:1.5rem 1.5rem 2.5rem;box-shadow:0 -8px 48px rgba(0,0,0,.18)}
.rev-panel-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1.25rem}
.rev-panel-title{font-family:'Playfair Display',serif;font-size:1.25rem;color:var(--ink)}
.rev-panel-sub{font-size:.78rem;color:var(--ink-3);margin-top:2px;text-transform:capitalize}
.rev-close{background:var(--bg);border:none;width:30px;height:30px;border-radius:50%;cursor:pointer;color:var(--ink-3);font-size:.85rem;display:flex;align-items:center;justify-content:center}
.rev-total{font-family:'Playfair Display',serif;font-size:2rem;color:var(--ink);margin-bottom:1.25rem}
.rev-chart-wrap{position:relative;margin-bottom:1rem}
.rev-axis{position:relative;height:18px;margin-top:4px;font-size:.6rem;color:var(--ink-3)}
.rev-pills{display:flex;gap:.65rem;flex-wrap:wrap;margin-bottom:1.1rem}
.rev-pill{display:flex;align-items:center;gap:.5rem;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:.5rem .75rem;flex:1;min-width:120px}
.rev-pill-icon{width:24px;height:24px;border-radius:50%;background:rgba(46,125,82,.1);display:flex;align-items:center;justify-content:center;color:var(--green);font-size:.8rem;font-weight:700;flex-shrink:0}
.rev-pill-avg{background:rgba(197,169,106,.1);color:var(--gold)}
.rev-pill-low{background:rgba(192,57,43,.08);color:var(--red)}
.rev-pill-label{font-size:.65rem;color:var(--ink-3);font-weight:500}
.rev-pill-val{font-size:.82rem;font-weight:600;color:var(--ink)}
.rev-narrative{font-size:.82rem;color:var(--ink-2);line-height:1.7;padding:.85rem 1rem;background:var(--bg);border-radius:8px;border:1px solid var(--border)}

/* CALENDAR */
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}
.cal-dname{text-align:center;font-size:.6rem;font-weight:600;color:var(--ink-3);padding:3px 0}
.cal-d{text-align:center;font-size:.75rem;padding:5px 2px;border-radius:6px;color:var(--ink);position:relative;transition:background .1s}
.cal-d:hover{background:var(--gold-lt)}
.cal-empty{pointer-events:none}
.cal-d.today{background:var(--ink);color:#fff;font-weight:700}
.cal-d.today .cal-dot{display:none}
.cal-d.cal-blocked{color:var(--red);background:rgba(192,57,43,.06)}
.cal-d.cal-has-appt{font-weight:700}
.cal-dot{position:absolute;bottom:2px;left:50%;transform:translateX(-50%);width:5px;height:5px;border-radius:50%}
.cal-dot-appt{background:var(--gold)}
.cal-dot-blocked{background:var(--red)}
.cal-nav-btn{background:var(--bg);border:1px solid var(--border);width:28px;height:28px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1rem;color:var(--ink-2)}

/* GOAL / TOP SERVICE */
.goal-track{height:7px;background:var(--bg);border-radius:10px;overflow:hidden;border:1px solid var(--border)}
.goal-fill{height:100%;background:linear-gradient(90deg,#a8863d,var(--gold));border-radius:10px;transition:width 1s cubic-bezier(.4,0,.2,1)}
.goal-hint{font-size:.72rem;color:var(--ink-3);margin-top:.65rem;line-height:1.5}
.top-badge{display:flex;align-items:center;gap:.25rem;font-size:.7rem;font-weight:700;color:var(--gold);background:var(--gold-lt);padding:.2rem .55rem;border-radius:20px}
.top-badge svg{width:10px;height:10px}
.top-track{height:7px;background:var(--bg);border-radius:10px;overflow:hidden;border:1px solid var(--border)}
.top-fill{height:100%;background:linear-gradient(90deg,#a8863d,var(--gold));border-radius:10px}

/* MILESTONE */
.milestone-banner{display:flex;align-items:center;gap:.75rem;background:linear-gradient(135deg,rgba(197,169,106,.08),rgba(181,137,58,.12));border:1px solid var(--gold-dim);border-radius:12px;padding:.8rem 1.1rem;margin-bottom:1.25rem;animation:milestoneIn .4s ease}
@keyframes milestoneIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
.milestone-icon{font-size:1.15rem;flex-shrink:0}
.milestone-text{font-size:.82rem;color:var(--ink-2);line-height:1.55}

/* BADGES */
.badge{display:inline-flex;align-items:center;gap:.25rem;font-size:.65rem;font-weight:600;padding:.2rem .55rem;border-radius:20px;white-space:nowrap}
.badge-confirmed{background:rgba(46,125,82,.08);color:var(--green)}
.badge-pending{background:rgba(192,135,43,.1);color:var(--orange)}
.badge-cancelled,.badge-low{background:rgba(192,57,43,.07);color:var(--red)}
.badge-vip{background:var(--gold-lt);color:var(--gold)}
.badge-new{background:rgba(46,100,200,.07);color:#2463c8}

/* BUTTONS */
.btn{display:inline-flex;align-items:center;gap:.45rem;padding:.5rem 1rem;border-radius:9px;border:none;cursor:pointer;font-family:inherit;font-size:.82rem;font-weight:500;transition:all .15s;white-space:nowrap}
.btn-primary{background:#1a1814;color:#fff}
.btn-primary:hover{opacity:.88}
.btn-primary:disabled{opacity:.45;cursor:not-allowed}
.btn-secondary{background:var(--bg);border:1px solid var(--border);color:var(--ink-2)}
.btn-secondary:hover{background:var(--surface)}
.btn-sm{font-size:.76rem;padding:.4rem .8rem}
.btn-xs{font-size:.72rem;padding:.3rem .65rem;border-radius:7px}

/* FORM FIELDS */
.field{display:flex;flex-direction:column;gap:.3rem}
.field label{font-size:.72rem;font-weight:600;color:var(--ink-3);text-transform:uppercase;letter-spacing:.05em}
.field input,.field textarea,.field select{padding:.55rem .8rem;border:1px solid var(--border-2);border-radius:8px;font-size:.88rem;font-family:inherit;color:var(--ink);background:var(--surface);outline:none;transition:border .15s}
.field input:focus,.field textarea:focus,.field select:focus{border-color:var(--gold)}
.field textarea{resize:vertical;line-height:1.5}

/* TABLE */
.tbl{width:100%;border-collapse:collapse;font-size:.82rem}
.tbl th{text-align:left;padding:.6rem 1rem;font-size:.65rem;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-3);border-bottom:1px solid var(--border)}
.tbl td{padding:.75rem 1rem;border-bottom:1px solid var(--border);color:var(--ink-2)}
.tbl tr:last-child td{border-bottom:none}
.tbl-name{font-weight:600;color:var(--ink)}
.tbl-amount{font-family:'Playfair Display',serif;font-size:.92rem;color:var(--ink)}

/* EMPTY STATE */
.empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2.5rem 1.5rem;text-align:center}
.empty-icon{width:40px;height:40px;color:var(--ink-3);margin-bottom:1rem}
.empty-title{font-family:'Playfair Display',serif;font-size:1rem;color:var(--ink);margin-bottom:.4rem}
.empty-sub{font-size:.8rem;color:var(--ink-3);line-height:1.6}

/* PRODUCTS */
.prod-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;cursor:pointer;transition:box-shadow .18s}
.prod-card:hover{box-shadow:0 4px 20px rgba(0,0,0,.1)}
.prod-img{height:140px;overflow:hidden;background:var(--bg)}
.prod-body{padding:.85rem}
.prod-name{font-weight:600;font-size:.85rem;color:var(--ink);margin-bottom:.25rem}
.prod-price{font-family:'Playfair Display',serif;font-size:.95rem;color:var(--ink);margin-bottom:.35rem}

/* FORMATIONS */
.formation-row{display:flex;align-items:center;gap:1rem;padding:1rem 1.4rem;border-bottom:1px solid var(--border);transition:background .12s}
.formation-row:last-child{border-bottom:none}
.formation-icon-block{width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:var(--gold-lt);border-radius:8px;flex-shrink:0;color:var(--gold)}
.formation-icon-block svg{width:16px;height:16px}
.formation-info{flex:1;min-width:0}
.formation-name{font-weight:600;font-size:.88rem;color:var(--ink);margin-bottom:.2rem}
.formation-desc{font-size:.75rem;color:var(--ink-3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.formation-meta{display:flex;align-items:center;gap:.3rem;font-size:.7rem;color:var(--ink-3)}
.formation-price{font-family:'Playfair Display',serif;font-size:.95rem;color:var(--ink);flex-shrink:0}

/* SETTINGS */
.settings-section-row{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.4rem;cursor:pointer;transition:background .12s}
.settings-section-row:hover{background:var(--bg)}
.settings-section-label{font-weight:600;font-size:.88rem;color:var(--ink)}
.settings-section-sub{font-size:.74rem;color:var(--ink-3);margin-top:2px}
.settings-back-btn{display:inline-flex;align-items:center;gap:.4rem;background:none;border:none;cursor:pointer;color:var(--ink-3);font-size:.8rem;font-family:inherit;padding:0;margin-bottom:.35rem}
.settings-row{display:flex;align-items:center;justify-content:space-between;padding:.75rem 0;border-bottom:1px solid var(--border)}
.settings-row:last-child{border-bottom:none}
.settings-row-label{font-size:.88rem;color:var(--ink)}

/* TOGGLE */
.toggle-wrap{position:relative;display:flex;align-items:center;cursor:pointer}
.toggle-wrap input{position:absolute;opacity:0;pointer-events:none}
.toggle-track{width:42px;height:24px;background:var(--border-2);border-radius:12px;transition:background .2s}
.toggle-wrap input:checked~.toggle-track{background:var(--gold)}
.toggle-thumb{position:absolute;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:left .2s;box-shadow:0 1px 3px rgba(0,0,0,.2)}
.toggle-wrap input:checked~.toggle-track~.toggle-thumb{left:21px}

/* THEME */
.theme-options{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1rem}
.theme-option{border:2px solid var(--border);border-radius:12px;padding:.85rem;cursor:pointer;transition:all .15s}
.theme-option.selected{border-color:var(--gold);background:var(--gold-lt)}
.theme-preview{display:flex;gap:.3rem;height:50px;border-radius:6px;overflow:hidden;background:var(--bg)}
.tp-ls{width:30%;background:#e8e5e0}
.tp-lm{flex:1;padding:.3rem;display:flex;flex-direction:column;gap:.2rem}
.tp-lb{height:6px;background:#d8d4cd;border-radius:2px}
.tp-ds{width:30%;background:#1e1b17}
.tp-dm{flex:1;padding:.3rem;display:flex;flex-direction:column;gap:.2rem;background:#141210}
.tp-db{height:6px;background:#2a2620;border-radius:2px}
.theme-label{display:flex;align-items:center;justify-content:space-between;font-size:.82rem;font-weight:500;color:var(--ink);margin-top:.55rem}
.theme-check{width:18px;height:18px;border-radius:50%;background:var(--gold);display:flex;align-items:center;justify-content:center;color:#fff}
.theme-check svg{width:10px;height:10px}

/* LANGUAGE */
.lang-row{display:flex;align-items:center;justify-content:space-between;padding:.85rem 1rem;border:1px solid var(--border);border-radius:10px;cursor:pointer;transition:all .15s}
.lang-row:hover{border-color:var(--gold-dim);background:var(--gold-lt)}
.lang-active{border-color:var(--gold) !important;background:var(--gold-lt)}
.lang-label{font-weight:600;font-size:.88rem;color:var(--ink)}
.lang-sub{font-size:.72rem;color:var(--ink-3);margin-top:2px}
.lang-check-circle{width:22px;height:22px;border-radius:50%;border:2px solid var(--border-2);display:flex;align-items:center;justify-content:center;transition:all .15s}
.lang-check-active{background:var(--gold);border-color:var(--gold)}

/* AVAILABILITY — FIX 10 */
.avail-time{padding:.4rem .6rem;border:1px solid var(--border-2);border-radius:8px;font-size:.82rem;font-family:inherit;color:var(--ink);background:var(--surface);outline:none;transition:border .15s;width:100%}
.avail-time:focus{border-color:var(--gold)}

/* TOAST */
.toast-wrap{position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);z-index:500;pointer-events:none}
.toast{background:var(--ink);color:#fff;padding:.65rem 1.25rem;border-radius:10px;font-size:.82rem;font-weight:500;box-shadow:0 8px 28px rgba(0,0,0,.25);animation:toastIn .3s ease}
@keyframes toastIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}

/* CLIENT PAGE */
.cp-topbar{background:#fff;border-bottom:1px solid #ece9e4;display:flex;align-items:center;justify-content:space-between;padding:.8rem 1.25rem;position:sticky;top:0;z-index:10}
.cp-logo{font-family:'Playfair Display',serif;font-size:1.1rem;color:#1a1814;font-weight:500}
.cp-ghost{background:none;border:1px solid #e0dcd6;border-radius:8px;padding:.35rem .8rem;font-size:.78rem;cursor:pointer;font-family:inherit;color:#7a7774}
.cp-hero{background:linear-gradient(160deg,#1a1814,#2d2920);padding:2.5rem 1.5rem 2rem;text-align:center}
.cp-av{width:72px;height:72px;border-radius:50%;background:var(--gold);display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:1.6rem;color:#1a1814;margin:0 auto 1rem;font-weight:700}
.cp-name{font-family:'Playfair Display',serif;font-size:1.5rem;color:#fff;margin-bottom:.35rem}
.cp-bio{font-size:.82rem;color:rgba(255,255,255,.55);line-height:1.6}
.cp-stats{display:flex;justify-content:center;gap:2rem;margin-top:1.5rem;padding-top:1.25rem;border-top:1px solid rgba(255,255,255,.08)}
.cp-sval{font-family:'Playfair Display',serif;font-size:1.25rem;color:#fff;font-weight:500}
.cp-slbl{font-size:.68rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.08em;margin-top:2px}
.cp-nav{display:flex;background:#fff;border-bottom:1px solid #ece9e4}
.cp-tab{flex:1;text-align:center;padding:.85rem .5rem;font-size:.82rem;font-weight:500;color:#7a7774;cursor:pointer;border-bottom:2px solid transparent;transition:all .15s}
.cp-tab.active{color:#1a1814;border-color:var(--gold)}
.cp-body{padding:1.5rem 1.25rem;background:#faf8f5;min-height:300px}
.cp-stitle{font-family:'Playfair Display',serif;font-size:1.1rem;color:#1a1814;margin-bottom:1rem}
.cp-footer{text-align:center;padding:2rem;font-size:.75rem;color:#b0aba4;background:#faf8f5}
.svc-list{display:flex;flex-direction:column;gap:.65rem}
.svc-row{display:flex;align-items:center;gap:1rem;background:#fff;border:1px solid #ece9e4;border-radius:12px;padding:.9rem 1rem;cursor:pointer}
.svc-bar{width:3px;height:32px;background:linear-gradient(to bottom,var(--gold),#e8c87a);border-radius:2px;flex-shrink:0}
.svc-info{flex:1}
.svc-name{font-weight:600;font-size:.88rem;color:#1a1814}
.svc-dur{font-size:.72rem;color:#7a7774;margin-top:2px}
.svc-price{font-family:'Playfair Display',serif;font-size:.95rem;color:#1a1814;flex-shrink:0}
.bk-btn{background:#1a1814;color:#fff;border:none;border-radius:8px;padding:.4rem .9rem;font-size:.78rem;font-weight:600;cursor:pointer;font-family:inherit}
.shop-grid{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}
.shop-card{background:#fff;border:1px solid #ece9e4;border-radius:12px;overflow:hidden}
.shop-img{height:120px;background:#f0ece4;display:flex;align-items:center;justify-content:center;font-size:.7rem;color:#c8c2b8;font-weight:600;letter-spacing:.05em}
.shop-body{padding:.85rem}
.shop-name{font-weight:600;font-size:.85rem;color:#1a1814;margin-bottom:.3rem}
.shop-price{font-family:'Playfair Display',serif;font-size:.9rem;color:#1a1814;margin-bottom:.65rem}
.shop-btn{width:100%;background:#1a1814;color:#fff;border:none;border-radius:8px;padding:.45rem;font-size:.78rem;font-weight:600;cursor:pointer;font-family:inherit}
.fm-card{display:flex;align-items:center;gap:1rem;background:#fff;border:1px solid #ece9e4;border-radius:12px;padding:1rem;margin-bottom:.65rem}
.fm-idx{font-family:'Playfair Display',serif;font-size:1.2rem;color:#c8c2b8;width:28px;flex-shrink:0}
.fm-info{flex:1;min-width:0}
.fm-name{font-weight:600;font-size:.88rem;color:#1a1814;margin-bottom:.2rem}
.fm-desc{font-size:.75rem;color:#7a7774;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fm-tags{margin-top:.35rem;display:flex;gap:.35rem}
.fm-tags span{background:#f5f3ef;border:1px solid #e8e4de;border-radius:20px;padding:.15rem .6rem;font-size:.68rem;color:#7a7774}
.fm-price{font-family:'Playfair Display',serif;font-size:.95rem;color:#1a1814;flex-shrink:0}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:200;display:flex;align-items:flex-end;justify-content:center}
.modal{background:#fff;border-radius:18px 18px 0 0;width:100%;max-width:480px;padding:1.75rem;display:flex;flex-direction:column;gap:1rem;max-height:90vh;overflow-y:auto}
.modal-title{font-family:'Playfair Display',serif;font-size:1.25rem;color:#1a1814}
.modal-sub{font-size:.8rem;color:#7a7774}
.modal-actions{display:flex;gap:.65rem;padding-top:.25rem}
`
