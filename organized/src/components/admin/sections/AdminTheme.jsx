import { useState } from 'react'
import { SecHd, Card, Toast, useToast } from '../AdminShared'

const THEMES = [
  { id: 'warm',    label: 'Warm Gold',    sub: 'Current — caramel & ivory',  cls: 'x-pw' },
  { id: 'dark',    label: 'Midnight Gold', sub: 'Deep black & gold',          cls: 'x-pdk' },
  { id: 'cream',   label: 'Clean Cream',  sub: 'Off-white & black',          cls: 'x-pcr' },
  { id: 'purple',  label: 'Velvet Purple', sub: 'Pro — plum & violet',       cls: 'x-ppu' },
  { id: 'slate',   label: 'Ocean Slate',  sub: 'Pro — slate & sky',          cls: 'x-psl' },
  { id: 'forest',  label: 'Forest Sage',  sub: 'Pro — forest & green',       cls: 'x-pfr' },
]

const SWATCHES = ['#C9A84C', '#a855f7', '#ec4899', '#ef4444', '#f97316', '#22c55e', '#3b82f6', '#14b8a6']

export default function AdminTheme() {
  const [activeTheme, setActiveTheme] = useState('warm')
  const [activeSwatch, setActiveSwatch] = useState('#C9A84C')
  const [hexInput, setHexInput] = useState('#C9A84C')
  const [activeFont, setActiveFont] = useState(0)
  const [toggles, setToggles] = useState([true, true, false, true, true])
  const { toastMsg, showToast } = useToast()

  function toggleItem(i) {
    setToggles(t => { const n = [...t]; n[i] = !n[i]; return n })
    showToast(toggles[i] ? 'Option disabled' : 'Option enabled')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Card>
        <SecHd title="Preset Theme" right={<button className="x-btn-ghost" onClick={() => showToast('Preview applied')}>Preview →</button>} />
        <div className="x-theme-grid">
          {THEMES.map(t => (
            <div key={t.id} className={`x-tc${activeTheme === t.id ? ' sel' : ''}`} onClick={() => { setActiveTheme(t.id); showToast(`Theme "${t.label}" applied`) }}>
              <div className={`x-tp ${t.cls}`}>
                <div className="x-mb2" />
                <div className="x-mbl"><div className="x-mc" /><div className="x-mc" /><div className="x-mc" /></div>
              </div>
              <div className="x-ti">
                <div className="x-tn">{t.label}</div>
                <div className="x-td2">{t.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="x-g2">
        <Card>
          <div className="x-sec-title" style={{ marginBottom: 0 }}>Accent Color</div>
          <div className="x-sw-row">
            {SWATCHES.map(c => (
              <div key={c} className={`x-sw${activeSwatch === c ? ' sel' : ''}`} style={{ background: c }} onClick={() => { setActiveSwatch(c); setHexInput(c) }} />
            ))}
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Custom hex</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: /^#[0-9A-Fa-f]{6}$/.test(hexInput) ? hexInput : activeSwatch, border: '1px solid var(--border2)', flexShrink: 0 }} />
              <input
                type="text"
                value={hexInput}
                style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '7px 10px', fontFamily: 'DM Mono,monospace', fontSize: 11, color: 'var(--muted2)', outline: 'none' }}
                onChange={e => setHexInput(e.target.value)}
              />
              <button className="x-btn-ghost" onClick={() => showToast('Color applied!')}>Apply</button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="x-sec-title" style={{ marginBottom: 0 }}>Typography</div>
          <div className="x-fopts">
            {[
              { sample: 'Organized.', style: { fontFamily: 'Cormorant Garamond, serif' }, name: 'Cormorant — Current' },
              { sample: 'Organized.', style: { fontFamily: 'DM Sans, sans-serif', fontSize: 16 }, name: 'DM Sans — Modern' },
              { sample: 'Organized.', style: { fontFamily: 'Georgia, serif' }, name: 'Georgia — Classic' },
            ].map((f, i) => (
              <div key={i} className={`x-fopt${activeFont === i ? ' sel' : ''}`} onClick={() => { setActiveFont(i); showToast('Font applied') }}>
                <div className="x-fsample" style={f.style}>{f.sample}</div>
                <div className="x-fname">{f.name}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="x-sec-title" style={{ marginBottom: 14 }}>Display Options</div>
        {[
          { label: 'Bible verse — Coach section', sub: 'Automatic rotation each day' },
          { label: 'Organic wave animation', sub: 'Background on client booking page' },
          { label: 'Dark mode — Pro dashboard', sub: 'Disabled by default' },
          { label: 'Organized. branding on booking page', sub: 'Disableable on Pro by user' },
          { label: 'CoachSlider active', sub: 'Auto insights in dashboard' },
        ].map((item, i) => (
          <div key={i} className="x-trow">
            <div style={{ flex: 1 }}>
              <div className="x-tlbl">{item.label}</div>
              <div className="x-tsub">{item.sub}</div>
            </div>
            <div className={`x-tog ${toggles[i] ? 'on' : 'off'}`} onClick={() => toggleItem(i)}>
              <div className="x-tok" />
            </div>
          </div>
        ))}
      </Card>

      <Toast msg={toastMsg} />
    </div>
  )
}
