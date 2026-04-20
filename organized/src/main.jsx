import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import App from './App'
import './index.css'

// ── Sentry — Error & Performance Monitoring ────────────────────
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,

  // Only run in production — no noise during development
  enabled: import.meta.env.PROD,

  environment: import.meta.env.MODE, // 'production' or 'development'

  // Capture 100% of errors, 10% of performance traces
  // Increase tracesSampleRate to 1.0 temporarily when debugging perf
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,       // session replay off (costs money)
  replaysOnErrorSampleRate: 1.0,     // but record replay on crash

  integrations: [
    Sentry.browserTracingIntegration(),
  ],
})

// ── Sentry Error Boundary ──────────────────────────────────────
// Catches any React render error and reports it to Sentry
// instead of showing a blank white screen
const SentryErrorFallback = ({ error, resetError }) => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f7f5f0',
    padding: '2rem',
    textAlign: 'center',
  }}>
    <div style={{
      fontFamily: "'Playfair Display', serif",
      fontSize: '1.5rem',
      color: '#b5893a',
      marginBottom: '1rem',
    }}>
      Organized<span style={{ color: '#0d0c0a' }}>.</span>
    </div>
    <div style={{
      fontFamily: 'DM Sans, sans-serif',
      fontSize: '0.9rem',
      color: '#7a7672',
      maxWidth: '320px',
      lineHeight: 1.6,
      marginBottom: '1.5rem',
    }}>
      Something went wrong. Our team has been notified and is looking into it.
    </div>
    <button
      onClick={resetError}
      style={{
        padding: '0.75rem 1.5rem',
        background: '#0d0c0a',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '0.85rem',
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      Try again
    </button>
  </div>
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={SentryErrorFallback} showDialog={false}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
)
