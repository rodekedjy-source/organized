import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.rv')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('rv-in')
          obs.unobserve(e.target)
        }
      })
    }, { threshold: 0.12 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

function Counter({ to, suffix = '' }) {
  const [val, setVal] = useState(0)
  const ref = useRef()
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      let v = 0
      const step = to / 50
      const t = setInterval(() => {
        v += step
        if (v >= to) { setVal(to); clearInterval(t) }
        else setVal(Math.floor(v))
      }, 20)
      obs.disconnect()
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [to])
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'DM Sans', sans-serif; background: #f9f7f4; color: #0d0c0a; overflow-x: hidden; }

  :root {
    --gold: #b5893a;
    --ink: #0d0c0a;
    --ink-2: #3a3835;
    --ink-3: #7a7672;
    --cream: #f9f7f4;
    --white: #ffffff;
    --border: #e8e4dc;
  }

  /* ── REVEAL ANIMATIONS ── */
  .rv { opacity: 0; transform: translateY(40px); transition: opacity .75s cubic-bezier(.16,1,.3,1), transform .75s cubic-bezier(.16,1,.3,1); }
  .rv.rv-in { opacity: 1; transform: translateY(0); }
  .rv-left { opacity: 0; transform: translateX(-40px); transition: opacity .75s cubic-bezier(.16,1,.3,1), transform .75s cubic-bezier(.16,1,.3,1); }
  .rv-left.rv-in { opacity: 1; transform: translateX(0); }
  .rv-right { opacity: 0; transform: translateX(40px); transition: opacity .75s cubic-bezier(.16,1,.3,1), transform .75s cubic-bezier(.16,1,.3,1); }
  .rv-right.rv-in { opacity: 1; transform: translateX(0); }
  .rv-scale { opacity: 0; transform: scale(.92); transition: opacity .75s cubic-bezier(.16,1,.3,1), transform .75s cubic-bezier(.16,1,.3,1); }
  .rv-scale.rv-in { opacity: 1; transform: scale(1); }
  .d1 { transition-delay: .08s; } .d2 { transition-delay: .16s; } .d3 { transition-delay: .24s; } .d4 { transition-delay: .32s; }

  /* ── NAV ── */
  .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 0 3rem; height: 62px; background: rgba(249,247,244,.92); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); }
  .nav-logo { font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 500; color: var(--ink); cursor: pointer; letter-spacing: -.01em; }
  .nav-logo span { color: var(--gold); }
  .nav-links { display: flex; gap: 2.5rem; }
  .nav-link { font-size: .82rem; color: var(--ink-3); cursor: pointer; transition: color .15s; font-weight: 400; }
  .nav-link:hover { color: var(--ink); }
  .nav-right { display: flex; align-items: center; gap: 1rem; }
  .nav-signin { font-size: .82rem; color: var(--ink-3); cursor: pointer; font-weight: 400; }
  .nav-signin:hover { color: var(--ink); }
  .nav-cta { background: var(--ink); color: #fff; border: none; border-radius: 8px; padding: .55rem 1.35rem; font-size: .82rem; font-weight: 500; cursor: pointer; font-family: inherit; transition: all .2s; }
  .nav-cta:hover { background: #2a2a2a; transform: translateY(-1px); }

  /* ── HERO ── */
  .hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 8rem 2rem 5rem; background: var(--cream); position: relative; overflow: hidden; }
  .hero-blob { position: absolute; top: -30%; left: 50%; transform: translateX(-50%); width: 900px; height: 700px; background: radial-gradient(ellipse, rgba(181,137,58,.08) 0%, transparent 65%); pointer-events: none; }
  .hero-blob-2 { position: absolute; bottom: -20%; right: -10%; width: 600px; height: 600px; background: radial-gradient(ellipse, rgba(181,137,58,.05) 0%, transparent 65%); pointer-events: none; }
  .hero-tag { display: inline-flex; align-items: center; gap: .5rem; background: #fff; border: 1px solid var(--border); border-radius: 20px; padding: .35rem 1rem .35rem .6rem; font-size: .72rem; font-weight: 500; color: var(--ink-2); letter-spacing: .02em; margin-bottom: 2rem; box-shadow: 0 2px 12px rgba(0,0,0,.05); animation: fadeUp .6s ease both; }
  .hero-tag-pip { background: var(--gold); color: #fff; font-size: .6rem; font-weight: 700; padding: .2rem .5rem; border-radius: 10px; letter-spacing: .04em; }
  .hero-h1 { font-family: 'Playfair Display', serif; font-size: clamp(2.6rem, 6vw, 5.5rem); font-weight: 500; color: var(--ink); line-height: 1.06; letter-spacing: -.025em; max-width: 880px; animation: fadeUp .7s .1s ease both; margin-bottom: 1.5rem; }
  .hero-h1 em { font-style: italic; color: var(--gold); }
  .hero-sub { font-size: 1.05rem; color: var(--ink-3); max-width: 480px; line-height: 1.75; font-weight: 300; animation: fadeUp .7s .2s ease both; margin-bottom: 2.5rem; }
  .hero-actions { display: flex; gap: .85rem; justify-content: center; flex-wrap: wrap; animation: fadeUp .7s .3s ease both; }
  .btn-primary { background: var(--ink); color: #fff; border: none; border-radius: 8px; padding: .9rem 2rem; font-size: .9rem; font-weight: 500; cursor: pointer; font-family: inherit; transition: all .2s; }
  .btn-primary:hover { background: #2a2a2a; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(13,12,10,.2); }
  .btn-outline { background: transparent; color: var(--ink); border: 1px solid var(--border); border-radius: 8px; padding: .9rem 2rem; font-size: .9rem; cursor: pointer; font-family: inherit; transition: all .2s; }
  .btn-outline:hover { border-color: var(--ink-3); transform: translateY(-1px); }
  .hero-note { font-size: .72rem; color: var(--ink-3); opacity: .6; margin-top: 1.25rem; animation: fadeUp .7s .4s ease both; }

  /* ── TRUST BAR ── */
  .trust-bar { background: var(--white); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 1.25rem 2rem; display: flex; align-items: center; justify-content: center; gap: 3rem; flex-wrap: wrap; }
  .trust-item { display: flex; align-items: center; gap: .5rem; font-size: .78rem; color: var(--ink-3); }
  .trust-icon { font-size: .9rem; }

  /* ── SECTIONS ── */
  .section { padding: 7rem 2rem; }
  .container { max-width: 1100px; margin: 0 auto; }
  .section-tag { font-size: .7rem; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--gold); margin-bottom: .85rem; }
  .section-title { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 4vw, 3.2rem); font-weight: 500; line-height: 1.15; color: var(--ink); }
  .section-title em { font-style: italic; color: var(--gold); }
  .section-sub { font-size: .95rem; color: var(--ink-3); line-height: 1.75; font-weight: 300; max-width: 480px; margin-top: .85rem; }

  /* ── PROBLEM ── */
  .problem-bg { background: var(--ink); }
  .dm-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1rem; margin-top: 3rem; }
  .dm-card { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 14px; padding: 1.35rem; }
  .dm-head { display: flex; align-items: center; gap: .5rem; margin-bottom: 1rem; padding-bottom: .75rem; border-bottom: 1px solid rgba(255,255,255,.06); }
  .dm-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; animation: pulse 2s infinite; }
  .dm-platform { font-size: .68rem; color: rgba(255,255,255,.3); }
  .dm-msg { display: flex; gap: .5rem; margin-bottom: .5rem; }
  .dm-av { width: 24px; height: 24px; border-radius: 50%; background: rgba(181,137,58,.25); flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: .58rem; font-weight: 700; color: var(--gold); }
  .dm-bubble { background: rgba(255,255,255,.07); border-radius: 0 8px 8px 8px; padding: .45rem .65rem; font-size: .73rem; color: rgba(255,255,255,.6); line-height: 1.5; }
  .dm-reply { margin-left: auto; background: rgba(181,137,58,.15); border-radius: 8px 0 8px 8px; padding: .45rem .65rem; font-size: .73rem; color: rgba(181,137,58,.8); line-height: 1.5; max-width: 80%; }
  .dm-time { font-size: .6rem; color: rgba(255,255,255,.18); margin-top: .2rem; }
  .dm-vs { text-align: center; margin-top: 2.5rem; display: flex; align-items: center; gap: 1.5rem; justify-content: center; }
  .dm-vs-line { flex: 1; max-width: 160px; height: 1px; background: rgba(255,255,255,.08); }
  .dm-vs-text { font-size: .72rem; color: rgba(255,255,255,.25); letter-spacing: .08em; text-transform: uppercase; }

  /* ── PHONE MOCKUP ── */
  .split { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
  .phone-wrap { position: relative; display: flex; justify-content: center; }
  .phone-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 300px; height: 300px; background: radial-gradient(ellipse, rgba(181,137,58,.15), transparent 70%); filter: blur(30px); pointer-events: none; }
  .phone { background: #111; border-radius: 36px; overflow: hidden; width: 240px; box-shadow: 0 40px 80px rgba(0,0,0,.3), 0 0 0 1px rgba(255,255,255,.08); position: relative; }
  .phone-notch { height: 28px; background: #0d0c0a; display: flex; align-items: center; justify-content: center; }
  .phone-notch-pill { width: 60px; height: 10px; background: #111; border-radius: 10px; }
  .phone-screen { background: #0d0c0a; }
  .ph-topbar { background: #0d0c0a; padding: .5rem .75rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,.06); }
  .ph-name { font-family: 'Playfair Display', serif; font-size: .72rem; color: #fff; }
  .ph-hero { background: #0d0c0a; padding: 1.25rem .75rem; text-align: center; }
  .ph-av { width: 44px; height: 44px; border-radius: 50%; background: #1a1a1a; border: 1px solid rgba(181,137,58,.4); margin: 0 auto .5rem; display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-size: 1rem; color: var(--gold); }
  .ph-title { font-family: 'Playfair Display', serif; font-size: .85rem; color: #fff; }
  .ph-bio { font-size: .52rem; color: rgba(255,255,255,.35); margin-top: .15rem; }
  .ph-tabs { display: flex; border-bottom: 1px solid rgba(255,255,255,.07); }
  .ph-tab { flex: 1; padding: .45rem; font-size: .55rem; color: rgba(255,255,255,.3); text-align: center; }
  .ph-tab.on { color: var(--gold); border-bottom: 1px solid var(--gold); }
  .ph-body { padding: .6rem; background: #fff; }
  .ph-svc { display: flex; align-items: center; gap: .4rem; padding: .45rem; border: 1px solid #e8e4dc; border-radius: 7px; margin-bottom: .3rem; }
  .ph-svc-bar { width: 2px; height: 22px; background: var(--gold); border-radius: 1px; opacity: .5; flex-shrink: 0; }
  .ph-svc-name { font-size: .58rem; color: #0d0c0a; font-weight: 500; flex: 1; }
  .ph-svc-price { font-family: 'Playfair Display', serif; font-size: .68rem; color: #0d0c0a; }
  .ph-btn { background: #0d0c0a; color: #fff; border: none; border-radius: 4px; padding: .18rem .4rem; font-size: .48rem; font-weight: 600; cursor: pointer; }
  .ph-powered { font-size: .45rem; color: #b5893a; text-align: center; padding: .35rem; background: #fff; opacity: .6; }

  /* ── FEATURES HORIZONTAL ── */
  .features-list { display: flex; flex-direction: column; gap: 5rem; margin-top: 4rem; }
  .feature-row { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
  .feature-row.flip { direction: rtl; }
  .feature-row.flip > * { direction: ltr; }
  .feature-number { font-family: 'Playfair Display', serif; font-size: 5rem; color: var(--border); line-height: 1; margin-bottom: .5rem; }
  .feature-name { font-family: 'Playfair Display', serif; font-size: 1.7rem; font-weight: 500; color: var(--ink); margin-bottom: .6rem; }
  .feature-desc { font-size: .9rem; color: var(--ink-3); line-height: 1.75; font-weight: 300; margin-bottom: 1.25rem; }
  .feature-points { display: flex; flex-direction: column; gap: .4rem; }
  .feature-point { display: flex; align-items: center; gap: .6rem; font-size: .82rem; color: var(--ink-2); }
  .fp-check { width: 18px; height: 18px; border-radius: 50%; background: rgba(181,137,58,.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: .6rem; color: var(--gold); }
  .feature-visual { background: var(--white); border: 1px solid var(--border); border-radius: 16px; padding: 1.75rem; box-shadow: 0 8px 40px rgba(0,0,0,.06); }

  /* ── STATS ── */
  .stats-bg { background: var(--ink); }
  .stats-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 2rem; text-align: center; }
  .stat-num { font-family: 'Playfair Display', serif; font-size: 4rem; font-weight: 500; color: var(--gold); line-height: 1; }
  .stat-lbl { font-size: .82rem; color: rgba(255,255,255,.35); margin-top: .5rem; font-weight: 300; }

  /* ── TESTIMONIALS ── */
  .testi-bg { background: var(--white); }
  .testi-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.25rem; margin-top: 3.5rem; align-items: start; }
  .testi-card { background: var(--cream); border: 1px solid var(--border); border-radius: 16px; padding: 2rem; position: relative; transition: all .3s; }
  .testi-card:hover { transform: translateY(-6px); box-shadow: 0 24px 48px rgba(0,0,0,.08); border-color: rgba(181,137,58,.2); }
  .testi-card.featured { background: var(--ink); border-color: transparent; }
  .testi-stars { display: flex; gap: .2rem; margin-bottom: 1rem; }
  .testi-star { color: var(--gold); font-size: .85rem; }
  .testi-text { font-size: .88rem; line-height: 1.75; font-weight: 300; margin-bottom: 1.5rem; }
  .testi-card:not(.featured) .testi-text { color: var(--ink-2); }
  .testi-card.featured .testi-text { color: rgba(255,255,255,.65); }
  .testi-author { display: flex; align-items: center; gap: .75rem; }
  .testi-av { width: 38px; height: 38px; border-radius: 50%; background: rgba(181,137,58,.15); border: 1px solid rgba(181,137,58,.25); display: flex; align-items: center; justify-content: center; font-size: .8rem; font-weight: 600; color: var(--gold); flex-shrink: 0; }
  .testi-name { font-size: .84rem; font-weight: 600; }
  .testi-card:not(.featured) .testi-name { color: var(--ink); }
  .testi-card.featured .testi-name { color: #fff; }
  .testi-handle { font-size: .72rem; }
  .testi-card:not(.featured) .testi-handle { color: var(--ink-3); }
  .testi-card.featured .testi-handle { color: rgba(255,255,255,.3); }
  .testi-quote-mark { font-family: 'Playfair Display', serif; font-size: 4rem; line-height: .8; position: absolute; top: 1.5rem; right: 1.75rem; }
  .testi-card:not(.featured) .testi-quote-mark { color: var(--border); }
  .testi-card.featured .testi-quote-mark { color: rgba(181,137,58,.15); }

  /* ── HOW IT WORKS ── */
  .how-bg { background: var(--cream); }
  .steps { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.5rem; margin-top: 4rem; position: relative; }
  .steps::after { content: ''; position: absolute; top: 36px; left: calc(16.6% + 28px); right: calc(16.6% + 28px); height: 1px; background: linear-gradient(90deg, var(--gold), transparent 50%, var(--gold)); opacity: .2; }
  .step { text-align: center; }
  .step-circle { width: 64px; height: 64px; border-radius: 50%; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; background: var(--white); box-shadow: 0 4px 16px rgba(0,0,0,.05); }
  .step-circle svg { width: 22px; height: 22px; stroke: var(--gold); fill: none; stroke-width: 1.5; }
  .step-num { font-family: 'Playfair Display', serif; font-size: 2.5rem; color: var(--border); line-height: 1; margin-bottom: .75rem; }
  .step-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; color: var(--ink); margin-bottom: .4rem; }
  .step-desc { font-size: .82rem; color: var(--ink-3); line-height: 1.65; font-weight: 300; }

  /* ── PRICING ── */
  .pricing-bg { background: var(--white); }
  .pricing-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.25rem; margin-top: 3.5rem; align-items: start; }
  .plan { background: var(--cream); border: 1px solid var(--border); border-radius: 16px; padding: 2rem; position: relative; transition: all .2s; }
  .plan:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,.07); }
  .plan.featured { background: var(--ink); border-color: transparent; }
  .plan-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--gold); color: #fff; font-size: .66rem; font-weight: 600; letter-spacing: .07em; text-transform: uppercase; padding: .28rem .9rem; border-radius: 20px; white-space: nowrap; }
  .plan-name { font-size: .7rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: var(--ink-3); margin-bottom: .65rem; }
  .plan.featured .plan-name { color: rgba(255,255,255,.35); }
  .plan-price { font-family: 'Playfair Display', serif; font-size: 2.8rem; font-weight: 500; color: var(--ink); line-height: 1; }
  .plan.featured .plan-price { color: #fff; }
  .plan-price sup { font-size: 1.1rem; font-family: 'DM Sans', sans-serif; font-weight: 300; vertical-align: top; margin-top: .4rem; display: inline-block; }
  .plan-price sub { font-size: .82rem; font-family: 'DM Sans', sans-serif; color: var(--ink-3); }
  .plan.featured .plan-price sub { color: rgba(255,255,255,.3); }
  .plan-desc { font-size: .78rem; color: var(--ink-3); margin-top: .4rem; margin-bottom: 1.5rem; }
  .plan.featured .plan-desc { color: rgba(255,255,255,.3); }
  .plan-divider { height: 1px; background: var(--border); margin-bottom: 1.25rem; }
  .plan.featured .plan-divider { background: rgba(255,255,255,.07); }
  .plan-feats { display: flex; flex-direction: column; gap: .55rem; margin-bottom: 1.75rem; }
  .plan-feat { display: flex; align-items: flex-start; gap: .5rem; font-size: .8rem; }
  .plan-feat.ok { color: var(--ink-2); }
  .plan.featured .plan-feat.ok { color: rgba(255,255,255,.55); }
  .plan-feat.no { color: var(--ink-3); opacity: .4; }
  .feat-mark { font-size: .75rem; margin-top: 1px; flex-shrink: 0; }
  .feat-mark.yes { color: var(--gold); }
  .feat-mark.nope { color: var(--ink-3); }
  .plan-btn { width: 100%; padding: .78rem; border-radius: 9px; font-size: .84rem; font-weight: 500; cursor: pointer; font-family: inherit; transition: all .2s; border: 1px solid var(--border); background: var(--white); color: var(--ink); }
  .plan-btn:hover { background: var(--ink); color: #fff; border-color: var(--ink); }
  .plan-btn.featured-btn { background: var(--gold); color: #fff; border-color: var(--gold); }
  .plan-btn.featured-btn:hover { background: #9e7630; }

  /* ── FINAL CTA ── */
  .cta-bg { background: var(--ink); padding: 8rem 2rem; text-align: center; position: relative; overflow: hidden; }
  .cta-glow { position: absolute; bottom: -20%; left: 50%; transform: translateX(-50%); width: 700px; height: 400px; background: radial-gradient(ellipse, rgba(181,137,58,.18), transparent 70%); pointer-events: none; }
  .cta-title { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 4.5vw, 3.5rem); font-weight: 500; color: #fff; margin-bottom: 1rem; }
  .cta-title em { font-style: italic; color: var(--gold); }
  .cta-sub { font-size: .95rem; color: rgba(255,255,255,.35); line-height: 1.75; font-weight: 300; max-width: 440px; margin: 0 auto 2.5rem; }

  /* ── FOOTER ── */
  footer { background: #080807; padding: 2.5rem 3rem; border-top: 1px solid rgba(255,255,255,.05); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
  .foot-logo { font-family: 'Playfair Display', serif; font-size: 1.1rem; color: rgba(255,255,255,.3); }
  .foot-logo span { color: var(--gold); }
  .foot-links { display: flex; gap: 2rem; }
  .foot-link { font-size: .72rem; color: rgba(255,255,255,.2); cursor: pointer; transition: color .15s; }
  .foot-link:hover { color: rgba(255,255,255,.5); }
  .foot-copy { font-size: .7rem; color: rgba(255,255,255,.12); }

  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }

  @media(max-width:900px){
    .dm-grid{grid-template-columns:1fr;}
    .split{grid-template-columns:1fr;gap:2.5rem;}
    .feature-row{grid-template-columns:1fr;}
    .feature-row.flip{direction:ltr;}
    .stats-grid{grid-template-columns:1fr;gap:1.5rem;}
    .testi-grid{grid-template-columns:1fr;}
    .steps{grid-template-columns:1fr;} .steps::after{display:none;}
    .pricing-grid{grid-template-columns:1fr;}
    .features-list{gap:3rem;}
  }
  @media(max-width:600px){
    .nav{padding:0 1.25rem;} .nav-links{display:none;}
    .section{padding:4rem 1.25rem;}
    .hero{padding:6rem 1.25rem 4rem;}
    .trust-bar{gap:1.25rem;}
  }
`

const plans = [
  { name:'Starter', price:19, desc:'For solo professionals just starting.', featured:false,
    feats:[{ok:true,t:'Public profile & booking page'},{ok:true,t:'Up to 5 services'},{ok:true,t:'Basic client management'},{ok:false,t:'Product shop'},{ok:false,t:'Formations & courses'},{ok:false,t:'Revenue analytics'}]},
  { name:'Pro', price:39, desc:'For professionals growing their brand.', featured:true,
    feats:[{ok:true,t:'Everything in Starter'},{ok:true,t:'Unlimited services'},{ok:true,t:'Product shop'},{ok:true,t:'Formations & courses'},{ok:true,t:'Revenue analytics'},{ok:true,t:'Automated reminders'}]},
  { name:'Studio', price:69, desc:'For teams and multi-staff businesses.', featured:false,
    feats:[{ok:true,t:'Everything in Pro'},{ok:true,t:'Up to 5 staff members'},{ok:true,t:'Custom domain'},{ok:true,t:'White-label branding'},{ok:true,t:'Priority support'},{ok:true,t:'Monthly strategy call'}]},
]

export default function Landing() {
  const navigate = useNavigate()
  useReveal()

  return (
    <div>
      <style>{css}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo" onClick={()=>navigate('/')}>Organized<span>.</span></div>
        <div className="nav-links">
          <span className="nav-link" onClick={()=>document.getElementById('how')?.scrollIntoView({behavior:'smooth'})}>How it works</span>
          <span className="nav-link" onClick={()=>document.getElementById('pricing')?.scrollIntoView({behavior:'smooth'})}>Pricing</span>
          <span className="nav-link" onClick={()=>document.getElementById('stories')?.scrollIntoView({behavior:'smooth'})}>Stories</span>
        </div>
        <div className="nav-right">
          <span className="nav-signin" onClick={()=>navigate('/auth')}>Sign in</span>
          <button className="nav-cta" onClick={()=>navigate('/auth')}>Get started free</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-blob"/><div className="hero-blob-2"/>
        <div className="hero-tag"><span className="hero-tag-pip">NEW</span>Built for every service business</div>
        <h1 className="hero-h1">Stop running your business<br/><em>from your DMs.</em></h1>
        <p className="hero-sub">One link. Your bookings, products, and courses — all in one professional page. No code. No chaos.</p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={()=>navigate('/auth')}>Start free — no card needed</button>
          <button className="btn-outline" onClick={()=>document.getElementById('how')?.scrollIntoView({behavior:'smooth'})}>See how it works</button>
        </div>
        <p className="hero-note">14-day free trial · Cancel anytime · Setup in 10 minutes</p>
      </section>

      {/* TRUST BAR */}
      <div className="trust-bar rv">
        {[['✓','14-day free trial'],['✓','No credit card required'],['✓','Setup in under 10 minutes'],['✓','Cancel anytime']].map(([icon,t],i)=>(
          <div key={i} className="trust-item"><span className="trust-icon" style={{color:'var(--gold)'}}>{icon}</span>{t}</div>
        ))}
      </div>

      {/* PROBLEM */}
      <section className="section problem-bg" style={{paddingBottom:'5rem'}}>
        <div className="container">
          <div className="rv" style={{textAlign:'center'}}>
            <div className="section-tag" style={{color:'rgba(181,137,58,.8)'}}>The problem</div>
            <div className="section-title" style={{color:'#fff',maxWidth:'700px',margin:'0 auto'}}>Talented professionals losing time and money <em>to their inbox.</em></div>
          </div>
          <div className="dm-grid" style={{marginTop:'3rem'}}>
            {[
              {from:'kezia_b', msgs:[{t:'Hey do you do knotless? How much?',sent:false},{t:'Yes! Starting at $200 — depends on length',sent:true},{t:'Can I come Saturday morning? Anyyy time?',sent:false}]},
              {from:'nadia.naturals', msgs:[{t:'What products do you sell? Do you ship?',sent:false},{t:'I sell my own line! Serum is $28, ships Canada-wide',sent:true},{t:'How do I order? E-transfer or card?',sent:false}]},
              {from:'tasha__r', msgs:[{t:'I want a silk press next week!',sent:false},{t:'I have openings Wed or Thurs — which works?',sent:true},{t:'Either honestly, whatever you have 🙏',sent:false}]},
            ].map((dm,i)=>(
              <div key={i} className={`dm-card rv d${i+1}`}>
                <div className="dm-head"><div className="dm-dot"/><div className="dm-platform">@{dm.from}</div></div>
                {dm.msgs.map((m,j)=>(
                  <div key={j} className="dm-msg" style={{flexDirection:m.sent?'row-reverse':'row'}}>
                    {!m.sent&&<div className="dm-av">{dm.from[0].toUpperCase()}</div>}
                    <div>
                      <div className={m.sent?'dm-reply':'dm-bubble'}>{m.t}</div>
                      <div className="dm-time" style={{textAlign:m.sent?'right':'left'}}>{j===0?'2 days ago · unread':'Just now'}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="dm-vs rv">
            <div className="dm-vs-line"/>
            <div className="dm-vs-text">Organized ends this</div>
            <div className="dm-vs-line"/>
          </div>
        </div>
      </section>

      {/* CLIENT PAGE DEMO */}
      <section className="section" style={{background:'#fff'}}>
        <div className="container">
          <div className="split">
            <div className="rv rv-left">
              <div className="section-tag">Your public profile</div>
              <div className="section-title">One link.<br/><em>Everything.</em></div>
              <div className="section-sub">Share it in your bio. Clients book appointments, order products, and sign up for your courses — without ever DMing you.</div>
              <div style={{marginTop:'1.75rem',display:'flex',flexDirection:'column',gap:'.55rem'}}>
                {['Book appointments 24/7 — no back and forth','Sell products directly from your page','Offer courses and workshops','Clients don\'t need an account to book'].map((t,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:'.6rem',fontSize:'.84rem',color:'var(--ink-2)'}}>
                    <div style={{width:18,height:18,borderRadius:'50%',background:'rgba(181,137,58,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.65rem',color:'var(--gold)',flexShrink:0}}>✓</div>{t}
                  </div>
                ))}
              </div>
            </div>
            <div className="rv rv-right">
              <div className="phone-wrap">
                <div className="phone-glow"/>
                <div className="phone">
                  <div className="phone-notch"><div className="phone-notch-pill"/></div>
                  <div className="phone-screen">
                    <div className="ph-topbar"><div className="ph-name">Elixir Hair Studio</div></div>
                    <div className="ph-hero">
                      <div className="ph-av">E</div>
                      <div className="ph-title">Elixir Hair Studio</div>
                      <div className="ph-bio">Natural Hair Specialist · Montreal, QC</div>
                    </div>
                    <div className="ph-tabs">
                      <div className="ph-tab on">Book</div>
                      <div className="ph-tab">Shop</div>
                      <div className="ph-tab">Formations</div>
                    </div>
                    <div className="ph-body">
                      {[['Box Braids','$180'],['Silk Press','$95'],['Loc Retwist','$120'],['Color & Cut','$220']].map(([n,p],i)=>(
                        <div key={i} className="ph-svc">
                          <div className="ph-svc-bar"/>
                          <div className="ph-svc-name">{n}</div>
                          <div className="ph-svc-price">{p}</div>
                          <button className="ph-btn">Book</button>
                        </div>
                      ))}
                    </div>
                    <div className="ph-powered">Powered by Organized.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="section stats-bg">
        <div className="container">
          <div className="stats-grid">
            {[{to:2400,suffix:'+',lbl:'Professionals organized'},{to:89,suffix:'%',lbl:'Reduction in unanswered DMs'},{to:10,suffix:' min',lbl:'Average setup time'}].map((s,i)=>(
              <div key={i} className={`rv d${i+1}`} style={{textAlign:'center'}}>
                <div className="stat-num"><Counter to={s.to} suffix={s.suffix}/></div>
                <div className="stat-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section how-bg" id="how">
        <div className="container">
          <div className="rv" style={{textAlign:'center'}}>
            <div className="section-tag">How it works</div>
            <div className="section-title" style={{textAlign:'center'}}>Up and running <em>in minutes.</em></div>
          </div>
          <div className="steps">
            {[
              {icon:<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>,n:'01',title:'Create your account',desc:'Sign up in minutes. No credit card required to start your 14-day free trial.'},
              {icon:<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M3 10h18M8 2v4M16 2v4"/></svg>,n:'02',title:'Build your profile',desc:'Add services, products, and formations. Your public page is live the moment you finish.'},
              {icon:<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,n:'03',title:'Share your link',desc:'Post it in your bio. Clients click, book, and pay. You just show up.'},
            ].map((s,i)=>(
              <div key={i} className={`step rv d${i+1}`}>
                <div className="step-num">{s.n}</div>
                <div className="step-circle">{s.icon}</div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section testi-bg" id="stories">
        <div className="container">
          <div className="rv" style={{textAlign:'center'}}>
            <div className="section-tag">From the community</div>
            <div className="section-title" style={{textAlign:'center'}}>Professionals who made <em>the switch.</em></div>
          </div>
          <div className="testi-grid">
            {[
              {text:'Before Organized, I answered the same DMs every single day. Now clients book themselves, I wake up to confirmed appointments. I got my life back.',name:'Maya A.',handle:'@elixirbymaya',av:'M',featured:false},
              {text:'I launched my Box Braids Masterclass through my Organized page. Made back my subscription fee in the first week. This platform actually makes me money.',name:'Kezia B.',handle:'@keziahairstudio',av:'K',featured:true},
              {text:'My clients always comment on how professional my page looks. They think I paid a developer thousands. It\'s just Organized.',name:'Nadia L.',handle:'@nadianaturals',av:'N',featured:false},
            ].map((t,i)=>(
              <div key={i} className={`testi-card rv-scale d${i+1} ${t.featured?'featured':''}`}>
                <div className="testi-quote-mark">"</div>
                <div className="testi-stars">{[1,2,3,4,5].map(s=><span key={s} className="testi-star">★</span>)}</div>
                <div className="testi-text">{t.text}</div>
                <div className="testi-author">
                  <div className="testi-av">{t.av}</div>
                  <div><div className="testi-name">{t.name}</div><div className="testi-handle">{t.handle}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section pricing-bg" id="pricing">
        <div className="container">
          <div className="rv" style={{textAlign:'center'}}>
            <div className="section-tag">Pricing</div>
            <div className="section-title" style={{textAlign:'center'}}>Simple pricing. <em>Cancel anytime.</em></div>
            <div style={{fontSize:'.88rem',color:'var(--ink-3)',marginTop:'.75rem',textAlign:'center'}}>Every plan includes a 14-day free trial. No credit card required.</div>
          </div>
          <div className="pricing-grid">
            {plans.map((p,i)=>(
              <div key={i} className={`plan rv d${i+1} ${p.featured?'featured':''}`}>
                {p.featured&&<div className="plan-badge">Most popular</div>}
                <div className="plan-name">{p.name}</div>
                <div className="plan-price"><sup>$</sup>{p.price}<sub>/mo</sub></div>
                <div className="plan-desc">{p.desc}</div>
                <div className="plan-divider"/>
                <div className="plan-feats">
                  {p.feats.map((f,j)=>(
                    <div key={j} className={`plan-feat ${f.ok?'ok':'no'}`}>
                      <span className={`feat-mark ${f.ok?'yes':'nope'}`}>{f.ok?'✓':'×'}</span>{f.t}
                    </div>
                  ))}
                </div>
                <button className={`plan-btn ${p.featured?'featured-btn':''}`} onClick={()=>navigate('/auth')}>Start free trial</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="cta-bg">
        <div className="cta-glow"/>
        <div className="rv" style={{position:'relative',zIndex:1}}>
          <div className="section-tag" style={{color:'rgba(181,137,58,.8)',textAlign:'center'}}>Get started today</div>
          <div className="cta-title">Your clients deserve a <em>professional experience.</em></div>
          <div className="cta-sub">Join thousands of service professionals who replaced their DM chaos with a system that works while they sleep.</div>
          <div style={{display:'flex',gap:'1rem',justifyContent:'center',flexWrap:'wrap'}}>
            <button className="btn-primary" style={{background:'var(--gold)'}} onClick={()=>navigate('/auth')}>Start your free trial</button>
            <button className="btn-outline" style={{color:'rgba(255,255,255,.5)',borderColor:'rgba(255,255,255,.15)'}} onClick={()=>document.getElementById('how')?.scrollIntoView({behavior:'smooth'})}>See how it works</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="foot-logo">Organized<span>.</span></div>
        <div className="foot-links">
          {['Privacy','Terms','Contact','Instagram'].map(l=><span key={l} className="foot-link">{l}</span>)}
        </div>
        <div className="foot-copy">© 2026 Organized — beorganized.io</div>
      </footer>
    </div>
  )
}
