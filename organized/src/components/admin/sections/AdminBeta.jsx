import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { SectionHead, CenterSpinner, Pill, timeAgo } from '../AdminShared'

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const EDGE_API = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-metrics`

const STATUS_CFG = {
  invited:   { label: 'Invited',   color: '#60a5fa', pill: 'blue' },
  onboarded: { label: 'Onboarded', color: '#facc15', pill: 'yellow' },
  active:    { label: 'Active',    color: '#4ade80', pill: 'green' },
  silent:    { label: 'Silent',    color: '#fb923c', pill: 'orange' },
  churned:   { label: 'Churned',   color: '#f87171', pill: 'red' },
}

const GOAL = 15

async function getToken() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

async function edgeHeaders() {
  const token = await getToken()
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
  }
}

export default function AdminBeta() {
  const [testers, setTesters] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', instagram: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState(null)
  const [editNotes, setEditNotes] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      const res = await fetch(EDGE_API, { headers: await edgeHeaders() })
      if (res.ok) {
        const d = await res.json()
        setTesters(d.beta_testers || [])
      }
    } catch {}
    setLoading(false)
  }

  async function handleAdd() {
    if (!form.name.trim()) return
    setSaving(true)
    const res = await fetch(EDGE_API, {
      method: 'POST', headers: await edgeHeaders(), body: JSON.stringify(form),
    })
    if (res.ok) {
      const t = await res.json()
      setTesters(prev => [...prev, t])
    }
    setForm({ name: '', email: '', instagram: '', notes: '' })
    setShowForm(false)
    setSaving(false)
  }

  async function handleStatusChange(id, status) {
    const res = await fetch(EDGE_API, {
      method: 'PATCH', headers: await edgeHeaders(), body: JSON.stringify({ id, status }),
    })
    if (res.ok) {
      const updated = await res.json()
      setTesters(prev => prev.map(t => t.id === id ? updated : t))
    }
  }

  async function handleNotesSave(id) {
    const res = await fetch(EDGE_API, {
      method: 'PATCH', headers: await edgeHeaders(), body: JSON.stringify({ id, notes: editNotes }),
    })
    if (res.ok) {
      const updated = await res.json()
      setTesters(prev => prev.map(t => t.id === id ? updated : t))
    }
    setEditId(null)
  }

  async function handleDelete(id) {
    await fetch(EDGE_API, {
      method: 'DELETE', headers: await edgeHeaders(), body: JSON.stringify({ id }),
    })
    setTesters(prev => prev.filter(t => t.id !== id))
  }

  if (loading) return <CenterSpinner />

  const counts = Object.fromEntries(
    Object.keys(STATUS_CFG).map(k => [k, testers.filter(t => t.status === k).length])
  )

  return (
    <div>
      <SectionHead tag="Community" title="Beta Testers" sub={`${testers.length} / ${GOAL} goal`} />

      {/* Progress */}
      <div className="x-beta-progress">
        <div className="x-beta-bar">
          <div className="x-beta-fill" style={{ width: `${Math.min((testers.length / GOAL) * 100, 100)}%` }} />
        </div>
        <span className="x-beta-bar-text">{testers.length} / {GOAL} beta testers</span>
      </div>

      {/* Stats */}
      <div className="x-beta-stats">
        {Object.entries(STATUS_CFG).map(([key, cfg]) => counts[key] ? (
          <div key={key} className="x-beta-stat">
            <div className="x-beta-stat-dot" style={{ background: cfg.color }} />
            <span className="x-beta-stat-lbl">{counts[key]} {cfg.label}</span>
          </div>
        ) : null)}
      </div>

      {/* Add button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: '.4rem',
            fontSize: '.72rem', fontWeight: 500, color: '#b5893a',
            background: 'rgba(181,137,58,.1)', border: '1px solid rgba(181,137,58,.2)',
            padding: '.35rem .85rem', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Tester
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="x-form" style={{ marginBottom: '1.2rem' }}>
          <div className="x-form-title">New Beta Tester</div>
          <div className="x-form-row">
            <input className="x-input" placeholder="Full name *" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <input className="x-input" placeholder="Email" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="x-form-row">
            <input className="x-input" placeholder="@instagram" value={form.instagram}
              onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} />
            <input className="x-input" placeholder="Notes (optional)" value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="x-form-btns">
            <button className="x-btn" onClick={handleAdd} disabled={saving || !form.name.trim()}>
              {saving ? 'Adding…' : 'Add Tester'}
            </button>
            <button className="x-btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Grid */}
      {testers.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '3rem',
          color: 'rgba(240,236,228,.12)', fontSize: '.8rem',
          border: '1px dashed rgba(255,255,255,.06)', borderRadius: 10,
        }}>
          No beta testers yet — add your first one above
        </div>
      ) : (
        <div className="x-beta-grid">
          {testers.map(t => (
            <div key={t.id} className="x-beta-card">
              <div className="x-beta-top">
                <div className="x-beta-info">
                  <div className="x-beta-name">{t.name}</div>
                  <div className="x-beta-contact">
                    {t.email && <span>{t.email}</span>}
                    {t.email && t.instagram && <span style={{ margin: '0 .3rem', opacity: .3 }}>·</span>}
                    {t.instagram && (
                      <span style={{ color: 'rgba(181,137,58,.6)' }}>
                        {t.instagram.startsWith('@') ? t.instagram : `@${t.instagram}`}
                      </span>
                    )}
                  </div>
                </div>
                <div className="x-beta-actions">
                  <button className="x-icon-btn" onClick={() => { setEditId(t.id); setEditNotes(t.notes || '') }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button className="x-icon-btn danger" onClick={() => handleDelete(t.id)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              </div>

              {editId === t.id ? (
                <div style={{ display: 'flex', gap: '.5rem' }}>
                  <input
                    className="x-input"
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    placeholder="Add notes…"
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleNotesSave(t.id)
                      if (e.key === 'Escape') setEditId(null)
                    }}
                  />
                  <button className="x-btn" style={{ padding: '.3rem .7rem', fontSize: '.7rem' }}
                    onClick={() => handleNotesSave(t.id)}>Save</button>
                  <button className="x-btn-outline" style={{ padding: '.3rem .6rem', fontSize: '.7rem' }}
                    onClick={() => setEditId(null)}>✕</button>
                </div>
              ) : t.notes ? (
                <div className="x-beta-notes">"{t.notes}"</div>
              ) : null}

              <div className="x-beta-footer">
                <select
                  className={`x-pill x-pill-${STATUS_CFG[t.status]?.pill || 'blue'} x-beta-status-select`}
                  value={t.status}
                  onChange={e => handleStatusChange(t.id, e.target.value)}
                  style={{ color: STATUS_CFG[t.status]?.color || '#60a5fa' }}
                >
                  {Object.entries(STATUS_CFG).map(([val, cfg]) => (
                    <option key={val} value={val}>{cfg.label}</option>
                  ))}
                </select>
                <span style={{ fontSize: '.62rem', color: 'rgba(240,236,228,.15)' }}>
                  Added {timeAgo(t.invited_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
