import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

const businessTypes = [
  { slug: 'hair_studio',   label: 'Hair Studio' },
  { slug: 'massage_salon', label: 'Massage Salon' },
  { slug: 'restaurant',    label: 'Restaurant' },
  { slug: 'fitness',       label: 'Fitness' },
  { slug: 'photography',   label: 'Photography' },
  { slug: 'nail_studio',   label: 'Nail Studio' },
  { slug: 'other',         label: 'Other' },
]

export default function Auth({ onAuth }) {
  const [tab, setTab]       = useState('login')
  const [screen, setScreen] = useState('main')
  const [step, setStep]     = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm]     = useState({
    full_name: '', email: '', password: '', confirm_password: '',
    business_name: '', business_type: '', location: '',
  })
  const navigate = useNavigate()

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  // ── SIGNUP ──────────────────────────────────────────────────
  async function handleStep1(e) {
    e.preventDefault()
    setError('')
    if (!form.full_name || !form.email || !form.password) return setError('Please fill in all fields.')
    if (form.password.length < 8) return setError('Password must be at least 8 characters.')
    if (form.password !== form.confirm_password) return setError('Passwords do not match.')
    setStep(2)
  }

  async function handleSignup(e) {
    e.preventDefault()
    setError('')
    if (!form.business_name || !form.business_type) return setError('Please fill in your business details.')
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name:     form.full_name,
          business_name: form.business_name,
          business_type: form.business_type,
          location:      form.location,
        }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Insert into our users table
    if (data.user) {
      await supabase.from('users').insert({
        id:        data.user.id,
        full_name: form.full_name,
        email:     form.email,
      })

      // Create their workspace
      const slug = form.business_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      await supabase.from('workspaces').insert({
        user_id:      data.user.id,
        name:         form.business_name,
        slug:         slug + '-' + Math.random().toString(36).slice(2,6),
        location:     form.location,
      })
    }

    setSuccess(`Welcome! We sent a confirmation email to ${form.email}. Click the link to activate your account.`)
    setScreen('success')
    setLoading(false)
  }

  // ── LOGIN ───────────────────────────────────────────────────
  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) return setError('Please enter your email and password.')
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email:    form.email,
      password: form.password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    onAuth(data.session)
    navigate('/dashboard')
    setLoading(false)
  }

  // ── FORGOT PASSWORD ─────────────────────────────────────────
  async function handleReset(e) {
    e.preventDefault()
    setError('')
    if (!form.email) return setError('Please enter your email.')
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${window.location.origin}/auth?screen=reset`,
    })

    if (error) { setError(error.message); setLoading(false); return }
    setSuccess(`Password reset link sent to ${form.email}.`)
    setScreen('success')
    setLoading(false)
  }

  return (
    <div style={styles.shell}>

      {/* LEFT PANEL */}
      <div style={styles.left}>
        <div style={styles.leftGlow}/>
        <div style={styles.logo}>Organized<span style={{color:'#b5893a'}}>.</span></div>
        <div style={styles.leftBody}>
          <div style={styles.leftTitle}>
            Your business,<br/><em style={{color:'#b5893a'}}>finally organized.</em>
          </div>
          <div style={styles.leftSub}>
            One platform for bookings, products, formations, and client management. Built for every service-based business.
          </div>
        </div>
        <div style={styles.statList}>
          {[
            'Clients book directly from your profile — no more DMs',
            'Sell products and courses from the same place',
            'Automated reminders so you never chase clients',
            'Your own professional page live in under 10 minutes',
          ].map((s, i) => (
            <div key={i} style={styles.stat}>
              <div style={styles.statDot}/>
              <div style={styles.statText}>{s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={styles.right}>
        <div style={styles.box}>

          {/* SUCCESS */}
          {screen === 'success' && (
            <div style={{textAlign:'center',padding:'2rem 0'}}>
              <div style={styles.successIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2e7d52" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div style={styles.title}>All done.</div>
              <div style={styles.sub}>{success}</div>
              <button style={{...styles.btnPrimary, marginTop:'1.5rem', width:'100%'}} onClick={() => { setScreen('main'); setTab('login'); }}>
                Back to sign in
              </button>
            </div>
          )}

          {/* FORGOT */}
          {screen === 'forgot' && (
            <form onSubmit={handleReset}>
              <div style={styles.title}>Reset password</div>
              <div style={styles.sub}>Enter your email and we'll send you a reset link.</div>
              {error && <div style={styles.msgError}>{error}</div>}
              <div style={styles.field}>
                <label style={styles.label}>Email address</label>
                <input style={styles.input} type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@example.com"/>
              </div>
              <button type="submit" style={{...styles.btnPrimary,width:'100%'}} disabled={loading}>
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
              <button type="button" style={{...styles.btnGhost,width:'100%',marginTop:'.75rem'}} onClick={()=>setScreen('main')}>
                Back to sign in
              </button>
            </form>
          )}

          {/* MAIN */}
          {screen === 'main' && (
            <>
              <div style={styles.tabRow}>
                <button style={{...styles.tab, ...(tab==='login'?styles.tabActive:{})}} onClick={()=>setTab('login')}>Sign in</button>
                <button style={{...styles.tab, ...(tab==='signup'?styles.tabActive:{})}} onClick={()=>setTab('signup')}>Create account</button>
              </div>

              {/* LOGIN */}
              {tab === 'login' && (
                <form onSubmit={handleLogin}>
                  <div style={styles.title}>Welcome back</div>
                  <div style={styles.sub}>Sign in to your Organized dashboard.</div>
                  {error && <div style={styles.msgError}>{error}</div>}
                  <div style={styles.field}>
                    <label style={styles.label}>Email address</label>
                    <input style={styles.input} type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@example.com"/>
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Password</label>
                    <input style={styles.input} type="password" value={form.password} onChange={e=>set('password',e.target.value)} placeholder="Your password"/>
                  </div>
                  <div style={{textAlign:'right',marginBottom:'1rem'}}>
                    <span style={styles.forgotLink} onClick={()=>setScreen('forgot')}>Forgot your password?</span>
                  </div>
                  <button type="submit" style={{...styles.btnPrimary,width:'100%'}} disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>
                  <div style={styles.note}>
                    Don't have an account? <span style={styles.noteLink} onClick={()=>setTab('signup')}>Create one free</span>
                  </div>
                </form>
              )}

              {/* SIGNUP STEP 1 */}
              {tab === 'signup' && step === 1 && (
                <form onSubmit={handleStep1}>
                  <div style={styles.title}>Create your account</div>
                  <div style={styles.sub}>Start your 14-day free trial. No credit card needed.</div>
                  {error && <div style={styles.msgError}>{error}</div>}
                  <div style={styles.field}>
                    <label style={styles.label}>Full name</label>
                    <input style={styles.input} value={form.full_name} onChange={e=>set('full_name',e.target.value)} placeholder="e.g. Maya Johnson"/>
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Email address</label>
                    <input style={styles.input} type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@example.com"/>
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Password</label>
                    <input style={styles.input} type="password" value={form.password} onChange={e=>set('password',e.target.value)} placeholder="At least 8 characters"/>
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Confirm password</label>
                    <input style={styles.input} type="password" value={form.confirm_password} onChange={e=>set('confirm_password',e.target.value)} placeholder="Repeat your password"/>
                  </div>
                  <button type="submit" style={{...styles.btnPrimary,width:'100%'}}>Continue</button>
                  <div style={styles.note}>
                    Already have an account? <span style={styles.noteLink} onClick={()=>setTab('login')}>Sign in</span>
                  </div>
                </form>
              )}

              {/* SIGNUP STEP 2 */}
              {tab === 'signup' && step === 2 && (
                <form onSubmit={handleSignup}>
                  <div style={styles.title}>Your business</div>
                  <div style={styles.sub}>Tell us about your business to set up your profile.</div>
                  {error && <div style={styles.msgError}>{error}</div>}
                  <div style={styles.field}>
                    <label style={styles.label}>Business name</label>
                    <input style={styles.input} value={form.business_name} onChange={e=>set('business_name',e.target.value)} placeholder="e.g. Elixir Hair Studio"/>
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Business type</label>
                    <div style={styles.typeGrid}>
                      {businessTypes.map(t => (
                        <div key={t.slug} style={{...styles.typeCard,...(form.business_type===t.slug?styles.typeCardSelected:{})}}
                          onClick={() => set('business_type', t.slug)}>
                          {t.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>City / Location</label>
                    <input style={styles.input} value={form.location} onChange={e=>set('location',e.target.value)} placeholder="e.g. Montreal, QC"/>
                  </div>
                  <button type="submit" style={{...styles.btnGold,width:'100%'}} disabled={loading}>
                    {loading ? 'Creating your account...' : 'Create my account'}
                  </button>
                  <button type="button" style={{...styles.btnGhost,width:'100%',marginTop:'.75rem'}} onClick={()=>setStep(1)}>Back</button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  shell:    { minHeight:'100vh', display:'grid', gridTemplateColumns:'1fr 1fr' },
  left:     { background:'#0d0c0a', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'3rem', position:'relative', overflow:'hidden' },
  leftGlow: { position:'absolute', top:'-20%', left:'-20%', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle, rgba(181,137,58,.15), transparent 70%)', pointerEvents:'none' },
  logo:     { fontFamily:'Playfair Display, serif', fontSize:'1.5rem', fontWeight:500, color:'#fff', position:'relative', zIndex:1 },
  leftBody: { position:'relative', zIndex:1 },
  leftTitle:{ fontFamily:'Playfair Display, serif', fontSize:'2.6rem', fontWeight:400, color:'#fff', lineHeight:1.15, marginBottom:'1.25rem' },
  leftSub:  { fontSize:'.9rem', color:'rgba(255,255,255,.4)', lineHeight:1.7, fontWeight:300, maxWidth:'340px' },
  statList: { display:'flex', flexDirection:'column', gap:'.75rem', position:'relative', zIndex:1 },
  stat:     { display:'flex', alignItems:'center', gap:'.75rem' },
  statDot:  { width:'6px', height:'6px', borderRadius:'50%', background:'#b5893a', flexShrink:0 },
  statText: { fontSize:'.8rem', color:'rgba(255,255,255,.35)' },
  right:    { display:'flex', alignItems:'center', justifyContent:'center', padding:'3rem 2rem', background:'#fff' },
  box:      { width:'100%', maxWidth:'400px' },
  tabRow:   { display:'flex', background:'#f7f5f0', borderRadius:'10px', padding:'4px', gap:'3px', marginBottom:'2rem' },
  tab:      { flex:1, padding:'.55rem', borderRadius:'7px', border:'none', background:'transparent', fontSize:'.82rem', fontWeight:500, color:'#7a7672', cursor:'pointer', fontFamily:'inherit', transition:'all .15s' },
  tabActive:{ background:'#fff', color:'#0d0c0a', boxShadow:'0 1px 4px rgba(0,0,0,.08)' },
  title:    { fontFamily:'Playfair Display, serif', fontSize:'1.75rem', fontWeight:500, marginBottom:'.35rem', color:'#0d0c0a' },
  sub:      { fontSize:'.82rem', color:'#7a7672', marginBottom:'1.75rem', fontWeight:300 },
  field:    { marginBottom:'1rem' },
  label:    { display:'block', fontSize:'.75rem', fontWeight:500, color:'#7a7672', marginBottom:'.4rem', letterSpacing:'.03em' },
  input:    { width:'100%', padding:'.7rem 1rem', border:'1px solid #e4e0d8', borderRadius:'8px', fontSize:'.88rem', fontFamily:'inherit', color:'#0d0c0a', background:'#fff', outline:'none' },
  msgError: { padding:'.75rem 1rem', borderRadius:'8px', fontSize:'.82rem', marginBottom:'1rem', background:'#fef2f2', color:'#c0392b', border:'1px solid #fecaca' },
  btnPrimary:{ padding:'.8rem', borderRadius:'8px', border:'none', fontSize:'.88rem', fontWeight:500, cursor:'pointer', fontFamily:'inherit', background:'#0d0c0a', color:'#fff', transition:'all .2s' },
  btnGold:  { padding:'.8rem', borderRadius:'8px', border:'none', fontSize:'.88rem', fontWeight:500, cursor:'pointer', fontFamily:'inherit', background:'#b5893a', color:'#fff', transition:'all .2s' },
  btnGhost: { padding:'.6rem', borderRadius:'8px', fontSize:'.82rem', fontWeight:400, cursor:'pointer', fontFamily:'inherit', background:'transparent', border:'1px solid #e4e0d8', color:'#7a7672' },
  forgotLink:{ fontSize:'.75rem', color:'#7a7672', cursor:'pointer' },
  note:     { fontSize:'.72rem', color:'#7a7672', textAlign:'center', marginTop:'1.25rem' },
  noteLink: { color:'#b5893a', cursor:'pointer' },
  successIcon:{ width:'64px', height:'64px', borderRadius:'50%', background:'#ecfdf5', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.25rem' },
  typeGrid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'.5rem', marginBottom:'1rem' },
  typeCard: { border:'1px solid #e4e0d8', borderRadius:'8px', padding:'.65rem .5rem', textAlign:'center', cursor:'pointer', fontSize:'.72rem', color:'#7a7672' },
  typeCardSelected:{ borderColor:'#b5893a', background:'#fdf9f2', color:'#0d0c0a', fontWeight:500 },
}
