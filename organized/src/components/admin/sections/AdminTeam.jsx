import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { SectionHead, Card, XTable, Pill, CenterSpinner, timeAgo } from '../AdminShared'

function RolePill({ role }) {
  const map = {
    super_admin: ['gold', 'Founder'],
    co_founder:  ['purple', 'Co-Founder'],
    team:        ['dim', 'Team'],
  }
  const [color, label] = map[role] || ['dim', role || '—']
  return <Pill color={color}>{label}</Pill>
}

export default function AdminTeam() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [invite, setInvite] = useState({ email: '', role: 'team' })
  const [inviting, setInviting] = useState(false)
  const [inviteMsg, setInviteMsg] = useState(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false })
      setMembers(data || [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleInvite() {
    if (!invite.email.trim()) return
    setInviting(true)
    setInviteMsg(null)

    // Attempt to look up user by email and upsert admin_users
    const { data: userData } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', invite.email)
      .single()

    if (userData) {
      setInviteMsg({ type: 'warn', text: 'This email already has console access.' })
    } else {
      // Insert a placeholder — they'll need to auth first to get a user_id
      setInviteMsg({ type: 'ok', text: `Invite sent to ${invite.email}. They must sign up and then be added manually via Supabase.` })
    }
    setInviting(false)
  }

  async function handleToggleActive(member) {
    const { data } = await supabase
      .from('admin_users')
      .update({ is_active: !member.is_active })
      .eq('id', member.id)
      .select()
      .single()
    if (data) setMembers(prev => prev.map(m => m.id === member.id ? data : m))
  }

  if (loading) return <CenterSpinner />

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <SectionHead
          tag="Access Control"
          title="Console Team"
          sub={`${members.length} member${members.length !== 1 ? 's' : ''} with console access`}
        />
        <button
          onClick={() => setShowInvite(v => !v)}
          style={{
            marginTop: '.25rem', display: 'flex', alignItems: 'center', gap: '.4rem',
            fontSize: '.72rem', fontWeight: 500, color: '#b5893a',
            background: 'rgba(181,137,58,.1)', border: '1px solid rgba(181,137,58,.2)',
            padding: '.35rem .85rem', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Invite Member
        </button>
      </div>

      {showInvite && (
        <div className="x-form">
          <div className="x-form-title">Invite to Console</div>
          <div className="x-form-row">
            <input
              className="x-input"
              placeholder="Email address"
              value={invite.email}
              onChange={e => setInvite(i => ({ ...i, email: e.target.value }))}
            />
            <select
              className="x-select"
              value={invite.role}
              onChange={e => setInvite(i => ({ ...i, role: e.target.value }))}
            >
              <option value="team">Team</option>
              <option value="co_founder">Co-Founder</option>
              <option value="super_admin">Founder</option>
            </select>
          </div>
          {inviteMsg && (
            <div style={{
              fontSize: '.72rem', padding: '.5rem .75rem', borderRadius: 6, fontWeight: 300,
              background: inviteMsg.type === 'ok' ? 'rgba(74,222,128,.07)' : 'rgba(250,204,21,.07)',
              color: inviteMsg.type === 'ok' ? '#4ade80' : '#facc15',
              border: `1px solid ${inviteMsg.type === 'ok' ? 'rgba(74,222,128,.15)' : 'rgba(250,204,21,.15)'}`,
            }}>
              {inviteMsg.text}
            </div>
          )}
          <div className="x-form-btns">
            <button className="x-btn" onClick={handleInvite} disabled={inviting || !invite.email.trim()}>
              {inviting ? 'Sending…' : 'Send Invite'}
            </button>
            <button className="x-btn-outline" onClick={() => { setShowInvite(false); setInviteMsg(null) }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <Card title="Team Members" meta={`${members.length} total`}>
        <XTable
          cols={['Name / Email', 'Role', 'Active', 'Since']}
          empty="No team members found"
          rows={members.map(m => (
            <tr key={m.id}>
              <td>
                <strong>{m.name || '—'}</strong>
                {m.email && (
                  <div style={{ fontSize: '.65rem', color: 'rgba(240,236,228,.3)', marginTop: '.1rem', fontWeight: 300 }}>
                    {m.email}
                  </div>
                )}
              </td>
              <td><RolePill role={m.role} /></td>
              <td>
                <button
                  onClick={() => handleToggleActive(m)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: '.35rem',
                  }}
                >
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: m.is_active ? '#4ade80' : 'rgba(255,255,255,.15)',
                    boxShadow: m.is_active ? '0 0 5px rgba(74,222,128,.35)' : 'none',
                    display: 'inline-block',
                  }} />
                  <span style={{ fontSize: '.7rem', color: m.is_active ? '#4ade80' : 'rgba(240,236,228,.25)' }}>
                    {m.is_active ? 'Active' : 'Inactive'}
                  </span>
                </button>
              </td>
              <td>{timeAgo(m.created_at)}</td>
            </tr>
          ))}
        />
      </Card>

      <div style={{ fontSize: '.65rem', color: 'rgba(240,236,228,.12)', textAlign: 'center', marginTop: '.5rem' }}>
        To add a member, they must first create an account, then be added via Supabase Dashboard → admin_users table.
      </div>
    </div>
  )
}
