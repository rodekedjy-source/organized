// Shared CSS, helpers, and primitive components for the Founder Console

export const ADMIN_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-font-smoothing: antialiased; }

  .x-wrap { font-family: 'DM Sans', sans-serif; background: #0f0e0c; min-height: 100vh; color: #f0ece4; display: flex; }

  /* SIDEBAR */
  .x-sidebar {
    width: 210px; min-height: 100vh; background: #0d0c0a;
    border-right: 1px solid rgba(255,255,255,.055);
    display: flex; flex-direction: column;
    position: sticky; top: 0; height: 100vh; overflow-y: auto; flex-shrink: 0;
  }
  .x-logo-wrap { padding: 1.3rem 1.2rem 1rem; border-bottom: 1px solid rgba(255,255,255,.05); }
  .x-logo { font-family: 'Playfair Display', serif; font-size: 1rem; letter-spacing: -.01em; }
  .x-logo span { color: #b5893a; }
  .x-logo-badge {
    display: inline-block; margin-top: .35rem;
    font-size: .52rem; font-weight: 500; letter-spacing: .1em; text-transform: uppercase;
    background: rgba(181,137,58,.1); border: 1px solid rgba(181,137,58,.2); color: #b5893a;
    padding: .16rem .45rem; border-radius: 20px;
  }
  .x-nav { flex: 1; padding: .75rem 0; }
  .x-nav-label {
    font-size: .52rem; font-weight: 500; letter-spacing: .1em; text-transform: uppercase;
    color: rgba(240,236,228,.18); padding: .6rem 1.2rem .25rem;
  }
  .x-nav-item {
    display: flex; align-items: center; gap: .6rem;
    padding: .55rem 1.2rem; font-size: .78rem; font-weight: 300;
    color: rgba(240,236,228,.38); cursor: pointer; border: none; background: none;
    font-family: inherit; width: 100%; text-align: left; transition: all .15s;
    border-left: 2px solid transparent;
  }
  .x-nav-item:hover { color: rgba(240,236,228,.7); background: rgba(255,255,255,.025); }
  .x-nav-item.active { color: #f0ece4; background: rgba(181,137,58,.07); border-left-color: #b5893a; }
  .x-nav-item svg { width: 13px; height: 13px; flex-shrink: 0; opacity: .7; }
  .x-nav-item.active svg { opacity: 1; }
  .x-sidebar-foot { padding: 1rem 1.2rem; border-top: 1px solid rgba(255,255,255,.05); }
  .x-user-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; display: inline-block; margin-right: .4rem; }

  /* MAIN */
  .x-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .x-topbar {
    height: 52px; display: flex; align-items: center; justify-content: space-between;
    padding: 0 2rem; border-bottom: 1px solid rgba(255,255,255,.055);
    position: sticky; top: 0; z-index: 40;
    background: rgba(15,14,12,.96); backdrop-filter: blur(16px);
  }
  .x-topbar-title { font-size: .72rem; font-weight: 400; letter-spacing: .04em; color: rgba(240,236,228,.4); }
  .x-topbar-r { display: flex; align-items: center; gap: .8rem; }

  /* CONTENT */
  .x-content { padding: 2rem 2.5rem 5rem; max-width: 1100px; }

  /* SECTION HEAD */
  .x-head { margin-bottom: 2rem; }
  .x-head-tag { font-size: .6rem; letter-spacing: .12em; text-transform: uppercase; color: #b5893a; font-weight: 500; margin-bottom: .4rem; }
  .x-head h2 { font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 500; letter-spacing: -.02em; }
  .x-head-sub { font-size: .74rem; color: rgba(240,236,228,.2); margin-top: .3rem; font-weight: 300; }

  /* GHOST BUTTON */
  .x-ghost {
    font-size: .68rem; color: rgba(240,236,228,.28); cursor: pointer;
    background: none; border: none; font-family: inherit; transition: color .2s;
    letter-spacing: .04em; text-transform: uppercase;
    display: flex; align-items: center; gap: .3rem;
  }
  .x-ghost:hover { color: rgba(240,236,228,.6); }
  .x-ghost svg { width: 12px; height: 12px; }
  .x-ghost.spin svg { animation: x-spin .7s linear infinite; }

  /* GOLD BUTTON */
  .x-btn {
    background: #b5893a; color: #0f0e0c; border: none; border-radius: 6px;
    padding: .45rem 1rem; font-size: .76rem; font-weight: 500;
    cursor: pointer; font-family: inherit; transition: background .2s;
    display: flex; align-items: center; gap: .4rem;
  }
  .x-btn:hover { background: #c49a45; }
  .x-btn:disabled { opacity: .5; cursor: not-allowed; }
  .x-btn-outline {
    background: none; border: 1px solid rgba(255,255,255,.1);
    color: rgba(240,236,228,.5); border-radius: 6px;
    padding: .45rem 1rem; font-size: .76rem;
    cursor: pointer; font-family: inherit; transition: all .2s;
  }
  .x-btn-outline:hover { border-color: rgba(255,255,255,.2); color: rgba(240,236,228,.8); }

  /* KPI GRID */
  .x-kpi-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 1px; background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.055); border-radius: 12px;
    overflow: hidden; margin-bottom: 2rem;
  }
  .x-kpi { background: #161512; padding: 1.3rem 1.2rem; position: relative; }
  .x-kpi-dot { position: absolute; top: 1rem; right: 1rem; width: 5px; height: 5px; background: #b5893a; border-radius: 50%; opacity: .35; }
  .x-kpi-lbl { font-size: .6rem; letter-spacing: .08em; text-transform: uppercase; color: rgba(240,236,228,.25); font-weight: 500; margin-bottom: .5rem; }
  .x-kpi-val { font-size: 1.75rem; font-weight: 300; line-height: 1; letter-spacing: -.03em; font-family: 'Playfair Display', serif; }
  .x-kpi-val.gold { color: #b5893a; }
  .x-kpi-sub { font-size: .6rem; color: rgba(240,236,228,.15); margin-top: .35rem; font-weight: 300; }

  /* CARD */
  .x-card { background: #161512; border: 1px solid rgba(255,255,255,.055); border-radius: 10px; overflow: hidden; margin-bottom: 1.5rem; }
  .x-card-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: .9rem 1.2rem; border-bottom: 1px solid rgba(255,255,255,.045);
  }
  .x-card-title { font-size: .62rem; letter-spacing: .1em; text-transform: uppercase; color: rgba(240,236,228,.3); font-weight: 500; }
  .x-card-meta { font-size: .6rem; color: rgba(240,236,228,.15); }

  /* TABLE */
  .x-table { width: 100%; border-collapse: collapse; }
  .x-table th {
    font-size: .57rem; letter-spacing: .07em; text-transform: uppercase;
    color: rgba(240,236,228,.18); font-weight: 500;
    padding: .5rem 1.2rem; text-align: left;
    border-bottom: 1px solid rgba(255,255,255,.04);
  }
  .x-table td {
    font-size: .74rem; color: rgba(240,236,228,.55);
    padding: .58rem 1.2rem; border-bottom: 1px solid rgba(255,255,255,.025);
    font-weight: 300; vertical-align: middle;
  }
  .x-table tr:last-child td { border-bottom: none; }
  .x-table tr:hover td { background: rgba(255,255,255,.012); }
  .x-table td strong { color: #f0ece4; font-weight: 400; }
  .x-empty { text-align: center; color: rgba(240,236,228,.12); padding: 2.5rem; font-size: .72rem; }

  /* PILLS */
  .x-pill {
    display: inline-flex; align-items: center;
    font-size: .56rem; font-weight: 500; letter-spacing: .06em; text-transform: uppercase;
    padding: .17rem .46rem; border-radius: 20px; white-space: nowrap;
  }
  .x-pill-green  { background: rgba(74,222,128,.1);  color: #4ade80; border: 1px solid rgba(74,222,128,.18); }
  .x-pill-blue   { background: rgba(96,165,250,.1);  color: #60a5fa; border: 1px solid rgba(96,165,250,.18); }
  .x-pill-yellow { background: rgba(250,204,21,.1);  color: #facc15; border: 1px solid rgba(250,204,21,.18); }
  .x-pill-red    { background: rgba(248,113,113,.1); color: #f87171; border: 1px solid rgba(248,113,113,.18); }
  .x-pill-orange { background: rgba(251,146,60,.1);  color: #fb923c; border: 1px solid rgba(251,146,60,.18); }
  .x-pill-gold   { background: rgba(181,137,58,.12); color: #b5893a; border: 1px solid rgba(181,137,58,.2); }
  .x-pill-purple { background: rgba(167,139,250,.1); color: #a78bfa; border: 1px solid rgba(167,139,250,.18); }
  .x-pill-dim    { background: rgba(255,255,255,.04); color: rgba(240,236,228,.22); border: 1px solid rgba(255,255,255,.06); }

  /* 2-COL LAYOUT */
  .x-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }

  /* FORM */
  .x-form { background: #1a1916; border: 1px solid rgba(181,137,58,.18); border-radius: 10px; padding: 1.3rem; margin-bottom: 1.2rem; display: flex; flex-direction: column; gap: .8rem; }
  .x-form-title { font-size: .68rem; letter-spacing: .08em; text-transform: uppercase; color: #b5893a; font-weight: 500; }
  .x-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: .7rem; }
  .x-input {
    background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
    border-radius: 6px; padding: .52rem .8rem; font-size: .78rem;
    color: #f0ece4; font-family: inherit; font-weight: 300;
    outline: none; transition: border-color .2s; width: 100%;
  }
  .x-input:focus { border-color: rgba(181,137,58,.4); }
  .x-input::placeholder { color: rgba(240,236,228,.18); }
  .x-select {
    background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
    border-radius: 6px; padding: .52rem .8rem; font-size: .78rem;
    color: #f0ece4; font-family: inherit; outline: none; width: 100%; cursor: pointer;
  }
  .x-select option { background: #1a1916; }
  .x-form-btns { display: flex; gap: .6rem; }

  /* ICON BUTTON */
  .x-icon-btn { background: none; border: none; cursor: pointer; color: rgba(240,236,228,.2); transition: color .15s; padding: .2rem; display: flex; align-items: center; }
  .x-icon-btn:hover { color: rgba(240,236,228,.6); }
  .x-icon-btn.danger:hover { color: #f87171; }
  .x-icon-btn svg { width: 14px; height: 14px; }

  /* HEALTH INDICATORS */
  .x-health-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.055); border-radius: 10px; overflow: hidden; margin-bottom: 1.5rem; }
  .x-health-item { background: #161512; padding: 1.1rem 1.2rem; }
  .x-health-name { font-size: .7rem; color: rgba(240,236,228,.5); margin-bottom: .4rem; }
  .x-health-status { display: flex; align-items: center; gap: .4rem; font-size: .8rem; font-weight: 400; }
  .x-health-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .x-health-dot.ok { background: #4ade80; box-shadow: 0 0 6px rgba(74,222,128,.4); }
  .x-health-dot.warn { background: #facc15; }
  .x-health-dot.err { background: #f87171; }
  .x-health-dot.checking { background: rgba(240,236,228,.2); animation: x-pulse 1.2s ease-in-out infinite; }

  /* AUDIT */
  .x-audit-row { display: flex; align-items: flex-start; gap: .9rem; padding: .65rem 1.2rem; border-bottom: 1px solid rgba(255,255,255,.025); }
  .x-audit-row:last-child { border-bottom: none; }
  .x-audit-icon { width: 28px; height: 28px; border-radius: 6px; background: rgba(255,255,255,.04); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: .05rem; }
  .x-audit-icon svg { width: 13px; height: 13px; color: rgba(240,236,228,.3); }
  .x-audit-body { flex: 1; min-width: 0; }
  .x-audit-action { font-size: .76rem; color: #f0ece4; font-weight: 400; }
  .x-audit-meta { font-size: .67rem; color: rgba(240,236,228,.25); margin-top: .15rem; font-weight: 300; }
  .x-audit-time { font-size: .65rem; color: rgba(240,236,228,.17); flex-shrink: 0; padding-top: .05rem; }

  /* THEME SECTION */
  .x-theme-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
  .x-theme-swatch { border-radius: 10px; overflow: hidden; border: 2px solid transparent; cursor: pointer; transition: border-color .2s; aspect-ratio: 16/10; position: relative; }
  .x-theme-swatch.active { border-color: #b5893a; }
  .x-theme-label { position: absolute; bottom: 0; left: 0; right: 0; font-size: .62rem; font-weight: 500; text-align: center; padding: .35rem; background: rgba(0,0,0,.5); }

  /* TOGGLE */
  .x-toggle-row { display: flex; align-items: center; justify-content: space-between; padding: .85rem 1.2rem; border-bottom: 1px solid rgba(255,255,255,.04); }
  .x-toggle-row:last-child { border-bottom: none; }
  .x-toggle-info { flex: 1; }
  .x-toggle-name { font-size: .78rem; color: #f0ece4; font-weight: 400; }
  .x-toggle-desc { font-size: .68rem; color: rgba(240,236,228,.28); margin-top: .15rem; font-weight: 300; }
  .x-toggle { width: 36px; height: 20px; border-radius: 10px; border: none; cursor: pointer; position: relative; transition: background .2s; flex-shrink: 0; }
  .x-toggle.on { background: #b5893a; }
  .x-toggle.off { background: rgba(255,255,255,.1); }
  .x-toggle-knob { position: absolute; top: 2px; width: 16px; height: 16px; border-radius: 50%; background: #f0ece4; transition: left .2s; }
  .x-toggle.on .x-toggle-knob { left: 18px; }
  .x-toggle.off .x-toggle-knob { left: 2px; }

  /* MODAL */
  .x-modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,.6); backdrop-filter: blur(4px); z-index: 100; display: flex; align-items: center; justify-content: center; }
  .x-modal { background: #161512; border: 1px solid rgba(255,255,255,.08); border-radius: 12px; padding: 1.8rem; width: 420px; max-width: calc(100vw - 2rem); }
  .x-modal-title { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 500; margin-bottom: 1.2rem; }
  .x-modal-btns { display: flex; gap: .7rem; justify-content: flex-end; margin-top: 1.2rem; }

  /* SPINNER */
  .x-spinner { width: 22px; height: 22px; border: 2px solid rgba(181,137,58,.15); border-top-color: #b5893a; border-radius: 50%; animation: x-spin .8s linear infinite; }
  .x-center-spin { display: flex; align-items: center; justify-content: center; padding: 4rem; }

  /* LOADING PAGE */
  .x-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 1rem; }
  .x-loading-text { font-size: .72rem; color: rgba(240,236,228,.18); font-weight: 300; letter-spacing: .04em; }

  /* BETA TRACKER */
  .x-beta-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 1px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.055); border-radius: 10px; overflow: hidden; }
  .x-beta-card { background: #161512; padding: 1rem 1.1rem; display: flex; flex-direction: column; gap: .55rem; transition: background .15s; }
  .x-beta-card:hover { background: #1a1916; }
  .x-beta-top { display: flex; align-items: flex-start; justify-content: space-between; gap: .5rem; }
  .x-beta-info { flex: 1; min-width: 0; }
  .x-beta-name { font-size: .86rem; font-weight: 400; color: #f0ece4; }
  .x-beta-contact { font-size: .7rem; color: rgba(240,236,228,.28); margin-top: .18rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .x-beta-actions { display: flex; align-items: center; gap: .3rem; flex-shrink: 0; }
  .x-beta-notes { font-size: .7rem; color: rgba(240,236,228,.26); font-style: italic; line-height: 1.5; }
  .x-beta-footer { display: flex; align-items: center; justify-content: space-between; }
  .x-beta-status-select { font-size: .58rem; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; background: none; border: none; cursor: pointer; font-family: inherit; padding: 0; outline: none; appearance: none; }
  .x-beta-status-select option { background: #1a1916; color: #f0ece4; font-size: .75rem; }
  .x-beta-progress { display: flex; align-items: center; gap: .7rem; margin-bottom: 1.2rem; }
  .x-beta-bar { flex: 1; height: 3px; background: rgba(255,255,255,.06); border-radius: 2px; overflow: hidden; }
  .x-beta-fill { height: 100%; background: #b5893a; border-radius: 2px; transition: width .4s ease; }
  .x-beta-bar-text { font-size: .63rem; color: rgba(240,236,228,.22); white-space: nowrap; }
  .x-beta-stats { display: flex; gap: 1.2rem; flex-wrap: wrap; margin-bottom: .8rem; }
  .x-beta-stat { display: flex; align-items: center; gap: .35rem; }
  .x-beta-stat-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
  .x-beta-stat-lbl { font-size: .63rem; color: rgba(240,236,228,.22); }

  @keyframes x-spin { to { transform: rotate(360deg); } }
  @keyframes x-pulse { 0%,100% { opacity: .3; } 50% { opacity: .8; } }

  @media(max-width: 900px) {
    .x-sidebar { display: none; }
    .x-content { padding: 1.5rem; }
    .x-2col { grid-template-columns: 1fr; }
    .x-kpi-grid { grid-template-columns: repeat(2, 1fr); }
  }
`

// ── Utilities ──────────────────────────────────────────────────

export const fmt = n => (n == null ? '—' : Number(n).toLocaleString())

export const fmtMoney = (n, currency = 'CAD') => {
  if (!n) return '$0'
  return new Intl.NumberFormat('en-CA', {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(n)
}

export const timeAgo = ts => {
  if (!ts) return '—'
  const m = Math.floor((Date.now() - new Date(ts)) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  return new Date(ts).toLocaleDateString()
}

// ── Primitive Components ───────────────────────────────────────

export function Spinner() {
  return <div className="x-spinner" />
}

export function CenterSpinner() {
  return <div className="x-center-spin"><Spinner /></div>
}

export function GhostBtn({ children, onClick, spin, className = '' }) {
  return (
    <button className={`x-ghost${spin ? ' spin' : ''} ${className}`} onClick={onClick}>
      {children}
    </button>
  )
}

export function Card({ title, meta, children, style }) {
  return (
    <div className="x-card" style={style}>
      {(title || meta) && (
        <div className="x-card-head">
          {title && <span className="x-card-title">{title}</span>}
          {meta && <span className="x-card-meta">{meta}</span>}
        </div>
      )}
      {children}
    </div>
  )
}

export function KpiBlock({ label, value, sub, gold }) {
  return (
    <div className="x-kpi">
      <div className="x-kpi-dot" />
      <div className="x-kpi-lbl">{label}</div>
      <div className={`x-kpi-val${gold ? ' gold' : ''}`}>{value}</div>
      {sub && <div className="x-kpi-sub">{sub}</div>}
    </div>
  )
}

export function Pill({ children, color = 'dim' }) {
  return <span className={`x-pill x-pill-${color}`}>{children}</span>
}

export function PaymentPill({ status }) {
  const map = { captured: ['green', 'Captured'], authorized: ['blue', 'Hold'], pending: ['yellow', 'Pending'], failed: ['red', 'Failed'] }
  const [color, label] = map[status] || ['dim', status || 'none']
  return <Pill color={color}>{label}</Pill>
}

export function Toggle({ on, onChange }) {
  return (
    <button className={`x-toggle ${on ? 'on' : 'off'}`} onClick={() => onChange(!on)}>
      <div className="x-toggle-knob" />
    </button>
  )
}

export function SectionHead({ tag, title, sub }) {
  return (
    <div className="x-head">
      <div className="x-head-tag">{tag}</div>
      <h2>{title}</h2>
      {sub && <div className="x-head-sub">{sub}</div>}
    </div>
  )
}

export function XTable({ cols, rows, empty = 'No data yet' }) {
  return (
    <table className="x-table">
      <thead>
        <tr>{cols.map(c => <th key={c}>{c}</th>)}</tr>
      </thead>
      <tbody>
        {rows.length === 0
          ? <tr><td colSpan={cols.length} className="x-empty">{empty}</td></tr>
          : rows}
      </tbody>
    </table>
  )
}
