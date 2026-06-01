import { useState, useEffect } from 'react'
import { SecHd, Card, Toast, useToast } from '../AdminShared'

const THEMES = [
  { id: 'warm',   label: 'Warm Gold',     sub: 'Current — caramel & ivory',  cls: 'x-pw' },
  { id: 'dark',   label: 'Midnight Gold', sub: 'Deep black & gold',          cls: 'x-pdk' },
  { id: 'cream',  label: 'Clean Cream',   sub: 'Off-white & black',          cls: 'x-pcr' },
  { id: 'purple', label: 'Velvet Purple', sub: 'Pro — plum & violet',        cls: 'x-ppu' },
  { id: 'slate',  label: 'Ocean Slate',   sub: 'Pro — slate & sky',          cls: 'x-psl' },
  { id: 'forest', label: 'Forest Sage',   sub: 'Pro — forest & green',       cls: 'x-pfr' },
]

const THEME_VARS = {
  warm:   { '--bg': '#0a0805', '--surface': '#120e08', '--surface2': '#1a1510', '--border': 'rgba(201,168,76,0.12)', '--border2': 'rgba(201,168,76,0.2)', '--gold': '#C9A84C', '--gold-dim': '#a8893d', '--white': '#f5efe0', '--muted2': '#b8a882', '--muted': '#7a6e58' },
  dark:   { '--bg': '#080808', '--surface': '#101010', '--surface2': '#181818', '--border': 'rgba(201,168,76,0.1)', '--border2': 'rgba(201,168,76,0.18)', '--gold': '#C9A84C', '--gold-dim': '#a8893d', '--white': '#f0f0f0', '--muted2': '#aaaaaa', '--muted': '#666666' },
  cream:  { '--bg': '#f8f4ec', '--surface': '#fffdf7', '--surface2': '#f0ece4', '--border': 'rgba(0,0,0,0.08)', '--border2': 'rgba(0,0,0,0.14)', '--gold': '#1a1a1a', '--gold-dim': '#444444', '--white': '#111111', '--muted2': '#555555', '--muted': '#999999' },
  purple: { '--bg': '#0d0810', '--surface': '#130c18', '--surface2': '#1c1222', '--border': 'rgba(168,85,247,0.12)', '--border2': 'rgba(168,85,247,0.22)', '--gold': '#a855f7', '--gold-dim': '#8b3fd6', '--white': '#f3eeff', '--muted2': '#c4a8e8', '--muted': '#7a6499' },
  slate:  { '--bg': '#080c10', '--surface': '#0e1318', '--surface2': '#141b22', '--border': 'rgba(56,189,248,0.1)', '--border2': 'rgba(56,189,248,0.18)', '--gold': '#38bdf8', '--gold-dim': '#0ea5e9', '--white': '#e0f4ff', '--muted2': '#94c8e0', '--muted': '#4a7a96' },
  forest: { '--bg': '#060a06', '--surface': '#0c120c', '--surface2': '#121a12', '--border': 'rgba(74,222,128,0.1)', '--border2': 'rgba(74,222,128,0.18)', '--gold': '#4ade80', '--gold-dim': '#22c55e', '--white': '#e8f5e8', '--muted2': '#90c890', '--muted': '#4a7a4a' },
}

const FONTS = [
  { name: 'Cormorant — Current', family: '"Cormorant Garamond", serif' },
  { name: 'DM Sans — Modern',    family: '"DM Sans", sans-serif' },
  { name: 'Georgia — Classic',   family: 'Georgia, serif' },
]

const SWATCHES = ['#C9A84C', '#a855f7', '#ec4899', '#ef4444', '#f97316', '#22c55e', '#3b82f6', '#14b8a6']

const STORAGE_KEY = 'admin_theme_prefs'

function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}

function savePrefs(prefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
}

function applyThemeVars(themeId) {
  const vars = THEME_VARS[themeId]
  if (!vars) return
  Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v))
}

function applyGold(hex) {
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return
  document.documentElement.style.setProperty('--gold', hex)
  const dimHex = hex
  document.documentElement.style.setProperty('--gold-dim', dimHex)
}

function applyFont(idx) {
  const family = FONTS[idx]?.family
  if (family) document.documentElement.style.setProperty('--font-serif', family)
}

const TOGGLE_LABELS = [
  { label: 'Bible verse — Coach section', sub: 'Automatic rotation each day' },
  { label: 'Organic wave animation', sub: 'Background on client booking page' },
  { label: 'Dark mode — Pro dashboard', sub: 'Disabled by default' },
  { label: 'Organized. branding on booking page', sub: 'Disableable on Pro by user' },
  { label: 'CoachSlider active', sub: 'Auto insights in dashboard' },
]

export default function AdminTheme() {
  const prefs = loadPrefs()
  const [activeTheme, setActiveTheme] = useState(prefs.theme || 'warm')
  const [activeSwatch, setActiveSwatch] = useState(prefs.swatch || '#C9A84C')
  const [hexInput, setHexInput] = useState(prefs.swatch || '#C9A84C')
  const [activeFont, setActiveFont] = useState(prefs.font ?? 0)
  const [toggles, setToggles] = useState(prefs.toggles || [true, true, false, true, true])
  const { toastMsg, showToast } = useToast()

  useEffect(() => {
    applyThemeVars(activeTheme)
    applyGold(activeSwatch)
    applyFont(activeFont)
  }, [])

  function selectTheme(id) {
    setActiveTheme(id)
    applyThemeVars(id)
    const updated = { ...loadPrefs(), theme: id }
    savePrefs(updated)
    showToast(`Theme "${THEMES.find(t => t.id === id)?.label}" applied`)
  }

  function selectSwatch(hex) {
    setActiveSwatch(hex)
    setHexInput(hex)
    applyGold(hex)
    savePrefs({ ...loadPrefs(), swatch: hex })
  }

  function applyHex() {
    if (!/^#[0-9A-Fa-f]{6}$/.test(hexInput)) { showToast('Invalid hex color'); return }
    setActiveSwatch(hexInput)
    applyGold(hexInput)
    savePrefs({ ...loadPrefs(), swatch: hexInput })
    showToast('Color applied!')
  }

  function selectFont(idx) {
    setActiveFont(idx)
    applyFont(idx)
    savePrefs({ ...loadPrefs(), font: idx })
    showToast('Font applied')
  }

  function toggleItem(i) {
    const next = [...toggles]
    next[i] = !next[i]
    setToggles(next)
    savePrefs({ ...loadPrefs(), toggles: next })
    showToast(next[i] ? 'Option enabled' : 'Option disabled')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Card>
        <SecHd title="Preset Theme" right={<button className="x-btn-ghost" onClick={() => showToast('Preview applied')}>Preview →</button>} />
        <div className="x-theme-grid">
          {THEMES.map(t => (
            <div key={t.id} className={`x-tc${activeTheme === t.id ? ' sel' : ''}`} onClick={() => selectTheme(t.id)}>
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
              <div key={c} className={`x-sw${activeSwatch === c ? ' sel' : ''}`} style={{ background: c }} onClick={() => selectSwatch(c)} />
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
                onKeyDown={e => e.key === 'Enter' && applyHex()}
              />
              <button className="x-btn-ghost" onClick={applyHex}>Apply</button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="x-sec-title" style={{ marginBottom: 0 }}>Typography</div>
          <div className="x-fopts">
            {FONTS.map((f, i) => (
              <div key={i} className={`x-fopt${activeFont === i ? ' sel' : ''}`} onClick={() => selectFont(i)}>
                <div className="x-fsample" style={{ fontFamily: f.family }}>Organized.</div>
                <div className="x-fname">{f.name}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="x-sec-title" style={{ marginBottom: 14 }}>Display Options</div>
        {TOGGLE_LABELS.map((item, i) => (
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
