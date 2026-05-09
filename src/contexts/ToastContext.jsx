import { createContext, useCallback, useContext, useRef, useState } from 'react'

const ToastContext = createContext(null)

const ICONS = {
  success: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
      <polyline points="2,8 6,12 14,4" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
      <line x1="3" y1="3" x2="13" y2="13" /><line x1="13" y1="3" x2="3" y2="13" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
      <circle cx="8" cy="8" r="6" /><line x1="8" y1="7" x2="8" y2="11" /><circle cx="8" cy="5" r=".5" fill="currentColor" />
    </svg>
  ),
}

const COLORS = {
  success: { bg: '#f0faf4', border: '#a3d9b1', color: '#1a6b35' },
  error:   { bg: '#fdf2f2', border: '#f5b7b1', color: '#922b21' },
  info:    { bg: '#f4f6fb', border: '#aac0e8', color: '#1a3a6b' },
}

let nextId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id])
    delete timers.current[id]
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((message, type = 'success') => {
    const id = ++nextId
    setToasts((prev) => {
      const next = [...prev, { id, message, type }]
      // Cap at 3 — drop the oldest if over limit
      return next.length > 3 ? next.slice(next.length - 3) : next
    })
    timers.current[id] = setTimeout(() => dismiss(id), 3000)
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '.6rem',
        zIndex: 9999,
        pointerEvents: 'none',
      }}>
        {toasts.map(({ id, message, type }) => {
          const c = COLORS[type] ?? COLORS.info
          return (
            <div
              key={id}
              onClick={() => dismiss(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '.55rem',
                padding: '.65rem 1rem',
                borderRadius: 10,
                border: `1px solid ${c.border}`,
                background: c.bg,
                color: c.color,
                fontSize: '.84rem',
                fontWeight: 500,
                boxShadow: '0 4px 16px rgba(0,0,0,.08)',
                maxWidth: 320,
                pointerEvents: 'auto',
                cursor: 'pointer',
                animation: 'toast-in .18s ease',
              }}
            >
              <span style={{ flexShrink: 0 }}>{ICONS[type]}</span>
              <span>{message}</span>
            </div>
          )
        })}
      </div>
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx.toast
}
