import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// ── TRANSLATIONS ──────────────────────────────────────────────────────────────
const LANG = {
  en: {
    morning:'Good morning',afternoon:'Good afternoon',evening:'Good evening',
    nav_overview:'Overview',nav_appointments:'Appointments',nav_services:'Services',
    nav_products:'Products',nav_formations:'Formations',nav_clients:'Clients',
    nav_availability:'Availability',nav_settings:'Settings',nav_signout:'Sign out',
    copy_link:'Copy link',new_appt:'New appointment',link_copied:'Booking link copied!',
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
    next_appt:'Next appointment',reschedule:'Reschedule',message:'Message',
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
    note_title:'Day note',note_placeholder:'Add a note for this day — debrief, reminder, anything...',
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
    nav_overview:'Accueil',nav_appointments:'Rendez-vous',nav_services:'Services',
    nav_products:'Produits',nav_formations:'Formations',nav_clients:'Clients',
    nav_availability:'Disponibilités',nav_settings:'Paramètres',nav_signout:'Déconnexion',
    copy_link:'Copier le lien',new_appt:'Nouveau rendez-vous',link_copied:'Lien copié !',
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
    next_appt:'Prochain rendez-vous',reschedule:'Reprogrammer',message:'Message',
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
    note_title:'Note du jour',note_placeholder:'Ajouter une note pour ce jour — débrief, rappel, anything...',
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
    nav_overview:'Inicio',nav_appointments:'Citas',nav_services:'Servicios',
    nav_products:'Productos',nav_formations:'Formaciones',nav_clients:'Clientes',
    nav_availability:'Disponibilidad',nav_settings:'Configuración',nav_signout:'Cerrar sesión',
    copy_link:'Copiar enlace',new_appt:'Nueva cita',link_copied:'¡Enlace copiado!',
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
    next_appt:'Próxima cita',reschedule:'Reprogramar',message:'Mensaje',
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
    note_title:'Nota del día',note_placeholder:'Agrega una nota para este día — resumen, recordatorio...',
    save_note:'Guardar nota',note_saved:'Guardado ✓',past_day:'Este día ya pasó.',
    add_booking:'+ Agregar cita',new_booking:'Nueva cita',booking_client:'Nombre del cliente',
    booking_phone:'Teléfono (opcional)',booking_email:'Correo (opcional)',
    booking_service:'Servicio',booking_time:'Hora',booking_amount:'Monto',
    booking_status:'Estado',booking_save:'Guardar cita',booking_saving:'Guardando…',
    booking_saved:'¡Cita agregada!',booking_confirmed:'Confirmada',booking_pending:'Pendiente',
    booking_no_service:'Sin servicio',
  }
}
function t(lang,key){return(LANG[lang]||LANG.en)[key]||LANG.en[key]||key}


// ── UTILS ─────────────────────────────────────────────────────────────────────
const fmtRev  = n => `$${Number(n||0).toLocaleString()}`
const fmtFree = n => n===0 ? 'Free' : `$${Number(n||0).toLocaleString()}`

function greet() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}
function firstName(ws, session) {
  // Personal name from Supabase auth metadata (set during signup)
  const meta = session?.user?.user_metadata
  if (meta?.full_name) return meta.full_name.trim().split(' ')[0]
  if (meta?.first_name) return meta.first_name.trim()
  if (meta?.name) return meta.name.trim().split(' ')[0]
  // Fall back to email prefix — never use business name for a greeting
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
    const t = new Date(a.scheduled_at)
    return a.status==='confirmed' && t>=sw && t<ew
  }).reduce((s,a)=>s+Number(a.amount||0),0)
}
function monthRevenue(appts, monthOffset=0) {
  const now = new Date()
  const y = now.getFullYear(), m = now.getMonth()+monthOffset
  return appts.filter(a => {
    const t = new Date(a.scheduled_at)
    return a.status==='confirmed' && t.getFullYear()===y && t.getMonth()===m
  }).reduce((s,a)=>s+Number(a.amount||0),0)
}
function pct(a,b) { if(!b) return null; return Math.round(((a-b)/b)*100) }

// FIX: helper to get service name from joined appointment row
function svcName(a) { return a.services?.name || a.service_name || '—' }

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
  block: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6.5"/><path d="M3.5 3.5l9 9"/></svg>,
}

// ── COUNTDOWN HOOK ────────────────────────────────────────────────────────────
function useCountdown(targetDate) {
  const [label, setLabel] = useState('')
  useEffect(() => {
    if (!targetDate) return
    const tick = () => {
      const diff = new Date(targetDate) - new Date()
      if (diff <= 0) { setLabel('Now'); return }
      const totalMins = Math.floor(diff / 60000)
      const days  = Math.floor(totalMins / 1440)
      const hours = Math.floor((totalMins % 1440) / 60)
      const mins  = totalMins % 60
      if (days > 1 && hours > 0) setLabel(`in ${days} days ${hours}h`)
      else if (days > 1)         setLabel(`in ${days} days`)
      else if (days === 1 && hours > 0) setLabel(`in 1 day ${hours}h`)
      else if (days === 1)       setLabel(`in 1 day`)
      else if (hours > 0)        setLabel(`in ${hours}h ${mins}min`)
      else                       setLabel(`in ${mins} min`)
    }
    tick()
    const t = setInterval(tick, 30000)
    return () => clearInterval(t)
  }, [targetDate])
  return label
}

// ── RESCHEDULE MODAL ─────────────────────────────────────────────────────────
function RescheduleModal({ appt, onClose, onSaved, toast }) {
  const now      = new Date()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [day, setDay]     = useState(null)
  const [time, setTime]   = useState('09:00')
  const [saving, setSaving] = useState(false)

  const firstDOW = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthLabel  = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setDay(null)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setDay(null)
  }

  async function save() {
    if (!day || !time) return toast('Pick a date and time first.')
    const [h, m] = time.split(':')
    const dt = new Date(year, month, day, parseInt(h), parseInt(m))
    if (dt <= new Date()) return toast('Please choose a future date and time.')
    setSaving(true)
    const { error } = await supabase
      .from('appointments')
      .update({ scheduled_at: dt.toISOString() })
      .eq('id', appt.id)
    setSaving(false)
    if (error) { toast('Error rescheduling.'); return }
    toast(`Rescheduled to ${dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${time}`)
    onSaved()
    onClose()
  }

  const cells = []
  for (let i = 0; i < firstDOW; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}} onClick={onClose}>
      <div style={{background:'var(--surface)',borderRadius:16,padding:'1.75rem',width:'100%',maxWidth:360,boxShadow:'0 24px 64px rgba(0,0,0,.2)'}} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.25rem'}}>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',color:'var(--ink)'}}>Reschedule</div>
            <div style={{fontSize:'.78rem',color:'var(--ink-3)',marginTop:2}}>{appt.client_name} · {svcName(appt)}</div>
          </div>
          <button style={{background:'var(--bg)',border:'none',width:30,height:30,borderRadius:'50%',cursor:'pointer',color:'var(--ink-3)',fontSize:'1rem',display:'flex',alignItems:'center',justifyContent:'center'}} onClick={onClose}>×</button>
        </div>

        {/* Month nav */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'.75rem'}}>
          <button className="cal-nav-btn" onClick={prevMonth}>&#8249;</button>
          <span style={{fontSize:'.84rem',fontWeight:600,color:'var(--ink)'}}>{monthLabel}</span>
          <button className="cal-nav-btn" onClick={nextMonth}>&#8250;</button>
        </div>

        {/* Calendar grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,marginBottom:'1rem'}}>
          {['S','M','T','W','T','F','S'].map((d,i)=>(
            <div key={i} style={{textAlign:'center',fontSize:'.62rem',fontWeight:600,color:'var(--ink-3)',padding:'3px 0'}}>{d}</div>
          ))}
          {cells.map((d, i) => {
            const isPast = d && new Date(year, month, d) < new Date(new Date().setHours(0,0,0,0))
            const isSelected = d === day
            return (
              <div
                key={i}
                onClick={() => d && !isPast && setDay(d)}
                style={{
                  textAlign:'center', fontSize:'.78rem', padding:'6px 2px', borderRadius:6,
                  cursor: d && !isPast ? 'pointer' : 'default',
                  background: isSelected ? 'var(--ink)' : 'transparent',
                  color: isSelected ? '#fff' : isPast ? 'var(--border-2)' : d ? 'var(--ink)' : 'transparent',
                  fontWeight: isSelected ? 600 : 400,
                  transition: 'background .12s',
                }}
              >{d||''}</div>
            )
          })}
        </div>

        {/* Time picker */}
        <div style={{marginBottom:'1.25rem'}}>
          <label style={{display:'block',fontSize:'.76rem',fontWeight:500,color:'var(--ink-3)',marginBottom:'.4rem'}}>TIME</label>
          <input
            type="time"
            value={time}
            onChange={e=>setTime(e.target.value)}
            style={{width:'100%',padding:'.6rem .9rem',border:'1px solid var(--border-2)',borderRadius:8,fontSize:'.88rem',fontFamily:'inherit',color:'var(--ink)',background:'var(--surface)',outline:'none'}}
          />
        </div>

        {/* Confirm */}
        <div style={{display:'flex',gap:'.6rem'}}>
          <button className="btn btn-secondary" style={{flex:1,justifyContent:'center'}} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{flex:1,justifyContent:'center'}} onClick={save} disabled={saving || !day}>
            {saving ? 'Saving…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── MESSAGE MODAL ─────────────────────────────────────────────────────────────
function MessageModal({ appt, onClose, workspace }) {
  const phone = appt.client_phone || ''
  const email = appt.client_email || ''
  const name  = appt.client_name  || 'there'
  const biz   = workspace?.name   || 'your stylist'

  const apptDate = new Date(appt.scheduled_at).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })
  const apptTime = new Date(appt.scheduled_at).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })

  const defaultSMS   = `Hi ${name}, this is ${biz}. Just a reminder about your appointment on ${apptDate} at ${apptTime}. Looking forward to seeing you!`
  const defaultEmail = `Hi ${name},\n\nThis is a message from ${biz} regarding your upcoming appointment on ${apptDate} at ${apptTime}.\n\nLooking forward to seeing you!\n\n— ${biz}`

  const [smsBody,   setSmsBody]   = useState(defaultSMS)
  const [emailBody, setEmailBody] = useState(defaultEmail)

  function openSMS() {
    const clean = phone.replace(/\s/g,'')
    window.open(`sms:${clean}?body=${encodeURIComponent(smsBody)}`)
  }
  function openEmail() {
    const subject = encodeURIComponent(`Your appointment with ${biz}`)
    const body    = encodeURIComponent(emailBody)
    window.open(`mailto:${email}?subject=${subject}&body=${body}`)
  }

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

        {/* SMS section */}
        {phone ? (
          <div style={{marginBottom:'1.25rem',padding:'1rem',background:'var(--bg)',borderRadius:10,border:'1px solid var(--border)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'.65rem'}}>
              <div>
                <div style={{fontSize:'.72rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.05em'}}>SMS</div>
                <div style={{fontSize:'.85rem',fontWeight:500,color:'var(--ink)',marginTop:2}}>{phone}</div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={openSMS}>Open SMS →</button>
            </div>
            <textarea
              value={smsBody}
              onChange={e=>setSmsBody(e.target.value)}
              rows={3}
              style={{width:'100%',padding:'.55rem .75rem',border:'1px solid var(--border-2)',borderRadius:7,fontSize:'.78rem',fontFamily:'inherit',color:'var(--ink)',background:'var(--surface)',resize:'vertical',outline:'none',lineHeight:1.5}}
            />
          </div>
        ) : (
          <div style={{marginBottom:'1.25rem',padding:'1rem',background:'var(--bg)',borderRadius:10,border:'1px solid var(--border)',fontSize:'.82rem',color:'var(--ink-3)'}}>
            No phone number on file for this client.
          </div>
        )}

        {/* Email section */}
        {email ? (
          <div style={{padding:'1rem',background:'var(--bg)',borderRadius:10,border:'1px solid var(--border)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'.65rem'}}>
              <div>
                <div style={{fontSize:'.72rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.05em'}}>Email</div>
                <div style={{fontSize:'.85rem',fontWeight:500,color:'var(--ink)',marginTop:2}}>{email}</div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={openEmail}>Open Mail →</button>
            </div>
            <textarea
              value={emailBody}
              onChange={e=>setEmailBody(e.target.value)}
              rows={4}
              style={{width:'100%',padding:'.55rem .75rem',border:'1px solid var(--border-2)',borderRadius:7,fontSize:'.78rem',fontFamily:'inherit',color:'var(--ink)',background:'var(--surface)',resize:'vertical',outline:'none',lineHeight:1.5}}
            />
          </div>
        ) : (
          <div style={{padding:'1rem',background:'var(--bg)',borderRadius:10,border:'1px solid var(--border)',fontSize:'.82rem',color:'var(--ink-3)'}}>
            No email address on file for this client.
          </div>
        )}

        <button className="btn btn-secondary" style={{width:'100%',justifyContent:'center',marginTop:'1rem'}} onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

// ── NEXT UP BANNER ────────────────────────────────────────────────────────────
function NextUpBanner({ appts, workspace, onReloaded, toast, lang='en' }) {
  const now = new Date()
  const next = appts
    .filter(a => new Date(a.scheduled_at) > now && a.status==='confirmed')
    .sort((a,b) => new Date(a.scheduled_at)-new Date(b.scheduled_at))[0]
  const countdown = useCountdown(next?.scheduled_at)

  const [showReschedule, setShowReschedule] = useState(false)
  const [showMessage,    setShowMessage]    = useState(false)

  if (!next) return null
  return (
    <>
      <div className="next-up-banner">
        <div className="next-up-left">
          <div className="next-up-icon">{I.clock}</div>
          <div>
            <div className="next-up-label">{t(lang,'next_appt')} {countdown}</div>
            <div className="next-up-name">{next.client_name} · {svcName(next)}</div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'.75rem',flexShrink:0}}>
          <div className="next-up-right" style={{marginRight:'.25rem'}}>
            <div className="next-up-time">{new Date(next.scheduled_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
            <div className="next-up-amount">{fmtRev(next.amount)}</div>
          </div>
          <button
            onClick={() => setShowReschedule(true)}
            style={{background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.15)',color:'rgba(255,255,255,.85)',borderRadius:8,padding:'.4rem .85rem',fontSize:'.75rem',fontWeight:500,cursor:'pointer',fontFamily:'inherit',transition:'background .15s',whiteSpace:'nowrap'}}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.18)'}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.1)'}
          >{t(lang,'reschedule')}</button>
          <button
            onClick={() => setShowMessage(true)}
            style={{background:'var(--gold)',border:'none',color:'var(--ink)',borderRadius:8,padding:'.4rem .85rem',fontSize:'.75rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit',transition:'opacity .15s',whiteSpace:'nowrap'}}
            onMouseEnter={e=>e.currentTarget.style.opacity='.85'}
            onMouseLeave={e=>e.currentTarget.style.opacity='1'}
          >{t(lang,'message')}</button>
        </div>
      </div>

      {showReschedule && (
        <RescheduleModal
          appt={next}
          onClose={() => setShowReschedule(false)}
          onSaved={onReloaded}
          toast={toast}
        />
      )}
      {showMessage && (
        <MessageModal
          appt={next}
          workspace={workspace}
          onClose={() => setShowMessage(false)}
        />
      )}
    </>
  )
}

// ── MILESTONE BANNER ──────────────────────────────────────────────────────────
function MilestoneBanner({ appts, stats }) {
  const now = new Date()
  const monthAppts = appts.filter(a => {
    const t = new Date(a.scheduled_at)
    return t.getFullYear()===now.getFullYear() && t.getMonth()===now.getMonth()
  })
  const confirmedCount = monthAppts.filter(a=>a.status==='confirmed').length
  const mRev = monthRevenue(appts)
  const milestones = []
  if (confirmedCount >= 1 && confirmedCount < 3) milestones.push({icon:'🎯', text:`First confirmed booking this month — you're building momentum.`})
  if (confirmedCount >= 5) milestones.push({icon:'💪', text:`${confirmedCount} bookings confirmed this month. You're on a roll.`})
  if (confirmedCount >= 10) milestones.push({icon:'🔥', text:`${confirmedCount} bookings this month. That's a full schedule.`})
  if (mRev >= 500 && mRev < 1000) milestones.push({icon:'⭐', text:`Over $500 earned this month — strong start.`})
  if (mRev >= 1000) milestones.push({icon:'🏆', text:`$1,000+ earned this month. You crossed a milestone.`})
  if (mRev >= 3000) milestones.push({icon:'🚀', text:`$3,000+ this month. Exceptional month for your business.`})
  if (stats.students >= 10) milestones.push({icon:'🎓', text:`${stats.students} students enrolled in your formations.`})
  if (!milestones.length) return null
  const m = milestones[milestones.length-1]
  return (
    <div className="milestone-banner">
      <span className="milestone-icon">{m.icon}</span>
      <span className="milestone-text">{m.text}</span>
    </div>
  )
}

// ── MONTHLY GOAL — reads/writes from Supabase ─────────────────────────────────
function MonthlyGoal({ appts, workspace, refetchWorkspace }) {
  // FIX: goal comes from workspace.monthly_revenue_goal (DB), not localStorage
  const goal = workspace?.monthly_revenue_goal || 3000
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(goal)
  const [saving, setSaving] = useState(false)

  const rev = monthRevenue(appts)
  const pctVal = Math.min(Math.round((rev/goal)*100), 100)
  const remaining = Math.max(goal-rev, 0)
  const confirmedAppts = appts.filter(a=>a.status==='confirmed'&&Number(a.amount)>0)
  const avgAppt = confirmedAppts.length ? rev/confirmedAppts.length : 0
  const apptNeeded = avgAppt > 0 ? Math.ceil(remaining/avgAppt) : null
  const monthName = new Date().toLocaleDateString('en-US',{month:'long'})
  const [displayPct, setDisplayPct] = useState(0)
  useEffect(()=>{ const t=setTimeout(()=>setDisplayPct(pctVal),120); return()=>clearTimeout(t) },[pctVal])

  async function saveGoal() {
    if (!workspace?.id) return
    setSaving(true)
    await supabase.from('workspaces')
      .update({ monthly_revenue_goal: draft })
      .eq('id', workspace.id)
    await refetchWorkspace()
    setSaving(false)
    setEditing(false)
  }

  return (
    <div className="card" style={{marginBottom:0}}>
      <div className="card-head">
        <div>
          <div className="card-title">Revenue Goal — {monthName}</div>
          {!editing && <div className="card-sub">{fmtRev(rev)} of {fmtRev(goal)}</div>}
        </div>
        {editing ? (
          <div style={{display:'flex',gap:'.4rem',alignItems:'center'}}>
            <input type="number" value={draft} onChange={e=>setDraft(parseInt(e.target.value)||0)}
              style={{width:'90px',padding:'.3rem .6rem',border:'1px solid var(--gold)',borderRadius:'6px',fontSize:'.82rem',fontFamily:'inherit',color:'var(--ink)',background:'var(--surface)'}}/>
            <button className="btn btn-primary btn-xs" onClick={saveGoal} disabled={saving}>{saving?'…':'Save'}</button>
            <button className="btn btn-secondary btn-xs" onClick={()=>setEditing(false)}>✕</button>
          </div>
        ) : (
          <button className="btn btn-secondary btn-xs" onClick={()=>{setDraft(goal);setEditing(true)}}>Edit goal</button>
        )}
      </div>
      <div style={{padding:'1.25rem 1.4rem'}}>
        <div className="goal-track">
          <div className="goal-fill" style={{width:`${displayPct}%`}}/>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:'.5rem',fontSize:'.72rem',color:'var(--ink-3)'}}>
          <span style={{color:pctVal>=100?'var(--green)':'var(--ink-3)',fontWeight:pctVal>=100?600:400}}>
            {pctVal>=100?'🎉 Goal reached!':`${pctVal}% reached`}
          </span>
          <span>{fmtRev(remaining)} remaining</span>
        </div>
        {remaining>0&&apptNeeded&&(
          <div className="goal-hint">
            At your average rate, <strong>{apptNeeded} more appointment{apptNeeded>1?'s':''}</strong> will get you there.
          </div>
        )}
      </div>
    </div>
  )
}

// ── TOP SERVICE INSIGHT ───────────────────────────────────────────────────────
function TopServiceInsight({ appts }) {
  const map = {}
  appts.filter(a=>a.status==='confirmed').forEach(a=>{
    const name = svcName(a)
    if(name==='—') return
    if(!map[name]) map[name]={count:0,rev:0}
    map[name].count++; map[name].rev+=Number(a.amount||0)
  })
  const entries = Object.entries(map).sort((a,b)=>b[1].rev-a[1].rev)
  if(!entries.length) return (
    <div className="card" style={{marginBottom:0}}>
      <div className="card-head"><div className="card-title">Your top service</div></div>
      <div style={{padding:'1.4rem',fontSize:'.82rem',color:'var(--ink-3)'}}>Confirm your first appointment to see which service drives your business.</div>
    </div>
  )
  const [name,{count,rev}] = entries[0]
  const totalRev = appts.filter(a=>a.status==='confirmed').reduce((s,a)=>s+Number(a.amount||0),0)
  const share = totalRev>0 ? Math.round((rev/totalRev)*100) : 0
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
        <div style={{fontSize:'.72rem',color:'var(--ink-3)',marginTop:'.4rem'}}>
          <strong style={{color:'var(--gold)'}}>{share}%</strong> of your total revenue
        </div>
      </div>
    </div>
  )
}

// ── MINI CALENDAR ─────────────────────────────────────────────────────────────
function MiniCal({ bookedDays=[] }) {
  const [offset,setOffset]=useState(0)
  const now=new Date(), y=now.getFullYear(), m=now.getMonth()+offset
  const first=new Date(y,m,1).getDay(), days=new Date(y,m+1,0).getDate()
  const label=new Date(y,m,1).toLocaleDateString('en-US',{month:'long',year:'numeric'})
  const today=now.getDate(), isCur=offset===0
  const cells=[]; for(let i=0;i<first;i++) cells.push(null); for(let d=1;d<=days;d++) cells.push(d)
  return (
    <div>
      <div className="cal-nav-row">
        <button className="cal-nav-btn" onClick={()=>setOffset(o=>o-1)}>&#8249;</button>
        <span>{label}</span>
        <button className="cal-nav-btn" onClick={()=>setOffset(o=>o+1)}>&#8250;</button>
      </div>
      <div className="cal-grid">
        {['S','M','T','W','T','F','S'].map((d,i)=><div key={i} className="cal-dname">{d}</div>)}
        {cells.map((d,i)=>(
          <div key={i} className={`cal-d${!d?' cal-empty':''}${d===today&&isCur?' today':''}${d&&bookedDays.includes(d)?' booked':''}`}>{d||''}</div>
        ))}
      </div>
    </div>
  )
}

// ── WEEK CHART ────────────────────────────────────────────────────────────────
function WeekChart({ appts }) {
  const sw=startOfWeek()
  const labels=['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const bars=labels.map((_,i)=>{
    const d=new Date(sw); d.setDate(sw.getDate()+i)
    const ds=d.toISOString().split('T')[0]
    return appts.filter(a=>a.scheduled_at?.startsWith(ds)&&a.status==='confirmed').reduce((s,a)=>s+Number(a.amount||0),0)
  })
  const max=Math.max(...bars,1), total=bars.reduce((s,v)=>s+v,0), peakIdx=bars.indexOf(Math.max(...bars))
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
      <div className="bar-chart">
        {bars.map((v,i)=><div key={i} className={`bar${i===peakIdx&&v>0?' peak':''}`} style={{height:`${Math.max((v/max)*100,4)}%`}}/>)}
      </div>
      <div className="bar-labels">{labels.map(l=><div key={l} className="bar-lbl">{l}</div>)}</div>
    </div>
  )
}

// ── REVENUE PANEL ─────────────────────────────────────────────────────────────
function RevenuePanel({ appts, onClose }) {
  const now=new Date(), year=now.getFullYear(), month=now.getMonth()
  const monthName=now.toLocaleDateString('fr-FR',{month:'long',year:'numeric'})
  const daysInMonth=new Date(year,month+1,0).getDate()
  const daily=Array.from({length:daysInMonth},(_,i)=>{
    const day=i+1, ds=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    const total=appts.filter(a=>a.scheduled_at?.startsWith(ds)&&a.status==='confirmed').reduce((s,a)=>s+Number(a.amount||0),0)
    return {day,total}
  })
  const nonZero=daily.filter(d=>d.total>0), maxVal=Math.max(...daily.map(d=>d.total),1)
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
            {daily.map(({day,total:t})=>{
              const barH=t>0?Math.max((t/maxVal)*88,6):3, x=(day-1)*14+2
              return <rect key={day} x={x} y={100-barH} width={10} height={barH} rx={3} fill={highest?.day===day?'#b5893a':t>0?'url(#bg2)':'#f0ece4'}/>
            })}
          </svg>
          <div className="rev-axis">
            {[1,8,15,22,daysInMonth].map(d=>(
              <span key={d} style={{position:'absolute',left:`${((d-1)/daysInMonth)*100}%`,transform:'translateX(-50%)'}}>{d}</span>
            ))}
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

// ── COACH SLIDER ─────────────────────────────────────────────────────────────
function CoachSlider({ appts, stats, workspace }) {
  const now = new Date()
  const tips = []

  // — Milestone tips (from MilestoneBanner logic)
  const monthAppts = appts.filter(a=>{const t=new Date(a.scheduled_at);return t.getFullYear()===now.getFullYear()&&t.getMonth()===now.getMonth()})
  const confirmedCount = monthAppts.filter(a=>a.status==='confirmed').length
  const mRev = monthRevenue(appts)
  if(confirmedCount>=1&&confirmedCount<3) tips.push({icon:'🎯',text:`First confirmed booking this month — you're building momentum.`})
  if(confirmedCount>=5) tips.push({icon:'💪',text:`${confirmedCount} bookings confirmed this month. You're on a roll.`})
  if(confirmedCount>=10) tips.push({icon:'🔥',text:`${confirmedCount} bookings this month. That's a full schedule.`})
  if(mRev>=500&&mRev<1000) tips.push({icon:'⭐',text:`Over $500 earned this month — strong start.`})
  if(mRev>=1000) tips.push({icon:'🏆',text:`$1,000+ earned this month. You crossed a milestone.`})
  if(mRev>=3000) tips.push({icon:'🚀',text:`$3,000+ this month. Exceptional month for your business.`})
  if(stats.students>=10) tips.push({icon:'🎓',text:`${stats.students} students enrolled in your formations.`})

  // — Coach insights
  const pending = appts.filter(a=>a.status==='pending')
  if(pending.length>0)
    tips.push({icon:'📋',text:`You have ${pending.length} unconfirmed booking${pending.length>1?'s':''} waiting. Confirming ${pending.length>1?'them':'it'} secures your client's commitment.`})
  const todayStr = now.toISOString().split('T')[0]
  const noReminder = appts.filter(a=>a.scheduled_at?.startsWith(todayStr)&&a.status==='confirmed'&&!a.reminder_sent_at)
  if(noReminder.length>0)
    tips.push({icon:'💬',text:`${noReminder.length} client${noReminder.length>1?'s have':' has'} not received a reminder for today. A quick message now reduces no-shows significantly.`})
  const goal = workspace?.monthly_revenue_goal||3000
  const pctG = Math.round((mRev/goal)*100)
  const remaining = Math.max(goal-mRev,0)
  const confirmed = appts.filter(a=>a.status==='confirmed'&&Number(a.amount)>0)
  const avg = confirmed.length ? mRev/confirmed.length : 0
  if(pctG<50&&avg>0){
    const needed=Math.ceil(remaining/avg)
    tips.push({icon:'📈',text:`You're at ${pctG}% of your ${now.toLocaleDateString('en-US',{month:'long'})} goal. ${needed} more appointment${needed>1?'s':''} at your average would close the gap.`})
  } else if(pctG>=50&&pctG<90){
    tips.push({icon:'📈',text:`You're at ${pctG}% of your monthly goal. Strong progress — keep your schedule filled.`})
  }
  const in3 = new Date(now.getTime()+3*24*60*60*1000)
  const upcoming = appts.filter(a=>{const d=new Date(a.scheduled_at);return d>now&&d<=in3&&a.status!=='cancelled'})
  if(upcoming.length===0)
    tips.push({icon:'🔗',text:'Your next 3 days are open. Sharing your booking link today could fill those slots before the week ends.'})

  const INTERVAL = 5000
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(()=>{
    if(tips.length<=1) return
    setProgress(0)
    const start = Date.now()
    const raf = requestAnimationFrame(function tick(){
      const pct = Math.min((Date.now()-start)/INTERVAL*100, 100)
      setProgress(pct)
      if(pct<100) requestAnimationFrame(tick)
    })
    const t = setTimeout(()=>{
      setVisible(false)
      setTimeout(()=>{
        setIdx(i=>(i+1)%tips.length)
        setVisible(true)
      }, 300)
    }, INTERVAL)
    return()=>{ clearTimeout(t); cancelAnimationFrame(raf) }
  }, [idx, tips.length])

  if(!tips.length) return null
  const tip = tips[idx]

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
            {tips.map((_,i)=>(
              <button key={i} className={`coach-dot${i===idx?' coach-dot-active':''}`}
                onClick={()=>{setVisible(false);setTimeout(()=>{setIdx(i);setVisible(true)},300)}}
              />
            ))}
          </div>
          <div className="coach-progress-track">
            <div className="coach-progress-bar" style={{width:`${progress}%`}}/>
          </div>
        </div>
      )}
    </div>
  )
}

// ── DAY PANEL ────────────────────────────────────────────────────────────────
function DayPanel({ dayStr, allAppts, blockedDates, onClose, onBlock, onUnblock, onBooked, workspace, lang='en' }) {
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [noteSaving, setNoteSaving] = useState(false)
  const [noteSaved, setNoteSaved] = useState(false)
  const [noteLoading, setNoteLoading] = useState(true)

  // Booking form state
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [services, setServices] = useState([])
  const [bookingForm, setBookingForm] = useState({
    client_name:'', client_phone:'', client_email:'',
    service_id:'', time:'09:00', amount:'', status:'confirmed'
  })
  const [bookingSaving, setBookingSaving] = useState(false)
  const [bookingDone, setBookingDone] = useState(false)

  const dayAppts = allAppts.filter(a=>a.scheduled_at?.startsWith(dayStr))
  const blocked = blockedDates.find(b=>b.blocked_date===dayStr)
  const label = new Date(dayStr+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',day:'numeric',month:'long'})

  const todayStr = new Date().toISOString().split('T')[0]
  const isPast = dayStr < todayStr
  const isToday = dayStr === todayStr

  // Load note
  useEffect(()=>{
    if(!workspace?.id) { setNoteLoading(false); return }
    setNoteLoading(true)
    supabase.from('day_notes')
      .select('note_text')
      .eq('workspace_id', workspace.id)
      .eq('note_date', dayStr)
      .maybeSingle()
      .then(({data})=>{ if(data?.note_text) setNote(data.note_text); setNoteLoading(false) })
  }, [dayStr, workspace?.id])

  // Load services when booking form opens
  useEffect(()=>{
    if(!showBookingForm || !workspace?.id) return
    supabase.from('services').select('id,name,price').eq('workspace_id',workspace.id).eq('is_active',true)
      .then(({data})=>setServices(data||[]))
  }, [showBookingForm, workspace?.id])

  async function saveNote() {
    if(!workspace?.id) return
    setNoteSaving(true); setNoteSaved(false)
    await supabase.from('day_notes').upsert(
      { workspace_id: workspace.id, note_date: dayStr, note_text: note, updated_at: new Date().toISOString() },
      { onConflict: 'workspace_id,note_date' }
    )
    setNoteSaving(false); setNoteSaved(true)
    setTimeout(()=>setNoteSaved(false), 2500)
  }

  async function saveBooking() {
    if(!bookingForm.client_name.trim() || !bookingForm.time) return
    setBookingSaving(true)
    // Build ISO datetime: combine selected date + time in local timezone
    const [h, m] = bookingForm.time.split(':')
    const dt = new Date(dayStr + 'T00:00:00')
    dt.setHours(parseInt(h), parseInt(m), 0, 0)

    const selectedSvc = services.find(s=>s.id===bookingForm.service_id)
    const payload = {
      workspace_id: workspace.id,
      client_name:  bookingForm.client_name.trim(),
      client_phone: bookingForm.client_phone.trim() || null,
      client_email: bookingForm.client_email.trim() || null,
      service_id:   bookingForm.service_id || null,
      service_name: selectedSvc?.name || null,
      scheduled_at: dt.toISOString(),
      amount:       parseFloat(bookingForm.amount) || 0,
      status:       bookingForm.status,
    }
    const { error } = await supabase.from('appointments').insert(payload)
    setBookingSaving(false)
    if(error) return
    setBookingDone(true)
    // Reset form and close it after short delay
    setTimeout(()=>{
      setBookingDone(false)
      setShowBookingForm(false)
      setBookingForm({ client_name:'', client_phone:'', client_email:'', service_id:'', time:'09:00', amount:'', status:'confirmed' })
      if(onBooked) onBooked()
    }, 1400)
  }

  function handleServiceChange(id) {
    const svc = services.find(s=>s.id===id)
    setBookingForm(f=>({ ...f, service_id: id, amount: svc?.price!=null ? String(svc.price) : f.amount }))
  }

  const dayRevenue = dayAppts.filter(a=>a.status==='confirmed').reduce((s,a)=>s+Number(a.amount||0),0)

  const inputStyle = {
    width:'100%', padding:'.55rem .75rem', border:'1px solid var(--border-2)',
    borderRadius:8, fontSize:'.82rem', fontFamily:'inherit', color:'var(--ink)',
    background:'var(--surface)', outline:'none', transition:'border .15s'
  }
  const labelStyle = { display:'block', fontSize:'.72rem', fontWeight:600, color:'var(--ink-3)', marginBottom:'.3rem', textTransform:'uppercase', letterSpacing:'.05em' }

  return (
    <div className="rev-overlay" onClick={onClose}>
      <div className="rev-panel" style={{maxHeight:'92vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div className="rev-panel-head">
          <div>
            <div className="rev-panel-title" style={{fontSize:'1.2rem',textTransform:'capitalize'}}>{label}</div>
            {isPast&&(
              <div style={{fontSize:'.72rem',color:'var(--ink-3)',marginTop:3,display:'flex',alignItems:'center',gap:'.3rem'}}>
                <span>📅</span> {t(lang,'past_day')}
                {dayRevenue>0&&<span style={{color:'var(--green)',fontWeight:600,marginLeft:4}}>· {fmtRev(dayRevenue)} earned</span>}
              </div>
            )}
            {isToday&&<div style={{fontSize:'.72rem',color:'var(--gold)',fontWeight:600,marginTop:3}}>Today</div>}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'.5rem'}}>
            {/* Add booking button — only for non-past, non-blocked days */}
            {!isPast&&!blocked&&(
              <button
                className={`btn btn-xs ${showBookingForm?'btn-secondary':'btn-primary'}`}
                onClick={()=>setShowBookingForm(s=>!s)}
                style={{whiteSpace:'nowrap'}}
              >
                {showBookingForm ? '✕ Cancel' : t(lang,'add_booking')}
              </button>
            )}
            <button className="rev-close" onClick={onClose}>&#10005;</button>
          </div>
        </div>

        {/* ── INLINE BOOKING FORM ── */}
        {showBookingForm&&!isPast&&!blocked&&(
          <div style={{background:'var(--gold-lt)',border:'1px solid var(--gold-dim)',borderRadius:12,padding:'1.1rem 1.15rem',marginBottom:'1.25rem'}}>
            <div style={{fontSize:'.7rem',fontWeight:700,color:'var(--gold)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:'1rem'}}>
              {t(lang,'new_booking')}
            </div>

            {/* Row 1: client name + time */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.65rem',marginBottom:'.65rem'}}>
              <div>
                <label style={labelStyle}>{t(lang,'booking_client')} *</label>
                <input
                  style={inputStyle} value={bookingForm.client_name}
                  onChange={e=>setBookingForm(f=>({...f,client_name:e.target.value}))}
                  placeholder="Amara Diallo"
                  onFocus={e=>e.target.style.borderColor='var(--gold)'}
                  onBlur={e=>e.target.style.borderColor='var(--border-2)'}
                />
              </div>
              <div>
                <label style={labelStyle}>{t(lang,'booking_time')} *</label>
                <input
                  type="time" style={inputStyle} value={bookingForm.time}
                  onChange={e=>setBookingForm(f=>({...f,time:e.target.value}))}
                  onFocus={e=>e.target.style.borderColor='var(--gold)'}
                  onBlur={e=>e.target.style.borderColor='var(--border-2)'}
                />
              </div>
            </div>

            {/* Row 2: service + amount */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.65rem',marginBottom:'.65rem'}}>
              <div>
                <label style={labelStyle}>{t(lang,'booking_service')}</label>
                <select
                  style={{...inputStyle,cursor:'pointer'}}
                  value={bookingForm.service_id}
                  onChange={e=>handleServiceChange(e.target.value)}
                  onFocus={e=>e.target.style.borderColor='var(--gold)'}
                  onBlur={e=>e.target.style.borderColor='var(--border-2)'}
                >
                  <option value="">{t(lang,'booking_no_service')}</option>
                  {services.map(s=>(
                    <option key={s.id} value={s.id}>{s.name}{s.price>0?` — $${s.price}`:' — Free'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>{t(lang,'booking_amount')} ($)</label>
                <input
                  type="number" min="0" step="0.01" style={inputStyle}
                  value={bookingForm.amount}
                  onChange={e=>setBookingForm(f=>({...f,amount:e.target.value}))}
                  placeholder="0"
                  onFocus={e=>e.target.style.borderColor='var(--gold)'}
                  onBlur={e=>e.target.style.borderColor='var(--border-2)'}
                />
              </div>
            </div>

            {/* Row 3: phone + email */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.65rem',marginBottom:'.65rem'}}>
              <div>
                <label style={labelStyle}>{t(lang,'booking_phone')}</label>
                <input
                  type="tel" style={inputStyle} value={bookingForm.client_phone}
                  onChange={e=>setBookingForm(f=>({...f,client_phone:e.target.value}))}
                  placeholder="+1 (514) …"
                  onFocus={e=>e.target.style.borderColor='var(--gold)'}
                  onBlur={e=>e.target.style.borderColor='var(--border-2)'}
                />
              </div>
              <div>
                <label style={labelStyle}>{t(lang,'booking_email')}</label>
                <input
                  type="email" style={inputStyle} value={bookingForm.client_email}
                  onChange={e=>setBookingForm(f=>({...f,client_email:e.target.value}))}
                  placeholder="client@email.com"
                  onFocus={e=>e.target.style.borderColor='var(--gold)'}
                  onBlur={e=>e.target.style.borderColor='var(--border-2)'}
                />
              </div>
            </div>

            {/* Row 4: status toggle + save */}
            <div style={{display:'flex',alignItems:'center',gap:'.65rem',marginTop:'.25rem'}}>
              <div style={{display:'flex',background:'var(--surface)',border:'1px solid var(--border-2)',borderRadius:8,overflow:'hidden',flexShrink:0}}>
                {['confirmed','pending'].map(s=>(
                  <button
                    key={s}
                    onClick={()=>setBookingForm(f=>({...f,status:s}))}
                    style={{
                      padding:'.4rem .85rem',border:'none',cursor:'pointer',fontFamily:'inherit',
                      fontSize:'.75rem',fontWeight:500,transition:'all .15s',
                      background: bookingForm.status===s ? (s==='confirmed'?'var(--ink)':'#854d0e') : 'transparent',
                      color: bookingForm.status===s ? (s==='confirmed'?'#fff':'#fff') : 'var(--ink-3)'
                    }}
                  >
                    {s==='confirmed' ? t(lang,'booking_confirmed') : t(lang,'booking_pending')}
                  </button>
                ))}
              </div>
              <button
                className="btn btn-primary"
                style={{flex:1,justifyContent:'center',padding:'.55rem',background: bookingDone?'var(--green)':undefined}}
                onClick={saveBooking}
                disabled={bookingSaving||bookingDone||!bookingForm.client_name.trim()}
              >
                {bookingDone ? '✓ '+t(lang,'booking_saved') : bookingSaving ? t(lang,'booking_saving') : t(lang,'booking_save')}
              </button>
            </div>
          </div>
        )}

        {/* Appointments list */}
        {dayAppts.length>0?(
          <div style={{marginBottom:'1.25rem'}}>
            <div style={{fontSize:'.7rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:'.6rem'}}>
              {isPast ? 'What happened that day' : 'Appointments this day'}
            </div>
            {dayAppts.map(a=>(
              <div key={a.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'.75rem 1rem',background:'var(--bg)',borderRadius:10,marginBottom:'.5rem'}}>
                <div>
                  <div style={{fontWeight:600,fontSize:'.88rem',color:'var(--ink)'}}>{a.client_name}</div>
                  <div style={{fontSize:'.75rem',color:'var(--ink-3)',marginTop:2}}>{new Date(a.scheduled_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} · {svcName(a)}</div>
                </div>
                <div style={{display:'flex',gap:'.4rem',alignItems:'center'}}>
                  <span className={`badge badge-${a.status}`}>{a.status}</span>
                  {!isPast&&a.client_email&&(
                    <a className="btn btn-secondary btn-xs"
                      href={`mailto:${a.client_email}?subject=Reschedule%20your%20appointment&body=Hi%20${encodeURIComponent(a.client_name)}%2C%0A%0AWe%20need%20to%20reschedule%20your%20appointment%20on%20${encodeURIComponent(label)}.%0A%0APlease%20let%20us%20know%20your%20availability.`}
                      style={{textDecoration:'none'}}>
                      Message
                    </a>
                  )}
                </div>
              </div>
            ))}
            {!isPast&&dayAppts.length>0&&!blocked&&(
              <div style={{fontSize:'.78rem',color:'var(--ink-3)',padding:'.65rem .85rem',background:'var(--bg)',borderRadius:8,marginTop:'.5rem'}}>
                This day has bookings. Blocking it will not cancel them — message each client first.
              </div>
            )}
          </div>
        ):(
          <div style={{textAlign:'center',padding:'1.25rem 0',color:'var(--ink-3)',fontSize:'.85rem',marginBottom:'1rem'}}>
            {isPast ? 'No appointments were recorded for this day.' : 'No appointments on this day.'}
          </div>
        )}

        {/* Block section — only future/today */}
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
              <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:'.75rem'}} onClick={()=>{onBlock(dayStr,reason);setReason('')}}>
                {t(lang,'block_btn')}
              </button>
            </div>
          )
        )}

        {/* Notes — always visible */}
        <div style={{borderTop:'1px solid var(--border)',paddingTop:'1rem'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'.65rem'}}>
            <div style={{fontSize:'.7rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.08em'}}>
              📝 {t(lang,'note_title')}
            </div>
            {noteSaved&&<span style={{fontSize:'.72rem',color:'var(--green)',fontWeight:600}}>{t(lang,'note_saved')}</span>}
          </div>
          {noteLoading?(
            <div style={{fontSize:'.78rem',color:'var(--ink-3)',padding:'.5rem 0'}}>Loading...</div>
          ):(
            <>
              <textarea
                value={note}
                onChange={e=>{setNote(e.target.value);setNoteSaved(false)}}
                placeholder={t(lang,'note_placeholder')}
                rows={4}
                style={{width:'100%',padding:'.65rem .85rem',border:'1px solid var(--border-2)',borderRadius:9,fontSize:'.82rem',fontFamily:'inherit',color:'var(--ink)',background:'var(--bg)',resize:'vertical',outline:'none',lineHeight:1.6,transition:'border .15s'}}
                onFocus={e=>e.target.style.borderColor='var(--gold)'}
                onBlur={e=>e.target.style.borderColor='var(--border-2)'}
              />
              <button
                className="btn btn-secondary btn-sm"
                style={{marginTop:'.6rem',width:'100%',justifyContent:'center'}}
                onClick={saveNote}
                disabled={noteSaving}
              >
                {noteSaving?'Saving…':t(lang,'save_note')}
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  )
}

// ── INTERACTIVE CALENDAR ─────────────────────────────────────────────────────
function InteractiveCal({ allAppts, blockedDates, onDayClick }) {
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const firstDOW = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate()
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US',{month:'long',year:'numeric'})
  const todayD = now.getDate(), todayM = now.getMonth(), todayY = now.getFullYear()
  const apptDays = new Set(allAppts.map(a=>{
    if(!a.scheduled_at) return null
    const d=new Date(a.scheduled_at)
    if(d.getFullYear()===viewYear&&d.getMonth()===viewMonth) return d.getDate()
    return null
  }).filter(Boolean))
  const blockedSet = new Set(blockedDates.map(b=>{
    if(!b.blocked_date) return null
    const[y,m,d]=b.blocked_date.split('-').map(Number)
    if(y===viewYear&&m-1===viewMonth) return d
    return null
  }).filter(Boolean))
  const cells=[]
  for(let i=0;i<firstDOW;i++) cells.push(null)
  for(let d=1;d<=daysInMonth;d++) cells.push(d)
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
          const hasAppt=d&&apptDays.has(d)
          const isBlocked=d&&blockedSet.has(d)
          return (
            <div key={i}
              className={`cal-d${!d?' cal-empty':''}${isToday?' today':''}${isBlocked?' cal-blocked':''}${hasAppt&&!isBlocked?' cal-has-appt':''}`}
              style={d?{cursor:'pointer',position:'relative'}:{}}
              onClick={()=>d&&onDayClick(dayStr(d))}
            >
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
function Overview({ workspace, session, ownerData, toast, setPage, refetchWorkspace, lang='en' }) {
  const [appts,setAppts]=useState([])
  const [allAppts,setAllAppts]=useState([])
  const [blockedDates,setBlockedDates]=useState([])
  const [selectedDay,setSelectedDay]=useState(null)
  const [stats,setStats]=useState({revenue:0,appointments:0,pending:0,products:0,students:0})
  const [showRevenue,setShowRevenue]=useState(false)
  const [remindersSent,setRemindersSent]=useState([]) // [{name,time}] sent today

  useEffect(()=>{
    if(!workspace) return
    fetchData()
    const ch=supabase.channel('ov-rt')
      .on('postgres_changes',{event:'*',schema:'public',table:'appointments',filter:`workspace_id=eq.${workspace.id}`},fetchData)
      .subscribe()
    return()=>supabase.removeChannel(ch)
  },[workspace])

  async function fetchData(){
    const today=new Date().toISOString().split('T')[0]
    const[a,p,e,b]=await Promise.all([
      supabase.from('appointments').select('*, services(name)').eq('workspace_id',workspace.id),
      supabase.from('products').select('id').eq('workspace_id',workspace.id),
      supabase.from('enrollments').select('id').eq('workspace_id',workspace.id),
      supabase.from('blocked_dates').select('*').eq('workspace_id',workspace.id),
    ])
    const ad=a.data||[]
    setAllAppts(ad)
    setBlockedDates(b.data||[])
    setStats({
      revenue: ad.reduce((s,x)=>s+Number(x.amount||0),0),
      appointments: ad.length,
      pending: ad.filter(x=>x.status==='pending').length,
      products: (p.data||[]).length,
      students: (e.data||[]).length,
    })
    setAppts(ad.filter(x=>x.scheduled_at?.startsWith(today)).sort((a,b)=>new Date(a.scheduled_at)-new Date(b.scheduled_at)))
    // Detect reminders sent today (reminder_sent_at set within last 24h)
    const todayStart=new Date(); todayStart.setHours(0,0,0,0)
    const sent=ad.filter(x=>x.reminder_sent_at&&new Date(x.reminder_sent_at)>=todayStart)
    setRemindersSent(sent.map(x=>({name:x.client_name,time:new Date(x.reminder_sent_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})})))
  }

  async function handleBlock(dayStr, reason){
    // Find all active appointments on this date with client emails
    const affected = allAppts.filter(a=>
      a.scheduled_at?.startsWith(dayStr) &&
      a.status !== 'cancelled' &&
      a.client_email
    )
    // Insert block
    await supabase.from('blocked_dates').insert({workspace_id:workspace.id,blocked_date:dayStr,reason})
    // Auto-notify each client via Supabase Edge Function
    if(affected.length > 0){
      try {
        await supabase.functions.invoke('send-cancellation-notice', {
          body: {
            appointments: affected.map(a=>({
              client_name: a.client_name,
              client_email: a.client_email,
              scheduled_at: a.scheduled_at,
            })),
            reason,
            workspace_name: workspace.name || 'Your stylist',
            owner_email: workspace.email || null,
          }
        })
        toast(`Date blocked · ${affected.length} client${affected.length>1?'s':''} notified automatically ✓`)
      } catch(_) {
        toast('Date blocked. (Set up edge fn to auto-notify clients)')
      }
    } else {
      toast('Date blocked.')
    }
    setSelectedDay(null)
    fetchData()
  }
  async function handleUnblock(id){
    await supabase.from('blocked_dates').delete().eq('id',id)
    toast('Date unblocked.')
    setSelectedDay(null)
    fetchData()
  }

  const todayCount=appts.length
  const mRev=monthRevenue(allAppts,0), lastMRev=monthRevenue(allAppts,-1)
  const mDelta=pct(mRev,lastMRev)

  const cards=[
    {label:'Revenue — '+new Date().toLocaleDateString('en-US',{month:'long'}), value:fmtRev(mRev),
     delta:mDelta!==null?`${mDelta>=0?'↑':'↓'} ${Math.abs(mDelta)}% vs last month`:'All time', up:mDelta===null||mDelta>=0, page:'revenue'},
    {label:'Appointments', value:stats.appointments,
     delta:stats.pending>0?`${stats.pending} awaiting confirmation`:'All confirmed', up:stats.pending===0, page:'appointments'},
    {label:'Products', value:stats.products, delta:'Listed in your shop', up:true, page:'products'},
    {label:'Students', value:stats.students, delta:'Total enrollments', up:true, page:'formations'},
  ]

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">{(()=>{const h=new Date().getHours();return h<12?t(lang,'morning'):h<17?t(lang,'afternoon'):t(lang,'evening')})()}, {ownerData?.full_name?.trim().split(' ')[0] || firstName(workspace,session)}</div>
          <div className="page-sub">
            {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}
            {todayCount>0&&<span style={{color:'var(--gold)',fontWeight:500}}> — {todayCount} appointment{todayCount>1?'s':''} today</span>}
          </div>
        </div>
        <div className="head-actions">
          <button className="btn btn-secondary btn-sm" onClick={()=>{navigator.clipboard?.writeText(`https://beorganized.io/${workspace?.slug||''}`);toast(t(lang,'link_copied'))}}>
            <span style={{width:14,height:14,display:'flex'}}>{I.link}</span> {t(lang,'copy_link')}
          </button>
          <button className="btn btn-primary btn-sm" onClick={()=>toast('New appointment coming soon.')}>{t(lang,'new_appt')}</button>
        </div>
      </div>

      <NextUpBanner appts={allAppts} workspace={workspace} onReloaded={fetchData} toast={toast} lang={lang}/>
      {remindersSent.length>0&&(
        <div style={{background:'var(--ink)',borderRadius:10,padding:'.65rem 1.1rem',marginBottom:'1rem',display:'flex',alignItems:'center',gap:'.75rem',animation:'milestoneIn .35s ease'}}>
          <span style={{fontSize:'.9rem'}}>💬</span>
          <div style={{flex:1}}>
            <span style={{fontSize:'.75rem',color:'rgba(255,255,255,.5)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.06em'}}>Reminders sent today</span>
            <div style={{display:'flex',flexWrap:'wrap',gap:'.35rem',marginTop:'.3rem'}}>
              {remindersSent.map((r,i)=>(
                <span key={i} style={{background:'rgba(181,137,58,.2)',border:'1px solid rgba(181,137,58,.3)',borderRadius:20,padding:'2px 10px',fontSize:'.72rem',color:'var(--gold)',fontWeight:500}}>
                  ✓ {r.name} · {r.time}
                </span>
              ))}
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
          <div className="card-head"><div className="card-title">{t(lang,"revenue_week")}</div></div>
          <div className="card-body"><WeekChart appts={allAppts}/></div>
        </div>
        <MonthlyGoal appts={allAppts} workspace={workspace} refetchWorkspace={refetchWorkspace}/>
      </div>

      <div className="grid-2" style={{marginBottom:'1.25rem'}}>
        <TopServiceInsight appts={allAppts}/>
        <div className="card" style={{marginBottom:0}}>
          <div className="card-head">
            <div className="card-title">{t(lang,"calendar")}</div>
            <span style={{fontSize:'.72rem',color:'var(--ink-3)'}}>{t(lang,"tap_date")}</span>
          </div>
          <div className="card-body">
            <InteractiveCal allAppts={allAppts} blockedDates={blockedDates} onDayClick={setSelectedDay}/>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">{t(lang,"today_schedule")}</div>
          <span className="badge badge-confirmed">{todayCount} {t(lang,"confirmed")}</span>
        </div>
        {todayCount===0?(
          <div className="empty-state">
            <div className="empty-icon">{I.cal}</div>
            <div className="empty-title">{t(lang,"day_open")}</div>
            <div className="empty-sub">{t(lang,"share_link")}</div>
            <button className="btn btn-primary btn-sm" style={{marginTop:'.75rem'}}
              onClick={()=>{navigator.clipboard?.writeText(`https://beorganized.io/${workspace?.slug||''}`);toast(t(lang,"link_copied"))}}>
              {t(lang,"copy_booking_link")}
            </button>
          </div>
        ):(
          <table className="tbl">
            <thead><tr><th>Client</th><th>Service</th><th>Time</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>{appts.map(a=>(
              <tr key={a.id}>
                <td className="tbl-name">{a.client_name}</td>
                <td>{svcName(a)}</td>
                <td>{new Date(a.scheduled_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</td>
                <td className="tbl-amount">{fmtRev(a.amount)}</td>
                <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>

      {showRevenue&&<RevenuePanel appts={allAppts} onClose={()=>setShowRevenue(false)}/>}
      {selectedDay&&(
        <DayPanel
          dayStr={selectedDay}
          allAppts={allAppts}
          blockedDates={blockedDates}
          onClose={()=>setSelectedDay(null)}
          onBlock={handleBlock}
          onUnblock={handleUnblock}
          onBooked={fetchData}
          workspace={workspace}
          lang={lang}
        />
      )}
    </div>
  )
}

// ── APPOINTMENTS ──────────────────────────────────────────────────────────────
function Appointments({ workspace, toast, lang='en' }) {
  const [data,setData]=useState([])
  const [loading,setLoading]=useState(true)

  useEffect(()=>{
    if(!workspace) return
    fetchData()
    const ch=supabase.channel('appts-rt')
      .on('postgres_changes',{event:'*',schema:'public',table:'appointments',filter:`workspace_id=eq.${workspace.id}`},fetchData)
      .subscribe()
    return()=>supabase.removeChannel(ch)
  },[workspace])

  async function fetchData(){
    // FIX: join services(name)
    const{data}=await supabase.from('appointments')
      .select('*, services(name)')
      .eq('workspace_id',workspace.id)
      .order('scheduled_at',{ascending:false})
    setData(data||[]); setLoading(false)
  }
  async function confirm(id){await supabase.from('appointments').update({status:'confirmed'}).eq('id',id);toast('Confirmed.')}
  async function decline(id){await supabase.from('appointments').update({status:'cancelled'}).eq('id',id);toast('Declined.')}

  const pending=data.filter(a=>a.status==='pending')
  const rest=data.filter(a=>a.status!=='pending')

  return (
    <div>
      <div className="page-head"><div><div className="page-title">{t(lang,'appts_title')}</div><div className="page-sub">{t(lang,'appts_sub')}</div></div></div>

      <div className="grid-2" style={{marginBottom:'1.25rem'}}>
        {[
          {l:'This month',v:`${data.length}`,cls:'badge-new'},
          {l:'Confirmed', v:`${data.filter(a=>a.status==='confirmed').length}`,cls:'badge-confirmed'},
          {l:'Pending',   v:`${pending.length}`,cls:'badge-pending'},
          {l:'Cancelled', v:`${data.filter(a=>a.status==='cancelled').length}`,cls:'badge-low'},
        ].map((s,i)=>(
          <div key={i} className="card" style={{marginBottom:0}}>
            <div style={{padding:'.9rem 1.25rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div className="card-sub">{s.l}</div><span className={`badge ${s.cls}`}>{s.v}</span>
            </div>
          </div>
        ))}
      </div>

      {pending.length>0&&(
        <div className="card" style={{marginBottom:'1.25rem'}}>
          <div className="card-head"><div className="card-title">{t(lang,'pending_confirm')}</div><span className="badge badge-pending">{pending.length} {t(lang,'waiting')}</span></div>
          <table className="tbl">
            <thead><tr><th>Client</th><th>Service</th><th>Date</th><th>Time</th><th>Amount</th><th>Actions</th></tr></thead>
            <tbody>{pending.map(a=>(
              <tr key={a.id}>
                <td className="tbl-name">{a.client_name}</td>
                <td>{svcName(a)}</td>{/* FIX */}
                <td>{new Date(a.scheduled_at).toLocaleDateString()}</td>
                <td>{new Date(a.scheduled_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</td>
                <td className="tbl-amount">{fmtRev(a.amount)}</td>
                <td><div style={{display:'flex',gap:'.4rem'}}>
                  <button className="btn btn-primary btn-xs" onClick={()=>confirm(a.id)}>&#10003; Confirm</button>
                  <button className="btn btn-xs" style={{color:'#c0392b',border:'1px solid #fecaca',background:'var(--surface)'}} onClick={()=>decline(a.id)}>&#10005; Decline</button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      <div className="card">
        <div className="card-head"><div className="card-title">{t(lang,'all_appts')}</div></div>
        {loading?<div style={{padding:'2rem',color:'var(--ink-3)'}}>Loading...</div>
          :rest.length===0&&pending.length===0
            ?<div className="empty-state"><div className="empty-icon">{I.cal}</div><div className="empty-title">{t(lang,'no_appts')}</div><div className="empty-sub">{t(lang,'when_book')}</div></div>
            :<table className="tbl">
              <thead><tr><th>Client</th><th>Service</th><th>Date</th><th>Time</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>{rest.map(a=>(
                <tr key={a.id}>
                  <td className="tbl-name">{a.client_name}</td>
                  <td>{svcName(a)}</td>{/* FIX */}
                  <td>{new Date(a.scheduled_at).toLocaleDateString()}</td>
                  <td>{new Date(a.scheduled_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</td>
                  <td className="tbl-amount">{fmtRev(a.amount)}</td>
                  <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                </tr>
              ))}</tbody>
            </table>
        }
      </div>
    </div>
  )
}

// ── SERVICES ──────────────────────────────────────────────────────────────────
const DURATION_OPTIONS = [
  {label:'30 min', value:30},{label:'45 min', value:45},
  {label:'1 h', value:60},{label:'1 h 15', value:75},{label:'1 h 30', value:90},{label:'1 h 45', value:105},
  {label:'2 h', value:120},{label:'2 h 30', value:150},
  {label:'3 h', value:180},{label:'3 h 30', value:210},
  {label:'4 h', value:240},{label:'5 h', value:300},{label:'6 h', value:360},
]
function fmtDur(min){
  if(!min) return '—'
  if(min<60) return `${min} min`
  const h=Math.floor(min/60),m=min%60
  return m>0?`${h}h ${m}min`:`${h}h`
}
function Services({ workspace, toast, lang='en' }) {
  const [data,setData]=useState([])
  const [showForm,setShowForm]=useState(false)
  const [form,setForm]=useState({name:'',price:'',duration_min:'60',description:''})
  const [loading,setLoading]=useState(false)

  useEffect(()=>{if(workspace)fetchData()},[workspace])
  async function fetchData(){const{data}=await supabase.from('services').select('*').eq('workspace_id',workspace.id).order('display_order',{ascending:true});setData(data||[])}
  async function add(e){
    e.preventDefault();setLoading(true)
    await supabase.from('services').insert({workspace_id:workspace.id,name:form.name,price:parseFloat(form.price)||0,duration_min:parseInt(form.duration_min)||null,description:form.description,is_free:parseFloat(form.price)===0})
    toast(`${form.name} added.`);setForm({name:'',price:'',duration_min:'60',description:''});setShowForm(false);setLoading(false);fetchData()
  }
  async function remove(id,name){await supabase.from('services').delete().eq('id',id);toast(`${name} removed.`);fetchData()}
  async function toggle(id,cur){await supabase.from('services').update({is_active:!cur}).eq('id',id);fetchData()}

  const inputS={width:'100%',padding:'.6rem .85rem',border:'1px solid var(--border-2)',borderRadius:9,fontSize:'.85rem',fontFamily:'inherit',color:'var(--ink)',background:'var(--surface)',outline:'none',transition:'border .15s'}

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
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
              <div className="field">
                <label>Service name</label>
                <input style={inputS} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Box Braids" required
                  onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
              </div>
              <div className="field">
                <label>Price (CAD)</label>
                <input style={inputS} type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="180" required
                  onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
              </div>
            </div>
            <div className="field">
              <label style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span>Duration</span>
                <span style={{fontSize:'.72rem',color:'var(--gold)',fontWeight:500}}>
                  {DURATION_OPTIONS.find(d=>d.value===parseInt(form.duration_min))?.label || fmtDur(parseInt(form.duration_min))}
                </span>
              </label>
              {/* Pill selector for common durations */}
              <div style={{display:'flex',flexWrap:'wrap',gap:'.4rem',marginBottom:'.5rem'}}>
                {DURATION_OPTIONS.map(opt=>(
                  <button key={opt.value} type="button"
                    onClick={()=>setForm(f=>({...f,duration_min:String(opt.value)}))}
                    style={{padding:'.3rem .75rem',borderRadius:20,border:'1.5px solid',fontSize:'.75rem',fontWeight:500,cursor:'pointer',fontFamily:'inherit',transition:'all .14s',
                      borderColor: parseInt(form.duration_min)===opt.value?'var(--gold)':'var(--border-2)',
                      background: parseInt(form.duration_min)===opt.value?'var(--gold-lt)':'var(--surface)',
                      color: parseInt(form.duration_min)===opt.value?'var(--gold)':'var(--ink-3)',
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Description (optional)</label>
              <input style={inputS} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="What's included, hair type, etc."
                onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
            </div>
            <button type="submit" className="btn btn-primary" style={{justifyContent:'center',padding:'.75rem'}} disabled={loading}>{loading?'Saving...':'Save service'}</button>
          </form>
        </div>
      )}
      <div className="card">
        {data.length===0
          ?<div className="empty-state"><div className="empty-icon">{I.box}</div><div className="empty-title">{t(lang,'no_services')}</div><div className="empty-sub">{t(lang,'add_first_service')}</div></div>
          :<table className="tbl">
            <thead><tr><th>Service</th><th>Price</th><th>Duration</th><th>Status</th><th></th></tr></thead>
            <tbody>{data.map(s=>(
              <tr key={s.id}>
                <td className="tbl-name">{s.name}{s.description&&<div style={{fontSize:'.72rem',color:'var(--ink-3)',marginTop:2}}>{s.description}</div>}</td>
                <td className="tbl-amount">{s.is_free?'Free':fmtRev(s.price)}</td>
                <td style={{color:'var(--ink-2)',fontWeight:500}}>{fmtDur(s.duration_min)}</td>
                <td><span className={`badge ${s.is_active?'badge-confirmed':'badge-low'}`}>{s.is_active?'Active':'Hidden'}</span></td>
                <td><div style={{display:'flex',gap:'.4rem'}}>
                  <button className="btn btn-secondary btn-xs" onClick={()=>toggle(s.id,s.is_active)}>{s.is_active?'Hide':'Show'}</button>
                  <button className="btn btn-xs" style={{color:'#c0392b',border:'1px solid #fecaca',background:'var(--surface)'}} onClick={()=>remove(s.id,s.name)}>Delete</button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        }
      </div>
    </div>
  )
}

// ── PRODUCTS ──────────────────────────────────────────────────────────────────
// Compress image client-side before upload — reduces 5MB phone photo to ~300KB
async function compressImage(file, maxWidth=1400, quality=0.82) {
  if (!file.type.startsWith('image/')) return file
  return new Promise(resolve => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxWidth / img.width)
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      canvas.toBlob(blob => {
        if (!blob) { resolve(file); return }
        resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }))
      }, 'image/jpeg', quality)
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.src = url
  })
}

// Shared upload helper — compresses images, uploads, returns {preview, url, error}
async function uploadProductImages(files, workspaceId) {
  if(!workspaceId) return files.map(file=>({preview:URL.createObjectURL(file),url:null,error:'Workspace not loaded — refresh and try again.'}))
  return Promise.all(files.map(async (file, i) => {
    const preview = URL.createObjectURL(file)
    const compressed = await compressImage(file) // instant for PDFs, fast for images
    const ext = compressed.name.split('.').pop()
    const path = `${workspaceId}/${Date.now()}-${i}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(path, compressed, { upsert: true })
    if (error) {
      console.error('Storage upload error:', error.message)
      return { preview, url: null, error: error.message }
    }
    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path)
    return { preview, url: urlData?.publicUrl || null, error: null }
  }))
}

// ── Product image upload zone (shared UI) ────────────────────────────────────
function ImageUploadZone({ pendingImgs, onSelect, onRemove, uploading }) {
  return (
    <div>
      <label style={{display:'block',border:'2px dashed var(--border-2)',borderRadius:12,padding:'1rem',textAlign:'center',cursor:'pointer',transition:'all .15s',background:'var(--bg)'}}
        onMouseEnter={e=>e.currentTarget.style.borderColor='var(--gold)'}
        onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-2)'}>
        <input type="file" accept="image/*" multiple style={{display:'none'}} onChange={onSelect}/>
        <div style={{fontSize:'1.3rem',marginBottom:'.2rem'}}>📷</div>
        <div style={{fontSize:'.78rem',fontWeight:500,color:'var(--ink-2)'}}>
          {uploading ? 'Uploading…' : 'Click to add photos'}
        </div>
        <div style={{fontSize:'.68rem',color:'var(--ink-3)',marginTop:'.15rem'}}>JPG · PNG · WEBP · multiple angles</div>
      </label>
      {pendingImgs.length > 0 && (
        <div style={{display:'flex',gap:'.45rem',flexWrap:'wrap',marginTop:'.65rem'}}>
          {pendingImgs.map((img, i) => (
            <div key={i} style={{position:'relative',width:68,height:68,borderRadius:9,overflow:'hidden',border:`1px solid ${img.error?'var(--red)':'var(--border)'}`,background:'var(--bg)',flexShrink:0}}>
              <img src={img.preview || img.url} alt="" style={{width:'100%',height:'100%',objectFit:'cover',opacity:img.url?1:.5,transition:'opacity .2s'}}/>
              {!img.url && !img.error && <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.55rem',color:'var(--ink-3)'}}>↑</div>}
              {img.error && <div style={{position:'absolute',inset:0,background:'rgba(192,57,43,.75)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.58rem',color:'#fff',fontWeight:600}}>Failed</div>}
              <button type="button" onClick={()=>onRemove(i)}
                style={{position:'absolute',top:2,right:2,background:'rgba(0,0,0,.6)',border:'none',color:'#fff',width:17,height:17,borderRadius:'50%',cursor:'pointer',fontSize:'.55rem',display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1}}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Product edit/view modal ───────────────────────────────────────────────────
function ProductEditModal({ product, workspaceId, onClose, onSaved, onDeleted, toast }) {
  const [form, setForm] = useState({
    name: product.name || '',
    price: String(product.price ?? ''),
    stock: String(product.stock ?? ''),
    description: product.description || '',
  })
  // Existing saved images (URLs from DB)
  const [existingImgs, setExistingImgs] = useState(
    (product.images || []).map(url => ({ url, preview: url }))
  )
  // New images being uploaded
  const [newImgs, setNewImgs] = useState([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const [tab, setTab] = useState('view') // 'view' | 'edit'

  const allImages = [...existingImgs.map(i=>i.url), ...newImgs.filter(i=>i.url).map(i=>i.url)]

  useEffect(()=>{
    const onKey = e => {
      if(e.key==='Escape') onClose()
      if(e.key==='ArrowRight') setActiveIdx(i=>(i+1)%Math.max(allImages.length,1))
      if(e.key==='ArrowLeft') setActiveIdx(i=>(i-1+Math.max(allImages.length,1))%Math.max(allImages.length,1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [allImages.length])

  async function handleNewImages(e) {
    const files = [...e.target.files]; if(!files.length) return
    setUploading(true)
    const results = await uploadProductImages(files, workspaceId)
    const failed = results.filter(r => r.error)
    if (failed.length > 0) toast(`Upload failed: ${failed[0].error}. Run the storage SQL policies in Supabase.`)
    setNewImgs(prev => [...prev, ...results])
    setUploading(false)
  }

  async function save() {
    setSaving(true)
    const finalImages = [
      ...existingImgs.map(i => i.url),
      ...newImgs.filter(i => i.url).map(i => i.url),
    ]
    const { error } = await supabase.from('products').update({
      name: form.name,
      price: parseFloat(form.price) || 0,
      stock: parseInt(form.stock) || 0,
      description: form.description,
      images: finalImages,
    }).eq('id', product.id)
    setSaving(false)
    if(error) { toast('Error saving.'); return }
    toast(`${form.name} updated.`)
    onSaved()
    onClose()
  }

  async function deleteProduct() {
    await supabase.from('products').delete().eq('id', product.id)
    toast(`${product.name} deleted.`)
    onDeleted()
    onClose()
  }

  const inputS = {width:'100%',padding:'.55rem .8rem',border:'1px solid var(--border-2)',borderRadius:9,fontSize:'.84rem',fontFamily:'inherit',color:'var(--ink)',background:'var(--surface)',outline:'none',transition:'border .15s'}

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.72)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem',backdropFilter:'blur(4px)'}} onClick={onClose}>
      <div style={{background:'var(--surface)',borderRadius:18,width:'100%',maxWidth:660,maxHeight:'92vh',overflowY:'auto',boxShadow:'0 32px 80px rgba(0,0,0,.3)',display:'flex',flexDirection:'column'}} onClick={e=>e.stopPropagation()}>

        {/* Image viewer */}
        <div style={{position:'relative',background:'#0d0c0a',borderRadius:'18px 18px 0 0',overflow:'hidden',minHeight:240}}>
          {allImages.length > 0 ? (
            <>
              <div style={{height:280,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',cursor:zoomed?'zoom-out':'zoom-in'}} onClick={()=>tab==='view'&&setZoomed(z=>!z)}>
                <img src={allImages[Math.min(activeIdx, allImages.length-1)]} alt="" style={{maxHeight:'100%',maxWidth:'100%',objectFit:'contain',transition:'transform .3s',transform:zoomed?'scale(1.85)':'scale(1)'}}/>
              </div>
              {allImages.length > 1 && (
                <>
                  <button onClick={e=>{e.stopPropagation();setActiveIdx(i=>(i-1+allImages.length)%allImages.length)}}
                    style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,.15)',border:'none',color:'#fff',width:34,height:34,borderRadius:'50%',cursor:'pointer',fontSize:'1rem',display:'flex',alignItems:'center',justifyContent:'center'}}>‹</button>
                  <button onClick={e=>{e.stopPropagation();setActiveIdx(i=>(i+1)%allImages.length)}}
                    style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,.15)',border:'none',color:'#fff',width:34,height:34,borderRadius:'50%',cursor:'pointer',fontSize:'1rem',display:'flex',alignItems:'center',justifyContent:'center'}}>›</button>
                  <div style={{position:'absolute',bottom:8,right:12,background:'rgba(0,0,0,.5)',color:'#fff',fontSize:'.65rem',padding:'2px 8px',borderRadius:20}}>{Math.min(activeIdx,allImages.length-1)+1}/{allImages.length}</div>
                </>
              )}
              {tab==='view'&&<div style={{position:'absolute',bottom:8,left:'50%',transform:'translateX(-50%)',background:'rgba(0,0,0,.45)',color:'#fff',fontSize:'.65rem',padding:'2px 10px',borderRadius:20,pointerEvents:'none'}}>{zoomed?'Click to zoom out':'Click to zoom'}</div>}
            </>
          ) : (
            <div style={{height:180,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,.3)',gap:'.5rem'}}>
              <div style={{fontSize:'2rem'}}>📷</div>
              <div style={{fontSize:'.78rem'}}>No photos yet — add some below</div>
            </div>
          )}
          {/* Close */}
          <button onClick={onClose} style={{position:'absolute',top:10,right:10,background:'rgba(0,0,0,.5)',border:'none',color:'#fff',width:30,height:30,borderRadius:'50%',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.85rem'}}>✕</button>
          {/* View / Edit tabs */}
          <div style={{position:'absolute',top:10,left:10,display:'flex',background:'rgba(0,0,0,.45)',borderRadius:20,overflow:'hidden'}}>
            {['view','edit'].map(t=>(
              <button key={t} onClick={e=>{e.stopPropagation();setTab(t);setZoomed(false)}}
                style={{padding:'4px 14px',border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:'.7rem',fontWeight:600,textTransform:'uppercase',letterSpacing:'.05em',transition:'all .15s',
                  background:tab===t?'rgba(181,137,58,.9)':'transparent',color:tab===t?'#111':'rgba(255,255,255,.7)'}}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Thumbnails */}
        {allImages.length > 1 && (
          <div style={{display:'flex',gap:'.4rem',padding:'.6rem 1rem',overflowX:'auto',background:'#161412',scrollbarWidth:'none'}}>
            {allImages.map((img, i) => (
              <div key={i} onClick={()=>setActiveIdx(i)}
                style={{width:46,height:46,flexShrink:0,borderRadius:7,overflow:'hidden',border:`2px solid ${i===activeIdx?'var(--gold)':'transparent'}`,cursor:'pointer',transition:'border .12s'}}>
                <img src={img} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
              </div>
            ))}
          </div>
        )}

        {/* VIEW TAB */}
        {tab==='view' && (
          <div style={{padding:'1.25rem 1.5rem'}}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'.5rem'}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.4rem',color:'var(--ink)',fontWeight:500}}>{product.name}</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.35rem',color:'var(--gold)',flexShrink:0,marginLeft:'1rem'}}>{fmtRev(product.price)}</div>
            </div>
            {product.description && <div style={{fontSize:'.85rem',color:'var(--ink-2)',lineHeight:1.65,marginBottom:'.75rem'}}>{product.description}</div>}
            <span className={`badge ${product.stock===0?'badge-low':product.stock<5?'badge-pending':'badge-confirmed'}`}>
              {product.stock===0?'Out of stock':`${product.stock} in stock`}
            </span>
            <div style={{marginTop:'1rem'}}>
              <button className="btn btn-secondary btn-sm" onClick={()=>setTab('edit')}>✏️ Edit this product</button>
            </div>
          </div>
        )}

        {/* EDIT TAB */}
        {tab==='edit' && (
          <div style={{padding:'1.25rem 1.5rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.75rem'}}>
              <div className="field"><label>Name</label>
                <input style={inputS} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
                  onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
              </div>
              <div className="field"><label>Price (CAD)</label>
                <input style={inputS} type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))}
                  onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:'.75rem'}}>
              <div className="field"><label>Stock</label>
                <input style={inputS} type="number" value={form.stock} onChange={e=>setForm(f=>({...f,stock:e.target.value}))}
                  onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
              </div>
              <div className="field"><label>Description</label>
                <input style={inputS} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                  onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
              </div>
            </div>

            {/* Manage existing photos */}
            {existingImgs.length > 0 && (
              <div>
                <div style={{fontSize:'.72rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'.5rem'}}>Current photos — click ✕ to remove</div>
                <div style={{display:'flex',gap:'.45rem',flexWrap:'wrap'}}>
                  {existingImgs.map((img, i) => (
                    <div key={i} style={{position:'relative',width:68,height:68,borderRadius:9,overflow:'hidden',border:'1px solid var(--border)',flexShrink:0}}>
                      <img src={img.url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                      <button type="button" onClick={()=>{setExistingImgs(prev=>prev.filter((_,idx)=>idx!==i));if(activeIdx>=allImages.length-1)setActiveIdx(0)}}
                        style={{position:'absolute',top:2,right:2,background:'rgba(192,57,43,.85)',border:'none',color:'#fff',width:18,height:18,borderRadius:'50%',cursor:'pointer',fontSize:'.58rem',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add new photos */}
            <div>
              <div style={{fontSize:'.72rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'.5rem'}}>Add more photos</div>
              <ImageUploadZone pendingImgs={newImgs} onSelect={handleNewImages} onRemove={i=>setNewImgs(prev=>prev.filter((_,idx)=>idx!==i))} uploading={uploading}/>
            </div>

            <div style={{display:'flex',gap:'.6rem',paddingTop:'.25rem'}}>
              <button className="btn btn-primary" style={{flex:1,justifyContent:'center',padding:'.7rem'}} onClick={save} disabled={saving||uploading}>
                {saving?'Saving…':'Save changes'}
              </button>
              {!confirmDelete
                ?<button className="btn btn-xs" style={{color:'var(--red)',border:'1px solid rgba(192,57,43,.25)',background:'var(--surface)',padding:'.4rem .9rem'}} onClick={()=>setConfirmDelete(true)}>Delete</button>
                :<button className="btn btn-xs" style={{color:'#fff',background:'var(--red)',border:'none',padding:'.4rem .9rem'}} onClick={deleteProduct}>Confirm delete</button>
              }
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

function Products({ workspace, toast }) {
  const [data, setData] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({name:'',price:'',stock:'',description:''})
  const [pendingImgs, setPendingImgs] = useState([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  // Select mode for bulk delete
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState(new Set())
  const [showDotMenu, setShowDotMenu] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(()=>{if(workspace)fetchData()},[workspace])
  async function fetchData(){const{data}=await supabase.from('products').select('*').eq('workspace_id',workspace.id).order('created_at',{ascending:false});setData(data||[])}

  function enterSelectMode(){ setSelectMode(true); setSelected(new Set()); setShowDotMenu(false); setShowForm(false) }
  function exitSelectMode(){ setSelectMode(false); setSelected(new Set()) }
  function toggleSelect(id){ setSelected(prev=>{ const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n }) }

  async function deleteSelected(){
    if(!selected.size) return
    setDeleting(true)
    await Promise.all([...selected].map(id=>supabase.from('products').delete().eq('id',id)))
    toast(`${selected.size} product${selected.size>1?'s':''} deleted.`)
    setDeleting(false)
    exitSelectMode()
    fetchData()
  }

  async function handleImageSelect(e) {
    const files = [...e.target.files]; if(!files.length) return
    setUploading(true)
    const results = await uploadProductImages(files, workspace.id)
    const failed = results.filter(r => r.error)
    if (failed.length > 0) toast(`Upload failed: ${failed[0].error}`)
    setPendingImgs(prev => [...prev, ...results])
    setUploading(false)
  }

  async function add(e) {
    e.preventDefault(); setSaving(true)
    const imageUrls = pendingImgs.filter(p=>p.url).map(p=>p.url)
    await supabase.from('products').insert({workspace_id:workspace.id,name:form.name,price:parseFloat(form.price)||0,stock:parseInt(form.stock)||0,description:form.description,images:imageUrls})
    toast(`${form.name} added.`)
    setForm({name:'',price:'',stock:'',description:''})
    setPendingImgs([])
    setShowForm(false)
    setSaving(false)
    fetchData()
  }

  const inputS={width:'100%',padding:'.6rem .85rem',border:'1px solid var(--border-2)',borderRadius:9,fontSize:'.85rem',fontFamily:'inherit',color:'var(--ink)',background:'var(--surface)',outline:'none',transition:'border .15s'}

  return (
    <div>
      <div className="page-head">
        <div><div className="page-title">Products</div><div className="page-sub">Sell from your profile page</div></div>
        <div style={{display:'flex',gap:'.5rem',alignItems:'center',position:'relative'}}>
          {selectMode ? (
            <>
              <span style={{fontSize:'.8rem',color:'var(--ink-3)'}}>{selected.size} selected</span>
              <button className="btn btn-xs" style={{color:'var(--red)',border:'1px solid rgba(192,57,43,.25)',background:'var(--surface)'}}
                onClick={deleteSelected} disabled={!selected.size||deleting}>
                {deleting?'Deleting…':`Delete ${selected.size||''}`}
              </button>
              <button className="btn btn-secondary btn-sm" onClick={exitSelectMode}>Cancel</button>
            </>
          ) : (
            <>
              <button className="btn btn-primary" onClick={()=>{setShowForm(s=>!s);setSelectMode(false)}}>{showForm?'Cancel':'Add product'}</button>
              <div style={{position:'relative'}}>
                <button className="btn btn-secondary btn-sm" style={{padding:'.35rem .6rem',fontSize:'1rem'}} onClick={()=>setShowDotMenu(s=>!s)}>⋮</button>
                {showDotMenu&&(
                  <>
                    <div style={{position:'fixed',inset:0,zIndex:98}} onClick={()=>setShowDotMenu(false)}/>
                    <div style={{position:'absolute',right:0,top:'calc(100% + 6px)',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,boxShadow:'0 8px 24px rgba(0,0,0,.12)',minWidth:170,zIndex:99,overflow:'hidden'}}>
                      <div style={{padding:'.65rem 1rem',fontSize:'.82rem',color:'var(--red)',cursor:'pointer',display:'flex',alignItems:'center',gap:'.5rem'}}
                        onClick={enterSelectMode}>
                        ☑ Select to delete
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {showForm&&!selectMode&&(
        <div className="card" style={{marginBottom:'1.25rem'}}>
          <div className="card-head"><div className="card-title">New product</div></div>
          <form onSubmit={add} className="card-body" style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
              <div className="field"><label>Product name</label>
                <input style={inputS} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Moisture Serum" required
                  onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
              </div>
              <div className="field"><label>Price (CAD)</label>
                <input style={inputS} type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="28" required
                  onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:'1rem'}}>
              <div className="field"><label>Stock</label>
                <input style={inputS} type="number" value={form.stock} onChange={e=>setForm(f=>({...f,stock:e.target.value}))} placeholder="10"
                  onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
              </div>
              <div className="field"><label>Description</label>
                <input style={inputS} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="What it does, key ingredients..."
                  onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
              </div>
            </div>
            <div>
              <div style={{fontSize:'.75rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'.5rem'}}>Photos</div>
              <ImageUploadZone pendingImgs={pendingImgs} onSelect={handleImageSelect} onRemove={i=>setPendingImgs(prev=>prev.filter((_,idx)=>idx!==i))} uploading={uploading}/>
            </div>
            <button type="submit" className="btn btn-primary" style={{justifyContent:'center',padding:'.75rem'}} disabled={saving||uploading}>
              {uploading?'Compressing & uploading…':saving?'Saving…':'Save product'}
            </button>
          </form>
        </div>
      )}

      {selectMode&&data.length>0&&(
        <div style={{background:'var(--gold-lt)',border:'1px solid var(--gold-dim)',borderRadius:10,padding:'.65rem 1rem',marginBottom:'1rem',fontSize:'.8rem',color:'var(--ink-2)'}}>
          Tap products to select them, then hit Delete.
          <button style={{marginLeft:'.75rem',fontSize:'.75rem',color:'var(--gold)',fontWeight:600,background:'none',border:'none',cursor:'pointer'}}
            onClick={()=>setSelected(new Set(data.map(p=>p.id)))}>
            Select all ({data.length})
          </button>
        </div>
      )}

      <div className="grid-3">
        {data.length===0
          ?<div className="card" style={{gridColumn:'1/-1'}}><div className="empty-state"><div className="empty-icon">{I.box}</div><div className="empty-title">No products yet</div><div className="empty-sub">Add products to sell on your profile.</div></div></div>
          :data.map(p=>{
            const imgs = p.images||[]
            const isSelected = selected.has(p.id)
            return (
              <div key={p.id} className="prod-card"
                onClick={()=>selectMode ? toggleSelect(p.id) : setEditProduct(p)}
                style={{cursor:'pointer',position:'relative',outline:isSelected?'2.5px solid var(--gold)':'none',transition:'outline .12s'}}>
                {/* Select checkbox */}
                {selectMode&&(
                  <div style={{position:'absolute',top:8,left:8,zIndex:2,width:22,height:22,borderRadius:6,border:`2px solid ${isSelected?'var(--gold)':'rgba(255,255,255,.7)'}`,background:isSelected?'var(--gold)':'rgba(0,0,0,.35)',display:'flex',alignItems:'center',justifyContent:'center',transition:'all .12s'}}>
                    {isSelected&&<svg viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.5" width="10" height="10"><polyline points="1.5,5 4,7.5 8.5,2.5"/></svg>}
                  </div>
                )}
                <div className="prod-img" style={{position:'relative',overflow:'hidden',background:'var(--bg)'}}>
                  {imgs.length>0
                    ?<img src={imgs[0]} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform .3s',filter:isSelected?'brightness(.8)':'none'}}
                        onMouseEnter={e=>{if(!selectMode)e.currentTarget.style.transform='scale(1.06)'}}
                        onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}/>
                    :<div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'.3rem'}}>
                      <span style={{fontSize:'1.5rem'}}>📷</span>
                      <span style={{fontSize:'.65rem',color:'var(--ink-3)'}}>Add photos</span>
                    </div>
                  }
                  {imgs.length>1&&<div style={{position:'absolute',bottom:5,right:6,background:'rgba(0,0,0,.5)',color:'#fff',fontSize:'.6rem',padding:'1px 6px',borderRadius:20}}>+{imgs.length-1}</div>}
                </div>
                <div className="prod-body">
                  <div className="prod-name">{p.name}</div>
                  <div className="prod-price">{fmtRev(p.price)}</div>
                  <span className={`badge ${p.stock===0?'badge-low':p.stock<5?'badge-pending':'badge-confirmed'}`}>{p.stock===0?'Out of stock':`${p.stock} in stock`}</span>
                </div>
              </div>
            )
          })
        }
      </div>

      {editProduct&&!selectMode&&(
        <ProductEditModal product={editProduct} workspaceId={workspace.id}
          onClose={()=>setEditProduct(null)} onSaved={fetchData} onDeleted={fetchData} toast={toast}/>
      )}
    </div>
  )
}

// ── Formation edit modal ─────────────────────────────────────────────────────
function FormationEditModal({ formation, workspaceId, onClose, onSaved, onDeleted, toast }) {
  const [form, setForm] = useState({
    title:          formation.title          || '',
    price:          String(formation.price   ?? ''),
    duration_label: formation.duration_label || '',
    description:    formation.description    || '',
  })
  const [existingFiles, setExistingFiles] = useState(formation.files || [])
  const [newFiles,      setNewFiles]      = useState([])
  const [uploading,     setUploading]     = useState(false)
  const [saving,        setSaving]        = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Close on Escape
  useEffect(()=>{
    const h = e => { if(e.key==='Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  async function handleFiles(e) {
    const files = [...e.target.files]; if(!files.length) return
    setUploading(true)
    const results = await Promise.all(files.map(f => uploadFormationFile(f, workspaceId)))
    const failed = results.filter(r => r.error)
    if(failed.length > 0) toast(`Upload failed: ${failed[0].error}`)
    setNewFiles(prev => [...prev, ...results])
    setUploading(false)
  }

  async function save() {
    setSaving(true)
    const finalFiles = [
      ...existingFiles,
      ...newFiles.filter(f => f.url).map(({name, size, kind, url}) => ({name, size, kind, url})),
    ]
    const { error } = await supabase.from('offerings').update({
      title:          form.title,
      price:          parseFloat(form.price) || 0,
      duration_label: form.duration_label,
      description:    form.description,
      files:          finalFiles,
    }).eq('id', formation.id)
    setSaving(false)
    if(error) { toast('Error saving.'); return }
    toast(`"${form.title}" updated.`)
    onSaved()
    onClose()
  }

  async function deleteFormation() {
    await supabase.from('offerings').delete().eq('id', formation.id)
    toast(`"${formation.title}" deleted.`)
    onDeleted()
    onClose()
  }

  const inputS = {width:'100%',padding:'.58rem .82rem',border:'1px solid var(--border-2)',borderRadius:9,fontSize:'.84rem',fontFamily:'inherit',color:'var(--ink)',background:'var(--surface)',outline:'none',transition:'border .15s'}
  const allFiles = [...existingFiles, ...newFiles.filter(f=>f.url)]

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.68)',zIndex:300,display:'flex',alignItems:'flex-end',justifyContent:'center',backdropFilter:'blur(4px)'}}
      onClick={onClose}>
      <div style={{background:'var(--surface)',borderRadius:'18px 18px 0 0',width:'100%',maxWidth:640,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 -16px 60px rgba(0,0,0,.25)',display:'flex',flexDirection:'column'}}
        onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1.1rem 1.4rem',borderBottom:'1px solid var(--border)',flexShrink:0}}>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.15rem',fontWeight:500,color:'var(--ink)'}}>Edit formation</div>
            <div style={{fontSize:'.72rem',color:'var(--ink-3)',marginTop:2}}>{formation.title}</div>
          </div>
          <button onClick={onClose} style={{background:'var(--bg)',border:'1px solid var(--border)',width:30,height:30,borderRadius:'50%',cursor:'pointer',color:'var(--ink-3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.85rem'}}>✕</button>
        </div>

        <div style={{padding:'1.25rem 1.4rem',display:'flex',flexDirection:'column',gap:'1rem',overflowY:'auto'}}>

          {/* Fields */}
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'.75rem'}}>
            <div className="field"><label>Title</label>
              <input style={inputS} value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}
                onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
            </div>
            <div className="field"><label>Price (CAD)</label>
              <input style={inputS} type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))}
                onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:'.75rem'}}>
            <div className="field"><label>Duration</label>
              <input style={inputS} value={form.duration_label} onChange={e=>setForm(f=>({...f,duration_label:e.target.value}))} placeholder="e.g. 4h · 3 sessions"
                onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
            </div>
            <div className="field"><label>Description</label>
              <input style={inputS} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
            </div>
          </div>

          {/* Current files */}
          {allFiles.length > 0 && (
            <div>
              <div style={{fontSize:'.72rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'.55rem'}}>
                Current files — click ✕ to remove
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'.35rem'}}>
                {existingFiles.map((file, i) => (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:'.65rem',padding:'.5rem .85rem',background:'var(--bg)',borderRadius:9,border:'1px solid var(--border)'}}>
                    {file.preview
                      ? <img src={file.preview} alt="" style={{width:34,height:34,objectFit:'cover',borderRadius:6,flexShrink:0}}/>
                      : <span style={{fontSize:'1.1rem',flexShrink:0}}>{FILE_ICONS[file.kind]||FILE_ICONS.other}</span>
                    }
                    <div style={{flex:1,overflow:'hidden'}}>
                      <div style={{fontSize:'.8rem',fontWeight:500,color:'var(--ink)',textOverflow:'ellipsis',overflow:'hidden',whiteSpace:'nowrap'}}>{file.name}</div>
                      <div style={{fontSize:'.68rem',color:'var(--ink-3)'}}>{fmtBytes(file.size)}</div>
                    </div>
                    <a href={file.url} target="_blank" rel="noopener noreferrer"
                      style={{fontSize:'.7rem',color:'var(--gold)',textDecoration:'none',fontWeight:500,flexShrink:0,padding:'2px 6px',border:'1px solid var(--gold-dim)',borderRadius:5}}>
                      Open
                    </a>
                    <button type="button"
                      onClick={()=>setExistingFiles(prev=>prev.filter((_,idx)=>idx!==i))}
                      style={{background:'rgba(192,57,43,.1)',border:'1px solid rgba(192,57,43,.2)',color:'var(--red)',width:24,height:24,borderRadius:'50%',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.65rem',flexShrink:0}}>✕</button>
                  </div>
                ))}
                {/* New uploaded files preview */}
                {newFiles.filter(f=>f.url).map((file, i) => (
                  <div key={`new-${i}`} style={{display:'flex',alignItems:'center',gap:'.65rem',padding:'.5rem .85rem',background:'rgba(46,125,82,.04)',borderRadius:9,border:'1px solid rgba(46,125,82,.2)'}}>
                    {file.preview
                      ? <img src={file.preview} alt="" style={{width:34,height:34,objectFit:'cover',borderRadius:6,flexShrink:0}}/>
                      : <span style={{fontSize:'1.1rem',flexShrink:0}}>{FILE_ICONS[file.kind]||FILE_ICONS.other}</span>
                    }
                    <div style={{flex:1,overflow:'hidden'}}>
                      <div style={{fontSize:'.8rem',fontWeight:500,color:'var(--ink)',textOverflow:'ellipsis',overflow:'hidden',whiteSpace:'nowrap'}}>{file.name}</div>
                      <div style={{fontSize:'.68rem',color:'var(--green)',fontWeight:600}}>Ready to save ✓</div>
                    </div>
                    <button type="button"
                      onClick={()=>setNewFiles(prev=>prev.filter((_,idx)=>idx!==i))}
                      style={{background:'none',border:'none',cursor:'pointer',color:'var(--ink-3)',fontSize:'.85rem',padding:'2px',flexShrink:0}}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload more files */}
          <div>
            <div style={{fontSize:'.72rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'.5rem'}}>
              Add or replace files
            </div>
            <label style={{display:'block',border:'2px dashed var(--border-2)',borderRadius:11,padding:'1rem',textAlign:'center',cursor:'pointer',transition:'all .15s',background:'var(--bg)'}}
              onMouseEnter={e=>e.currentTarget.style.borderColor='var(--gold)'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-2)'}>
              <input type="file" accept="image/*,video/*,application/pdf,.pdf" multiple style={{display:'none'}} onChange={handleFiles}/>
              <div style={{fontSize:'1.2rem',marginBottom:'.2rem'}}>📎</div>
              <div style={{fontSize:'.78rem',fontWeight:500,color:'var(--ink-2)'}}>
                {uploading ? 'Uploading…' : 'Click to upload PDF · image · video'}
              </div>
            </label>
            {/* Failed uploads */}
            {newFiles.filter(f=>f.error).map((file,i)=>(
              <div key={`err-${i}`} style={{display:'flex',alignItems:'center',gap:'.5rem',padding:'.45rem .75rem',background:'rgba(192,57,43,.06)',border:'1px solid rgba(192,57,43,.2)',borderRadius:8,marginTop:'.4rem',fontSize:'.76rem',color:'var(--red)'}}>
                ⚠️ {file.name} — {file.error}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{display:'flex',gap:'.6rem',paddingTop:'.25rem',paddingBottom:'.5rem'}}>
            <button className="btn btn-primary" style={{flex:1,justifyContent:'center',padding:'.72rem'}}
              onClick={save} disabled={saving||uploading}>
              {saving ? 'Saving…' : uploading ? 'Uploading…' : 'Save changes'}
            </button>
            {!confirmDelete
              ? <button className="btn btn-xs" style={{color:'var(--red)',border:'1px solid rgba(192,57,43,.25)',background:'var(--surface)',padding:'.45rem 1rem'}}
                  onClick={()=>setConfirmDelete(true)}>Delete</button>
              : <button className="btn btn-xs" style={{color:'#fff',background:'var(--red)',border:'none',padding:'.45rem 1rem'}}
                  onClick={deleteFormation}>Confirm delete</button>
            }
          </div>

        </div>
      </div>
    </div>
  )
}

// ── FORMATIONS ────────────────────────────────────────────────────────────────
const FILE_ICONS = { pdf:'📄', image:'🖼️', video:'🎬', other:'📎' }
function fileType(f){ if(f.type?.startsWith('video')) return 'video'; if(f.type?.startsWith('image')) return 'image'; if(f.type==='application/pdf'||f.name?.endsWith('.pdf')) return 'pdf'; return 'other' }
function fmtBytes(b){ if(b<1024) return b+'B'; if(b<1048576) return (b/1024).toFixed(0)+'KB'; return (b/1048576).toFixed(1)+'MB' }

async function uploadFormationFile(file, workspaceId) {
  const kind = fileType(file)
  const toUpload = kind==='image' ? await compressImage(file) : file
  const ext = file.name.split('.').pop()
  const path = `${workspaceId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('formation-files').upload(path, toUpload, { upsert: true, contentType: file.type })
  if (error) return { name: file.name, size: file.size, kind, url: null, preview: null, error: error.message }
  const { data: urlData } = supabase.storage.from('formation-files').getPublicUrl(path)
  return { name: file.name, size: file.size, kind, url: urlData?.publicUrl || null, preview: kind==='image' ? URL.createObjectURL(file) : null, error: null }
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

  function enterSelectMode(){ setSelectMode(true); setSelected(new Set()); setShowDotMenu(false); setShowForm(false) }
  function exitSelectMode(){ setSelectMode(false); setSelected(new Set()) }
  function toggleSelect(id){ setSelected(prev=>{ const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n }) }

  async function deleteSelected(){
    if(!selected.size) return
    setDeleting(true)
    await Promise.all([...selected].map(id=>supabase.from('offerings').delete().eq('id',id)))
    toast(`${selected.size} formation${selected.size>1?'s':''} deleted.`)
    setDeleting(false); exitSelectMode(); fetchData()
  }

  async function handleFiles(e){
    const files=[...e.target.files]; if(!files.length) return
    setUploading(true)
    const results = await Promise.all(files.map(f=>uploadFormationFile(f, workspace.id)))
    const failed = results.filter(r=>r.error)
    if(failed.length>0) toast(`Upload failed: ${failed[0].error} — run the formation-files storage SQL.`)
    setPendingFiles(prev=>[...prev,...results])
    setUploading(false)
  }

  async function add(e){
    e.preventDefault(); setSaving(true)
    const filesData=pendingFiles.filter(f=>f.url).map(({name,size,kind,url})=>({name,size,kind,url}))
    await supabase.from('offerings').insert({workspace_id:workspace.id,title:form.title,price:parseFloat(form.price)||0,duration_label:form.duration_label,description:form.description,files:filesData})
    toast(`"${form.title}" created.`)
    setForm({title:'',price:'',duration_label:'',description:''})
    setPendingFiles([]); setShowForm(false); setSaving(false); fetchData()
  }

  const inputS={width:'100%',padding:'.6rem .85rem',border:'1px solid var(--border-2)',borderRadius:9,fontSize:'.85rem',fontFamily:'inherit',color:'var(--ink)',background:'var(--surface)',outline:'none',transition:'border .15s'}

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Formations</div>
          <div className="page-sub">Monetize your expertise — courses, workshops, masterclasses</div>
        </div>
        <div style={{display:'flex',gap:'.5rem',alignItems:'center',position:'relative'}}>
          {selectMode ? (
            <>
              <span style={{fontSize:'.8rem',color:'var(--ink-3)'}}>{selected.size} selected</span>
              <button className="btn btn-xs" style={{color:'var(--red)',border:'1px solid rgba(192,57,43,.25)',background:'var(--surface)'}}
                onClick={deleteSelected} disabled={!selected.size||deleting}>
                {deleting?'Deleting…':`Delete ${selected.size||''}`}
              </button>
              <button className="btn btn-secondary btn-sm" onClick={exitSelectMode}>Cancel</button>
            </>
          ) : (
            <>
              <button className="btn btn-primary" onClick={()=>{setShowForm(s=>!s);setSelectMode(false)}}>{showForm?'Cancel':'Create formation'}</button>
              <div style={{position:'relative'}}>
                <button className="btn btn-secondary btn-sm" style={{padding:'.35rem .6rem',fontSize:'1rem'}} onClick={()=>setShowDotMenu(s=>!s)}>⋮</button>
                {showDotMenu&&(
                  <>
                    <div style={{position:'fixed',inset:0,zIndex:98}} onClick={()=>setShowDotMenu(false)}/>
                    <div style={{position:'absolute',right:0,top:'calc(100% + 6px)',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,boxShadow:'0 8px 24px rgba(0,0,0,.12)',minWidth:175,zIndex:99,overflow:'hidden'}}>
                      <div style={{padding:'.65rem 1rem',fontSize:'.82rem',color:'var(--red)',cursor:'pointer',display:'flex',alignItems:'center',gap:'.5rem'}}
                        onClick={enterSelectMode}>
                        ☑ Select to delete
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {showForm&&!selectMode&&(
        <div className="card" style={{marginBottom:'1.25rem'}}>
          <div className="card-head">
            <div><div className="card-title">New formation</div><div className="card-sub">Share your knowledge. Set your price. Own your revenue.</div></div>
          </div>
          <form onSubmit={add} className="card-body" style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'1rem'}}>
              <div className="field"><label>Formation title</label>
                <input style={inputS} value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Box Braids Masterclass" required
                  onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
              </div>
              <div className="field"><label>Price (CAD)</label>
                <input style={inputS} type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="149" required
                  onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:'1rem'}}>
              <div className="field"><label>Duration</label>
                <input style={inputS} value={form.duration_label} onChange={e=>setForm(f=>({...f,duration_label:e.target.value}))} placeholder="e.g. 4h · 3 sessions"
                  onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
              </div>
              <div className="field"><label>Description</label>
                <input style={inputS} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="What students will learn, prerequisites..."
                  onFocus={e=>e.target.style.borderColor='var(--gold)'} onBlur={e=>e.target.style.borderColor='var(--border-2)'}/>
              </div>
            </div>

            <div>
              <div style={{fontSize:'.78rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'.6rem'}}>
                Course content — PDFs, images, videos
              </div>
              <label style={{display:'block',border:'2px dashed var(--border-2)',borderRadius:12,padding:'1.25rem',textAlign:'center',cursor:'pointer',transition:'all .15s',background:'var(--bg)'}}
                onMouseEnter={e=>e.currentTarget.style.borderColor='var(--gold)'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-2)'}>
                <input type="file" accept="image/*,video/*,application/pdf,.pdf" multiple style={{display:'none'}} onChange={handleFiles}/>
                <div style={{fontSize:'1.5rem',marginBottom:'.35rem'}}>📚</div>
                <div style={{fontSize:'.82rem',fontWeight:500,color:'var(--ink-2)'}}>
                  {uploading ? 'Uploading…' : 'Upload course materials'}
                </div>
                <div style={{fontSize:'.72rem',color:'var(--ink-3)',marginTop:'.2rem'}}>PDF guides · tutorial photos · intro videos</div>
              </label>

              {pendingFiles.length>0&&(
                <div style={{display:'flex',flexDirection:'column',gap:'.4rem',marginTop:'.65rem'}}>
                  {pendingFiles.map((f,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:'.65rem',padding:'.55rem .85rem',background:'var(--bg)',borderRadius:9,border:`1px solid ${f.error?'var(--red)':'var(--border)'}`}}>
                      {f.preview
                        ?<img src={f.preview} alt="" style={{width:38,height:38,objectFit:'cover',borderRadius:6,flexShrink:0}}/>
                        :<span style={{fontSize:'1.2rem',flexShrink:0}}>{FILE_ICONS[f.kind]||FILE_ICONS.other}</span>}
                      <div style={{flex:1,overflow:'hidden'}}>
                        <div style={{fontSize:'.8rem',fontWeight:500,color:f.error?'var(--red)':'var(--ink)',textOverflow:'ellipsis',overflow:'hidden',whiteSpace:'nowrap'}}>{f.name}</div>
                        <div style={{fontSize:'.7rem',color:'var(--ink-3)'}}>{f.error ? f.error : fmtBytes(f.size)}</div>
                      </div>
                      {f.url&&<span style={{fontSize:'.7rem',color:'var(--green)',fontWeight:600,flexShrink:0}}>✓</span>}
                      <button type="button" onClick={()=>setPendingFiles(prev=>prev.filter((_,idx)=>idx!==i))}
                        style={{background:'none',border:'none',cursor:'pointer',color:'var(--ink-3)',fontSize:'.85rem',padding:'2px',flexShrink:0}}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary" style={{justifyContent:'center',padding:'.75rem'}} disabled={saving||uploading}>
              {uploading?'Uploading files…':saving?'Saving…':'Create formation'}
            </button>
          </form>
        </div>
      )}

      {selectMode&&data.length>0&&(
        <div style={{background:'var(--gold-lt)',border:'1px solid var(--gold-dim)',borderRadius:10,padding:'.65rem 1rem',marginBottom:'1rem',fontSize:'.8rem',color:'var(--ink-2)'}}>
          Tap formations to select them, then hit Delete.
          <button style={{marginLeft:'.75rem',fontSize:'.75rem',color:'var(--gold)',fontWeight:600,background:'none',border:'none',cursor:'pointer'}}
            onClick={()=>setSelected(new Set(data.map(f=>f.id)))}>
            Select all ({data.length})
          </button>
        </div>
      )}

      <div className="card">
        {data.length===0
          ?<div className="empty-state">
              <div className="empty-icon">{I.grad}</div>
              <div className="empty-title">Monetize your expertise</div>
              <div className="empty-sub">Create your first course or workshop and start earning from your knowledge.</div>
            </div>
          :data.map((f)=>{
            const isSelected = selected.has(f.id)
            return (
              <div key={f.id} className="formation-row"
                onClick={()=>selectMode ? toggleSelect(f.id) : setEditFormation(f)}
                style={{cursor:'pointer',background:isSelected?'var(--gold-lt)':'',transition:'background .12s,box-shadow .12s',position:'relative'}}
                onMouseEnter={e=>{if(!selectMode)e.currentTarget.style.boxShadow='inset 3px 0 0 var(--gold)'}}
                onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
                {/* Checkbox in select mode */}
                {selectMode&&(
                  <div style={{width:22,height:22,borderRadius:6,border:`2px solid ${isSelected?'var(--gold)':'var(--border-2)'}`,background:isSelected?'var(--gold)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all .12s',marginRight:'.5rem'}}>
                    {isSelected&&<svg viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.5" width="10" height="10"><polyline points="1.5,5 4,7.5 8.5,2.5"/></svg>}
                  </div>
                )}
                {!selectMode&&<div className="formation-icon-block">{I.grad}</div>}
                <div className="formation-info">
                  <div style={{display:'flex',alignItems:'center',gap:'.5rem'}}>
                    <div className="formation-name">{f.title}</div>
                    {!selectMode&&<span style={{fontSize:'.68rem',color:'var(--ink-3)',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:4,padding:'1px 6px'}}>✏️ Edit</span>}
                  </div>
                  <div className="formation-desc">{f.description}</div>
                  <div style={{display:'flex',gap:'.6rem',marginTop:'.4rem',flexWrap:'wrap',alignItems:'center'}}>
                    {f.duration_label&&<div className="formation-meta"><span>{f.duration_label}</span></div>}
                    {(f.files||[]).length>0&&(
                      <div style={{display:'flex',gap:'.25rem',flexWrap:'wrap'}}>
                        {(f.files||[]).slice(0,4).map((file,fi)=>(
                          <a key={fi} href={file.url} target="_blank" rel="noopener noreferrer" title={file.name}
                            onClick={e=>e.stopPropagation()}
                            style={{display:'inline-flex',alignItems:'center',gap:'.2rem',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:6,padding:'2px 7px',fontSize:'.68rem',color:'var(--ink-2)',textDecoration:'none',transition:'border .14s'}}
                            onMouseEnter={e=>e.currentTarget.style.borderColor='var(--gold)'}
                            onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                            {FILE_ICONS[file.kind]||FILE_ICONS.other} {file.name.length>14?file.name.slice(0,14)+'…':file.name}
                          </a>
                        ))}
                        {(f.files||[]).length>4&&<span style={{fontSize:'.68rem',color:'var(--ink-3)',alignSelf:'center'}}>+{f.files.length-4} more</span>}
                      </div>
                    )}
                  </div>
                </div>
                <div className="formation-price">{fmtRev(f.price)}</div>
              </div>
            )
          })
        }
      </div>

      {editFormation&&!selectMode&&(
        <FormationEditModal
          formation={editFormation}
          workspaceId={workspace.id}
          onClose={()=>setEditFormation(null)}
          onSaved={fetchData}
          onDeleted={fetchData}
          toast={toast}
        />
      )}
    </div>
  )
}

// ── CLIENTS ───────────────────────────────────────────────────────────────────
function Clients({ workspace, lang='en' }) {
  const [data,setData]=useState([])
  const [loading,setLoading]=useState(true)

  useEffect(()=>{if(workspace)fetchData()},[workspace])
  async function fetchData(){const{data}=await supabase.from('clients').select('*').eq('workspace_id',workspace.id).order('created_at',{ascending:false});setData(data||[]);setLoading(false)}

  return (
    <div>
      <div className="page-head"><div><div className="page-title">{t(lang,'clients_title')}</div><div className="page-sub">{t(lang,'clients_sub')}</div></div></div>
      <div className="card">
        {loading?<div style={{padding:'2rem',color:'var(--ink-3)'}}>Loading...</div>
          :data.length===0?<div className="empty-state"><div className="empty-icon">{I.users}</div><div className="empty-title">{t(lang,'no_clients')}</div><div className="empty-sub">{t(lang,'clients_appear')}</div></div>
          :<table className="tbl">
            <thead><tr><th>Name</th><th>Visits</th><th>Total Spent</th><th>Tag</th></tr></thead>
            <tbody>{data.map(c=>(
              <tr key={c.id}>
                <td className="tbl-name">{c.full_name}</td>
                <td>{c.total_visits}</td>
                <td className="tbl-amount">{fmtRev(c.total_spent)}</td>
                <td>{c.tag?<span className={`badge badge-${c.tag==='vip'?'vip':c.tag==='new'?'new':'confirmed'}`}>{c.tag.toUpperCase()}</span>:'—'}</td>
              </tr>
            ))}</tbody>
          </table>
        }
      </div>
    </div>
  )
}

// ── SETTINGS ──────────────────────────────────────────────────────────────────
// ── AVAILABILITY ─────────────────────────────────────────────────────────────
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
    let avail = a.data||[]
    // Auto-create 7 default rows if none exist (first-time setup)
    if(avail.length===0){
      const defaults=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map((_,i)=>({
        workspace_id:workspace.id,day_of_week:i,
        is_open:i>=1&&i<=5,open_time:'09:00:00',close_time:'18:00:00'
      }))
      const{data:created}=await supabase.from('availability').insert(defaults).select()
      avail=created||[]
    }
    setSchedule(avail)
    setBlockedDates(b.data||[])
    setLoading(false)
  }

  async function toggleDay(id,cur){await supabase.from('availability').update({is_open:!cur}).eq('id',id);fetchData()}
  async function updateTime(id,field,val){await supabase.from('availability').update({[field]:val}).eq('id',id);fetchData()}

  async function addBlock(e){
    e.preventDefault()
    if(!blockInput.date) return
    await supabase.from('blocked_dates').insert({workspace_id:workspace.id,blocked_date:blockInput.date,reason:blockInput.reason})
    toast('Date blocked.')
    setBlockInput({date:'',reason:''})
    fetchData()
  }
  async function removeBlock(id){
    await supabase.from('blocked_dates').delete().eq('id',id)
    toast('Date unblocked.')
    fetchData()
  }

  if(loading) return <div style={{padding:'2rem',color:'var(--ink-3)'}}>Loading...</div>

  return (
    <div>
      <div className="page-head"><div><div className="page-title">{t(lang,'avail_title')}</div><div className="page-sub">{t(lang,'avail_sub')}</div></div></div>

      <div className="card" style={{marginBottom:'1.25rem'}}>
        <div className="card-head"><div className="card-title">Weekly schedule</div></div>
        <div style={{padding:'0 1.4rem'}}>
          {schedule.map(day=>(
            <div key={day.id} style={{display:'flex',alignItems:'center',gap:'1rem',padding:'.9rem 0',borderBottom:'1px solid var(--border)'}}>
              <div style={{width:'88px',fontWeight:500,fontSize:'.85rem',color:'var(--ink)',flexShrink:0}}>{dayNames[day.day_of_week]}</div>
              <button
                className={`btn btn-xs ${day.is_open?'btn-primary':'btn-secondary'}`}
                style={{minWidth:62,justifyContent:'center'}}
                onClick={()=>toggleDay(day.id,day.is_open)}
              >
                {day.is_open?'Open':'Closed'}
              </button>
              {day.is_open&&(
                <div style={{display:'flex',alignItems:'center',gap:'.5rem',flex:1}}>
                  <input type="time" value={day.open_time||'09:00'} className="avail-time"
                    onChange={e=>updateTime(day.id,'open_time',e.target.value)}/>
                  <span style={{color:'var(--ink-3)',fontSize:'.78rem'}}>to</span>
                  <input type="time" value={day.close_time||'18:00'} className="avail-time"
                    onChange={e=>updateTime(day.id,'close_time',e.target.value)}/>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-head"><div className="card-title">Blocked dates</div></div>
        <form onSubmit={addBlock} style={{padding:'1.1rem 1.4rem',display:'flex',gap:'.75rem',flexWrap:'wrap',alignItems:'flex-end',borderBottom:'1px solid var(--border)'}}>
          <div className="field" style={{flex:1,minWidth:130}}>
            <label>Date</label>
            <input type="date" value={blockInput.date} onChange={e=>setBlockInput(f=>({...f,date:e.target.value}))} required/>
          </div>
          <div className="field" style={{flex:2,minWidth:160}}>
            <label>Reason (optional)</label>
            <input value={blockInput.reason} onChange={e=>setBlockInput(f=>({...f,reason:e.target.value}))} placeholder="Vacation, training..."/>
          </div>
          <button type="submit" className="btn btn-primary btn-sm">Block date</button>
        </form>
        {blockedDates.length===0
          ?<div className="empty-state"><div className="empty-title" style={{fontSize:'.85rem'}}>No blocked dates</div></div>
          :blockedDates.map(b=>(
            <div key={b.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'.85rem 1.4rem',borderBottom:'1px solid var(--border)'}}>
              <div>
                <div style={{fontWeight:500,fontSize:'.85rem',color:'var(--ink)'}}>
                  {new Date(b.blocked_date+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
                </div>
                {b.reason&&<div style={{fontSize:'.75rem',color:'var(--ink-3)',marginTop:2}}>{b.reason}</div>}
              </div>
              <button className="btn btn-xs" style={{color:'var(--red)',border:'1px solid rgba(192,57,43,.2)',background:'var(--surface)'}} onClick={()=>removeBlock(b.id)}>Unblock</button>
            </div>
          ))
        }
      </div>
    </div>
  )
}

// ── SETTINGS ─────────────────────────────────────────────────────────────────
function Settings({ workspace, toast, refetch, theme, setTheme, session, ownerData, lang='en' }) {
  const [section,setSection]=useState(null)

  const BackBtn = ()=>(
    <button className="settings-back-btn" onClick={()=>setSection(null)}>
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" width="13" height="13"><path d="M10 3L5 8l5 5"/></svg>
      Settings
    </button>
  )

  const sections=[
    {key:'profile',    label:t(lang,'profile'),    sub:t(lang,'profile_sub')},
    {key:'business',   label:t(lang,'business'),   sub:t(lang,'business_sub')},
    {key:'appearance', label:t(lang,'appearance'), sub:t(lang,'appearance_sub')},
    {key:'language',   label:t(lang,'language'),   sub:t(lang,'language_sub')},
  ]

  if(section==='profile') return (
    <div>
      <div className="page-head"><div><BackBtn/><div className="page-title" style={{marginTop:'.4rem'}}>{t(lang,'profile')}</div></div></div>
      <div className="card" style={{marginBottom:'1.25rem'}}>
        <div className="card-head"><div className="card-title">Personal information</div></div>
        <SettingsProfileForm session={session} ownerData={ownerData} toast={toast} refetch={refetch} lang={lang}/>
      </div>
      <div className="card">
        <div className="card-head"><div className="card-title">Password</div></div>
        <SettingsPasswordForm session={session} toast={toast} lang={lang}/>
      </div>
    </div>
  )

  if(section==='business') return (
    <div>
      <div className="page-head">
        <div><BackBtn/><div className="page-title" style={{marginTop:'.4rem'}}>{t(lang,'business')}</div></div>
        <button className="btn btn-secondary btn-sm" onClick={async()=>{
          await supabase.from('workspaces').update({is_published:!workspace.is_published}).eq('id',workspace.id)
          toast(workspace.is_published?'Profile unpublished.':'Profile is now live!');refetch()
        }}>{workspace?.is_published?t(lang,'unpublish'):t(lang,'publish')}</button>
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
            <label className="toggle-wrap">
              <input type="checkbox" checked={theme==='dark'} onChange={e=>setTheme(e.target.checked?'dark':'light')}/>
              <div className="toggle-track"/><div className="toggle-thumb"/>
            </label>
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
          <div key={s.key} className="settings-section-row"
            style={{borderBottom:i<sections.length-1?'1px solid var(--border)':'none'}}
            onClick={()=>setSection(s.key)}>
            <div>
              <div className="settings-section-label">{s.label}</div>
              <div className="settings-section-sub">{s.sub}</div>
            </div>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" width="14" height="14" style={{color:'var(--ink-3)',flexShrink:0}}>
              <path d="M6 3l5 5-5 5"/>
            </svg>
          </div>
        ))}
      </div>
    </div>
  )
}

function SettingsProfileForm({ session, ownerData, toast, refetch, lang='en' }) {
  const [form,setForm]=useState({full_name:ownerData?.full_name||'',email:session?.user?.email||''})
  const [loading,setLoading]=useState(false)
  const [saved,setSaved]=useState(false)
  useEffect(()=>{
    setForm(f=>({...f,full_name:ownerData?.full_name||''}))
  },[ownerData?.full_name])
  async function save(e){
    e.preventDefault();setLoading(true);setSaved(false)
    const uid=session?.user?.id
    if(uid){
      const{error}=await supabase.from('users').upsert({id:uid,full_name:form.full_name,email:session?.user?.email||''},{onConflict:'id'})
      if(error){toast('Error saving name: '+error.message);setLoading(false);return}
    }
    if(form.email&&form.email!==session?.user?.email){
      const{error}=await supabase.auth.updateUser({email:form.email})
      if(error){toast('Error updating email: '+error.message);setLoading(false);return}
    }
    setSaved(true);toast('Profile saved.')
    if(refetch) await refetch()
    setLoading(false)
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
  const [pw,setPw]=useState('')
  const [loading,setLoading]=useState(false)
  async function save(e){
    e.preventDefault();setLoading(true)
    const{error}=await supabase.auth.updateUser({password:pw})
    if(error) toast(`Error: ${error.message}`)
    else{toast('A confirmation link has been sent to your email.');setPw('')}
    setLoading(false)
  }
  return (
    <form onSubmit={save} className="card-body" style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
      <div className="field"><label>New password</label><input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Minimum 8 characters" minLength={8} required/></div>
      <div style={{fontSize:'.76rem',color:'var(--ink-3)',lineHeight:1.55,padding:'.6rem .85rem',background:'var(--bg)',borderRadius:8}}>
        A confirmation link will be sent to your email before the change takes effect.
      </div>
      <button type="submit" className="btn btn-primary" style={{justifyContent:'center',padding:'.75rem'}} disabled={loading}>{loading?t(lang,'saving'):t(lang,'update_pw')}</button>
    </form>
  )
}

function SettingsBusinessForm({ workspace, toast, refetch, lang='en' }) {
  const [form,setForm]=useState({
    name:workspace?.name||'',tagline:workspace?.tagline||'',bio:workspace?.bio||'',
    location:workspace?.location||'',email:workspace?.email||'',
    phone:workspace?.phone||'',instagram:workspace?.instagram||'',tiktok:workspace?.tiktok||'',
  })
  useEffect(()=>{
    if(workspace) setForm({name:workspace.name||'',tagline:workspace.tagline||'',bio:workspace.bio||'',
      location:workspace.location||'',email:workspace.email||'',
      phone:workspace.phone||'',instagram:workspace.instagram||'',tiktok:workspace.tiktok||''})
  },[workspace?.id])
  const [loading,setLoading]=useState(false)
  const [saved,setSaved]=useState(false)
  async function save(e){
    e.preventDefault();if(!workspace?.id){toast('Workspace not loaded.');return}
    setLoading(true);setSaved(false)
    const{error}=await supabase.from('workspaces').update({
      name:form.name,tagline:form.tagline,bio:form.bio,location:form.location,
      email:form.email,phone:form.phone,instagram:form.instagram,tiktok:form.tiktok,
    }).eq('id',workspace.id)
    if(error) toast(`Error: ${error.message}`)
    else{setSaved(true);toast('Business profile saved.');await refetch()}
    setLoading(false)
  }
  return (
    <div className="card">
      <div className="card-head"><div className="card-title">Business profile</div></div>
      <form onSubmit={save} className="card-body" style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
        <div className="field"><label>Business name</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required/></div>
        <div className="field"><label>Tagline</label><input value={form.tagline} onChange={e=>setForm(f=>({...f,tagline:e.target.value}))} placeholder="e.g. Natural Hair Specialist · Montreal, QC"/></div>
        <div className="field"><label>Bio</label>
          <textarea value={form.bio} onChange={e=>setForm(f=>({...f,bio:e.target.value}))} rows={3} placeholder="Tell your clients about your work..."
            style={{padding:'.6rem .9rem',border:'1px solid var(--border-2)',borderRadius:8,fontFamily:'inherit',fontSize:'.88rem',resize:'vertical',outline:'none',color:'var(--ink)',background:'var(--surface)'}}/>
        </div>
        <div className="field"><label>Location</label><input value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))}/></div>
        <div style={{height:1,background:'var(--border)',margin:'.15rem 0'}}/>
        <div style={{fontSize:'.68rem',fontWeight:600,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.08em'}}>Contact</div>
        <div className="field"><label>Business email</label><input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="Can be same as personal email"/></div>
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
  const [saved,setSaved]=useState(false)
  const [loading,setLoading]=useState(false)
  const langs=[
    {key:'en',label:'English',  region:'United States / Canada'},
    {key:'fr',label:'Français', region:'France / Canada'},
    {key:'es',label:'Español',  region:'España / Latinoamérica'},
  ]
  async function save(){
    setLoading(true);setSaved(false)
    const uid=ownerData?.id||null
    if(uid){
      const{error}=await supabase.from('users').update({language:selectedLang}).eq('id',uid)
      if(error){toast('Error saving language: '+error.message);setLoading(false);return}
    }
    setSaved(true);toast('Language saved.')
    if(refetch) await refetch()
    setLoading(false)
  }
  return (
    <div className="card">
      <div className="card-head"><div className="card-title">{t(lang,'display_lang')}</div></div>
      <div style={{padding:'1rem 1.4rem',display:'flex',flexDirection:'column',gap:'.5rem'}}>
        {langs.map(l=>(
          <div key={l.key} className={`lang-row${selectedLang===l.key?' lang-active':''}`} onClick={()=>setSelectedLang(l.key)}>
            <div>
              <div className="lang-label">{l.label}</div>
              <div className="lang-sub">{l.region}</div>
            </div>
            <div className={`lang-check-circle${selectedLang===l.key?' lang-check-active':''}`}>
              {selectedLang===l.key&&<svg viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.5" width="10" height="10"><polyline points="1.5,5 4,7.5 8.5,2.5"/></svg>}
            </div>
          </div>
        ))}
        <button className="btn btn-primary" style={{justifyContent:'center',padding:'.75rem',marginTop:'.5rem'}} onClick={save} disabled={loading}>
          {loading?t(lang,'saving'):saved?t(lang,'saved'):t(lang,'save_lang')}
        </button>
      </div>
    </div>
  )
}

// ── CLIENT PAGE PREVIEW ───────────────────────────────────────────────────────
function ClientPage({ workspace }) {
  const [tab,setTab]=useState('book')
  const [services,setServices]=useState([])
  const [products,setProducts]=useState([])
  const [offerings,setOfferings]=useState([])
  const [modal,setModal]=useState(null)

  useEffect(()=>{
    if(!workspace) return
    Promise.all([
      supabase.from('services').select('*').eq('workspace_id',workspace.id).eq('is_active',true),
      supabase.from('products').select('*').eq('workspace_id',workspace.id),
      supabase.from('offerings').select('*').eq('workspace_id',workspace.id),
    ]).then(([s,p,o])=>{setServices(s.data||[]);setProducts(p.data||[]);setOfferings(o.data||[])})
  },[workspace])

  const initial=workspace?.name?.charAt(0)?.toUpperCase()||'?'

  return (
    <div style={{background:'#fff',minHeight:'100vh'}}>
      <div className="cp-topbar">
        <div className="cp-logo">{workspace?.name||'Your Studio'}<span style={{color:'var(--gold)'}}>.</span></div>
        <div style={{display:'flex',gap:'.75rem'}}>
          {workspace?.instagram&&<button className="cp-ghost" onClick={()=>window.open(`https://instagram.com/${workspace.instagram.replace('@','')}`)}>Instagram</button>}
          {workspace?.phone&&<button className="cp-ghost">Contact</button>}
        </div>
      </div>
      <div className="cp-hero">
        <div className="cp-av">{initial}</div>
        <div className="cp-name">{workspace?.name||'Your Studio'}</div>
        <div className="cp-bio">{workspace?.tagline||'Add your tagline in Settings'}</div>
        {workspace?.location&&<div className="cp-bio" style={{marginTop:'.25rem'}}>&#128205; {workspace.location}</div>}
        <div className="cp-stats">
          {[[`${services.length}`,'Services'],[`${products.length}`,'Products'],[`${offerings.length}`,'Formations']].map(([v,l],i)=>(
            <div key={i} style={{textAlign:'center'}}><div className="cp-sval">{v}</div><div className="cp-slbl">{l}</div></div>
          ))}
        </div>
      </div>
      <div className="cp-nav">
        {[['book','Book a service'],['shop','Shop'],['learn','Formations']].map(([k,l])=>(
          <div key={k} className={`cp-tab${tab===k?' active':''}`} onClick={()=>setTab(k)}>{l}</div>
        ))}
      </div>
      <div className="cp-body">
        {tab==='book'&&<><div className="cp-stitle">Services</div>
          {services.length===0?<div style={{color:'#7a7774',fontSize:'.85rem'}}>No services added yet.</div>
            :<div className="svc-list">{services.map((s,i)=>(
              <div key={i} className="svc-row" onClick={()=>setModal(s)}>
                <div className="svc-bar"/>
                <div className="svc-info"><div className="svc-name">{s.name}</div>{s.duration_min&&<div className="svc-dur">{s.duration_min} min</div>}</div>
                <div className="svc-price">{fmtFree(s.price)}</div>
                <button className="bk-btn">Book</button>
              </div>
            ))}</div>}
        </>}
        {tab==='shop'&&<><div className="cp-stitle">Hair Products</div>
          {products.length===0?<div style={{color:'#7a7774',fontSize:'.85rem'}}>No products added yet.</div>
            :<div className="shop-grid">{products.map(p=>(
              <div key={p.id} className="shop-card"><div className="shop-img">PRODUCT</div>
                <div className="shop-body"><div className="shop-name">{p.name}</div><div className="shop-price">{fmtRev(p.price)}</div><button className="shop-btn">Add to cart</button></div>
              </div>
            ))}</div>}
        </>}
        {tab==='learn'&&<><div className="cp-stitle">Formations</div>
          {offerings.length===0?<div style={{color:'#7a7774',fontSize:'.85rem'}}>No formations added yet.</div>
            :offerings.map((f,i)=>(
              <div key={f.id} className="fm-card">
                <div className="fm-idx">0{i+1}</div>
                <div className="fm-info"><div className="fm-name">{f.title}</div><div className="fm-desc">{f.description}</div>{f.duration_label&&<div className="fm-tags"><span>{f.duration_label}</span></div>}</div>
                <div className="fm-price">{fmtRev(f.price)}</div>
              </div>
            ))}
        </>}
      </div>
      <div className="cp-footer"><p>Powered by <strong>Organized.</strong> &#8212; beorganized.io</p></div>
      {modal&&(
        <div className="overlay" onClick={()=>setModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-title">Book &#8212; {modal.name}</div>
            <div className="modal-sub">Fill in your details and we'll confirm your appointment.</div>
            <div className="field"><label>Full name</label><input placeholder="e.g. Amara Diallo"/></div>
            <div className="field"><label>Phone number</label><input placeholder="+1 (514) ..."/></div>
            <div className="field"><label>Preferred date</label><input type="date"/></div>
            <div className="field"><label>Notes (optional)</label><input placeholder="Hair length, allergies..."/></div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={()=>setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={()=>setModal(null)}>Send request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
export default function Dashboard({ session }) {
  const [view,setView]=useState('dashboard')
  const [page,setPage]=useState('overview')
  const [prevPage,setPrevPage]=useState(null)
  const [theme,setTheme]=useState('light')
  const [sidebarOpen,setSidebarOpen]=useState(false)
  const [workspace,setWorkspace]=useState(null)
  const [ownerData,setOwnerData]=useState(null)
  const [pendingCount,setPendingCount]=useState(0)
  const [toast,setToast]=useState('')
  const [showMenu,setShowMenu]=useState(false)

  useEffect(()=>{fetchWorkspace()},[session])

  const lang = ownerData?.language || 'en'

  async function fetchWorkspace(){
    const{data}=await supabase.from('workspaces').select('*').eq('user_id',session.user.id).single()
    setWorkspace(data)
    if(data){
      const{data:ap}=await supabase.from('appointments').select('id').eq('workspace_id',data.id).eq('status','pending')
      setPendingCount((ap||[]).length)
    }
    const{data:usr}=await supabase.from('users').select('*').eq('id',session.user.id).single()
    if(usr) setOwnerData(usr)
  }
  function showToast(msg){setToast(msg);setTimeout(()=>setToast(''),3000)}
  async function handleSignOut(){
    setShowMenu(false)
    setSidebarOpen(false)
    await supabase.auth.signOut()
    window.location.href='/'
  }

  function navigateTo(key){
    if(key!==page) setPrevPage(page)
    setPage(key)
    setSidebarOpen(false)
  }
  function goBack(){
    if(prevPage){setPage(prevPage);setPrevPage(null)}
    else setPage('overview')
  }

  const navItems=[
    {key:'overview',     label:t(lang,'nav_overview'),     icon:I.home},
    {key:'appointments', label:t(lang,'nav_appointments'), icon:I.cal,  count:pendingCount||null},
    {key:'services',     label:t(lang,'nav_services'),     icon:I.box},
    {key:'products',     label:t(lang,'nav_products'),     icon:I.box},
    {key:'formations',   label:t(lang,'nav_formations'),   icon:I.grad},
    {key:'clients',      label:t(lang,'nav_clients'),      icon:I.users},
    {key:'availability', label:t(lang,'nav_availability'), icon:I.avail},
    {key:'settings',     label:t(lang,'nav_settings'),     icon:I.gear},
  ]

  return (
    <div data-theme={theme} style={{minHeight:'100vh',background:'var(--bg)',transition:'background .3s,color .3s'}}>
      <style>{css}</style>

      <div className="topbar">
        <div style={{display:'flex',alignItems:'center',gap:'.85rem'}}>
          {view==='dashboard'&&(
            <button className={`hamburger${sidebarOpen?' open':''}`} onClick={()=>setSidebarOpen(o=>!o)}>
              <span/><span/><span/>
            </button>
          )}
          {view==='dashboard'&&page!=='overview'&&(
            <button className="back-btn" onClick={goBack} title="Back">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14"><path d="M10 3L5 8l5 5"/></svg>
            </button>
          )}
          <div className="topbar-logo" style={{cursor:'pointer'}} onClick={()=>{navigateTo('overview');setView('dashboard')}}>
            Organized<span>.</span>
          </div>
        </div>
        <div className="view-toggle">
          <button className={`vt-btn${view==='dashboard'?' active':''}`} onClick={()=>setView('dashboard')}>
            <span className="vt-label-short">Dash</span><span className="vt-label-full">Dashboard</span>
          </button>
          <button className={`vt-btn${view==='client'?' active':''}`} onClick={()=>setView('client')}>
            <span className="vt-label-short">Client</span><span className="vt-label-full">Client page preview</span>
          </button>
        </div>
        <div className="topbar-right">
          {pendingCount>0&&(
            <button className="notif-btn" onClick={()=>{navigateTo('appointments');setView('dashboard')}}>
              {I.bell}<span className="notif-dot"/>
            </button>
          )}
          <div style={{position:'relative'}}>
            <div className="avatar" onClick={()=>setShowMenu(o=>!o)}>{session.user.email?.[0]?.toUpperCase()}</div>
            {showMenu&&(
              <div style={{position:'absolute',right:0,top:'42px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'10px',boxShadow:'0 8px 24px rgba(0,0,0,.12)',minWidth:'180px',zIndex:100,overflow:'hidden'}}>
                <div style={{padding:'.65rem 1rem',fontSize:'.75rem',color:'var(--ink-3)',borderBottom:'1px solid var(--border)'}}>{session.user.email}</div>
                <div style={{padding:'.65rem 1rem',fontSize:'.82rem',color:'var(--ink)',cursor:'pointer'}} onClick={()=>{navigateTo('settings');setShowMenu(false)}}>Settings</div>
                <div style={{padding:'.65rem 1rem',fontSize:'.82rem',color:'#c0392b',cursor:'pointer',borderTop:'1px solid var(--border)'}} onClick={handleSignOut}>Sign out</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {view==='dashboard'?(
        <div className="app-shell">
          {sidebarOpen&&<div className="sidebar-backdrop" onClick={()=>setSidebarOpen(false)}/>}
          <aside className={`sidebar${sidebarOpen?' open':''}`}>
            <div className="sidebar-group-label">Workspace</div>
            {navItems.map(n=>(
              <div key={n.key} className={`nav-item${page===n.key?' active':''}`} onClick={()=>navigateTo(n.key)}>
                <span className="nav-icon">{n.icon}</span>{n.label}
                {n.count&&<span className="nav-count">{n.count}</span>}
              </div>
            ))}
            <div className="sidebar-group-label" style={{marginTop:'1rem'}}>Account</div>
            <div className="nav-item" onClick={handleSignOut}>{t(lang,"nav_signout")}</div>
            <div className="sidebar-footer">
              <div className="sidebar-plan">
                <strong>Pro Plan</strong>
                <a className="slug-link" href={workspace?.slug?`https://beorganized.io/${workspace.slug}`:undefined}
                  target="_blank" rel="noopener noreferrer" onClick={e=>{if(!workspace?.slug)e.preventDefault()}}>
                  beorganized.io/{workspace?.slug||'...'}
                </a>
              </div>
              <div className="plan-bar"><div className="plan-fill"/></div>
            </div>
          </aside>
          <main className="main">
            {/* Guard: show loader while workspace is fetching to prevent null workspace bugs */}
            {!workspace ? (
              <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh'}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',color:'var(--gold)',opacity:.7}}>Loading…</div>
              </div>
            ) : (
              <>
                {page==='overview'     &&<Overview     workspace={workspace} session={session} ownerData={ownerData} toast={showToast} setPage={navigateTo} refetchWorkspace={fetchWorkspace} lang={lang}/>}
                {page==='appointments' &&<Appointments workspace={workspace} toast={showToast} lang={lang}/>}
                {page==='services'     &&<Services     workspace={workspace} toast={showToast} lang={lang}/>}
                {page==='products'     &&<Products     workspace={workspace} toast={showToast} lang={lang}/>}
                {page==='formations'   &&<Formations   workspace={workspace} toast={showToast} lang={lang}/>}
                {page==='clients'      &&<Clients      workspace={workspace} lang={lang}/>}
                {page==='availability' &&<Availability workspace={workspace} toast={showToast} lang={lang}/>}
                {page==='settings'     &&<Settings     workspace={workspace} toast={showToast} refetch={fetchWorkspace} theme={theme} setTheme={setTheme} session={session} ownerData={ownerData} lang={lang}/>}
              </>
            )}
          </main>
        </div>
      ):(
        <ClientPage workspace={workspace}/>
      )}

      {toast&&<div className="toast">{toast}</div>}
    </div>
  )
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Inter:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#f7f6f3;--surface:#ffffff;--ink:#111110;--ink-2:#3d3c3a;--ink-3:#7a7774;
  --border:#e4e2dc;--border-2:#d0cec8;--gold:#b5893a;--gold-dim:#e8d9bf;--gold-lt:#fdf4e7;
  --red:#c0392b;--green:#2e7d52;
  --row-hover:#faf9f7;--tbl-head:#faf9f7;
  --btn-primary-bg:#111110;--btn-primary-text:#ffffff;
  --bc:rgba(46,125,82,.1);--bcc:#2e7d52;
  --bp:rgba(202,138,4,.1);--bpc:#854d0e;
  --bv:rgba(181,137,58,.1);--bvc:#b5893a;
  --bn:rgba(29,78,216,.1);--bnc:#1d4ed8;
  --bl:rgba(192,57,43,.1);--blc:#c0392b;
  --sidebar-w:230px;--topbar-h:56px;
}
[data-theme="dark"]{
  --bg:#0d0c0a;--surface:#1a1815;--ink:#f0ede8;--ink-2:#c4bfb8;--ink-3:#6b6762;
  --border:#2a2825;--border-2:#333028;--gold-lt:#3a3020;
  --row-hover:#201e1b;--tbl-head:#161412;
  --btn-primary-bg:#f0ede8;--btn-primary-text:#111110;
  --bc:rgba(46,125,82,.15);--bcc:#4ade80;
  --bp:rgba(202,138,4,.12);--bpc:#fbbf24;
  --bv:rgba(181,137,58,.12);--bvc:#e8d9bf;
  --bn:rgba(29,78,216,.15);--bnc:#93c5fd;
  --bl:rgba(192,57,43,.15);--blc:#f87171;
}
body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--ink);font-size:14px;}
.topbar{height:var(--topbar-h);background:var(--surface);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 1.5rem;position:sticky;top:0;z-index:50;gap:.75rem;transition:background .3s,border-color .3s;}
.topbar-logo{font-family:'Playfair Display',serif;font-size:1.25rem;font-weight:600;color:var(--ink);}
.topbar-logo span{color:var(--gold);}
.topbar-right{display:flex;align-items:center;gap:.75rem;flex-shrink:0;}
.view-toggle{display:flex;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:3px;flex-shrink:0;}
.vt-btn{padding:5px 14px;border-radius:6px;border:none;background:transparent;font-size:.78rem;font-weight:500;color:var(--ink-3);cursor:pointer;transition:all .15s;}
.vt-btn.active{background:var(--surface);color:var(--ink);box-shadow:0 1px 3px rgba(0,0,0,.08);}
.vt-label-short{display:none;}.vt-label-full{display:inline;}
.notif-btn{position:relative;background:none;border:1px solid var(--border);border-radius:8px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--ink-3);}
.notif-btn svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:1.5;}
.notif-dot{position:absolute;top:6px;right:6px;width:7px;height:7px;border-radius:50%;background:var(--gold);border:1.5px solid var(--surface);}
.avatar{width:34px;height:34px;border-radius:50%;background:var(--gold-lt);border:1px solid var(--gold);display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:600;color:var(--gold);cursor:pointer;}
.hamburger{background:none;border:none;cursor:pointer;display:flex;flex-direction:column;justify-content:center;gap:5px;width:34px;height:34px;padding:4px;border-radius:7px;transition:background .15s;}
.hamburger:hover{background:var(--border);}
.hamburger span{display:block;height:1.5px;width:20px;background:var(--ink);border-radius:2px;transition:all .25s ease;transform-origin:center;}
.hamburger.open span:nth-child(1){transform:translateY(6.5px) rotate(45deg);}
.hamburger.open span:nth-child(2){opacity:0;transform:scaleX(0);}
.hamburger.open span:nth-child(3){transform:translateY(-6.5px) rotate(-45deg);}
.app-shell{display:flex;min-height:calc(100vh - var(--topbar-h));position:relative;overflow:hidden;}
.sidebar-backdrop{position:fixed;inset:0;top:var(--topbar-h);background:rgba(0,0,0,.25);z-index:39;}
.sidebar{width:var(--sidebar-w);background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;padding:1.25rem 0;position:fixed;top:var(--topbar-h);left:0;bottom:0;z-index:40;transform:translateX(-100%);transition:transform .28s cubic-bezier(.4,0,.2,1),background .3s,border-color .3s;box-shadow:4px 0 24px rgba(0,0,0,.08);}
.sidebar.open{transform:translateX(0);}
.sidebar-group-label{font-size:.68rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);padding:.75rem 1.25rem .35rem;}
.nav-item{display:flex;align-items:center;gap:.6rem;padding:.55rem 1.25rem;cursor:pointer;color:var(--ink-3);font-size:.84rem;transition:all .15s;border-left:2px solid transparent;}
.nav-item:hover{color:var(--ink);background:var(--bg);}
.nav-item.active{color:var(--ink);background:var(--bg);border-left-color:var(--gold);font-weight:500;}
.nav-icon{width:16px;height:16px;opacity:.55;flex-shrink:0;}
.nav-item.active .nav-icon{opacity:1;}
.nav-count{margin-left:auto;font-size:.68rem;font-weight:600;background:var(--gold-dim);color:var(--gold);padding:1px 7px;border-radius:20px;}
.sidebar-footer{margin-top:auto;padding:1rem 1.25rem;border-top:1px solid var(--border);}
.sidebar-plan{font-size:.75rem;color:var(--ink-3);}
.sidebar-plan strong{color:var(--ink);display:block;margin-bottom:.2rem;font-size:.8rem;}
.slug-link{display:block;color:var(--ink-3);text-decoration:none;font-size:.72rem;transition:color .15s;margin-top:.15rem;}
.slug-link:hover{color:var(--gold);text-decoration:underline;}
.plan-bar{height:4px;background:var(--border);border-radius:2px;margin-top:.5rem;}
.plan-fill{height:100%;width:62%;background:var(--gold);border-radius:2px;}
.main{flex:1;padding:2rem 2.25rem;overflow-y:auto;background:var(--bg);transition:background .3s;}
.page-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1.5rem;}
.page-title{font-family:'Playfair Display',serif;font-size:1.75rem;font-weight:500;color:var(--ink);}
.page-sub{font-size:.82rem;color:var(--ink-3);margin-top:.25rem;}
.head-actions{display:flex;gap:.6rem;align-items:center;flex-shrink:0;}
.btn{display:inline-flex;align-items:center;gap:.4rem;padding:.5rem 1.1rem;border-radius:8px;font-size:.82rem;font-weight:500;cursor:pointer;border:none;font-family:inherit;transition:all .15s;}
.btn-primary{background:var(--btn-primary-bg);color:var(--btn-primary-text);}
.btn-primary:hover{opacity:.88;}
.btn-secondary{background:var(--surface);color:var(--ink);border:1px solid var(--border-2);}
.btn-secondary:hover{border-color:var(--ink-3);}
.btn-sm{padding:.35rem .85rem;font-size:.76rem;}
.btn-xs{padding:.25rem .65rem;font-size:.72rem;}
.next-up-banner{background:var(--ink);color:#fff;border-radius:12px;padding:1rem 1.25rem;display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;gap:1rem;}
.next-up-left{display:flex;align-items:center;gap:.85rem;}
.next-up-icon{width:36px;height:36px;border-radius:50%;background:rgba(181,137,58,.2);border:1px solid rgba(181,137,58,.3);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.next-up-icon svg{width:16px;height:16px;stroke:var(--gold);fill:none;stroke-width:1.5;}
.next-up-label{font-size:.72rem;color:rgba(255,255,255,.5);margin-bottom:.15rem;}
.next-up-name{font-size:.88rem;font-weight:500;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:180px;}
.next-up-right{text-align:right;flex-shrink:0;}
.next-up-time{font-family:'Playfair Display',serif;font-size:1.2rem;color:#fff;}
.next-up-amount{font-size:.75rem;color:var(--gold);margin-top:.1rem;}
.milestone-banner{background:linear-gradient(135deg,rgba(181,137,58,.12),rgba(181,137,58,.04));border:1px solid rgba(181,137,58,.25);border-radius:10px;padding:.85rem 1.1rem;display:flex;align-items:center;gap:.75rem;margin-bottom:1rem;animation:milestoneIn .4s cubic-bezier(.34,1.4,.64,1);}
@keyframes milestoneIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
.milestone-icon{font-size:1.25rem;flex-shrink:0;}
.milestone-text{font-size:.82rem;color:var(--ink-2);line-height:1.5;}
.stats-scroll{display:flex;gap:1rem;overflow-x:auto;margin-bottom:1.25rem;padding-bottom:.25rem;scrollbar-width:none;-webkit-overflow-scrolling:touch;}
.stats-scroll::-webkit-scrollbar{display:none;}
.stat-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:1.25rem 1.4rem;min-width:175px;flex-shrink:0;position:relative;}
.stat-card-btn{text-align:left;cursor:pointer;font-family:inherit;transition:transform .2s cubic-bezier(.34,1.4,.64,1),box-shadow .2s,border-color .2s;}
.stat-card-btn:hover{transform:translateY(-3px) scale(1.02);box-shadow:0 10px 28px rgba(0,0,0,.1);border-color:var(--gold);}
.stat-card-btn:active{transform:scale(0.96);transition:transform .08s;}
.stat-arrow{position:absolute;bottom:1rem;right:1.1rem;font-size:.85rem;color:var(--gold);opacity:0;transform:translateX(-5px);transition:opacity .18s,transform .18s;}
.stat-card-btn:hover .stat-arrow{opacity:1;transform:translateX(0);}
.stat-label{font-size:.7rem;font-weight:500;color:var(--ink-3);letter-spacing:.05em;text-transform:uppercase;margin-bottom:.5rem;}
.stat-value{font-family:'Playfair Display',serif;font-size:2rem;font-weight:500;color:var(--ink);line-height:1;margin-bottom:.4rem;}
.stat-delta{font-size:.73rem;margin-top:.4rem;}
.delta-up{color:var(--green);}.delta-down{color:var(--red);}
.goal-track{height:8px;background:var(--border);border-radius:4px;overflow:hidden;}
.goal-fill{height:100%;background:linear-gradient(90deg,#b5893a,#e8d5b0);border-radius:4px;transition:width .6s cubic-bezier(.34,1.2,.64,1);}
.goal-hint{margin-top:.75rem;font-size:.78rem;color:var(--ink-3);line-height:1.5;padding:.65rem .85rem;background:var(--bg);border-radius:8px;}
.goal-hint strong{color:var(--ink);}
.top-badge{display:inline-flex;align-items:center;gap:.3rem;font-size:.72rem;font-weight:600;color:var(--gold);background:var(--gold-lt);padding:2px 9px;border-radius:20px;}
.top-track{height:6px;background:var(--border);border-radius:3px;overflow:hidden;}
.top-fill{height:100%;background:var(--gold);border-radius:3px;transition:width .5s ease;}
.card{background:var(--surface);border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:1.25rem;transition:background .3s,border-color .3s;}
.card-head{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.4rem;border-bottom:1px solid var(--border);}
.card-title{font-size:.88rem;font-weight:600;color:var(--ink);}
.card-sub{font-size:.75rem;color:var(--ink-3);}
.card-body{padding:1.4rem;}
.tbl{width:100%;border-collapse:collapse;}
.tbl th{padding:.65rem 1.25rem;font-size:.7rem;font-weight:600;color:var(--ink-3);text-transform:uppercase;letter-spacing:.07em;text-align:left;background:var(--tbl-head);border-bottom:1px solid var(--border);}
.tbl td{padding:.85rem 1.25rem;font-size:.83rem;color:var(--ink-2);border-bottom:1px solid var(--border);vertical-align:middle;}
.tbl tr:last-child td{border-bottom:none;}
.tbl tbody tr:hover td{background:var(--row-hover);}
.tbl-name{font-weight:500;color:var(--ink)!important;}
.tbl-amount{font-weight:600;color:var(--ink)!important;}
.empty-state{padding:2.5rem 2rem;text-align:center;display:flex;flex-direction:column;align-items:center;gap:.5rem;}
.empty-icon{width:40px;height:40px;background:var(--bg);border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:.25rem;}
.empty-icon svg{width:18px;height:18px;stroke:var(--ink-3);fill:none;stroke-width:1.5;}
.empty-title{font-size:.9rem;font-weight:600;color:var(--ink);}
.empty-sub{font-size:.8rem;color:var(--ink-3);}
.badge{display:inline-flex;align-items:center;gap:.3rem;padding:2px 9px;border-radius:20px;font-size:.7rem;font-weight:500;}
.badge::before{content:'';width:5px;height:5px;border-radius:50%;flex-shrink:0;}
.badge-confirmed{background:var(--bc);color:var(--bcc);}.badge-confirmed::before{background:var(--bcc);}
.badge-pending{background:var(--bp);color:var(--bpc);}.badge-pending::before{background:var(--bpc);}
.badge-vip{background:var(--bv);color:var(--bvc);}.badge-vip::before{background:var(--bvc);}
.badge-new{background:var(--bn);color:var(--bnc);}.badge-new::before{background:var(--bnc);}
.badge-low{background:var(--bl);color:var(--blc);}.badge-low::before{background:var(--blc);}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;}
.bar-chart{display:flex;align-items:flex-end;gap:6px;height:72px;}
.bar{flex:1;border-radius:3px 3px 0 0;background:var(--border);transition:background .2s;min-height:4px;}
.bar:hover{background:var(--gold-dim);}.bar.peak{background:var(--gold);}
.bar-labels{display:flex;gap:6px;margin-top:.4rem;}
.bar-lbl{flex:1;font-size:.65rem;color:var(--ink-3);text-align:center;}
.cal-nav-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem;}
.cal-nav-row span{font-size:.84rem;font-weight:600;color:var(--ink);}
.cal-nav-btn{border:1px solid var(--border);border-radius:6px;width:26px;height:26px;display:flex;align-items:center;justify-content:center;background:var(--surface);cursor:pointer;font-size:.8rem;color:var(--ink-3);transition:border-color .15s;}
.cal-nav-btn:hover{border-color:var(--gold);color:var(--gold);}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;}
.cal-dname{text-align:center;font-size:.65rem;font-weight:600;color:var(--ink-3);padding:.25rem 0;}
.cal-d{text-align:center;font-size:.78rem;padding:.35rem .1rem;border-radius:5px;cursor:pointer;color:var(--ink-2);transition:background .1s;}
.cal-d:hover:not(.cal-empty){background:var(--bg);}
.cal-d.today{background:var(--ink);color:var(--surface);font-weight:600;}
.cal-d.booked{color:var(--gold);font-weight:600;}
.cal-empty{cursor:default;}
.prod-card{background:var(--surface);border:1px solid var(--border);border-radius:10px;overflow:hidden;}
.prod-img{height:120px;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:.72rem;color:var(--ink-3);letter-spacing:.06em;text-transform:uppercase;border-bottom:1px solid var(--border);}
.prod-body{padding:1rem;}
.prod-name{font-weight:600;font-size:.85rem;color:var(--ink);margin-bottom:.2rem;}
.prod-price{font-family:'Playfair Display',serif;font-size:1.1rem;color:var(--ink);margin-bottom:.5rem;}
.formation-row{display:flex;align-items:center;gap:1.25rem;padding:1.25rem 1.4rem;border-bottom:1px solid var(--border);transition:background .15s;}
.formation-row:last-child{border-bottom:none;}
.formation-row:hover{background:var(--bg);}
.formation-icon-block{width:44px;height:44px;border-radius:8px;background:var(--bg);display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid var(--border);}
.formation-icon-block svg{width:20px;height:20px;stroke:var(--gold);fill:none;stroke-width:1.5;}
.formation-info{flex:1;}
.formation-name{font-weight:600;font-size:.88rem;color:var(--ink);margin-bottom:.15rem;}
.formation-desc{font-size:.78rem;color:var(--ink-3);}
.formation-meta{display:flex;gap:1rem;margin-top:.35rem;font-size:.73rem;color:var(--ink-3);}
.formation-price{font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:500;color:var(--ink);}
.settings-row{display:flex;align-items:center;justify-content:space-between;padding:1rem 0;border-bottom:1px solid var(--border);}
.settings-row:last-child{border-bottom:none;}
.settings-row-label{font-size:.88rem;font-weight:500;color:var(--ink);}
.toggle-wrap{position:relative;width:44px;height:24px;cursor:pointer;flex-shrink:0;}
.toggle-wrap input{opacity:0;width:0;height:0;position:absolute;}
.toggle-track{position:absolute;inset:0;background:var(--border);border-radius:24px;transition:background .2s;}
.toggle-wrap input:checked + .toggle-track{background:var(--gold);}
.toggle-thumb{position:absolute;top:3px;left:3px;width:18px;height:18px;background:white;border-radius:50%;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.15);}
.toggle-wrap input:checked ~ .toggle-thumb{transform:translateX(20px);}
.theme-options{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:.75rem;}
.theme-option{border:2px solid var(--border);border-radius:10px;overflow:hidden;cursor:pointer;transition:border-color .15s;}
.theme-option.selected{border-color:var(--gold);}
.theme-preview{height:68px;display:flex;}
.theme-label{padding:.6rem .85rem;font-size:.78rem;font-weight:500;color:var(--ink);display:flex;align-items:center;gap:.5rem;}
.theme-check{width:16px;height:16px;border-radius:50%;background:var(--gold);display:flex;align-items:center;justify-content:center;}
.theme-check svg{width:8px;height:8px;stroke:#fff;fill:none;stroke-width:2.5;}
.tp-ls{width:30%;background:#fff;border-right:1px solid #e4e2dc;}
.tp-lm{flex:1;background:#f7f6f3;padding:.4rem;display:flex;flex-direction:column;gap:.3rem;}
.tp-lb{height:8px;background:#fff;border:1px solid #e4e2dc;border-radius:3px;}
.tp-ds{width:30%;background:#1a1815;border-right:1px solid #2a2825;}
.tp-dm{flex:1;background:#0d0c0a;padding:.4rem;display:flex;flex-direction:column;gap:.3rem;}
.tp-db{height:8px;background:#1a1815;border:1px solid #2a2825;border-radius:3px;}
.field{margin-bottom:0;}
.field label{display:block;font-size:.76rem;font-weight:500;color:var(--ink-3);margin-bottom:.4rem;}
.field input{width:100%;padding:.6rem .9rem;border:1px solid var(--border-2);border-radius:8px;font-size:.88rem;font-family:inherit;color:var(--ink);background:var(--surface);outline:none;transition:border .15s;}
.field input:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(181,137,58,.1);}
.toast{position:fixed;bottom:1.75rem;right:1.75rem;background:var(--ink);color:var(--surface);padding:.85rem 1.4rem;border-radius:9px;font-size:.82rem;z-index:200;box-shadow:0 8px 24px rgba(0,0,0,.2);border-left:3px solid var(--gold);animation:toastin .2s ease;}
@keyframes toastin{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.rev-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:200;display:flex;align-items:flex-end;animation:revFadeIn .2s ease;}
.rev-panel{background:var(--surface);width:100%;max-width:520px;margin:0 auto;border-radius:20px 20px 0 0;padding:1.75rem 1.5rem 3rem;animation:revSlideUp .32s cubic-bezier(.34,1.15,.64,1);}
@keyframes revSlideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes revFadeIn{from{opacity:0}to{opacity:1}}
.rev-panel-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:.5rem;}
.rev-panel-title{font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:500;color:var(--ink);}
.rev-panel-sub{font-size:.78rem;color:var(--ink-3);margin-top:.15rem;text-transform:capitalize;}
.rev-close{background:var(--bg);border:none;width:32px;height:32px;border-radius:50%;font-size:.85rem;cursor:pointer;color:var(--ink-3);display:flex;align-items:center;justify-content:center;}
.rev-total{font-family:'Playfair Display',serif;font-size:2.8rem;font-weight:500;color:var(--ink);margin-bottom:1.5rem;}
.rev-chart-wrap{position:relative;margin-bottom:1.5rem;background:var(--bg);border-radius:10px;padding:1rem 1rem .25rem;}
.rev-axis{position:relative;height:20px;font-size:.68rem;color:var(--ink-3);margin-top:.4rem;}
.rev-pills{display:flex;flex-direction:column;gap:.6rem;margin-bottom:1.25rem;}
.rev-pill{display:flex;align-items:center;gap:.85rem;background:var(--bg);border-radius:10px;padding:.75rem 1rem;}
.rev-pill-icon{width:30px;height:30px;border-radius:50%;background:#ecfdf5;color:#2e7d52;display:flex;align-items:center;justify-content:center;font-size:.9rem;font-weight:700;flex-shrink:0;}
.rev-pill-avg{background:#fdf4e7;color:#b5893a;}.rev-pill-low{background:#fef2f2;color:#c0392b;}
.rev-pill-label{font-size:.7rem;color:var(--ink-3);margin-bottom:.1rem;}
.rev-pill-val{font-size:.9rem;font-weight:600;color:var(--ink);}
.rev-narrative{font-size:.82rem;color:var(--ink-3);line-height:1.7;padding:.9rem 1rem;background:var(--bg);border-radius:10px;border-left:3px solid var(--gold);}
.cp-topbar{background:#0d0c0a;padding:0 2rem;height:54px;display:flex;align-items:center;justify-content:space-between;}
.cp-logo{font-family:'Playfair Display',serif;font-size:1.1rem;color:#fff;font-weight:600;}
.cp-ghost{background:transparent;border:1px solid rgba(255,255,255,.18);color:#fff;border-radius:7px;padding:.4rem .9rem;font-size:.78rem;cursor:pointer;transition:background .15s;font-family:inherit;}
.cp-ghost:hover{background:rgba(255,255,255,.08);}
.cp-hero{background:#0d0c0a;padding:3.5rem 2rem 2.5rem;text-align:center;position:relative;}
.cp-hero::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at center top,rgba(181,137,58,.06) 0%,transparent 70%);pointer-events:none;}
.cp-av{width:76px;height:76px;border-radius:50%;background:#2a2825;border:1px solid rgba(181,137,58,.3);display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:2rem;color:var(--gold);margin:0 auto 1rem;position:relative;z-index:1;}
.cp-name{font-family:'Playfair Display',serif;font-size:2rem;color:#fff;font-weight:400;position:relative;z-index:1;}
.cp-bio{font-size:.82rem;color:rgba(255,255,255,.45);margin-top:.4rem;position:relative;z-index:1;}
.cp-stats{display:flex;justify-content:center;gap:3rem;margin-top:1.75rem;position:relative;z-index:1;}
.cp-sval{font-family:'Playfair Display',serif;font-size:1.4rem;color:#fff;}
.cp-slbl{font-size:.68rem;color:rgba(255,255,255,.35);margin-top:.15rem;letter-spacing:.05em;text-transform:uppercase;}
.cp-nav{display:flex;background:#fff;border-bottom:1px solid #e4e2dc;justify-content:center;}
.cp-tab{padding:.9rem 1.75rem;font-size:.82rem;font-weight:500;color:#7a7774;cursor:pointer;border-bottom:2px solid transparent;transition:all .15s;}
.cp-tab.active{color:#111110;border-bottom-color:#b5893a;}
.cp-body{max-width:800px;margin:0 auto;padding:2.5rem 1.5rem;background:#fff;min-height:60vh;}
.cp-stitle{font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:400;margin-bottom:1.25rem;color:#111110;}
.svc-list{display:flex;flex-direction:column;gap:.6rem;}
.svc-row{display:flex;align-items:center;gap:1rem;padding:1.1rem 1.25rem;border:1px solid #e4e2dc;border-radius:9px;cursor:pointer;transition:border-color .15s;}
.svc-row:hover{border-color:#b5893a;}
.svc-bar{width:3px;height:36px;border-radius:2px;background:#e8d9bf;flex-shrink:0;transition:background .15s;}
.svc-row:hover .svc-bar{background:#b5893a;}
.svc-info{flex:1;}
.svc-name{font-weight:500;font-size:.88rem;color:#111110;}
.svc-dur{font-size:.75rem;color:#7a7774;margin-top:.15rem;}
.svc-price{font-family:'Playfair Display',serif;font-size:1.2rem;color:#111110;}
.bk-btn{background:#111110;color:#fff;border:none;border-radius:7px;padding:.45rem .9rem;font-size:.75rem;cursor:pointer;font-family:inherit;}
.shop-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;}
.shop-card{border:1px solid #e4e2dc;border-radius:9px;overflow:hidden;cursor:pointer;transition:border-color .15s;}
.shop-card:hover{border-color:#b5893a;}
.shop-img{height:110px;background:#f7f5f0;display:flex;align-items:center;justify-content:center;font-size:.7rem;color:#7a7774;letter-spacing:.06em;text-transform:uppercase;}
.shop-body{padding:.9rem 1rem;background:#fff;}
.shop-name{font-size:.85rem;font-weight:500;color:#111110;}
.shop-price{font-family:'Playfair Display',serif;font-size:1.05rem;color:#111110;margin:.25rem 0;}
.shop-btn{width:100%;margin-top:.7rem;padding:.5rem;border:1px solid #d0cec8;border-radius:7px;background:#fff;font-size:.78rem;cursor:pointer;font-family:inherit;transition:all .15s;}
.shop-btn:hover{background:#111110;color:#fff;border-color:#111110;}
.fm-card{border:1px solid #e4e2dc;border-radius:9px;padding:1.5rem;margin-bottom:.75rem;display:flex;align-items:flex-start;gap:1.25rem;transition:border-color .15s;}
.fm-card:hover{border-color:#b5893a;}
.fm-idx{font-family:'Playfair Display',serif;font-size:2rem;color:#e4e2dc;min-width:32px;}
.fm-info{flex:1;}
.fm-name{font-weight:600;font-size:.92rem;color:#111110;margin-bottom:.2rem;}
.fm-desc{font-size:.78rem;color:#7a7774;line-height:1.5;}
.fm-tags{display:flex;gap:.75rem;margin-top:.5rem;font-size:.72rem;color:#7a7774;}
.fm-price{font-family:'Playfair Display',serif;font-size:1.3rem;color:#111110;text-align:right;flex-shrink:0;}
.cp-footer{background:#0d0c0a;padding:2rem;text-align:center;}
.cp-footer p{font-size:.75rem;color:rgba(255,255,255,.25);}
.cp-footer strong{color:rgba(255,255,255,.4);font-weight:400;}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:100;display:flex;align-items:center;justify-content:center;padding:1rem;}
.modal{background:#fff;border-radius:14px;padding:2rem;width:100%;max-width:420px;box-shadow:0 24px 64px rgba(0,0,0,.18);display:flex;flex-direction:column;gap:1rem;}
.modal-title{font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:500;color:#111110;}
.modal-sub{font-size:.8rem;color:#7a7774;}
.modal-actions{display:flex;justify-content:flex-end;gap:.6rem;padding-top:.5rem;}
.back-btn{background:var(--bg);border:1px solid var(--border);border-radius:8px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--ink-3);transition:all .15s;flex-shrink:0;}
.back-btn:hover{border-color:var(--gold);color:var(--ink);}
.settings-back-btn{display:inline-flex;align-items:center;gap:.35rem;background:none;border:none;cursor:pointer;font-size:.78rem;color:var(--ink-3);font-family:inherit;padding:0;transition:color .15s;margin-bottom:.15rem;}
.settings-back-btn:hover{color:var(--gold);}
.settings-section-row{display:flex;align-items:center;justify-content:space-between;padding:1.1rem 1.4rem;cursor:pointer;transition:background .12s;gap:1rem;}
.settings-section-row:hover{background:var(--bg);}
.settings-section-label{font-size:.88rem;font-weight:500;color:var(--ink);margin-bottom:.15rem;}
.settings-section-sub{font-size:.75rem;color:var(--ink-3);}
.lang-row{display:flex;align-items:center;justify-content:space-between;padding:.9rem 1.1rem;border-radius:10px;border:1.5px solid var(--border);cursor:pointer;transition:all .15s;}
.lang-row:hover{border-color:var(--gold);}
.lang-row.lang-active{border-color:var(--gold);background:var(--gold-lt);}
.lang-label{font-size:.88rem;font-weight:500;color:var(--ink);}
.lang-sub{font-size:.73rem;color:var(--ink-3);margin-top:.1rem;}
.lang-check-circle{width:20px;height:20px;border-radius:50%;border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s;}
.lang-check-circle.lang-check-active{background:var(--gold);border-color:var(--gold);}
.coach-slider{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:.9rem 1.2rem 1rem;margin-bottom:1rem;overflow:hidden;}
.coach-slider-label{font-size:.65rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);margin-bottom:.6rem;}
.coach-slider-body{display:flex;align-items:flex-start;gap:.7rem;min-height:38px;transition:opacity .28s ease,transform .28s ease;opacity:1;transform:translateY(0);}
.coach-slider-body.coach-fade-out{opacity:0;transform:translateY(4px);}
.coach-slider-icon{font-size:1rem;flex-shrink:0;margin-top:.05rem;line-height:1;}
.coach-slider-text{font-size:.82rem;color:var(--ink-2);line-height:1.6;}
.coach-slider-footer{display:flex;align-items:center;justify-content:space-between;margin-top:.75rem;gap:.75rem;}
.coach-slider-dots{display:flex;gap:.35rem;align-items:center;}
.coach-dot{width:5px;height:5px;border-radius:50%;background:var(--border-2);border:none;cursor:pointer;padding:0;transition:background .2s,transform .2s;}
.coach-dot:hover{background:var(--ink-3);}
.coach-dot-active{background:var(--gold)!important;transform:scale(1.3);}
.coach-progress-track{flex:1;height:2px;background:var(--border);border-radius:2px;overflow:hidden;}
.coach-progress-bar{height:100%;background:var(--gold);border-radius:2px;transition:width .08s linear;}
.cal-blocked{color:var(--red)!important;background:rgba(192,57,43,.06)!important;}
.cal-has-appt{font-weight:600;color:var(--ink);}
.cal-dot{position:absolute;bottom:1px;left:50%;transform:translateX(-50%);width:4px;height:4px;border-radius:50%;}
.cal-dot-appt{background:var(--gold);}
.cal-dot-blocked{background:var(--red);}
.avail-time{padding:.4rem .65rem;border:1px solid var(--border-2);border-radius:7px;font-size:.82rem;font-family:inherit;color:var(--ink);background:var(--surface);outline:none;transition:border .15s;}
.avail-time:focus{border-color:var(--gold);}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px;}
@media(max-width:600px){
  .topbar{padding:0 1rem;}
  .vt-btn{padding:5px 9px;font-size:.72rem;}
  .vt-label-short{display:inline;}.vt-label-full{display:none;}
  .notif-btn{display:none;}
  .main{padding:1.25rem;}
  .page-head{flex-direction:column;align-items:flex-start;gap:.75rem;}
  .grid-2{grid-template-columns:1fr;}
  .grid-3{grid-template-columns:repeat(2,1fr);}
  .tbl th,.tbl td{padding:.6rem .75rem;font-size:.75rem;}
  .stat-card{min-width:155px;}
  .next-up-banner{flex-direction:column;align-items:flex-start;gap:.75rem;overflow:hidden;}
  .next-up-name{max-width:100%!important;}
  .next-up-right{text-align:left;}
  .next-up-right{text-align:left;}
  .rev-panel{border-radius:16px 16px 0 0;padding:1.5rem 1.25rem 2.5rem;}
  .rev-total{font-size:2.2rem;}
  .shop-grid{grid-template-columns:repeat(2,1fr);}
  .head-actions{flex-wrap:wrap;}
}
`
