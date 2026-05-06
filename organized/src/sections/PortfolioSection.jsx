import { useState, useEffect, useRef } from 'react'
import { useWorkspaceContext } from '../contexts/WorkspaceContext'
import { useToast } from '../contexts/ToastContext'
import { usePortfolio } from '../hooks/usePortfolio'
import {
  uploadPortfolioFile,
  insertPortfolioPhoto,
  deletePortfolioPhoto,
  deletePortfolioFile,
} from '../api/portfolio'

export default function PortfolioSection() {
  const { workspace } = useWorkspaceContext()
  const toast = useToast()
  const { photos, refresh } = usePortfolio(workspace?.id)
  const [uploading, setUploading] = useState(false)
  const [lightbox, setLightbox] = useState(null)
  const touchStartX = useRef(null)

  async function handleUpload(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    for (const file of files) {
      try {
        const { publicUrl } = await uploadPortfolioFile(workspace.id, file)
        await insertPortfolioPhoto(workspace.id, publicUrl, photos.length)
      } catch (err) {
        toast('Upload failed: ' + err.message)
      }
    }
    toast(files.length + ' photo' + (files.length > 1 ? 's' : '') + ' uploaded.')
    setUploading(false)
    refresh()
  }

  async function remove(ph, e) {
    e.stopPropagation()
    await deletePortfolioFile(ph.url)
    await deletePortfolioPhoto(ph.id)
    toast('Photo removed.')
    if (lightbox !== null) {
      if (photos.length <= 1) setLightbox(null)
      else setLightbox(Math.min(lightbox, photos.length - 2))
    }
    refresh()
  }

  function prev() { setLightbox(i => i > 0 ? i - 1 : photos.length - 1) }
  function next() { setLightbox(i => i < photos.length - 1 ? i + 1 : 0) }

  function onTouchStart(e) { touchStartX.current = e.touches[0].clientX }
  function onTouchEnd(e) {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 40) { dx < 0 ? next() : prev() }
    touchStartX.current = null
  }

  useEffect(() => {
    if (lightbox === null) return
    function onKey(e) {
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, photos.length])

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Portfolio</div>
          <div className="page-sub">Photos shown on your public client page</div>
        </div>
        <label style={{ background: 'var(--gold)', color: 'var(--ink)', border: 'none', borderRadius: 10, padding: '.5rem 1rem', fontSize: '.82rem', fontWeight: 600, cursor: 'pointer', opacity: uploading ? 0.6 : 1, display: 'inline-block' }}>
          {uploading ? 'Uploading…' : '+ Upload photos'}
          <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {photos.length === 0
        ? <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '.85rem', color: 'var(--ink-3)' }}>No photos yet. Upload some to showcase your work.</div>
          </div>
        : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 10 }}>
            {photos.map((ph, i) => (
              <div key={ph.id}
                style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '1', background: 'var(--bg)', cursor: 'pointer' }}
                onClick={() => setLightbox(i)}>
                <img src={ph.url} alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .3s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                <button
                  onClick={e => remove(ph, e)}
                  style={{ position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,0,0,.6)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                  ×
                </button>
              </div>
            ))}
          </div>
      }

      {lightbox !== null && photos[lightbox] && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.92)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setLightbox(null)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}>

          <button onClick={() => setLightbox(null)}
            style={{ position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,.12)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
            ×
          </button>

          <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', fontSize: '.75rem', color: 'rgba(255,255,255,.5)', letterSpacing: '.08em', zIndex: 2 }}>
            {lightbox + 1} / {photos.length}
          </div>

          {photos.length > 1 && (
            <button onClick={e => { e.stopPropagation(); prev() }}
              style={{ position: 'absolute', left: 12, width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,.12)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, backdropFilter: 'blur(4px)' }}>
              ‹
            </button>
          )}

          <img
            src={photos[lightbox].url}
            alt=""
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '92vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 8, boxShadow: '0 8px 48px rgba(0,0,0,.6)', userSelect: 'none' }}
          />

          {photos.length > 1 && (
            <button onClick={e => { e.stopPropagation(); next() }}
              style={{ position: 'absolute', right: 12, width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,.12)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, backdropFilter: 'blur(4px)' }}>
              ›
            </button>
          )}

          {photos.length > 1 && (
            <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 2 }}>
              {photos.map((_, i) => (
                <div key={i}
                  onClick={e => { e.stopPropagation(); setLightbox(i) }}
                  style={{ width: i === lightbox ? 20 : 6, height: 6, borderRadius: 3, background: i === lightbox ? 'var(--gold)' : 'rgba(255,255,255,.35)', transition: 'all .2s', cursor: 'pointer' }} />
              ))}
            </div>
          )}

          <button onClick={e => { e.stopPropagation(); remove(photos[lightbox], e) }}
            style={{ position: 'absolute', bottom: 20, right: 16, background: 'rgba(192,57,43,.8)', color: '#fff', border: 'none', borderRadius: 8, padding: '.45rem .9rem', fontSize: '.78rem', cursor: 'pointer', fontFamily: 'inherit', zIndex: 2, backdropFilter: 'blur(4px)' }}>
            Delete photo
          </button>
        </div>
      )}
    </div>
  )
}
