import { useState } from 'react'
import { useWorkspaceContext } from '../contexts/WorkspaceContext'
import { useToast } from '../contexts/ToastContext'
import { useReviews } from '../hooks/useReviews'
import { approveReview, deleteReview } from '../api/reviews'

export default function ReviewsSection() {
  const { workspace } = useWorkspaceContext()
  const toast = useToast()
  const { reviews, loading, refresh } = useReviews(workspace?.id)
  const [filter, setFilter] = useState('pending')

  async function approve(id) {
    await approveReview(id)
    toast('Review approved — now visible on your client page.')
    refresh()
  }

  async function reject(id) {
    await deleteReview(id)
    toast('Review removed.')
    refresh()
  }

  const pending = reviews.filter(r => !r.is_approved).length
  const filtered = reviews.filter(r =>
    filter === 'all' ? true : filter === 'pending' ? !r.is_approved : r.is_approved
  )

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">
            Reviews{' '}
            {pending > 0 && (
              <span style={{ background: '#f59e0b', color: '#fff', borderRadius: 100, padding: '1px 8px', fontSize: '.7rem', fontWeight: 700, marginLeft: 8, verticalAlign: 'middle' }}>
                {pending}
              </span>
            )}
          </div>
          <div className="page-sub">Approve reviews before they appear on your client page</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: '1rem' }}>
        {[['pending', 'Pending'], ['approved', 'Approved'], ['all', 'All']].map(([k, l]) => {
          const label = k === 'pending' && pending > 0 ? `${l} (${pending})` : l
          const active = filter === k
          return (
            <button key={k} onClick={() => setFilter(k)}
              style={{
                padding: '.4rem .9rem', borderRadius: 8,
                border: '1px solid ' + (active ? 'var(--gold)' : 'var(--border-2)'),
                background: active ? 'var(--gold-lt)' : 'transparent',
                color: active ? 'var(--ink)' : 'var(--ink-3)',
                fontSize: '.78rem', fontWeight: active ? 600 : 400,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
              {label}
            </button>
          )
        })}
      </div>

      {loading
        ? <div style={{ padding: '2rem', color: 'var(--ink-3)', fontSize: '.85rem' }}>Loading…</div>
        : filtered.length === 0
          ? <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '.85rem', color: 'var(--ink-3)' }}>
                {filter === 'pending' ? 'No pending reviews.' : 'No reviews yet.'}
              </div>
            </div>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
              {filtered.map(rv => (
                <div key={rv.id} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                        <div style={{ fontWeight: 600, fontSize: '.88rem' }}>
                          {rv.client_name || rv.reviewer_name || 'Anonymous'}
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 1 }}>
                          {'★'.repeat(rv.rating || 5)}
                        </span>
                        {rv.service_name && (
                          <span style={{ fontSize: '.7rem', color: 'var(--ink-3)', background: 'var(--bg)', borderRadius: 4, padding: '2px 7px' }}>
                            {rv.service_name}
                          </span>
                        )}
                        <span style={{ fontSize: '.7rem', fontWeight: 600, color: rv.is_approved ? '#15803d' : '#92400e', background: rv.is_approved ? '#f0fdf4' : '#fffbeb', borderRadius: 4, padding: '2px 7px' }}>
                          {rv.is_approved ? 'Published' : 'Pending'}
                        </span>
                      </div>
                      <p style={{ fontSize: '.83rem', color: 'var(--ink-2)', lineHeight: 1.7, margin: 0 }}>
                        {rv.body || '—'}
                      </p>
                      <div style={{ fontSize: '.72rem', color: 'var(--ink-3)', marginTop: 6 }}>
                        {new Date(rv.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                      {!rv.is_approved && (
                        <button onClick={() => approve(rv.id)}
                          style={{ padding: '.4rem .9rem', background: 'var(--gold)', border: 'none', borderRadius: 8, fontSize: '.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--ink)' }}>
                          Approve
                        </button>
                      )}
                      <button onClick={() => reject(rv.id)}
                        style={{ padding: '.4rem .9rem', background: 'none', border: '1px solid #fca5a5', borderRadius: 8, fontSize: '.78rem', cursor: 'pointer', fontFamily: 'inherit', color: '#c0392b' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
      }
    </div>
  )
}
