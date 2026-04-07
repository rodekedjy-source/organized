import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

// ── SCROLL REVEAL HOOK ───────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.1 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

// ── COUNTER ANIMATION ────────────────────────────────────────
function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef()
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0
        const step = target / 60
        const timer = setInterval(() => {
          start += step
          if (start >= target) { setCount(target); clearInterval(timer) }
          else setCount(Math.floor(start))
        }, 16)
      }
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [target])
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'DM Sans', sans-serif; background: #0d0c0a; color: #fff; overflow-x: hidden; }

  :root {
    --gold: #b5893a;
    --gold-lt: rgba(181,137,58,.15);
    --ink: #0d0c0a;
    --cream: #f7f5f0;
    --border: rgba(255,255,255,.08);
  }

  /* ── NAV ── */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 2.5rem; height: 58px;
    background: rgba(13,12,10,.85);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
    transition: all .3s;
  }
  .nav-logo { font-family: 'Playfair Display', serif; font-size: 1.25rem; font-weight: 500; color: #fff; cursor: pointer; }
  .nav-logo span { color: var(--gold); }
  .nav-links { display: flex; gap: 2rem; }
  .nav-link { font-size: .8rem; color: rgba(255,255,255,.45); cursor: pointer; transition: color .2s; font-weight: 400; }
  .nav-link:hover { color: #fff; }
  .nav-cta { background: var(--gold); color: #fff; border: none; border-radius: 7px; padding: .5rem 1.25rem; font-size: .82rem; font-weight: 500; cursor: pointer; font-family: inherit; transition: all .2s; }
  .nav-cta:hover { background: #9e7630; transform: translateY(-1px); }

  /* ── REVEAL ── */
  .reveal { opacity: 0; transform: translateY(32px); transition: opacity .8s ease, transform .8s ease; }
  .reveal.visible { opacity: 1; transform: translateY(0); }
  .reveal-d1 { transition-delay: .1s; }
  .reveal-d2 { transition-delay: .2s; }
  .reveal-d3 { transition-delay: .3s; }
  .reveal-d4 { transition-delay: .4s; }

  /* ── HERO ── */
  .hero {
    min-height: 100vh;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center; padding: 7rem 2rem 5rem;
    position: relative; overflow: hidden;
  }
  .hero-video {
    position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
    opacity: .12; filter: blur(2px); pointer-events: none;
  }
  .hero-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to bottom, rgba(13,12,10,.4) 0%, rgba(13,12,10,.7) 60%, #0d0c0a 100%);
    pointer-events: none;
  }
  .hero-glow {
    position: absolute; top: -15%; left: 50%; transform: translateX(-50%);
    width: 800px; height: 600px;
    background: radial-gradient(ellipse, rgba(181,137,58,.2) 0%, transparent 65%);
    pointer-events: none;
  }
  .hero-tag {
    display: inline-flex; align-items: center; gap: .5rem;
    border: 1px solid rgba(181,137,58,.35); border-radius: 20px;
    padding: .35rem 1rem; font-size: .72rem; font-weight: 500;
    color: var(--gold); letter-spacing: .08em; text-transform: uppercase;
    margin-bottom: 2rem; position: relative; z-index: 1;
    animation: fadeUp .6s ease both;
  }
  .hero-tag-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--gold); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
  .hero-h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2.4rem, 6vw, 5.5rem);
    font-weight: 500; color: #fff; line-height: 1.05; letter-spacing: -.02em;
    max-width: 860px; position: relative; z-index: 1; margin-bottom: 1.5rem;
    animation: fadeUp .7s .1s ease both;
  }
  .hero-h1 em { font-style: italic; color: var(--gold); }
  .hero-sub {
    font-size: 1.05rem; color: rgba(255,255,255,.45); max-width: 500px;
    line-height: 1.75; font-weight: 300; position: relative; z-index: 1;
    margin-bottom: 2.75rem; animation: fadeUp .7s .2s ease both;
  }
  .hero-actions { display: flex; gap: .85rem; justify-content: center; position: relative; z-index: 1; animation: fadeUp .7s .3s ease both; flex-wrap: wrap; }
  .btn-hero { background: var(--gold); color: #fff; border: none; border-radius: 8px; padding: .9rem 2rem; font-size: .9rem; font-weight: 500; cursor: pointer; font-family: inherit; transition: all .2s; }
  .btn-hero:hover { background: #9e7630; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(181,137,58,.3); }
  .btn-ghost { background: transparent; color: rgba(255,255,255,.6); border: 1px solid rgba(255,255,255,.15); border-radius: 8px; padding: .9rem 2rem; font-size: .9rem; cursor: pointer; font-family: inherit; transition: all .2s; }
  .btn-ghost:hover { border-color: rgba(255,255,255,.4); color: #fff; }
  .hero-note { font-size: .72rem; color: rgba(255,255,255,.2); margin-top: 1.25rem; position: relative; z-index: 1; animation: fadeUp .7s .4s ease both; }

  /* ── DASHBOARD MOCKUP ── */
  .mockup-wrap { position: relative; z-index: 1; margin-top: 5rem; width: 100%; max-width: 960px; animation: fadeUp .8s .5s ease both; }
  .mockup-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 80%; height: 60%; background: radial-gradient(ellipse, rgba(181,137,58,.25), transparent 70%); filter: blur(40px); pointer-events: none; }
  .mockup-frame {
    background: #1a1815; border: 1px solid rgba(255,255,255,.1);
    border-radius: 14px; overflow: hidden;
    box-shadow: 0 48px 100px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.05);
    position: relative;
  }
  .mockup-bar { background: #111; border-bottom: 1px solid rgba(255,255,255,.06); height: 36px; display: flex; align-items: center; padding: 0 1rem; gap: .4rem; }
  .mockup-dot { width: 9px; height: 9px; border-radius: 50%; }
  .mockup-url { flex: 1; background: rgba(255,255,255,.05); border-radius: 4px; height: 18px; margin: 0 .75rem; display: flex; align-items: center; padding: 0 .5rem; }
  .mockup-url span { font-size: .58rem; color: rgba(255,255,255,.25); font-family: monospace; }
  .mockup-body { display: flex; height: 280px; }
  .mockup-sidebar { width: 130px; background: #111; border-right: 1px solid rgba(255,255,255,.06); padding: .75rem 0; flex-shrink: 0; }
  .m-nav { display: flex; align-items: center; gap: .4rem; padding: .4rem .75rem; font-size: .58rem; color: rgba(255,255,255,.3); }
  .m-nav.active { color: var(--gold); background: rgba(181,137,58,.07); border-left: 2px solid var(--gold); }
  .m-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; opacity: .6; flex-shrink: 0; }
  .mockup-main { flex: 1; padding: 1rem; display: flex; flex-direction: column; gap: .75rem; overflow: hidden; }
  .m-stat-row { display: grid; grid-template-columns: repeat(4,1fr); gap: .5rem; }
  .m-stat { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.06); border-radius: 7px; padding: .55rem .7rem; }
  .m-stat-l { font-size: .44rem; color: rgba(255,255,255,.3); text-transform: uppercase; letter-spacing: .06em; margin-bottom: .2rem; }
  .m-stat-v { font-family: 'Playfair Display', serif; font-size: .95rem; color: #fff; }
  .m-card { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06); border-radius: 7px; padding: .55rem .7rem; flex: 1; overflow: hidden; }
  .m-card-title { font-size: .52rem; font-weight: 600; color: rgba(255,255,255,.5); margin-bottom: .4rem; }
  .m-row { display: flex; gap: .5rem; align-items: center; padding: .3rem 0; border-bottom: 1px solid rgba(255,255,255,.04); }
  .m-row:last-child { border-bottom: none; }
  .m-cell { font-size: .5rem; color: rgba(255,255,255,.45); flex: 1; }
  .m-cell.name { color: rgba(255,255,255,.75); font-weight: 500; }
  .m-cell.gold { color: var(--gold); font-weight: 600; }
  .m-badge { padding: 1px 5px; border-radius: 8px; font-size: .42rem; font-weight: 600; background: rgba(46,125,82,.2); color: #4ade80; }
  .m-badge.p { background: rgba(202,138,4,.15); color: #fbbf24; }

  /* ── PROBLEM SECTION ── */
  .section { padding: 7rem 2rem; }
  .section-dark { background: #0d0c0a; }
  .section-light { background: #fff; }
  .section-cream { background: var(--cream); }
  .container { max-width: 1100px; margin: 0 auto; }
  .section-tag { font-size: .7rem; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--gold); margin-bottom: .85rem; }
  .section-title { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 4vw, 3.2rem); font-weight: 500; line-height: 1.15; }
  .section-title em { font-style: italic; color: var(--gold); }
  .section-title.light { color: #fff; }
  .section-title.dark { color: #0d0c0a; }
  .section-sub { font-size: .95rem; line-height: 1.75; font-weight: 300; max-width: 520px; margin-top: .85rem; }
  .section-sub.light { color: rgba(255,255,255,.4); }
  .section-sub.dark { color: #7a7672; }

  /* DM cards */
  .dm-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1rem; margin-top: 3rem; }
  .dm-card { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 12px; padding: 1.25rem; }
  .dm-header { display: flex; align-items: center; gap: .5rem; margin-bottom: .85rem; padding-bottom: .65rem; border-bottom: 1px solid rgba(255,255,255,.07); }
  .dm-platform { font-size: .68rem; color: rgba(255,255,255,.3); letter-spacing: .03em; }
  .dm-live { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; }
  .dm-msg { display: flex; gap: .5rem; margin-bottom: .5rem; }
  .dm-av { width: 22px; height: 22px; border-radius: 50%; background: rgba(181,137,58,.3); flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: .55rem; font-weight: 700; color: var(--gold); }
  .dm-bubble { background: rgba(255,255,255,.07); border-radius: 0 7px 7px 7px; padding: .4rem .6rem; font-size: .72rem; color: rgba(255,255,255,.6); line-height: 1.5; }
  .dm-time { font-size: .6rem; color: rgba(255,255,255,.2); margin-top: .2rem; }

  /* ── CLIENT PAGE PREVIEW ── */
  .preview-split { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center; }
  .preview-phone {
    background: #1a1815; border: 1px solid rgba(255,255,255,.1);
    border-radius: 24px; overflow: hidden; max-width: 280px; margin: 0 auto;
    box-shadow: 0 32px 64px rgba(0,0,0,.5);
  }
  .phone-bar { background: #111; height: 30px; display: flex; align-items: center; padding: 0 1rem; gap: .3rem; }
  .phone-dot { width: 7px; height: 7px; border-radius: 50%; }
  .phone-hero { background: #0d0c0a; padding: 1.5rem 1rem 1rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,.06); }
  .phone-av { width: 48px; height: 48px; border-radius: 50%; background: #2a2a2a; border: 1px solid rgba(181,137,58,.4); margin: 0 auto .6rem; display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-size: 1.1rem; color: var(--gold); }
  .phone-name { font-family: 'Playfair Display', serif; font-size: .95rem; color: #fff; }
  .phone-bio { font-size: .6rem; color: rgba(255,255,255,.35); margin-top: .2rem; }
  .phone-tabs { display: flex; border-bottom: 1px solid rgba(255,255,255,.06); }
  .phone-tab { flex: 1; padding: .55rem; font-size: .6rem; color: rgba(255,255,255,.3); text-align: center; }
  .phone-tab.active { color: var(--gold); border-bottom: 1px solid var(--gold); }
  .phone-body { padding: .75rem; }
  .phone-svc { display: flex; align-items: center; gap: .5rem; padding: .5rem; border: 1px solid rgba(255,255,255,.06); border-radius: 7px; margin-bottom: .4rem; }
  .phone-svc-bar { width: 2px; height: 24px; background: var(--gold); border-radius: 1px; flex-shrink: 0; opacity: .5; }
  .phone-svc-name { font-size: .62rem; color: rgba(255,255,255,.8); flex: 1; }
  .phone-svc-price { font-family: 'Playfair Display', serif; font-size: .75rem; color: var(--gold); }
  .phone-svc-btn { background: #fff; color: #0d0c0a; border: none; border-radius: 4px; padding: .2rem .4rem; font-size: .52rem; font-weight: 600; cursor: pointer; }

  /* ── FEATURES ── */
  .features-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 1.25rem; margin-top: 3.5rem; }
  .feature-card { border: 1px solid rgba(255,255,255,.08); border-radius: 14px; padding: 2rem; transition: all .25s; cursor: default; background: rgba(255,255,255,.02); }
  .feature-card:hover { border-color: rgba(181,137,58,.35); background: rgba(181,137,58,.05); transform: translateY(-3px); }
  .feature-num { font-family: 'Playfair Display', serif; font-size: 2.5rem; color: rgba(181,137,58,.15); margin-bottom: .75rem; line-height: 1; }
  .feature-name { font-family: 'Playfair Display', serif; font-size: 1.2rem; color: #fff; margin-bottom: .5rem; }
  .feature-desc { font-size: .83rem; color: rgba(255,255,255,.35); line-height: 1.7; font-weight: 300; }

  /* ── STATS ── */
  .stats-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 2rem; margin-top: 3rem; text-align: center; }
  .stat-num { font-family: 'Playfair Display', serif; font-size: 3.5rem; font-weight: 500; color: var(--gold); line-height: 1; }
  .stat-lbl { font-size: .8rem; color: rgba(255,255,255,.35); margin-top: .4rem; font-weight: 300; letter-spacing: .04em; }

  /* ── HOW IT WORKS ── */
  .steps-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 2rem; margin-top: 4rem; position: relative; }
  .steps-row::before { content:''; position:absolute; top:32px; left:calc(16.6% + 24px); right:calc(16.6% + 24px); height:1px; background:linear-gradient(90deg,var(--gold),transparent 50%,var(--gold)); opacity:.15; }
  .step { text-align: center; }
  .step-num { font-family: 'Playfair Display', serif; font-size: 2.8rem; color: rgba(181,137,58,.18); margin-bottom: .75rem; }
  .step-icon { width: 52px; height: 52px; border-radius: 50%; border: 1px solid rgba(181,137,58,.2); display: flex; align-items: center; justify-content: center; margin: 0 auto .75rem; background: rgba(181,137,58,.05); }
  .step-icon svg { width: 20px; height: 20px; stroke: var(--gold); fill: none; stroke-width: 1.5; }
  .step-title { font-family: 'Playfair Display', serif; font-size: 1.05rem; color: #fff; margin-bottom: .4rem; }
  .step-desc { font-size: .8rem; color: rgba(255,255,255,.3); line-height: 1.65; font-weight: 300; }

  /* ── PRICING ── */
  .pricing-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.25rem; margin-top: 3.5rem; align-items: start; }
  .plan { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.08); border-radius: 14px; padding: 2rem; position: relative; transition: all .2s; }
  .plan:hover { border-color: rgba(181,137,58,.2); }
  .plan.featured { background: rgba(181,137,58,.07); border-color: rgba(181,137,58,.3); }
  .plan-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--gold); color: #fff; font-size: .66rem; font-weight: 600; letter-spacing: .07em; text-transform: uppercase; padding: .25rem .85rem; border-radius: 20px; white-space: nowrap; }
  .plan-name { font-size: .7rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.35); margin-bottom: .65rem; }
  .plan-price { font-family: 'Playfair Display', serif; font-size: 2.8rem; font-weight: 500; color: #fff; line-height: 1; }
  .plan-price sup { font-size: 1.1rem; font-family: 'DM Sans', sans-serif; font-weight: 300; vertical-align: top; margin-top: .4rem; display: inline-block; }
  .plan-price sub { font-size: .82rem; font-family: 'DM Sans', sans-serif; color: rgba(255,255,255,.3); }
  .plan-desc { font-size: .78rem; color: rgba(255,255,255,.3); margin-top: .4rem; margin-bottom: 1.5rem; }
  .plan-divider { height: 1px; background: rgba(255,255,255,.07); margin-bottom: 1.25rem; }
  .plan-features { display: flex; flex-direction: column; gap: .5rem; margin-bottom: 1.75rem; }
  .plan-feat { display: flex; align-items: flex-start; gap: .5rem; font-size: .78rem; color: rgba(255,255,255,.5); }
  .feat-check { color: var(--gold); font-size: .8rem; margin-top: 1px; flex-shrink: 0; }
  .feat-x { color: rgba(255,255,255,.15); font-size: .8rem; margin-top: 1px; flex-shrink: 0; }
  .plan-btn { width: 100%; padding: .75rem; border-radius: 8px; font-size: .84rem; font-weight: 500; cursor: pointer; font-family: inherit; border: 1px solid rgba(255,255,255,.12); background: transparent; color: rgba(255,255,255,.6); transition: all .2s; }
  .plan-btn:hover { background: rgba(255,255,255,.06); color: #fff; }
  .plan-btn.gold { background: var(--gold); color: #fff; border-color: var(--gold); }
  .plan-btn.gold:hover { background: #9e7630; }

  /* ── TESTIMONIALS ── */
  .testi-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.25rem; margin-top: 3rem; }
  .testi { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07); border-radius: 12px; padding: 1.75rem; }
  .testi-quote { font-family: 'Playfair Display', serif; font-size: 1.75rem; color: rgba(181,137,58,.25); line-height: 1; margin-bottom: .65rem; }
  .testi-text { font-size: .83rem; color: rgba(255,255,255,.5); line-height: 1.7; font-weight: 300; margin-bottom: 1.25rem; }
  .testi-author { display: flex; align-items: center; gap: .65rem; }
  .testi-av { width: 32px; height: 32px; border-radius: 50%; background: rgba(181,137,58,.2); display: flex; align-items: center; justify-content: center; font-size: .72rem; font-weight: 600; color: var(--gold); }
  .testi-name { font-size: .8rem; font-weight: 500; color: rgba(255,255,255,.7); }
  .testi-handle { font-size: .7rem; color: rgba(255,255,255,.25); }

  /* ── FINAL CTA ── */
  .final-cta { padding: 8rem 2rem; text-align: center; position: relative; overflow: hidden; }
  .final-cta::before { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 800px; height: 400px; background: radial-gradient(ellipse, rgba(181,137,58,.15), transparent 70%); pointer-events: none; }

  /* ── FOOTER ── */
  .footer { background: #080807; padding: 2.5rem; border-top: 1px solid rgba(255,255,255,.05); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
  .footer-logo { font-family: 'Playfair Display', serif; font-size: 1.1rem; color: rgba(255,255,255,.3); }
  .footer-logo span { color: var(--gold); }
  .footer-links { display: flex; gap: 1.5rem; }
  .footer-link { font-size: .72rem; color: rgba(255,255,255,.2); cursor: pointer; transition: color .15s; }
  .footer-link:hover { color: rgba(255,255,255,.5); }
  .footer-copy { font-size: .7rem; color: rgba(255,255,255,.12); }

  /* ── ANIMATIONS ── */
  @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }

  /* ── RESPONSIVE ── */
  @media (max-width: 900px) {
    .dm-grid { grid-template-columns: 1fr; }
    .features-grid { grid-template-columns: 1fr; }
    .pricing-grid { grid-template-columns: 1fr; }
    .testi-grid { grid-template-columns: 1fr; }
    .steps-row { grid-template-columns: 1fr; }
    .steps-row::before { display: none; }
    .preview-split { grid-template-columns: 1fr; }
    .stats-row { grid-template-columns: 1fr; gap: 1.5rem; }
    .m-stat-row { grid-template-columns: repeat(2,1fr); }
  }
  @media (max-width: 600px) {
    .nav { padding: 0 1.25rem; }
    .nav-links { display: none; }
    .hero { padding: 5rem 1.5rem 3.5rem; }
    .section { padding: 4rem 1.5rem; }
    .mockup-wrap { margin-top: 3rem; }
  }
`

const plans = [
  { name:'Starter', price:19, desc:'For solo professionals getting started.', featured:false,
    features:[
      {ok:true,t:'Public profile page'},
      {ok:true,t:'Online booking'},
      {ok:true,t:'Up to 5 services'},
      {ok:true,t:'Basic client management'},
      {ok:false,t:'Product shop'},
      {ok:false,t:'Formations & courses'},
    ]},
  { name:'Pro', price:39, desc:'For established professionals growing their brand.', featured:true,
    features:[
      {ok:true,t:'Everything in Starter'},
      {ok:true,t:'Unlimited services'},
      {ok:true,t:'Product shop'},
      {ok:true,t:'Formations & courses'},
      {ok:true,t:'Revenue analytics'},
      {ok:true,t:'Automated reminders'},
    ]},
  { name:'Studio', price:69, desc:'For teams and multi-staff businesses.', featured:false,
    features:[
      {ok:true,t:'Everything in Pro'},
      {ok:true,t:'Up to 5 staff members'},
      {ok:true,t:'Custom domain'},
      {ok:true,t:'White-label'},
      {ok:true,t:'Priority support'},
      {ok:true,t:'Monthly strategy call'},
    ]},
]

export default function Landing() {
  const navigate = useNavigate()
  useReveal()

  return (
    <div style={{background:'#0d0c0a',minHeight:'100vh'}}>
      <style>{css}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo" onClick={()=>navigate('/')}>Organized<span>.</span></div>
        <div className="nav-links">
          <span className="nav-link" onClick={()=>document.getElementById('features')?.scrollIntoView({behavior:'smooth'})}>Features</span>
          <span className="nav-link" onClick={()=>document.getElementById('pricing')?.scrollIntoView({behavior:'smooth'})}>Pricing</span>
          <span className="nav-link" onClick={()=>document.getElementById('testimonials')?.scrollIntoView({behavior:'smooth'})}>Stories</span>
        </div>
        <button className="nav-cta" onClick={()=>navigate('/auth')}>Get started free</button>
      </nav>

      {/* HERO */}
      <section className="hero">
        {/* Video background — ambient hair salon footage */}
        <video className="hero-video" autoPlay muted loop playsInline
          src="https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-hairdresser-cutting-hair-41826-large.mp4"/>
        <div className="hero-overlay"/>
        <div className="hero-glow"/>

        <div className="hero-tag"><span className="hero-tag-dot"/><span>Built for service-based businesses</span></div>

        <h1 className="hero-h1">
          Stop running your business<br/>
          <em>from your DMs.</em>
        </h1>

        <p className="hero-sub">
          Organized gives every service professional a beautiful booking page, product shop, and client system — in minutes, not months.
        </p>

        <div className="hero-actions">
          <button className="btn-hero" onClick={()=>navigate('/auth')}>Start free — no card needed</button>
          <button className="btn-ghost" onClick={()=>document.getElementById('demo')?.scrollIntoView({behavior:'smooth'})}>See how it works</button>
        </div>

        <p className="hero-note">14-day free trial · Cancel anytime · Setup in under 10 minutes</p>

        {/* Dashboard mockup */}
        <div className="mockup-wrap" id="demo">
          <div className="mockup-glow"/>
          <div className="mockup-frame">
            <div className="mockup-bar">
              <div className="mockup-dot" style={{background:'#ff5f57'}}/>
              <div className="mockup-dot" style={{background:'#febc2e'}}/>
              <div className="mockup-dot" style={{background:'#28c840'}}/>
              <div className="mockup-url"><span>organized-two.vercel.app/dashboard</span></div>
            </div>
            <div className="mockup-body">
              <div className="mockup-sidebar">
                {['Overview','Services','Appointments','Products','Formations','Clients'].map((item,i) => (
                  <div key={i} className={`m-nav ${i===0?'active':''}`}><div className="m-dot"/>{item}</div>
                ))}
              </div>
              <div className="mockup-main">
                <div className="m-stat-row">
                  {[['Revenue','$3,240'],['Appointments','28'],['Products','6'],['Students','74']].map(([l,v],i)=>(
                    <div key={i} className="m-stat"><div className="m-stat-l">{l}</div><div className="m-stat-v">{v}</div></div>
                  ))}
                </div>
                <div className="m-card">
                  <div className="m-card-title">Today's appointments</div>
                  {[['Amara D.','Box Braids','$180','confirmed'],['Zoe M.','Silk Press','$95','confirmed'],['Kezia B.','Color & Cut','$220','pending'],['Nadia L.','Loc Retwist','$120','confirmed']].map(([c,s,a,st],i)=>(
                    <div key={i} className="m-row">
                      <div className="m-cell name">{c}</div>
                      <div className="m-cell">{s}</div>
                      <div className="m-cell gold">{a}</div>
                      <div className="m-cell"><span className={`m-badge ${st==='pending'?'p':''}`}>{st}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="section section-dark">
        <div className="container">
          <div className="reveal" style={{textAlign:'center',marginBottom:'1rem'}}>
            <div className="section-tag">The problem</div>
            <div className="section-title light">Every day, thousands of professionals<br/><em>lose money in their DMs.</em></div>
            <div className="section-sub light" style={{margin:'.85rem auto 0',textAlign:'center'}}>They answer the same questions, miss bookings, forget to follow up. Their talent is world-class. Their system isn't.</div>
          </div>
          <div className="dm-grid">
            {[
              {from:'kezia_b', msgs:['Hey do you do knotless? How much?','Can I come Saturday? What time are you free?']},
              {from:'nadia.hair', msgs:['What products do you sell? Do you ship?','How do I order? Do you take e-transfer?']},
              {from:'tasha__r', msgs:['I wanna book a silk press for next week','Wednesday or Thursday? Whichever you have open']},
            ].map((dm,i) => (
              <div key={i} className={`dm-card reveal reveal-d${i+1}`}>
                <div className="dm-header"><div className="dm-live"/><div className="dm-platform">Instagram DM · @{dm.from}</div></div>
                {dm.msgs.map((m,j) => (
                  <div key={j} className="dm-msg">
                    <div className="dm-av">{dm.from[0].toUpperCase()}</div>
                    <div><div className="dm-bubble">{m}</div><div className="dm-time">{j===0?'2 days ago':'Just now'} · unread</div></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLIENT PAGE PREVIEW */}
      <section className="section section-dark" style={{paddingTop:0}}>
        <div className="container">
          <div className="preview-split">
            <div className="reveal">
              <div className="section-tag">Your public profile</div>
              <div className="section-title light">One link.<br/><em>Everything they need.</em></div>
              <div className="section-sub light">Share your link in your bio. Clients book, shop, and enroll — without ever sliding into your DMs.</div>
              <div style={{marginTop:'2rem',display:'flex',flexDirection:'column',gap:'.6rem'}}>
                {['Book appointments 24/7','Order your products','Enroll in your courses','No account needed for clients'].map((t,i)=>(
                  <div key={i} className={`reveal reveal-d${i+1}`} style={{display:'flex',alignItems:'center',gap:'.6rem',fontSize:'.85rem',color:'rgba(255,255,255,.5)'}}>
                    <span style={{color:'var(--gold)',fontSize:'.9rem'}}>✓</span>{t}
                  </div>
                ))}
              </div>
            </div>
            <div className="reveal reveal-d2">
              <div className="preview-phone">
                <div className="phone-bar">
                  <div className="phone-dot" style={{background:'#ff5f57'}}/>
                  <div className="phone-dot" style={{background:'#febc2e'}}/>
                  <div className="phone-dot" style={{background:'#28c840'}}/>
                </div>
                <div className="phone-hero">
                  <div className="phone-av">E</div>
                  <div className="phone-name">Elixir Hair Studio</div>
                  <div className="phone-bio">Natural Hair Specialist · Montreal, QC</div>
                </div>
                <div className="phone-tabs">
                  <div className="phone-tab active">Book</div>
                  <div className="phone-tab">Shop</div>
                  <div className="phone-tab">Formations</div>
                </div>
                <div className="phone-body">
                  {[['Box Braids','$180'],['Silk Press','$95'],['Loc Retwist','$120']].map(([n,p],i)=>(
                    <div key={i} className="phone-svc">
                      <div className="phone-svc-bar"/>
                      <div className="phone-svc-name">{n}</div>
                      <div className="phone-svc-price">{p}</div>
                      <button className="phone-svc-btn">Book</button>
                    </div>
                  ))}
                  <div style={{fontSize:'.5rem',color:'rgba(255,255,255,.15)',textAlign:'center',marginTop:'.6rem',paddingTop:'.5rem',borderTop:'1px solid rgba(255,255,255,.05)'}}>Powered by Organized.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="section section-dark" style={{paddingTop:0}}>
        <div className="container">
          <div className="stats-row">
            {[
              {target:2400, suffix:'+', label:'Service professionals organized'},
              {target:89, suffix:'%', label:'Reduction in unanswered DMs'},
              {target:10, suffix:' min', label:'Average setup time'},
            ].map((s,i) => (
              <div key={i} className={`reveal reveal-d${i+1}`} style={{textAlign:'center'}}>
                <div className="stat-num"><Counter target={s.target} suffix={s.suffix}/></div>
                <div className="stat-lbl">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section section-dark" id="features">
        <div className="container">
          <div className="reveal" style={{textAlign:'center'}}>
            <div className="section-tag">What you get</div>
            <div className="section-title light">Everything your business needs.<br/><em>Nothing it doesn't.</em></div>
          </div>
          <div className="features-grid">
            {[
              {n:'01',name:'Appointment Booking',desc:'Clients book directly from your profile, 24/7. Real-time availability, automated confirmations, no back-and-forth.'},
              {n:'02',name:'Product Shop',desc:'Sell your products directly from your profile. Inventory tracking, clean checkout, no separate store needed.'},
              {n:'03',name:'Formations & Courses',desc:'Monetize your expertise. Sell workshops, masterclasses, or digital guides alongside your services.'},
              {n:'04',name:'Client Management',desc:'Every client, every visit, every dollar tracked automatically. Build relationships, not spreadsheets.'},
            ].map((f,i) => (
              <div key={i} className={`feature-card reveal reveal-d${(i%2)+1}`}>
                <div className="feature-num">{f.n}</div>
                <div className="feature-name">{f.name}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section section-dark" style={{borderTop:'1px solid rgba(255,255,255,.05)'}}>
        <div className="container">
          <div className="reveal" style={{textAlign:'center'}}>
            <div className="section-tag">How it works</div>
            <div className="section-title light">Up and running<br/><em>in under 10 minutes.</em></div>
          </div>
          <div className="steps-row">
            {[
              {icon:<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>,title:'Create your account',desc:'Sign up in minutes. No credit card required. Start your 14-day free trial instantly.'},
              {icon:<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M3 10h18M8 2v4M16 2v4"/></svg>,title:'Build your profile',desc:'Add your services, products, and formations. Your page is ready the moment you finish.'},
              {icon:<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,title:'Share your link',desc:'Post it in your bio. Clients click, book, and pay — you just show up.'},
            ].map((s,i) => (
              <div key={i} className={`step reveal reveal-d${i+1}`}>
                <div className="step-num">0{i+1}</div>
                <div className="step-icon">{s.icon}</div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section section-dark" id="pricing" style={{borderTop:'1px solid rgba(255,255,255,.05)'}}>
        <div className="container">
          <div className="reveal" style={{textAlign:'center'}}>
            <div className="section-tag">Pricing</div>
            <div className="section-title light">Simple, transparent pricing.<br/><em>Cancel anytime.</em></div>
            <div className="section-sub light" style={{margin:'.85rem auto 0',textAlign:'center'}}>Every plan includes a 14-day free trial. No credit card required to start.</div>
          </div>
          <div className="pricing-grid">
            {plans.map((p,i) => (
              <div key={i} className={`plan reveal reveal-d${i+1} ${p.featured?'featured':''}`}>
                {p.featured && <div className="plan-badge">Most popular</div>}
                <div className="plan-name">{p.name}</div>
                <div className="plan-price"><sup>$</sup>{p.price}<sub>/mo</sub></div>
                <div className="plan-desc">{p.desc}</div>
                <div className="plan-divider"/>
                <div className="plan-features">
                  {p.features.map((f,j) => (
                    <div key={j} className="plan-feat">
                      <span className={f.ok?'feat-check':'feat-x'}>{f.ok?'✓':'×'}</span>
                      <span style={{color:f.ok?'rgba(255,255,255,.5)':'rgba(255,255,255,.2)'}}>{f.t}</span>
                    </div>
                  ))}
                </div>
                <button className={`plan-btn ${p.featured?'gold':''}`} onClick={()=>navigate('/auth')}>Start free trial</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section section-dark" id="testimonials" style={{borderTop:'1px solid rgba(255,255,255,.05)'}}>
        <div className="container">
          <div className="reveal" style={{textAlign:'center'}}>
            <div className="section-tag">From the community</div>
            <div className="section-title light">What professionals are saying.</div>
          </div>
          <div className="testi-grid">
            {[
              {text:'Before Organized, I was answering the same DMs every single day. Now clients book themselves, order products, and I wake up to confirmed appointments.',name:'Maya A.',handle:'@elixirbymaya',av:'M'},
              {text:'I launched my Box Braids Masterclass through my Organized page. Made back my subscription fee in the first week.',name:'Kezia B.',handle:'@keziahairstudio',av:'K'},
              {text:'My clients always comment on how professional my booking page looks. They think I paid a developer thousands. It\'s just Organized.',name:'Nadia L.',handle:'@nadianaturals',av:'N'},
            ].map((t,i) => (
              <div key={i} className={`testi reveal reveal-d${i+1}`}>
                <div className="testi-quote">"</div>
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

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="container reveal" style={{position:'relative',zIndex:1}}>
          <div className="section-tag" style={{textAlign:'center'}}>Get started today</div>
          <div className="section-title light" style={{textAlign:'center',maxWidth:'600px',margin:'0 auto'}}>
            Your clients deserve a<br/><em>professional experience.</em>
          </div>
          <div className="section-sub light" style={{textAlign:'center',margin:'1rem auto 2.5rem'}}>
            Join thousands of service professionals who replaced their DM chaos with a system that works while they sleep.
          </div>
          <div style={{display:'flex',gap:'1rem',justifyContent:'center',flexWrap:'wrap'}}>
            <button className="btn-hero" onClick={()=>navigate('/auth')}>Start your free trial</button>
            <button className="btn-ghost" onClick={()=>document.getElementById('demo')?.scrollIntoView({behavior:'smooth'})}>See the dashboard</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-logo">Organized<span>.</span></div>
        <div className="footer-links">
          {['Privacy','Terms','Contact','Instagram'].map(l=><span key={l} className="footer-link">{l}</span>)}
        </div>
        <div className="footer-copy">© 2026 Organized — beorganized.io</div>
      </footer>
    </div>
  )
}
