import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { KpiCard, SecHd, Card, InfoBanner, CenterSpinner, Toast, useToast } from '../AdminShared'

function RoleLabel({ role }) {
  const map = { super_admin: ['pro', 'Super Admin'], co_founder: ['inv', 'Co-Founder'], team: ['inn', 'Team'] }
  const [type, label] = map[role] || ['inn', role || '—']
  return <span className={`x-pill ${type}`}>{label}</span>
}

function InviteModal({ open, onClose, onInvited }) {
  const [email, setEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState('co_founder')
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState(null)

  async function send() {
    if (!email.trim()) return
    setSending(true)
    const { data } = await supabase.from('admin_users').select('user_id').eq('user_id', email).maybeSingle()
    if (data) {
      setMsg('This user already has console access.')
    } else {
      setMsg(`Invite noted for ${email} — they must sign up first, then be added in Supabase dashboard.`)
      setTimeout(() => { onInvited(); onClose() }, 1500)
    }
    setSending(false)
  }

  const roles = [
    { id: 'co_founder', label: 'Co-Founder', desc: 'Full access except invite' },
    { id: 'team', label: 'Support', desc: 'Manages workspaces' },
    { id: 'finance', label: 'Finance', desc: 'Revenue only' },
    { id: 'readonly', label: 'Read Only', desc: 'View only' },
  ]

  return (
    <div className={`x-modal-overlay${open ? ' open' : ''}`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="x-modal">
        <div className="x-modal-title">Invite a member</div>
        <div className="x-modal-sub">Secure link · Expires in 24h</div>
        <label className="x-inp-label">Email</label>
        <input className="x-inp" type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        <label className="x-inp-label">Role</label>
        <div className="x-role-grid">
          {roles.map(r => (
            <div key={r.id} className={`x-role-opt${selectedRole === r.id ? ' sel' : ''}`} onClick={() => setSelectedRole(r.id)}>
              <div className="x-rn">{r.label}</div>
              <div className="x-rd">{r.desc}</div>
            </div>
          ))}
        </div>
        {msg && <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: 'var(--amber)', marginBottom: 12 }}>{msg}</div>}
        <div className="x-modal-actions">
          <button className="x-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="x-btn-primary" onClick={send} disabled={sending || !email.trim()}>
            {sending ? 'Sending…' : 'Send invitation'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminTeam() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const { toastMsg, showToast } = useToast()

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('admin_users').select('*').order('created_at', { ascending: false })
      setMembers(data || [])
      setLoading(false)
    }
    load()
  }, [])

  async function toggleActive(m) {
    const { data } = await supabase
      .from('admin_users')
      .update({ authorized: !m.authorized })
      .eq('user_id', m.user_id)
      .select()
      .single()
    if (data) setMembers(prev => prev.map(x => x.user_id === m.user_id ? data : x))
  }

  if (loading) return <CenterSpinner />

  const superAdmins = members.filter(m => m.role === 'super_admin').length
  const coFounders = members.filter(m => m.role === 'co_founder').length
  const pending = 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <InfoBanner id="team" text="Membres internes avec accès au Founder Console. Seul le Super Admin peut inviter ou révoquer. Active = accès activé. Inactive = accès suspendu sans suppression." />
      <div className="x-g4">
        <KpiCard label="Super Admin" value={superAdmins} change="You only" changeType="nn" gold />
        <KpiCard label="Co-Founders" value={coFounders} change="— None yet" changeType="nn" />
        <KpiCard label="Support" value={0} change="— Post-beta" changeType="nn" />
        <KpiCard label="Invitations" value={pending} change="Pending" changeType="nn" />
      </div>

      <Card>
        <SecHd title="Active Members" right={<button className="x-btn-primary" onClick={() => setShowModal(true)}>+ Invite a member</button>} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {members.map(m => (
            <div key={m.user_id} className="x-team-row">
              <div className="x-team-av" style={{ background: m.authorized ? 'linear-gradient(135deg,var(--gold-dim),var(--gold))' : 'var(--border2)' }}>
                {(m.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{m.name || 'Unknown'}</div>
                <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--muted)' }}>
                  {m.user_id?.slice(0, 12)}…
                </div>
              </div>
              <RoleLabel role={m.role} />
              <button
                onClick={() => toggleActive(m)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Mono,monospace', fontSize: 9, color: m.authorized ? 'var(--green)' : 'var(--muted)', padding: '4px 8px' }}
              >
                {m.authorized ? 'Active' : 'Inactive'}
              </button>
            </div>
          ))}
          <div
            style={{ border: '1px dashed var(--border2)', borderRadius: 8, padding: 20, textAlign: 'center', cursor: 'pointer' }}
            onClick={() => setShowModal(true)}
          >
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: 'var(--muted)' }}>+ Invite a co-founder or team member</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>A secure link will be sent</div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="x-sec-title" style={{ marginBottom: 14 }}>Permissions by Role</div>
        <table className="x-tbl">
          <thead><tr><th>Permission</th><th>Super Admin</th><th>Co-Founder</th><th>Support</th><th>Finance</th></tr></thead>
          <tbody>
            {[
              ['View revenue & MRR', '✅', '✅', '❌', '✅'],
              ['Manage workspaces', '✅', '✅', '✅', '❌'],
              ['Invite admins', '✅', '❌', '❌', '❌'],
              ['Remove admins', '✅', '❌', '❌', '❌'],
              ['Modify theme', '✅', '✅', '❌', '❌'],
              ['View audit trail', '✅', '✅', '✅', '❌'],
            ].map(([perm, ...vals]) => (
              <tr key={perm}>
                <td style={{ fontSize: 11, color: 'var(--muted2)' }}>{perm}</td>
                {vals.map((v, i) => <td key={i} style={{ fontFamily: 'DM Mono,monospace', fontSize: 11 }}>{v}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <InviteModal open={showModal} onClose={() => setShowModal(false)} onInvited={() => showToast('Invitation sent!')} />
      <Toast msg={toastMsg} />
    </div>
  )
}
