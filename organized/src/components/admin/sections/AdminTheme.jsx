import { useState } from 'react'
import { SectionHead, Card, Toggle } from '../AdminShared'

const THEMES = [
  { id: 'noir',    label: 'Noir',     bg: '#0f0e0c', accent: '#b5893a', text: '#f0ece4' },
  { id: 'slate',   label: 'Slate',    bg: '#0d1117', accent: '#58a6ff', text: '#e6edf3' },
  { id: 'forest',  label: 'Forest',   bg: '#0a0f0a', accent: '#4ade80', text: '#ecfdf5' },
  { id: 'rose',    label: 'Rose',     bg: '#0f0a0c', accent: '#f472b6', text: '#fce7f3' },
  { id: 'violet',  label: 'Violet',   bg: '#0d0b14', accent: '#a78bfa', text: '#ede9fe' },
  { id: 'amber',   label: 'Amber',    bg: '#0f0b00', accent: '#fbbf24', text: '#fffbeb' },
]

export default function AdminTheme() {
  const [activeTheme, setActiveTheme] = useState('noir')
  const [toggles, setToggles] = useState({
    maintenance: false,
    betaOnly: false,
    analyticsEnabled: true,
    emailNotifications: true,
    autoRefresh: true,
  })

  function setToggle(key, val) {
    setToggles(t => ({ ...t, [key]: val }))
  }

  return (
    <div>
      <SectionHead
        tag="Appearance"
        title="Theme & Settings"
        sub="Visual configuration and feature flags"
      />

      <Card title="Console Theme">
        <div style={{ padding: '1.2rem' }}>
          <div className="x-theme-grid">
            {THEMES.map(theme => (
              <div
                key={theme.id}
                className={`x-theme-swatch${activeTheme === theme.id ? ' active' : ''}`}
                style={{ background: theme.bg }}
                onClick={() => setActiveTheme(theme.id)}
              >
                <div style={{
                  height: '100%', display: 'flex', flexDirection: 'column',
                  justifyContent: 'center', alignItems: 'center', gap: '.4rem',
                  padding: '.8rem',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: theme.accent, opacity: .9,
                  }} />
                  <div style={{ display: 'flex', gap: '.25rem' }}>
                    {[.3, .5, .8].map((o, i) => (
                      <div key={i} style={{
                        width: 18, height: 3, borderRadius: 2,
                        background: theme.text, opacity: o,
                      }} />
                    ))}
                  </div>
                </div>
                <div className="x-theme-label" style={{ color: theme.text }}>{theme.label}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '.68rem', color: 'rgba(240,236,228,.2)', marginTop: '.8rem', fontWeight: 300 }}>
            Theme changes are visual only — persisted locally. Platform theme is managed via user workspace settings.
          </p>
        </div>
      </Card>

      <Card title="Feature Flags">
        <div className="x-toggle-row">
          <div className="x-toggle-info">
            <div className="x-toggle-name">Maintenance Mode</div>
            <div className="x-toggle-desc">Shows maintenance banner to all users except admins</div>
          </div>
          <Toggle on={toggles.maintenance} onChange={v => setToggle('maintenance', v)} />
        </div>
        <div className="x-toggle-row">
          <div className="x-toggle-info">
            <div className="x-toggle-name">Beta Only Access</div>
            <div className="x-toggle-desc">Restrict new signups to invite-only beta testers</div>
          </div>
          <Toggle on={toggles.betaOnly} onChange={v => setToggle('betaOnly', v)} />
        </div>
        <div className="x-toggle-row">
          <div className="x-toggle-info">
            <div className="x-toggle-name">Analytics</div>
            <div className="x-toggle-desc">Enable platform-wide usage analytics collection</div>
          </div>
          <Toggle on={toggles.analyticsEnabled} onChange={v => setToggle('analyticsEnabled', v)} />
        </div>
        <div className="x-toggle-row">
          <div className="x-toggle-info">
            <div className="x-toggle-name">Email Notifications</div>
            <div className="x-toggle-desc">Send transactional emails for bookings and reviews</div>
          </div>
          <Toggle on={toggles.emailNotifications} onChange={v => setToggle('emailNotifications', v)} />
        </div>
        <div className="x-toggle-row">
          <div className="x-toggle-info">
            <div className="x-toggle-name">Console Auto-Refresh</div>
            <div className="x-toggle-desc">Automatically refresh metrics every 60 seconds</div>
          </div>
          <Toggle on={toggles.autoRefresh} onChange={v => setToggle('autoRefresh', v)} />
        </div>
      </Card>

      <div style={{ fontSize: '.65rem', color: 'rgba(240,236,228,.12)', textAlign: 'center', marginTop: '1rem' }}>
        Feature flags shown here are for planning — wire to Supabase remote config to persist.
      </div>
    </div>
  )
}
