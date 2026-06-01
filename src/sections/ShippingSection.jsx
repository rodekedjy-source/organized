import { useState, useEffect } from 'react'
import { getWorkspaceSettings, upsertWorkspaceSettings } from '../api/workspaceSettings'

export default function ShippingSection({ workspace, toast }) {
  const [days,    setDays]    = useState(2)
  const [thresh,  setThresh]  = useState(0)
  const [carrier, setCarrier] = useState('')
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    if (!workspace?.id) return
    getWorkspaceSettings(workspace.id).then(({ data }) => {
      if (!data) return
      if (data.processing_days != null)         setDays(Number(data.processing_days))
      if (data.free_shipping_threshold != null)  setThresh(Number(data.free_shipping_threshold))
      if (data.custom_carrier)                   setCarrier(data.custom_carrier)
    })
  }, [workspace?.id])

  async function save() {
    if (!workspace?.id) return
    setSaving(true)
    await upsertWorkspaceSettings(workspace.id, {
      processing_days: days,
      free_shipping_threshold: thresh,
      custom_carrier: carrier.trim(),
    })
    setSaving(false)
    toast('Shipping settings saved.')
  }

  const lbl = { fontSize: '.65rem', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.08em' }
  const sub = { fontSize: '.75rem', color: 'var(--ink-3)', marginTop: 2, marginBottom: '.75rem' }
  const nS  = { height: 36, borderRadius: 8, border: '1px solid var(--border-2)', padding: '0 .75rem', fontSize: '.85rem', fontFamily: 'inherit', background: 'var(--surface)', color: 'var(--ink)', outline: 'none', width: 80 }
  const tS  = { ...nS, width: '100%', boxSizing: 'border-box' }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Shipping Setup</div>
          <div className="page-sub">Processing time, free shipping & carrier options</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-body">
          <div style={lbl}>PROCESSING TIME</div>
          <div style={sub}>Shown to clients before they checkout</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
            <input type="number" min="1" style={nS} value={days} onChange={e => setDays(Number(e.target.value))} />
            <span style={{ fontSize: '.78rem', color: 'var(--ink-3)' }}>business days before shipping</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-body">
          <div style={lbl}>FREE SHIPPING</div>
          <div style={sub}>Clients see free shipping badge above this amount</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
            <span style={{ fontSize: '.85rem', color: 'var(--ink-2)' }}>$</span>
            <input type="number" min="0" style={nS} value={thresh} onChange={e => setThresh(Number(e.target.value))} />
            <span style={{ fontSize: '.78rem', color: 'var(--ink-3)' }}>Set 0 to disable</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-body">
          <div style={lbl}>OTHER CARRIER</div>
          <div style={sub}>If you use a carrier not listed, enter it here — it will appear when marking an order as shipped</div>
          <input type="text" style={tS} value={carrier} onChange={e => setCarrier(e.target.value)} placeholder="e.g. DHL, Postes Canada, local courier" />
        </div>
      </div>

      <button className="btn btn-primary" style={{ justifyContent: 'center', padding: '.75rem', width: '100%' }} onClick={save} disabled={saving}>
        {saving ? 'Saving…' : 'Save shipping settings'}
      </button>
    </div>
  )
}
