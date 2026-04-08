import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-rv]')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return
        const el = e.target
        setTimeout(() => el.classList.add('in'), Number(el.dataset.delay || 0))
        obs.unobserve(el)
      })
    }, { threshold: 0.1 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

function useNav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return scrolled
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html { scroll-behavior:smooth; -webkit-font-smoothing:antialiased; }
  body { font-family:'DM Sans',sans-serif; background:#fff; color:#0f0e0c; overflow-x:hidden; }
  :root { --gold:#b5893a; --ink:#0f0e0c; --ink-2:#3d3b38; --ink-3:#8c8882; --cream:#f8f6f2; --white:#fff; --border:#e8e4dc; }

  [data-rv] { opacity:0; transform:translateY(28px); transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1); }
  [data-rv].in { opacity:1; transform:none; }

  .nav { position:fixed; top:0; left:0; right:0; z-index:200; display:flex; align-items:center; justify-content:space-between; padding:0 3rem; height:64px; transition:all .3s; }
  .nav.scrolled { background:rgba(255,255,255,.96); backdrop-filter:blur(20px); border-bottom:1px solid var(--border); }
  .nav-logo { font-family:'Playfair Display',serif; font-size:1.3rem; font-weight:500; color:#fff; cursor:pointer; transition:color .3s; }
  .nav.scrolled .nav-logo { color:var(--ink); }
  .nav-logo span { color:var(--gold); }
  .nav-links { display:flex; gap:2.5rem; }
  .nav-link { font-size:.8rem; color:rgba(255,255,255,.5); cursor:pointer; transition:color .2s; letter-spacing:.02em; }
  .nav.scrolled .nav-link { color:var(--ink-3); }
  .nav-link:hover { color:#fff; }
  .nav.scrolled .nav-link:hover { color:var(--ink); }
  .nav-right { display:flex; align-items:center; gap:1rem; }
  .nav-signin { font-size:.8rem; color:rgba(255,255,255,.45); cursor:pointer; transition:color .2s; }
  .nav.scrolled .nav-signin { color:var(--ink-3); }
  .nav-signin:hover { color:#fff; }
  .nav.scrolled .nav-signin:hover { color:var(--ink); }
  .nav-btn { background:var(--gold); color:#fff; border:none; border-radius:7px; padding:.5rem 1.35rem; font-size:.8rem; font-weight:500; cursor:pointer; font-family:inherit; transition:all .2s; }
  .nav-btn:hover { background:#9e7630; }

  .hero { min-height:100vh; background:var(--ink); display:grid; grid-template-columns:1fr 1fr; align-items:center; gap:4rem; padding:10rem 5rem 6rem; position:relative; overflow:hidden; }
  .hero-grain { position:absolute; inset:0; opacity:.04; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); pointer-events:none; }
  .hero-glow { position:absolute; top:-30%; left:-10%; width:700px; height:700px; background:radial-gradient(ellipse, rgba(181,137,58,.12) 0%, transparent 65%); pointer-events:none; }
  .hero-left { position:relative; z-index:1; }
  .hero-badge { display:inline-flex; align-items:center; gap:.6rem; border:1px solid rgba(181,137,58,.35); border-radius:20px; padding:.35rem 1rem; font-size:.68rem; font-weight:500; color:var(--gold); letter-spacing:.1em; text-transform:uppercase; margin-bottom:2rem; animation:fadeUp .6s ease both; }
  .hero-dot { width:5px; height:5px; border-radius:50%; background:var(--gold); }
  .hero-h1 { font-family:'Playfair Display',serif; font-size:clamp(2.6rem,4.5vw,4.2rem); font-weight:700; color:#fff; line-height:1.08; letter-spacing:-.02em; margin-bottom:1.5rem; animation:fadeUp .7s .1s ease both; }
  .hero-h1 em { font-style:italic; color:var(--gold); font-weight:400; }
  .hero-sub { font-size:1rem; color:rgba(255,255,255,.45); line-height:1.8; font-weight:300; max-width:440px; margin-bottom:1rem; animation:fadeUp .7s .2s ease both; }
  .hero-result { font-size:.88rem; color:rgba(255,255,255,.7); line-height:1.7; margin-bottom:2.5rem; font-weight:400; animation:fadeUp .7s .25s ease both; }
  .hero-result strong { color:var(--gold); }
  .hero-actions { display:flex; gap:.85rem; flex-wrap:wrap; animation:fadeUp .7s .3s ease both; }
  .btn-primary { background:var(--gold); color:#fff; border:none; border-radius:8px; padding:.9rem 2.2rem; font-size:.92rem; font-weight:500; cursor:pointer; font-family:inherit; transition:all .2s; }
  .btn-primary:hover { background:#9e7630; transform:translateY(-2px); box-shadow:0 12px 32px rgba(181,137,58,.3); }
  .btn-ghost { background:transparent; color:rgba(255,255,255,.5); border:1px solid rgba(255,255,255,.15); border-radius:8px; padding:.9rem 2rem; font-size:.92rem; cursor:pointer; font-family:inherit; transition:all .2s; }
  .btn-ghost:hover { color:rgba(255,255,255,.85); border-color:rgba(255,255,255,.3); }
  .hero-note { font-size:.7rem; color:rgba(255,255,255,.2); margin-top:1.25rem; animation:fadeUp .7s .4s ease both; letter-spacing:.02em; }
  .hero-right { position:relative; z-index:1; animation:fadeUp .9s .3s ease both; }

  .dash-preview { background:#1a1815; border:1px solid rgba(255,255,255,.08); border-radius:14px; overflow:hidden; box-shadow:0 40px 80px rgba(0,0,0,.5); }
  .dash-bar { background:#111; border-bottom:1px solid rgba(255,255,255,.07); height:36px; display:flex; align-items:center; padding:0 1rem; gap:.45rem; }
  .dash-dot { width:8px; height:8px; border-radius:50%; }
  .dash-url { flex:1; background:rgba(255,255,255,.05); border-radius:4px; height:18px; margin:0 .75rem; display:flex; align-items:center; padding:0 .6rem; }
  .dash-url span { font-size:.58rem; color:rgba(255,255,255,.2); font-family:monospace; }
  .dash-body { display:flex; height:280px; }
  .dash-sidebar { width:130px; background:#111; border-right:1px solid rgba(255,255,255,.06); padding:.7rem 0; flex-shrink:0; }
  .dash-nav { display:flex; align-items:center; gap:.45rem; padding:.42rem .8rem; font-size:.58rem; color:rgba(255,255,255,.3); }
  .dash-nav.active { color:var(--gold); background:rgba(181,137,58,.07); border-left:2px solid var(--gold); }
  .dash-nav-dot { width:5px; height:5px; border-radius:50%; background:currentColor; opacity:.5; flex-shrink:0; }
  .dash-main { flex:1; padding:.85rem; overflow:hidden; }
  .dash-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:.4rem; margin-bottom:.75rem; }
  .dash-stat { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.06); border-radius:6px; padding:.5rem .65rem; }
  .dash-stat-l { font-size:.42rem; color:rgba(255,255,255,.3); text-transform:uppercase; letter-spacing:.06em; margin-bottom:.25rem; }
  .dash-stat-v { font-family:'Playfair Display',serif; font-size:.88rem; color:#fff; }
  .dash-tbl { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06); border-radius:6px; overflow:hidden; }
  .dash-tbl-head { display:grid; grid-template-columns:2fr 1.5fr 1fr 1fr; padding:.35rem .7rem; border-bottom:1px solid rgba(255,255,255,.06); }
  .dash-th { font-size:.44rem; color:rgba(255,255,255,.25); text-transform:uppercase; letter-spacing:.06em; }
  .dash-row { display:grid; grid-template-columns:2fr 1.5fr 1fr 1fr; padding:.4rem .7rem; border-bottom:1px solid rgba(255,255,255,.04); align-items:center; }
  .dash-row:last-child { border-bottom:none; }
  .dash-td { font-size:.52rem; color:rgba(255,255,255,.45); }
  .dash-td.name { color:rgba(255,255,255,.78); font-weight:500; }
  .dash-td.amt { color:var(--gold); font-weight:600; }
  .dash-badge { display:inline-block; padding:1px 5px; border-radius:8px; font-size:.42rem; font-weight:600; }
  .dash-badge.ok { background:rgba(46,125,82,.25); color:#4ade80; }
  .dash-badge.pend { background:rgba(202,138,4,.15); color:#fbbf24; }

  .section { padding:7rem 5rem; }
  .section-inner { max-width:1080px; margin:0 auto; }
  .section-tag { font-size:.68rem; font-weight:600; letter-spacing:.14em; text-transform:uppercase; color:var(--gold); margin-bottom:.85rem; }
  .section-title { font-family:'Playfair Display',serif; font-size:clamp(2rem,3.5vw,2.8rem); font-weight:700; line-height:1.15; color:var(--ink); margin-bottom:1rem; }
  .section-title em { font-style:italic; color:var(--gold); font-weight:400; }
  .section-title.light { color:#fff; }
  .section-sub { font-size:.95rem; color:var(--ink-3); line-height:1.8; max-width:520px; font-weight:300; }
  .section-sub.light { color:rgba(255,255,255,.4); }

  .problem { background:var(--cream); }
  .problem-grid { display:grid; grid-template-columns:1fr 1fr; gap:5rem; align-items:center; margin-top:4rem; }
  .problem-bullets { display:flex; flex-direction:column; gap:1rem; }
  .pb { display:flex; align-items:flex-start; gap:1rem; padding:1.25rem 1.5rem; background:var(--white); border:1px solid var(--border); border-radius:12px; }
  .pb-icon { width:36px; height:36px; border-radius:8px; background:#fef2f2; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:1rem; }
  .pb-text { font-size:.88rem; color:var(--ink-2); line-height:1.6; }
  .pb-text strong { display:block; color:var(--ink); font-weight:600; margin-bottom:.2rem; font-size:.9rem; }
  .dm-box { background:var(--ink); border-radius:14px; padding:1.5rem; }
  .dm-header { font-size:.65rem; color:rgba(255,255,255,.3); letter-spacing:.08em; text-transform:uppercase; margin-bottom:1.25rem; display:flex; align-items:center; gap:.5rem; }
  .dm-online { width:6px; height:6px; border-radius:50%; background:#22c55e; }
  .dm-thread { display:flex; flex-direction:column; gap:.75rem; }
  .dm-msg { display:flex; gap:.6rem; align-items:flex-start; }
  .dm-msg.sent { flex-direction:row-reverse; }
  .dm-av { width:26px; height:26px; border-radius:50%; background:rgba(181,137,58,.25); flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:.62rem; font-weight:600; color:var(--gold); }
  .dm-bubble { background:rgba(255,255,255,.08); border-radius:0 10px 10px 10px; padding:.55rem .85rem; font-size:.76rem; color:rgba(255,255,255,.75); line-height:1.55; max-width:200px; }
  .dm-bubble.sent { background:rgba(181,137,58,.2); border-radius:10px 0 10px 10px; }
  .dm-chaos { text-align:center; margin-top:1.25rem; font-size:.7rem; color:rgba(255,255,255,.25); font-style:italic; }

  .solution { background:var(--white); }
  .pillars { display:grid; grid-template-columns:repeat(4,1fr); gap:1.25rem; margin-top:3.5rem; }
  .pillar { border:1px solid var(--border); border-radius:14px; padding:1.75rem 1.5rem; transition:all .2s; }
  .pillar:hover { border-color:var(--gold); transform:translateY(-3px); box-shadow:0 12px 32px rgba(0,0,0,.07); }
  .pillar-icon { width:44px; height:44px; border-radius:10px; background:var(--cream); display:flex; align-items:center; justify-content:center; font-size:1.25rem; margin-bottom:1.25rem; }
  .pillar-name { font-family:'Playfair Display',serif; font-size:1.05rem; font-weight:500; margin-bottom:.5rem; }
  .pillar-desc { font-size:.8rem; color:var(--ink-3); line-height:1.7; font-weight:300; }

  .demo { background:var(--ink); }
  .demo-screens { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; margin-top:3.5rem; }
  .demo-frame { background:#1a1815; border:1px solid rgba(255,255,255,.08); border-radius:12px; overflow:hidden; margin-bottom:.85rem; }
  .demo-frame-bar { background:#111; height:28px; display:flex; align-items:center; padding:0 .75rem; gap:.35rem; border-bottom:1px solid rgba(255,255,255,.06); }
  .demo-frame-dot { width:7px; height:7px; border-radius:50%; }
  .demo-content { padding:.75rem; }
  .demo-caption { font-size:.78rem; color:rgba(255,255,255,.4); }
  .demo-caption strong { color:rgba(255,255,255,.7); display:block; font-weight:500; margin-bottom:.2rem; font-size:.82rem; }
  .booking-step { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07); border-radius:8px; padding:.75rem; margin-bottom:.5rem; }
  .bs-num { font-size:.48rem; color:var(--gold); font-weight:600; letter-spacing:.08em; text-transform:uppercase; margin-bottom:.3rem; }
  .bs-title { font-size:.6rem; color:rgba(255,255,255,.7); font-weight:500; margin-bottom:.3rem; }
  .bs-bar { height:4px; background:rgba(255,255,255,.08); border-radius:2px; overflow:hidden; }
  .bs-fill { height:100%; background:var(--gold); border-radius:2px; }
  .mobile-mock { background:#1a1815; border:2px solid rgba(255,255,255,.1); border-radius:24px; padding:1rem .75rem; max-width:160px; margin:0 auto; }
  .mobile-notch { width:50px; height:4px; background:rgba(255,255,255,.1); border-radius:2px; margin:0 auto .75rem; }
  .mobile-av { width:40px; height:40px; border-radius:50%; background:rgba(181,137,58,.2); border:1px solid rgba(181,137,58,.3); display:flex; align-items:center; justify-content:center; font-family:'Playfair Display',serif; font-size:1rem; color:var(--gold); margin:0 auto .5rem; }
  .mobile-name { font-family:'Playfair Display',serif; font-size:.75rem; color:#fff; text-align:center; margin-bottom:.15rem; }
  .mobile-tag { font-size:.5rem; color:rgba(255,255,255,.3); text-align:center; margin-bottom:.75rem; }
  .mobile-svc { background:rgba(255,255,255,.05); border-radius:6px; padding:.45rem .6rem; margin-bottom:.35rem; display:flex; justify-content:space-between; }
  .mobile-svc span { font-size:.55rem; }
  .mobile-svc .p { color:var(--gold); font-weight:600; }
  .mobile-svc .n { color:rgba(255,255,255,.7); }
  .mobile-btn { background:var(--gold); border-radius:6px; padding:.45rem; text-align:center; font-size:.55rem; color:#fff; font-weight:600; margin-top:.5rem; }

  .transform { background:var(--cream); }
  .ba-grid { display:grid; grid-template-columns:1fr 1fr; gap:2rem; margin-top:3.5rem; }
  .ba-card { border-radius:14px; padding:2.5rem; }
  .ba-before { background:var(--white); border:1px solid var(--border); }
  .ba-after { background:var(--ink); }
  .ba-label { font-size:.68rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase; margin-bottom:1.5rem; display:flex; align-items:center; gap:.6rem; }
  .ba-label-before { color:#c0392b; }
  .ba-label-after { color:var(--gold); }
  .ba-rule { flex:1; height:1px; }
  .ba-rule-before { background:#fecaca; }
  .ba-rule-after { background:rgba(181,137,58,.2); }
  .ba-items { display:flex; flex-direction:column; gap:.85rem; }
  .ba-item { display:flex; align-items:flex-start; gap:.85rem; font-size:.88rem; }
  .ba-item-before { color:var(--ink-2); }
  .ba-item-after { color:rgba(255,255,255,.65); }
  .ba-icon { font-size:1rem; flex-shrink:0; margin-top:.05rem; }

  .proof { background:var(--white); }
  .proof-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.25rem; margin-top:3.5rem; }
  .proof-card { border:1px solid var(--border); border-radius:14px; padding:2rem; transition:border-color .2s; }
  .proof-card:hover { border-color:var(--gold); }
  .proof-quote { font-family:'Playfair Display',serif; font-size:2.5rem; color:var(--gold); opacity:.2; line-height:1; margin-bottom:.75rem; }
  .proof-text { font-size:.85rem; color:var(--ink-2); line-height:1.75; font-weight:300; margin-bottom:1.5rem; }
  .proof-author { display:flex; align-items:center; gap:.75rem; }
  .proof-av { width:38px; height:38px; border-radius:50%; background:rgba(181,137,58,.12); display:flex; align-items:center; justify-content:center; font-size:.8rem; font-weight:600; color:var(--gold); border:1px solid rgba(181,137,58,.2); }
  .proof-name { font-size:.84rem; font-weight:600; }
  .proof-handle { font-size:.72rem; color:var(--ink-3); }

  .pricing { background:var(--cream); }
  .pricing-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.25rem; margin-top:3.5rem; align-items:start; }
  .plan { background:var(--white); border:1px solid var(--border); border-radius:16px; padding:2.25rem; position:relative; }
  .plan.pop { background:var(--ink); border-color:var(--ink); }
  .plan-badge { position:absolute; top:-13px; left:50%; transform:translateX(-50%); background:var(--gold); color:#fff; font-size:.65rem; font-weight:600; letter-spacing:.08em; text-transform:uppercase; padding:.3rem .95rem; border-radius:20px; white-space:nowrap; }
  .plan-name { font-size:.68rem; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-3); margin-bottom:.75rem; }
  .plan.pop .plan-name { color:rgba(255,255,255,.35); }
  .plan-price { font-family:'Playfair Display',serif; font-size:3rem; font-weight:700; color:var(--ink); line-height:1; margin-bottom:.35rem; }
  .plan.pop .plan-price { color:#fff; }
  .plan-price sup { font-size:1.2rem; font-family:'DM Sans',sans-serif; font-weight:300; vertical-align:top; margin-top:.55rem; display:inline-block; }
  .plan-price sub { font-size:.85rem; font-family:'DM Sans',sans-serif; font-weight:300; color:var(--ink-3); }
  .plan.pop .plan-price sub { color:rgba(255,255,255,.3); }
  .plan-desc { font-size:.8rem; color:var(--ink-3); margin-bottom:1.75rem; font-weight:300; line-height:1.6; }
  .plan.pop .plan-desc { color:rgba(255,255,255,.35); }
  .plan-hr { height:1px; background:var(--border); margin-bottom:1.75rem; }
  .plan.pop .plan-hr { background:rgba(255,255,255,.08); }
  .plan-feats { display:flex; flex-direction:column; gap:.65rem; margin-bottom:2rem; }
  .plan-feat { display:flex; align-items:flex-start; gap:.65rem; font-size:.8rem; color:var(--ink-2); font-weight:300; line-height:1.5; }
  .plan.pop .plan-feat { color:rgba(255,255,255,.6); }
  .plan-check { width:16px; height:16px; border-radius:50%; background:rgba(181,137,58,.12); display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; font-size:.65rem; color:var(--gold); }
  .plan.pop .plan-check { background:rgba(181,137,58,.2); }
  .plan-btn { width:100%; padding:.8rem; border-radius:9px; font-size:.85rem; font-weight:500; cursor:pointer; font-family:inherit; border:none; transition:all .2s; }
  .plan-btn.outline { background:transparent; border:1px solid var(--border); color:var(--ink); }
  .plan-btn.outline:hover { border-color:var(--ink); }
  .plan-btn.gold { background:var(--gold); color:#fff; }
  .plan-btn.gold:hover { background:#9e7630; }
  .plan-btn.white { background:#fff; color:var(--ink); }
  .plan-btn.white:hover { background:var(--cream); }

  .faq { background:var(--white); }
  .faq-list { max-width:680px; margin:3rem auto 0; display:flex; flex-direction:column; gap:.75rem; }
  .faq-item { border:1px solid var(--border); border-radius:12px; overflow:hidden; }
  .faq-q { display:flex; align-items:center; justify-content:space-between; padding:1.25rem 1.5rem; cursor:pointer; font-size:.9rem; font-weight:500; color:var(--ink); transition:background .15s; gap:1rem; }
  .faq-q:hover { background:var(--cream); }
  .faq-chev { color:var(--ink-3); font-size:.72rem; transition:transform .25s; flex-shrink:0; }
  .faq-chev.open { transform:rotate(180deg); }
  .faq-a { padding:0 1.5rem 1.25rem; font-size:.85rem; color:var(--ink-3); line-height:1.75; font-weight:300; }

  .final { background:var(--ink); text-align:center; padding:9rem 5rem; position:relative; overflow:hidden; }
  .final-glow { position:absolute; bottom:-20%; left:50%; transform:translateX(-50%); width:800px; height:500px; background:radial-gradient(ellipse, rgba(181,137,58,.14) 0%, transparent 65%); pointer-events:none; }
  .final-grain { position:absolute; inset:0; opacity:.04; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); pointer-events:none; }
  .final-inner { position:relative; z-index:1; max-width:640px; margin:0 auto; }
  .final h2 { font-family:'Playfair Display',serif; font-size:clamp(2.2rem,4vw,3.5rem); font-weight:700; color:#fff; line-height:1.12; letter-spacing:-.02em; margin-bottom:1.25rem; }
  .final h2 em { font-style:italic; color:var(--gold); font-weight:400; }
  .final p { font-size:.95rem; color:rgba(255,255,255,.35); line-height:1.8; margin-bottom:2.5rem; font-weight:300; }
  .final-actions { display:flex; gap:1rem; justify-content:center; }

  .footer { background:#080706; padding:2.5rem 5rem; display:flex; align-items:center; justify-content:space-between; border-top:1px solid rgba(255,255,255,.05); }
  .footer-logo { font-family:'Playfair Display',serif; font-size:1.1rem; color:rgba(255,255,255,.35); }
  .footer-logo span { color:var(--gold); }
  .footer-links { display:flex; gap:2rem; }
  .footer-link { font-size:.75rem; color:rgba(255,255,255,.2); cursor:pointer; transition:color .15s; }
  .footer-link:hover { color:rgba(255,255,255,.5); }
  .footer-copy { font-size:.72rem; color:rgba(255,255,255,.12); }

  @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }

  @media(max-width:900px) {
    .hero { grid-template-columns:1fr; padding:8rem 2rem 5rem; text-align:center; }
    .hero-actions { justify-content:center; }
    .hero-right { display:none; }
    .problem-grid,.ba-grid { grid-template-columns:1fr; }
    .pillars { grid-template-columns:repeat(2,1fr); }
    .proof-grid,.pricing-grid,.demo-screens { grid-template-columns:1fr; }
    .section { padding:5rem 1.5rem; }
    .nav { padding:0 1.5rem; }
    .nav-links { display:none; }
    .footer { flex-direction:column; gap:1.5rem; text-align:center; padding:2rem 1.5rem; }
    .final { padding:6rem 1.5rem; }
  }
`

export default function Landing() {
  const navigate = useNavigate()
  const scrolled = useNav()
  useReveal()
  const [openFaq, setOpenFaq] = useState(null)

  const faqs = [
    { q: 'Is it hard to set up?', a: 'Not at all. You fill in your business info, add your services, and your page is live in under 10 minutes. No code, no technical skills required.' },
    { q: 'Can I cancel anytime?', a: 'Yes. No contracts, no commitments. Cancel anytime from your dashboard.' },
    { q: 'Do my clients need to create an account to book?', a: 'No. Clients book from your public page with just their name and phone. No sign-up required on their end.' },
    { q: 'What if I already use Instagram or WhatsApp for bookings?', a: 'You can keep those too. Organized gives you a clean link to add to your bio so clients have a professional way to book without flooding your DMs.' },
    { q: 'Is my client data safe?', a: 'Yes. All data is encrypted and stored securely. You own your data — we never share or sell it.' },
  ]

  return (
    <>
      <style>{css}</style>

      {/* NAV */}
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-logo" onClick={() => window.scrollTo(0,0)}>Organized<span>.</span></div>
        <div className="nav-links">
          <span className="nav-link" onClick={() => document.getElementById('features')?.scrollIntoView({behavior:'smooth'})}>Features</span>
          <span className="nav-link" onClick={() => document.getElementById('pricing')?.scrollIntoView({behavior:'smooth'})}>Pricing</span>
          <span className="nav-link" onClick={() => document.getElementById('faq')?.scrollIntoView({behavior:'smooth'})}>FAQ</span>
        </div>
        <div className="nav-right">
          <span className="nav-signin" onClick={() => navigate('/auth')}>Sign in</span>
          <button className="nav-btn" onClick={() => navigate('/auth')}>Start free</button>
        </div>
      </nav>

      {/* 1. HERO */}
      <section className="hero">
        <div className="hero-grain"/>
        <div className="hero-glow"/>
        <div className="hero-left">
          <div className="hero-badge"><span className="hero-dot"/><span>For hairstylists & beauty pros</span></div>
          <h1 className="hero-h1">
            Stop losing clients<br/>because your bookings<br/>are a <em>mess.</em>
          </h1>
          <p className="hero-sub">Organized helps hairstylists manage bookings, clients, and payments — automatically.</p>
          <p className="hero-result"><strong>More clients. Less stress. Zero missed appointments.</strong></p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate('/auth')}>Start Free — No Card Needed</button>
            <button className="btn-ghost" onClick={() => navigate('/jd-9a99')}>See a live example</button>
          </div>
          <p className="hero-note">14-day free trial · Setup in under 10 minutes · Cancel anytime</p>
        </div>
        <div className="hero-right">
          <div className="dash-preview">
            <div className="dash-bar">
              <div className="dash-dot" style={{background:'#ff5f57'}}/>
              <div className="dash-dot" style={{background:'#febc2e'}}/>
              <div className="dash-dot" style={{background:'#28c840'}}/>
              <div className="dash-url"><span>beorganized.io/dashboard</span></div>
            </div>
            <div className="dash-body">
              <div className="dash-sidebar">
                {['Overview','Appointments','Products','Formations','Clients'].map((item,i) => (
                  <div key={i} className={`dash-nav ${i===0?'active':''}`}>
                    <div className="dash-nav-dot"/>{item}
                  </div>
                ))}
              </div>
              <div className="dash-main">
                <div className="dash-stats">
                  {[['Revenue','$3,240'],['Appointments','28'],['Products','31'],['Students','74']].map(([l,v],i) => (
                    <div key={i} className="dash-stat">
                      <div className="dash-stat-l">{l}</div>
                      <div className="dash-stat-v">{v}</div>
                    </div>
                  ))}
                </div>
                <div className="dash-tbl">
                  <div className="dash-tbl-head">
                    {['Client','Service','Amount','Status'].map(h => <div key={h} className="dash-th">{h}</div>)}
                  </div>
                  {[['Amara D.','Box Braids','$180','ok'],['Zoe M.','Silk Press','$95','ok'],['Kezia B.','Color & Cut','$220','pend'],['Nadia L.','Loc Retwist','$120','ok']].map(([c,s,a,st],i) => (
                    <div key={i} className="dash-row">
                      <div className="dash-td name">{c}</div>
                      <div className="dash-td">{s}</div>
                      <div className="dash-td amt">{a}</div>
                      <div className="dash-td"><span className={`dash-badge ${st}`}>{st==='ok'?'confirmed':'pending'}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROBLEM */}
      <section className="section problem">
        <div className="section-inner">
          <div data-rv>
            <div className="section-tag">The problem</div>
            <h2 className="section-title">Still dealing with this?</h2>
          </div>
          <div className="problem-grid">
            <div className="problem-bullets" data-rv data-delay="100">
              {[
                { icon:'📱', title:'Clients messaging you everywhere', desc:'Instagram, WhatsApp, TikTok — you lose track of who booked what and when.' },
                { icon:'❌', title:'No-shows killing your income', desc:'No reminders means clients forget. Every no-show is money you never get back.' },
                { icon:'📋', title:'No system, just chaos', desc:'Paper lists, screenshots, mental notes. One slip and a client is double-booked.' },
                { icon:'😓', title:'You work harder, not smarter', desc:'You spend more time managing your business than actually doing your craft.' },
              ].map((pb, i) => (
                <div key={i} className="pb">
                  <div className="pb-icon">{pb.icon}</div>
                  <div className="pb-text"><strong>{pb.title}</strong>{pb.desc}</div>
                </div>
              ))}
            </div>
            <div data-rv data-delay="200">
              <div className="dm-box">
                <div className="dm-header"><div className="dm-online"/>Instagram DM — @kezia_b</div>
                <div className="dm-thread">
                  {[
                    {t:'Hey sis do you do knotless? How much?', sent:false},
                    {t:'Yes! Starting at $200 depending on length', sent:true},
                    {t:'Ok can I come Saturday? What time?', sent:false},
                    {t:'Let me check... what about 10am?', sent:true},
                    {t:'Maybe. Actually can we do Sunday?', sent:false},
                    {t:'Ugh I have someone at 10. 2pm?', sent:true},
                  ].map((m, i) => (
                    <div key={i} className={`dm-msg ${m.sent ? 'sent' : ''}`}>
                      {!m.sent && <div className="dm-av">K</div>}
                      <div className={`dm-bubble ${m.sent ? 'sent' : ''}`}>{m.t}</div>
                    </div>
                  ))}
                </div>
                <div className="dm-chaos">This is your Saturday morning. Every week.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SOLUTION */}
      <section className="section solution" id="features">
        <div className="section-inner">
          <div data-rv>
            <div className="section-tag">The solution</div>
            <h2 className="section-title">Organized <em>fixes this.</em></h2>
            <p className="section-sub">Everything you need to run your business in one place. Your clients book, confirm, and show up — you just do the work.</p>
          </div>
          <div className="pillars">
            {[
              { icon:'📅', name:'Smart Booking', desc:'Clients book directly from your link, 24/7. Your calendar stays clean automatically.' },
              { icon:'🔔', name:'Auto Reminders', desc:'Confirmation and 24h reminder sent to every client. No-shows drop dramatically.' },
              { icon:'👥', name:'Client Management', desc:'Full history of every client — visits, spending, notes. Know your VIPs instantly.' },
              { icon:'📊', name:'Simple Dashboard', desc:'Revenue, appointments, and clients in one clean view. Run your business like a pro.' },
            ].map((p, i) => (
              <div key={i} className="pillar" data-rv data-delay={`${i * 80}`}>
                <div className="pillar-icon">{p.icon}</div>
                <div className="pillar-name">{p.name}</div>
                <div className="pillar-desc">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. DEMO */}
      <section className="section demo">
        <div className="section-inner">
          <div data-rv style={{textAlign:'center'}}>
            <div className="section-tag">See how it works</div>
            <h2 className="section-title light">Your business, <em>built in minutes.</em></h2>
          </div>
          <div className="demo-screens">
            <div data-rv data-delay="100">
              <div className="demo-frame">
                <div className="demo-frame-bar">
                  <div className="demo-frame-dot" style={{background:'#ff5f57'}}/><div className="demo-frame-dot" style={{background:'#febc2e'}}/><div className="demo-frame-dot" style={{background:'#28c840'}}/>
                </div>
                <div className="demo-content">
                  <div className="dash-stats" style={{marginBottom:'.6rem',gridTemplateColumns:'1fr 1fr'}}>
                    {[['Revenue','$3,240'],['Appointments','28']].map(([l,v],i) => (
                      <div key={i} className="dash-stat"><div className="dash-stat-l">{l}</div><div className="dash-stat-v">{v}</div></div>
                    ))}
                  </div>
                  <div className="dash-tbl">
                    {[['Amara D.','$180','ok'],['Kezia B.','$220','pend'],['Nadia L.','$120','ok']].map(([c,a,st],i) => (
                      <div key={i} className="dash-row" style={{gridTemplateColumns:'2fr 1fr 1fr'}}>
                        <div className="dash-td name">{c}</div><div className="dash-td amt">{a}</div>
                        <div className="dash-td"><span className={`dash-badge ${st}`}>{st==='ok'?'✓':'…'}</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="demo-caption"><strong>Your bookings at a glance</strong>Revenue, appointments, status — all in one view.</div>
            </div>
            <div data-rv data-delay="180">
              <div className="demo-frame">
                <div className="demo-frame-bar">
                  <div className="demo-frame-dot" style={{background:'#ff5f57'}}/><div className="demo-frame-dot" style={{background:'#febc2e'}}/><div className="demo-frame-dot" style={{background:'#28c840'}}/>
                </div>
                <div className="demo-content">
                  {[
                    {step:'Step 1',title:'Client picks a service',fill:'100%'},
                    {step:'Step 2',title:'Selects date & time',fill:'66%'},
                    {step:'Step 3',title:'Booking confirmed',fill:'33%'},
                  ].map((s, i) => (
                    <div key={i} className="booking-step">
                      <div className="bs-num">{s.step}</div>
                      <div className="bs-title">{s.title}</div>
                      <div className="bs-bar"><div className="bs-fill" style={{width:s.fill}}/></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="demo-caption"><strong>Booking flow in 3 steps</strong>Clients book in under 60 seconds. No account needed.</div>
            </div>
            <div data-rv data-delay="260">
              <div className="demo-frame">
                <div className="demo-frame-bar">
                  <div className="demo-frame-dot" style={{background:'#ff5f57'}}/><div className="demo-frame-dot" style={{background:'#febc2e'}}/><div className="demo-frame-dot" style={{background:'#28c840'}}/>
                </div>
                <div className="demo-content">
                  <div className="mobile-mock">
                    <div className="mobile-notch"/>
                    <div className="mobile-av">N</div>
                    <div className="mobile-name">Novber Studio</div>
                    <div className="mobile-tag">Nail Specialist · Montreal</div>
                    {[['Gel Manicure','$55'],['Full Set','$85'],['Nail Art','$35']].map(([n,p],i) => (
                      <div key={i} className="mobile-svc">
                        <span className="n">{n}</span><span className="p">{p}</span>
                      </div>
                    ))}
                    <div className="mobile-btn">Book a service</div>
                  </div>
                </div>
              </div>
              <div className="demo-caption"><strong>Your public profile page</strong>Share your link and clients book from their phone.</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BEFORE/AFTER */}
      <section className="section transform">
        <div className="section-inner">
          <div data-rv style={{textAlign:'center'}}>
            <div className="section-tag">The transformation</div>
            <h2 className="section-title">From chaos <em>→ organized.</em></h2>
          </div>
          <div className="ba-grid">
            <div className="ba-card ba-before" data-rv data-delay="100">
              <div className="ba-label ba-label-before">Before<div className="ba-rule ba-rule-before"/></div>
              <div className="ba-items">
                {[['😩','DMs flooding in from 5 different apps'],['😩','Clients forget — you deal with the no-show'],['😩','Double bookings from lack of a system'],['😩','No idea how much you made this month'],['😩','Spending your evenings managing, not resting']].map(([icon,text],i) => (
                  <div key={i} className="ba-item ba-item-before"><span className="ba-icon">{icon}</span>{text}</div>
                ))}
              </div>
            </div>
            <div className="ba-card ba-after" data-rv data-delay="200">
              <div className="ba-label ba-label-after">After<div className="ba-rule ba-rule-after"/></div>
              <div className="ba-items">
                {[['✅','One link, all your bookings in one place'],['✅','Automatic reminders — clients always show up'],['✅','Clean calendar, zero conflicts ever'],['✅','Real-time revenue dashboard, always updated'],['✅','Your business runs even when you\'re off']].map(([icon,text],i) => (
                  <div key={i} className="ba-item ba-item-after"><span className="ba-icon">{icon}</span>{text}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SOCIAL PROOF */}
      <section className="section proof">
        <div className="section-inner">
          <div data-rv style={{textAlign:'center'}}>
            <div className="section-tag">What users say</div>
            <h2 className="section-title">Real results from <em>real stylists.</em></h2>
          </div>
          <div className="proof-grid">
            {[
              {text:'I stopped losing clients and everything is easier now. My clients love how professional the booking page looks — they think I paid a developer thousands.',name:'Maya A.',handle:'@elixirbymaya',av:'M'},
              {text:'Before this, I was answering DMs until midnight. Now clients book themselves, I get notified, and I wake up to confirmed appointments. Life changed.',name:'Kezia B.',handle:'@keziahairstudio',av:'K'},
              {text:'The no-show rate dropped to almost zero. The automatic reminders do everything. Worth every penny just for that alone.',name:'Nadia L.',handle:'@nadianaturals',av:'N'},
            ].map((t, i) => (
              <div key={i} className="proof-card" data-rv data-delay={`${i * 100}`}>
                <div className="proof-quote">"</div>
                <div className="proof-text">{t.text}</div>
                <div className="proof-author">
                  <div className="proof-av">{t.av}</div>
                  <div><div className="proof-name">{t.name}</div><div className="proof-handle">{t.handle}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. PRICING */}
      <section className="section pricing" id="pricing">
        <div className="section-inner">
          <div data-rv style={{textAlign:'center'}}>
            <div className="section-tag">Simple pricing</div>
            <h2 className="section-title">No surprises. <em>Cancel anytime.</em></h2>
            <p className="section-sub" style={{margin:'1rem auto 0',textAlign:'center'}}>Every plan includes a 14-day free trial. No credit card required to start.</p>
          </div>
          <div className="pricing-grid">
            {[
              {name:'Starter',price:19,desc:'For hairstylists just getting started.',btn:'outline',pop:false,feats:['Public profile & booking page','Up to 5 services','Basic client management','Email support']},
              {name:'Pro',price:39,desc:'For established stylists growing their brand.',btn:'gold',pop:true,feats:['Everything in Starter','Unlimited services','Product shop','Formations & courses','Revenue analytics','Automatic reminders']},
              {name:'Studio',price:69,desc:'For salons and multi-stylist businesses.',btn:'white',pop:false,feats:['Everything in Pro','Up to 5 staff members','Team schedule management','Custom domain','White-label branding','Priority support']},
            ].map((plan, i) => (
              <div key={i} className={`plan ${plan.pop ? 'pop' : ''}`} data-rv data-delay={`${i * 100}`}>
                {plan.pop && <div className="plan-badge">Most popular</div>}
                <div className="plan-name">{plan.name}</div>
                <div className="plan-price"><sup>$</sup>{plan.price}<sub>/mo</sub></div>
                <div className="plan-desc">{plan.desc}</div>
                <div className="plan-hr"/>
                <div className="plan-feats">
                  {plan.feats.map((f, j) => <div key={j} className="plan-feat"><div className="plan-check">✓</div>{f}</div>)}
                </div>
                <button className={`plan-btn ${plan.btn}`} onClick={() => navigate('/auth')}>
                  {plan.pop ? 'Start free trial' : 'Get started'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQ */}
      <section className="section faq" id="faq">
        <div className="section-inner">
          <div data-rv style={{textAlign:'center'}}>
            <div className="section-tag">Questions</div>
            <h2 className="section-title">Got questions? <em>We've got answers.</em></h2>
          </div>
          <div className="faq-list">
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item" data-rv data-delay={`${i * 60}`}>
                <div className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {faq.q}<span className={`faq-chev ${openFaq === i ? 'open' : ''}`}>▼</span>
                </div>
                {openFaq === i && <div className="faq-a">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="final">
        <div className="final-glow"/><div className="final-grain"/>
        <div className="final-inner" data-rv>
          <div className="section-tag" style={{textAlign:'center'}}>Ready?</div>
          <h2>Ready to stop <em>losing clients?</em></h2>
          <p>Join hairstylists who replaced their DM chaos with a system that works while they sleep. Free trial, no card needed.</p>
          <div className="final-actions">
            <button className="btn-primary" onClick={() => navigate('/auth')}>Start Free</button>
            <button className="btn-ghost" onClick={() => navigate('/jd-9a99')}>See a live profile</button>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="footer">
        <div className="footer-logo">Organized<span>.</span></div>
        <div className="footer-links">
          {['Privacy','Terms','Contact','Instagram'].map(l => <span key={l} className="footer-link">{l}</span>)}
        </div>
        <div className="footer-copy">© 2026 Organized. All rights reserved.</div>
      </footer>
    </>
  )
}
