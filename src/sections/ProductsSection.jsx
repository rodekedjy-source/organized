import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useProducts } from '../hooks/useProducts'
import { useWorkspaceContext } from '../contexts/WorkspaceContext'
import { useToast } from '../contexts/ToastContext'
import { insertProduct, updateProduct, deleteProduct, deleteProducts, setFeaturedProduct } from '../api/products'
import { formatCurrency } from '../lib/formatters'

// ── PLAN GATING ───────────────────────────────────────────────────────────────
const PLAN_FEATURES = {
  free: [], essential: [],
  pro: ['products', 'formations', 'analytics_full', 'ai_enhance', 'custom_branding', 'clients_unlimited'],
}
function canAccess(subscription, feature) {
  const plan = subscription?.plan || 'essential'
  return (PLAN_FEATURES[plan] || []).includes(feature)
}

function UpgradeGate({ feature }) {
  const [show, setShow] = useState(false)
  const INFO = {
    products: { name: 'Product Sales', desc: 'Sell products directly through your booking page.' },
    formations: { name: 'Workshops & Formations', desc: 'Create and monetize courses, workshops, and events.' },
    ai_enhance: { name: 'AI Photo Enhancement', desc: 'Transform product photos into professional studio shots.' },
    clients_unlimited: { name: 'Unlimited Clients', desc: 'Remove the 50-client cap on your Essential plan.' },
  }
  const info = INFO[feature] || { name: feature, desc: '' }
  return (
    <>
      {show && (
        <div onClick={() => setShow(false)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', borderRadius: '1.25rem', padding: '2.5rem 2rem', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,.25)', border: '1px solid rgba(189,151,97,.2)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👑</div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.5rem', fontFamily: "'Playfair Display',serif" }}>{info.name}</h2>
            <p style={{ fontSize: '.9rem', color: 'var(--ink-2)', marginBottom: '.5rem', lineHeight: 1.6 }}>{info.desc}</p>
            <p style={{ fontSize: '.85rem', color: 'var(--ink-3)', marginBottom: '2rem' }}>Available on the <strong style={{ color: 'var(--gold)' }}>Pro plan</strong> — $39/mo</p>
            <a href="https://www.beorganized.io/#pricing" target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', padding: '.875rem 1.5rem', background: 'var(--gold)', color: '#fff', fontWeight: 600, fontSize: '.95rem', borderRadius: '.75rem', textDecoration: 'none', marginBottom: '.75rem' }}>
              Upgrade to Pro →
            </a>
            <button onClick={() => setShow(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', fontSize: '.875rem', padding: '.5rem' }}>Maybe later</button>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem', textAlign: 'center', gap: '1rem' }}>
        <div style={{ fontSize: '2.5rem' }}>🔒</div>
        <div style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--ink)', fontFamily: "'Playfair Display',serif" }}>{info.name}</div>
        <div style={{ fontSize: '.9rem', color: 'var(--ink-2)', maxWidth: '260px', lineHeight: 1.65 }}>{info.desc}</div>
        <button onClick={() => setShow(true)} style={{ background: 'var(--gold)', color: '#fff', border: 'none', borderRadius: '.75rem', padding: '.75rem 1.75rem', fontSize: '.9rem', fontWeight: 600, cursor: 'pointer', marginTop: '.5rem' }}>
          Upgrade to Pro →
        </button>
      </div>
    </>
  )
}

// ── LOCAL HELPERS ─────────────────────────────────────────────────────────────
function isSaleActive(p) {
  if (!p.discount_price) return false
  if (!p.discount_ends_at) return true
  return new Date(p.discount_ends_at) > new Date()
}

function useScrollLock() {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])
}

const boxIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M1 4.5l7-3 7 3v7l-7 3-7-3v-7z"/><path d="M8 1.5v14M1 4.5l7 3 7-3"/>
  </svg>
)

// ── IMAGE HELPERS ─────────────────────────────────────────────────────────────
async function compressImage(file, maxWidth = 1400, quality = 0.82) {
  if (!file.type.startsWith('image/')) return file
  return new Promise(resolve => {
    const img = new Image(), url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxWidth / img.width), w = Math.round(img.width * scale), h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      canvas.toBlob(blob => {
        if (!blob) { resolve(file); return }
        resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }))
      }, 'image/jpeg', quality)
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.src = url
  })
}

async function uploadProductImages(files, workspaceId) {
  if (!workspaceId) return files.map(file => ({ preview: URL.createObjectURL(file), url: null, error: 'Workspace not loaded.' }))
  return Promise.all(files.map(async (file, i) => {
    const preview = URL.createObjectURL(file), compressed = await compressImage(file)
    const ext = compressed.name.split('.').pop(), path = `${workspaceId}/${Date.now()}-${i}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(path, compressed, { upsert: true })
    if (error) return { preview, url: null, error: error.message }
    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path)
    return { preview, url: urlData?.publicUrl || null, error: null }
  }))
}

// ── AI ENHANCE MODAL ──────────────────────────────────────────────────────────
function EnhanceModal({ imageUrl, imagePreview, workspace, onSelect, onClose, toast }) {
  const [phase, setPhase] = useState('templates')
  const [templates, setTemplates] = useState([])
  const [selected, setSelected] = useState(null)
  const [resultUrl, setResultUrl] = useState(null)
  const [saving, setSaving] = useState(false)
  const [usageUsed, setUsageUsed] = useState(0)
  const DAILY_LIMIT = 10

  const FALLBACK_TEMPLATES = [
    { id: 'studio_white',   label: 'Studio Blanc',     emoji: '⬜', url: 'https://v3b.fal.media/files/b/0a98fac8/C9DokWdUT0u69qqaDgR_9.jpg' },
    { id: 'marble_luxe',    label: 'Marbre Luxe',       emoji: '🧇', url: 'https://v3b.fal.media/files/b/0a98fac8/5z50B-ImghTkqTO0j6Eoj.jpg' },
    { id: 'bokeh_gold',     label: 'Bokeh Doré',        emoji: '✨', url: 'https://v3b.fal.media/files/b/0a98fac8/42ZN6OhGvPsYAVaY0KSqI.jpg' },
    { id: 'noir_dramatique',label: 'Nuit Dramatique',   emoji: '🌑', url: 'https://v3b.fal.media/files/b/0a98fac8/gi_jVMyiTa9YJBYjU_SMu.jpg' },
    { id: 'rose_poudre',    label: 'Rose Poudré',       emoji: '🌸', url: 'https://v3b.fal.media/files/b/0a98fac8/VmNTUlN8iy0eObxGLJTAJ.jpg' },
    { id: 'botanique',      label: 'Botanique',         emoji: '🌿', url: 'https://v3b.fal.media/files/b/0a98fac8/uCsXKl3V_WiABW9oVevBi.jpg' },
  ]

  useEffect(() => {
    async function loadTemplates() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const { data, error } = await supabase.functions.invoke('enhance-product-image', {
          body: {},
          headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
        })
        if (!error && data?.templates) setTemplates(data.templates)
        else setTemplates(FALLBACK_TEMPLATES)
        if (data?.used != null) setUsageUsed(data.used)
      } catch { setTemplates(FALLBACK_TEMPLATES) }
    }
    loadTemplates()
  }, [])

  async function generate(template) {
    if (usageUsed >= DAILY_LIMIT) {
      toast(`Daily limit reached (${DAILY_LIMIT}/day). Resets at midnight UTC.`)
      return
    }
    setSelected(template); setPhase('loading')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) { toast('Please log in to use AI enhancement.'); setPhase('templates'); return }
      const { data, error } = await supabase.functions.invoke('enhance-product-image', {
        body: { image_url: imageUrl, template_id: template.id },
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (error) {
        const msg = error.message || ''
        if (msg.includes('limit') || msg.includes('429')) {
          toast(`Daily AI enhancement limit reached (${DAILY_LIMIT}/day). Resets at midnight UTC.`)
        } else {
          toast('Enhancement failed — ' + msg)
        }
        setPhase('templates'); return
      }
      if (data?.error) {
        if (data.error.includes('limit')) {
          toast(data.error); setPhase('templates'); return
        }
        throw new Error(data.error)
      }
      if (data?.used != null) setUsageUsed(data.used)
      if (data?.url) { setResultUrl(data.url); setPhase('result'); return }
      throw new Error('No image returned.')
    } catch (e) { toast('Enhancement failed — ' + e.message); setPhase('templates') }
  }

  async function save() {
    if (!resultUrl) return; setSaving(true)
    try {
      let finalUrl = resultUrl
      if (resultUrl.startsWith('data:')) {
        const blob = await (await fetch(resultUrl)).blob()
        const path = `${workspace.id}/enhanced-${Date.now()}.png`
        await supabase.storage.from('product-images').upload(path, blob, { upsert: true, contentType: 'image/png' })
        const { data: ud } = supabase.storage.from('product-images').getPublicUrl(path)
        finalUrl = ud?.publicUrl || resultUrl
      }
      onSelect(finalUrl); onClose()
    } catch (e) { toast('Could not save: ' + e.message) }
    finally { setSaving(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1050, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0' }}>
      <style>{`@keyframes spin-en{to{transform:rotate(360deg)}} @keyframes slide-up{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
      <div style={{ background: 'var(--surface)', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: '520px', overflow: 'hidden', boxShadow: '0 -8px 40px rgba(0,0,0,.4)', animation: 'slide-up .3s ease', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: '.95rem', fontWeight: 700, fontFamily: "'Playfair Display',serif" }}>✨ AI Photo Enhancement</div>
            <div style={{ fontSize: '.72rem', color: usageUsed >= DAILY_LIMIT ? 'var(--red)' : 'var(--ink-3)', marginTop: '.1rem' }}>
              {usageUsed}/{DAILY_LIMIT} enhancements used today
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', width: 28, height: 28, cursor: 'pointer', color: 'var(--ink-3)', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
        <div style={{ padding: '1rem 1.25rem', overflowY: 'auto', flex: 1 }}>
          {phase !== 'result' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1rem', background: 'var(--bg)', borderRadius: 10, padding: '.65rem' }}>
              <img src={imagePreview || imageUrl} style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} alt="product" />
              <div>
                <div style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--ink)' }}>Your product</div>
                <div style={{ fontSize: '.7rem', color: 'var(--ink-3)' }}>Background will be replaced by AI</div>
              </div>
            </div>
          )}
          {phase === 'templates' && (
            <>
              <div style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--ink-3)', marginBottom: '.65rem', textTransform: 'uppercase', letterSpacing: '.08em' }}>Select a background</div>
              {templates.length === 0
                ? <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ink-3)', fontSize: '.85rem' }}>Loading templates...</div>
                : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '.5rem' }}>
                    {templates.map(tpl => (
                      <div key={tpl.id} onClick={() => generate(tpl)}
                        style={{ cursor: 'pointer', borderRadius: 10, overflow: 'hidden', border: '2px solid var(--border)', transition: 'border-color .15s,transform .1s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.transform = 'scale(1.02)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'scale(1)' }}>
                        <img src={tpl.url} alt={tpl.label} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
                        <div style={{ padding: '.3rem .4rem', background: 'var(--bg)' }}>
                          <div style={{ fontSize: '.65rem', fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tpl.emoji} {tpl.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </>
          )}
          {phase === 'loading' && (
            <div style={{ textAlign: 'center', padding: '2.5rem 0' }}>
              {selected && <img src={selected.url} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 12, marginBottom: '1rem', opacity: .6 }} alt="" />}
              <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--gold)', animation: 'spin-en 1s linear infinite', margin: '0 auto .9rem' }} />
              <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: '.3rem', fontSize: '.9rem' }}>Creating your visual…</div>
              <div style={{ fontSize: '.75rem', color: 'var(--ink-3)' }}>Removing background · Compositing · ~15 seconds</div>
            </div>
          )}
          {phase === 'result' && (
            <>
              <img src={resultUrl} style={{ width: '100%', aspectRatio: '1', objectFit: 'contain', borderRadius: 12, marginBottom: '1rem', background: '#f5f5f5' }} alt="enhanced" />
              <button onClick={save} disabled={saving}
                style={{ width: '100%', padding: '.85rem', background: 'linear-gradient(135deg,#c5a66a,#a8863d)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: '.88rem', cursor: saving ? 'default' : 'pointer', opacity: saving ? .7 : 1, marginBottom: '.6rem' }}>
                {saving ? 'Saving…' : '✓ Use this photo'}
              </button>
              <button onClick={() => { setPhase('templates'); setResultUrl(null); setSelected(null) }}
                style={{ width: '100%', padding: '.65rem', background: 'none', border: '1px solid var(--border)', borderRadius: 9, color: 'var(--ink-3)', cursor: 'pointer', fontSize: '.82rem' }}>
                ← Try another template
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── IMAGE EDITOR MODAL ────────────────────────────────────────────────────────
function ImageEditorModal({ imageUrl, workspaceId, productName = '', onSave, onClose, toast }) {
  useScrollLock()
  const canvasRef = useRef(null)
  const imgRef = useRef(null)
  const [rotation, setRotation] = useState(0)
  const [flipH, setFlipH] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [mode, setMode] = useState('adjust')
  const [showEnhance, setShowEnhance] = useState(false)
  const [cropAspect, setCropAspect] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 1, h: 1 })

  useEffect(() => {
    fetch(imageUrl).then(r => r.blob()).then(blob => {
      const blobUrl = URL.createObjectURL(blob)
      const img = new Image()
      img.onload = () => { imgRef.current = img; setLoaded(true) }
      img.onerror = () => toast('Could not load image.')
      img.src = blobUrl
    }).catch(() => toast('Could not load image.'))
  }, [imageUrl])

  useEffect(() => { if (loaded) draw() }, [loaded, rotation, flipH, crop, mode])

  function draw() {
    const canvas = canvasRef.current, img = imgRef.current
    if (!canvas || !img) return
    const rad = (rotation * Math.PI) / 180
    const swapped = rotation === 90 || rotation === 270
    const srcW = swapped ? img.height : img.width
    const srcH = swapped ? img.width : img.height
    canvas.width = srcW; canvas.height = srcH
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, srcW, srcH)
    ctx.save(); ctx.translate(srcW / 2, srcH / 2); ctx.rotate(rad)
    if (flipH) ctx.scale(-1, 1)
    ctx.drawImage(img, -img.width / 2, -img.height / 2)
    ctx.restore()
    if (mode === 'crop') {
      const cx = crop.x * srcW, cy = crop.y * srcH, cw = crop.w * srcW, ch = crop.h * srcH
      ctx.fillStyle = 'rgba(0,0,0,.55)'
      ctx.fillRect(0, 0, srcW, cy); ctx.fillRect(0, cy + ch, srcW, srcH - (cy + ch))
      ctx.fillRect(0, cy, cx, ch); ctx.fillRect(cx + cw, cy, srcW - (cx + cw), ch)
      ctx.strokeStyle = 'rgba(197,169,106,.85)'; ctx.lineWidth = 2
      ctx.strokeRect(cx, cy, cw, ch)
      const hs = 14;
      [[cx, cy], [cx + cw - hs, cy], [cx, cy + ch - hs], [cx + cw - hs, cy + ch - hs]].forEach(([hx, hy]) => {
        ctx.fillStyle = 'rgba(197,169,106,.95)'; ctx.fillRect(hx, hy, hs, hs)
      })
    }
  }

  function rotate(deg) { setRotation(r => (r + deg + 360) % 360) }

  function applyAspect(a) {
    setCropAspect(a)
    if (a === null) { setCrop({ x: 0, y: 0, w: 1, h: 1 }); return }
    const canvas = canvasRef.current; if (!canvas) return
    const cw = canvas.width, ch = canvas.height
    let rw = 1, rh = 1
    if (a === 1) { const s = Math.min(cw, ch); rw = s / cw; rh = s / ch }
    else if (a === 0.75) { rw = Math.min(1, ch * 0.75 / cw); rh = Math.min(1, cw / (ch * 0.75)) }
    else if (a === 1.333) { rh = Math.min(1, cw * 0.75 / ch); rw = Math.min(1, ch * 1.333 / cw) }
    setCrop({ x: (1 - rw) / 2, y: (1 - rh) / 2, w: rw, h: rh })
  }

  async function save() {
    const canvas = canvasRef.current, img = imgRef.current
    if (!canvas || !img) { onSave(imageUrl); onClose(); return }
    setSaving(true)
    const rad = (rotation * Math.PI) / 180
    const swapped = rotation === 90 || rotation === 270
    const srcW = swapped ? img.height : img.width
    const srcH = swapped ? img.width : img.height
    const tmp = document.createElement('canvas'); tmp.width = srcW; tmp.height = srcH
    const tctx = tmp.getContext('2d')
    tctx.save(); tctx.translate(srcW / 2, srcH / 2); tctx.rotate(rad)
    if (flipH) tctx.scale(-1, 1)
    tctx.drawImage(img, -img.width / 2, -img.height / 2); tctx.restore()
    const cx = Math.round(crop.x * srcW), cy = Math.round(crop.y * srcH)
    const cw = Math.max(1, Math.round(crop.w * srcW)), ch = Math.max(1, Math.round(crop.h * srcH))
    const final = document.createElement('canvas'); final.width = cw; final.height = ch
    final.getContext('2d').drawImage(tmp, cx, cy, cw, ch, 0, 0, cw, ch)
    final.toBlob(async blob => {
      if (!blob) { onSave(imageUrl); onClose(); setSaving(false); return }
      const path = `${workspaceId}/edited-${Date.now()}.jpg`
      const { error } = await supabase.storage.from('product-images').upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
      if (error) { toast('Could not save.'); onSave(imageUrl); onClose(); setSaving(false); return }
      const { data: ud } = supabase.storage.from('product-images').getPublicUrl(path)
      onSave(ud.publicUrl || imageUrl); setSaving(false); onClose()
    }, 'image/jpeg', 0.92)
  }

  const tabBtn = (active) => ({ background: active ? 'rgba(197,169,106,.15)' : 'rgba(255,255,255,.06)', border: `1px solid ${active ? 'rgba(197,169,106,.4)' : 'rgba(255,255,255,.08)'}`, color: active ? 'var(--gold)' : 'rgba(255,255,255,.5)', borderRadius: 8, padding: '.35rem .85rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '.72rem', fontWeight: 600, letterSpacing: '.04em', transition: 'all .15s' })
  const ctrlBtn = () => ({ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.75)', borderRadius: 12, width: 68, height: 64, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'background .15s' })

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#080706', zIndex: 500, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.85rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,.06)', flexShrink: 0 }}>
        <button onClick={onClose} style={tabBtn(false)}>Cancel</button>
        <div style={{ display: 'flex', gap: '.35rem' }}>
          <button onClick={() => setMode('adjust')} style={tabBtn(mode === 'adjust')}>Adjust</button>
          <button onClick={() => setMode('crop')} style={tabBtn(mode === 'crop')}>Crop</button>
        </div>
        <button onClick={save} disabled={saving || !loaded}
          style={{ background: saving || !loaded ? 'rgba(197,169,106,.3)' : 'var(--gold)', border: 'none', color: '#1a1814', borderRadius: 9, padding: '.45rem 1.1rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '.8rem', fontWeight: 700, transition: 'all .15s' }}>
          {saving ? 'Saving…' : 'Done'}
        </button>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem', overflow: 'hidden' }}>
        {!loaded && <div style={{ color: 'rgba(255,255,255,.25)', fontSize: '.75rem', letterSpacing: '.1em', textTransform: 'uppercase' }}>Loading…</div>}
        <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '100%', display: loaded ? 'block' : 'none', borderRadius: 6 }} />
      </div>
      <div style={{ padding: '1rem 1.25rem 2.75rem', background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(20px)', flexShrink: 0 }}>
        {mode === 'adjust' && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '.6rem' }}>
            {[{ label: '↺', sub: 'Rotate L', action: () => rotate(-90) }, { label: '↻', sub: 'Rotate R', action: () => rotate(90) }, { label: '⇔', sub: 'Mirror', action: () => setFlipH(f => !f) }].map((c, i) => (
              <button key={i} onClick={c.action} style={ctrlBtn()}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.05)'}>
                <span style={{ fontSize: '1.4rem', lineHeight: 1, fontWeight: 300 }}>{c.label}</span>
                <span style={{ fontSize: '.55rem', color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.07em' }}>{c.sub}</span>
              </button>
            ))}
            <button onClick={() => setShowEnhance(true)}
              style={{ background: 'rgba(197,169,106,.1)', border: '1px solid rgba(197,169,106,.25)', color: 'var(--gold)', borderRadius: 12, width: 68, height: 64, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(197,169,106,.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(197,169,106,.1)'}>
              <span style={{ fontSize: '.82rem', fontWeight: 700, letterSpacing: '.04em' }}>AI</span>
              <span style={{ fontSize: '.55rem', color: 'rgba(197,169,106,.5)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Enhance</span>
            </button>
          </div>
        )}
        {mode === 'crop' && (
          <div>
            <div style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.25)', textTransform: 'uppercase', letterSpacing: '.12em', textAlign: 'center', marginBottom: '.6rem' }}>Aspect ratio</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '.4rem', flexWrap: 'wrap' }}>
              {[{ label: 'Free', val: null }, { label: '1:1', val: 1 }, { label: '3:4', val: 0.75 }, { label: '4:3', val: 1.333 }].map(a => (
                <button key={a.label} onClick={() => applyAspect(a.val)} style={{ ...tabBtn(cropAspect === a.val), padding: '.4rem .8rem', borderRadius: 8 }}>{a.label}</button>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '.55rem', fontSize: '.6rem', color: 'rgba(255,255,255,.18)', letterSpacing: '.06em' }}>Tap Done to apply</div>
          </div>
        )}
      </div>
      {showEnhance && (
        <EnhanceModal imageUrl={imageUrl} imagePreview={imageUrl} workspace={{ id: workspaceId }}
          onSelect={newUrl => {
            fetch(newUrl).then(r => r.blob()).then(blob => {
              const blobUrl = URL.createObjectURL(blob)
              const img = new Image()
              img.onload = () => { imgRef.current = img; draw() }
              img.src = blobUrl
            })
            toast('Photo enhanced.'); setShowEnhance(false)
          }}
          onClose={() => setShowEnhance(false)} toast={toast} />
      )}
    </div>
  )
}

// ── PRODUCT EDIT MODAL ────────────────────────────────────────────────────────
function ProductEditModal({ product, workspaceId, onClose, onSaved, onDeleted, toast }) {
  useScrollLock()
  const [form, setForm] = useState({ name: product.name || '', price: String(product.price ?? ''), stock: String(product.stock ?? ''), description: product.description || '', discount_price: product.discount_price != null ? String(product.discount_price) : '', discount_ends_at: product.discount_ends_at ? product.discount_ends_at.slice(0, 16) : '' })
  const [existingImgs, setExistingImgs] = useState((product.images || []).map(url => ({ url, preview: url })))
  const [newImgs, setNewImgs] = useState([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const [tab, setTab] = useState('view')
  const [editorTarget, setEditorTarget] = useState(null)
  const allImages = [...existingImgs.map(i => i.url), ...newImgs.filter(i => i.url).map(i => i.url)]

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowRight') setActiveIdx(i => (i + 1) % Math.max(allImages.length, 1)); if (e.key === 'ArrowLeft') setActiveIdx(i => (i - 1 + Math.max(allImages.length, 1)) % Math.max(allImages.length, 1)) }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [allImages.length])

  async function handleNewImages(e) { const files = [...e.target.files]; if (!files.length) return; setUploading(true); const results = await uploadProductImages(files, workspaceId); if (results.filter(r => r.error).length > 0) toast('Upload failed'); setNewImgs(prev => [...prev, ...results]); setUploading(false) }

  async function save() {
    setSaving(true)
    const finalImages = [...existingImgs.map(i => i.url), ...newImgs.filter(i => i.url).map(i => i.url)]
    const { error } = await updateProduct(product.id, { name: form.name, price: form.price, stock: form.stock, description: form.description, images: finalImages, discount_price: form.discount_price || null, discount_ends_at: form.discount_ends_at || null })
    setSaving(false); if (error) { toast('Error saving.'); return }
    toast(`${form.name} updated.`); onSaved(); onClose()
  }

  async function handleDelete() {
    await deleteProduct(product.id)
    toast(`${product.name} deleted.`); onDeleted(); onClose()
  }

  const iS = { width: '100%', padding: '.55rem .8rem', border: '1px solid var(--border-2)', borderRadius: 9, fontSize: '.84rem', fontFamily: 'inherit', color: 'var(--ink)', background: 'var(--surface)', outline: 'none', transition: 'border .15s' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.72)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div style={{ background: 'var(--surface)', borderRadius: 18, width: '100%', maxWidth: 660, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,.3)', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div style={{ position: 'relative', background: '#0d0c0a', borderRadius: '18px 18px 0 0', overflow: 'hidden', minHeight: 240 }}>
          {allImages.length > 0 ? (
            <>
              <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: zoomed ? 'zoom-out' : 'zoom-in' }} onClick={() => tab === 'view' && setZoomed(z => !z)}>
                <img src={allImages[Math.min(activeIdx, allImages.length - 1)]} alt="" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', transition: 'transform .3s', transform: zoomed ? 'scale(1.85)' : 'scale(1)' }} />
              </div>
              {allImages.length > 1 && (
                <>
                  <button onClick={e => { e.stopPropagation(); setActiveIdx(i => (i - 1 + allImages.length) % allImages.length) }} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.15)', border: 'none', color: '#fff', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                  <button onClick={e => { e.stopPropagation(); setActiveIdx(i => (i + 1) % allImages.length) }} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.15)', border: 'none', color: '#fff', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
                  <div style={{ position: 'absolute', bottom: 8, right: 12, background: 'rgba(0,0,0,.5)', color: '#fff', fontSize: '.65rem', padding: '2px 8px', borderRadius: 20 }}>{Math.min(activeIdx, allImages.length - 1) + 1}/{allImages.length}</div>
                </>
              )}
            </>
          ) : (
            <div style={{ height: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.3)', gap: '.5rem' }}><div style={{ fontSize: '2rem' }}>📷</div><div style={{ fontSize: '.78rem' }}>No photos yet</div></div>
          )}
          <button onClick={onClose} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,.5)', border: 'none', color: '#fff', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.85rem' }}>✕</button>
          <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', background: 'rgba(0,0,0,.45)', borderRadius: 20, overflow: 'hidden' }}>
            {['view', 'edit'].map(tb => (<button key={tb} onClick={e => { e.stopPropagation(); setTab(tb); setZoomed(false) }} style={{ padding: '4px 14px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', transition: 'all .15s', background: tab === tb ? 'rgba(181,137,58,.9)' : 'transparent', color: tab === tb ? '#111' : 'rgba(255,255,255,.7)' }}>{tb}</button>))}
          </div>
          {allImages.length > 0 && tab === 'edit' && (
            <button onClick={e => { e.stopPropagation(); const url = allImages[Math.min(activeIdx, allImages.length - 1)]; const isEx = activeIdx < existingImgs.length; setEditorTarget({ type: isEx ? 'existing' : 'new', idx: isEx ? activeIdx : activeIdx - existingImgs.length, url }) }}
              style={{ position: 'absolute', bottom: 10, right: 10, background: 'linear-gradient(135deg,rgba(197,166,106,.92),rgba(168,134,61,.92))', border: 'none', color: '#fff', borderRadius: 20, padding: '5px 12px', fontSize: '.7rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '.03em' }}>
              ✨ Edit photo
            </button>
          )}
        </div>
        {allImages.length > 1 && (
          <div style={{ display: 'flex', gap: '.4rem', padding: '.6rem 1rem', overflowX: 'auto', background: '#161412', scrollbarWidth: 'none' }}>
            {allImages.map((img, i) => (<div key={i} onClick={() => setActiveIdx(i)} style={{ width: 46, height: 46, flexShrink: 0, borderRadius: 7, overflow: 'hidden', border: `2px solid ${i === activeIdx ? 'var(--gold)' : 'transparent'}`, cursor: 'pointer', transition: 'border .12s' }}><img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>))}
          </div>
        )}
        {tab === 'view' && (
          <div style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '.5rem' }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.4rem', color: 'var(--ink)', fontWeight: 500 }}>{product.name}</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.35rem', color: 'var(--gold)', flexShrink: 0, marginLeft: '1rem' }}>{formatCurrency(product.price)}</div>
            </div>
            {product.description && <div style={{ fontSize: '.85rem', color: 'var(--ink-2)', lineHeight: 1.65, marginBottom: '.75rem' }}>{product.description}</div>}
            <span className={`badge ${product.stock === 0 ? 'badge-low' : product.stock < 5 ? 'badge-pending' : 'badge-confirmed'}`}>{product.stock === 0 ? 'Out of stock' : `${product.stock} in stock`}</span>
            <div style={{ marginTop: '1rem' }}><button className="btn btn-secondary btn-sm" onClick={() => setTab('edit')}>✏️ Edit this product</button></div>
          </div>
        )}
        {tab === 'edit' && (
          <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
              <div className="field"><label>Name</label><input style={iS} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border-2)'} /></div>
              <div className="field"><label>Price (CAD)</label><input style={iS} type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border-2)'} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '.75rem' }}>
              <div className="field"><label>Stock</label><input style={iS} type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border-2)'} /></div>
              <div className="field"><label>Description</label><input style={iS} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border-2)'} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
              <div className="field"><label>Discount Price <span style={{ fontWeight: 400, color: 'var(--ink-3)' }}>(optional)</span></label><input style={iS} type="number" min="0" value={form.discount_price} onChange={e => setForm(f => ({ ...f, discount_price: e.target.value }))} placeholder="Leave empty for no discount" onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border-2)'} /></div>
              <div className="field">
                <label>Discount Ends <span style={{ fontWeight: 400, color: 'var(--ink-3)' }}>(optional)</span></label>
                <input style={iS} type="datetime-local" value={form.discount_ends_at} onChange={e => setForm(f => ({ ...f, discount_ends_at: e.target.value }))} onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border-2)'} />
                <span style={{ fontSize: '.68rem', color: 'var(--ink-3)', marginTop: '.2rem', display: 'block' }}>Leave empty for permanent discount</span>
              </div>
            </div>
            {existingImgs.length > 0 && (
              <div>
                <div style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.5rem' }}>Current photos — click ✕ to remove</div>
                <div style={{ display: 'flex', gap: '.45rem', flexWrap: 'wrap' }}>
                  {existingImgs.map((img, i) => (<div key={i} style={{ position: 'relative', width: 68, height: 68, borderRadius: 9, overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}><img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /><button type="button" onClick={() => { setExistingImgs(prev => prev.filter((_, idx) => idx !== i)); if (activeIdx >= allImages.length - 1) setActiveIdx(0) }} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(192,57,43,.85)', border: 'none', color: '#fff', width: 18, height: 18, borderRadius: '50%', cursor: 'pointer', fontSize: '.58rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button></div>))}
                </div>
              </div>
            )}
            <div>
              <div style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.5rem' }}>Add more photos</div>
              <label style={{ display: 'block', border: '2px dashed var(--border-2)', borderRadius: 12, padding: '1rem', textAlign: 'center', cursor: 'pointer', transition: 'all .15s', background: 'var(--bg)' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-2)'}>
                <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleNewImages} />
                <div style={{ fontSize: '1.1rem', marginBottom: '.2rem' }}>📷</div>
                <div style={{ fontSize: '.78rem', color: 'var(--ink-2)' }}>{uploading ? 'Uploading…' : 'Click to add photos'}</div>
              </label>
              {newImgs.filter(f => f.url).length > 0 && (<div style={{ display: 'flex', gap: '.45rem', flexWrap: 'wrap', marginTop: '.5rem' }}>{newImgs.filter(f => f.url).map((img, i) => (<div key={i} style={{ position: 'relative', width: 68, height: 68, borderRadius: 9, overflow: 'hidden', border: '1px solid rgba(46,125,82,.3)', flexShrink: 0 }}><img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /><button type="button" onClick={() => setNewImgs(prev => prev.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: 2, right: 2, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', fontSize: '.85rem', padding: '2px' }}>✕</button></div>))}</div>)}
            </div>
            <div style={{ display: 'flex', gap: '.6rem', paddingTop: '.25rem' }}>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '.7rem' }} onClick={save} disabled={saving || uploading}>{saving ? 'Saving…' : 'Save changes'}</button>
              {!confirmDelete
                ? <button className="btn btn-xs" style={{ color: 'var(--red)', border: '1px solid rgba(192,57,43,.25)', background: 'var(--surface)', padding: '.4rem .9rem' }} onClick={() => setConfirmDelete(true)}>Delete</button>
                : <button className="btn btn-xs" style={{ color: '#fff', background: 'var(--red)', border: 'none', padding: '.4rem .9rem' }} onClick={handleDelete}>Confirm delete</button>}
            </div>
          </div>
        )}
      </div>
      {editorTarget && (
        <ImageEditorModal imageUrl={editorTarget.url} workspaceId={workspaceId} productName={product.name}
          onSave={newUrl => {
            if (editorTarget.type === 'existing') setExistingImgs(prev => prev.map((img, i) => i === editorTarget.idx ? { url: newUrl, preview: newUrl } : img))
            else setNewImgs(prev => prev.map((img, i) => i === editorTarget.idx ? { ...img, url: newUrl, preview: newUrl } : img))
            setEditorTarget(null); toast('Photo saved.')
          }}
          onClose={() => setEditorTarget(null)} toast={toast} />
      )}
    </div>
  )
}

// ── PRODUCTS SECTION ──────────────────────────────────────────────────────────
export default function ProductsSection() {
  const { workspace, subscription } = useWorkspaceContext()
  const toast = useToast()
  const { data, refresh } = useProducts(workspace?.id)
  const [addMode, setAddMode] = useState(false)
  const [form, setForm] = useState({ name: '', price: '', stock: '', description: '', discount_price: '', discount_ends_at: '' })
  const [pendingImgs, setPendingImgs] = useState([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState(new Set())
  const [showDotMenu, setShowDotMenu] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editorTarget, setEditorTarget] = useState(null)
  const fileInputRef = useRef(null)
  // Optimistic local override for featured_product_id
  const [localFeaturedId, setLocalFeaturedId] = useState(undefined)
  const featuredId = localFeaturedId !== undefined ? localFeaturedId : workspace?.featured_product_id

  if (!canAccess(subscription, 'products')) return <UpgradeGate feature="products" />

  async function handleSetFeatured(e, productId) {
    e.stopPropagation()
    const next = featuredId === productId ? null : productId
    setLocalFeaturedId(next)
    const { error } = await setFeaturedProduct(workspace.id, next)
    if (error) { toast('Could not update featured product.'); setLocalFeaturedId(undefined) }
    else refresh()
  }

  function enterSelectMode() { setSelectMode(true); setSelected(new Set()); setShowDotMenu(false) }
  function exitSelectMode() { setSelectMode(false); setSelected(new Set()) }
  function toggleSelect(id) { setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n }) }

  async function handleDeleteSelected() {
    if (!selected.size) return; setDeleting(true)
    await deleteProducts([...selected])
    toast(`${selected.size} product${selected.size > 1 ? 's' : ''} deleted.`); setDeleting(false); exitSelectMode(); refresh()
  }

  async function handleImageSelect(e) {
    const files = [...e.target.files]; if (!files.length) return; setUploading(true)
    const results = await uploadProductImages(files, workspace.id)
    const failed = results.filter(r => r.error); if (failed.length > 0) toast(`Upload failed: ${failed[0].error}`)
    setPendingImgs(prev => [...prev, ...results]); setUploading(false)
  }

  async function add(e) {
    e.preventDefault(); setSaving(true)
    const imageUrls = pendingImgs.filter(p => p.url).map(p => p.url)
    await insertProduct({ workspaceId: workspace.id, name: form.name, price: form.price, stock: form.stock, description: form.description, images: imageUrls, discount_price: form.discount_price || null, discount_ends_at: form.discount_ends_at || null })
    toast(`${form.name} added.`); setForm({ name: '', price: '', stock: '', description: '', discount_price: '', discount_ends_at: '' }); setPendingImgs([]); setSaving(false); setAddMode(false); refresh()
  }

  const iS = { width: '100%', padding: '.6rem .85rem', border: '1px solid var(--border-2)', borderRadius: 9, fontSize: '.85rem', fontFamily: 'inherit', color: 'var(--ink)', background: 'var(--surface)', outline: 'none', transition: 'border .15s' }

  if (addMode) return (
    <div>
      <div className="page-head">
        <div>
          <button className="settings-back-btn" onClick={() => { setAddMode(false); setForm({ name: '', price: '', stock: '', description: '' }); setPendingImgs([]) }}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" width="13" height="13"><path d="M10 3L5 8l5 5" /></svg> Products
          </button>
          <div className="page-title" style={{ marginTop: '.4rem' }}>New product</div>
        </div>
      </div>
      <div className="card">
        <form onSubmit={add} className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="field"><label>Product name</label>
              <input style={iS} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Moisture Serum" required
                onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border-2)'} /></div>
            <div className="field"><label>Price (CAD)</label>
              <input style={iS} type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="28" required
                onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border-2)'} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="field"><label>Discount Price <span style={{ fontWeight: 400, color: 'var(--ink-3)' }}>(optional)</span></label>
              <input style={iS} type="number" min="0" value={form.discount_price} onChange={e => setForm(f => ({ ...f, discount_price: e.target.value }))} placeholder="Leave empty for no discount"
                onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border-2)'} /></div>
            <div className="field">
              <label>Discount Ends <span style={{ fontWeight: 400, color: 'var(--ink-3)' }}>(optional)</span></label>
              <input style={iS} type="datetime-local" value={form.discount_ends_at} onChange={e => setForm(f => ({ ...f, discount_ends_at: e.target.value }))}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border-2)'} />
              <span style={{ fontSize: '.68rem', color: 'var(--ink-3)', marginTop: '.2rem', display: 'block' }}>Leave empty for permanent discount</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="field"><label>Stock</label>
              <input style={iS} type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="10"
                onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border-2)'} /></div>
            <div className="field"><label>Description</label>
              <input style={iS} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What it does, key ingredients..."
                onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border-2)'} /></div>
          </div>
          <div>
            <div style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.5rem' }}>Photos</div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageSelect} />
            <button type="button" onClick={() => fileInputRef.current?.click()}
              style={{ width: '100%', border: '2px dashed var(--border-2)', borderRadius: 12, padding: '1.1rem', textAlign: 'center', cursor: 'pointer', transition: 'all .15s', background: 'var(--bg)', fontFamily: 'inherit' }}
              onFocus={e => e.target.style.borderColor = 'var(--gold)'} onBlur={e => e.target.style.borderColor = 'var(--border-2)'}>
              <div style={{ fontSize: '1.3rem', marginBottom: '.2rem' }}>📷</div>
              <div style={{ fontSize: '.78rem', fontWeight: 500, color: 'var(--ink-2)' }}>{uploading ? 'Uploading…' : 'Tap to add photos'}</div>
              <div style={{ fontSize: '.68rem', color: 'var(--ink-3)', marginTop: '.15rem' }}>JPG · PNG · WEBP · tap photo to edit</div>
            </button>
            {pendingImgs.length > 0 && (
              <div style={{ display: 'flex', gap: '.45rem', flexWrap: 'wrap', marginTop: '.65rem' }}>
                {pendingImgs.map((img, i) => (
                  <div key={i} style={{ position: 'relative', width: 72, height: 72, borderRadius: 9, overflow: 'hidden', border: `1px solid ${img.error ? 'var(--red)' : 'var(--border)'}`, background: 'var(--bg)', flexShrink: 0, cursor: img.url ? 'pointer' : 'default' }}
                    onClick={() => img.url && setEditorTarget({ idx: i, url: img.url, preview: img.preview || img.url })}>
                    <img src={img.preview || img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: img.url ? 1 : .5 }} />
                    {!img.url && !img.error && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.6rem', color: 'var(--ink-3)' }}>↑</div>}
                    {img.error && <div style={{ position: 'absolute', inset: 0, background: 'rgba(192,57,43,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.58rem', color: '#fff', fontWeight: 600 }}>Failed</div>}
                    <button type="button" onClick={e => { e.stopPropagation(); setPendingImgs(prev => prev.filter((_, idx) => idx !== i)) }}
                      style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,.6)', border: 'none', color: '#fff', width: 18, height: 18, borderRadius: '50%', cursor: 'pointer', fontSize: '.55rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    {img.url && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', fontSize: '.52rem', color: 'rgba(255,255,255,.85)', fontWeight: 500 }}>Edit</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', padding: '.75rem' }} disabled={saving || uploading}>
            {uploading ? 'Uploading…' : saving ? 'Saving…' : 'Save product'}
          </button>
        </form>
      </div>
      {editorTarget && (
        <ImageEditorModal imageUrl={editorTarget.url} workspaceId={workspace.id} productName={form.name}
          onSave={newUrl => { setPendingImgs(prev => prev.map((img, i) => i === editorTarget.idx ? { ...img, url: newUrl, preview: newUrl } : img)); setEditorTarget(null); toast('Photo saved.') }}
          onClose={() => setEditorTarget(null)} toast={toast} />
      )}
    </div>
  )

  return (
    <div>
      <div className="page-head">
        <div><div className="page-title">Products</div><div className="page-sub">Sell from your profile page</div></div>
        <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', position: 'relative' }}>
          {selectMode ? (
            <>
              <span style={{ fontSize: '.8rem', color: 'var(--ink-3)' }}>{selected.size} selected</span>
              <button className="btn btn-xs" style={{ color: 'var(--red)', border: '1px solid rgba(192,57,43,.25)', background: 'var(--surface)' }} onClick={handleDeleteSelected} disabled={!selected.size || deleting}>{deleting ? 'Deleting…' : `Delete ${selected.size || ''}`}</button>
              <button className="btn btn-secondary btn-sm" onClick={exitSelectMode}>Cancel</button>
            </>
          ) : (
            <>
              <button className="btn btn-primary" onClick={() => setAddMode(true)}>Add product</button>
              <div style={{ position: 'relative' }}>
                <button className="btn btn-secondary btn-sm" style={{ padding: '.35rem .6rem', fontSize: '1rem' }} onClick={() => setShowDotMenu(s => !s)}>⋮</button>
                {showDotMenu && (
                  <><div style={{ position: 'fixed', inset: 0, zIndex: 98 }} onClick={() => setShowDotMenu(false)} />
                    <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.12)', minWidth: 170, zIndex: 99, overflow: 'hidden' }}>
                      <div style={{ padding: '.65rem 1rem', fontSize: '.82rem', color: 'var(--red)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.5rem' }} onClick={enterSelectMode}>☑ Select to delete</div>
                    </div></>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {selectMode && data.length > 0 && (
        <div style={{ background: 'var(--gold-lt)', border: '1px solid var(--gold-dim)', borderRadius: 10, padding: '.65rem 1rem', marginBottom: '1rem', fontSize: '.8rem', color: 'var(--ink-2)' }}>
          Tap products to select, then hit Delete.
          <button style={{ marginLeft: '.75rem', fontSize: '.75rem', color: 'var(--gold)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setSelected(new Set(data.map(p => p.id)))}>Select all ({data.length})</button>
        </div>
      )}

      <div className="grid-3">
        {data.length === 0
          ? <div className="card" style={{ gridColumn: '1/-1' }}><div className="empty-state"><div className="empty-icon">{boxIcon}</div><div className="empty-title">No products yet</div><div className="empty-sub">Add products to sell on your profile.</div></div></div>
          : data.map(p => {
            const imgs = p.images || [], isSelected = selected.has(p.id)
            return (
              <div key={p.id} className="prod-card" onClick={() => selectMode ? toggleSelect(p.id) : setEditProduct(p)}
                style={{ cursor: 'pointer', position: 'relative', outline: isSelected ? '2.5px solid var(--gold)' : 'none', transition: 'outline .12s' }}>
                {selectMode && (<div style={{ position: 'absolute', top: 8, left: 8, zIndex: 2, width: 22, height: 22, borderRadius: 6, border: `2px solid ${isSelected ? 'var(--gold)' : 'rgba(255,255,255,.7)'}`, background: isSelected ? 'var(--gold)' : 'rgba(0,0,0,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .12s' }}>{isSelected && <svg viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.5" width="10" height="10"><polyline points="1.5,5 4,7.5 8.5,2.5" /></svg>}</div>)}
              {!selectMode && (
                <button
                  onClick={e => handleSetFeatured(e, p.id)}
                  title={featuredId === p.id ? 'Remove from featured' : 'Set as featured'}
                  style={{
                    position: 'absolute', top: 8, right: 8, zIndex: 2,
                    width: 28, height: 28, borderRadius: '50%',
                    border: featuredId === p.id ? 'none' : '1px solid var(--border)',
                    background: featuredId === p.id ? 'var(--gold)' : 'transparent',
                    color: featuredId === p.id ? '#fff' : 'var(--ink-3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all .2s ease', padding: 0,
                  }}
                >
                  <svg viewBox="0 0 16 16" width="12" height="12"
                    fill={featuredId === p.id ? 'currentColor' : 'none'}
                    stroke="currentColor" strokeWidth={featuredId === p.id ? '0' : '1.5'}>
                    <path d="M8 1l1.8 4.5H15l-4.2 3 1.6 4.8L8 10.8l-4.4 2.5 1.6-4.8L1 6.5h5.2z"/>
                  </svg>
                </button>
              )}
                <div className="prod-img" style={{ position: 'relative', overflow: 'hidden', background: 'var(--bg)' }}>
                  {imgs.length > 0
                    ? <img src={imgs[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .3s', filter: isSelected ? 'brightness(.8)' : 'none' }} onMouseEnter={e => { if (!selectMode) e.currentTarget.style.transform = 'scale(1.06)' }} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '.3rem' }}><span style={{ fontSize: '1.5rem' }}>📷</span><span style={{ fontSize: '.65rem', color: 'var(--ink-3)' }}>Add photos</span></div>}
                  {imgs.length > 1 && <div style={{ position: 'absolute', bottom: 5, right: 6, background: 'rgba(0,0,0,.5)', color: '#fff', fontSize: '.6rem', padding: '1px 6px', borderRadius: 20 }}>+{imgs.length - 1}</div>}
                  {isSaleActive(p) && <div className="prod-sale-badge">SALE</div>}
                </div>
                <div className="prod-body">
                  <div className="prod-name">{p.name}</div>
                  <div className="prod-price">{formatCurrency(p.price)}</div>
                  <span className={`badge ${p.stock === 0 ? 'badge-low' : p.stock < 5 ? 'badge-pending' : 'badge-confirmed'}`}>{p.stock === 0 ? 'Out of stock' : `${p.stock} in stock`}</span>
                </div>
              </div>
            )
          })}
      </div>

      {editProduct && !selectMode && (
        <ProductEditModal product={editProduct} workspaceId={workspace.id} onClose={() => setEditProduct(null)} onSaved={refresh} onDeleted={refresh} toast={toast} />
      )}
    </div>
  )
}
