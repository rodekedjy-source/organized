import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAppointments } from '../hooks/useAppointments'
import { useWorkspaceContext } from '../contexts/WorkspaceContext'
import { useToast } from '../contexts/ToastContext'
import { rescheduleAppointment, updateAppointmentStatus } from '../api/appointments'
import { formatCurrency } from '../lib/formatters'

// ── I18N ──────────────────────────────────────────────────────────────────────
const LANG = {
  en: {
    appts_title: 'Appointments', appts_sub: 'Manage your bookings',
    pending_confirm: 'Pending confirmation', waiting: 'waiting',
    all_appts: 'All appointments', no_appts: 'No appointments yet',
    when_book: "When clients book, they'll appear here.",
  },
  fr: {
    appts_title: 'Rendez-vous', appts_sub: 'Gérez vos réservations',
    pending_confirm: 'En attente de confirmation', waiting: 'en attente',
    all_appts: 'Tous les rendez-vous', no_appts: 'Aucun rendez-vous',
    when_book: 'Les rendez-vous apparaissent ici.',
  },
  es: {
    appts_title: 'Citas', appts_sub: 'Gestiona tus reservas',
    pending_confirm: 'Pendiente de confirmación', waiting: 'pendiente',
    all_appts: 'Todas las citas', no_appts: 'Sin citas aún',
    when_book: 'Las citas aparecen aquí cuando los clientes reservan.',
  },
}
function t(lang, key) { return (LANG[lang] || LANG.en)[key] || key }

// ── LOCAL HELPERS ─────────────────────────────────────────────────────────────
function svcName(a) { return a.services?.name || a.service_name || '—' }

function useScrollLock() {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])
}

const PERIODS = ['week', 'month', 'year']
const PERIOD_LABELS = {
  en: { week: 'This Week', month: 'This Month', year: 'This Year' },
  fr: { week: 'Cette semaine', month: 'Ce mois', year: 'Cette année' },
  es: { week: 'Esta semana', month: 'Este mes', year: 'Este año' },
}

function startOfPeriod(period) {
  const now = new Date()
  if (period === 'week') {
    const d = new Date(now); d.setDate(now.getDate() - now.getDay()); d.setHours(0, 0, 0, 0); return d
  }
  if (period === 'month') return new Date(now.getFullYear(), now.getMonth(), 1)
  return new Date(now.getFullYear(), 0, 1)
}

function filterByPeriod(arr, period, dateKey = 'scheduled_at') {
  const start = startOfPeriod(period)
  return arr.filter(r => new Date(r[dateKey]) >= start)
}

const calIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="1" y="3" width="14" height="12" rx="1.5"/><path d="M1 7h14M5 1v4M11 1v4"/>
  </svg>
)

// ── PERIOD TABS ───────────────────────────────────────────────────────────────
function PeriodTabs({ period, setPeriod, lang = 'en' }) {
  const labels = PERIOD_LABELS[lang] || PERIOD_LABELS.en
  return (
    <div style={{ display: 'flex', gap: '.35rem', marginBottom: '1.25rem' }}>
      {PERIODS.map(p => (
        <button key={p} onClick={() => setPeriod(p)} style={{
          padding: '.35rem .85rem', borderRadius: 99, border: '1.5px solid',
          borderColor: period === p ? 'var(--gold)' : 'var(--border)',
          background: period === p ? 'rgba(var(--gold-rgb),.1)' : 'transparent',
          color: period === p ? 'var(--gold)' : 'var(--ink-3)',
          fontSize: '.75rem', fontWeight: 700, cursor: 'pointer',
          letterSpacing: '.03em', transition: 'all .15s',
        }}>
          {labels[p]}
        </button>
      ))}
    </div>
  )
}

// ── RESCHEDULE MODAL ──────────────────────────────────────────────────────────
function RescheduleModal({ appt, onClose, onSaved, toast }) {
  useScrollLock()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [day, setDay] = useState(null)
  const [time, setTime] = useState('09:00')
  const [saving, setSaving] = useState(false)
  const firstDOW = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthLabel = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1); setDay(null) }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1); setDay(null) }

  async function save() {
    if (!day || !time) return toast('Pick a date and time first.')
    const [h, m] = time.split(':')
    const dt = new Date(year, month, day, parseInt(h), parseInt(m))
    if (dt <= new Date()) return toast('Please choose a future date and time.')
    setSaving(true)
    const { error } = await rescheduleAppointment(appt.id, dt.toISOString())
    setSaving(false)
    if (error) { toast('Error rescheduling.'); return }
    toast(`Rescheduled to ${dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${time}`)
    onSaved(); onClose()
  }

  const cells = []
  for (let i = 0; i < firstDOW; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '1.75rem', width: '100%', maxWidth: 360, boxShadow: '0 24px 64px rgba(0,0,0,.2)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.2rem', color: 'var(--ink)' }}>Reschedule</div>
            <div style={{ fontSize: '.78rem', color: 'var(--ink-3)', marginTop: 2 }}>{appt.client_name} · {svcName(appt)}</div>
          </div>
          <button style={{ background: 'var(--bg)', border: 'none', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', color: 'var(--ink-3)', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>×</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.75rem' }}>
          <button className="cal-nav-btn" onClick={prevMonth}>&#8249;</button>
          <span style={{ fontSize: '.84rem', fontWeight: 600, color: 'var(--ink)' }}>{monthLabel}</span>
          <button className="cal-nav-btn" onClick={nextMonth}>&#8250;</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: '1rem' }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: '.62rem', fontWeight: 600, color: 'var(--ink-3)', padding: '3px 0' }}>{d}</div>
          ))}
          {cells.map((d, i) => {
            const isPast = d && new Date(year, month, d) < new Date(new Date().setHours(0, 0, 0, 0))
            const isSelected = d === day
            return (
              <div key={i} onClick={() => d && !isPast && setDay(d)} style={{
                textAlign: 'center', fontSize: '.78rem', padding: '6px 2px', borderRadius: 6,
                cursor: d && !isPast ? 'pointer' : 'default',
                background: isSelected ? 'var(--ink)' : 'transparent',
                color: isSelected ? '#fff' : isPast ? 'var(--border-2)' : d ? 'var(--ink)' : 'transparent',
                fontWeight: isSelected ? 600 : 400, transition: 'background .12s',
              }}>{d || ''}</div>
            )
          })}
        </div>
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '.76rem', fontWeight: 500, color: 'var(--ink-3)', marginBottom: '.4rem' }}>TIME</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)}
            style={{ width: '100%', padding: '.6rem .9rem', border: '1px solid var(--border-2)', borderRadius: 8, fontSize: '.88rem', fontFamily: 'inherit', color: 'var(--ink)', background: 'var(--surface)', outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: '.6rem' }}>
          <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={save} disabled={saving || !day}>{saving ? 'Saving…' : 'Confirm'}</button>
        </div>
      </div>
    </div>
  )
}

// ── MESSAGE MODAL ─────────────────────────────────────────────────────────────
function MessageModal({ appt, onClose, workspace }) {
  useScrollLock()
  const phone = appt.client_phone || ''
  const email = appt.client_email || ''
  const name = appt.client_name || 'there'
  const biz = workspace?.name || 'your stylist'
  const apptDate = new Date(appt.scheduled_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const apptTime = new Date(appt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const defaultSMS = `Hi ${name}, this is ${biz}. Reminder: your appointment is on ${apptDate} at ${apptTime}. See you soon!`
  const defaultEmail = `Hi ${name},\n\nA reminder from ${biz} about your upcoming appointment on ${apptDate} at ${apptTime}.\n\nSee you soon!\n\n— ${biz}`
  const [smsBody, setSmsBody] = useState(defaultSMS)
  const [emailBody, setEmailBody] = useState(defaultEmail)

  function openSMS() { window.open(`sms:${phone.replace(/\s/g, '')}?body=${encodeURIComponent(smsBody)}`) }
  function openEmail() { window.open(`mailto:${email}?subject=${encodeURIComponent(`Reminder — ${biz}`)}&body=${encodeURIComponent(emailBody)}`) }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '1.75rem', width: '100%', maxWidth: 400, boxShadow: '0 24px 64px rgba(0,0,0,.2)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.2rem', color: 'var(--ink)' }}>Message client</div>
            <div style={{ fontSize: '.78rem', color: 'var(--ink-3)', marginTop: 2 }}>{name}</div>
          </div>
          <button style={{ background: 'var(--bg)', border: 'none', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', color: 'var(--ink-3)', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>×</button>
        </div>
        {phone ? (
          <div style={{ marginBottom: '1.25rem', padding: '1rem', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.65rem' }}>
              <div>
                <div style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.05em' }}>SMS</div>
                <div style={{ fontSize: '.85rem', fontWeight: 500, color: 'var(--ink)', marginTop: 2 }}>{phone}</div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={openSMS}>Open SMS →</button>
            </div>
            <textarea value={smsBody} onChange={e => setSmsBody(e.target.value)} rows={3}
              style={{ width: '100%', padding: '.55rem .75rem', border: '1px solid var(--border-2)', borderRadius: 7, fontSize: '.78rem', fontFamily: 'inherit', color: 'var(--ink)', background: 'var(--surface)', resize: 'vertical', outline: 'none', lineHeight: 1.5 }} />
          </div>
        ) : (
          <div style={{ marginBottom: '1.25rem', padding: '1rem', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)', fontSize: '.82rem', color: 'var(--ink-3)' }}>No phone number on file.</div>
        )}
        {email ? (
          <div style={{ padding: '1rem', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.65rem' }}>
              <div>
                <div style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Email</div>
                <div style={{ fontSize: '.85rem', fontWeight: 500, color: 'var(--ink)', marginTop: 2 }}>{email}</div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={openEmail}>Open Mail →</button>
            </div>
            <textarea value={emailBody} onChange={e => setEmailBody(e.target.value)} rows={4}
              style={{ width: '100%', padding: '.55rem .75rem', border: '1px solid var(--border-2)', borderRadius: 7, fontSize: '.78rem', fontFamily: 'inherit', color: 'var(--ink)', background: 'var(--surface)', resize: 'vertical', outline: 'none', lineHeight: 1.5 }} />
          </div>
        ) : (
          <div style={{ padding: '1rem', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)', fontSize: '.82rem', color: 'var(--ink-3)' }}>No email address on file.</div>
        )}
        <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }} onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

// ── APPOINTMENTS SECTION ──────────────────────────────────────────────────────
export default function AppointmentsSection({ lang = 'en' }) {
  const { workspace } = useWorkspaceContext()
  const toast = useToast()
  const { data, loading, refresh } = useAppointments(workspace?.id)
  const [period, setPeriod] = useState('month')

  // Realtime subscription + polling — calls hook's refresh instead of direct fetch
  useEffect(() => {
    if (!workspace) return
    const ch = supabase.channel('appts-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `workspace_id=eq.${workspace.id}` }, refresh)
      .subscribe()
    const poll = setInterval(refresh, 8000)
    return () => { supabase.removeChannel(ch); clearInterval(poll) }
  }, [workspace, refresh])

  async function confirm(id) {
    const appt = data.find(a => a.id === id)
    await updateAppointmentStatus(id, 'confirmed')
    if (appt?.stripe_payment_intent_id && appt?.payment_status === 'authorized') {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
      await fetch(`${SUPABASE_URL}/functions/v1/capture-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
        body: JSON.stringify({ payment_intent_id: appt.stripe_payment_intent_id, appointment_id: id }),
      })
    }
    toast('Confirmed.')
    refresh()
  }

  async function decline(id) {
    const appt = data.find(a => a.id === id)
    await updateAppointmentStatus(id, 'cancelled')
    if (appt?.stripe_payment_intent_id && appt?.payment_status === 'authorized') {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
      await fetch(`${SUPABASE_URL}/functions/v1/cancel-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
        body: JSON.stringify({ payment_intent_id: appt.stripe_payment_intent_id, appointment_id: id }),
      })
    }
    toast('Declined.')
    refresh()
  }

  // Sort descending client-side (hook fetches unordered)
  const sorted = [...data].sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at))
  const pending = sorted.filter(a => a.status === 'pending')
  const periodData = filterByPeriod(sorted.filter(a => a.status !== 'pending'), period)
  const confirmed = periodData.filter(a => a.status === 'confirmed')
  const cancelled = periodData.filter(a => a.status === 'cancelled')
  const revenue = confirmed.reduce((s, a) => s + Number(a.amount || 0), 0)

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">{t(lang, 'appts_title')}</div>
          <div className="page-sub">{t(lang, 'appts_sub')}</div>
        </div>
      </div>

      <PeriodTabs period={period} setPeriod={setPeriod} lang={lang} />

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '.6rem', marginBottom: '1.25rem' }}>
        {[
          { label: lang === 'fr' ? 'Revenus' : 'Revenue', value: formatCurrency(revenue), color: 'var(--gold)' },
          { label: lang === 'fr' ? 'Confirmés' : 'Confirmed', value: confirmed.length, color: 'var(--ink)' },
          { label: lang === 'fr' ? 'Annulés' : 'Cancelled', value: cancelled.length, color: 'var(--ink-3)' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '.75rem .85rem' }}>
            <div style={{ fontSize: '.68rem', color: 'var(--ink-3)', marginBottom: '.2rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>{s.label}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: s.color, fontFamily: "'Playfair Display',serif" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Pending confirmations */}
      {pending.length > 0 && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="card-head">
            <div className="card-title">{t(lang, 'pending_confirm')}</div>
            <span className="badge badge-pending">{pending.length} {t(lang, 'waiting')}</span>
          </div>
          {pending.map(a => (
            <div key={a.id} style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.65rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '.88rem', color: 'var(--ink)' }}>{a.client_name}</div>
                  <div style={{ fontSize: '.73rem', color: 'var(--ink-3)', marginTop: 3 }}>
                    {svcName(a)} · {new Date(a.scheduled_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })} · {new Date(a.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '1rem', color: 'var(--ink)', flexShrink: 0, marginLeft: '.5rem' }}>
                  {formatCurrency(a.amount)}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => confirm(a.id)}>✓ Confirm</button>
                <button className="btn btn-sm" style={{ flex: 1, justifyContent: 'center', color: '#c0392b', border: '1px solid #fecaca', background: 'var(--surface)' }} onClick={() => decline(a.id)}>✕ Decline</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All appointments */}
      <div className="card">
        <div className="card-head">
          <div className="card-title">{t(lang, 'all_appts')}</div>
        </div>
        {loading
          ? <div style={{ padding: '2rem', color: 'var(--ink-3)' }}>Loading...</div>
          : periodData.length === 0 && pending.length === 0
            ? (
              <div className="empty-state">
                <div className="empty-icon">{calIcon}</div>
                <div className="empty-title">{t(lang, 'no_appts')}</div>
                <div className="empty-sub">{t(lang, 'when_book')}</div>
              </div>
            )
            : periodData.map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '.88rem', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.client_name}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--ink-3)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {svcName(a)} · {new Date(a.scheduled_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })} · {new Date(a.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexShrink: 0, marginLeft: '.75rem' }}>
                  <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '.9rem', color: 'var(--ink)' }}>{formatCurrency(a.amount)}</span>
                  <span className={`badge badge-${a.status}`}>{a.status}</span>
                </div>
              </div>
            ))
        }
      </div>
    </div>
  )
}
