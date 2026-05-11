import { useState, useEffect, useRef } from 'react'
import { useClients } from '../hooks/useClients'
import { useWorkspaceContext } from '../contexts/WorkspaceContext'
import { useToast } from '../contexts/ToastContext'
import { fetchAppointmentsByClient } from '../api/appointments'
import { updateClientTag } from '../api/clients'
import { formatCurrency } from '../lib/formatters'
import { supabase } from '../lib/supabase'

// ── I18N ──────────────────────────────────────────────────────────────────────
const LANG = {
  en: { clients_title: 'Clients', clients_appear: "When clients book, they'll appear here." },
  fr: { clients_title: 'Clients', clients_appear: 'Les clients apparaissent ici après leur première réservation.' },
  es: { clients_title: 'Clientes', clients_appear: 'Los clientes aparecen aquí después de su primera reserva.' },
}
function t(lang, key) { return (LANG[lang] || LANG.en)[key] || key }

// ── PLAN GATING ───────────────────────────────────────────────────────────────
const PLAN_FEATURES = {
  free: [], essential: [],
  pro: ['products', 'formations', 'analytics_full', 'ai_enhance', 'custom_branding', 'clients_unlimited'],
}
function canAccess(subscription, feature) {
  const plan = subscription?.plan || 'essential'
  return (PLAN_FEATURES[plan] || []).includes(feature)
}
const CLIENT_LIMIT = { free: 10, essential: 50, pro: Infinity }

// ── LOCAL HELPERS ─────────────────────────────────────────────────────────────
function useScrollLock() {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])
}

const PERIODS = ['all', 'month', 'year']
const PERIOD_LABELS = {
  en: { all: 'All', week: 'This Week', month: 'This Month', year: 'This Year' },
  fr: { all: 'Tous', week: 'Cette semaine', month: 'Ce mois', year: 'Cette année' },
  es: { all: 'Todos', week: 'Esta semana', month: 'Este mes', year: 'Este año' },
}
function startOfPeriod(period) {
  if (period === 'all') return new Date(0)
  const now = new Date()
  if (period === 'week') { return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
  if (period === 'month') return new Date(now.getFullYear(), now.getMonth(), 1)
  return new Date(now.getFullYear(), 0, 1)
}
function filterByPeriod(arr, period, dateKey = 'scheduled_at') {
  if (period === 'all') return arr
  const start = startOfPeriod(period)
  return arr.filter(r => new Date(r[dateKey]) >= start)
}

const usersIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="6" cy="5" r="2.5"/><path d="M1 13c0-2.5 2-4 5-4s5 1.5 5 4"/>
    <circle cx="12" cy="5" r="2"/><path d="M14 13c0-1.5-1-3-3-3"/>
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
        }}>{labels[p]}</button>
      ))}
    </div>
  )
}

// ── CLIENT LIMIT BANNER ───────────────────────────────────────────────────────
function ClientLimitBanner({ clientCount, subscription }) {
  const [dismissed, setDismissed] = useState(false)
  if (canAccess(subscription, 'clients_unlimited') || dismissed) return null
  const plan = subscription?.plan || 'essential'
  const limit = CLIENT_LIMIT[plan] || 50
  if ((clientCount / limit) < 0.8) return null
  const atLimit = clientCount >= limit
  return (
    <div style={{ background: atLimit ? 'rgba(220,53,69,.08)' : 'rgba(189,151,97,.08)', border: `1px solid ${atLimit ? 'rgba(220,53,69,.25)' : 'rgba(189,151,97,.25)'}`, borderRadius: '.875rem', padding: '.875rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
      <p style={{ margin: 0, fontSize: '.875rem', color: 'var(--ink)', flex: 1 }}>
        {atLimit ? `You've reached your ${limit}-client limit.` : `${clientCount} of ${limit} active clients used.`}
        {' '}Upgrade to Pro for unlimited clients.
      </p>
      <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
        <a href="https://www.beorganized.io/#pricing" target="_blank" rel="noopener noreferrer" style={{ background: 'var(--gold)', color: '#fff', borderRadius: '.5rem', padding: '.45rem .9rem', fontSize: '.8rem', fontWeight: 600, textDecoration: 'none' }}>Upgrade</a>
        {!atLimit && <button onClick={() => setDismissed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', fontSize: '1.2rem', lineHeight: 1, padding: '0 .25rem' }}>×</button>}
      </div>
    </div>
  )
}

// ── CLIENT HISTORY PANEL ──────────────────────────────────────────────────────
function ClientHistoryPanel({ client, workspace, onClose }) {
  useScrollLock()
  const [appts, setAppts] = useState([])
  const [loading, setLoading] = useState(true)
  const [tag, setTag] = useState(client.tag || '')
  const [savingTag, setSavingTag] = useState(false)

  useEffect(() => {
    fetchAppointmentsByClient(workspace.id, client.full_name)
      .then(({ data }) => { setAppts(data || []); setLoading(false) })
  }, [client.id])

  async function saveTag(newTag) {
    setSavingTag(true)
    await updateClientTag(client.id, newTag)
    setTag(newTag); setSavingTag(false)
  }

  const initial = client.full_name?.charAt(0)?.toUpperCase() || '?'
  const tags = [{ v: '', label: 'None' }, { v: 'new', label: 'New' }, { v: 'regular', label: 'Regular' }, { v: 'vip', label: 'VIP' }]

  return (
    <div className="rev-overlay" onClick={onClose}>
      <div className="rev-panel" style={{ maxHeight: '92vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div className="rev-panel-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: '.85rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gold-lt)', border: '1px solid var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display',serif", fontSize: '1.1rem', color: 'var(--gold)', flexShrink: 0 }}>{initial}</div>
            <div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.15rem', color: 'var(--ink)' }}>{client.full_name}</div>
              <div style={{ fontSize: '.72rem', color: 'var(--ink-3)', marginTop: 1 }}>
                {client.total_visits || 0} visit{client.total_visits !== 1 ? 's' : ''} · {formatCurrency(client.total_spent || 0)} spent
              </div>
            </div>
          </div>
          <button className="rev-close" onClick={onClose}>&#10005;</button>
        </div>

        {(client.email || client.phone) && (
          <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {client.phone && <a href={`tel:${client.phone}`} className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>📞 {client.phone}</a>}
            {client.email && <a href={`mailto:${client.email}`} className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>✉ {client.email}</a>}
          </div>
        )}

        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.5rem' }}>Client tag</div>
          <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
            {tags.map(tg => (
              <button key={tg.v} onClick={() => saveTag(tg.v)} disabled={savingTag}
                style={{ padding: '.3rem .8rem', borderRadius: 20, border: '1.5px solid', fontSize: '.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .14s', borderColor: tag === tg.v ? 'var(--gold)' : 'var(--border-2)', background: tag === tg.v ? 'var(--gold-lt)' : 'var(--surface)', color: tag === tg.v ? 'var(--gold)' : 'var(--ink-3)' }}>
                {tg.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.65rem' }}>Appointment history</div>
          {loading
            ? <div style={{ fontSize: '.82rem', color: 'var(--ink-3)' }}>Loading...</div>
            : appts.length === 0
              ? <div style={{ fontSize: '.82rem', color: 'var(--ink-3)' }}>No appointments yet.</div>
              : appts.map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.75rem .85rem', background: 'var(--bg)', borderRadius: 10, marginBottom: '.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '.85rem', color: 'var(--ink)' }}>{a.services?.name || a.service_name || '—'}</div>
                    <div style={{ fontSize: '.72rem', color: 'var(--ink-3)', marginTop: 2 }}>
                      {new Date(a.scheduled_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })} · {new Date(a.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '.9rem', color: 'var(--ink)' }}>{formatCurrency(a.amount)}</span>
                    <span className={`badge badge-${a.status}`}>{a.status}</span>
                  </div>
                </div>
              ))
          }
        </div>

        {client.last_visit_at && (
          <div style={{ fontSize: '.72rem', color: 'var(--ink-3)', textAlign: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            Last visit: {new Date(client.last_visit_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── CSV HELPERS ───────────────────────────────────────────────────────────────
const CSV_HEADERS = ['full_name', 'email', 'phone', 'notes', 'total_visits', 'total_spent', 'last_visit_at', 'created_at']

function escapeCSV(val) {
  if (val == null || val === '') return ''
  const s = String(val)
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
}

function exportCSV(clients) {
  const rows = clients.map(c => CSV_HEADERS.map(h => escapeCSV(c[h])).join(','))
  const csv = [CSV_HEADERS.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'clients-organized.csv'; a.click()
  URL.revokeObjectURL(url)
}

function downloadTemplate() {
  const csv = CSV_HEADERS.join(',') + '\n'
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'clients-template.csv'; a.click()
  URL.revokeObjectURL(url)
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const rawHeaders = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''))

  // Column detection: Organized format or generic
  function findCol(candidates) {
    for (const c of candidates) {
      const i = rawHeaders.indexOf(c)
      if (i !== -1) return i
    }
    return -1
  }
  const colName  = findCol(['full_name', 'name', 'nom', 'full name'])
  const colEmail = findCol(['email', 'e-mail', 'courriel'])
  const colPhone = findCol(['phone', 'téléphone', 'telephone', 'tel', 'mobile'])
  const colNotes = findCol(['notes', 'note', 'remarques'])

  if (colName === -1 && colEmail === -1) return []

  return lines.slice(1).map(line => {
    // Simple CSV split respecting quoted fields
    const cols = []
    let cur = '', inQ = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') { inQ = !inQ }
      else if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = '' }
      else { cur += ch }
    }
    cols.push(cur.trim())
    const get = i => (i !== -1 ? (cols[i] || '').replace(/^"|"$/g, '').trim() : '')
    return { full_name: get(colName), email: get(colEmail), phone: get(colPhone), notes: get(colNotes) }
  }).filter(r => r.full_name || r.email)
}

// ── IMPORT MODAL ──────────────────────────────────────────────────────────────
function ImportModal({ rows, onConfirm, onClose, busy }) {
  const preview = rows.slice(0, 3)
  return (
    <div className="rev-overlay" onClick={onClose}>
      <div className="rev-panel" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="rev-panel-head">
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.1rem', color: 'var(--ink)' }}>
            Import {rows.length} client{rows.length !== 1 ? 's' : ''}
          </div>
          <button className="rev-close" onClick={onClose}>&#10005;</button>
        </div>
        <p style={{ fontSize: '.82rem', color: 'var(--ink-3)', marginBottom: '1rem' }}>
          Preview (first {Math.min(3, rows.length)} of {rows.length}). Duplicates (same email) will be skipped.
        </p>
        <div style={{ overflowX: 'auto', marginBottom: '1.25rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
            <thead>
              <tr>
                {['Name', 'Email', 'Phone'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '.35rem .6rem', fontWeight: 600, color: 'var(--ink-3)', borderBottom: '1px solid var(--border)', fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((r, i) => (
                <tr key={i}>
                  <td style={{ padding: '.4rem .6rem', color: 'var(--ink)', borderBottom: '1px solid var(--border)' }}>{r.full_name || '—'}</td>
                  <td style={{ padding: '.4rem .6rem', color: 'var(--ink-2)', borderBottom: '1px solid var(--border)' }}>{r.email || '—'}</td>
                  <td style={{ padding: '.4rem .6rem', color: 'var(--ink-2)', borderBottom: '1px solid var(--border)' }}>{r.phone || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} disabled={busy} style={{ padding: '.5rem 1rem', borderRadius: 8, border: '1px solid var(--border-2)', background: 'transparent', color: 'var(--ink-2)', fontSize: '.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          <button onClick={onConfirm} disabled={busy}
            style={{ padding: '.5rem 1.25rem', borderRadius: 8, border: 'none', background: 'var(--gold)', color: '#fff', fontSize: '.82rem', fontWeight: 600, cursor: busy ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: busy ? 0.7 : 1 }}>
            {busy ? 'Importing…' : `Import ${rows.length} client${rows.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── CLIENTS SECTION ───────────────────────────────────────────────────────────
export default function ClientsSection({ lang = 'en' }) {
  const { workspace, subscription } = useWorkspaceContext()
  const toast = useToast()
  const { data, loading, refresh } = useClients(workspace?.id)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState('all')
  const [importRows, setImportRows] = useState(null)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef(null)

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    const reader = new FileReader()
    reader.onload = ev => {
      const rows = parseCSV(ev.target.result)
      if (!rows.length) { toast.show?.('No valid clients found in file.', 'err'); return }
      setImportRows(rows)
    }
    reader.readAsText(file)
  }

  async function confirmImport() {
    if (!importRows || !workspace?.id) return
    setImporting(true)
    const toInsert = importRows.map(r => ({ workspace_id: workspace.id, full_name: r.full_name || null, email: r.email || null, phone: r.phone || null, notes: r.notes || null }))
    const { error, count } = await supabase.from('clients').upsert(toInsert, { onConflict: 'workspace_id,email', ignoreDuplicates: true, count: 'exact' })
    setImporting(false)
    setImportRows(null)
    if (error) { toast.show?.(`Import failed: ${error.message}`, 'err'); return }
    const imported = count ?? toInsert.length
    toast.show?.(`${imported} client${imported !== 1 ? 's' : ''} imported successfully`)
    refresh()
  }

  const periodClients = filterByPeriod(data, period, 'last_visit_at').filter(c => c.full_name?.toLowerCase().includes(search.toLowerCase()))
  const allFiltered = data.filter(c => c.full_name?.toLowerCase().includes(search.toLowerCase()))
  const displayData = search ? allFiltered : periodClients

  const totalRevenue = displayData.reduce((s, c) => s + Number(c.total_spent || 0), 0)
  const totalVisits = displayData.reduce((s, c) => s + Number(c.total_visits || 0), 0)
  const newStart = period === 'all' ? new Date(Date.now() - 30 * 86400000) : startOfPeriod(period)
  const newClients = displayData.filter(c => c.created_at && new Date(c.created_at) >= newStart).length

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">{t(lang, 'clients_title')}</div>
          <div className="page-sub">{data.length} client{data.length !== 1 ? 's' : ''} total</div>
        </div>
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={downloadTemplate}
            style={{ padding: '.4rem .85rem', borderRadius: 8, border: '1px solid var(--border-2)', background: 'transparent', color: 'var(--ink-3)', fontSize: '.75rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            ↓ Template
          </button>
          <button onClick={() => fileInputRef.current?.click()}
            style={{ padding: '.4rem .85rem', borderRadius: 8, border: '1px solid var(--border-2)', background: 'transparent', color: 'var(--ink-2)', fontSize: '.75rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            ↑ Import CSV
          </button>
          <button onClick={() => exportCSV(data)} disabled={!data.length}
            style={{ padding: '.4rem .85rem', borderRadius: 8, border: '1px solid var(--gold-dim)', background: 'var(--gold-lt)', color: 'var(--gold)', fontSize: '.75rem', fontWeight: 600, cursor: data.length ? 'pointer' : 'not-allowed', fontFamily: 'inherit', whiteSpace: 'nowrap', opacity: data.length ? 1 : 0.5 }}>
            ↓ Export CSV
          </button>
          <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileChange} />
        </div>
      </div>

      <ClientLimitBanner clientCount={data.length} subscription={subscription} />
      <PeriodTabs period={period} setPeriod={setPeriod} lang={lang} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '.6rem', marginBottom: '1.25rem' }}>
        {[
          { label: lang === 'fr' ? 'Revenus' : 'Revenue', value: formatCurrency(totalRevenue), color: 'var(--gold)' },
          { label: lang === 'fr' ? 'Visites' : 'Visits', value: totalVisits, color: 'var(--ink)' },
          { label: lang === 'fr' ? 'Nouveaux' : 'New', value: newClients, color: 'var(--ink-2)' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '.75rem .85rem' }}>
            <div style={{ fontSize: '.68rem', color: 'var(--ink-3)', marginBottom: '.2rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>{s.label}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: s.color, fontFamily: "'Playfair Display',serif" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {data.length > 3 && (
        <div style={{ marginBottom: '1rem', position: 'relative' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients…"
            style={{ width: '100%', padding: '.6rem .85rem .6rem 2.4rem', border: '1px solid var(--border-2)', borderRadius: 10, fontSize: '.85rem', fontFamily: 'inherit', color: 'var(--ink)', background: 'var(--surface)', outline: 'none', transition: 'border .15s' }}
            onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border-2)'} />
          <span style={{ position: 'absolute', left: '.8rem', top: '50%', transform: 'translateY(-50%)', fontSize: '.85rem', color: 'var(--ink-3)' }}>🔍</span>
        </div>
      )}

      <div className="card">
        {loading
          ? <div style={{ padding: '2rem', color: 'var(--ink-3)' }}>Loading...</div>
          : displayData.length === 0
            ? (
              <div className="empty-state">
                <div className="empty-icon">{usersIcon}</div>
                <div className="empty-title">{search ? 'No results' : 'No clients yet'}</div>
                <div className="empty-sub">{search ? 'Try a different name' : t(lang, 'clients_appear')}</div>
              </div>
            )
            : displayData.map(c => {
              const initial = c.full_name?.charAt(0)?.toUpperCase() || '?'
              const isTopSpender = data.indexOf(c) === 0 && Number(c.total_spent) > 0
              return (
                <div key={c.id} onClick={() => setSelected(c)}
                  style={{ display: 'flex', alignItems: 'center', gap: '.85rem', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background .12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: isTopSpender ? 'var(--gold-lt)' : 'var(--bg)', border: `1.5px solid ${isTopSpender ? 'var(--gold-dim)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display',serif", fontSize: '.95rem', color: isTopSpender ? 'var(--gold)' : 'var(--ink-3)', flexShrink: 0 }}>
                    {initial}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '.88rem', color: 'var(--ink)' }}>{c.full_name}</div>
                      {c.tag && <span className={`badge badge-${c.tag === 'vip' ? 'vip' : c.tag === 'new' ? 'new' : 'confirmed'}`} style={{ fontSize: '.6rem', padding: '.15rem .45rem' }}>{c.tag.toUpperCase()}</span>}
                      {isTopSpender && <span style={{ fontSize: '.6rem', color: 'var(--gold)', fontWeight: 700 }}>⭐ Top</span>}
                    </div>
                    <div style={{ fontSize: '.72rem', color: 'var(--ink-3)', marginTop: 2 }}>
                      {c.total_visits || 0} visit{c.total_visits !== 1 ? 's' : ''} · {formatCurrency(c.total_spent || 0)} spent
                      {c.last_visit_at && <span style={{ marginLeft: '.4rem' }}>· last {new Date(c.last_visit_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}</span>}
                    </div>
                  </div>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" width="12" height="12" style={{ color: 'var(--ink-3)', flexShrink: 0 }}><path d="M6 3l5 5-5 5" /></svg>
                </div>
              )
            })
        }
      </div>

      {selected && (
        <ClientHistoryPanel
          client={selected}
          workspace={workspace}
          onClose={() => { setSelected(null); refresh() }}
        />
      )}

      {importRows && (
        <ImportModal
          rows={importRows}
          busy={importing}
          onConfirm={confirmImport}
          onClose={() => setImportRows(null)}
        />
      )}
    </div>
  )
}
