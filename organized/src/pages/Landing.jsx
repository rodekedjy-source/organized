import { useNavigate } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
function useReveal() {
useEffect(() => {
const els = document.querySelectorAll([data-rv])
const obs = new IntersectionObserver(entries => {
entries.forEach(e => {
if (!e.isIntersecting) return
const el = e.target
setTimeout(() => el.classList.add(‘in’), Number(el.dataset.delay || 0))
obs.unobserve(el)
})
}, { threshold: 0.1 })
els.forEach(el => obs.observe(el))
return () => obs.disconnect()
}, [])
}

const css = `
@import url(‘https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap’);

*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
html { scroll-behavior:smooth; -webkit-font-smoothing:antialiased; }
body { font-family:‘DM Sans’,sans-serif; background:#f8f6f2; color:#0f0e0c; overflow-x:hidden; }
:root {
–gold:#b5893a; –ink:#0f0e0c; –ink-2:#3d3b38; –ink-3:#8c8882;
–cream:#f8f6f2; –white:#fff; –border:#e8e4dc;
–ease-out: cubic-bezier(.16,1,.3,1);
}

/* REVEAL */
[data-rv] { opacity:0; transform:translateY(36px); transition:opacity .9s var(–ease-out),transform .9s var(–ease-out); }
[data-rv=left] { transform:translateX(-36px); }
[data-rv=right] { transform:translateX(36px); }
[data-rv=scale] { transform:scale(.94) translateY(16px); }
[data-rv=fade] { transform:none; }
[data-rv].in { opacity:1; transform:none; }

/* MICRO-TRANSITIONS — global button smoothness */
button, .btn-gold-lg, .btn-ghost-lg, .btn-white, .btn-ghost-white, .plan-btn, .nav-cta {
transition: background .18s var(–ease-out),
color .18s var(–ease-out),
border-color .18s var(–ease-out),
transform .18s var(–ease-out),
box-shadow .18s var(–ease-out),
opacity .18s var(–ease-out) !important;
-webkit-tap-highlight-color: transparent;
}
button:active { transform: scale(.97) !important; }

/* NAV */
.nav { position:fixed; top:0; left:0; right:0; z-index:200; display:flex; align-items:center; justify-content:space-between; padding:0 3rem; height:66px; transition:all .3s; }
.nav.scrolled { background:rgba(248,246,242,.95); backdrop-filter:blur(20px); border-bottom:1px solid var(–border); }
.nav-logo { font-family:‘Playfair Display’,serif; font-size:1.35rem; font-weight:500; color:#fff; cursor:pointer; letter-spacing:.01em; transition:color .3s; }
.nav.scrolled .nav-logo { color:var(–ink); }
.nav-logo span { color:var(–gold); }
.nav-links { display:flex; gap:2.5rem; }
.nav-link { font-size:.78rem; color:rgba(255,255,255,.55); cursor:pointer; transition:color .18s; letter-spacing:.02em; }
.nav.scrolled .nav-link { color:var(–ink-3); }
.nav-link:hover { color:#fff; }
.nav.scrolled .nav-link:hover { color:var(–ink); }
.nav-right { display:flex; align-items:center; gap:1.25rem; }
.nav-signin { font-size:.78rem; color:rgba(255,255,255,.5); cursor:pointer; transition:color .18s; }
.nav.scrolled .nav-signin { color:var(–ink-3); }
.nav-signin:hover { color:#fff; }
.nav.scrolled .nav-signin:hover { color:var(–ink); }
.nav-cta { background:var(–gold); color:#fff; border:none; border-radius:7px; padding:.52rem 1.35rem; font-size:.78rem; font-weight:500; cursor:pointer; font-family:inherit; }
.nav-cta:hover { background:#9e7630; transform:translateY(-1px) !important; box-shadow:0 6px 20px rgba(181,137,58,.3); }

/* HERO */
.hero { min-height:100vh; background:var(–ink); position:relative; overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:9rem 3rem 7rem; text-align:center; }
.hero-video { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:.08; filter:blur(1px) saturate(.8); pointer-events:none; }
.hero-overlay { position:absolute; inset:0; background:linear-gradient(to bottom, rgba(15,14,12,.5) 0%, rgba(15,14,12,.75) 50%, rgba(15,14,12,1) 100%); pointer-events:none; }
.hero-grain { position:absolute; inset:0; opacity:.035; background-image:url(“data:image/svg+xml,%3Csvg viewBox=‘0 0 256 256’ xmlns=‘http://www.w3.org/2000/svg’%3E%3Cfilter id=‘n’%3E%3CfeTurbulence type=‘fractalNoise’ baseFrequency=‘0.9’ numOctaves=‘4’ stitchTiles=‘stitch’/%3E%3C/filter%3E%3Crect width=‘100%25’ height=‘100%25’ filter=‘url(%23n)’/%3E%3C/svg%3E”); pointer-events:none; }
.hero-glow { position:absolute; top:-20%; left:50%; transform:translateX(-50%); width:900px; height:700px; background:radial-gradient(ellipse, rgba(181,137,58,.14) 0%, transparent 65%); pointer-events:none; }
.hero-inner { position:relative; z-index:1; max-width:860px; }
.hero-label { display:inline-flex; align-items:center; gap:.65rem; margin-bottom:2.25rem; animation:fadeUp .7s ease both; }
.hero-label-line { width:32px; height:1px; background:var(–gold); }
.hero-label-text { font-size:.68rem; letter-spacing:.16em; text-transform:uppercase; color:var(–gold); font-weight:500; }
.hero-h1 { font-family:‘Playfair Display’,serif; font-size:clamp(3.2rem,7vw,6.5rem); font-weight:700; color:#fff; line-height:1.02; letter-spacing:-.025em; margin-bottom:2rem; animation:fadeUp .8s .1s ease both; }
.hero-h1 em { font-style:italic; font-weight:400; color:var(–gold); }
.hero-divider { width:40px; height:1px; background:rgba(255,255,255,.2); margin:0 auto 2rem; animation:fadeUp .7s .2s ease both; }
.hero-sub { font-size:1.1rem; color:rgba(255,255,255,.45); line-height:1.85; font-weight:300; max-width:520px; margin:0 auto 3rem; animation:fadeUp .8s .25s ease both; }
.hero-sub strong { color:rgba(255,255,255,.75); font-weight:400; }
.hero-actions { display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; animation:fadeUp .8s .35s ease both; }
.btn-gold-lg { background:var(–gold); color:#fff; border:none; border-radius:8px; padding:1rem 2.5rem; font-size:.95rem; font-weight:500; cursor:pointer; font-family:inherit; letter-spacing:.01em; }
.btn-gold-lg:hover { background:#9e7630; transform:translateY(-2px) !important; box-shadow:0 16px 40px rgba(181,137,58,.35); }
.btn-ghost-lg { background:transparent; color:rgba(255,255,255,.5); border:1px solid rgba(255,255,255,.12); border-radius:8px; padding:1rem 2.5rem; font-size:.95rem; cursor:pointer; font-family:inherit; }
.btn-ghost-lg:hover { color:rgba(255,255,255,.8); border-color:rgba(255,255,255,.3); }
.hero-note { font-size:.7rem; color:rgba(255,255,255,.2); margin-top:1.5rem; animation:fadeUp .7s .45s ease both; letter-spacing:.03em; }
.scroll-hint { position:absolute; bottom:2.5rem; left:50%; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; gap:.5rem; z-index:1; animation:fadeUp 1s .8s ease both; }
.scroll-line { width:1px; height:40px; background:linear-gradient(to bottom, rgba(255,255,255,.3), transparent); animation:scrollDown 1.8s ease infinite; }
@keyframes scrollDown { 0%{transform:scaleY(0);transform-origin:top} 50%{transform:scaleY(1);transform-origin:top} 51%{transform-origin:bottom} 100%{transform:scaleY(0);transform-origin:bottom} }

/* SECTION LABEL */
.sec-tag { display:flex; align-items:center; gap:.6rem; margin-bottom:1.5rem; }
.sec-tag-line { width:28px; height:1px; background:var(–gold); }
.sec-tag-text { font-size:.68rem; letter-spacing:.14em; text-transform:uppercase; color:var(–gold); font-weight:500; }
.sec-tag.center { justify-content:center; }
.sec-tag.muted .sec-tag-line { background:rgba(181,137,58,.5); }
.sec-tag.muted .sec-tag-text { color:rgba(181,137,58,.6); }

/* MIRROR — DM CHAOS */
.mirror { background:var(–ink); padding:8rem 3rem; }
.mirror-inner { max-width:1100px; margin:0 auto; }
.mirror-top { text-align:center; margin-bottom:5rem; }
.mirror-h2 { font-family:‘Playfair Display’,serif; font-size:clamp(2.2rem,4vw,3.5rem); font-weight:700; color:#fff; line-height:1.1; margin-bottom:1rem; }
.mirror-h2 em { font-style:italic; font-weight:400; color:var(–gold); }
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
.dm-more::before { content:’’; display:block; width:16px; height:1px; background:rgba(255,255,255,.1); }

/* PHONE SECTION */
.phone-section { background:var(–cream); padding:8rem 3rem; }
.phone-inner { max-width:1100px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:6rem; align-items:center; }
.phone-h2 { font-family:‘Playfair Display’,serif; font-size:clamp(2.2rem,3.5vw,3.2rem); font-weight:700; color:var(–ink); line-height:1.1; margin-bottom:1rem; }
.phone-h2 em { font-style:italic; font-weight:400; color:var(–gold); }
.phone-desc { font-size:.95rem; color:var(–ink-3); line-height:1.85; font-weight:300; margin-bottom:2rem; }
.phone-points { display:flex; flex-direction:column; gap:.85rem; }
.phone-point { display:flex; align-items:flex-start; gap:.85rem; }
.phone-point-icon { width:32px; height:32px; border-radius:8px; background:rgba(181,137,58,.1); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:.75rem; color:var(–gold); margin-top:1px; }
.phone-point-title { font-size:.85rem; font-weight:500; color:var(–ink); margin-bottom:.15rem; }
.phone-point-desc { font-size:.78rem; color:var(–ink-3); font-weight:300; line-height:1.6; }
.phone-wrap { position:relative; display:flex; justify-content:center; }
.phone-glow-bg { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:350px; height:350px; background:radial-gradient(ellipse, rgba(181,137,58,.12), transparent 70%); filter:blur(40px); pointer-events:none; }
.iphone { width:260px; background:#111; border-radius:40px; box-shadow:0 60px 100px rgba(0,0,0,.2), 0 0 0 1px rgba(255,255,255,.07); overflow:hidden; position:relative; z-index:1; }
.iphone-notch { height:30px; background:#0a0a0a; display:flex; align-items:center; justify-content:center; }
.iphone-pill { width:70px; height:11px; background:#111; border-radius:10px; }
.iphone-body { background:#faf9f6; }
.ip-topbar { background:#111; padding:.65rem .85rem; display:flex; align-items:center; justify-content:space-between; }
.ip-name { font-family:‘Playfair Display’,serif; font-size:.75rem; color:#fff; font-weight:500; }
.ip-badge { font-size:.45rem; color:rgba(181,137,58,.6); letter-spacing:.06em; }
.ip-hero { background:linear-gradient(to bottom,#111,#0f0f0f); padding:1.25rem .85rem 1rem; text-align:center; }
.ip-av { width:48px; height:48px; border-radius:50%; background:#1c1c1c; border:1px solid rgba(181,137,58,.35); margin:0 auto .6rem; display:flex; align-items:center; justify-content:center; font-family:‘Playfair Display’,serif; font-size:1.05rem; color:var(–gold); }
.ip-title { font-family:‘Playfair Display’,serif; font-size:.9rem; color:#fff; }
.ip-sub { font-size:.52rem; color:rgba(255,255,255,.3); margin-top:.15rem; }
.ip-tabs { display:flex; background:#111; border-bottom:1px solid rgba(255,255,255,.06); }
.ip-tab { flex:1; padding:.48rem; font-size:.52rem; color:rgba(255,255,255,.25); text-align:center; letter-spacing:.03em; }
.ip-tab.on { color:var(–gold); border-bottom:1.5px solid var(–gold); }
.ip-scroll { padding:.65rem; }
.ip-stitle { font-size:.62rem; font-weight:500; color:var(–ink); margin-bottom:.5rem; font-family:‘Playfair Display’,serif; }
.ip-svc { display:flex; align-items:center; gap:.4rem; padding:.42rem .5rem; border:1px solid var(–border); border-radius:7px; margin-bottom:.3rem; background:#fff; }
.ip-bar { width:2px; height:22px; background:var(–gold); border-radius:1px; opacity:.45; flex-shrink:0; }
.ip-info { flex:1; }
.ip-sname { font-size:.58rem; color:var(–ink); font-weight:500; }
.ip-dur { font-size:.46rem; color:var(–ink-3); margin-top:.04rem; }
.ip-price { font-family:‘Playfair Display’,serif; font-size:.68rem; color:var(–ink); }
.ip-book { background:var(–ink); color:#fff; border:none; border-radius:4px; padding:.18rem .42rem; font-size:.46rem; font-weight:600; cursor:pointer; }
.ip-footer { background:#faf9f6; text-align:center; padding:.3rem; }
.ip-powered { font-size:.42rem; color:var(–gold); opacity:.45; }

/* BETA SECTION */
.beta-section { background:var(–white); padding:8rem 3rem; }
.beta-inner { max-width:1100px; margin:0 auto; }
.beta-top { text-align:center; margin-bottom:4rem; }
.beta-h2 { font-family:‘Playfair Display’,serif; font-size:clamp(2.2rem,3.5vw,3rem); font-weight:700; color:var(–ink); line-height:1.1; margin-bottom:1rem; }
.beta-h2 em { font-style:italic; font-weight:400; color:var(–gold); }
.beta-sub { font-size:.95rem; color:var(–ink-3); font-weight:300; line-height:1.8; max-width:520px; margin:0 auto 3rem; }
.beta-cards { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; margin-bottom:3.5rem; }
.beta-card { background:var(–cream); border:1px solid var(–border); border-radius:18px; padding:2.25rem; transition:all .3s var(–ease-out); }
.beta-card:hover { transform:translateY(-6px); box-shadow:0 24px 60px rgba(0,0,0,.07); border-color:rgba(181,137,58,.25); }
.beta-card-icon { font-size:1.5rem; margin-bottom:1rem; }
.beta-card-title { font-family:‘Playfair Display’,serif; font-size:1.05rem; color:var(–ink); margin-bottom:.5rem; font-weight:500; }
.beta-card-text { font-size:.82rem; color:var(–ink-3); line-height:1.7; font-weight:300; }
.beta-cta-box { background:var(–ink); border-radius:20px; padding:3rem; text-align:center; position:relative; overflow:hidden; }
.beta-cta-glow { position:absolute; top:-30%; left:50%; transform:translateX(-50%); width:600px; height:400px; background:radial-gradient(ellipse, rgba(181,137,58,.1) 0%, transparent 65%); pointer-events:none; }
.beta-cta-inner { position:relative; z-index:1; }
.beta-cta-eyebrow { font-size:.68rem; letter-spacing:.16em; text-transform:uppercase; color:rgba(181,137,58,.6); font-weight:500; margin-bottom:1rem; }
.beta-cta-h3 { font-family:‘Playfair Display’,serif; font-size:clamp(1.8rem,3vw,2.5rem); color:#fff; line-height:1.1; margin-bottom:.85rem; }
.beta-cta-h3 em { font-style:italic; color:var(–gold); font-weight:400; }
.beta-cta-p { font-size:.9rem; color:rgba(255,255,255,.35); font-weight:300; line-height:1.8; max-width:420px; margin:0 auto 2rem; }
.beta-spots { display:inline-flex; align-items:center; gap:.5rem; background:rgba(181,137,58,.1); border:1px solid rgba(181,137,58,.2); border-radius:100px; padding:.4rem 1.1rem; margin-bottom:1.75rem; }
.beta-spots-dot { width:6px; height:6px; border-radius:50%; background:var(–gold); animation:pulse 2s infinite; }
.beta-spots-text { font-size:.72rem; color:rgba(181,137,58,.8); letter-spacing:.04em; }

/* HOW */
.how-section { background:var(–cream); padding:8rem 3rem; }
.how-inner { max-width:1100px; margin:0 auto; }
.how-top { text-align:center; margin-bottom:5rem; }
.how-h2 { font-family:‘Playfair Display’,serif; font-size:clamp(2.2rem,3.5vw,3rem); font-weight:700; color:var(–ink); line-height:1.1; }
.how-h2 em { font-style:italic; font-weight:400; color:var(–gold); }
.how-sub { font-size:.9rem; color:var(–ink-3); font-weight:300; line-height:1.8; max-width:420px; margin:.85rem auto 0; }
.how-steps { display:grid; grid-template-columns:repeat(3,1fr); gap:2px; background:var(–border); border:1px solid var(–border); border-radius:18px; overflow:hidden; }
.how-step { background:var(–white); padding:3rem 2.5rem; }
.how-step-n { font-family:‘Playfair Display’,serif; font-size:3.5rem; font-weight:700; color:rgba(181,137,58,.15); line-height:1; margin-bottom:1.25rem; }
.how-icon { width:48px; height:48px; border-radius:12px; border:1px solid var(–border); display:flex; align-items:center; justify-content:center; margin-bottom:1.5rem; }
.how-icon svg { width:20px; height:20px; stroke:var(–gold); fill:none; stroke-width:1.5; }
.how-title { font-family:‘Playfair Display’,serif; font-size:1.2rem; color:var(–ink); margin-bottom:.6rem; font-weight:500; }
.how-desc { font-size:.82rem; color:var(–ink-3); line-height:1.7; font-weight:300; }

/* PRICING */
.pricing-section { background:var(–white); padding:8rem 3rem; }
.pricing-inner { max-width:1100px; margin:0 auto; }
.pricing-top { text-align:center; margin-bottom:4rem; }
.pricing-h2 { font-family:‘Playfair Display’,serif; font-size:clamp(2.2rem,3.5vw,3rem); font-weight:700; color:var(–ink); line-height:1.1; }
.pricing-h2 em { font-style:italic; font-weight:400; color:var(–gold); }
.pricing-sub { font-size:.88rem; color:var(–ink-3); font-weight:300; margin-top:.75rem; }
.pricing-beta-banner { display:inline-flex; align-items:center; gap:.6rem; background:rgba(181,137,58,.08); border:1px solid rgba(181,137,58,.2); border-radius:100px; padding:.5rem 1.25rem; margin-bottom:2rem; }
.pricing-beta-dot { width:6px; height:6px; border-radius:50%; background:var(–gold); animation:pulse 2s infinite; }
.pricing-beta-text { font-size:.75rem; color:var(–gold); font-weight:500; letter-spacing:.02em; }
.plans { display:grid; grid-template-columns:repeat(3,1fr); gap:1.25rem; align-items:start; }
.plan { background:var(–cream); border:1px solid var(–border); border-radius:18px; padding:2.5rem; position:relative; transition:all .3s; }
.plan:hover { transform:translateY(-4px); box-shadow:0 16px 48px rgba(0,0,0,.07); }
.plan.hot { background:var(–ink); border-color:transparent; transform:translateY(-8px); box-shadow:0 24px 60px rgba(0,0,0,.18); }
.plan.hot:hover { transform:translateY(-14px); }
.plan-pip { position:absolute; top:2.5rem; right:2.5rem; background:var(–gold); color:#fff; font-size:.6rem; font-weight:600; letter-spacing:.08em; text-transform:uppercase; padding:.25rem .75rem; border-radius:12px; }
.plan-tier { font-size:.65rem; letter-spacing:.14em; text-transform:uppercase; color:var(–ink-3); margin-bottom:.85rem; font-weight:500; }
.plan.hot .plan-tier { color:rgba(255,255,255,.3); }
.plan-amt { font-family:‘Playfair Display’,serif; font-size:3.5rem; font-weight:700; color:var(–ink); line-height:1; }
.plan.hot .plan-amt { color:#fff; }
.plan-amt sup { font-size:1.3rem; font-family:‘DM Sans’,sans-serif; font-weight:300; vertical-align:super; }
.plan-per { font-size:.8rem; color:var(–ink-3); font-weight:300; }
.plan.hot .plan-per { color:rgba(255,255,255,.25); }
.plan-desc { font-size:.78rem; color:var(–ink-3); font-weight:300; margin:.5rem 0 1.75rem; line-height:1.55; }
.plan.hot .plan-desc { color:rgba(255,255,255,.25); }
.plan-line { height:1px; background:var(–border); margin-bottom:1.5rem; }
.plan.hot .plan-line { background:rgba(255,255,255,.07); }
.plan-feats { display:flex; flex-direction:column; gap:.6rem; margin-bottom:2rem; }
.plan-feat { display:flex; align-items:flex-start; gap:.55rem; font-size:.8rem; font-weight:300; }
.plan-feat.yes { color:var(–ink-2); }
.plan.hot .plan-feat.yes { color:rgba(255,255,255,.55); }
.plan-feat.no { color:var(–ink-3); opacity:.35; }
.feat-c { font-size:.72rem; flex-shrink:0; margin-top:1px; }
.feat-c.y { color:var(–gold); }
.feat-c.n { color:var(–ink-3); }
.plan-btn { width:100%; padding:.85rem; border-radius:10px; font-size:.84rem; font-weight:500; cursor:pointer; font-family:inherit; border:1px solid var(–border); background:transparent; color:var(–ink); letter-spacing:.02em; }
.plan-btn:hover { background:var(–ink); color:#fff; border-color:var(–ink); transform:translateY(-1px) !important; }
.plan.hot .plan-btn { background:var(–gold); color:#fff; border-color:var(–gold); }
.plan.hot .plan-btn:hover { background:#9e7630; }

/* FAQ */
.faq-section { background:var(–cream); padding:8rem 3rem; }
.faq-inner { max-width:780px; margin:0 auto; }
.faq-top { text-align:center; margin-bottom:4rem; }
.faq-h2 { font-family:‘Playfair Display’,serif; font-size:clamp(2rem,3.5vw,2.75rem); font-weight:700; color:var(–ink); line-height:1.1; }
.faq-h2 em { font-style:italic; font-weight:400; color:var(–gold); }
.faq-list { display:flex; flex-direction:column; gap:0; border:1px solid var(–border); border-radius:18px; overflow:hidden; }
.faq-item { border-bottom:1px solid var(–border); background:var(–white); transition:background .2s; }
.faq-item:last-child { border-bottom:none; }
.faq-q { display:flex; align-items:center; justify-content:space-between; padding:1.5rem 2rem; cursor:pointer; gap:1rem; }
.faq-q-text { font-size:.92rem; font-weight:500; color:var(–ink); line-height:1.4; }
.faq-icon { width:22px; height:22px; border-radius:50%; border:1px solid var(–border); display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all .25s var(–ease-out); }
.faq-icon svg { width:10px; height:10px; stroke:var(–ink-3); stroke-width:2; fill:none; transition:transform .25s var(–ease-out); }
.faq-item.open .faq-icon { background:var(–gold); border-color:var(–gold); }
.faq-item.open .faq-icon svg { stroke:#fff; transform:rotate(45deg); }
.faq-a { max-height:0; overflow:hidden; transition:max-height .4s var(–ease-out), padding .3s; }
.faq-item.open .faq-a { max-height:200px; }
.faq-a-inner { padding:0 2rem 1.5rem; font-size:.88rem; color:var(–ink-3); line-height:1.85; font-weight:300; }
.faq-a-inner strong { color:var(–ink-2); font-weight:400; }

/* FINAL CTA */
.cta { background:var(–ink); padding:10rem 3rem; text-align:center; position:relative; overflow:hidden; }
.cta-grain { position:absolute; inset:0; opacity:.03; background-image:url(“data:image/svg+xml,%3Csvg viewBox=‘0 0 256 256’ xmlns=‘http://www.w3.org/2000/svg’%3E%3Cfilter id=‘n’%3E%3CfeTurbulence type=‘fractalNoise’ baseFrequency=‘0.9’ numOctaves=‘4’ stitchTiles=‘stitch’/%3E%3C/filter%3E%3Crect width=‘100%25’ height=‘100%25’ filter=‘url(%23n)’/%3E%3C/svg%3E”); pointer-events:none; }
.cta-glow { position:absolute; top:-30%; left:50%; transform:translateX(-50%); width:900px; height:700px; background:radial-gradient(ellipse, rgba(181,137,58,.13) 0%, transparent 65%); pointer-events:none; }
.cta-inner { position:relative; z-index:1; max-width:700px; margin:0 auto; }
.cta-eyebrow { display:flex; align-items:center; gap:.65rem; justify-content:center; margin-bottom:1.5rem; }
.cta-line { width:28px; height:1px; background:rgba(181,137,58,.5); }
.cta-label { font-size:.68rem; letter-spacing:.14em; text-transform:uppercase; color:rgba(181,137,58,.7); font-weight:500; }
.cta-h2 { font-family:‘Playfair Display’,serif; font-size:clamp(2.5rem,5vw,4.5rem); font-weight:700; color:#fff; line-height:1.06; margin-bottom:1.25rem; }
.cta-h2 em { font-style:italic; font-weight:400; color:var(–gold); }
.cta-sub { font-size:.95rem; color:rgba(255,255,255,.35); font-weight:300; line-height:1.85; margin-bottom:3rem; }
.cta-actions { display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; }
.btn-white { background:#fff; color:var(–gold); border:none; border-radius:8px; padding:1rem 2.5rem; font-size:.92rem; font-weight:500; cursor:pointer; font-family:inherit; }
.btn-white:hover { background:rgba(255,255,255,.92); transform:translateY(-2px) !important; box-shadow:0 12px 32px rgba(0,0,0,.15); }
.btn-ghost-white { background:transparent; color:rgba(255,255,255,.5); border:1px solid rgba(255,255,255,.15); border-radius:8px; padding:1rem 2.5rem; font-size:.92rem; cursor:pointer; font-family:inherit; }
.btn-ghost-white:hover { color:rgba(255,255,255,.8); border-color:rgba(255,255,255,.3); }

/* FOOTER */
footer { background:#090907; padding:3rem; border-top:1px solid rgba(255,255,255,.04); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; }
.f-logo { font-family:‘Playfair Display’,serif; font-size:1.15rem; color:rgba(255,255,255,.25); }
.f-logo span { color:var(–gold); }
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
`

const plans = [
{ tier:‘Starter’, amt:19, desc:‘For solo professionals getting organized.’, hot:false,
feats:[{y:true,t:‘Public profile & booking page’},{y:true,t:‘Up to 5 services’},{y:true,t:‘Client management’},{y:true,t:‘Appointment dashboard’},{y:false,t:‘Product shop’},{y:false,t:‘Formations & courses’},{y:false,t:‘Revenue analytics’}]},
{ tier:‘Pro’, amt:39, desc:‘For professionals building their brand.’, hot:true,
feats:[{y:true,t:‘Everything in Starter’},{y:true,t:‘Unlimited services’},{y:true,t:‘Product shop’},{y:true,t:‘Formations & courses’},{y:true,t:‘Revenue analytics’},{y:true,t:‘Automated reminders’},{y:true,t:‘Priority support’}]},
{ tier:‘Studio’, amt:69, desc:‘For teams and multi-staff businesses.’, hot:false,
feats:[{y:true,t:‘Everything in Pro’},{y:true,t:‘Up to 5 staff members’},{y:true,t:‘Custom domain’},{y:true,t:‘White-label branding’},{y:true,t:‘Priority support’},{y:true,t:‘Monthly strategy call’}]},
]

const faqs = [
{ q:‘Does my client need to download an app or create an account?’,
a:‘No. They tap your link, pick a service, choose a time, and confirm. No app. No account. No friction. The average booking takes under 2 minutes.’ },
{ q:‘What happens after the free beta period?’,
a:‘When we launch paid plans, beta members will be the first to know — and the last to pay. We'll give you an extended free window before anything changes, and you'll lock in early pricing.’ },
{ q:‘Can I keep my current booking system while I try this?’,
a:‘Yes. We're not asking you to burn anything down. Use both, compare, and decide. Most people stop using their old system within the first week.’ },
{ q:‘Is my data safe?’,
a:‘Built on Supabase with enterprise-grade security. Row-level security on every table. Your data belongs to you — not us, not advertisers, not anyone else.’ },
{ q:‘Do I need technical knowledge to set this up?’,
a:‘If you can post on Instagram, you can use Organized. Setup takes under 10 minutes. We'll walk you through every step.’ },
{ q:‘What if I want to cancel?’,
a:‘No questions, no retention emails, no dark patterns. Cancel anytime from your dashboard in one click. Your data can be exported before you go.’ },
]

export default function Landing() {
const navigate = useNavigate()
const [scrolled, setScrolled] = useState(false)
const [openFaq, setOpenFaq] = useState(null)
useReveal()

useEffect(() => {
const handler = () => setScrolled(window.scrollY > 60)
window.addEventListener(‘scroll’, handler)
return () => window.removeEventListener(‘scroll’, handler)
}, [])

return (
<div>
<style>{css}</style>

```
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
        your talent is <em>undeniable.</em><br/>
        your booking system<br/>
        shouldn't be <em>invisible.</em>
      </h1>
      <div className="hero-divider"/>
      <p className="hero-sub">
        One link in your bio. Clients book, shop, and pay —{' '}
        <strong>without a single DM.</strong>{' '}
        You show up, do the work you love, and wake up to confirmed appointments.
      </p>
      <div className="hero-actions">
        <button className="btn-gold-lg" onClick={()=>navigate('/auth')}>Start free — no card needed</button>
        <button className="btn-ghost-lg" onClick={()=>document.getElementById('how')?.scrollIntoView({behavior:'smooth'})}>See how it works</button>
      </div>
      <p className="hero-note">Free during beta · No credit card · Setup in under 10 minutes</p>
    </div>
    <div className="scroll-hint"><div className="scroll-line"/></div>
  </section>

  {/* MIRROR — THE PROBLEM */}
  <div className="mirror">
    <div className="mirror-inner">
      <div className="mirror-top" data-rv>
        <div className="sec-tag center muted" style={{justifyContent:'center',marginBottom:'1.25rem'}}>
          <div className="sec-tag-line"/>
          <span className="sec-tag-text">Sound familiar?</span>
          <div className="sec-tag-line"/>
        </div>
        <h2 className="mirror-h2">This is <em>not</em> how your business<br/>should feel.</h2>
        <p className="mirror-sub">Every day, talented professionals are losing time, money, and clients — managed entirely through a social media inbox.</p>
      </div>
      <div className="dm-row">
        {[
          {handle:'kezia_beauty', msgs:[{t:'Hey do you do knotless? How much?',in:true},{t:'Yes! Starting at $200 — depends on length',in:false},{t:'Can I come Saturday? Any time that works?',in:true}],more:'4 more unanswered messages'},
          {handle:'nadia.naturals', msgs:[{t:'What hair products do you sell?',in:true},{t:'I sell my own line! Serum $28, ships Canada-wide',in:false},{t:'How do I order? E-transfer or card?',in:true}],more:'6 more unanswered messages'},
          {handle:'tasha__r', msgs:[{t:'I want a silk press next week!',in:true},{t:'I have Wed or Thurs open — which works?',in:false},{t:'Either honestly, whatever you have available 🙏',in:true}],more:'2 more unanswered messages'},
        ].map((dm,i)=>(
          <div key={i} className="dm-col" data-rv data-delay={i*100}>
            <div className="dm-col-header"><div className="dm-live"/><span className="dm-handle">@{dm.handle}</span></div>
            {dm.msgs.map((m,j)=>(
              <div key={j}>
                <div className={m.in?'dm-msg-out':'dm-msg-in'}>{m.t}</div>
                <div className="dm-ts" style={{textAlign:m.in?'left':'right'}}>{j===0?'2 days ago · unread':j===1?'Seen':'Just now'}</div>
              </div>
            ))}
            <div className="dm-more">{dm.more}</div>
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* LILAS — BEFORE & AFTER */}
  <div style={{background:'var(--ink)',padding:'8rem 3rem'}}>
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
              {icon:'✓',bg:'rgba(34,197,94,.1)',title:'Kezia B. booked Box Braids',sub:'Sat 10:00am · $180 · Auto-confirmed',time:'7:12'},
              {icon:'✓',bg:'rgba(34,197,94,.1)',title:'Amara D. booked Silk Press',sub:'Sat 1:00pm · $95 · Auto-confirmed',time:'7:48'},
              {icon:'🛍',bg:'rgba(181,137,58,.1)',title:'Nadia ordered Moisture Serum',sub:'× 2 units · $56 received',time:'8:15'},
              {icon:'✓',bg:'rgba(34,197,94,.1)',title:'Zoe M. booked Loc Retwist',sub:'Sun 11:00am · $120 · Auto-confirmed',time:'9:02'},
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

      <div data-rv style={{textAlign:'center',marginTop:'4rem',padding:'2.5rem',background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',borderRadius:'16px',maxWidth:'620px',margin:'4rem auto 0'}}>
        <p style={{fontSize:'1rem',fontFamily:'Playfair Display,serif',fontStyle:'italic',color:'rgba(255,255,255,.5)',marginBottom:'.75rem',lineHeight:1.5}}>
          "This is the week thousands of service professionals are living right now. We built Organized to end it."
        </p>
        <div style={{fontSize:'.75rem',color:'rgba(255,255,255,.2)',letterSpacing:'.04em'}}>— The Organized. team</div>
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

  {/* DASHBOARD DEMO */}
  <div style={{background:'var(--cream)',padding:'8rem 3rem'}}>
    <div style={{maxWidth:'1100px',margin:'0 auto'}}>
      <div data-rv style={{textAlign:'center',marginBottom:'4rem'}}>
        <div className="sec-tag" style={{justifyContent:'center',marginBottom:'1rem'}}>
          <div className="sec-tag-line"/><span className="sec-tag-text">Your dashboard</span><div className="sec-tag-line"/>
        </div>
        <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(2.2rem,3.5vw,3rem)',fontWeight:700,color:'var(--ink)',lineHeight:1.1}}>
          Everything at a glance. <em style={{fontStyle:'italic',fontWeight:400,color:'var(--gold)'}}>Nothing missed.</em>
        </h2>
        <p style={{fontSize:'.9rem',color:'var(--ink-3)',fontWeight:300,lineHeight:1.8,maxWidth:'440px',margin:'.85rem auto 0'}}>Your business, live and in real time. Every booking, every sale, every client — organized the moment it happens.</p>
      </div>
      <div data-rv="scale" style={{background:'#1a1815',border:'1px solid rgba(255,255,255,.08)',borderRadius:'16px',overflow:'hidden',boxShadow:'0 48px 100px rgba(0,0,0,.25)'}}>
        <div style={{background:'#111',height:'38px',display:'flex',alignItems:'center',padding:'0 1rem',gap:'.4rem',borderBottom:'1px solid rgba(255,255,255,.06)'}}>
          {['#ff5f57','#febc2e','#28c840'].map((c,i)=><div key={i} style={{width:9,height:9,borderRadius:'50%',background:c}}/>)}
          <div style={{flex:1,background:'rgba(255,255,255,.05)',borderRadius:'4px',height:'20px',margin:'0 .75rem',display:'flex',alignItems:'center',padding:'0 .6rem'}}>
            <span style={{fontSize:'.58rem',color:'rgba(255,255,255,.2)',fontFamily:'monospace'}}>organized-two.vercel.app/dashboard</span>
          </div>
        </div>
        <div style={{display:'flex',height:'320px'}}>
          <div style={{width:'150px',background:'#111',borderRight:'1px solid rgba(255,255,255,.05)',padding:'.85rem 0',flexShrink:0}}>
            <div style={{padding:'.4rem .85rem',marginBottom:'.25rem'}}>
              <div style={{fontSize:'.52rem',color:'rgba(255,255,255,.2)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:'.5rem'}}>Workspace</div>
              {['Overview','Services','Appointments','Products','Formations','Clients'].map((item,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:'.4rem',padding:'.38rem .5rem',borderRadius:'5px',marginBottom:'.15rem',background:i===0?'rgba(181,137,58,.08)':'transparent',borderLeft:i===0?'2px solid var(--gold)':'2px solid transparent',fontSize:'.58rem',color:i===0?'var(--gold)':'rgba(255,255,255,.28)'}}>
                  <div style={{width:4,height:4,borderRadius:'50%',background:'currentColor',opacity:.6,flexShrink:0}}/>
                  {item}
                  {item==='Appointments'&&<span style={{marginLeft:'auto',background:'rgba(181,137,58,.2)',color:'var(--gold)',fontSize:'.45rem',padding:'1px 4px',borderRadius:'6px'}}>3</span>}
                </div>
              ))}
            </div>
          </div>
          <div style={{flex:1,padding:'1.1rem',display:'flex',flexDirection:'column',gap:'.75rem',overflow:'hidden'}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'.5rem'}}>
              {[['TOTAL REVENUE','$3,240','↑ 18%'],['APPOINTMENTS','28','5 pending'],['PRODUCTS SOLD','31','7 this week'],['STUDENTS','74','12 new']].map(([l,v,d],i)=>(
                <div key={i} style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.06)',borderRadius:'8px',padding:'.6rem .75rem'}}>
                  <div style={{fontSize:'.44rem',color:'rgba(255,255,255,.25)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'.25rem'}}>{l}</div>
                  <div style={{fontFamily:'Playfair Display,serif',fontSize:'1rem',color:'#fff',marginBottom:'.15rem'}}>{v}</div>
                  <div style={{fontSize:'.44rem',color:i===1?'#fbbf24':'#4ade80'}}>{d}</div>
                </div>
              ))}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr',gap:'.5rem',flex:1}}>
              <div style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',borderRadius:'8px',overflow:'hidden'}}>
                <div style={{padding:'.5rem .75rem',borderBottom:'1px solid rgba(255,255,255,.05)',fontSize:'.52rem',fontWeight:600,color:'rgba(255,255,255,.4)'}}>Today's schedule</div>
                {[['Amara D.','Box Braids','10:00','$180','confirmed'],['Zoe M.','Silk Press','13:00','$95','confirmed'],['Kezia B.','Color & Cut','15:30','$220','pending'],['Nadia L.','Loc Retwist','17:00','$120','confirmed']].map(([c,s,t,a,st],i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:'.4rem',padding:'.38rem .75rem',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
                    <span style={{fontSize:'.5rem',color:'rgba(255,255,255,.6)',fontWeight:500,flex:1}}>{c}</span>
                    <span style={{fontSize:'.48rem',color:'rgba(255,255,255,.3)',flex:1}}>{s}</span>
                    <span style={{fontSize:'.48rem',color:'rgba(255,255,255,.3)',width:30}}>{t}</span>
                    <span style={{fontSize:'.5rem',color:'var(--gold)',fontWeight:600,width:28}}>{a}</span>
                    <span style={{fontSize:'.44rem',padding:'1px 5px',borderRadius:'8px',background:st==='confirmed'?'rgba(46,125,82,.2)':'rgba(202,138,4,.15)',color:st==='confirmed'?'#4ade80':'#fbbf24'}}>{st}</span>
                  </div>
                ))}
              </div>
              <div style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',borderRadius:'8px',padding:'.6rem .75rem'}}>
                <div style={{fontSize:'.52rem',fontWeight:600,color:'rgba(255,255,255,.4)',marginBottom:'.5rem'}}>Revenue — this week</div>
                <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.25rem',color:'#fff',marginBottom:'.15rem'}}>$3,620</div>
                <div style={{fontSize:'.44rem',color:'#4ade80',marginBottom:'.75rem'}}>↑ 23% vs last week</div>
                <div style={{display:'flex',alignItems:'flex-end',gap:'3px',height:'60px'}}>
                  {[320,480,210,560,740,890,420].map((v,i)=>(
                    <div key={i} style={{flex:1,borderRadius:'2px 2px 0 0',background:v===890?'var(--gold)':'rgba(181,137,58,.25)',height:`${(v/950)*100}%`}}/>
                  ))}
                </div>
                <div style={{display:'flex',gap:'3px',marginTop:'.3rem'}}>
                  {['S','M','T','W','T','F','S'].map(d=><div key={d} style={{flex:1,fontSize:'.42rem',color:'rgba(255,255,255,.2)',textAlign:'center'}}>{d}</div>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* BOOKING FLOW */}
  <div style={{background:'var(--white)',padding:'8rem 3rem'}}>
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
          {step:'04',title:'Confirmed instantly',desc:'She gets a confirmation. You get notified.',dark:false,screen:(
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
        <h2 className="pricing-h2">Simple pricing. <em>No surprises.</em></h2>
        <p className="pricing-sub">Launching after beta. Beta members lock in early pricing — permanently.</p>
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
```

)
}