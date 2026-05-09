import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-font-smoothing: antialiased; }

  .adm { font-family: 'DM Sans', sans-serif; background: #0f0e0c; min-height: 100vh; color: #f0ece4; }

  /* NAV */
  .adm-nav {
    height: 58px; display: flex; align-items: center; justify-content: space-between;
    padding: 0 2rem; border-bottom: 1px solid rgba(255,255,255,.07);
    position: sticky; top: 0; z-index: 50;
    background: rgba(15,14,12,.96); backdrop-filter: blur(16px);
  }
  .adm-nav-l { display: flex; align-items: center; gap: .6rem; }
  .adm-logo { font-family: 'Playfair Display', serif; font-size: 1.1rem; letter-spacing: -.01em; }
  .adm-logo span { color: #b5893a; }
  .adm-badge { font-size: .57rem; font-weight: 500; letter-spacing: .1em; text-transform: uppercase; background: rgba(181,137,58,.12); border: 1px solid rgba(181,137,58,.22); color: #b5893a; padding: .18rem .5rem; border-radius: 20px; }
  .adm-nav-r { display: flex; align-items: center; gap: 1rem; }
  .adm-btn-ghost { font-size: .7rem; color: rgba(240,236,228,.28); cursor: pointer; background: none; border: none; font-family: inherit; transition: color .2s; letter-spacing: .04em; text-transform: uppercase; display: flex; align-items: center; gap: .35rem; }
  .adm-btn-ghost:hover { color: rgba(240,236,228,.6); }
  .adm-btn-ghost svg { width: 13px; height: 13px; }
  .adm-btn-ghost.spin svg { animation: adm-spin .7s linear infinite; }

  /* BODY */
  .adm-body { max-width: 1100px; margin: 0 auto; padding: 2.5rem 2rem 6rem; }
  .adm-head { margin-bottom: 2.5rem; }
  .adm-head-tag { font-size: .63rem; letter-spacing: .12em; text-transform: uppercase; color: #b5893a; font-weight: 500; margin-bottom: .5rem; }
  .adm-head h1 { font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 500; letter-spacing: -.02em; }
  .adm-head-sub { font-size: .77rem; color: rgba(240,236,228,.22); margin-top: .35rem; font-weight: 300; }

  /* METRICS GRID */
  .adm-metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 1px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.06); border-radius: 12px; overflow: hidden; margin-bottom: 2rem; }
  .adm-metric { background: #161512; padding: 1.4rem 1.3rem; position: relative; }
  .adm-metric-dot { position: absolute; top: 1.1rem; right: 1.1rem; width: 5px; height: 5px; background: #b5893a; border-radius: 50%; opacity: .4; }
  .adm-metric-lbl { font-size: .62rem; letter-spacing: .08em; text-transform: uppercase; color: rgba(240,236,228,.27); font-weight: 500; margin-bottom: .55rem; }
  .adm-metric-val { font-size: 1.85rem; font-weight: 300; line-height: 1; letter-spacing: -.03em; font-family: 'Playfair Display', serif; }
  .adm-metric-val.g { color: #b5893a; }
  .adm-metric-sub { font-size: .62rem; color: rgba(240,236,228,.17); margin-top: .4rem; font-weight: 300; }

  /* TWO COL */
  .adm-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }

  /* CARD */
  .adm-card { background: #161512; border: 1px solid rgba(255,255,255,.06); border-radius: 10px; overflow: hidden; }
  .adm-card-head { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.2rem; border-bottom: 1px solid rgba(255,255,255,.05); }
  .adm-card-title { font-size: .64rem; letter-spacing: .1em; text-transform: uppercase; color: rgba(240,236,228,.33); font-weight: 500; }
  .adm-card-count { font-size: .62rem; color: rgba(240,236,228,.17); }

  /* TABLE */
  table { width: 100%; border-collapse: collapse; }
  th { font-size: .59rem; letter-spacing: .07em; text-transform: uppercase; color: rgba(240,236,228,.2); font-weight: 500; padding: .55rem 1.2rem; text-align: left; border-bottom: 1px solid rgba(255,255,255,.04); }
  td { font-size: .75rem; color: rgba(240,236,228,.58); padding: .6rem 1.2rem; border-bottom: 1px solid rgba(255,255,255,.03); font-weight: 300; vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(255,255,255,.015); }
  td strong { color: #f0ece4; font-weight: 400; }
  .adm-empty { text-align: center; color: rgba(240,236,228,.14); padding: 2rem; font-size: .74rem; }

  /* PILLS */
  .pill { display: inline-flex; align-items: center; font-size: .57rem; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; padding: .18rem .48rem; border-radius: 20px; white-space: nowrap; }
  .pill-captured { background: rgba(74,222,128,.1); color: #4ade80; border: 1px solid rgba(74,222,128,.18); }
  .pill-hold { background: rgba(96,165,250,.1); color: #60a5fa; border: 1px solid rgba(96,165,250,.18); }
  .pill-pending { background: rgba(250,204,21,.1); color: #facc15; border: 1px solid rgba(250,204,21,.18); }
  .pill-none { background: rgba(255,255,255,.04); color: rgba(240,236,228,.22); border: 1px solid rgba(255,255,255,.06); }
  .pill-super { background: rgba(181,137,58,.12); color: #b5893a; border: 1px solid rgba(181,137,58,.2); }
  .pill-co { background: rgba(167,139,250,.1); color: #a78bfa; border: 1px solid rgba(167,139,250,.18); }
  .pill-team { background: rgba(255,255,255,.05); color: rgba(240,236,228,.3); border: 1px solid rgba(255,255,255,.07); }

  /* BETA STATUS PILLS */
  .pill-invited   { background: rgba(96,165,250,.1);  color: #60a5fa; border: 1px solid rgba(96,165,250,.2); }
  .pill-onboarded { background: rgba(250,204,21,.1);  color: #facc15; border: 1px solid rgba(250,204,21,.2); }
  .pill-active    { background: rgba(74,222,128,.1);  color: #4ade80; border: 1px solid rgba(74,222,128,.2); }
  .pill-silent    { background: rgba(251,146,60,.1);  color: #fb923c; border: 1px solid rgba(251,146,60,.2); }
  .pill-churned   { background: rgba(248,113,113,.1); color: #f87171; border: 1px solid rgba(248,113,113,.2); }

  /* BETA TRACKER SECTION */
  .beta-section { margin-bottom: 2rem; }
  .beta-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; padding-bottom: .75rem; border-bottom: 1px solid rgba(255,255,255,.06); }
  .beta-title-wrap { display: flex; align-items: center; gap: .75rem; }
  .beta-section-title { font-size: .64rem; letter-spacing: .1em; text-transform: uppercase; color: rgba(240,236,228,.33); font-weight: 500; }
  .beta-add-btn { display: flex; align-items: center; gap: .4rem; font-size: .72rem; font-weight: 500; color: #b5893a; background: rgba(181,137,58,.1); border: 1px solid rgba(181,137,58,.2); padding: .35rem .85rem; border-radius: 6px; cursor: pointer; font-family: inherit; transition: all .2s; }
  .beta-add-btn:hover { background: rgba(181,137,58,.18); }

  /* PROGRESS BAR */
  .beta-progress { display: flex; align-items: center; gap: .75rem; }
  .beta-progress-bar { flex: 1; height: 3px; background: rgba(255,255,255,.06); border-radius: 2px; overflow: hidden; }
  .beta-progress-fill { height: 100%; background: #b5893a; border-radius: 2px; transition: width .4s ease; }
  .beta-progress-text { font-size: .65rem; color: rgba(240,236,228,.25); white-space: nowrap; }

  /* BETA GRID */
  .beta-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.06); border-radius: 10px; overflow: hidden; }
  .beta-card { background: #161512; padding: 1.1rem 1.2rem; display: flex; flex-direction: column; gap: .6rem; transition: background .15s; }
  .beta-card:hover { background: #1a1916; }
  .beta-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: .5rem; }
  .beta-card-info { flex: 1; min-width: 0; }
  .beta-card-name { font-size: .88rem; font-weight: 400; color: #f0ece4; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .beta-card-contact { font-size: .72rem; color: rgba(240,236,228,.3); font-weight: 300; margin-top: .2rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .beta-card-actions { display: flex; align-items: center; gap: .35rem; flex-shrink: 0; }
  .beta-card-notes { font-size: .72rem; color: rgba(240,236,228,.28); font-weight: 300; font-style: italic; line-height: 1.5; }
  .beta-card-footer { display: flex; align-items: center; justify-content: space-between; gap: .5rem; }

  /* STATUS SELECT */
  .beta-status-select { font-size: .6rem; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; background: none; border: none; cursor: pointer; font-family: inherit; padding: 0; outline: none; appearance: none; }
  .beta-status-select option { background: #1a1916; color: #f0ece4; text-transform: uppercase; font-size: .75rem; }

  /* ICON BTNS */
  .icon-btn { background: none; border: none; cursor: pointer; color: rgba(240,236,228,.2); transition: color .15s; padding: .2rem; display: flex; align-items: center; }
  .icon-btn:hover { color: rgba(240,236,228,.6); }
  .icon-btn.danger:hover { color: #f87171; }
  .icon-btn svg { width: 14px; height: 14px; }

  /* ADD FORM */
  .beta-form { background: #1a1916; border: 1px solid rgba(181,137,58,.2); border-radius: 10px; padding: 1.3rem; margin-bottom: 1.2rem; display: flex; flex-direction: column; gap: .85rem; }
  .beta-form-title { font-size: .7rem; letter-spacing: .08em; text-transform: uppercase; color: #b5893a; font-weight: 500; }
  .beta-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
  .beta-input { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 6px; padding: .55rem .8rem; font-size: .8rem; color: #f0ece4; font-family: inherit; font-weight: 300; outline: none; transition: border-color .2s; width: 100%; }
  .beta-input:focus { border-color: rgba(181,137,58,.4); }
  .beta-input::placeholder { color: rgba(240,236,228,.2); }
  .beta-form-btns { display: flex; gap: .6rem; }
  .beta-submit { background: #b5893a; color: #0f0e0c; border: none; border-radius: 6px; padding: .5rem 1.1rem; font-size: .78rem; font-weight: 500; cursor: pointer; font-family: inherit; transition: background .2s; }
  .beta-submit:hover { background: #c49a45; }
  .beta-submit:disabled { opacity: .5; cursor: not-allowed; }
  .beta-cancel { background: none; border: 1px solid rgba(255,255,255,.08); color: rgba(240,236,228,.4); border-radius: 6px; padding: .5rem 1rem; font-size: .78rem; cursor: pointer; font-family: inherit; transition: all .2s; }
  .beta-cancel:hover { border-color: rgba(255,255,255,.15); color: rgba(240,236,228,.7); }

  /* EDIT INLINE */
  .beta-edit-input { background: rgba(255,255,255,.05); border: 1px solid rgba(181,137,58,.3); border-radius: 4px; padding: .3rem .5rem; font-size: .8rem; color: #f0ece4; font-family: inherit; outline: none; width: 100%; }

  /* LOADING */
  .adm-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 65vh; gap: 1rem; }
  .adm-spinner { width: 26px; height: 26px; border: 2px solid rgba(181,137,58,.18); border-top-color: #b5893a; border-radius: 50%; animation: adm-spin .8s linear infinite; }
  .adm-loading-text { font-size: .74rem; color: rgba(240,236,228,.2); font-weight: 300; letter-spacing: .04em; }

  @keyframes adm-spin { to { transform: rotate(360deg); } }

  .adm-updated { text-align: center; font-size: .61rem; color: rgba(240,236,228,.11); margin-top: 2.5rem; letter-spacing: .04em; }

  /* STATS ROW */
  .beta-stats { display: flex; gap: 1.5rem; flex-wrap: wrap; }
  .beta-stat { display: flex; align-items: center; gap: .4rem; }
  .beta-stat-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .beta-stat-label { font-size: .65rem; color: rgba(240,236,228,.25); }

  @media(max-width: 720px) {
    .adm-2col { grid-template-columns: 1fr; }
    .adm-metrics { grid-template-columns: repeat(2, 1fr); }
    .beta-form-row { grid-template-columns: 1fr; }
    .beta-grid { grid-template-columns: 1fr; }
  }
`

const API = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-metrics`

const STATUS_CONFIG = {
  invited:   { label: 'Invited',   color: '#60a5fa', cls: 'invited' },
  onboarded: { label: 'Onboarded', color: '#facc15', cls: 'onboarded' },
  active:    { label: 'Active',    color: '#4ade80', cls: 'active' },
  silent:    { label: 'Silent',    color: '#fb923c', cls: 'silent' },
  churned:   { label: 'Churned',   color: '#f87171', cls: 'churned' },
}

const fmt = n => (n == null ? '—' : Number(n).toLocaleString())
const fmtMoney = n => (!n ? '$0' : new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(n))
const timeAgo = ts => {
  if (!ts) return '—'
  const m = Math.floor((Date.now() - new Date(ts)) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function PaymentPill({ status }) {
  const map = { captured: 'captured', authorized: 'hold', pending: 'pending' }
  return <span className={`pill pill-${map[status] || 'none'}`}>{status || 'none'}</span>
}

function RolePill({ role }) {
  const map = { super_admin: ['super', 'Founder'], co_founder: ['co', 'Co-Founder'], team: ['team', 'Team'] }
  const [cls, label] = map[role] || ['team', role]
  return <span className={`pill pill-${cls}`}>{label}</span>
}

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.invited
  return <span className={`pill pill-${cfg.cls}`}>{cfg.label}</span>
}

// ── Beta Tracker ──────────────────────────────────────────────
function BetaTracker({ testers, onAdd, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', instagram: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState(null)
  const [editNotes, setEditNotes] = useState('')

  const GOAL = 15
  const active = testers.filter(t => t.status === 'active').length
  const onboarded = testers.filter(t => t.status === 'onboarded').length
  const silent = testers.filter(t => t.status === 'silent').length
  const churned = testers.filter(t => t.status === 'churned').length
  const invited = testers.filter(t => t.status === 'invited').length

  async function handleAdd() {
    if (!form.name.trim()) return
    setSaving(true)
    await onAdd(form)
    setForm({ name: '', email: '', instagram: '', notes: '' })
    setShowForm(false)
    setSaving(false)
  }

  async function handleStatusChange(id, status) {
    await onUpdate(id, { status })
  }

  async function handleNotesSave(id) {
    await onUpdate(id, { notes: editNotes })
    setEditId(null)
  }

  return (
    <div className="beta-section">
      <div className="beta-header">
        <div className="beta-title-wrap">
          <span className="beta-section-title">Beta Testers</span>
          <div className="beta-stats">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const count = testers.filter(t => t.status === key).length
              if (!count) return null
              return (
                <div key={key} className="beta-stat">
                  <div className="beta-stat-dot" style={{ background: cfg.color }}/>
                  <span className="beta-stat-label">{count} {cfg.label}</span>
                </div>
              )
            })}
          </div>
        </div>
        <button className="beta-add-btn" onClick={() => setShowForm(v => !v)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Add Tester
        </button>
      </div>

      {/* Progress toward goal */}
      <div style={{ marginBottom: '1.2rem' }}>
        <div className="beta-progress">
          <div className="beta-progress-bar">
            <div className="beta-progress-fill" style={{ width: `${Math.min((testers.length / GOAL) * 100, 100)}%` }}/>
          </div>
          <span className="beta-progress-text">{testers.length} / {GOAL} beta testers</span>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="beta-form">
          <div className="beta-form-title">New Beta Tester</div>
          <div className="beta-form-row">
            <input
              className="beta-input"
              placeholder="Full name *"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
            <input
              className="beta-input"
              placeholder="Email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div className="beta-form-row">
            <input
              className="beta-input"
              placeholder="@instagram"
              value={form.instagram}
              onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))}
            />
            <input
              className="beta-input"
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>
          <div className="beta-form-btns">
            <button className="beta-submit" onClick={handleAdd} disabled={saving || !form.name.trim()}>
              {saving ? 'Adding...' : 'Add Tester'}
            </button>
            <button className="beta-cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Grid */}
      {testers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(240,236,228,.12)', fontSize: '.8rem', border: '1px dashed rgba(255,255,255,.06)', borderRadius: '10px' }}>
          No beta testers yet — add your first one
        </div>
      ) : (
        <div className="beta-grid">
          {testers.map(t => (
            <div key={t.id} className="beta-card">
              <div className="beta-card-top">
                <div className="beta-card-info">
                  <div className="beta-card-name">{t.name}</div>
                  <div className="beta-card-contact">
                    {t.email && <span>{t.email}</span>}
                    {t.email && t.instagram && <span style={{ margin: '0 .3rem', opacity: .3 }}>·</span>}
                    {t.instagram && <span style={{ color: 'rgba(181,137,58,.6)' }}>{t.instagram.startsWith('@') ? t.instagram : `@${t.instagram}`}</span>}
                  </div>
                </div>
                <div className="beta-card-actions">
                  <button className="icon-btn" onClick={() => { setEditId(t.id); setEditNotes(t.notes || '') }} title="Edit notes">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button className="icon-btn danger" onClick={() => onDelete(t.id)} title="Remove">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14H6L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Notes edit */}
              {editId === t.id ? (
                <div style={{ display: 'flex', gap: '.5rem' }}>
                  <input
                    className="beta-edit-input"
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    placeholder="Add notes..."
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Enter') handleNotesSave(t.id); if (e.key === 'Escape') setEditId(null); }}
                  />
                  <button className="beta-submit" style={{ padding: '.3rem .7rem', fontSize: '.7rem' }} onClick={() => handleNotesSave(t.id)}>Save</button>
                  <button className="beta-cancel" style={{ padding: '.3rem .6rem', fontSize: '.7rem' }} onClick={() => setEditId(null)}>✕</button>
                </div>
              ) : t.notes ? (
                <div className="beta-card-notes">"{t.notes}"</div>
              ) : null}

              <div className="beta-card-footer">
                {/* Status dropdown styled as pill */}
                <select
                  className={`pill pill-${STATUS_CONFIG[t.status]?.cls || 'invited'} beta-status-select`}
                  value={t.status}
                  onChange={e => handleStatusChange(t.id, e.target.value)}
                  style={{ color: STATUS_CONFIG[t.status]?.color || '#60a5fa' }}
                >
                  {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
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

// ── Main Component ────────────────────────────────────────────
export default function AdminPanel() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token
  }

  const headers = async () => ({
    'Authorization': `Bearer ${await getToken()}`,
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
  })

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const res = await fetch(API, { headers: await headers() })
      if (res.status === 401 || res.status === 403) { navigate('/dashboard', { replace: true }); return }
      if (!res.ok) throw new Error()
      setData(await res.json())
    } catch {
      navigate('/dashboard', { replace: true })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [navigate])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => {
    const id = setInterval(() => fetchData(true), 60000)
    return () => clearInterval(id)
  }, [fetchData])

  // Beta tester mutations
  async function addTester(form) {
    const res = await fetch(API, { method: 'POST', headers: await headers(), body: JSON.stringify(form) })
    if (res.ok) {
      const newTester = await res.json()
      setData(d => ({ ...d, beta_testers: [...(d.beta_testers || []), newTester] }))
    }
  }

  async function updateTester(id, updates) {
    const res = await fetch(API, { method: 'PATCH', headers: await headers(), body: JSON.stringify({ id, ...updates }) })
    if (res.ok) {
      const updated = await res.json()
      setData(d => ({ ...d, beta_testers: d.beta_testers.map(t => t.id === id ? updated : t) }))
    }
  }

  async function deleteTester(id) {
    await fetch(API, { method: 'DELETE', headers: await headers(), body: JSON.stringify({ id }) })
    setData(d => ({ ...d, beta_testers: d.beta_testers.filter(t => t.id !== id) }))
  }

  return (
    <>
      <style>{css}</style>
      <div className="adm">

        {/* NAV */}
        <nav className="adm-nav">
          <div className="adm-nav-l">
            <div className="adm-logo">Organized<span>.</span></div>
            <span className="adm-badge">Founder Console</span>
          </div>
          <div className="adm-nav-r">
            {!loading && data && (
              <button className={`adm-btn-ghost${refreshing ? ' spin' : ''}`} onClick={() => fetchData(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                  <path d="M21 3v5h-5"/>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                  <path d="M8 16H3v5"/>
                </svg>
                Refresh
              </button>
            )}
            <button className="adm-btn-ghost" onClick={() => navigate('/dashboard')}>← Dashboard</button>
          </div>
        </nav>

        <div className="adm-body">

          {loading && (
            <div className="adm-loading">
              <div className="adm-spinner"/>
              <div className="adm-loading-text">Loading...</div>
            </div>
          )}

          {!loading && data && (() => {
            const m = data.metrics || {}
            const proRate = m.total_workspaces > 0 ? Math.round((m.pro_subscribers / m.total_workspaces) * 100) : 0

            return (
              <>
                <div className="adm-head">
                  <div className="adm-head-tag">Founder Console</div>
                  <h1>Platform Overview</h1>
                  <div className="adm-head-sub">Auto-refreshes every 60s · {m.computed_at ? new Date(m.computed_at).toLocaleTimeString() : '—'}</div>
                </div>

                {/* METRICS */}
                <div className="adm-metrics">
                  {[
                    { label: 'Workspaces',    val: fmt(m.total_workspaces),     sub: `+${fmt(m.new_workspaces_7d)} this week` },
                    { label: 'Total Users',   val: fmt(m.total_users),          sub: 'Registered accounts' },
                    { label: 'Pro Subscribers', val: fmt(m.pro_subscribers),    sub: `${proRate}% conversion`, gold: true },
                    { label: 'Active Subs',   val: fmt(m.active_subscriptions), sub: 'Active or trialing' },
                    { label: 'Bookings Today', val: fmt(m.bookings_today),      sub: `${fmt(m.bookings_last_7d)} this week` },
                    { label: 'Bookings 30d',  val: fmt(m.bookings_last_30d),    sub: 'Last 30 days' },
                    { label: 'Revenue 30d',   val: fmtMoney(m.revenue_last_30d), sub: 'Captured deposits', gold: true },
                    { label: 'Revenue Total', val: fmtMoney(m.revenue_total),   sub: 'All time', gold: true },
                  ].map((item, i) => (
                    <div key={i} className="adm-metric">
                      <div className="adm-metric-dot"/>
                      <div className="adm-metric-lbl">{item.label}</div>
                      <div className={`adm-metric-val${item.gold ? ' g' : ''}`}>{item.val}</div>
                      <div className="adm-metric-sub">{item.sub}</div>
                    </div>
                  ))}
                </div>

                {/* TWO COL TABLES */}
                <div className="adm-2col">
                  <div className="adm-card">
                    <div className="adm-card-head">
                      <span className="adm-card-title">Recent Workspaces</span>
                      <span className="adm-card-count">{(data.recent_workspaces || []).length} shown</span>
                    </div>
                    <table>
                      <thead><tr><th>Name</th><th>Handle</th><th>Joined</th></tr></thead>
                      <tbody>
                        {(data.recent_workspaces || []).map(w => (
                          <tr key={w.id}>
                            <td><strong>{w.name || '—'}</strong></td>
                            <td style={{ color: 'rgba(181,137,58,.6)', fontFamily: 'monospace', fontSize: '.7rem' }}>{w.handle || '—'}</td>
                            <td>{timeAgo(w.created_at)}</td>
                          </tr>
                        ))}
                        {!(data.recent_workspaces || []).length && <tr><td colSpan={3} className="adm-empty">No workspaces yet</td></tr>}
                      </tbody>
                    </table>
                  </div>

                  <div className="adm-card">
                    <div className="adm-card-head">
                      <span className="adm-card-title">Recent Bookings</span>
                      <span className="adm-card-count">{(data.recent_bookings || []).length} shown</span>
                    </div>
                    <table>
                      <thead><tr><th>Client</th><th>Deposit</th><th>Status</th><th>When</th></tr></thead>
                      <tbody>
                        {(data.recent_bookings || []).map(b => (
                          <tr key={b.id}>
                            <td><strong>{b.client_name || '—'}</strong></td>
                            <td style={{ color: b.deposit_amount ? '#b5893a' : 'rgba(240,236,228,.2)' }}>{b.deposit_amount ? fmtMoney(b.deposit_amount) : '—'}</td>
                            <td><PaymentPill status={b.payment_status}/></td>
                            <td>{timeAgo(b.created_at)}</td>
                          </tr>
                        ))}
                        {!(data.recent_bookings || []).length && <tr><td colSpan={4} className="adm-empty">No bookings yet</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* BETA TRACKER */}
                <BetaTracker
                  testers={data.beta_testers || []}
                  onAdd={addTester}
                  onUpdate={updateTester}
                  onDelete={deleteTester}
                />

                {/* CONSOLE ACCESS */}
                <div className="adm-card" style={{ marginBottom: '2rem' }}>
                  <div className="adm-card-head">
                    <span className="adm-card-title">Console Access</span>
                    <span className="adm-card-count">{(data.admin_users || []).length} members</span>
                  </div>
                  <table>
                    <thead><tr><th>Name</th><th>Role</th><th>Since</th></tr></thead>
                    <tbody>
                      {(data.admin_users || []).map(u => (
                        <tr key={u.user_id}>
                          <td><strong>{u.name || '—'}</strong></td>
                          <td><RolePill role={u.role}/></td>
                          <td>{timeAgo(u.created_at)}</td>
                        </tr>
                      ))}
                      {!(data.admin_users || []).length && <tr><td colSpan={3} className="adm-empty">No team members</td></tr>}
                    </tbody>
                  </table>
                </div>

                <div className="adm-updated">
                  beorganized.io/x · Founder Console · Not linked anywhere in the UI
                </div>
              </>
            )
          })()}
        </div>
      </div>
    </>
  )
}
