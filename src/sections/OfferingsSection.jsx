import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { fetchOfferings, insertOffering, updateOffering, deleteOffering, fetchEnrollments } from '../api/offerings'

function fileKind(f) {
  if (f.type.startsWith('image/')) return 'image'
  if (f.type === 'application/pdf') return 'pdf'
  if (f.type.startsWith('video/')) return 'video'
  return 'file'
}
async function compressImage(file, maxWidth=1200, quality=0.8) {
  return new Promise(resolve => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(blob => {
        resolve(new File([blob], file.name, { type: 'image/jpeg' }))
        URL.revokeObjectURL(url)
      }, 'image/jpeg', quality)
    }
    img.src = url
  })
}
async function uploadFormationFile(file, workspaceId) {
  const kind = fileKind(file)
  const ext = file.name.split('.').pop()
  const path = `${workspaceId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('formation-files').upload(path, file, { upsert: true, contentType: file.type })
  if (error) return { name: file.name, kind, url: null, error: error.message }
  const { data: urlData } = supabase.storage.from('formation-files').getPublicUrl(path)
  return { name: file.name, kind, url: urlData?.publicUrl || null, error: null }
}

const CONTENT_LABELS = { youtube: 'YouTube URL', zoom: 'Zoom/Webinar Link', pdf: 'PDF or File URL', custom: 'Content URL' }

// ── OFFERING MODAL ────────────────────────────────────────────────────────────
function OfferingModal({ offering, workspaceId, onClose, onSaved, toast }) {
  const isNew = !offering?.id
  const [form, setForm] = useState({
    title: offering?.title || '',
    type: offering?.type || 'online',
    price: String(offering?.price ?? '0'),
    description: offering?.description || '',
    content_type: offering?.content_type || 'custom',
    content_url: offering?.content_url || '',
    duration_label: offering?.duration_label || '',
    workshop_date: offering?.workshop_date ? offering.workshop_date.slice(0, 16) : '',
    workshop_location: offering?.workshop_location || '',
    spots_total: String(offering?.spots_total || ''),
    is_active: offering?.is_active ?? true,
    media: offering?.files || [],
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const iS = { width: '100%', padding: '.58rem .82rem', border: '1px solid var(--border-2)', borderRadius: 9, fontSize: '.84rem', fontFamily: 'inherit', color: 'var(--ink)', background: 'var(--surface)', outline: 'none', boxSizing: 'border-box' }

  async function handleMediaUpload(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    if (form.media.length + files.length > 5) { toast('Max 5 files per formation.'); return }
    setUploading(true)
    const results = await Promise.all(files.map(async f => {
      const uploadFile = f.type.startsWith('image/') ? await compressImage(f) : f
      return uploadFormationFile(uploadFile, workspaceId)
    }))
    const failed = results.filter(r => r.error)
    if (failed.length) toast(`${failed.length} file(s) failed to upload.`)
    const ok = results.filter(r => !r.error)
    set('media', [...form.media, ...ok])
    setUploading(false)
    e.target.value = ''
  }

  async function save() {
    if (!form.title.trim()) { toast('Title is required.'); return }
    setSaving(true)
    const payload = {
      workspace_id: workspaceId,
      title: form.title.trim(),
      type: form.type,
      price: parseFloat(form.price) || 0,
      description: form.description,
      is_active: form.is_active,
      duration_label: form.duration_label,
      files: form.media,
      ...(form.type === 'online'
        ? { content_type: form.content_type, content_url: form.content_url, workshop_date: null, workshop_location: null, spots_total: 0 }
        : { workshop_date: form.workshop_date || null, workshop_location: form.workshop_location, spots_total: parseInt(form.spots_total) || 0, content_url: null, content_type: 'custom' }
      ),
    }
    const { error } = isNew ? await insertOffering(payload) : await updateOffering(offering.id, payload)
    setSaving(false)
    if (error) { toast('Could not save — ' + error.message); return }
    toast(isNew ? `"${form.title}" created.` : `"${form.title}" updated.`)
    onSaved(); onClose()
  }

  async function del() {
    const { error } = await deleteOffering(offering.id)
    if (error) { toast('Could not delete.'); return }
    toast(`"${offering.title}" deleted.`)
    onSaved(); onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.68)', zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div style={{ background: 'var(--surface)', borderRadius: '18px 18px 0 0', width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.4rem', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.1rem', fontWeight: 500, color: 'var(--ink)' }}>{isNew ? 'New Formation' : 'Edit Formation'}</div>
          <button onClick={onClose} style={{ background: 'var(--bg)', border: '1px solid var(--border)', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        <div style={{ padding: '1.25rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Type toggle */}
          <div style={{ display: 'flex', gap: '.5rem' }}>
            {['online', 'workshop'].map(t => (
              <button key={t} onClick={() => set('type', t)} style={{ flex: 1, padding: '.55rem', border: `1.5px solid ${form.type === t ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 9, background: form.type === t ? 'rgba(197,169,106,.12)' : 'var(--bg)', color: form.type === t ? 'var(--gold)' : 'var(--ink-3)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '.82rem', fontWeight: 600, transition: 'all .15s' }}>
                {t === 'online' ? '🎓 Online Course' : '🏛 Workshop'}
              </button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '.75rem' }}>
            <div className="field"><label>Title</label><input style={iS} value={form.title} onChange={e => set('title', e.target.value)} onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border-2)'} /></div>
            <div className="field"><label>Price (0 = Free)</label><input style={iS} type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)} onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border-2)'} /></div>
          </div>
          <div className="field"><label>Description</label><textarea style={{ ...iS, resize: 'vertical', minHeight: 72 }} value={form.description} onChange={e => set('description', e.target.value)} onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border-2)'} /></div>
          {form.type === 'online' && <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '.75rem' }}>
              <div className="field"><label>Content type</label>
                <select style={iS} value={form.content_type} onChange={e => set('content_type', e.target.value)}>
                  {Object.entries(CONTENT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="field"><label>{CONTENT_LABELS[form.content_type]}</label><input style={iS} value={form.content_url} onChange={e => set('content_url', e.target.value)} placeholder="https://…" onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border-2)'} /></div>
            </div>
            <div className="field"><label>Duration</label><input style={iS} value={form.duration_label} onChange={e => set('duration_label', e.target.value)} placeholder="e.g. 2h 30min" onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border-2)'} /></div>
          </>}
          {form.type === 'workshop' && <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
              <div className="field"><label>Date &amp; Time</label><input style={iS} type="datetime-local" value={form.workshop_date} onChange={e => set('workshop_date', e.target.value)} onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border-2)'} /></div>
              <div className="field"><label>Total Spots</label><input style={iS} type="number" min="0" value={form.spots_total} onChange={e => set('spots_total', e.target.value)} onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border-2)'} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
              <div className="field"><label>Location</label><input style={iS} value={form.workshop_location} onChange={e => set('workshop_location', e.target.value)} placeholder="Studio, Zoom, etc." onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border-2)'} /></div>
              <div className="field"><label>Duration</label><input style={iS} value={form.duration_label} onChange={e => set('duration_label', e.target.value)} placeholder="e.g. Full day · 8h" onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border-2)'} /></div>
            </div>
          </>}
          {/* Media upload */}
          <div>
            <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: 'var(--ink-2)', marginBottom: '.35rem' }}>Media <span style={{ fontWeight: 400, color: 'var(--ink-3)' }}>(optional · images, PDF, video · max 5)</span></label>
            {form.media.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem', marginBottom: '.5rem' }}>
                {form.media.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.35rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 7, padding: '.3rem .55rem', fontSize: '.75rem', color: 'var(--ink-2)', maxWidth: 180 }}>
                    <span>{f.kind === 'image' ? '🖼' : f.kind === 'pdf' ? '📄' : f.kind === 'video' ? '🎬' : '📎'}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{f.name}</span>
                    <button onClick={() => set('media', form.media.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', padding: 0, lineHeight: 1, fontSize: '.85rem' }}>✕</button>
                  </div>
                ))}
              </div>
            )}
            {form.media.length < 5 && (
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.42rem .9rem', border: '1px dashed var(--border-2)', borderRadius: 8, cursor: uploading ? 'default' : 'pointer', fontSize: '.8rem', color: 'var(--ink-3)', background: 'var(--bg)' }}>
                {uploading ? '⏳ Uploading…' : '+ Add files'}
                <input type="file" accept="image/*,application/pdf,video/mp4" multiple style={{ display: 'none' }} disabled={uploading} onChange={handleMediaUpload} />
              </label>
            )}
          </div>
          {/* Published toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.75rem', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <button onClick={() => set('is_active', !form.is_active)} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', background: form.is_active ? 'var(--gold)' : 'var(--border-2)', cursor: 'pointer', transition: 'background .2s', position: 'relative', flexShrink: 0 }}>
              <span style={{ position: 'absolute', top: 3, left: form.is_active ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
            </button>
            <span style={{ fontSize: '.83rem', color: 'var(--ink-2)' }}>{form.is_active ? 'Published — visible on your page' : 'Draft — hidden from clients'}</span>
          </div>
          <div style={{ display: 'flex', gap: '.6rem', paddingBottom: '.5rem' }}>
            <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '.72rem' }} onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            {!isNew && (!confirmDel
              ? <button className="btn btn-xs" style={{ color: 'var(--red)', border: '1px solid rgba(192,57,43,.25)', background: 'var(--surface)', padding: '.45rem 1rem' }} onClick={() => setConfirmDel(true)}>Delete</button>
              : <button className="btn btn-xs" style={{ color: '#fff', background: 'var(--red)', border: 'none', padding: '.45rem 1rem' }} onClick={del}>Confirm</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── OFFERINGS SECTION ─────────────────────────────────────────────────────────
export default function OfferingsSection({ workspace, toast }) {
  const [tab, setTab] = useState('formations')
  const [offerings, setOfferings] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [modal, setModal] = useState(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data } = await fetchOfferings(workspace.id)
    setOfferings(data || [])
    setLoading(false)
  }

  async function loadEnrollments() {
    const { data } = await fetchEnrollments(workspace.id)
    setEnrollments(data || [])
  }

  useEffect(() => { if (workspace?.id) load() }, [workspace?.id])
  useEffect(() => { if (tab === 'enrollments' && workspace?.id) loadEnrollments() }, [tab, workspace?.id])

  const typeBadgeStyle = t => ({
    fontSize: '.65rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '.18rem .5rem', borderRadius: 5,
    background: t === 'online' ? 'rgba(34,197,94,.1)' : 'rgba(197,169,106,.12)',
    color: t === 'online' ? '#16a34a' : 'var(--gold)',
    border: `1px solid ${t === 'online' ? 'rgba(34,197,94,.2)' : 'rgba(197,169,106,.3)'}`,
  })

  const total = enrollments.length
  const free = enrollments.filter(e => e.amount_paid === 0 || e.payment_status === 'free').length
  const paid = enrollments.filter(e => Number(e.amount_paid) > 0).length

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">{tab === 'formations' ? 'Formations & Workshops' : 'Enrollments'}</div>
          <div className="page-sub">{tab === 'formations' ? 'Courses and workshops you offer.' : 'Everyone who signed up.'}</div>
        </div>
        {tab === 'formations' && <button className="btn btn-primary" onClick={() => setModal('new')}>+ Add</button>}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.25rem' }}>
        {[['formations', 'Formations'], ['enrollments', 'Enrollments']].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '.45rem 1.1rem', border: '1px solid', borderColor: tab === t ? 'var(--gold)' : 'var(--border)', borderRadius: 8, background: tab === t ? 'rgba(197,169,106,.1)' : 'var(--bg)', color: tab === t ? 'var(--gold)' : 'var(--ink-3)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '.8rem', fontWeight: 600, transition: 'all .15s' }}>{l}</button>
        ))}
      </div>

      {tab === 'formations' && (
        <div className="card">
          {loading
            ? <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--ink-3)', fontSize: '.85rem' }}>Loading…</div>
            : offerings.length === 0
              ? <div className="empty-state"><div className="empty-title">No formations yet</div><div className="empty-sub">Create your first course or workshop.</div></div>
              : offerings.map(o => (
                <div key={o.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background .12s' }}
                  onClick={() => setModal(o)}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.35rem', flexWrap: 'wrap' }}>
                      <span style={typeBadgeStyle(o.type || 'online')}>{o.type === 'workshop' ? 'Workshop' : 'Online Course'}</span>
                      {!o.is_active && <span style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--ink-3)', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 6px', textTransform: 'uppercase', letterSpacing: '.05em' }}>Draft</span>}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '.9rem', color: 'var(--ink)' }}>{o.title}</div>
                    {o.description && <div style={{ fontSize: '.78rem', color: 'var(--ink-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 340 }}>{o.description}</div>}
                    {o.type === 'workshop' && o.workshop_date && <div style={{ fontSize: '.75rem', color: 'var(--ink-2)', marginTop: 3 }}>{new Date(o.workshop_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}{o.workshop_location && ` · ${o.workshop_location}`}</div>}
                  </div>
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--gold)' }}>{Number(o.price) === 0 ? 'Free' : `$${Number(o.price).toFixed(0)}`}</div>
                    <div style={{ fontSize: '.68rem', color: 'var(--ink-3)', marginTop: 2 }}>✏️ Edit</div>
                  </div>
                </div>
              ))}
        </div>
      )}

      {tab === 'enrollments' && (
        <>
          <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {[['Total', total], ['Free', free], ['Paid', paid]].map(([l, v]) => (
              <div key={l} className="card" style={{ flex: 1, minWidth: 0 }}>
                <div className="card-body" style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ fontSize: '.67rem', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.35rem' }}>{l}</div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--ink)', fontFamily: "'Playfair Display',serif" }}>{v}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-head"><div className="card-title">All enrollments</div></div>
            {enrollments.length === 0
              ? <div className="empty-state"><div className="empty-title">No enrollments yet.</div><div className="empty-sub">When clients enroll in your formations, they'll appear here.</div></div>
              : enrollments.map(e => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.95rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '.88rem', color: 'var(--ink)' }}>{e.client_name || '—'}</div>
                    {e.client_email && <div style={{ fontSize: '.75rem', color: 'var(--ink-3)', marginTop: 1 }}>{e.client_email}</div>}
                    <div style={{ fontSize: '.75rem', color: 'var(--ink-2)', marginTop: 2 }}>{e.offerings?.title || '—'}</div>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '.85rem', color: 'var(--gold)' }}>{Number(e.amount_paid) > 0 ? `$${Number(e.amount_paid).toFixed(0)}` : 'Free'}</div>
                    <div style={{ fontSize: '.68rem', color: 'var(--ink-3)', marginTop: 1 }}>{new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}

      {modal && (
        <OfferingModal
          offering={modal === 'new' ? null : modal}
          workspaceId={workspace.id}
          onClose={() => setModal(null)}
          onSaved={() => { load(); if (tab === 'enrollments') loadEnrollments() }}
          toast={toast}
        />
      )}
    </div>
  )
}
