import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

// ── COUNTRY / CITY DATA ────────────────────────────────────────
const COUNTRIES = [
  { code:'CA', name:'Canada', provinces:['Alberta','British Columbia','Manitoba','New Brunswick','Newfoundland','Nova Scotia','Ontario','Prince Edward Island','Quebec','Saskatchewan'] },
  { code:'US', name:'United States', provinces:['Alabama','Alaska','Arizona','California','Colorado','Florida','Georgia','Illinois','Massachusetts','Michigan','New York','North Carolina','Ohio','Pennsylvania','Texas','Washington'] },
  { code:'FR', name:'France', provinces:['Île-de-France','Provence','Normandie','Bretagne','Occitanie','Auvergne-Rhône-Alpes','Nouvelle-Aquitaine','Hauts-de-France'] },
  { code:'GB', name:'United Kingdom', provinces:['England','Scotland','Wales','Northern Ireland'] },
  { code:'BE', name:'Belgium', provinces:['Brussels','Flanders','Wallonia'] },
  { code:'CH', name:'Switzerland', provinces:['Zürich','Geneva','Bern','Basel','Vaud'] },
  { code:'MA', name:'Morocco', provinces:['Casablanca','Rabat','Marrakech','Fès','Tanger'] },
  { code:'SN', name:'Senegal', provinces:['Dakar','Thiès','Kaolack','Ziguinchor','Saint-Louis'] },
  { code:'CI', name:'Côte d\'Ivoire', provinces:['Abidjan','Bouaké','Yamoussoukro','Korhogo','San-Pédro'] },
  { code:'HT', name:'Haiti', provinces:['Ouest','Nord','Sud','Artibonite','Centre'] },
]

const CITIES = {
  CA: ['Montreal','Toronto','Vancouver','Calgary','Ottawa','Edmonton','Quebec City','Winnipeg','Hamilton','Kitchener','London','Halifax','Victoria','Mississauga','Brampton','Surrey','Laval','Markham','Vaughan','Gatineau'],
  US: ['New York','Los Angeles','Chicago','Houston','Phoenix','Philadelphia','San Antonio','San Diego','Dallas','San Jose','Austin','Jacksonville','Fort Worth','Columbus','Charlotte','Indianapolis','San Francisco','Seattle','Denver','Miami'],
  FR: ['Paris','Marseille','Lyon','Toulouse','Nice','Nantes','Strasbourg','Montpellier','Bordeaux','Lille'],
  GB: ['London','Birmingham','Manchester','Glasgow','Liverpool','Bristol','Sheffield','Leeds','Edinburgh','Leicester'],
  BE: ['Brussels','Antwerp','Ghent','Charleroi','Liège','Bruges','Namur','Leuven'],
  CH: ['Zurich','Geneva','Basel','Bern','Lausanne','Winterthur','Lucerne'],
  MA: ['Casablanca','Rabat','Fès','Marrakech','Tanger','Meknès','Oujda','Agadir'],
  SN: ['Dakar','Thiès','Kaolack','Ziguinchor','Saint-Louis','Touba','Mbour'],
  CI: ['Abidjan','Bouaké','Daloa','Korhogo','Yamoussoukro','San-Pédro'],
  HT: ['Port-au-Prince','Cap-Haïtien','Gonaïves','Les Cayes','Pétion-Ville'],
}

const businessTypes = [
  { slug:'hair_studio', label:'Hair Studio' },
  { slug:'nail_studio', label:'Nail Studio' },
  { slug:'massage_salon', label:'Massage Salon' },
  { slug:'restaurant', label:'Restaurant' },
  { slug:'fitness', label:'Fitness' },
  { slug:'photography', label:'Photography' },
  { slug:'other', label:'Other' },
]

// ── PASSWORD VALIDATION ────────────────────────────────────────
function getPasswordStrength(password) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }
  const passed = Object.values(checks).filter(Boolean).length
  let level = 'weak'
  if (passed >= 4) level = 'good'
  if (passed === 5) level = 'strong'
  return { checks, passed, level }
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');
.auth-shell{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;}
.auth-left{background:#0d0c0a;display:flex;flex-direction:column;justify-content:space-between;padding:3rem;position:relative;overflow:hidden;}
.auth-glow{position:absolute;top:-20%;left:-20%;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(181,137,58,.15),transparent 70%);pointer-events:none;}
.auth-logo{font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:500;color:#fff;position:relative;z-index:1;}
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
.auth-input.err{border-color:#c0392b;}
.auth-select{width:100%;padding:.72rem 1rem;border:1px solid #e4e0d8;border-radius:8px;font-size:.88rem;font-family:inherit;color:#0d0c0a;background:#fff;outline:none;appearance:none;cursor:pointer;}
.auth-select:focus{border-color:#b5893a;box-shadow:0 0 0 3px rgba(181,137,58,.1);}
.auth-error{padding:.7rem 1rem;border-radius:8px;font-size:.82rem;margin-bottom:1rem;background:#fef2f2;color:#c0392b;border:1px solid #fecaca;}
.auth-success-msg{padding:.7rem 1rem;border-radius:8px;font-size:.82rem;margin-bottom:1rem;background:#ecfdf5;color:#2e7d52;border:1px solid #a7f3d0;}
.btn-primary{width:100%;padding:.82rem;border-radius:8px;border:none;font-size:.88rem;font-weight:500;cursor:pointer;font-family:inherit;background:#0d0c0a;color:#fff;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:.5rem;}
.btn-primary:hover{background:#2a2a2a;}
.btn-primary:disabled{background:#ccc;cursor:not-allowed;}
.btn-gold{background:#b5893a;color:#fff;}
.btn-gold:hover{background:#9e7630;}
.btn-ghost{width:100%;padding:.65rem;border-radius:8px;font-size:.82rem;cursor:pointer;font-family:inherit;background:transparent;border:1px solid #e4e0d8;color:#7a7672;margin-top:.6rem;transition:all .15s;}
.btn-ghost:hover{border-color:#7a7672;color:#0d0c0a;}
.auth-type-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;margin-bottom:1rem;}
.auth-type-btn{border:1px solid #e4e0d8;border-radius:8px;padding:.65rem .4rem;text-align:center;cursor:pointer;font-size:.72rem;color:#7a7672;transition:all .15s;font-family:inherit;background:#fff;}
.auth-type-btn:hover{border-color:#b5893a;}
.auth-type-btn.sel{border-color:#b5893a;background:#fdf9f2;color:#0d0c0a;font-weight:500;}
.auth-note{font-size:.72rem;color:#7a7672;text-align:center;margin-top:1.25rem;}
.auth-note span{color:#b5893a;cursor:pointer;}
.city-wrap{position:relative;}
.city-dropdown{position:absolute;top:100%;left:0;right:0;background:#fff;border:1px solid #e4e0d8;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.1);z-index:50;max-height:180px;overflow-y:auto;margin-top:2px;}
.city-option{padding:.6rem 1rem;font-size:.84rem;cursor:pointer;color:#0d0c0a;transition:background .1s;}
.city-option:hover{background:#f7f5f0;}
.otp-row{display:flex;gap:.5rem;justify-content:center;margin-bottom:1.5rem;}
.otp-input{width:44px;height:52px;border:1px solid #e4e0d8;border-radius:8px;text-align:center;font-size:1.4rem;font-weight:600;font-family:inherit;color:#0d0c0a;outline:none;transition:border .15s;}
.otp-input:focus{border-color:#b5893a;box-shadow:0 0 0 3px rgba(181,137,58,.1);}
.auth-divider{display:flex;align-items:center;gap:.75rem;margin:1.25rem 0;}
.auth-divider-line{flex:1;height:1px;background:#e4e0d8;}
.auth-divider-text{font-size:.72rem;color:#7a7672;}
.spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite;}
@keyframes spin{to{transform:rotate(360deg)}}
.success-icon{width:64px;height:64px;border-radius:50%;background:#ecfdf5;display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;}

/* Password strength indicator */
.pw-strength{margin-top:.5rem;}
.pw-bar-row{display:flex;gap:4px;margin-bottom:.4rem;}
.pw-bar{height:3px;flex:1;border-radius:2px;background:#e4e0d8;transition:background .2s;}
.pw-bar.active-weak{background:#c0392b;}
.pw-bar.active-good{background:#e67e22;}
.pw-bar.active-strong{background:#2e7d52;}
.pw-label{font-size:.7rem;font-weight:500;margin-bottom:.35rem;}
.pw-label.weak{color:#c0392b;}
.pw-label.good{color:#e67e22;}
.pw-label.strong{color:#2e7d52;}
.pw-checks{display:flex;flex-wrap:wrap;gap:.15rem .75rem;}
.pw-check{font-size:.68rem;color:#b0aca6;display:flex;align-items:center;gap:.3rem;transition:color .15s;}
.pw-check.pass{color:#2e7d52;}
.pw-check-icon{font-size:.6rem;}

@media(max-width:768px){.auth-shell{grid-template-columns:1fr;}.auth-left{display:none;}.auth-right{padding:2.5rem 1.5rem;align-items:flex-start;padding-top:3rem;}}
`

const STEPS = [
  { n:1, label:'Account' },
  { n:2, label:'Verify email' },
  { n:3, label:'Your business' },
  { n:4, label:'Location' },
]

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState('signup')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    full_name:'', email:'', password:'', confirm_password:'',
    business_name:'', business_type:'', business_email:'', tagline:'',
    country:'CA', province:'', city:'',
  })
  const [otp, setOtp] = useState(['','','','','',''])
  const [cityQuery, setCityQuery] = useState('')
  const [citySuggestions, setCitySuggestions] = useState([])
  const [showCities, setShowCities] = useState(false)
  const cityRef = useRef(null)
  const navigate = useNavigate()

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setError('') }

  // Password strength (computed from form state)
  const pwStrength = getPasswordStrength(form.password)

  // City autocomplete
  useEffect(() => {
    if (cityQuery.length < 2) { setCitySuggestions([]); return }
    const all = CITIES[form.country] || []
    const filtered = all.filter(c => c.toLowerCase().startsWith(cityQuery.toLowerCase()))
    setCitySuggestions(filtered.slice(0, 6))
  }, [cityQuery, form.country])

  // Close city dropdown on outside click
  useEffect(() => {
    function handler(e) { if (cityRef.current && !cityRef.current.contains(e.target)) setShowCities(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // OTP input handling
  function handleOtp(i, val) {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[i] = val.slice(-1)
    setOtp(next)
    if (val && i < 5) document.getElementById(`otp-${i+1}`)?.focus()
  }

  function handleOtpKey(i, e) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) document.getElementById(`otp-${i-1}`)?.focus()
  }

  // ── STEP 1 — Account ────────────────────────────────────────
  async function submitStep1(e) {
    e.preventDefault()
    setError('')
    if (!form.full_name.trim()) return setError('Please enter your full name.')
    if (!form.email.trim()) return setError('Please enter your email.')

    // Strong password validation
    const { checks, passed } = getPasswordStrength(form.password)
    if (!checks.length) return setError('Password must be at least 8 characters.')
    if (!checks.uppercase) return setError('Password must include at least one uppercase letter.')
    if (!checks.lowercase) return setError('Password must include at least one lowercase letter.')
    if (!checks.number) return setError('Password must include at least one number.')
    if (!checks.special) return setError('Password must include at least one special character (!@#$%...).')

    if (form.password !== form.confirm_password) return setError('Passwords do not match.')

    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name } }
    })
    if (error) { setError(error.message); setLoading(false); return }
    setStep(2)
    setLoading(false)
  }

  // ── STEP 2 — Verify OTP ─────────────────────────────────────
  async function submitStep2(e) {
    e.preventDefault()
    setError('')
    const code = otp.join('')
    if (code.length < 6) return setError('Please enter the full 6-digit code.')
    setLoading(true)
    const { data, error } = await supabase.auth.verifyOtp({
      email: form.email, token: code, type: 'email',
    })
    if (error) { setError('Invalid or expired code. Please try again.'); setLoading(false); return }
    setStep(3)
    setLoading(false)
  }

  async function resendCode() {
    setError('')
    await supabase.auth.resend({ type: 'signup', email: form.email })
  }

  // ── STEP 3 — Business ───────────────────────────────────────
  async function submitStep3(e) {
    e.preventDefault()
    setError('')
    if (!form.business_name.trim()) return setError('Please enter your business name.')
    if (!form.business_type) return setError('Please select a business type.')
    setStep(4)
  }

  // ── STEP 4 — Location + Create workspace ────────────────────
  async function submitStep4(e) {
    e.preventDefault()
    setError('')
    if (!form.country) return setError('Please select your country.')
    if (!form.city.trim()) return setError('Please enter your city.')
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Session expired. Please sign in again.'); setLoading(false); return }

      await supabase.from('users').upsert({
        id: user.id, full_name: form.full_name, email: form.email,
      })

      const slug = form.business_name.toLowerCase()
        .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        + '-' + Math.random().toString(36).slice(2, 6)

      await supabase.from('workspaces').upsert({
        user_id: user.id, name: form.business_name,
        tagline: form.tagline, email: form.business_email,
        location: `${form.city}${form.province ? ', ' + form.province : ''}, ${form.country}`,
        slug,
      })

      await supabase.auth.signOut()
      setStep(5)
    } catch(err) {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  // ── LOGIN ───────────────────────────────────────────────────
  async function submitLogin(e) {
    e.preventDefault()
    setError('')
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

  // ── FORGOT PASSWORD ─────────────────────────────────────────
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)

  async function submitForgot(e) {
    e.preventDefault()
    setError('')
    if (!form.email) return setError('Please enter your email.')
    setLoading(true)
    await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${window.location.origin}/auth`,
    })
    setForgotSent(true)
    setLoading(false)
  }

  const progress = mode === 'login' ? 100 : (step / 4) * 100

  // Password strength UI helper
  const PwStrengthIndicator = () => {
    if (!form.password) return null
    const { checks, level } = pwStrength
    const barCount = level === 'strong' ? 3 : level === 'good' ? 2 : 1
    const barClass = `active-${level}`
    const labels = { weak: 'Weak password', good: 'Good password', strong: 'Strong password' }

    return (
      <div className="pw-strength">
        <div className="pw-bar-row">
          {[1,2,3].map(i => (
            <div key={i} className={`pw-bar ${i <= barCount ? barClass : ''}`} />
          ))}
        </div>
        <div className={`pw-label ${level}`}>{labels[level]}</div>
        <div className="pw-checks">
          <span className={`pw-check ${checks.length ? 'pass' : ''}`}>
            <span className="pw-check-icon">{checks.length ? '✓' : '○'}</span> 8+ characters
          </span>
          <span className={`pw-check ${checks.uppercase ? 'pass' : ''}`}>
            <span className="pw-check-icon">{checks.uppercase ? '✓' : '○'}</span> Uppercase
          </span>
          <span className={`pw-check ${checks.lowercase ? 'pass' : ''}`}>
            <span className="pw-check-icon">{checks.lowercase ? '✓' : '○'}</span> Lowercase
          </span>
          <span className={`pw-check ${checks.number ? 'pass' : ''}`}>
            <span className="pw-check-icon">{checks.number ? '✓' : '○'}</span> Number
          </span>
          <span className={`pw-check ${checks.special ? 'pass' : ''}`}>
            <span className="pw-check-icon">{checks.special ? '✓' : '○'}</span> Special char
          </span>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{css}</style>
      <div className="auth-shell">
        {/* LEFT */}
        <div className="auth-left">
          <div className="auth-glow"/>
          <div className="auth-logo" onClick={()=>navigate('/')} style={{cursor:'pointer'}}>Organized<span>.</span></div>
          <div className="auth-left-body">
            <div className="auth-left-title">
              {mode==='login' ? <>Welcome<br/>back.</> : <>Your business,<br/><em style={{color:'#b5893a'}}>finally organized.</em></>}
            </div>
            <div className="auth-left-sub">
              {mode==='login'
                ? 'Sign in to access your dashboard and manage your business.'
                : 'One platform for bookings, products, formations, and client management.'}
            </div>
          </div>
          {mode==='signup' && (
            <div className="auth-steps-preview">
              {STEPS.map(s => (
                <div key={s.n} className={`auth-step-prev ${step>s.n?'done':''}`}>
                  <div className={`auth-step-dot ${step===s.n?'active':''} ${step>s.n?'done-dot':''}`}>
                    {step>s.n?'✓':s.n}
                  </div>
                  {s.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="auth-right">
          <div className="auth-box">
            <div className="auth-progress">
              <div className="auth-progress-fill" style={{width:`${progress}%`}}/>
            </div>

            {/* ── LOGIN ── */}
            {mode === 'login' && !forgotMode && (
              <form onSubmit={submitLogin}>
                <div className="auth-title">Welcome back</div>
                <div className="auth-sub">Sign in to your Organized dashboard.</div>
                {error && <div className="auth-error">{error}</div>}
                <div className="auth-field"><label>Email address</label><input className="auth-input" type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@example.com"/></div>
                <div className="auth-field"><label>Password</label><input className="auth-input" type="password" value={form.password} onChange={e=>set('password',e.target.value)} placeholder="Your password"/></div>
                <div style={{textAlign:'right',marginBottom:'1rem'}}>
                  <span style={{fontSize:'.75rem',color:'#7a7672',cursor:'pointer'}} onClick={()=>setForgotMode(true)}>Forgot password?</span>
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading?<><div className="spinner"/>Signing in...</>:'Sign in'}
                </button>
                <div className="auth-note">Don't have an account? <span onClick={()=>{setMode('signup');setError('')}}>Create one free</span></div>
              </form>
            )}

            {/* ── FORGOT ── */}
            {mode === 'login' && forgotMode && (
              <form onSubmit={submitForgot}>
                <div className="auth-title">Reset password</div>
                <div className="auth-sub">We'll send a reset link to your email.</div>
                {forgotSent
                  ? <div className="auth-success-msg">Reset link sent to {form.email}. Check your inbox.</div>
                  : <>
                    {error && <div className="auth-error">{error}</div>}
                    <div className="auth-field"><label>Email address</label><input className="auth-input" type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@example.com"/></div>
                    <button type="submit" className="btn-primary" disabled={loading}>{loading?<><div className="spinner"/>Sending...</>:'Send reset link'}</button>
                  </>
                }
                <button type="button" className="btn-ghost" onClick={()=>{setForgotMode(false);setForgotSent(false)}}>Back to sign in</button>
              </form>
            )}

            {/* ── SIGNUP STEP 1 — Account ── */}
            {mode === 'signup' && step === 1 && (
              <form onSubmit={submitStep1}>
                <div className="auth-step-label">Step 1 of 4</div>
                <div className="auth-title">Create your account</div>
                <div className="auth-sub">Start your 14-day free trial. No credit card needed.</div>
                {error && <div className="auth-error">{error}</div>}
                <div className="auth-field"><label>Full name</label><input className="auth-input" value={form.full_name} onChange={e=>set('full_name',e.target.value)} placeholder="e.g. Maya Johnson"/></div>
                <div className="auth-field"><label>Email address</label><input className="auth-input" type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@example.com"/></div>
                <div className="auth-field">
                  <label>Password</label>
                  <input className="auth-input" type="password" value={form.password} onChange={e=>set('password',e.target.value)} placeholder="Min. 8 chars, uppercase, number, special"/>
                  <PwStrengthIndicator />
                </div>
                <div className="auth-field"><label>Confirm password</label><input className="auth-input" type="password" value={form.confirm_password} onChange={e=>set('confirm_password',e.target.value)} placeholder="Repeat your password"/></div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading?<><div className="spinner"/>Creating account...</>:'Continue'}
                </button>
                <div className="auth-note">Already have an account? <span onClick={()=>{setMode('login');setError('')}}>Sign in</span></div>
              </form>
            )}

            {/* ── SIGNUP STEP 2 — Verify OTP ── */}
            {mode === 'signup' && step === 2 && (
              <form onSubmit={submitStep2}>
                <div className="auth-step-label">Step 2 of 4</div>
                <div className="auth-title">Verify your email</div>
                <div className="auth-sub">We sent a 6-digit code to <strong>{form.email}</strong>. Enter it below.</div>
                {error && <div className="auth-error">{error}</div>}
                <div className="otp-row">
                  {otp.map((v,i) => (
                    <input key={i} id={`otp-${i}`} className="otp-input" type="text" inputMode="numeric" maxLength={1} value={v} onChange={e=>handleOtp(i,e.target.value)} onKeyDown={e=>handleOtpKey(i,e)} />
                  ))}
                </div>
                <button type="submit" className="btn-primary btn-gold" disabled={loading}>
                  {loading?<><div className="spinner"/>Verifying...</>:'Verify email'}
                </button>
                <div className="auth-note">Didn't receive it? <span onClick={resendCode}>Resend code</span></div>
                <button type="button" className="btn-ghost" onClick={()=>setStep(1)}>Back</button>
              </form>
            )}

            {/* ── SIGNUP STEP 3 — Business ── */}
            {mode === 'signup' && step === 3 && (
              <form onSubmit={submitStep3}>
                <div className="auth-step-label">Step 3 of 4</div>
                <div className="auth-title">Your business</div>
                <div className="auth-sub">Tell us about what you do.</div>
                {error && <div className="auth-error">{error}</div>}
                <div className="auth-field"><label>Business name</label><input className="auth-input" value={form.business_name} onChange={e=>set('business_name',e.target.value)} placeholder="e.g. Elixir Hair Studio"/></div>
                <div className="auth-field"><label>Tagline <span style={{color:'#b5893a',fontSize:'.7rem'}}>(optional)</span></label><input className="auth-input" value={form.tagline} onChange={e=>set('tagline',e.target.value)} placeholder="e.g. Natural Hair Specialist · Montreal"/></div>
                <div className="auth-field"><label>Business email <span style={{color:'#b5893a',fontSize:'.7rem'}}>(optional)</span></label><input className="auth-input" type="email" value={form.business_email} onChange={e=>set('business_email',e.target.value)} placeholder="contact@yourstudio.com"/></div>
                <div className="auth-field">
                  <label>Business type</label>
                  <div className="auth-type-grid">
                    {businessTypes.map(t => (
                      <button key={t.slug} type="button" className={`auth-type-btn ${form.business_type===t.slug?'sel':''}`} onClick={()=>set('business_type',t.slug)}>{t.label}</button>
                    ))}
                  </div>
                </div>
                <button type="submit" className="btn-primary">Continue</button>
                <button type="button" className="btn-ghost" onClick={()=>setStep(2)}>Back</button>
              </form>
            )}

            {/* ── SUCCESS ── */}
            {mode === 'signup' && step === 5 && (
              <div style={{textAlign:'center',padding:'1rem 0'}}>
                <div className="success-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2e7d52" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div className="auth-title" style={{textAlign:'center'}}>You're all set.</div>
                <div className="auth-sub" style={{textAlign:'center',margin:'0 auto 1.75rem'}}>
                  Your workspace <strong>{form.business_name}</strong> has been created. Sign in to access your dashboard.
                </div>
                <button className="btn-primary btn-gold" onClick={()=>{setMode('login');setStep(1);setForm(f=>({...f,password:'',confirm_password:''}))}}>
                  Sign in to my dashboard
                </button>
              </div>
            )}

            {/* ── SIGNUP STEP 4 — Location ── */}
            {mode === 'signup' && step === 4 && (
              <form onSubmit={submitStep4}>
                <div className="auth-step-label">Step 4 of 4</div>
                <div className="auth-title">Where are you based?</div>
                <div className="auth-sub">This helps clients find you and personalizes your profile.</div>
                {error && <div className="auth-error">{error}</div>}
                <div className="auth-field">
                  <label>Country</label>
                  <select className="auth-select" value={form.country} onChange={e=>{set('country',e.target.value);set('province','');set('city','');setCityQuery('')}}>
                    {COUNTRIES.map(c=><option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                </div>
                <div className="auth-field">
                  <label>Province / State <span style={{color:'#b5893a',fontSize:'.7rem'}}>(optional)</span></label>
                  <select className="auth-select" value={form.province} onChange={e=>set('province',e.target.value)}>
                    <option value=''>Select...</option>
                    {(COUNTRIES.find(c=>c.code===form.country)?.provinces||[]).map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="auth-field">
                  <label>City</label>
                  <div className="city-wrap" ref={cityRef}>
                    <input className="auth-input" value={cityQuery || form.city} onChange={e=>{setCityQuery(e.target.value);set('city',e.target.value);setShowCities(true)}} onFocus={()=>setShowCities(true)} placeholder="Start typing your city..." />
                    {showCities && citySuggestions.length > 0 && (
                      <div className="city-dropdown">
                        {citySuggestions.map(c=>(
                          <div key={c} className="city-option" onMouseDown={()=>{set('city',c);setCityQuery(c);setShowCities(false)}}>{c}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button type="submit" className="btn-primary btn-gold" disabled={loading}>
                  {loading?<><div className="spinner"/>Setting up your workspace...</>:'Launch my workspace'}
                </button>
                <button type="button" className="btn-ghost" onClick={()=>setStep(3)}>Back</button>
              </form>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
