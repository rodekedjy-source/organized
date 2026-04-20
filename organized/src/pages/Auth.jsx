import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

const businessTypes = [
  { slug: 'hair_studio',    label: 'Hair Studio' },
  { slug: 'nail_studio',   label: 'Nail Studio' },
  { slug: 'massage_salon', label: 'Massage' },
  { slug: 'fitness',       label: 'Fitness' },
  { slug: 'photography',   label: 'Photography' },
  { slug: 'restaurant',    label: 'Restaurant' },
  { slug: 'other',         label: 'Other' },
]

const EMAIL_STEPS = [
  { n: 1, label: 'Account' },
  { n: 2, label: 'Verify email' },
  { n: 3, label: 'Your business' },
]

const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');
.auth-shell{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;}
.auth-left{background:#0d0c0a;display:flex;flex-direction:column;justify-content:space-between;padding:3rem;position:relative;overflow:hidden;}
.auth-glow{position:absolute;top:-20%;left:-20%;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(181,137,58,.15),transparent 70%);pointer-events:none;}
.auth-logo{font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:500;color:#fff;position:relative;z-index:1;cursor:pointer;}
.auth-logo span{color:#b5893a;}
.auth-left-body{position:relative;z-index:1;}
.auth-left-title{font-family:'Playfair Display',serif;font-size:2.4rem;font-weight:400;color:#fff;line-height:1.15;margin-bottom:1rem;}
.auth-left-sub{font-size:.9rem;color:rgba(255,255,255,.4);line-height:1.7;font-weight:300;max-width:340px;}
.auth-steps-preview{display:flex;flex-direction:column;gap:.6rem;position:relative;z-index:1;}
.auth-step-prev{display:flex;align-items:center;gap:.75rem;font-size:.8rem;color:rgba(255,255,255,.3);}
.auth-step-prev.done{color:rgba(255,255,255,.6);}
.auth-step-dot{width:20px;height:20px;border-radius:50%;border:1px solid rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:.6rem;flex-shrink:0;}
.auth-step-dot.active{background:#b5893a;border-color:#b5893a;color:#fff;}
.auth-step-dot.done-dot{background:rgba(46,125,82,.3);border-color:#2e7d52;color:#4ade80;}
.auth-right{display:flex;align-items:center;justify-content:center;padding:3rem 2rem;background:#fff;}
.auth-box{width:100%;max-width:420px;}
.auth-progress{height:3px;background:#e4e0d8;border-radius:2px;margin-bottom:2rem;overflow:hidden;}
.auth-progress-fill{height:100%;background:#b5893a;border-radius:2px;transition:width .4s ease;}
.auth-step-label{font-size:.72rem;color:#7a7672;letter-spacing:.06em;text-transform:uppercase;margin-bottom:.5rem;}
.auth-title{font-family:'Playfair Display',serif;font-size:1.7rem;font-weight:500;color:#0d0c0a;margin-bottom:.3rem;}
.auth-sub{font-size:.82rem;color:#7a7672;margin-bottom:1.75rem;font-weight:300;line-height:1.6;}
.auth-field{margin-bottom:1rem;}
.auth-field label{display:block;font-size:.75rem;font-weight:500;color:#7a7672;margin-bottom:.4rem;letter-spacing:.03em;}
.auth-input{width:100%;padding:.72rem 1rem;border:1px solid #e4e0d8;border-radius:8px;font-size:.88rem;font-family:inherit;color:#0d0c0a;background:#fff;outline:none;transition:border .15s,box-shadow .15s;box-sizing:border-box;}
.auth-input:focus{border-color:#b5893a;box-shadow:0 0 0 3px rgba(181,137,58,.1);}
.auth-error{padding:.7rem 1rem;border-radius:8px;font-size:.82rem;margin-bottom:1rem;background:#fef2f2;color:#c0392b;border:1px solid #fecaca;}
.auth-success-msg{padding:.7rem 1rem;border-radius:8px;font-size:.82rem;margin-bottom:1rem;background:#ecfdf5;color:#2e7d52;border:1px solid #a7f3d0;}
.btn-primary{width:100%;padding:.82rem;border-radius:8px;border:none;font-size:.88rem;font-weight:500;cursor:pointer;font-family:inherit;background:#0d0c0a;color:#fff;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:.5rem;}
.btn-primary:hover{background:#2a2a2a;}
.btn-primary:disabled{background:#ccc;cursor:not-allowed;}
.btn-gold{background:#b5893a;color:#fff;}
.btn-gold:hover{background:#9e7630;}
.btn-ghost{width:100%;padding:.65rem;border-radius:8px;font-size:.82rem;cursor:pointer;font-family:inherit;background:transparent;border:1px solid #e4e0d8;color:#7a7672;margin-top:.6rem;transition:all .15s;}
.btn-ghost:hover{border-color:#7a7672;color:#0d0c0a;}
.btn-google{width:100%;padding:.78rem 1rem;border-radius:8px;border:1px solid #e4e0d8;font-size:.88rem;font-weight:500;cursor:pointer;font-family:inherit;background:#fff;color:#0d0c0a;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:.65rem;box-shadow:0 1px 3px rgba(0,0,0,.06);}
.btn-google:hover{border-color:#b5893a;box-shadow:0 2px 8px rgba(0,0,0,.1);}
.btn-google:disabled{opacity:.5;cursor:not-allowed;}
.auth-type-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;margin-bottom:1rem;}
.auth-type-btn{border:1px solid #e4e0d8;border-radius:8px;padding:.65rem .4rem;text-align:center;cursor:pointer;font-size:.72rem;color:#7a7672;transition:all .15s;font-family:inherit;background:#fff;}
.auth-type-btn:hover{border-color:#b5893a;}
.auth-type-btn.sel{border-color:#b5893a;background:#fdf9f2;color:#0d0c0a;font-weight:500;}
.auth-note{font-size:.72rem;color:#7a7672;text-align:center;margin-top:1.25rem;}
.auth-note span{color:#b5893a;cursor:pointer;}
.auth-divider{display:flex;align-items:center;gap:.75rem;margin:1.25rem 0;}
.auth-divider-line{flex:1;height:1px;background:#e4e0d8;}
.auth-divider-text{font-size:.72rem;color:#7a7672;white-space:nowrap;}
.otp-row{display:flex;gap:.5rem;justify-content:center;margin-bottom:1.5rem;}
.otp-input{width:44px;height:52px;border:1px solid #e4e0d8;border-radius:8px;text-align:center;font-size:1.4rem;font-weight:600;font-family:inherit;color:#0d0c0a;outline:none;transition:border .15s;}
.otp-input:focus{border-color:#b5893a;box-shadow:0 0 0 3px rgba(181,137,58,.1);}
.spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite;}
.spinner-dark{width:16px;height:16px;border:2px solid rgba(0,0,0,.15);border-top-color:#0d0c0a;border-radius:50%;animation:spin .6s linear infinite;}
@keyframes spin{to{transform:rotate(360deg)}}
.auth-hint{display:flex;align-items:center;gap:.5rem;padding:.65rem .85rem;background:#f7f5f0;border-radius:8px;font-size:.75rem;color:#7a7672;margin-bottom:1.25rem;}
@media(max-width:768px){
  .auth-shell{grid-template-columns:1fr;}
  .auth-left{display:none;}
  .auth-right{padding:2.5rem 1.5rem;align-items:flex-start;padding-top:3rem;}
}
`

function getStrength(pw) {
  if (!pw) return { w: 0, color: '#e4e0d8', label: '' }
  let s = 0
  if (pw.length >= 8)  s++
  if (pw.length >= 12) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  if (s <= 1) return { w: 20,  color: '#c0392b', label: 'Weak' }
  if (s <= 2) return { w: 45,  color: '#e67e22', label: 'Fair' }
  if (s <= 3) return { w: 70,  color: '#f1c40f', label: 'Good' }
  return { w: 100, color: '#2e7d52', label: 'Strong' }
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

export default function Auth({ onAuth, onOnboarded }) {
  const [mode,       setMode]     = useState('signup')
  const [step,       setStep]     = useState(1)
  const [loading,    setLoading]  = useState(false)
  const [gLoading,   setGLoading] = useState(false)
  const [checking,   setChecking] = useState(true)
  const [error,      setError]    = useState('')
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const [oauthFlow,  setOauthFlow]  = useState(false)
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', confirm_password: '',
    business_name: '', business_type: '',
  })
  const [otp, setOtp] = useState(['','','','','',''])
  const navigate = useNavigate()

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setError('') }

  // ── Detect OAuth new user ─────────────────────────────────────
  // App.jsx routes session'd users with no workspace to /auth.
  // We detect them here and jump straight to the business step.
  useEffect(() => {
    const detect = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const meta = session.user.user_metadata || {}
        setForm(f => ({
          ...f,
          full_name: meta.full_name || meta.name || '',
          email:     session.user.email || '',
        }))
        setOauthFlow(true)
        setMode('signup')
        setStep(3)
      }
      setChecking(false)
    }
    detect()
  }, [])

  // ── OTP ───────────────────────────────────────────────────────
  function handleOtp(i, val) {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]; next[i] = val.slice(-1); setOtp(next)
    if (val && i < 5) document.getElementById(`otp-${i+1}`)?.focus()
  }
  function handleOtpKey(i, e) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) document.getElementById(`otp-${i-1}`)?.focus()
  }

  // ── GOOGLE ────────────────────────────────────────────────────
  async function signInWithGoogle() {
    setGLoading(true); setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (error) { setError(error.message); setGLoading(false) }
  }

  // ── STEP 1 ────────────────────────────────────────────────────
  async function submitStep1(e) {
    e.preventDefault(); setError('')
    if (!form.full_name.trim())   return setError('Please enter your full name.')
    if (!form.email.trim())       return setError('Please enter your email.')
    if (form.password.length < 8) return setError('Password must be at least 8 characters.')
    if (form.password !== form.confirm_password) return setError('Passwords do not match.')
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { full_name: form.full_name } },
    })
    if (error) { setError(error.message); setLoading(false); return }
    setStep(2); setLoading(false)
  }

  // ── STEP 2 ────────────────────────────────────────────────────
  async function submitStep2(e) {
    e.preventDefault(); setError('')
    const code = otp.join('')
    if (code.length < 6) return setError('Please enter the full 6-digit code.')
    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({
      email: form.email, token: code, type: 'email',
    })
    if (error) { setError('Invalid or expired code. Please try again.'); setLoading(false); return }
    setStep(3); setLoading(false)
  }

  async function resendCode() {
    await supabase.auth.resend({ type: 'signup', email: form.email })
  }

  // ── STEP 3 — Create workspace ─────────────────────────────────
  async function submitStep3(e) {
    e.preventDefault(); setError('')
    if (!form.business_name.trim()) return setError('Please enter your business name.')
    if (!form.business_type)        return setError('Please select a business type.')
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Session expired. Please sign in again.'); setLoading(false); return }

      await supabase.from('users').upsert({
        id: user.id,
        full_name: form.full_name || user.user_metadata?.full_name || '',
        email: user.email,
        onboarding_complete: true,
      })

      const { data: wt } = await supabase
        .from('workspace_types').select('id')
        .eq('slug', form.business_type).maybeSingle()

      const slug = form.business_name.toLowerCase()
        .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 30)
        + '-' + Math.random().toString(36).slice(2, 6)

      const { error: wsError } = await supabase.from('workspaces').insert({
        user_id: user.id, name: form.business_name,
        slug, workspace_type_id: wt?.id || null,
      })
      if (wsError) throw wsError

      const { data: { session } } = await supabase.auth.getSession()
      onAuth(session)
      onOnboarded()          // tells App.jsx: user now has a workspace
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  // ── LOGIN ─────────────────────────────────────────────────────
  async function submitLogin(e) {
    e.preventDefault(); setError('')
    if (!form.email || !form.password) return setError('Please fill in all fields.')
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email, password: form.password,
    })
    if (error) { setError(error.message); setLoading(false); return }
    onAuth(data.session)
    navigate('/dashboard')
    setLoading(false)
  }

  // ── FORGOT ────────────────────────────────────────────────────
  async function submitForgot(e) {
    e.preventDefault(); setError('')
    if (!form.email) return setError('Please enter your email.')
    setLoading(true)
    await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${window.location.origin}/auth`,
    })
    setForgotSent(true); setLoading(false)
  }

  const progress = mode === 'login' ? 100 : oauthFlow ? 100 : (step / 3) * 100
  const strength = getStrength(form.password)

  if (checking) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f7f5f0' }}>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.5rem', color:'#b5893a' }}>
        Organized<span style={{ color:'#0d0c0a' }}>.</span>
      </div>
    </div>
  )

  return (
    <>
      <style>{css}</style>
      <div className="auth-shell">

        {/* LEFT */}
        <div className="auth-left">
          <div className="auth-glow"/>
          <div className="auth-logo" onClick={() => navigate('/')}>Organized<span>.</span></div>
          <div className="auth-left-body">
            <div className="auth-left-title">
              {mode === 'login' ? <>Welcome<br/>back.</> : <>Your business,<br/><em style={{ color:'#b5893a' }}>finally organized.</em></>}
            </div>
            <div className="auth-left-sub">
              {mode === 'login'
                ? 'Sign in to access your dashboard and manage your business.'
                : 'One platform for bookings, products, formations, and client management.'}
            </div>
          </div>

          {mode === 'signup' && !oauthFlow && (
            <div className="auth-steps-preview">
              {EMAIL_STEPS.map(s => (
                <div key={s.n} className={`auth-step-prev ${step > s.n ? 'done' : ''}`}>
                  <div className={`auth-step-dot ${step === s.n ? 'active' : ''} ${step > s.n ? 'done-dot' : ''}`}>
                    {step > s.n ? '✓' : s.n}
                  </div>
                  {s.label}
                </div>
              ))}
            </div>
          )}

          {mode === 'signup' && oauthFlow && (
            <div className="auth-steps-preview">
              <div className="auth-step-prev done">
                <div className="auth-step-dot done-dot">✓</div>
                Google account
              </div>
              <div className="auth-step-prev">
                <div className="auth-step-dot active">2</div>
                Your business
              </div>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="auth-right">
          <div className="auth-box">
            <div className="auth-progress">
              <div className="auth-progress-fill" style={{ width:`${progress}%` }}/>
            </div>

            {/* LOGIN */}
            {mode === 'login' && !forgotMode && (
              <form onSubmit={submitLogin}>
                <div className="auth-title">Welcome back</div>
                <div className="auth-sub">Sign in to your Organized. dashboard.</div>
                {error && <div className="auth-error">{error}</div>}
                <button type="button" className="btn-google" onClick={signInWithGoogle} disabled={gLoading}>
                  {gLoading ? <div className="spinner-dark"/> : <GoogleIcon/>}
                  Continue with Google
                </button>
                <div className="auth-divider">
                  <div className="auth-divider-line"/>
                  <span className="auth-divider-text">or sign in with email</span>
                  <div className="auth-divider-line"/>
                </div>
                <div className="auth-field"><label>Email address</label>
                  <input className="auth-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com"/>
                </div>
                <div className="auth-field"><label>Password</label>
                  <input className="auth-input" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Your password"/>
                </div>
                <div style={{ textAlign:'right', marginBottom:'1rem' }}>
                  <span style={{ fontSize:'.75rem', color:'#7a7672', cursor:'pointer' }} onClick={() => setForgotMode(true)}>Forgot password?</span>
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <><div className="spinner"/>Signing in...</> : 'Sign in'}
                </button>
                <div className="auth-note">Don't have an account? <span onClick={() => { setMode('signup'); setError('') }}>Create one free</span></div>
              </form>
            )}

            {/* FORGOT */}
            {mode === 'login' && forgotMode && (
              <form onSubmit={submitForgot}>
                <div className="auth-title">Reset password</div>
                <div className="auth-sub">We'll send a reset link to your email.</div>
                {forgotSent
                  ? <div className="auth-success-msg">Reset link sent to <strong>{form.email}</strong>. Check your inbox.</div>
                  : <>
                      {error && <div className="auth-error">{error}</div>}
                      <div className="auth-field"><label>Email address</label>
                        <input className="auth-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com"/>
                      </div>
                      <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? <><div className="spinner"/>Sending...</> : 'Send reset link'}
                      </button>
                    </>
                }
                <button type="button" className="btn-ghost" onClick={() => { setForgotMode(false); setForgotSent(false) }}>Back to sign in</button>
              </form>
            )}

            {/* STEP 1 */}
            {mode === 'signup' && step === 1 && (
              <form onSubmit={submitStep1}>
                <div className="auth-step-label">Step 1 of 3</div>
                <div className="auth-title">Create your account</div>
                <div className="auth-sub">Start your 14-day free trial. No credit card needed.</div>
                {error && <div className="auth-error">{error}</div>}
                <button type="button" className="btn-google" onClick={signInWithGoogle} disabled={gLoading}>
                  {gLoading ? <div className="spinner-dark"/> : <GoogleIcon/>}
                  Continue with Google
                </button>
                <div className="auth-divider">
                  <div className="auth-divider-line"/>
                  <span className="auth-divider-text">or sign up with email</span>
                  <div className="auth-divider-line"/>
                </div>
                <div className="auth-field"><label>Full name</label>
                  <input className="auth-input" value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="e.g. Maya Johnson"/>
                </div>
                <div className="auth-field"><label>Email address</label>
                  <input className="auth-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com"/>
                </div>
                <div className="auth-field"><label>Password</label>
                  <input className="auth-input" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="At least 8 characters"/>
                  {form.password && (
                    <div style={{ display:'flex', alignItems:'center', gap:'.5rem', marginTop:'.4rem' }}>
                      <div style={{ flex:1, height:'3px', borderRadius:'2px', background:strength.color, transition:'all .3s' }}/>
                      <span style={{ fontSize:'.68rem', color:strength.color, fontWeight:500 }}>{strength.label}</span>
                    </div>
                  )}
                </div>
                <div className="auth-field"><label>Confirm password</label>
                  <input className="auth-input" type="password" value={form.confirm_password} onChange={e => set('confirm_password', e.target.value)} placeholder="Repeat your password"/>
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <><div className="spinner"/>Creating account...</> : 'Continue'}
                </button>
                <div className="auth-note">Already have an account? <span onClick={() => { setMode('login'); setError('') }}>Sign in</span></div>
              </form>
            )}

            {/* STEP 2 — OTP */}
            {mode === 'signup' && step === 2 && (
              <form onSubmit={submitStep2}>
                <div className="auth-step-label">Step 2 of 3</div>
                <div className="auth-title">Verify your email</div>
                <div className="auth-sub">We sent a 6-digit code to <strong>{form.email}</strong>.</div>
                {error && <div className="auth-error">{error}</div>}
                <div className="otp-row">
                  {otp.map((v, i) => (
                    <input key={i} id={`otp-${i}`} className="otp-input"
                      type="text" inputMode="numeric" maxLength={1} value={v}
                      onChange={e => handleOtp(i, e.target.value)}
                      onKeyDown={e => handleOtpKey(i, e)}/>
                  ))}
                </div>
                <button type="submit" className="btn-primary btn-gold" disabled={loading}>
                  {loading ? <><div className="spinner"/>Verifying...</> : 'Verify email'}
                </button>
                <div className="auth-note">Didn't receive it? <span onClick={resendCode}>Resend code</span></div>
                <button type="button" className="btn-ghost" onClick={() => setStep(1)}>Back</button>
              </form>
            )}

            {/* STEP 3 — Business */}
            {mode === 'signup' && step === 3 && (
              <form onSubmit={submitStep3}>
                <div className="auth-step-label">{oauthFlow ? 'One last thing' : 'Step 3 of 3'}</div>
                <div className="auth-title">Your business</div>
                <div className="auth-sub">
                  {oauthFlow
                    ? `Welcome${form.full_name ? ', ' + form.full_name.split(' ')[0] : ''}! Tell us about your business.`
                    : "Two things and you're in."}
                </div>
                {oauthFlow && (
                  <div className="auth-hint">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                    </svg>
                    Location, bio, and logo can be added in your dashboard settings.
                  </div>
                )}
                {error && <div className="auth-error">{error}</div>}
                <div className="auth-field"><label>Business name</label>
                  <input className="auth-input" value={form.business_name}
                    onChange={e => set('business_name', e.target.value)}
                    placeholder="e.g. Elixir Hair Studio" autoFocus/>
                </div>
                <div className="auth-field">
                  <label>What kind of business?</label>
                  <div className="auth-type-grid">
                    {businessTypes.map(t => (
                      <button key={t.slug} type="button"
                        className={`auth-type-btn ${form.business_type === t.slug ? 'sel' : ''}`}
                        onClick={() => set('business_type', t.slug)}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" className="btn-primary btn-gold" disabled={loading}>
                  {loading ? <><div className="spinner"/>Creating workspace...</> : 'Go to my dashboard'}
                </button>
                {!oauthFlow && (
                  <button type="button" className="btn-ghost" onClick={() => setStep(2)}>Back</button>
                )}
              </form>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
