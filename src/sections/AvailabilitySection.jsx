import { useState } from 'react'
import { useWorkspaceContext } from '../contexts/WorkspaceContext'
import { useToast } from '../contexts/ToastContext'
import { useAvailability } from '../hooks/useAvailability'
import {
  toggleAvailabilityDay,
  updateAvailabilityTime,
  insertBlockedDate,
  deleteBlockedDate,
} from '../api/availability'

const LANG = {
  en: { avail_title: 'Availability', avail_sub: 'Set your schedule and block dates', open: 'Open', closed: 'Closed' },
  fr: { avail_title: 'Disponibilités', avail_sub: 'Définissez votre agenda et bloquez des dates', open: 'Ouvert', closed: 'Fermé' },
  es: { avail_title: 'Disponibilidad', avail_sub: 'Define tu horario y bloquea fechas', open: 'Abierto', closed: 'Cerrado' },
}
function t(lang, key) { return (LANG[lang] || LANG.en)[key] || key }

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function AvailabilitySection({ lang = 'en' }) {
  const { workspace } = useWorkspaceContext()
  const toast = useToast()
  const { schedule, setSchedule, blockedDates, loading, refresh } = useAvailability(workspace?.id)
  const [blockInput, setBlockInput] = useState({ date: '', reason: '' })

  async function toggleDay(id, cur) {
    setSchedule(prev => prev.map(d => d.id === id ? { ...d, is_open: !cur } : d))
    const { error } = await toggleAvailabilityDay(id, cur)
    if (error) {
      setSchedule(prev => prev.map(d => d.id === id ? { ...d, is_open: cur } : d))
      toast('Error updating schedule.')
    } else {
      const dayName = DAY_NAMES[schedule.find(d => d.id === id)?.day_of_week ?? 0]
      toast(`${dayName} marked as ${!cur ? 'Open' : 'Closed'}.`)
    }
  }

  async function updateTime(id, field, val) {
    const prev = schedule.find(d => d.id === id)?.[field]
    setSchedule(s => s.map(d => d.id === id ? { ...d, [field]: val } : d))
    const { error } = await updateAvailabilityTime(id, field, val)
    if (error) {
      setSchedule(s => s.map(d => d.id === id ? { ...d, [field]: prev } : d))
      toast('Could not save time — please try again.')
    }
  }

  async function addBlock(e) {
    e.preventDefault()
    if (!blockInput.date) return
    const { error } = await insertBlockedDate(workspace.id, blockInput.date, blockInput.reason)
    if (error) { toast('Could not block date — please try again.'); return }
    toast('Date blocked.')
    setBlockInput({ date: '', reason: '' })
    refresh()
  }

  async function removeBlock(id) {
    const { error } = await deleteBlockedDate(id)
    if (error) { toast('Could not unblock date — please try again.'); return }
    toast('Date unblocked.')
    refresh()
  }

  if (loading) return <div style={{ padding: '2rem', color: 'var(--ink-3)' }}>Loading...</div>

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">{t(lang, 'avail_title')}</div>
          <div className="page-sub">{t(lang, 'avail_sub')}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-head"><div className="card-title">Weekly schedule</div></div>
        <div style={{ padding: '0 1.4rem' }}>
          {schedule.map(day => (
            <div key={day.id} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.9rem 0', borderBottom: '1px solid var(--border)', flexWrap: 'nowrap' }}>
              <div style={{ width: 90, fontWeight: 500, fontSize: '.85rem', color: 'var(--ink)', flexShrink: 0 }}>
                {DAY_NAMES[day.day_of_week]}
              </div>
              <button
                onClick={() => toggleDay(day.id, day.is_open)}
                style={{
                  minWidth: 80, padding: '.38rem .9rem', borderRadius: 20, border: '2px solid',
                  fontSize: '.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all .18s', flexShrink: 0, letterSpacing: '.02em',
                  borderColor: day.is_open ? '#1a1814' : 'var(--border-2)',
                  background: day.is_open ? '#1a1814' : 'transparent',
                  color: day.is_open ? '#fff' : 'var(--ink-3)',
                  boxShadow: day.is_open ? '0 2px 8px rgba(0,0,0,.15)' : 'none',
                }}>
                {day.is_open ? t(lang, 'open') : t(lang, 'closed')}
              </button>
              {day.is_open && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', flex: 1, minWidth: 0 }}>
                  <input type="time" value={day.open_time?.slice(0, 5) || '09:00'} className="avail-time"
                    onChange={e => updateTime(day.id, 'open_time', e.target.value)}
                    style={{ minWidth: 0, flex: 1 }} />
                  <span style={{ color: 'var(--ink-3)', fontSize: '.75rem', flexShrink: 0 }}>–</span>
                  <input type="time" value={day.close_time?.slice(0, 5) || '18:00'} className="avail-time"
                    onChange={e => updateTime(day.id, 'close_time', e.target.value)}
                    style={{ minWidth: 0, flex: 1 }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-head"><div className="card-title">Blocked dates</div></div>
        <form onSubmit={addBlock} style={{ padding: '1.1rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '.65rem', borderBottom: '1px solid var(--border)' }}>
          <div className="field">
            <label>Date</label>
            <input type="date" value={blockInput.date}
              onChange={e => setBlockInput(f => ({ ...f, date: e.target.value }))} required />
          </div>
          <div className="field">
            <label>Reason (optional)</label>
            <input value={blockInput.reason}
              onChange={e => setBlockInput(f => ({ ...f, reason: e.target.value }))}
              placeholder="Vacation, training..." />
          </div>
          <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', padding: '.65rem' }}>
            Block date
          </button>
        </form>
        {blockedDates.length === 0
          ? <div className="empty-state"><div className="empty-title" style={{ fontSize: '.85rem' }}>No blocked dates</div></div>
          : blockedDates.map(b => (
            <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.85rem 1.4rem', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: '.85rem', color: 'var(--ink)' }}>
                  {new Date(b.blocked_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                {b.reason && <div style={{ fontSize: '.75rem', color: 'var(--ink-3)', marginTop: 2 }}>{b.reason}</div>}
              </div>
              <button className="btn btn-xs"
                style={{ color: 'var(--red)', border: '1px solid rgba(192,57,43,.2)', background: 'var(--surface)' }}
                onClick={() => removeBlock(b.id)}>
                Unblock
              </button>
            </div>
          ))
        }
      </div>
    </div>
  )
}
