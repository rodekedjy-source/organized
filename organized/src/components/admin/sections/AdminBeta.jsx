import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { KpiCard, SecHd, Card, CenterSpinner, Toast, useToast, fmtDate } from '../AdminShared'

const GOAL = 15

function BetaPill({ status }) {
  const map = { active: ['act', 'Active'], invited: ['inv', 'Invited'], pending: ['pnd', 'Pending'], inactive: ['inn', 'Inactive'] }
  const [type, label] = map[status?.toLowerCase()] || ['inn', status || '—']
  return <span className={`x-pill ${type}`}>{label}</span>
}

function InviteModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', email: '', instagram: '' })
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!form.email.trim()) return
    setSaving(true)
    await supabase.from('beta_testers').insert({ ...form, status: 'invited', invited_at: new Date().toISOString() })
    setSaving(false)
    setForm({ name: '', email: '', instagram: '' })
    onSaved()
    onClose()
  }

  return (
    <div className={`x-modal-overlay${open ? ' open' : ''}`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="x-modal">
        <div className="x-modal-title">Invite Beta Tester</div>
        <div className="x-modal-sub">Secure link · Expires in 24h</div>
        <label className="x-inp-label">Name</label>
        <input className="x-inp" placeholder="Marie-Claire" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <label className="x-inp-label">Email</label>
        <input className="x-inp" type="email" placeholder="email@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        <label className="x-inp-label">Instagram (optional)</label>
        <input className="x-inp" placeholder="@handle" value={form.instagram} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} />
        <div className="x-modal-actions">
          <button className="x-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="x-btn-primary" onClick={save} disabled={saving || !form.email.trim()}>
            {saving ? 'Saving…' : 'Send invite'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminBeta() {
  const [testers, setTesters] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const { toastMsg, showToast } = useToast()

  async function load() {
    const { data } = await supabase.from('beta_testers').select('*').order('created_at', { ascending: false })
    setTesters(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  if (loading) return <CenterSpinner />

  const active = testers.filter(t => t.status === 'active').length
  const invited = testers.filter(t => t.status === 'invited').length
  const pct = Math.round((testers.length / GOAL) * 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="x-g4">
        <KpiCard label="Goal" value={GOAL} change="Beta testers" changeType="nn" gold />
        <KpiCard label="Recruited" value={testers.length} change={`${pct}% of goal`} changeType={pct > 0 ? 'up' : 'wn'} />
        <KpiCard label="Active" value={active} change={active > 0 ? '↑ Using platform' : '— None yet'} changeType={active > 0 ? 'up' : 'nn'} />
        <KpiCard label="Onboarded" value={`${Math.round(active / GOAL * 100)}%`} change={`— ${active}/${GOAL}`} changeType="nn" />
      </div>

      <Card>
        <SecHd title="Beta Tester Tracker" right={<button className="x-btn-primary" onClick={() => setShowModal(true)}>+ Invite</button>} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
          {testers.length === 0 && (
            <div style={{ color: 'var(--muted)', fontFamily: 'DM Mono,monospace', fontSize: 10, padding: '12px 0' }}>No beta testers yet</div>
          )}
          {testers.map(t => (
            <div key={t.id} className="x-brow">
              <div className="x-bav">{(t.name || t.email || '?').charAt(0).toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500 }}>{t.name || '—'}</div>
                <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--muted)' }}>
                  {t.instagram && `${t.instagram} · `}{t.email}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <BetaPill status={t.status} />
                <button className="x-btn-ghost" onClick={() => showToast(`Message sent to ${t.name || t.email}`)}>📧</button>
              </div>
            </div>
          ))}
          {testers.length < GOAL && (
            <div className="x-brow" style={{ border: '1px dashed var(--border2)', background: 'transparent', justifyContent: 'center', color: 'var(--muted)' }} onClick={() => setShowModal(true)}>
              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10 }}>+ Add {GOAL - testers.length} more beta testers</div>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="x-sec-title" style={{ marginBottom: 14 }}>DM Template — Copy &amp; Send</div>
        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 8, padding: 14, fontSize: 12, lineHeight: 1.7, color: 'var(--muted2)' }}>
          "Hey <strong style={{ color: 'var(--white)' }}>[First name]</strong> 👋 — I saw you manage your bookings by DM. I'm building a free tool made for independent <strong style={{ color: 'var(--white)' }}>[nail techs / stylists]</strong> to simplify that. I'm looking for 10 people to test it before public launch. Would you be interested in early access?"
        </div>
        <button className="x-btn-ghost" style={{ marginTop: 12 }} onClick={() => showToast('Copied to clipboard!')}>📋 Copy template</button>
      </Card>

      <InviteModal open={showModal} onClose={() => setShowModal(false)} onSaved={() => { load(); showToast('Invite sent!') }} />
      <Toast msg={toastMsg} />
    </div>
  )
}
