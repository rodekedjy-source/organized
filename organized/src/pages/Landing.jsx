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

const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
html { scroll-behavior:smooth; -webkit-font-smoothing:antialiased; }
body { font-family:'DM Sans',sans-serif; background:#f8f6f2; color:#0f0e0c; overflow-x:hidden; }
:root {
  --gold:#b5893a; --ink:#0f0e0c; --ink-2:#3d3b38; --ink-3:#8c8882;
  --cream:#f8f6f2; --white:#fff; --border:#e8e4dc;
  --ease-out: cubic-bezier(.16,1,.3,1);
}

/* REVEAL */
[data-rv] { opacity:0; transform:translateY(36px); transition:opacity .9s var(--ease-out),transform .9s var(--ease-out); }
[data-rv=left] { transform:translateX(-36px); }
[data-rv=right] { transform:translateX(36px); }
[data-rv=scale] { transform:scale(.94) translateY(16px); }
[data-rv=fade] { transform:none; }
[data-rv].in { opacity:1; transform:none; }

/* MICRO-TRANSITIONS — global button smoothness */
button, .btn-gold-lg, .btn-ghost-lg, .btn-white, .btn-ghost-white, .plan-btn, .nav-cta {
  transition: background .18s var(--ease-out),
              color .18s var(--ease-out),
              border-color .18s var(--ease-out),
              transform .18s var(--ease-out),
              box-shadow .18s var(--ease-out),
              opacity .18s var(--ease-out) !important;
  -webkit-tap-highlight-color: transparent;
}
button:active { transform: scale(.97) !important; }

/* NAV */
.nav { position:fixed; top:0; left:0; right:0; z-index:200; display:flex; align-items:center; justify-content:space-between; padding:0 3rem; height:66px; transition:all .3s; }
.nav.scrolled { background:rgba(248,246,242,.95); backdrop-filter:blur(20px); border-bottom:1px solid var(--border); }
.nav-logo { font-family:'Playfair Display',serif; font-size:1.35rem; font-weight:500; color:#fff; cursor:pointer; letter-spacing:.01em; transition:color .3s; }
.nav.scrolled .nav-logo { color:var(--ink); }
.nav-logo span { color:var(--gold); }
.nav-links { display:flex; gap:2.5rem; }
.nav-link { font-size:.78rem; color:rgba(255,255,255,.55); cursor:pointer; transition:color .18s; letter-spacing:.02em; }
.nav.scrolled .nav-link { color:var(--ink-3); }
.nav-link:hover { color:#fff; }
.nav.scrolled .nav-link:hover { color:var(--ink); }
.nav-right { display:flex; align-items:center; gap:1.25rem; }
.nav-signin { font-size:.78rem; color:rgba(255,255,255,.5); cursor:pointer; transition:color .18s; }
.nav.scrolled .nav-signin { color:var(--ink-3); }
.nav-signin:hover { color:#fff; }
.nav.scrolled .nav-signin:hover { color:var(--ink); }
.nav-cta { background:var(--gold); color:#fff; border:none; border-radius:7px; padding:.52rem 1.35rem; font-size:.78rem; font-weight:500; cursor:pointer; font-family:inherit; }
.nav-cta:hover { background:#9e7630; transform:translateY(-1px) !important; box-shadow:0 6px 20px rgba(181,137,58,.3); }

/* HERO */
.hero { min-height:100vh; background:var(--ink); position:relative; overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:9rem 3rem 7rem; text-align:center; }
.hero-video { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:.08; filter:blur(1px) saturate(.8); pointer-events:none; }
.hero-overlay { position:absolute; inset:0; background:linear-gradient(to bottom, rgba(15,14,12,.5) 0%, rgba(15,14,12,.75) 50%, rgba(15,14,12,1) 100%); pointer-events:none; }
.hero-grain { position:absolute; inset:0; opacity:.035; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); pointer-events:none; }
.hero-glow { position:absolute; top:-20%; left:50%; transform:translateX(-50%); width:900px; height:700px; background:radial-gradient(ellipse, rgba(181,137,58,.14) 0%, transparent 65%); pointer-events:none; }
.hero-inner { position:relative; z-index:1; max-width:860px; }
.hero-label { display:inline-flex; align-items:center; gap:.65rem; margin-bottom:2.25rem; animation:fadeUp .7s ease both; }
.hero-label-line { width:32px; height:1px; background:var(--gold); }
.hero-label-text { font-size:.68rem; letter-spacing:.16em; text-transform:uppercase; color:var(--gold); font-weight:500; }
.hero-h1 { font-family:'Playfair Display',serif; font-size:clamp(3.2rem,7vw,6.5rem); font-weight:700; color:#fff; line-height:1.02; letter-spacing:-.025em; margin-bottom:2rem; animation:fadeUp .8s .1s ease both; }
.hero-h1 em { font-style:italic; font-weight:400; color:var(--gold); }
.hero-divider { width:40px; height:1px; background:rgba(255,255,255,.2); margin:0 auto 2rem; animation:fadeUp .7s .2s ease both; }
.hero-sub { font-size:1.1rem; color:rgba(255,255,255,.45); line-height:1.85; font-weight:300; max-width:520px; margin:0 auto 3rem; animation:fadeUp .8s .25s ease both; }
.hero-sub strong { color:rgba(255,255,255,.75); font-weight:400; }
.hero-actions { display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; animation:fadeUp .8s .35s ease both; }
.btn-gold-lg { background:var(--gold); color:#fff; border:none; border-radius:8px; padding:1rem 2.5rem; font-size:.95rem; font-weight:500; cursor:pointer; font-family:inherit; letter-spacing:.01em; }
.btn-gold-lg:hover { background:#9e7630; transform:translateY(-2px) !important; box-shadow:0 16px 40px rgba(181,137,58,.35); }
.btn-ghost-lg { background:transparent; color:rgba(255,255,255,.5); border:1px solid rgba(255,255,255,.12); border-radius:8px; padding:1rem 2.5rem; font-size:.95rem; cursor:pointer; font-family:inherit; }
.btn-ghost-lg:hover { color:rgba(255,255,255,.8); border-color:rgba(255,255,255,.3); }
.hero-note { font-size:.7rem; color:rgba(255,255,255,.2); margin-top:1.5rem; animation:fadeUp .7s .45s ease both; letter-spacing:.03em; }
.scroll-hint { position:absolute; bottom:2.5rem; left:50%; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; gap:.5rem; z-index:1; animation:fadeUp 1s .8s ease both; }
.scroll-line { width:1px; height:40px; background:linear-gradient(to bottom, rgba(255,255,255,.3), transparent); animation:scrollDown 1.8s ease infinite; }
@keyframes scrollDown { 0%{transform:scaleY(0);transform-origin:top} 50%{transform:scaleY(1);transform-origin:top} 51%{transform-origin:bottom} 100%{transform:scaleY(0);transform-origin:bottom} }

/* SECTION LABEL */
.sec-tag { display:flex; align-items:center; gap:.6rem; margin-bottom:1.5rem; }
.sec-tag-line { width:28px; height:1px; background:var(--gold); }
.sec-tag-text { font-size:.68rem; letter-spacing:.14em; text-transform:uppercase; color:var(--gold); font-weight:500; }
.sec-tag.center { justify-content:center; }
.sec-tag.muted .sec-tag-line { background:rgba(181,137,58,.5); }
.sec-tag.muted .sec-tag-text { color:rgba(181,137,58,.6); }

/* MIRROR — DM CHAOS */
.mirror { background:var(--ink); padding:8rem 3rem; }
.mirror-inner { max-width:1100px; margin:0 auto; }
.mirror-top { text-align:center; margin-bottom:5rem; }
.mirror-h2 { font-family:'Playfair Display',serif; font-size:clamp(2.2rem,4vw,3.5rem); font-weight:700; color:#fff; line-height:1.1; margin-bottom:1rem; }
.mirror-h2 em { font-style:italic; font-weight:400; color:var(--gold); }
.mirror-sub { font-size:.95rem; color:rgba(255,255,255,.35); font-weight:300; line-height:1.8; max-width:480px; margin:0 auto; }
.dm-row { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:rgba(255,255,255,.06); border-radius:18px; overflow:hidden; }
.dm-col { background:rgba(255,255,255,.02); padding:2.25rem; }
.dm-col-header { display:flex; align-items:center; gap:.5rem; margin-bottom:1.5rem; }
.dm-live { width:6px; height:6px; border-radius:50%; background:#22c55e; animation:pulse 2s infinite; }
.dm-handle { font-size:.66rem; color:rgba(255,255,255,.25); letter-spacing:.06em; }
.dm-msg-out { background:rgba(255,255,255,.06); border-radius:0 12px 12px 12px; padding:.65rem .9rem; font-size:.78rem; color:rgba(255,255,255,.55); line-height:1.55; margin-bottom:.5rem; }
.dm-msg-in { background:rgba(181,137,58,.12); border-radius:12px 0 12px 12px; padding:.65rem .9rem; font-size:.78rem; color:rgba(181,137,58,.7); line-height:1.55; margin-bottom:.5rem; margin-left:auto; max-width:90%; }
.dm-ts { font-size:.58rem; color:rgba(255,255,255,.15); margin-bottom:.75rem; }
.dm-more { font-size:.65rem; color:rgba(255,255,255,.15); display:flex; align-items:center; gap:.4rem; margin-top:1rem; padding-top:1rem; border-top:1px solid rgba(255,255,255,.05); }
.dm-more::before { content:''; display:block; width:16px; height:1px; background:rgba(255,255,255,.1); }

/* PHONE SECTION */
.phone-section { background:var(--cream); padding:7rem 3.5rem; }
.phone-inner { max-width:1100px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:6rem; align-items:center; }
.phone-h2 { font-family:'Playfair Display',serif; font-size:clamp(2.2rem,3.5vw,3.2rem); font-weight:700; color:var(--ink); line-height:1.1; margin-bottom:1rem; }
.phone-h2 em { font-style:italic; font-weight:400; color:var(--gold); }
.phone-desc { font-size:.95rem; color:var(--ink-3); line-height:1.85; font-weight:300; margin-bottom:2rem; }
.phone-points { display:flex; flex-direction:column; gap:.85rem; }
.phone-point { display:flex; align-items:flex-start; gap:.85rem; }
.phone-point-icon { width:32px; height:32px; border-radius:8px; background:rgba(181,137,58,.1); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:.75rem; color:var(--gold); margin-top:1px; }
.phone-point-title { font-size:.85rem; font-weight:500; color:var(--ink); margin-bottom:.15rem; }
.phone-point-desc { font-size:.78rem; color:var(--ink-3); font-weight:300; line-height:1.6; }
.phone-wrap { position:relative; display:flex; justify-content:center; }
.phone-glow-bg { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:350px; height:350px; background:radial-gradient(ellipse, rgba(181,137,58,.12), transparent 70%); filter:blur(40px); pointer-events:none; }
.iphone { width:260px; background:#111; border-radius:40px; box-shadow:0 60px 100px rgba(0,0,0,.2), 0 0 0 1px rgba(255,255,255,.07); overflow:hidden; position:relative; z-index:1; }
.iphone-notch { height:30px; background:#0a0a0a; display:flex; align-items:center; justify-content:center; }
.iphone-pill { width:70px; height:11px; background:#111; border-radius:10px; }
.iphone-body { background:#faf9f6; }
.ip-topbar { background:#111; padding:.65rem .85rem; display:flex; align-items:center; justify-content:space-between; }
.ip-name { font-family:'Playfair Display',serif; font-size:.75rem; color:#fff; font-weight:500; }
.ip-badge { font-size:.45rem; color:rgba(181,137,58,.6); letter-spacing:.06em; }
.ip-hero { background:linear-gradient(to bottom,#111,#0f0f0f); padding:1.25rem .85rem 1rem; text-align:center; }
.ip-av { width:48px; height:48px; border-radius:50%; background:#1c1c1c; border:1px solid rgba(181,137,58,.35); margin:0 auto .6rem; display:flex; align-items:center; justify-content:center; font-family:'Playfair Display',serif; font-size:1.05rem; color:var(--gold); }
.ip-title { font-family:'Playfair Display',serif; font-size:.9rem; color:#fff; }
.ip-sub { font-size:.52rem; color:rgba(255,255,255,.3); margin-top:.15rem; }
.ip-tabs { display:flex; background:#111; border-bottom:1px solid rgba(255,255,255,.06); }
.ip-tab { flex:1; padding:.48rem; font-size:.52rem; color:rgba(255,255,255,.25); text-align:center; letter-spacing:.03em; }
.ip-tab.on { color:var(--gold); border-bottom:1.5px solid var(--gold); }
.ip-scroll { padding:.65rem; }
.ip-stitle { font-size:.62rem; font-weight:500; color:var(--ink); margin-bottom:.5rem; font-family:'Playfair Display',serif; }
.ip-svc { display:flex; align-items:center; gap:.4rem; padding:.42rem .5rem; border:1px solid var(--border); border-radius:7px; margin-bottom:.3rem; background:#fff; }
.ip-bar { width:2px; height:22px; background:var(--gold); border-radius:1px; opacity:.45; flex-shrink:0; }
.ip-info { flex:1; }
.ip-sname { font-size:.58rem; color:var(--ink); font-weight:500; }
.ip-dur { font-size:.46rem; color:var(--ink-3); margin-top:.04rem; }
.ip-price { font-family:'Playfair Display',serif; font-size:.68rem; color:var(--ink); }
.ip-book { background:var(--ink); color:#fff; border:none; border-radius:4px; padding:.18rem .42rem; font-size:.46rem; font-weight:600; cursor:pointer; }
.ip-footer { background:#faf9f6; text-align:center; padding:.3rem; }
.ip-powered { font-size:.42rem; color:var(--gold); opacity:.45; }

/* BETA SECTION */
.beta-section { background:var(--white); padding:7rem 3.5rem; }
.beta-inner { max-width:1100px; margin:0 auto; }
.beta-top { text-align:center; margin-bottom:5rem; }
.beta-h2 { font-family:'Playfair Display',serif; font-size:clamp(2.2rem,3.5vw,3rem); font-weight:700; color:var(--ink); line-height:1.1; margin-bottom:1rem; }
.beta-h2 em { font-style:italic; font-weight:400; color:var(--gold); }
.beta-sub { font-size:.95rem; color:var(--ink-3); font-weight:300; line-height:1.8; max-width:520px; margin:0 auto 3rem; }
.beta-cards { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; margin-bottom:3.5rem; }
.beta-card { background:var(--cream); border:1px solid var(--border); border-radius:18px; padding:2.25rem; transition:all .3s var(--ease-out); }
.beta-card:hover { transform:translateY(-6px); box-shadow:0 24px 60px rgba(0,0,0,.07); border-color:rgba(181,137,58,.25); }
.beta-card-icon { font-size:1.5rem; margin-bottom:1rem; }
.beta-card-title { font-family:'Playfair Display',serif; font-size:1.05rem; color:var(--ink); margin-bottom:.5rem; font-weight:500; }
.beta-card-text { font-size:.82rem; color:var(--ink-3); line-height:1.7; font-weight:300; }
.beta-cta-box { background:var(--ink); border-radius:20px; padding:3rem; text-align:center; position:relative; overflow:hidden; }
.beta-cta-glow { position:absolute; top:-30%; left:50%; transform:translateX(-50%); width:600px; height:400px; background:radial-gradient(ellipse, rgba(181,137,58,.1) 0%, transparent 65%); pointer-events:none; }
.beta-cta-inner { position:relative; z-index:1; }
.beta-cta-eyebrow { font-size:.68rem; letter-spacing:.16em; text-transform:uppercase; color:rgba(181,137,58,.6); font-weight:500; margin-bottom:1rem; }
.beta-cta-h3 { font-family:'Playfair Display',serif; font-size:clamp(1.8rem,3vw,2.5rem); color:#fff; line-height:1.1; margin-bottom:.85rem; }
.beta-cta-h3 em { font-style:italic; color:var(--gold); font-weight:400; }
.beta-cta-p { font-size:.9rem; color:rgba(255,255,255,.35); font-weight:300; line-height:1.8; max-width:420px; margin:0 auto 2rem; }
.beta-spots { display:inline-flex; align-items:center; gap:.5rem; background:rgba(181,137,58,.1); border:1px solid rgba(181,137,58,.2); border-radius:100px; padding:.4rem 1.1rem; margin-bottom:1.75rem; }
.beta-spots-dot { width:6px; height:6px; border-radius:50%; background:var(--gold); animation:pulse 2s infinite; }
.beta-spots-text { font-size:.72rem; color:rgba(181,137,58,.8); letter-spacing:.04em; }

/* HOW */
.how-section { background:var(--cream); padding:7rem 3.5rem; }
.how-inner { max-width:1100px; margin:0 auto; }
.how-top { text-align:center; margin-bottom:6rem; }
.how-h2 { font-family:'Playfair Display',serif; font-size:clamp(2.2rem,3.5vw,3rem); font-weight:700; color:var(--ink); line-height:1.1; }
.how-h2 em { font-style:italic; font-weight:400; color:var(--gold); }
.how-sub { font-size:.9rem; color:var(--ink-3); font-weight:300; line-height:1.8; max-width:420px; margin:.85rem auto 0; }
.how-steps { display:grid; grid-template-columns:repeat(3,1fr); gap:2px; background:var(--border); border:1px solid var(--border); border-radius:18px; overflow:hidden; }
.how-step { background:var(--white); padding:3rem 2.5rem; }
.how-step-n { font-family:'Playfair Display',serif; font-size:3.5rem; font-weight:700; color:rgba(181,137,58,.15); line-height:1; margin-bottom:1.25rem; }
.how-icon { width:48px; height:48px; border-radius:12px; border:1px solid var(--border); display:flex; align-items:center; justify-content:center; margin-bottom:1.5rem; }
.how-icon svg { width:20px; height:20px; stroke:var(--gold); fill:none; stroke-width:1.5; }
.how-title { font-family:'Playfair Display',serif; font-size:1.2rem; color:var(--ink); margin-bottom:.6rem; font-weight:500; }
.how-desc { font-size:.82rem; color:var(--ink-3); line-height:1.7; font-weight:300; }

/* PRICING */
.pricing-section { background:var(--white); padding:7rem 3.5rem; }
.pricing-inner { max-width:1100px; margin:0 auto; }
.pricing-top { text-align:center; margin-bottom:5rem; }
.pricing-h2 { font-family:'Playfair Display',serif; font-size:clamp(2.2rem,3.5vw,3rem); font-weight:700; color:var(--ink); line-height:1.1; }
.pricing-h2 em { font-style:italic; font-weight:400; color:var(--gold); }
.pricing-sub { font-size:.88rem; color:var(--ink-3); font-weight:300; margin-top:.75rem; }
.pricing-beta-banner { display:inline-flex; align-items:center; gap:.6rem; background:rgba(181,137,58,.08); border:1px solid rgba(181,137,58,.2); border-radius:100px; padding:.5rem 1.25rem; margin-bottom:2rem; }
.pricing-beta-dot { width:6px; height:6px; border-radius:50%; background:var(--gold); animation:pulse 2s infinite; }
.pricing-beta-text { font-size:.75rem; color:var(--gold); font-weight:500; letter-spacing:.02em; }
.plans { display:grid; grid-template-columns:repeat(2,1fr); gap:1.75rem; max-width:780px; margin:0 auto; align-items:start; }
.plan { background:var(--cream); border:1px solid var(--border); border-radius:18px; padding:2.5rem; position:relative; transition:all .3s; }
.plan:hover { transform:translateY(-4px); box-shadow:0 16px 48px rgba(0,0,0,.07); }
.plan.hot { background:var(--ink); border-color:transparent; transform:translateY(-8px); box-shadow:0 24px 60px rgba(0,0,0,.18); }
.plan.hot:hover { transform:translateY(-14px); }
.plan-pip { position:absolute; top:2.5rem; right:2.5rem; background:var(--gold); color:#fff; font-size:.6rem; font-weight:600; letter-spacing:.08em; text-transform:uppercase; padding:.25rem .75rem; border-radius:12px; }
.plan-tier { font-size:.65rem; letter-spacing:.14em; text-transform:uppercase; color:var(--ink-3); margin-bottom:.85rem; font-weight:500; }
.plan.hot .plan-tier { color:rgba(255,255,255,.3); }
.plan-amt { font-family:'Playfair Display',serif; font-size:3.5rem; font-weight:700; color:var(--ink); line-height:1; }
.plan.hot .plan-amt { color:#fff; }
.plan-amt sup { font-size:1.3rem; font-family:'DM Sans',sans-serif; font-weight:300; vertical-align:super; }
.plan-per { font-size:.8rem; color:var(--ink-3); font-weight:300; }
.plan.hot .plan-per { color:rgba(255,255,255,.25); }
.plan-desc { font-size:.78rem; color:var(--ink-3); font-weight:300; margin:.5rem 0 1.75rem; line-height:1.55; }
.plan.hot .plan-desc { color:rgba(255,255,255,.25); }
.plan-line { height:1px; background:var(--border); margin-bottom:1.5rem; }
.plan.hot .plan-line { background:rgba(255,255,255,.07); }
.plan-feats { display:flex; flex-direction:column; gap:.6rem; margin-bottom:2rem; }
.plan-feat { display:flex; align-items:flex-start; gap:.55rem; font-size:.8rem; font-weight:300; }
.plan-feat.yes { color:var(--ink-2); }
.plan.hot .plan-feat.yes { color:rgba(255,255,255,.55); }
.plan-feat.no { color:var(--ink-3); opacity:.35; }
.feat-c { font-size:.72rem; flex-shrink:0; margin-top:1px; }
.feat-c.y { color:var(--gold); }
.feat-c.n { color:var(--ink-3); }
.plan-btn { width:100%; padding:.85rem; border-radius:10px; font-size:.84rem; font-weight:500; cursor:pointer; font-family:inherit; border:1px solid var(--border); background:transparent; color:var(--ink); letter-spacing:.02em; }
.plan-btn:hover { background:var(--ink); color:#fff; border-color:var(--ink); transform:translateY(-1px) !important; }
.plan.hot .plan-btn { background:var(--gold); color:#fff; border-color:var(--gold); }
.plan.hot .plan-btn:hover { background:#9e7630; }

/* FAQ */
.faq-section { background:var(--cream); padding:7rem 3.5rem; }
.faq-inner { max-width:780px; margin:0 auto; }
.faq-top { text-align:center; margin-bottom:4rem; }
.faq-h2 { font-family:'Playfair Display',serif; font-size:clamp(2rem,3.5vw,2.75rem); font-weight:700; color:var(--ink); line-height:1.1; }
.faq-h2 em { font-style:italic; font-weight:400; color:var(--gold); }
.faq-list { display:flex; flex-direction:column; gap:0; border:1px solid var(--border); border-radius:18px; overflow:hidden; }
.faq-item { border-bottom:1px solid var(--border); background:var(--white); transition:background .2s; }
.faq-item:last-child { border-bottom:none; }
.faq-q { display:flex; align-items:center; justify-content:space-between; padding:1.5rem 2rem; cursor:pointer; gap:1rem; }
.faq-q-text { font-size:.92rem; font-weight:500; color:var(--ink); line-height:1.4; }
.faq-icon { width:22px; height:22px; border-radius:50%; border:1px solid var(--border); display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all .25s var(--ease-out); }
.faq-icon svg { width:10px; height:10px; stroke:var(--ink-3); stroke-width:2; fill:none; transition:transform .25s var(--ease-out); }
.faq-item.open .faq-icon { background:var(--gold); border-color:var(--gold); }
.faq-item.open .faq-icon svg { stroke:#fff; transform:rotate(45deg); }
.faq-a { max-height:0; overflow:hidden; transition:max-height .4s var(--ease-out), padding .3s; }
.faq-item.open .faq-a { max-height:200px; }
.faq-a-inner { padding:0 2rem 1.5rem; font-size:.88rem; color:var(--ink-3); line-height:1.85; font-weight:300; }
.faq-a-inner strong { color:var(--ink-2); font-weight:400; }

/* FINAL CTA */
.cta { background:var(--ink); padding:7rem 3rem; text-align:center; position:relative; overflow:hidden; }
.cta-grain { position:absolute; inset:0; opacity:.03; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); pointer-events:none; }
.cta-glow { position:absolute; top:-30%; left:50%; transform:translateX(-50%); width:900px; height:700px; background:radial-gradient(ellipse, rgba(181,137,58,.13) 0%, transparent 65%); pointer-events:none; }
.cta-inner { position:relative; z-index:1; max-width:700px; margin:0 auto; }
.cta-eyebrow { display:flex; align-items:center; gap:.65rem; justify-content:center; margin-bottom:1.5rem; }
.cta-line { width:28px; height:1px; background:rgba(181,137,58,.5); }
.cta-label { font-size:.68rem; letter-spacing:.14em; text-transform:uppercase; color:rgba(181,137,58,.7); font-weight:500; }
.cta-h2 { font-family:'Playfair Display',serif; font-size:clamp(2.5rem,5vw,4.5rem); font-weight:700; color:#fff; line-height:1.06; margin-bottom:1.25rem; }
.cta-h2 em { font-style:italic; font-weight:400; color:var(--gold); }
.cta-sub { font-size:.95rem; color:rgba(255,255,255,.35); font-weight:300; line-height:1.85; margin-bottom:3rem; }
.cta-actions { display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; }
.btn-white { background:#fff; color:var(--gold); border:none; border-radius:8px; padding:1rem 2.5rem; font-size:.92rem; font-weight:500; cursor:pointer; font-family:inherit; }
.btn-white:hover { background:rgba(255,255,255,.92); transform:translateY(-2px) !important; box-shadow:0 12px 32px rgba(0,0,0,.15); }
.btn-ghost-white { background:transparent; color:rgba(255,255,255,.5); border:1px solid rgba(255,255,255,.15); border-radius:8px; padding:1rem 2.5rem; font-size:.92rem; cursor:pointer; font-family:inherit; }
.btn-ghost-white:hover { color:rgba(255,255,255,.8); border-color:rgba(255,255,255,.3); }

/* FOOTER */
footer { background:#090907; padding:3rem; border-top:1px solid rgba(255,255,255,.04); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; }
.f-logo { font-family:'Playfair Display',serif; font-size:1.15rem; color:rgba(255,255,255,.25); }
.f-logo span { color:var(--gold); }
.f-links { display:flex; gap:2rem; }
.f-link { font-size:.7rem; color:rgba(255,255,255,.18); cursor:pointer; transition:color .15s; }
.f-link:hover { color:rgba(255,255,255,.45); }
.f-copy { font-size:.68rem; color:rgba(255,255,255,.1); }

@keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }

/* RESPONSIVE */
@media(max-width:1024px){
  .phone-inner{grid-template-columns:1fr;gap:3rem;}
  .phone-wrap{order:-1;}
  .how-steps{grid-template-columns:1fr;}
  .plans{grid-template-columns:1fr;}
  .plan.hot{transform:none;}
  .dm-row{grid-template-columns:1fr;}
  .lilas-grid{grid-template-columns:1fr !important;}
  .booking-flow-grid{grid-template-columns:1fr 1fr !important;}
  .beta-cards{grid-template-columns:1fr;}
}
@media(max-width:600px){
  .booking-flow-grid{grid-template-columns:1fr !important;}
  .nav{padding:0 1.25rem;} .nav-links{display:none;}
  .hero{padding:7rem 1.5rem 6rem;}
  .mirror{padding:5rem 1.5rem;}
  .phone-inner,.how-inner,.pricing-inner,.faq-inner,.beta-inner{padding:5rem 1.5rem;}
  .phone-section,.beta-section,.how-section,.pricing-section,.faq-section,.cta{padding:5rem 1.5rem;}
  footer{padding:2rem 1.5rem;flex-direction:column;align-items:flex-start;}
  .beta-cta-box{padding:2rem 1.5rem;}
}

/* ─── SOUND FAMILIAR — ANIMATED 3D PHONE ─── */
@keyframes sfPhoneFloat {
  0%,100% { transform:perspective(1100px) rotateY(-13deg) rotateX(5deg) translateY(0px); }
  50%      { transform:perspective(1100px) rotateY(-13deg) rotateX(5deg) translateY(-14px); }
}
@keyframes sfMsgPop {
  0%  { opacity:0; transform:scale(.65) translateY(8px); }
  55% { transform:scale(1.05) translateY(-3px); }
  100%{ opacity:1; transform:scale(1) translateY(0); }
}
@keyframes sfDot {
  0%,80%,100% { transform:scale(.6); opacity:.4; }
  40%          { transform:scale(1);  opacity:1;  }
}
.sf-section { background:linear-gradient(175deg, #0f0e0c 0%, #1c1810 4%, #2a2218 8%, #F5EDD8 16%, #FAF6EC 50%, #F5EDD8 84%, #FAF6EC 100%); padding:7rem 3.5rem; overflow:hidden; position:relative; }
.sf-section::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse 80% 50% at 50% 30%, rgba(181,137,58,.07) 0%, transparent 70%); pointer-events:none; }
.sf-inner { max-width:900px; margin:0 auto; display:flex; flex-direction:column; align-items:center; gap:3.5rem; position:relative; }
.sf-blob-1 { position:absolute; top:-100px; right:-100px; width:400px; height:400px; border-radius:50%; background:radial-gradient(circle,rgba(181,137,58,.12) 0%,transparent 65%); pointer-events:none; }
.sf-blob-2 { position:absolute; bottom:-80px; left:-80px; width:320px; height:320px; border-radius:50%; background:radial-gradient(circle,rgba(181,137,58,.08) 0%,transparent 65%); pointer-events:none; }
.sf-gold-line { display:flex; align-items:center; gap:.75rem; justify-content:center; margin-bottom:1.25rem; }
.sf-gold-line::before,.sf-gold-line::after { content:''; flex:1; max-width:60px; height:1px; background:linear-gradient(90deg,transparent,var(--gold),transparent); }
.sf-heading { text-align:center; z-index:1; }
.sf-h2 { font-family:'Playfair Display',serif; font-size:clamp(2.2rem,4vw,3.5rem); font-weight:700; color:var(--ink); line-height:1.1; margin-bottom:.85rem; }
.sf-h2 em { font-style:italic; font-weight:400; color:var(--gold); }
.sf-sub { font-size:.95rem; color:var(--ink-3); font-weight:300; line-height:1.8; max-width:440px; margin:0 auto; }
.sf-phone-wrap { width:252px; height:518px; border-radius:52px; background:linear-gradient(145deg,#3d3d3f 0%,#1c1c1e 40%,#2c2c2e 100%); padding:10px; box-shadow:inset 0 0 0 1px rgba(255,255,255,.09),0 2px 0 0 #4a4a4c,18px 24px 48px rgba(0,0,0,.32),36px 48px 90px rgba(0,0,0,.2),60px 80px 130px rgba(0,0,0,.1); position:relative; z-index:1; }
.sf-phone-wrap.floating { animation:sfPhoneFloat 5s ease-in-out infinite; }
.sf-btn-r  { position:absolute; right:-3px; top:130px; width:3px; height:64px; background:#3a3a3c; border-radius:0 2px 2px 0; }
.sf-btn-l1 { position:absolute; left:-3px; top:108px; width:3px; height:36px; background:#3a3a3c; border-radius:2px 0 0 2px; }
.sf-btn-l2 { position:absolute; left:-3px; top:158px; width:3px; height:60px; background:#3a3a3c; border-radius:2px 0 0 2px; }
.sf-screen { width:100%; height:100%; border-radius:44px; background:#f2f2f7; overflow:hidden; display:flex; flex-direction:column; box-shadow:inset 0 0 0 1px rgba(0,0,0,.06); }
.sf-island { width:96px; height:26px; background:#000; border-radius:20px; margin:12px auto 0; flex-shrink:0; box-shadow:0 0 14px rgba(0,0,0,.7); }
.sf-chat-hdr { background:#fff; padding:10px 14px; display:flex; align-items:center; gap:9px; border-bottom:1px solid rgba(0,0,0,.06); margin-top:8px; flex-shrink:0; }
.sf-av { width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%); flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:13px; }
.sf-chat-name  { font-size:11px; font-weight:700; color:#1a1a1a; line-height:1.2; }
.sf-chat-label { font-size:9px; color:#8e8e93; margin-top:1px; }
.sf-feed { flex:1; overflow-y:auto; padding:10px; display:flex; flex-direction:column; gap:5px; scrollbar-width:none; }
.sf-feed::-webkit-scrollbar { display:none; }
.sf-bubble { padding:7px 11px; font-size:10.5px; max-width:82%; line-height:1.45; font-weight:500; word-break:break-word; animation:sfMsgPop .38s cubic-bezier(.34,1.56,.64,1) both; }
.sf-bubble.client { background:#e5e5ea; color:#1a1a1a; border-radius:16px 16px 16px 5px; align-self:flex-start; }
.sf-bubble.pro    { background:var(--gold); color:#fff; border-radius:16px 16px 5px 16px; align-self:flex-end; box-shadow:0 2px 10px rgba(181,137,58,.4); }
.sf-typing        { display:flex; padding:9px 14px; border-radius:16px; width:fit-content; gap:4px; }
.sf-typing.client { background:#e5e5ea; align-self:flex-start; }
.sf-typing.pro    { background:var(--gold); align-self:flex-end; }
.sf-dot           { width:5px; height:5px; border-radius:50%; }
.sf-dot.client    { background:#666; }
.sf-dot.pro       { background:rgba(255,255,255,.85); }
.sf-dot:nth-child(1) { animation:sfDot 1.2s .0s infinite ease-in-out; }
.sf-dot:nth-child(2) { animation:sfDot 1.2s .2s infinite ease-in-out; }
.sf-dot:nth-child(3) { animation:sfDot 1.2s .4s infinite ease-in-out; }
.sf-chat-input  { background:#fff; border-top:1px solid rgba(0,0,0,.06); padding:8px 12px; display:flex; align-items:center; gap:8px; flex-shrink:0; }
.sf-input-field { flex:1; background:#f2f2f7; border-radius:20px; padding:6px 12px; font-size:10px; color:#8e8e93; font-family:'DM Sans',sans-serif; }
.sf-punchline { text-align:center; z-index:1; }
.sf-quote    { font-family:'Playfair Display',serif; font-size:clamp(1.2rem,2.5vw,1.65rem); font-style:italic; color:var(--ink-2); line-height:1.45; }
.sf-cta-hint { margin-top:.85rem; font-size:.92rem; color:var(--ink-3); font-weight:300; }
.sf-cta-hint strong { color:var(--ink); font-weight:500; }
@media(max-width:600px){ .sf-section{padding:5rem 1.5rem;} }

/* ─── DASHBOARD PHONE MOCKUP ─── */
@keyframes dashPhoneFloat {
  0%,100% { transform:perspective(1000px) rotateY(-8deg) rotateX(4deg) translateY(0px); }
  50%      { transform:perspective(1000px) rotateY(-8deg) rotateX(4deg) translateY(-12px); }
}
@keyframes dashScroll {
  0%,7%    { transform:translateY(0); }
  25%,33%  { transform:translateY(-155px); }
  50%,58%  { transform:translateY(-310px); }
  75%,83%  { transform:translateY(-465px); }
  95%,100% { transform:translateY(0); }
}
@keyframes chipFloat1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
@keyframes chipFloat2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
.dash-phone-wrap { animation:dashPhoneFloat 6s ease-in-out infinite; width:238px; height:500px; border-radius:48px; background:linear-gradient(145deg,#3d3d3f 0%,#1c1c1e 40%,#2c2c2e 100%); padding:9px; box-shadow:inset 0 0 0 1px rgba(255,255,255,.09),0 2px 0 0 #4a4a4c,-14px 20px 48px rgba(0,0,0,.28),-28px 40px 80px rgba(0,0,0,.18); position:relative; z-index:2; flex-shrink:0; }
.dash-btn-r  { position:absolute; right:-3px; top:130px; width:3px; height:64px; background:#3a3a3c; border-radius:0 2px 2px 0; }
.dash-btn-l1 { position:absolute; left:-3px; top:108px; width:3px; height:36px; background:#3a3a3c; border-radius:2px 0 0 2px; }
.dash-btn-l2 { position:absolute; left:-3px; top:158px; width:3px; height:60px; background:#3a3a3c; border-radius:2px 0 0 2px; }
.dash-screen { width:100%; height:100%; border-radius:41px; background:#f5f4f0; overflow:hidden; display:flex; flex-direction:column; }
.dash-island { width:90px; height:24px; background:#000; border-radius:18px; margin:11px auto 0; flex-shrink:0; box-shadow:0 0 12px rgba(0,0,0,.7); }
.dash-scrollable-wrap { flex:1; overflow:hidden; }
.dash-scrollable { animation:dashScroll 14s ease-in-out infinite; }
.dash-chip { background:#fff; border:1px solid var(--border); border-radius:16px; padding:.85rem 1.1rem; box-shadow:0 10px 36px rgba(0,0,0,.09); position:absolute; min-width:148px; z-index:3; }
.dash-chip-dark { background:var(--ink); border-color:transparent; box-shadow:0 10px 36px rgba(0,0,0,.25); }
.dash-chip-gold { border-color:rgba(181,137,58,.25); box-shadow:0 10px 36px rgba(181,137,58,.14); }
@media(max-width:900px){ .dash-chip{display:none;} }

/* LILAS QUOTE — scroll-triggered gold highlight */
.lilas-quote { transition: background .9s ease, border-color .9s ease, box-shadow .9s ease; }
.lilas-quote p { transition: color .9s ease; }
.lilas-quote .lilas-attr { transition: color .9s ease; }
.lilas-quote[data-rv].in {
  background: rgba(181,137,58,.07) !important;
  border-color: rgba(181,137,58,.28) !important;
  box-shadow: 0 0 60px rgba(181,137,58,.1), inset 0 0 40px rgba(181,137,58,.04);
}
.lilas-quote[data-rv].in p { color: rgba(255,255,255,.78) !important; }
.lilas-quote[data-rv].in .lilas-attr { color: rgba(181,137,58,.55) !important; }
`

const plans = [
  { tier:'Essential', amt:39, desc:'Everything you need to run your business without the chaos.', hot:false,
    feats:[
      {y:true,  t:'Public profile & booking page'},
      {y:true,  t:'Unlimited services'},
      {y:true,  t:'Product shop'},
      {y:true,  t:'Formations & courses'},
      {y:true,  t:'Client management'},
      {y:true,  t:'Revenue analytics'},
      {y:true,  t:'Automated reminders — no more no-shows'},
      {y:false, t:'AI Product Photo Enhancement'},
      {y:false, t:'Priority support'},
    ]},
  { tier:'Pro', amt:79, desc:'For professionals who want to stand out and sell more.', hot:true,
    feats:[
      {y:true, t:'Everything in Essential'},
      {y:true, t:'AI Product Photo Enhancement ✦'},
      {y:true, t:'Studio & glamour photo styles'},
      {y:true, t:'Priority support'},
      {y:true, t:'Early access to new features'},
      {y:true, t:'Lock-in pricing — forever'},
    ]},
]

const faqs = [
  { q:'Does my client need to download an app or create an account?',
    a:'No. They tap your link, pick a service, choose a time, and confirm. No app. No account. No friction. The average booking takes under 2 minutes.' },
  { q:'What happens after the free beta period?',
    a:'When we launch paid plans, beta members will be the first to know — and the last to pay. We\'ll give you an extended free window before anything changes, and you\'ll lock in early pricing.' },
  { q:'Can I keep my current booking system while I try this?',
    a:'Yes. We\'re not asking you to burn anything down. Use both, compare, and decide. Most people stop using their old system within the first week.' },
  { q:'Is my data safe?',
    a:'Built on Supabase with enterprise-grade security. Row-level security on every table. Your data belongs to you — not us, not advertisers, not anyone else.' },
  { q:'Do I need technical knowledge to set this up?',
    a:'If you can post on Instagram, you can use Organized. Setup takes under 10 minutes. We\'ll walk you through every step.' },
  { q:'What if I want to cancel?',
    a:'No questions, no retention emails, no dark patterns. Cancel anytime from your dashboard in one click. Your data can be exported before you go.' },
]

const SF_MSGS = [
  { id:1,  from:'client', text:'Hey! Are you free Saturday? 🙏',        delay:500  },
  { id:2,  from:'pro',    text:'Which Saturday — this one or next?',     delay:1400 },
  { id:3,  from:'client', text:'This one, like around 2pm?',             delay:2300 },
  { id:4,  from:'pro',    text:'2pm is taken… maybe 4?',                 delay:3100 },
  { id:5,  from:'client', text:'Hmm, can we do 3:30 instead?',           delay:4000 },
  { id:6,  from:'pro',    text:'Let me check 🤔',                        delay:4700 },
  { id:7,  from:'pro',    text:'3:30 works! What service?',              delay:5600 },
  { id:8,  from:'client', text:'Wash, blowdry & style 🫶',              delay:6500 },
  { id:9,  from:'pro',    text:"That's $85, need a $20 deposit",         delay:7400 },
  { id:10, from:'client', text:'How do I send you the deposit?',         delay:8300 },
  { id:11, from:'pro',    text:'CashApp $myhandle or e-transfer',        delay:9200 },
  { id:12, from:'client', text:"Sent! Also, what's your address again?", delay:10100 },
]
const SF_TYPING = [2, 4, 6, 7, 9, 11]

export default function Landing() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const [sfVisible, setSfVisible] = useState([])
  const [sfTyping, setSfTyping] = useState(null)
  const [sfStarted, setSfStarted] = useState(false)
  const sfRef = useRef(null)
  const sfEndRef = useRef(null)
  useReveal()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !sfStarted) setSfStarted(true)
    }, { threshold: 0.35 })
    if (sfRef.current) obs.observe(sfRef.current)
    return () => obs.disconnect()
  }, [sfStarted])

  useEffect(() => {
    if (!sfStarted) return
    const timers = []
    SF_MSGS.forEach(msg => {
      if (SF_TYPING.includes(msg.id))
        timers.push(setTimeout(() => setSfTyping(msg.from), msg.delay - 750))
      timers.push(setTimeout(() => {
        setSfTyping(null)
        setSfVisible(prev => [...prev, msg.id])
      }, msg.delay))
    })
    return () => timers.forEach(clearTimeout)
  }, [sfStarted])

  useEffect(() => {
    if (sfEndRef.current?.parentElement) {
      sfEndRef.current.parentElement.scrollTop = sfEndRef.current.parentElement.scrollHeight
    }
  }, [sfVisible, sfTyping])

  return (
    <div>
      <style>{css}</style>

      {/* NAV */}
      <nav className={`nav ${scrolled?'scrolled':''}`}>
        <div className="nav-logo" onClick={()=>navigate('/')}>Organized<span>.</span></div>
        <div className="nav-links">
          <span className="nav-link" onClick={()=>document.getElementById('how')?.scrollIntoView({behavior:'smooth'})}>How it works</span>
          <span className="nav-link" onClick={()=>document.getElementById('pricing')?.scrollIntoView({behavior:'smooth'})}>Pricing</span>
          <span className="nav-link" onClick={()=>document.getElementById('faq')?.scrollIntoView({behavior:'smooth'})}>FAQ</span>
        </div>
        <div className="nav-right">
          <span className="nav-signin" onClick={()=>navigate('/auth')}>Sign in</span>
          <button className="nav-cta" onClick={()=>navigate('/auth')}>Get started free</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <video className="hero-video" autoPlay muted loop playsInline
          src="https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-hairdresser-cutting-hair-41826-large.mp4"/>
        <div className="hero-overlay"/>
        <div className="hero-grain"/>
        <div className="hero-glow"/>
        <div className="hero-inner">
          <div className="hero-label">
            <div className="hero-label-line"/>
            <span className="hero-label-text">Built for service professionals</span>
            <div className="hero-label-line"/>
          </div>
          <h1 className="hero-h1">
            Every unanswered DM is<br/>a booking <em>you lost.</em><br/>
            You're leaving money<br/>on the <em>table.</em>
          </h1>
          <div className="hero-divider"/>
          <p className="hero-sub">
            Let your clients book you directly —{' '}
            <strong>no more back-and-forth DMs,</strong>{' '}
            no more confusion, no more missed opportunity.
          </p>
          <div className="hero-actions">
            <button className="btn-gold-lg" onClick={()=>navigate('/auth')}>Claim Your Spot — Free</button>
            <button className="btn-ghost-lg" onClick={()=>document.getElementById('how')?.scrollIntoView({behavior:'smooth'})}>See how it works</button>
          </div>
          <p className="hero-note">Early access is open — limited spots · Free during beta · No credit card</p>
        </div>
        <div className="scroll-hint"><div className="scroll-line"/></div>
      </section>

      {/* SOUND FAMILIAR — ANIMATED DM PHONE */}
      <div className="sf-section" ref={sfRef}>
        <div className="sf-inner">
          <div className="sf-blob-1"/>
          <div className="sf-blob-2"/>

          <div className="sf-heading" data-rv>
            <div className="sf-gold-line">
              <span className="sec-tag-text">Sound familiar?</span>
            </div>
            <h2 className="sf-h2">This is how every booking <em>starts.</em></h2>
            <p className="sf-sub">Back-and-forth. Every single time. Meanwhile the client loses patience — and you lose money.</p>
          </div>

          {/* 3D Phone */}
          <div className={`sf-phone-wrap${sfStarted?' floating':''}`}>
            <div className="sf-btn-r"/>
            <div className="sf-btn-l1"/>
            <div className="sf-btn-l2"/>
            <div className="sf-screen">
              <div className="sf-island"/>
              <div className="sf-chat-hdr">
                <div className="sf-av">👤</div>
                <div>
                  <div className="sf-chat-name">sarah.nails.glam</div>
                  <div className="sf-chat-label">Instagram Direct</div>
                </div>
                <span style={{fontSize:'14px',color:'#8e8e93',marginLeft:'auto'}}>ⓘ</span>
              </div>
              <div className="sf-feed">
                {SF_MSGS.filter(m => sfVisible.includes(m.id)).slice(-8).map(msg => (
                  <div key={msg.id} className={`sf-bubble ${msg.from}`}>{msg.text}</div>
                ))}
                {sfTyping && (
                  <div className={`sf-typing ${sfTyping}`}>
                    <div className={`sf-dot ${sfTyping}`}/>
                    <div className={`sf-dot ${sfTyping}`}/>
                    <div className={`sf-dot ${sfTyping}`}/>
                  </div>
                )}
                <div ref={sfEndRef}/>
              </div>
              <div className="sf-chat-input">
                <div className="sf-input-field">Message…</div>
                <span style={{fontSize:'16px'}}>🎤</span>
              </div>
            </div>
          </div>

          <div className="sf-punchline" data-rv>
            <p className="sf-quote">"And that's just to confirm one appointment."</p>
            <p className="sf-cta-hint">Stop managing bookings. <strong>Start taking them.</strong></p>
          </div>
        </div>
      </div>

      {/* LILAS — BEFORE & AFTER */}
      <div style={{background:'linear-gradient(180deg, #2a2118 0%, #1a1410 12%, #0f0e0c 30%)',padding:'7rem 3.5rem'}}>
        <div style={{maxWidth:'1100px',margin:'0 auto'}}>
          <div data-rv style={{textAlign:'center',marginBottom:'5rem'}}>
            <div className="sec-tag center muted" style={{justifyContent:'center',marginBottom:'1.25rem'}}>
              <div className="sec-tag-line" style={{background:'rgba(181,137,58,.5)'}}/>
              <span className="sec-tag-text" style={{color:'rgba(181,137,58,.6)'}}>The professional we built this for</span>
              <div className="sec-tag-line" style={{background:'rgba(181,137,58,.5)'}}/>
            </div>
            <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(2.2rem,4vw,3.5rem)',fontWeight:700,color:'#fff',lineHeight:1.1,marginBottom:'1rem'}}>
              This is <em style={{fontStyle:'italic',fontWeight:400,color:'var(--gold)'}}>your week.</em>
            </h2>
            <p style={{fontSize:'.95rem',color:'rgba(255,255,255,.35)',fontWeight:300,lineHeight:1.8,maxWidth:'480px',margin:'0 auto'}}>
              Talented. Fully booked — or so it seems. Here's what the reality actually looks like.
            </p>
          </div>

          <div className="lilas-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'2.5rem',alignItems:'start'}}>
            {/* BEFORE */}
            <div data-rv>
              <div style={{display:'flex',alignItems:'center',gap:'.75rem',marginBottom:'1.5rem'}}>
                <div style={{background:'rgba(239,68,68,.12)',color:'#f87171',fontSize:'.66rem',fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',padding:'.3rem .9rem',borderRadius:'12px',border:'1px solid rgba(239,68,68,.2)'}}>Before Organized</div>
              </div>
              <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.35rem',color:'rgba(255,255,255,.55)',marginBottom:'1.75rem',fontStyle:'italic',lineHeight:1.35,maxWidth:'320px'}}>
                "23 unread DMs. 3 missed bookings. And it's only Monday."
              </div>
              <div style={{background:'#fff',borderRadius:'36px',overflow:'hidden',boxShadow:'0 32px 80px rgba(0,0,0,.5)',border:'1px solid rgba(255,255,255,.08)',maxWidth:'280px',margin:'0 auto'}}>
                <div style={{height:'28px',background:'#fff',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <div style={{width:70,height:10,background:'#f0f0f0',borderRadius:10}}/>
                </div>
                <div style={{padding:'.6rem 1rem .4rem',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #f0f0f0'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'.3rem'}}>
                    <span style={{fontSize:'.82rem',fontWeight:700,color:'#000',fontFamily:'system-ui'}}>lilas_hairstudio</span>
                    <div style={{width:7,height:7,borderRadius:'50%',background:'#ef4444',marginTop:1}}/>
                  </div>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                </div>
                <div style={{padding:'.5rem .85rem'}}>
                  <div style={{background:'#f2f2f2',borderRadius:10,padding:'.38rem .75rem',display:'flex',alignItems:'center',gap:'.4rem'}}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <span style={{fontSize:'.72rem',color:'#999',fontFamily:'system-ui'}}>Rechercher</span>
                  </div>
                </div>
                <div style={{display:'flex',gap:'.6rem',padding:'.3rem .85rem .6rem',overflowX:'hidden'}}>
                  {[{av:'L',label:'Votre note',bg:'#e8e8e8'},{av:'K',label:'kezia_b',bg:'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)'},{av:'A',label:'amara__d',bg:'linear-gradient(135deg,#f09433,#e6683c,#dc2743)'},{av:'N',label:'nadia_nat',bg:'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)'}].map((s,i)=>(
                    <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'.2rem',flexShrink:0}}>
                      <div style={{width:48,height:48,borderRadius:'50%',background:i===0?'#e8e8e8':'transparent',padding:i===0?0:'2px',backgroundImage:i>0?s.bg:'none'}}>
                        <div style={{width:'100%',height:'100%',borderRadius:'50%',background:i===0?'transparent':'#fff',display:'flex',alignItems:'center',justifyContent:'center',padding:i===0?0:'2px'}}>
                          <div style={{width:'100%',height:'100%',borderRadius:'50%',background:i===0?'#e8e8e8':'#ddd',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.75rem',fontWeight:700,color:i===0?'#999':'#555',fontFamily:'system-ui'}}>{s.av}</div>
                        </div>
                      </div>
                      <span style={{fontSize:'.5rem',color:'#000',fontFamily:'system-ui',maxWidth:50,textAlign:'center',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.label}</span>
                    </div>
                  ))}
                </div>
                <div style={{padding:'.4rem .85rem .2rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:'.8rem',fontWeight:700,color:'#000',fontFamily:'system-ui'}}>Messages</span>
                  <span style={{fontSize:'.75rem',color:'#999',fontFamily:'system-ui'}}>Demandes</span>
                </div>
                {[
                  {av:'K',name:'kezia_b',msg:'Hey do you still have Saturday open?',time:'2 j',color:'#8b5cf6'},
                  {av:'A',name:'amara__d',msg:'How much for knotless? What length...',time:'2 j',color:'#ec4899'},
                  {av:'Z',name:'zoe.m',msg:'I sent you my deposit but no reply 😟',time:'3 j',color:'#f97316'},
                  {av:'N',name:'nadia_nat',msg:'Can you fit me in this week?',time:'3 j',color:'#06b6d4'},
                  {av:'T',name:'tasha__r',msg:'Ok so what time works for you Friday?',time:'4 j',color:'#10b981'},
                ].map((dm,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:'.65rem',padding:'.55rem .85rem',background:'#fff'}}>
                    <div style={{width:44,height:44,borderRadius:'50%',background:dm.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.82rem',fontWeight:700,color:'#fff',fontFamily:'system-ui',flexShrink:0}}>{dm.av}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:'.78rem',fontWeight:700,color:'#000',fontFamily:'system-ui',marginBottom:'.08rem'}}>{dm.name}</div>
                      <div style={{fontSize:'.7rem',color:'#000',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontFamily:'system-ui'}}>{dm.msg}</div>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'.25rem',flexShrink:0}}>
                      <span style={{fontSize:'.62rem',color:'#999',fontFamily:'system-ui'}}>{dm.time}</span>
                      <div style={{width:9,height:9,borderRadius:'50%',background:'#0095f6'}}/>
                    </div>
                  </div>
                ))}
                <div style={{padding:'.5rem',textAlign:'center',fontSize:'.62rem',color:'#999',fontFamily:'system-ui',borderTop:'1px solid #f0f0f0'}}>+ 18 autres messages non lus</div>
                <div style={{display:'flex',justifyContent:'space-around',padding:'.6rem .5rem .5rem',borderTop:'1px solid #f0f0f0',background:'#fff'}}>
                  {[
                    <svg key="h" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>,
                    <svg key="p" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
                    <div key="m" style={{position:'relative'}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg><div style={{position:'absolute',top:-4,right:-4,background:'#ef4444',borderRadius:'50%',width:14,height:14,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.45rem',color:'#fff',fontWeight:700}}>23</div></div>,
                    <svg key="s" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
                    <div key="av" style={{width:22,height:22,borderRadius:'50%',background:'#ddd'}}/>
                  ].map((icon,i)=><div key={i} style={{cursor:'pointer'}}>{icon}</div>)}
                </div>
              </div>
              <div style={{marginTop:'1.75rem',display:'flex',flexDirection:'column',gap:'.65rem'}}>
                {['Lost 3 bookings that week — clients went elsewhere','Spent 4 hrs/day managing messages','Missed a $220 booking — never saw the DM'].map((t,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'flex-start',gap:'.6rem',fontSize:'.8rem',color:'rgba(255,255,255,.3)'}}>
                    <span style={{color:'#f87171',flexShrink:0,marginTop:'1px'}}>×</span>{t}
                  </div>
                ))}
              </div>
            </div>

            {/* AFTER */}
            <div data-rv data-delay="150">
              <div style={{display:'flex',alignItems:'center',gap:'.75rem',marginBottom:'1.5rem'}}>
                <div style={{background:'rgba(34,197,94,.1)',color:'#4ade80',fontSize:'.66rem',fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',padding:'.3rem .9rem',borderRadius:'12px',border:'1px solid rgba(34,197,94,.2)'}}>After Organized</div>
              </div>
              <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.35rem',color:'rgba(255,255,255,.7)',marginBottom:'1.75rem',fontStyle:'italic',lineHeight:1.35,maxWidth:'320px'}}>
                "Monday morning. 4 confirmed bookings. Phone still quiet."
              </div>
              <div style={{background:'#f8f6f2',borderRadius:'36px',overflow:'hidden',boxShadow:'0 32px 80px rgba(0,0,0,.5)',border:'1px solid rgba(255,255,255,.08)',maxWidth:'280px',margin:'0 auto'}}>
                <div style={{height:'28px',background:'#f8f6f2',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <div style={{width:70,height:10,background:'#e8e4dc',borderRadius:10}}/>
                </div>
                <div style={{background:'#fff',borderBottom:'1px solid #e8e4dc',padding:'.6rem .85rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{fontFamily:'Playfair Display,serif',fontSize:'.9rem',fontWeight:500,color:'#0f0e0c'}}>Organized<span style={{color:'#b5893a'}}>.</span></span>
                  <div style={{width:26,height:26,borderRadius:'50%',background:'rgba(181,137,58,.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.6rem',fontWeight:700,color:'#b5893a'}}>L</div>
                </div>
                <div style={{background:'#fff',padding:'.5rem .75rem .3rem'}}>
                  <div style={{fontSize:'.58rem',fontWeight:600,color:'#8c8882',marginBottom:'.4rem',letterSpacing:'.06em',textTransform:'uppercase'}}>Monday morning</div>
                </div>
                {[
                  {icon:'✓',bg:'rgba(34,197,94,.1)',title:'Kezia B. booked Box Braids',sub:'Sat 10:00am · $180 · Confirmed by you',time:'7:12'},
                  {icon:'✓',bg:'rgba(34,197,94,.1)',title:'Amara D. booked Silk Press',sub:'Sat 1:00pm · $95 · Confirmed by you',time:'7:48'},
                  {icon:'🛍',bg:'rgba(181,137,58,.1)',title:'Nadia ordered Moisture Serum',sub:'× 2 units · $56 received',time:'8:15'},
                  {icon:'✓',bg:'rgba(34,197,94,.1)',title:'Zoe M. booked Loc Retwist',sub:'Sun 11:00am · $120 · Confirmed by you',time:'9:02'},
                ].map((n,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:'.6rem',padding:'.55rem .75rem',borderTop:'1px solid #f5f3ee',background:'#fff'}}>
                    <div style={{width:32,height:32,borderRadius:'8px',background:n.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.75rem',flexShrink:0}}>{n.icon}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:'.65rem',fontWeight:500,color:'#0f0e0c',marginBottom:'.05rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{n.title}</div>
                      <div style={{fontSize:'.58rem',color:'#8c8882',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{n.sub}</div>
                    </div>
                    <span style={{fontSize:'.56rem',color:'#b5893a',flexShrink:0,fontWeight:500}}>{n.time}</span>
                  </div>
                ))}
                <div style={{background:'rgba(181,137,58,.07)',padding:'.75rem .85rem',display:'flex',justifyContent:'space-between',alignItems:'center',borderTop:'1px solid rgba(181,137,58,.12)'}}>
                  <div>
                    <div style={{fontSize:'.58rem',color:'#8c8882',marginBottom:'.1rem'}}>Revenue this week</div>
                    <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.25rem',color:'#b5893a',fontWeight:700}}>$451</div>
                  </div>
                  <div style={{fontSize:'.6rem',color:'#4ade80',background:'rgba(34,197,94,.1)',padding:'.25rem .6rem',borderRadius:'10px',fontWeight:500}}>↑ 23%</div>
                </div>
                <div style={{display:'flex',justifyContent:'space-around',padding:'.6rem .5rem .5rem',borderTop:'1px solid #e8e4dc',background:'#fff'}}>
                  {['⌂','📅','💬','👤'].map((ic,i)=>(
                    <div key={i} style={{fontSize:i===0?'1rem':'.85rem',opacity:i===0?1:.4,cursor:'pointer'}}>{ic}</div>
                  ))}
                </div>
              </div>
              <div style={{marginTop:'1.75rem',display:'flex',flexDirection:'column',gap:'.65rem'}}>
                {['Zero unanswered messages — clients book themselves','4 hrs/day freed — spent doing what she loves','Never missed a booking again'].map((t,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'flex-start',gap:'.6rem',fontSize:'.8rem',color:'rgba(255,255,255,.5)'}}>
                    <span style={{color:'#4ade80',flexShrink:0,marginTop:'1px'}}>✓</span>{t}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div data-rv="fade" className="lilas-quote" style={{textAlign:'center',marginTop:'4rem',padding:'2.5rem',background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',borderRadius:'16px',maxWidth:'620px',margin:'4rem auto 0'}}>
            <p style={{fontSize:'1rem',fontFamily:'Playfair Display,serif',fontStyle:'italic',color:'rgba(255,255,255,.5)',marginBottom:'.75rem',lineHeight:1.5}}>
              "This is the week thousands of service professionals are living right now. We built Organized to end it."
            </p>
            <div className="lilas-attr" style={{fontSize:'.75rem',color:'rgba(255,255,255,.2)',letterSpacing:'.04em'}}>— The Organized. team</div>
          </div>
        </div>
      </div>

      {/* PHONE — THE SOLUTION */}
      <div className="phone-section">
        <div className="phone-inner">
          <div className="phone-text" data-rv="left">
            <div className="sec-tag"><div className="sec-tag-line"/><span className="sec-tag-text">Your public profile</span></div>
            <h2 className="phone-h2">One link.<br/><em>Everything they need.</em></h2>
            <p className="phone-desc">Drop it in your bio. Your clients book appointments, shop your products, and enroll in your courses — <strong style={{color:'var(--ink)',fontWeight:400}}>without ever DMing you.</strong> You focus on the craft. Organized handles everything else.</p>
            <div className="phone-points">
              {[
                {icon:'📅',title:'Appointments booked 24/7',desc:'Real-time availability. Automated confirmations. Zero back-and-forth.'},
                {icon:'🛍️',title:'Products sold directly',desc:'Your shop lives on your profile. Clients discover and order instantly.'},
                {icon:'🎓',title:'Formations & courses',desc:'Monetize your expertise. Sell knowledge alongside your services.'},
                {icon:'👥',title:'Clients tracked automatically',desc:'Every visit, every dollar, every relationship — organized for you.'},
              ].map((p,i)=>(
                <div key={i} className="phone-point" data-rv data-delay={i*80}>
                  <div className="phone-point-icon">{p.icon}</div>
                  <div className="phone-point-text">
                    <div className="phone-point-title">{p.title}</div>
                    <div className="phone-point-desc">{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="phone-wrap" data-rv="right" data-delay="150">
            <div className="phone-glow-bg"/>
            <div className="iphone">
              <div className="iphone-notch"><div className="iphone-pill"/></div>
              <div className="iphone-body">
                <div className="ip-topbar"><div className="ip-name">Elixir Hair Studio</div><div className="ip-badge">organized.</div></div>
                <div className="ip-hero">
                  <div className="ip-av">E</div>
                  <div className="ip-title">Elixir Hair Studio</div>
                  <div className="ip-sub">Natural Hair Specialist · Montreal, QC</div>
                </div>
                <div className="ip-tabs">
                  <div className="ip-tab on">Book</div>
                  <div className="ip-tab">Shop</div>
                  <div className="ip-tab">Formations</div>
                </div>
                <div className="ip-scroll">
                  <div className="ip-stitle">Services</div>
                  {[['Box Braids','4–6 hrs','$180'],['Silk Press','2 hrs','$95'],['Loc Retwist','1.5 hrs','$120'],['Color & Cut','3 hrs','$220']].map(([n,d,p],i)=>(
                    <div key={i} className="ip-svc">
                      <div className="ip-bar"/>
                      <div className="ip-info"><div className="ip-sname">{n}</div><div className="ip-dur">{d}</div></div>
                      <div className="ip-price">{p}</div>
                      <button className="ip-book">Book</button>
                    </div>
                  ))}
                </div>
                <div className="ip-footer"><div className="ip-powered">Powered by Organized.</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DASHBOARD DEMO — 3D PHONE */}
      <div style={{background:'var(--cream)',padding:'7rem 3.5rem',overflow:'hidden',position:'relative'}}>
        <div style={{position:'absolute',top:'10%',left:'50%',transform:'translateX(-50%)',width:'700px',height:'500px',background:'radial-gradient(ellipse, rgba(181,137,58,.06) 0%, transparent 70%)',pointerEvents:'none'}}/>
        <div style={{maxWidth:'1100px',margin:'0 auto'}}>
          <div data-rv style={{textAlign:'center',marginBottom:'5.5rem',position:'relative',zIndex:1}}>
            <div className="sec-tag" style={{justifyContent:'center',marginBottom:'1.25rem'}}>
              <div className="sec-tag-line"/><span className="sec-tag-text">Your dashboard</span><div className="sec-tag-line"/>
            </div>
            <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(2.2rem,3.5vw,3rem)',fontWeight:700,color:'var(--ink)',lineHeight:1.1,marginBottom:'1rem'}}>
              Your business. <em style={{fontStyle:'italic',fontWeight:400,color:'var(--gold)'}}>At a glance.</em>
            </h2>
            <p style={{fontSize:'.95rem',color:'var(--ink-3)',fontWeight:300,lineHeight:1.85,maxWidth:'460px',margin:'0 auto'}}>Every booking, every sale, every client — organized the moment it happens. No spreadsheets. No missed DMs. No confusion.</p>
          </div>

          {/* Phone + floating chips */}
          <div data-rv="scale" style={{position:'relative',display:'flex',justifyContent:'center',alignItems:'center',minHeight:'620px'}}>

            {/* Chip TL — Revenue */}
            <div className="dash-chip" style={{left:'5%',top:'6%',animation:'chipFloat1 4.5s ease-in-out infinite'}}>
              <div style={{fontSize:'.58rem',color:'var(--ink-3)',letterSpacing:'.08em',textTransform:'uppercase',marginBottom:'.3rem',fontWeight:500}}>Revenue · April</div>
              <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.45rem',fontWeight:700,color:'var(--ink)',lineHeight:1}}>$2,840</div>
              <div style={{fontSize:'.65rem',color:'#4ade80',marginTop:'.3rem',fontWeight:500}}>↑ 34% vs last month</div>
            </div>

            {/* Chip TR — No-shows */}
            <div className="dash-chip dash-chip-dark" style={{right:'5%',top:'18%',animation:'chipFloat2 5.5s ease-in-out infinite'}}>
              <div style={{fontSize:'.58rem',color:'rgba(255,255,255,.4)',letterSpacing:'.08em',textTransform:'uppercase',marginBottom:'.3rem',fontWeight:500}}>No-shows</div>
              <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.45rem',fontWeight:700,color:'#4ade80',lineHeight:1}}>0</div>
              <div style={{fontSize:'.65rem',color:'rgba(255,255,255,.35)',marginTop:'.3rem'}}>Reminders sent · 18/18</div>
            </div>

            {/* Chip BL — Top service */}
            <div className="dash-chip dash-chip-gold" style={{left:'4%',bottom:'14%',animation:'chipFloat1 5s ease-in-out 1s infinite'}}>
              <div style={{fontSize:'.58rem',color:'var(--gold)',letterSpacing:'.08em',textTransform:'uppercase',marginBottom:'.3rem',fontWeight:500}}>Top service</div>
              <div style={{fontSize:'.85rem',fontWeight:600,color:'var(--ink)',marginBottom:'.15rem'}}>Silk Press</div>
              <div style={{fontSize:'.65rem',color:'var(--ink-3)'}}>18 bookings · $1,710</div>
            </div>

            {/* Chip BR — Appointments */}
            <div className="dash-chip" style={{right:'4%',bottom:'20%',animation:'chipFloat2 4s ease-in-out 2s infinite'}}>
              <div style={{fontSize:'.58rem',color:'var(--ink-3)',letterSpacing:'.08em',textTransform:'uppercase',marginBottom:'.3rem',fontWeight:500}}>Confirmed</div>
              <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.45rem',fontWeight:700,color:'var(--ink)',lineHeight:1}}>18</div>
              <div style={{fontSize:'.65rem',color:'var(--ink-3)',marginTop:'.3rem'}}>appointments this month</div>
            </div>

            {/* 3D Phone */}
            <div className="dash-phone-wrap">
              <div className="dash-btn-r"/><div className="dash-btn-l1"/><div className="dash-btn-l2"/>
              <div className="dash-screen">
                <div className="dash-island"/>
                {/* Top bar */}
                <div style={{background:'#f5f4f0',padding:'.5rem .7rem',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0,borderBottom:'1px solid rgba(0,0,0,.05)'}}>
                  <span style={{fontSize:'13px',color:'var(--ink-3)',lineHeight:1}}>☰</span>
                  <div style={{fontFamily:'Playfair Display,serif',fontSize:'.78rem',fontWeight:500,color:'var(--ink)'}}>Organized<span style={{color:'var(--gold)'}}>.</span></div>
                  <div style={{display:'flex',gap:'3px',background:'rgba(0,0,0,.07)',borderRadius:'8px',padding:'2px'}}>
                    <div style={{fontSize:'.42rem',fontWeight:600,color:'var(--ink)',background:'#fff',borderRadius:'6px',padding:'2px 7px',boxShadow:'0 1px 3px rgba(0,0,0,.1)'}}>Dash</div>
                    <div style={{fontSize:'.42rem',color:'var(--ink-3)',padding:'2px 7px'}}>Client</div>
                  </div>
                </div>
                {/* Scrollable content */}
                <div className="dash-scrollable-wrap">
                  <div className="dash-scrollable">
                    {/* Greeting */}
                    <div style={{padding:'.9rem .8rem .5rem'}}>
                      <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.15rem',fontWeight:700,color:'var(--ink)',lineHeight:1.15}}>Good morning, Nadia.</div>
                      <div style={{fontSize:'.55rem',color:'var(--ink-3)',marginTop:'.2rem'}}>Monday · April 20, 2026</div>
                    </div>
                    {/* Quick actions */}
                    <div style={{padding:'0 .8rem .7rem',display:'flex',gap:'.4rem'}}>
                      <div style={{fontSize:'.5rem',fontWeight:500,color:'var(--ink)',border:'1px solid var(--border)',borderRadius:'8px',padding:'.3rem .55rem',background:'#fff',display:'flex',alignItems:'center',gap:'.25rem'}}>🔗 Copy link</div>
                      <div style={{fontSize:'.5rem',fontWeight:600,color:'#fff',background:'var(--ink)',borderRadius:'8px',padding:'.3rem .65rem'}}>New appointment</div>
                    </div>
                    {/* Coach */}
                    <div style={{margin:'0 .8rem .55rem',background:'#fff',borderRadius:'10px',padding:'.6rem .7rem',border:'1px solid var(--border)'}}>
                      <div style={{fontSize:'.46rem',fontWeight:700,letterSpacing:'.1em',color:'var(--gold)',marginBottom:'.3rem'}}>COACH</div>
                      <div style={{fontSize:'.54rem',color:'var(--ink-2)',lineHeight:1.6}}>3 confirmed bookings today. Amara hasn't left a review yet — great moment to ask.</div>
                    </div>
                    {/* Stats */}
                    <div style={{padding:'0 .8rem',display:'flex',gap:'.35rem',marginBottom:'.55rem'}}>
                      {[['REVENUE','$2,840','↑ 34%','#4ade80'],['APPTS','18','2 pending','#fbbf24'],['PRODUCTS','7','this week','rgba(181,137,58,.8)']].map(([l,v,d,dc],i)=>(
                        <div key={i} style={{flex:'1 0 0',background:'#fff',borderRadius:'9px',padding:'.5rem .45rem',border:'1px solid var(--border)',minWidth:0}}>
                          <div style={{fontSize:'.38rem',color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'.22rem',fontWeight:500,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{l}</div>
                          <div style={{fontFamily:'Playfair Display,serif',fontSize:'.85rem',color:'var(--ink)',fontWeight:700,lineHeight:1}}>{v}</div>
                          <div style={{fontSize:'.38rem',color:dc,marginTop:'.18rem',fontWeight:500}}>{d}</div>
                        </div>
                      ))}
                    </div>
                    {/* Revenue chart */}
                    <div style={{margin:'0 .8rem .55rem',background:'#fff',borderRadius:'10px',padding:'.6rem .7rem',border:'1px solid var(--border)'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.45rem'}}>
                        <div style={{fontSize:'.55rem',fontWeight:600,color:'var(--ink)'}}>Revenue — this week</div>
                        <div style={{fontSize:'.44rem',color:'#4ade80',background:'rgba(74,222,128,.1)',padding:'.12rem .38rem',borderRadius:'7px',fontWeight:500}}>↑ 12%</div>
                      </div>
                      <div style={{display:'flex',alignItems:'flex-end',gap:'3px',height:'38px',marginBottom:'.25rem'}}>
                        {[18,80,42,115,88,55,170].map((v,i)=>(
                          <div key={i} style={{flex:1,borderRadius:'2px 2px 0 0',background:i===6?'var(--gold)':'rgba(181,137,58,.2)',height:`${(v/190)*100}%`}}/>
                        ))}
                      </div>
                      <div style={{display:'flex',gap:'3px'}}>
                        {['S','M','T','W','T','F','S'].map((d,i)=><div key={i} style={{flex:1,fontSize:'.36rem',color:i===6?'var(--gold)':'var(--ink-3)',textAlign:'center',fontWeight:i===6?700:400}}>{d}</div>)}
                      </div>
                    </div>
                    {/* Revenue goal */}
                    <div style={{margin:'0 .8rem .55rem',background:'#fff',borderRadius:'10px',padding:'.6rem .7rem',border:'1px solid var(--border)'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.4rem'}}>
                        <div style={{fontSize:'.55rem',fontWeight:600,color:'var(--ink)'}}>Revenue Goal — April</div>
                        <div style={{fontSize:'.44rem',color:'var(--ink-3)'}}>Edit goal</div>
                      </div>
                      <div style={{fontSize:'.48rem',color:'var(--ink-3)',marginBottom:'.38rem'}}>$2,840 of $4,000</div>
                      <div style={{height:'5px',background:'var(--border)',borderRadius:'3px',overflow:'hidden',marginBottom:'.28rem'}}>
                        <div style={{width:'71%',height:'100%',background:'linear-gradient(90deg,var(--gold),#d4a853)',borderRadius:'3px'}}/>
                      </div>
                      <div style={{display:'flex',justifyContent:'space-between'}}>
                        <div style={{fontSize:'.44rem',color:'var(--gold)',fontWeight:600}}>71% reached</div>
                        <div style={{fontSize:'.44rem',color:'var(--ink-3)'}}>$1,160 remaining</div>
                      </div>
                    </div>
                    {/* Top service */}
                    <div style={{margin:'0 .8rem .55rem',background:'#fff',borderRadius:'10px',padding:'.6rem .7rem',border:'1px solid var(--border)'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.4rem'}}>
                        <div style={{fontSize:'.55rem',fontWeight:600,color:'var(--ink)'}}>Your top service</div>
                        <div style={{fontSize:'.44rem',color:'var(--gold)',background:'rgba(181,137,58,.1)',padding:'.12rem .38rem',borderRadius:'7px',fontWeight:600}}>#1</div>
                      </div>
                      <div style={{fontFamily:'Playfair Display,serif',fontSize:'.95rem',fontWeight:700,color:'var(--ink)',marginBottom:'.12rem'}}>Silk Press</div>
                      <div style={{fontSize:'.48rem',color:'var(--ink-3)',marginBottom:'.38rem'}}>18 bookings · $1,710 earned</div>
                      <div style={{height:'4px',background:'var(--border)',borderRadius:'2px',overflow:'hidden',marginBottom:'.25rem'}}>
                        <div style={{width:'61%',height:'100%',background:'var(--gold)',borderRadius:'2px'}}/>
                      </div>
                      <div style={{fontSize:'.44rem',color:'var(--gold)',fontWeight:500}}>61% of your total revenue</div>
                    </div>
                    {/* Today's schedule */}
                    <div style={{margin:'0 .8rem 1rem',background:'#fff',borderRadius:'10px',padding:'.6rem .7rem',border:'1px solid var(--border)'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.5rem'}}>
                        <div style={{fontSize:'.55rem',fontWeight:600,color:'var(--ink)'}}>Today's schedule</div>
                        <div style={{fontSize:'.44rem',color:'#4ade80',background:'rgba(74,222,128,.1)',padding:'.12rem .42rem',borderRadius:'7px',display:'flex',alignItems:'center',gap:'.2rem'}}>
                          <div style={{width:4,height:4,borderRadius:'50%',background:'#4ade80'}}/>3 confirmed
                        </div>
                      </div>
                      {[['A','Amara D.','Box Braids','10:00 AM','$180','#8b5cf6'],['K','Kezia B.','Silk Press','1:00 PM','$95','#ec4899'],['Z','Zoe M.','Loc Retwist','4:30 PM','$120','#f97316']].map(([av,name,svc,time,price,col],i)=>(
                        <div key={i} style={{display:'flex',alignItems:'center',gap:'.45rem',padding:'.35rem 0',borderTop:i>0?'1px solid var(--border)':'none'}}>
                          <div style={{width:24,height:24,borderRadius:'50%',background:col,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.52rem',fontWeight:700,color:'#fff',flexShrink:0}}>{av}</div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:'.52rem',fontWeight:600,color:'var(--ink)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{name}</div>
                            <div style={{fontSize:'.46rem',color:'var(--ink-3)'}}>{svc}</div>
                          </div>
                          <div style={{textAlign:'right',flexShrink:0}}>
                            <div style={{fontSize:'.46rem',color:'var(--ink-3)'}}>{time}</div>
                            <div style={{fontSize:'.48rem',fontWeight:600,color:'var(--gold)'}}>{price}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Calendar */}
                    <div style={{margin:'0 .8rem 1rem',background:'#fff',borderRadius:'10px',padding:'.6rem .7rem',border:'1px solid var(--border)'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.5rem'}}>
                        <div style={{fontSize:'.55rem',fontWeight:600,color:'var(--ink)'}}>Calendar</div>
                        <div style={{fontSize:'.44rem',color:'var(--ink-3)'}}>April 2026</div>
                      </div>
                      {/* Day headers */}
                      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'1px',marginBottom:'.2rem'}}>
                        {['S','M','T','W','T','F','S'].map((d,i)=>(
                          <div key={i} style={{textAlign:'center',fontSize:'.38rem',color:'var(--ink-3)',padding:'.15rem 0',fontWeight:500}}>{d}</div>
                        ))}
                      </div>
                      {/* Calendar days */}
                      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'1px'}}>
                        {[null,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30].map((d,i)=>{
                          const hasAppt = [5,8,9,13,14,16,20].includes(d)
                          const isBlocked = [12].includes(d)
                          const isToday = d===20
                          return (
                            <div key={i} style={{textAlign:'center',padding:'.22rem 0',position:'relative'}}>
                              <div style={{
                                fontSize:'.46rem',
                                fontWeight:isToday?700:d?400:300,
                                color:isToday?'#fff':d?'var(--ink)':'transparent',
                                background:isToday?'var(--ink)':'transparent',
                                borderRadius:'50%',
                                width:'16px',height:'16px',
                                display:'flex',alignItems:'center',justifyContent:'center',
                                margin:'0 auto',
                              }}>{d||''}</div>
                              {(hasAppt||isBlocked)&&d&&(
                                <div style={{width:4,height:4,borderRadius:'50%',background:isBlocked?'#ef4444':'var(--gold)',margin:'.05rem auto 0'}}/>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      {/* Legend */}
                      <div style={{display:'flex',gap:'.75rem',marginTop:'.4rem',paddingTop:'.35rem',borderTop:'1px solid var(--border)'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'.25rem'}}>
                          <div style={{width:5,height:5,borderRadius:'50%',background:'var(--gold)'}}/>
                          <span style={{fontSize:'.42rem',color:'var(--ink-3)'}}>Appointment</span>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:'.25rem'}}>
                          <div style={{width:5,height:5,borderRadius:'50%',background:'#ef4444'}}/>
                          <span style={{fontSize:'.42rem',color:'var(--ink-3)'}}>Blocked</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOOKING FLOW */}
      <div style={{background:'var(--white)',padding:'7rem 3.5rem'}}>
        <div style={{maxWidth:'1100px',margin:'0 auto'}}>
          <div data-rv style={{textAlign:'center',marginBottom:'4.5rem'}}>
            <div className="sec-tag" style={{justifyContent:'center',marginBottom:'1rem'}}>
              <div className="sec-tag-line"/><span className="sec-tag-text">The booking experience</span><div className="sec-tag-line"/>
            </div>
            <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(2.2rem,3.5vw,3rem)',fontWeight:700,color:'var(--ink)',lineHeight:1.1}}>
              For your client, it's <em style={{fontStyle:'italic',fontWeight:400,color:'var(--gold)'}}>effortless.</em>
            </h2>
            <p style={{fontSize:'.9rem',color:'var(--ink-3)',fontWeight:300,lineHeight:1.8,maxWidth:'420px',margin:'.85rem auto 0'}}>From discovery to confirmed booking in under 2 minutes. No app. No account. No back-and-forth.</p>
          </div>
          <div className="booking-flow-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1.5rem',alignItems:'start'}}>
            {[
              {step:'01',title:'She finds your link',desc:'In your Instagram bio. One tap.',dark:true,screen:(
                <div style={{textAlign:'center',padding:'1rem .5rem'}}>
                  <div style={{width:32,height:32,borderRadius:'50%',background:'#1a1a1a',border:'1px solid rgba(181,137,58,.3)',margin:'0 auto .5rem',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Playfair Display,serif',fontSize:'.75rem',color:'var(--gold)'}}>L</div>
                  <div style={{fontSize:'.62rem',color:'#fff',fontWeight:500,marginBottom:'.2rem'}}>Lilas Hair Studio</div>
                  <div style={{fontSize:'.5rem',color:'rgba(255,255,255,.35)',marginBottom:'.75rem'}}>✂️ Natural Hair Specialist</div>
                  <div style={{background:'var(--gold)',borderRadius:'6px',padding:'.35rem',fontSize:'.55rem',color:'#fff',textAlign:'center',fontWeight:500}}>Book with Lilas ↗</div>
                </div>
              )},
              {step:'02',title:'She picks a service',desc:'Sees your full menu with prices.',dark:true,screen:(
                <div style={{padding:'.5rem'}}>
                  {[['Box Braids','$180','4–6 hrs',true],['Silk Press','$95','2 hrs',false],['Loc Retwist','$120','1.5 hrs',false]].map(([n,p,d,sel],i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:'.35rem',padding:'.35rem',border:'1px solid',borderColor:sel?'rgba(181,137,58,.3)':'rgba(255,255,255,.06)',borderRadius:'6px',marginBottom:'.25rem',background:sel?'rgba(181,137,58,.08)':'transparent'}}>
                      <div style={{width:2,height:18,background:'var(--gold)',borderRadius:1,opacity:.5,flexShrink:0}}/>
                      <div style={{flex:1}}>
                        <div style={{fontSize:'.55rem',color:'#fff',fontWeight:500}}>{n}</div>
                        <div style={{fontSize:'.46rem',color:'rgba(255,255,255,.3)'}}>{d}</div>
                      </div>
                      <div style={{fontFamily:'Playfair Display,serif',fontSize:'.65rem',color:sel?'var(--gold)':'rgba(255,255,255,.5)'}}>{p}</div>
                    </div>
                  ))}
                </div>
              )},
              {step:'03',title:'She picks date & time',desc:'Sees only your available slots.',dark:false,screen:(
                <div style={{padding:'.5rem'}}>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,marginBottom:'.5rem'}}>
                    {['S','M','T','W','T','F','S'].map((d,i)=><div key={i} style={{textAlign:'center',fontSize:'.44rem',color:'var(--ink-3)',padding:'.2rem 0'}}>{d}</div>)}
                    {[null,null,1,2,3,4,5,6,7,8,9,10,11,12].map((d,i)=>(
                      <div key={i} style={{textAlign:'center',fontSize:'.52rem',padding:'.25rem 0',borderRadius:'4px',background:d===8?'var(--gold)':d&&[6,7,9].includes(d)?'rgba(181,137,58,.1)':'transparent',color:d===8?'#111':d&&[6,7,9].includes(d)?'var(--gold)':'var(--ink-3)'}}>{d||''}</div>
                    ))}
                  </div>
                  <div style={{fontSize:'.5rem',color:'var(--ink-3)',marginBottom:'.3rem'}}>Available times — Sat Apr 8</div>
                  {['9:00 AM','11:00 AM','2:00 PM'].map((t,i)=>(
                    <div key={i} style={{padding:'.3rem .5rem',border:'1px solid',borderColor:i===0?'var(--gold)':'var(--border)',borderRadius:'5px',fontSize:'.52rem',color:i===0?'var(--gold)':'var(--ink-3)',marginBottom:'.2rem',background:i===0?'rgba(181,137,58,.06)':'transparent'}}>{t}</div>
                  ))}
                </div>
              )},
              {step:'04',title:'You confirm. She\'s notified instantly.',desc:'Review the request and approve it — she gets her confirmation the second you do. A reminder goes out automatically before the appointment.',dark:false,screen:(
                <div style={{textAlign:'center',padding:'1rem .5rem'}}>
                  <div style={{width:36,height:36,borderRadius:'50%',background:'rgba(46,125,82,.12)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto .75rem',fontSize:'1rem',border:'1px solid rgba(46,125,82,.2)'}}>✓</div>
                  <div style={{fontFamily:'Playfair Display,serif',fontSize:'.85rem',color:'var(--ink)',marginBottom:'.35rem'}}>Booking confirmed</div>
                  <div style={{fontSize:'.55rem',color:'var(--ink-3)',lineHeight:1.6,marginBottom:'.75rem'}}>Box Braids with Lilas<br/>Saturday, Apr 8 · 9:00 AM<br/>$180</div>
                  <div style={{fontSize:'.52rem',color:'rgba(181,137,58,.7)',background:'rgba(181,137,58,.07)',borderRadius:'6px',padding:'.35rem',border:'1px solid rgba(181,137,58,.12)'}}>Reminder sent 24h before ✓</div>
                </div>
              )},
            ].map((s,i)=>(
              <div key={i} data-rv data-delay={i*100}>
                <div style={{fontFamily:'Playfair Display,serif',fontSize:'2rem',color:'var(--border)',lineHeight:1,marginBottom:'.75rem'}}>{s.step}</div>
                <div style={{fontFamily:'Playfair Display,serif',fontSize:'.95rem',color:'var(--ink)',marginBottom:'.3rem',fontWeight:500}}>{s.title}</div>
                <div style={{fontSize:'.78rem',color:'var(--ink-3)',fontWeight:300,marginBottom:'1.25rem'}}>{s.desc}</div>
                <div style={{background:s.dark?'#111':'var(--cream)',borderRadius:'20px',overflow:'hidden',boxShadow:'0 20px 48px rgba(0,0,0,.15)',border:s.dark?'1px solid rgba(255,255,255,.06)':'1px solid var(--border)'}}>
                  <div style={{height:'14px',background:s.dark?'#0a0a0a':'var(--border)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <div style={{width:36,height:5,background:s.dark?'#111':'rgba(0,0,0,.1)',borderRadius:5}}/>
                  </div>
                  <div style={{background:s.dark?'#111':'var(--white)',padding:'.4rem .5rem',borderBottom:s.dark?'1px solid rgba(255,255,255,.05)':'1px solid var(--border)',fontSize:'.5rem',color:s.dark?'rgba(255,255,255,.2)':'var(--ink-3)',textAlign:'center',letterSpacing:'.04em'}}>
                    {s.step==='01'?'Instagram Profile':s.step==='02'?'Services':s.step==='03'?'Pick a date':'Confirmed'}
                  </div>
                  <div style={{minHeight:'140px'}}>{s.screen}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="how-section" id="how">
        <div className="how-inner">
          <div className="how-top" data-rv>
            <div className="sec-tag" style={{justifyContent:'center',marginBottom:'1rem'}}>
              <div className="sec-tag-line"/><span className="sec-tag-text">How it works</span><div className="sec-tag-line"/>
            </div>
            <h2 className="how-h2">Up and running <em>in minutes.</em></h2>
            <p className="how-sub">No developers. No technical knowledge. No learning curve. Just a system that works from day one.</p>
          </div>
          <div className="how-steps">
            {[
              {icon:<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>,n:'01',title:'Create your account',desc:'Sign up in minutes. No credit card required. Your access starts instantly.'},
              {icon:<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M3 10h18M8 2v4M16 2v4"/></svg>,n:'02',title:'Build your profile',desc:'Add your services, products, and formations. Your public booking page goes live the moment you finish.'},
              {icon:<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,n:'03',title:'Share your link',desc:'One link in your bio. Clients click, book, and pay. You show up and do the work you love.'},
            ].map((s,i)=>(
              <div key={i} className="how-step" data-rv data-delay={i*100}>
                <div className="how-step-n">{s.n}</div>
                <div className="how-icon">{s.icon}</div>
                <div className="how-title">{s.title}</div>
                <div className="how-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BETA — replaces fake testimonials */}
      <div className="beta-section">
        <div className="beta-inner">
          <div className="beta-top" data-rv>
            <div className="sec-tag" style={{justifyContent:'center',marginBottom:'1rem'}}>
              <div className="sec-tag-line"/><span className="sec-tag-text">Beta program</span><div className="sec-tag-line"/>
            </div>
            <h2 className="beta-h2">We're not going to fake it.<br/><em>Be the proof.</em></h2>
            <p className="beta-sub">
              No stock photo testimonials. No made-up numbers. We're building this in the open — with real professionals, real feedback, and real results. We have 15 beta spots. That's it.
            </p>
          </div>
          <div className="beta-cards">
            {[
              {icon:'🆓',title:'Completely free',text:'Beta access is free for the entire beta period. No credit card. No catch. In exchange, we ask for honest, structured feedback every two weeks.'},
              {icon:'🔒',title:'Lock in early pricing',text:'When paid plans launch, beta members get first access and a permanent discount. You helped build it — you should benefit from it.'},
              {icon:'📣',title:'Shape the product',text:'Your feedback directly changes what we build next. Bug reports, feature requests, friction points — all of it goes straight to the team.'},
            ].map((c,i)=>(
              <div key={i} className="beta-card" data-rv data-delay={i*100}>
                <div className="beta-card-icon">{c.icon}</div>
                <div className="beta-card-title">{c.title}</div>
                <div className="beta-card-text">{c.text}</div>
              </div>
            ))}
          </div>
          <div className="beta-cta-box" data-rv>
            <div className="beta-cta-glow"/>
            <div className="beta-cta-inner">
              <div className="beta-cta-eyebrow">Limited access</div>
              <div className="beta-spots">
                <div className="beta-spots-dot"/>
                <span className="beta-spots-text">15 beta spots · Applications open now</span>
              </div>
              <h3 className="beta-cta-h3">Be among the first.<br/><em>Not the last to know.</em></h3>
              <p className="beta-cta-p">We're looking for hairstylists, nail techs, massage therapists, and other service professionals who are serious about building something better.</p>
              <button className="btn-gold-lg" onClick={()=>navigate('/auth')} style={{fontSize:'1rem',padding:'1.1rem 2.75rem'}}>
                Apply for beta access
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PRICING */}
      <div className="pricing-section" id="pricing">
        <div className="pricing-inner">
          <div className="pricing-top" data-rv>
            <div className="sec-tag" style={{justifyContent:'center',marginBottom:'1rem'}}>
              <div className="sec-tag-line"/><span className="sec-tag-text">Pricing</span><div className="sec-tag-line"/>
            </div>
            <h2 className="pricing-h2">Two plans. <em>One decision.</em></h2>
            <p className="pricing-sub">Start with Essential. Upgrade to Pro when you're ready to sell more with AI.</p>
            <div style={{marginTop:'1.25rem',display:'flex',justifyContent:'center'}}>
              <div className="pricing-beta-banner">
                <div className="pricing-beta-dot"/>
                <span className="pricing-beta-text">Currently free during beta — paid plans coming soon</span>
              </div>
            </div>
          </div>
          <div className="plans">
            {plans.map((p,i)=>(
              <div key={i} className={`plan ${p.hot?'hot':''}`} data-rv data-delay={i*80}>
                {p.hot&&<div className="plan-pip">Most popular</div>}
                <div className="plan-tier">{p.tier}</div>
                <div className="plan-amt"><sup>$</sup>{p.amt}</div>
                <div className="plan-per">/month · after beta</div>
                <div className="plan-desc">{p.desc}</div>
                <div className="plan-line"/>
                <div className="plan-feats">
                  {p.feats.map((f,j)=>(
                    <div key={j} className={`plan-feat ${f.y?'yes':'no'}`}>
                      <span className={`feat-c ${f.y?'y':'n'}`}>{f.y?'✓':'×'}</span>{f.t}
                    </div>
                  ))}
                </div>
                <button className="plan-btn" onClick={()=>navigate('/auth')}>
                  {p.hot ? 'Join beta — it\'s free' : 'Start free'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="faq-section" id="faq">
        <div className="faq-inner">
          <div className="faq-top" data-rv>
            <div className="sec-tag" style={{justifyContent:'center',marginBottom:'1rem'}}>
              <div className="sec-tag-line"/><span className="sec-tag-text">Questions</span><div className="sec-tag-line"/>
            </div>
            <h2 className="faq-h2">The answers you're <em>looking for.</em></h2>
          </div>
          <div className="faq-list" data-rv>
            {faqs.map((f,i)=>(
              <div key={i} className={`faq-item ${openFaq===i?'open':''}`}>
                <div className="faq-q" onClick={()=>setOpenFaq(openFaq===i?null:i)}>
                  <span className="faq-q-text">{f.q}</span>
                  <div className="faq-icon">
                    <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </div>
                </div>
                <div className="faq-a">
                  <div className="faq-a-inner">{f.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FINAL CTA */}
      <div className="cta">
        <div className="cta-grain"/>
        <div className="cta-glow"/>
        <div className="cta-inner" data-rv>
          <div className="cta-eyebrow"><div className="cta-line"/><span className="cta-label">The decision</span><div className="cta-line"/></div>
          <h2 className="cta-h2">Your craft is <em>exceptional.</em><br/>Your system should be too.</h2>
          <p className="cta-sub">
            Stop running your business from a DM inbox. Fifteen beta spots. Free access. Honest feedback in return. That's the deal.
          </p>
          <div className="cta-actions">
            <button className="btn-gold-lg" onClick={()=>navigate('/auth')} style={{fontSize:'1rem',padding:'1.1rem 2.75rem'}}>Claim your beta spot — free</button>
            <button className="btn-ghost-lg" onClick={()=>document.getElementById('faq')?.scrollIntoView({behavior:'smooth'})}>Read the FAQ</button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="f-logo">Organized<span>.</span></div>
        <div className="f-links">
          {['Privacy','Terms','Contact','Instagram'].map(l=><span key={l} className="f-link">{l}</span>)}
        </div>
        <div className="f-copy">© 2026 Organized — beorganized.io</div>
      </footer>
    </div>
  )
}
