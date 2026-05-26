import { useState, useEffect } from 'react'
import { getWorkspaceSettings, upsertWorkspaceSettings } from '../api/workspaceSettings'

const CARRIERS = ['Canada Post', 'Purolator', 'UPS', 'FedEx']

export default function ShippingSection({ workspace, toast }) {
  const [carriers,   setCarriers]   = useState([])
  const [threshold,  setThreshold]  = useState(0)
  const [days,       setDays]       = useState(2)
  const [saving,     setSaving]     = useState(false)

  useEffect(() => {
    if (!workspace?.id) return
    getWorkspaceSettings(workspace.id).then(({ data }) => {
      if (!data) return
      if (data.preferred_carriers) {
        try { setCarriers(JSON.parse(data.preferred_carriers)) } catch {}
      }
      if (data.free_shipping_threshold != null) setThreshold(Number(data.free_shipping_threshold))
      if (data.processing_days != null) setDays(Number(data.processing_days))
    })
  }, [workspace?.id])

  function toggleCarrier(c) {
    setCarriers(cs => cs.includes(c) ? cs.filter(x => x !== c) : [...cs, c])
  }

  async function save() {
    if (!workspace?.id) return
    setSaving(true)
    await upsertWorkspaceSettings(workspace.id, {
      preferred_carriers: JSON.stringify(carriers),
      free_shipping_threshold: threshold,
      processing_days: days,
    })
    setSaving(false)
    toast('Shipping settings saved.')
  }

  const nS = { height: 36, borderRadius: 8, border: '1px solid var(--border-2)', padding: '0 .75rem', fontSize: '.85rem', fontFamily: 'inherit', background: 'var(--surface)', color: 'var(--ink)', outline: 'none', width: 90 }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Shipping Setup</div>
          <div className="page-sub">Carriers, thresholds and processing time</div>
        </div>
      </div>

      {/* Card 1 — Carriers */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-head">
          <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.08em' }}>DEFAULT CARRIERS</div>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {CARRIERS.map((c, i) => (
            <div key={c} className="settings-row" style={{ borderBottom: i < CARRIERS.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div className="settings-row-label">{c}</div>
              <label className="toggle-wrap">
                <input type="checkbox" checked={carriers.includes(c)} onChange={() => toggleCarrier(c)} />
                <div className="toggle-track" /><div className="toggle-thumb" />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Card 2 — Free shipping threshold */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-head">
          <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.08em' }}>FREE SHIPPING THRESHOLD</div>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
            <span style={{ fontSize: '.85rem', color: 'var(--ink-2)' }}>$</span>
            <input type="number" min="0" style={nS} value={threshold} onChange={e => setThreshold(Number(e.target.value))} />
            <span style={{ fontSize: '.78rem', color: 'var(--ink-3)' }}>Set 0 to disable</span>
          </div>
        </div>
      </div>

      {/* Card 3 — Processing time */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-head">
          <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.08em' }}>PROCESSING TIME</div>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
            <input type="number" min="1" style={nS} value={days} onChange={e => setDays(Number(e.target.value))} />
            <span style={{ fontSize: '.78rem', color: 'var(--ink-3)' }}>business days before shipping</span>
          </div>
        </div>
      </div>

      <button className="btn btn-primary" style={{ justifyContent: 'center', padding: '.75rem', width: '100%' }} onClick={save} disabled={saving}>
        {saving ? 'Saving…' : 'Save shipping settings'}
      </button>
    </div>
  )
}
