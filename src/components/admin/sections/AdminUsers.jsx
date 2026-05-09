import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { KpiCard, SecHd, Card, InfoBanner, CenterSpinner, Toast, useToast, fmtDate, timeAgo } from '../AdminShared'

function ConfirmModal({ open, title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onClose, busy }) {
  if (!open) return null
  return (
    <div className="x-modal-overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="x-modal">
        <div className="x-modal-title">{title}</div>
        <div className="x-modal-sub" style={{ marginBottom: 20 }}>{message}</div>
        <div className="x-modal-actions">
          <button className="x-btn-cancel" onClick={onClose} disabled={busy}>Cancel</button>
          <button
            className={danger ? 'x-btn-danger' : 'x-btn-primary'}
            style={danger ? { padding: '8px 16px', fontSize: 10 } : {}}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function DetailPanel({ ws, onAction }) {
  const [busy,    setBusy]    = useState(false)
  const [confirm, setConfirm] = useState(null)

  async function runAction(type) {
    setBusy(true)
    setConfirm(null)
    let error = null
    if (type === 'ban' || type === 'unban') {
      const published = type === 'unban';
      ({ error } = await supabase.rpc('admin_set_workspace_published', { p_id: ws.id, p_published: published }))
    } else if (type === 'essential') {
      ({ error } = await supabase.rpc('admin_force_essential', { p_id: ws.id }))
    } else if (type === 'beta') {
      ({ error } = await supabase.rpc('admin_tag_as_beta', { p_id: ws.id }))
    }
    setBusy(false)
    onAction(type, error)
  }

  const ACTIONS = {
    ban: {
      type: 'ban',
      title: 'Ban workspace',
      message: `"${ws.name}" will be hidden from public. No data is deleted.`,
      label: 'Ban workspace',
      danger: true,
    },
    unban: {
      type: 'unban',
      title: 'Restore workspace',
      message: `"${ws.name}" will be visible again immediately.`,
      label: 'Restore',
      danger: false,
    },
    essential: {
      type: 'essential',
      title: 'Force Essential plan',
      message: `This removes ${ws.name}'s Pro subscription. They keep all data but lose Pro features.`,
      label: 'Downgrade to Essential',
      danger: true,
    },
  }

  return (
    <>
      <tr>
        <td colSpan={6} style={{ padding: '0 0 8px' }}>
          <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: 16, border: '1px solid var(--border2)' }}>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 24, marginBottom: 14, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Last sign-in</div>
                <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: 'var(--muted2)' }}>{ws.last_sign_in_at ? timeAgo(ws.last_sign_in_at) : '—'}</div>
              </div>
              <div>
                <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Clients</div>
                <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: 'var(--muted2)' }}>{ws.client_count ?? '—'}</div>
              </div>
              <div>
                <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Appointments</div>
                <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: 'var(--muted2)' }}>{ws.appointment_count ?? '—'}</div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {ws.email && (
                <button className="x-btn-action" onClick={() => window.open(`mailto:${ws.email}`, '_blank')}>
                  Contact
                </button>
              )}
              {ws.slug && (
                <button className="x-btn-action" onClick={() => window.open(`/${ws.slug}`, '_blank')}>
                  View page
                </button>
              )}

              {ws.is_published ? (
                <button className="x-btn-danger" disabled={busy} onClick={() => setConfirm(ACTIONS.ban)}>
                  {busy ? '…' : 'Ban'}
                </button>
              ) : (
                <button
                  className="x-btn-action"
                  disabled={busy}
                  style={{ color: 'var(--green)', borderColor: 'rgba(34,197,94,0.3)' }}
                  onClick={() => setConfirm(ACTIONS.unban)}
                >
                  {busy ? '…' : 'Unban'}
                </button>
              )}

              <button
                className="x-btn-danger"
                disabled={busy}
                data-tooltip="Removes Pro plan. User keeps all their data but loses Pro features (AI photos, formations, products)."
                onClick={() => setConfirm(ACTIONS.essential)}
              >
                Force Essential
              </button>

              {ws.is_beta ? (
                <span style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--green)', padding: '4px 10px', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 4 }}>
                  Beta Tagged ✓
                </span>
              ) : (
                <button
                  className="x-btn-action"
                  disabled={busy}
                  style={{ marginLeft: 'auto' }}
                  onClick={() => runAction('beta')}
                >
                  Tag as Beta
                </button>
              )}
            </div>
          </div>
        </td>
      </tr>

      <ConfirmModal
        open={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel={confirm?.label}
        danger={confirm?.danger}
        busy={busy}
        onClose={() => setConfirm(null)}
        onConfirm={() => runAction(confirm?.type)}
      />
    </>
  )
}

export default function AdminUsers({ onNavigate }) {
  const [workspaces, setWorkspaces] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [expanded,   setExpanded]   = useState(null)
  const { toastMsg, toastType, showToast } = useToast()

  useEffect(() => {
    supabase.rpc('get_workspaces_admin').then(({ data }) => {
      setWorkspaces(data || [])
      setLoading(false)
    })
  }, [])

  function handleAction(wsId, type, error) {
    if (error) {
      showToast(`Action failed: ${error.message}`, 'err')
      return
    }
    const messages = {
      ban:       'Workspace banned — no data deleted. Click Unban to restore.',
      unban:     'Workspace restored — fully active again.',
      essential: 'Plan reset to Essential. User retains all data.',
      beta:      'Tagged as beta tester. Visible in Beta section.',
    }
    showToast(messages[type] || 'Done')
    setWorkspaces(prev => prev.map(w => {
      if (w.id !== wsId) return w
      if (type === 'ban')       return { ...w, is_published: false }
      if (type === 'unban')     return { ...w, is_published: true }
      if (type === 'essential') return { ...w, stripe_onboarded: false }
      if (type === 'beta')      return { ...w, is_beta: true, beta_tagged_at: new Date().toISOString(), is_published: true, beta_suspended: false }
      return w
    }))
  }

  if (loading) return <CenterSpinner />

  const active   = workspaces.filter(w => w.is_published).length
  const inactive = workspaces.length - active

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <InfoBanner id="workspaces" text="Tous les comptes pros sur Organized. Cliquez sur une ligne pour voir les détails et agir. Ban = retire la visibilité publique sans supprimer les données. Unban = restaure immédiatement. Force Essential = retire le plan Pro." />

      <div className="x-g4">
        <KpiCard label="Total Workspaces" value={workspaces.length} change="— Pre-beta" changeType="nn" />
        <KpiCard label="Active" value={active}
          change={active > 0 ? `${Math.round(active / Math.max(workspaces.length, 1) * 100)}% of total` : '— None yet'}
          changeType={active > 0 ? 'up' : 'nn'} gold />
        <KpiCard label="Inactive" value={inactive}
          change={inactive > 0 ? `${Math.round(inactive / Math.max(workspaces.length, 1) * 100)}% of total` : '— All active'}
          changeType="nn" />
        <KpiCard label="Stripe Onboarded" value={workspaces.filter(w => w.stripe_onboarded).length}
          change="— Payments ready" changeType="nn" />
      </div>

      <Card>
        <SecHd title="All Workspaces" right={<span style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--muted)' }}>Click row to expand</span>} />
        <table className="x-tbl">
          <thead>
            <tr>
              <th>Workspace</th>
              <th>Email</th>
              <th>Usage</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {workspaces.length === 0 && (
              <tr><td colSpan={5} style={{ color: 'var(--muted)', fontFamily: 'DM Mono,monospace', fontSize: 10, paddingTop: 16 }}>No workspaces found</td></tr>
            )}
            {workspaces.map(w => (
              <React.Fragment key={w.id}>
                <tr style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === w.id ? null : w.id)}>
                  <td>
                    <div className="x-ws-row">
                      <div className="x-ws-av">🏢</div>
                      <div>
                        <div style={{ fontSize: 11.5, fontWeight: 500 }}>{w.name || '—'}</div>
                        {w.slug && <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--muted)' }}>@{w.slug}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--muted2)' }}>{w.email || '—'}</td>
                  <td style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--muted)' }}>
                    {w.client_count ?? '—'} clients · {w.appointment_count ?? '—'} appts
                  </td>
                  <td>
                    <span className={`x-pill ${w.is_published ? 'act' : 'inn'}`}>
                      {w.is_published ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--muted)' }}>{fmtDate(w.created_at)}</td>
                </tr>
                {expanded === w.id && (
                  <DetailPanel ws={w} onAction={(type, err) => handleAction(w.id, type, err)} />
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </Card>

      <Toast msg={toastMsg} type={toastType} />
    </div>
  )
}
