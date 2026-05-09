import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import AppointmentsSection from '../sections/AppointmentsSection'
import AvailabilitySection  from '../sections/AvailabilitySection'
import ClientsSection       from '../sections/ClientsSection'
import OfferingsSection     from '../sections/OfferingsSection'
import OverviewSection      from '../sections/OverviewSection'
import PortfolioSection     from '../sections/PortfolioSection'
import ProductsSection      from '../sections/ProductsSection'
import ReviewsSection       from '../sections/ReviewsSection'
import ServicesSection      from '../sections/ServicesSection'
import SettingsSection      from '../sections/SettingsSection'

const LANG = {
  en: {
    morning:'Good morning',afternoon:'Good afternoon',evening:'Good evening',
    nav_overview:'Overview',nav_appointments:'Appointments',nav_services:'Services',
    nav_products:'Products',nav_formations:'Formations',nav_clients:'Clients',
    nav_availability:'Availability',nav_settings:'Settings',nav_signout:'Sign out',
    nav_portfolio:'Portfolio',nav_reviews:'Reviews',nav_payments:'Payments',
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
    nav_portfolio:'Portfolio',nav_reviews:'Avis',nav_payments:'Paiements',
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
    nav_portfolio:'Portfolio',nav_reviews:'Reseñas',nav_payments:'Pagos',
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

// ── PERIOD TABS ───────────────────────────────────────────────────────────────
const PERIODS = ['week','month','year']
const PERIOD_LABELS = {
  en:{ week:'This Week', month:'This Month', year:'This Year' },
  fr:{ week:'Cette semaine', month:'Ce mois', year:'Cette année' },
  es:{ week:'Esta semana', month:'Este mes', year:'Este año' },
}
function startOfPeriod(period) {
  const now = new Date()
  if (period === 'week') {
    const d = new Date(now); d.setDate(now.getDate() - now.getDay()); d.setHours(0,0,0,0); return d
  }
  if (period === 'month') { return new Date(now.getFullYear(), now.getMonth(), 1) }
  return new Date(now.getFullYear(), 0, 1)
}
function filterByPeriod(arr, period, dateKey='scheduled_at') {
  const start = startOfPeriod(period)
  return arr.filter(r => new Date(r[dateKey]) >= start)
}

// FIX 1: exact date label — "aujourd'hui à 10h45" or "le 24 avril à 10h30"
function formatNextApptLabel(dateStr, lang='en') {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  // Compare local dates, not UTC — avoids "Today" showing when it's still yesterday locally
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
  card:  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3.5" width="14" height="9" rx="1.5"/><path d="M1 6.5h14"/><path d="M4 10h2M9 10h3"/></svg>,
}

function canAccess(subscription, feature) {
  const plan = subscription?.plan || 'essential'
  const feats = PLAN_FEATURES[plan] || []
  return feats.includes(feature)
}
const CLIENT_LIMIT = { free: 10, essential: 50, pro: Infinity }

function UpgradeGate({ feature }) {
  const [show, setShow] = useState(false)
  const INFO = {
    products:   { name:'Product Sales',          desc:'Sell products directly through your booking page.' },
    formations: { name:'Workshops & Formations', desc:'Create and monetize courses, workshops, and events.' },
    ai_enhance: { name:'AI Photo Enhancement',   desc:'Transform product photos into professional studio shots.' },
    clients_unlimited: { name:'Unlimited Clients', desc:'Remove the 50-client cap on your Essential plan.' },
  }
  const info = INFO[feature] || { name: feature, desc: '' }
  return (
    <>
      {show && (
        <div onClick={()=>setShow(false)} style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,.55)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'var(--bg-card)',borderRadius:'1.25rem',padding:'2.5rem 2rem',maxWidth:'400px',width:'100%',textAlign:'center',boxShadow:'0 20px 60px rgba(0,0,0,.25)',border:'1px solid rgba(189,151,97,.2)'}}>
            <div style={{fontSize:'2.5rem',marginBottom:'1rem'}}>👑</div>
            <h2 style={{fontSize:'1.3rem',fontWeight:700,color:'var(--ink)',marginBottom:'.5rem',fontFamily:"'Playfair Display',serif"}}>{info.name}</h2>
            <p style={{fontSize:'.9rem',color:'var(--ink-2)',marginBottom:'.5rem',lineHeight:1.6}}>{info.desc}</p>
            <p style={{fontSize:'.85rem',color:'var(--ink-3)',marginBottom:'2rem'}}>Available on the <strong style={{color:'var(--gold)'}}>Pro plan</strong> — $39/mo</p>
            <a href="https://www.beorganized.io/#pricing" target="_blank" rel="noopener noreferrer"
              style={{display:'block',padding:'.875rem 1.5rem',background:'var(--gold)',color:'#fff',fontWeight:600,fontSize:'.95rem',borderRadius:'.75rem',textDecoration:'none',marginBottom:'.75rem'}}>
              Upgrade to Pro →
            </a>
            <button onClick={()=>setShow(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--ink-3)',fontSize:'.875rem',padding:'.5rem'}}>Maybe later</button>
          </div>
        </div>
      )}
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'5rem 2rem',textAlign:'center',gap:'1rem'}}>
        <div style={{fontSize:'2.5rem'}}>🔒</div>
        <div style={{fontWeight:700,fontSize:'1.15rem',color:'var(--ink)',fontFamily:"'Playfair Display',serif"}}>{info.name}</div>
        <div style={{fontSize:'.9rem',color:'var(--ink-2)',maxWidth:'260px',lineHeight:1.65}}>{info.desc}</div>
        <button onClick={()=>setShow(true)} style={{background:'var(--gold)',color:'#fff',border:'none',borderRadius:'.75rem',padding:'.75rem 1.75rem',fontSize:'.9rem',fontWeight:600,cursor:'pointer',marginTop:'.5rem'}}>
          Upgrade to Pro →
        </button>
      </div>
    </>
  )
}
// ── BOOKING MODAL — public client booking form ────────────────────────────────

// ── SHADER WAVE BACKGROUND ────────────────────────────────────────────────────

// ── CLIENT PAGE ───────────────────────────────────────────────────────────────

// ── PAYMENTS ──────────────────────────────────────────────────────────────────
function Payments({ workspace, toast, lang, refetchWorkspace }) {
  const [settings, setSettings] = useState({
    payment_mode: workspace?.payment_mode || 'none',
    deposit_type: workspace?.deposit_type || 'flat',
    deposit_value: workspace?.deposit_value || 0,
  })
  const [saving, setSaving] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [loadingTx, setLoadingTx] = useState(true)

  const labels = {
    en: {
      title: 'Payments', settings_title: 'Payment Settings',
      deposit_toggle: 'Require deposit to confirm booking',
      deposit_type: 'Deposit type', flat: 'Fixed amount', pct: 'Percentage',
      deposit_amount: 'Deposit amount', deposit_pct: 'Deposit percentage',
      save: 'Save settings', saved: 'Settings saved!',
      transactions: 'Recent transactions', no_tx: 'No transactions yet.',
      no_tx_sub: 'Once clients pay deposits, they will appear here.',
      status_authorized: 'Pending capture', status_captured: 'Captured',
      status_deposit_captured: 'Deposit captured', status_cancelled: 'Cancelled',
      status_refunded: 'Refunded', status_none: 'No payment',
      connect_title: 'Connect your Stripe account',
      connect_sub: 'To accept deposits and payments, connect your Stripe account.',
      revenue_title: 'Revenue overview',
    },
    fr: {
      title: 'Paiements', settings_title: 'Paramètres de paiement',
      deposit_toggle: 'Exiger un dépôt pour confirmer la réservation',
      deposit_type: 'Type de dépôt', flat: 'Montant fixe', pct: 'Pourcentage',
      deposit_amount: 'Montant du dépôt', deposit_pct: 'Pourcentage du dépôt',
      save: 'Sauvegarder', saved: 'Paramètres sauvegardés!',
      transactions: 'Transactions récentes', no_tx: 'Aucune transaction.',
      no_tx_sub: 'Les dépôts de vos clients apparaîtront ici.',
      status_authorized: 'En attente', status_captured: 'Capturé',
      status_deposit_captured: 'Dépôt capturé', status_cancelled: 'Annulé',
      status_refunded: 'Remboursé', status_none: 'Aucun paiement',
      connect_title: 'Connectez votre compte Stripe',
      connect_sub: 'Pour accepter les dépôts, connectez votre compte Stripe.',
      revenue_title: 'Aperçu des revenus',
    },
    es: {
      title: 'Pagos', settings_title: 'Configuración de pagos',
      deposit_toggle: 'Requerir depósito para confirmar reserva',
      deposit_type: 'Tipo de depósito', flat: 'Monto fijo', pct: 'Porcentaje',
      deposit_amount: 'Monto del depósito', deposit_pct: 'Porcentaje del depósito',
      save: 'Guardar', saved: '¡Configuración guardada!',
      transactions: 'Transacciones recientes', no_tx: 'Sin transacciones.',
      no_tx_sub: 'Los depósitos de sus clientes aparecerán aquí.',
      status_authorized: 'Pendiente', status_captured: 'Capturado',
      status_deposit_captured: 'Depósito capturado', status_cancelled: 'Cancelado',
      status_refunded: 'Reembolsado', status_none: 'Sin pago',
      connect_title: 'Conecta tu cuenta de Stripe',
      connect_sub: 'Para aceptar depósitos, conecta tu cuenta de Stripe.',
      revenue_title: 'Resumen de ingresos',
    },
  }
  const l = labels[lang] || labels.en

  const [connectLoading, setConnectLoading] = useState(false)
  const [stripeOnboarded, setStripeOnboarded] = useState(workspace?.stripe_onboarded || false)

  // Vérifier si Stripe vient de compléter l'onboarding (retour depuis Stripe)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('stripe') === 'success' && workspace?.id) {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
      fetch(`${SUPABASE_URL}/functions/v1/verify-connect-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
        body: JSON.stringify({ workspace_id: workspace.id }),
      })
        .then(r => r.json())
        .then(data => {
          if (data.onboarded) {
            setStripeOnboarded(true)
            toast(lang === 'fr' ? 'Compte Stripe connecté avec succès ✓' : 'Stripe account connected successfully ✓')
            refetchWorkspace && refetchWorkspace()
          }
          // Nettoyer l'URL
          window.history.replaceState({}, '', '/dashboard')
        })
        .catch(() => {})
    }
  }, [workspace?.id])

  async function handleConnectStripe() {
    if (!workspace?.id) return
    setConnectLoading(true)
    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
      const res = await fetch(`${SUPABASE_URL}/functions/v1/create-connect-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
        body: JSON.stringify({ workspace_id: workspace.id }),
      })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url // Redirige vers Stripe
    } catch (err) {
      toast(lang === 'fr' ? 'Erreur de connexion Stripe. Réessayez.' : 'Stripe connection error. Please try again.')
    } finally {
      setConnectLoading(false)
    }
  }

  useEffect(() => {
    if (!workspace?.id) return
    setLoadingTx(true)
    supabase
      .from('payments')
      .select('*')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => { setTransactions(data || []); setLoadingTx(false) })
  }, [workspace?.id])

  async function saveSettings() {
    if (!workspace?.id) return

    // Validation avant save — le owner doit savoir que Stripe exige un minimum de 0.50$
    if (settings.payment_mode === 'deposit') {
      const val = parseFloat(settings.deposit_value) || 0
      if (settings.deposit_type === 'flat' && val < 0.50) {
        toast(lang === 'fr'
          ? 'Montant minimum requis par Stripe : 0,50 $. Veuillez augmenter le dépôt.'
          : 'Stripe requires a minimum deposit of $0.50. Please increase the amount.')
        return
      }
      if (settings.deposit_type === 'percentage' && val <= 0) {
        toast(lang === 'fr'
          ? 'Le pourcentage de dépôt doit être supérieur à 0.'
          : 'Deposit percentage must be greater than 0.')
        return
      }
    }

    setSaving(true)
    const { error } = await supabase
      .from('workspaces')
      .update({
        payment_mode: settings.payment_mode,
        deposit_type: settings.deposit_type,
        deposit_value: parseFloat(settings.deposit_value) || 0,
      })
      .eq('id', workspace.id)
    setSaving(false)
    if (error) { toast('Error saving settings.'); return }
    toast(l.saved)
    refetchWorkspace && refetchWorkspace()
  }

  function statusBadge(status) {
    const map = {
      authorized:       { label: l.status_authorized,       color: '#b45309', bg: '#fef3c7' },
      captured:         { label: l.status_captured,          color: '#065f46', bg: '#d1fae5' },
      deposit_captured: { label: l.status_deposit_captured,  color: '#1e40af', bg: '#dbeafe' },
      cancelled:        { label: l.status_cancelled,         color: '#991b1b', bg: '#fee2e2' },
      refunded:         { label: l.status_refunded,          color: '#6b21a8', bg: '#f3e8ff' },
      none:             { label: l.status_none,              color: '#6b7280', bg: '#f3f4f6' },
      pending:          { label: l.status_authorized,        color: '#b45309', bg: '#fef3c7' },
    }
    const s = map[status] || map.none
    return (
      <span style={{ fontSize: '.72rem', fontWeight: 600, padding: '2px 9px', borderRadius: 99,
        color: s.color, background: s.bg, letterSpacing: '.02em' }}>
        {s.label}
      </span>
    )
  }

  const totalCaptured = transactions
    .filter(tx => ['captured','deposit_captured'].includes(tx.status))
    .reduce((sum, tx) => sum + (tx.amount || 0), 0)

  const totalPending = transactions
    .filter(tx => tx.status === 'authorized' || tx.status === 'pending')
    .reduce((sum, tx) => sum + (tx.amount || 0), 0)

  const depositOn = settings.payment_mode === 'deposit'

  return (
    <div style={{ padding: '1.5rem 1rem', maxWidth: 680, margin: '0 auto' }}>

      {/* ── HEADER ── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.6rem',
          color: 'var(--ink)', margin: 0 }}>{l.title}</h1>
      </div>

      {/* ── STRIPE CONNECT STATUS ── */}
      {!stripeOnboarded ? (
        /* ── NOT CONNECTED — Full CTA ── */
        <div style={{
          background:'var(--surface)', border:'1px solid var(--border)',
          borderRadius:16, padding:'2rem 1.5rem', marginBottom:'1.25rem', textAlign:'center',
        }}>
          <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>💳</div>
          <div style={{ fontWeight:800, fontSize:'1.1rem', color:'var(--ink)',
            fontFamily:"'Playfair Display',serif", marginBottom:'.5rem' }}>
            {lang==='fr' ? 'Configurez votre compte de paiement' : 'Set up your payment account'}
          </div>
          <div style={{ fontSize:'.85rem', color:'var(--ink-3)', lineHeight:1.7,
            marginBottom:'1.5rem', maxWidth:340, margin:'0 auto 1.5rem' }}>
            {lang==='fr'
              ? 'Connectez Stripe pour accepter les dépôts de rendez-vous, les paiements de services, les achats de produits et les inscriptions à vos formations — directement dans votre compte bancaire.'
              : 'Connect Stripe to accept appointment deposits, service payments, product purchases, and course enrollments — directly into your bank account.'}
          </div>
          {/* Bullets */}
          <div style={{ display:'flex', flexDirection:'column', gap:'.5rem',
            marginBottom:'1.75rem', textAlign:'left', maxWidth:280, margin:'0 auto 1.75rem' }}>
            {(lang==='fr' ? [
              '✓ Dépôts de rendez-vous',
              '✓ Paiements de services complets',
              '✓ Achats de produits',
              '✓ Inscriptions formations & workshops',
            ] : [
              '✓ Appointment deposits',
              '✓ Full service payments',
              '✓ Product purchases',
              '✓ Course & workshop enrollments',
            ]).map((item,i) => (
              <div key={i} style={{ fontSize:'.82rem', color:'var(--ink-2)',
                display:'flex', alignItems:'center', gap:'.5rem' }}>
                <span style={{ color:'var(--gold)', fontWeight:700 }}>{item.split(' ')[0]}</span>
                <span>{item.split(' ').slice(1).join(' ')}</span>
              </div>
            ))}
          </div>
          <button onClick={handleConnectStripe} disabled={connectLoading} style={{
            padding:'.8rem 2rem', background:'var(--gold)', color:'#fff',
            border:'none', borderRadius:12, fontWeight:800, fontSize:'.92rem',
            cursor:connectLoading?'not-allowed':'pointer', opacity:connectLoading?.7:1,
            letterSpacing:'.02em',
          }}>
            {connectLoading ? '...' : (lang==='fr' ? 'Configurer Stripe →' : 'Set up Stripe →')}
          </button>
          <div style={{ fontSize:'.72rem', color:'var(--ink-3)', marginTop:'.85rem' }}>
            {lang==='fr'
              ? 'Sécurisé par Stripe · Prend environ 10 minutes'
              : 'Secured by Stripe · Takes about 10 minutes'}
          </div>
        </div>
      ) : (
        /* ── CONNECTED — Show manage button subtle ── */
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          background:'rgba(5,150,105,.06)', border:'1px solid rgba(5,150,105,.2)',
          borderRadius:12, padding:'.85rem 1.1rem', marginBottom:'1.25rem',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:'.6rem' }}>
            <span>✅</span>
            <div>
              <div style={{ fontWeight:700, fontSize:'.85rem', color:'var(--ink)' }}>
                {lang==='fr' ? 'Stripe connecté' : 'Stripe connected'}
              </div>
              <div style={{ fontSize:'.75rem', color:'var(--ink-3)' }}>
                {lang==='fr' ? 'Dépôts et paiements actifs' : 'Deposits & payments active'}
              </div>
            </div>
          </div>
          <button onClick={handleConnectStripe} disabled={connectLoading} style={{
            padding:'.4rem .85rem', background:'transparent',
            border:'1px solid var(--border)', borderRadius:8,
            color:'var(--ink-3)', fontSize:'.75rem', fontWeight:600,
            cursor:'pointer',
          }}>
            {connectLoading ? '...' : (lang==='fr' ? 'Gérer' : 'Manage')}
          </button>
        </div>
      )}

      {/* ── TOUT LE RESTE : visible seulement après connexion Stripe ── */}
      {stripeOnboarded && (<>

      {/* ── REVENUE OVERVIEW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: lang==='fr'?'Revenus capturés':lang==='es'?'Ingresos capturados':'Captured revenue',
            value: `$${totalCaptured.toFixed(2)}`, color: 'var(--gold)' },
          { label: lang==='fr'?'En attente de capture':lang==='es'?'Pendiente de captura':'Pending capture',
            value: `$${totalPending.toFixed(2)}`, color: '#6b7280' },
        ].map((stat, i) => (
          <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '.75rem', color: 'var(--ink-3)', marginBottom: '.35rem' }}>{stat.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: stat.color,
              fontFamily: "'Playfair Display',serif" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* ── DEPOSIT SETTINGS ── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 16, padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ fontWeight: 700, fontSize: '.95rem', color: 'var(--ink)',
          marginBottom: '1rem' }}>{l.settings_title}</div>

        {/* Toggle dépôt */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: depositOn ? '1rem' : 0 }}>
          <span style={{ fontSize: '.88rem', color: 'var(--ink-2)' }}>{l.deposit_toggle}</span>
          <button
            onClick={() => setSettings(s => ({ ...s,
              payment_mode: s.payment_mode === 'deposit' ? 'none' : 'deposit' }))}
            style={{
              width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer',
              background: depositOn ? 'var(--gold)' : 'var(--border)',
              position: 'relative', transition: 'background .2s', flexShrink: 0,
            }}>
            <span style={{
              position: 'absolute', top: 3, left: depositOn ? 23 : 3,
              width: 18, height: 18, borderRadius: '50%', background: '#fff',
              transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
            }}/>
          </button>
        </div>

        {/* Options visibles seulement si dépôt activé */}
        {depositOn && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem',
            display: 'flex', flexDirection: 'column', gap: '.85rem' }}>

            {/* Type flat vs percentage */}
            <div>
              <div style={{ fontSize: '.78rem', color: 'var(--ink-3)', marginBottom: '.4rem',
                fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                {l.deposit_type}
              </div>
              <div style={{ display: 'flex', gap: '.5rem' }}>
                {[['flat', l.flat], ['percentage', l.pct]].map(([val, label]) => (
                  <button key={val}
                    onClick={() => setSettings(s => ({ ...s, deposit_type: val }))}
                    style={{
                      flex: 1, padding: '.5rem', borderRadius: 10, border: '1.5px solid',
                      borderColor: settings.deposit_type === val ? 'var(--gold)' : 'var(--border)',
                      background: settings.deposit_type === val ? 'rgba(var(--gold-rgb),.08)' : 'transparent',
                      color: settings.deposit_type === val ? 'var(--gold)' : 'var(--ink-3)',
                      fontWeight: 600, fontSize: '.82rem', cursor: 'pointer', transition: 'all .15s',
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Montant */}
            <div>
              <div style={{ fontSize: '.78rem', color: 'var(--ink-3)', marginBottom: '.4rem',
                fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                {settings.deposit_type === 'flat' ? l.deposit_amount : l.deposit_pct}
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: 12, color: 'var(--ink-3)',
                  fontSize: '.9rem', fontWeight: 600, pointerEvents: 'none' }}>
                  {settings.deposit_type === 'flat' ? '$' : '%'}
                </span>
                <input
                  type="number"
                  min="0"
                  max={settings.deposit_type === 'percentage' ? 100 : undefined}
                  value={settings.deposit_value}
                  onChange={e => setSettings(s => ({ ...s, deposit_value: e.target.value }))}
                  style={{
                    width: '100%', padding: '.6rem .75rem .6rem 2rem',
                    border: '1.5px solid var(--border)', borderRadius: 10,
                    background: 'var(--bg)', color: 'var(--ink)',
                    fontSize: '.9rem', fontWeight: 600, outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <button
          onClick={saveSettings}
          disabled={saving}
          style={{
            marginTop: '1rem', width: '100%', padding: '.65rem',
            background: 'var(--gold)', color: '#fff', border: 'none',
            borderRadius: 10, fontWeight: 700, fontSize: '.88rem',
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? .7 : 1,
            transition: 'opacity .15s',
          }}>
          {saving ? '...' : l.save}
        </button>
      </div>

      {/* ── HISTORIQUE TRANSACTIONS ── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 16, padding: '1.25rem' }}>
        <div style={{ fontWeight: 700, fontSize: '.95rem', color: 'var(--ink)',
          marginBottom: '1rem' }}>{l.transactions}</div>

        {loadingTx ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ink-3)',
            fontSize: '.85rem' }}>Loading…</div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>💳</div>
            <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '.9rem' }}>{l.no_tx}</div>
            <div style={{ color: 'var(--ink-3)', fontSize: '.82rem', marginTop: '.25rem' }}>{l.no_tx_sub}</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
            {transactions.map(tx => (
              <div key={tx.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '.75rem', borderRadius: 10, background: 'var(--bg)',
                border: '1px solid var(--border)',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '.88rem', color: 'var(--ink)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {tx.client_name || 'Client'}
                  </div>
                  <div style={{ fontSize: '.75rem', color: 'var(--ink-3)', marginTop: 2 }}>
                    {tx.description || '—'} · {new Date(tx.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexShrink: 0 }}>
                  {statusBadge(tx.status)}
                  <span style={{ fontWeight: 700, fontSize: '.95rem', color: 'var(--ink)',
                    fontFamily: "'Playfair Display',serif" }}>
                    ${(tx.amount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </>)}
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
    if (ws?.beta_suspended === true) {
      window.location.replace('/suspended')
      return
    }
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
    {key:'payments',label:'nav_payments',icon:I.card},
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

  function renderPage(){
    const props={workspace,toast,lang,session,ownerData,refetchWorkspace:fetchWorkspace,refetch:fetchWorkspace,theme,setTheme,setPage:navigateTo,subscription}
    switch(page){
      case 'overview':     return <OverviewSection {...props}/>
      case 'appointments': return <AppointmentsSection {...props}/>
      case 'services':     return <ServicesSection {...props}/>
      case 'products':     return canAccess(subscription,'products') ? <ProductsSection {...props}/> : <UpgradeGate feature="products"/>
      case 'formations':   return canAccess(subscription,'formations') ? <OfferingsSection {...props}/> : <UpgradeGate feature="formations"/>
      case 'clients':      return <ClientsSection {...props}/>
      case 'payments':     return <Payments {...props}/>
      case 'portfolio':    return <PortfolioSection {...props}/>
      case 'reviews':      return <ReviewsSection {...props}/>
      case 'availability': return <AvailabilitySection {...props}/>
      case 'settings':     return <SettingsSection {...props}/>
      default:             return <OverviewSection {...props}/>
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
            <a
              href={`${window.location.origin}/${workspace.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{display:'block',marginBottom:'.65rem',padding:'.75rem .9rem',background:'var(--gold-lt)',border:'1px solid var(--gold-dim)',borderRadius:12,cursor:'pointer',textDecoration:'none'}}
              onClick={(e)=>e.stopPropagation()}>
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
              <div style={{fontSize:'.62rem',color:'var(--ink-3)',marginTop:4}}>Your public page — tap to open</div>
            </a>
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
