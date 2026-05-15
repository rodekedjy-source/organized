import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useServices } from '../hooks/useServices'
import { useWorkspaceContext } from '../contexts/WorkspaceContext'
import { useToast } from '../contexts/ToastContext'
import { insertService, updateServiceImage, removeServiceImage, toggleServiceActive, deleteService } from '../api/services'
import { formatCurrency, formatDuration } from '../lib/formatters'

// ── I18N ──────────────────────────────────────────────────────────────────────
const LANG = {
  en: { services_title: 'Services', services_sub: 'What you offer', add_service: '+ Add service', cancel: 'Cancel', no_services: 'No services yet', add_first_service: 'Add your first service to get started.' },
  fr: { services_title: 'Services', services_sub: 'Ce que vous proposez', add_service: '+ Ajouter un service', cancel: 'Annuler', no_services: 'Aucun service', add_first_service: 'Ajoutez votre premier service pour commencer.' },
  es: { services_title: 'Servicios', services_sub: 'Lo que ofreces', add_service: '+ Agregar servicio', cancel: 'Cancelar', no_services: 'Sin servicios aún', add_first_service: 'Agrega tu primer servicio para comenzar.' },
}
function t(lang, key) { return (LANG[lang] || LANG.en)[key] || key }

// ── DURATION OPTIONS ──────────────────────────────────────────────────────────
const DURATION_OPTIONS = [
  { label: '30 min', value: 30 }, { label: '45 min', value: 45 },
  { label: '1 h', value: 60 }, { label: '1 h 15', value: 75 }, { label: '1 h 30', value: 90 }, { label: '1 h 45', value: 105 },
  { label: '2 h', value: 120 }, { label: '2 h 30', value: 150 },
  { label: '3 h', value: 180 }, { label: '3 h 30', value: 210 },
  { label: '4 h', value: 240 }, { label: '5 h', value: 300 }, { label: '6 h', value: 360 },
]

const boxIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M1 4.5l7-3 7 3v7l-7 3-7-3v-7z"/><path d="M8 1.5v14M1 4.5l7 3 7-3"/>
  </svg>
)

// ── SERVICES SECTION ──────────────────────────────────────────────────────────
export default function ServicesSection({ lang = 'en' }) {
  const { workspace } = useWorkspaceContext()
  const toast = useToast()
  const { data, refresh } = useServices(workspace?.id)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', price: '', duration_min: '60', description: '' })
  const [loading, setLoading] = useState(false)
  const [imgFile, setImgFile] = useState(null)
  const [imgPreview, setImgPreview] = useState(null)
  const [editImgId, setEditImgId] = useState(null)
  const imgInputRef = useRef(null)
  const editImgRef = useRef(null)

  function pickImg(e) {
    const file = e.target.files?.[0]; if (!file) return
    setImgFile(file); setImgPreview(URL.createObjectURL(file))
  }

  async function uploadImg(file, serviceId) {
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${workspace.id}/${serviceId}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('service-images').upload(path, file, { upsert: true, contentType: file.type })
    if (error) throw new Error(error.message)
    const { data: ud } = supabase.storage.from('service-images').getPublicUrl(path)
    return ud.publicUrl
  }

  async function add(e) {
    e.preventDefault()
    if (!form.duration_min) { toast('Please select a duration.'); return }
    setLoading(true)
    const { data: row, error } = await insertService({
      workspaceId: workspace.id,
      name: form.name,
      price: form.price,
      durationMin: form.duration_min,
      description: form.description,
    })
    if (error) { toast('Error: ' + error.message); setLoading(false); return }
    if (imgFile) {
      try {
        const url = await uploadImg(imgFile, row.id)
        await updateServiceImage(row.id, url)
      } catch (e) { toast('Service saved but image upload failed: ' + e.message) }
    }
    toast(`${form.name} added.`)
    setForm({ name: '', price: '', duration_min: '60', description: '' })
    setImgFile(null); setImgPreview(null)
    setShowForm(false); setLoading(false); refresh()
  }

  async function remove(id, name) {
    await deleteService(id)
    toast(`${name} removed.`); refresh()
  }

  async function toggle(id, cur) {
    await toggleServiceActive(id, cur); refresh()
  }

  async function handleEditImg(e, svc) {
    const file = e.target.files?.[0]; if (!file) return
    try {
      const url = await uploadImg(file, svc.id)
      await updateServiceImage(svc.id, url)
      toast('Image updated.'); refresh()
    } catch (err) { toast('Upload failed: ' + err.message) }
    setEditImgId(null)
  }

  async function removeImg(svc) {
    await removeServiceImage(svc.id)
    toast('Image removed.'); refresh()
  }

  const iS = { width: '100%', padding: '.6rem .85rem', border: '1px solid var(--border-2)', borderRadius: 9, fontSize: '.85rem', fontFamily: 'inherit', color: 'var(--ink)', background: 'var(--surface)', outline: 'none', transition: 'border .15s' }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">{t(lang, 'services_title')}</div>
          <div className="page-sub">{t(lang, 'services_sub')}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? t(lang, 'cancel') : t(lang, 'add_service')}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="card-head"><div className="card-title">New service</div></div>
          <form onSubmit={add} className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--ink-3)', display: 'block', marginBottom: '.5rem' }}>
                Service photo <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
              </label>
              <input ref={imgInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={pickImg} />
              {imgPreview ? (
                <div style={{ position: 'relative', width: 120, height: 120, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-2)' }}>
                  <img src={imgPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="preview" />
                  <button type="button" onClick={() => { setImgFile(null); setImgPreview(null) }}
                    style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,.6)', border: 'none', color: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>×</button>
                </div>
              ) : (
                <button type="button" onClick={() => imgInputRef.current?.click()}
                  style={{ width: 120, height: 120, borderRadius: 12, border: '1.5px dashed var(--border-2)', background: 'var(--bg)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--ink-3)', fontSize: '.75rem', fontFamily: 'inherit' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 16l5-5 4 4 3-3 6 6" /><circle cx="8.5" cy="8.5" r="1.5" /></svg>
                  Add photo
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="field"><label>Service name</label>
                <input style={iS} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Box Braids" required
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border-2)'} /></div>
              <div className="field"><label>Price (CAD)</label>
                <input style={iS} type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="180" required
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border-2)'} /></div>
            </div>

            <div className="field">
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Duration (minutes)</span>
                {form.duration_min && <span style={{ fontSize: '.72rem', color: 'var(--gold)', fontWeight: 500 }}>{DURATION_OPTIONS.find(d => d.value === parseInt(form.duration_min))?.label || formatDuration(parseInt(form.duration_min))}</span>}
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
                {DURATION_OPTIONS.map(opt => {
                  const sel = parseInt(form.duration_min) === opt.value
                  return (
                    <button key={opt.value} type="button" onClick={() => setForm(f => ({ ...f, duration_min: sel ? '' : String(opt.value) }))}
                      style={{ padding: '.3rem .75rem', borderRadius: 20, border: '1.5px solid', fontSize: '.75rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .14s', borderColor: sel ? 'var(--gold)' : 'var(--border-2)', background: sel ? 'var(--gold-lt)' : 'var(--surface)', color: sel ? 'var(--gold)' : 'var(--ink-3)' }}>
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="field"><label>Description (optional)</label>
              <input style={iS} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What's included, hair type, etc."
                onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border-2)'} /></div>
            <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', padding: '.75rem' }} disabled={loading}>
              {loading ? 'Saving...' : 'Save service'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        {data.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{boxIcon}</div>
            <div className="empty-title">{t(lang, 'no_services')}</div>
            <div className="empty-sub">{t(lang, 'add_first_service')}</div>
          </div>
        ) : data.map(s => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '.85rem', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <input ref={editImgId === s.id ? editImgRef : null} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={e => handleEditImg(e, s)} />
              {s.image_url ? (
                <div style={{ width: 52, height: 52, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border-2)', cursor: 'pointer', position: 'relative' }}
                  onClick={() => { setEditImgId(s.id); setTimeout(() => editImgRef.current?.click(), 50) }}>
                  <img src={s.image_url} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,.35)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  </div>
                </div>
              ) : (
                <button type="button"
                  onClick={() => { setEditImgId(s.id); setTimeout(() => editImgRef.current?.click(), 50) }}
                  style={{ width: 52, height: 52, borderRadius: 10, border: '1.5px dashed var(--border-2)', background: 'var(--bg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-3)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 16l5-5 4 4 3-3 6 6" /><circle cx="8.5" cy="8.5" r="1.5" /></svg>
                </button>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '.88rem', color: 'var(--ink)' }}>{s.name}</div>
              <div style={{ fontSize: '.73rem', color: 'var(--ink-3)', marginTop: 3 }}>
                {s.is_free ? 'Free' : formatCurrency(s.price)}{s.duration_min ? ` · ${formatDuration(s.duration_min)}` : ''}
              </div>
              {s.description && <div style={{ fontSize: '.7rem', color: 'var(--ink-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.description}</div>}
              {s.image_url && (
                <button type="button" onClick={() => removeImg(s)}
                  style={{ fontSize: '.68rem', color: '#c0392b', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 3, fontFamily: 'inherit' }}>
                  Remove photo
                </button>
              )}
            </div>

            <span className={`badge ${s.is_active ? 'badge-confirmed' : 'badge-low'}`} style={{ flexShrink: 0 }}>{s.is_active ? 'Active' : 'Hidden'}</span>
            <div style={{ display: 'flex', gap: '.35rem', flexShrink: 0 }}>
              <button className="btn btn-secondary btn-xs" onClick={() => toggle(s.id, s.is_active)}>{s.is_active ? 'Hide' : 'Show'}</button>
              <button className="btn btn-xs" style={{ color: '#c0392b', border: '1px solid #fecaca', background: 'var(--surface)' }} onClick={() => remove(s.id, s.name)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
