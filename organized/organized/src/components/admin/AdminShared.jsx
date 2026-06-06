import { useState } from 'react'

export const ADMIN_CSS = `
:root {
  --bg:#080808;--surface:#101010;--surface2:#161616;--border:#1e1e1e;--border2:#2a2a2a;
  --gold:#C9A84C;--gold-dim:#8a6e2f;--gold-glow:rgba(201,168,76,0.08);
  --white:#f5f5f5;--muted:#555;--muted2:#888;
  --green:#22c55e;--red:#ef4444;--blue:#3b82f6;--amber:#f59e0b;--purple:#a855f7;
}
*{margin:0;padding:0;box-sizing:border-box;}
body{background:var(--bg);color:var(--white);font-family:'DM Sans',sans-serif;font-size:13px;}
.x-wrap{display:flex;height:100vh;overflow:hidden;background:var(--bg);}

.x-sidebar{width:220px;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;flex-shrink:0;}
.x-sb-logo{padding:24px 20px 20px;border-bottom:1px solid var(--border);}
.x-sb-brand{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:500;color:var(--gold);}
.x-sb-label{font-family:'DM Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:0.15em;text-transform:uppercase;margin-top:2px;}
.x-sb-nav{flex:1;padding:12px 10px;display:flex;flex-direction:column;gap:2px;overflow-y:auto;}
.x-sb-nav::-webkit-scrollbar{width:0;}
.x-nav-grp{font-family:'DM Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:0.12em;text-transform:uppercase;padding:12px 10px 6px;}
.x-nav-item{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:6px;cursor:pointer;color:var(--muted2);transition:all 0.15s;font-size:12.5px;user-select:none;border:1px solid transparent;background:none;font-family:'DM Sans',sans-serif;width:100%;text-align:left;}
.x-nav-item:hover{background:var(--surface2);color:var(--white);}
.x-nav-item.active{background:var(--gold-glow);color:var(--gold);border-color:rgba(201,168,76,0.15);}
.x-nav-icon{width:15px;height:15px;opacity:0.7;flex-shrink:0;}
.x-nav-item.active .x-nav-icon{opacity:1;}
.x-nav-badge{margin-left:auto;font-size:9px;padding:1px 5px;border-radius:10px;font-family:'DM Mono',monospace;}
.x-nav-badge.red{background:var(--red);color:white;}
.x-nav-badge.gold{background:rgba(201,168,76,0.15);color:var(--gold);border:1px solid rgba(201,168,76,0.2);}
.x-nav-badge.green{background:rgba(34,197,94,0.15);color:var(--green);border:1px solid rgba(34,197,94,0.2);}
.x-sb-foot{padding:16px;border-top:1px solid var(--border);}
.x-admin-pill{display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--surface2);border-radius:8px;border:1px solid var(--border);}
.x-admin-av{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--gold-dim),var(--gold));display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:13px;color:var(--bg);font-weight:600;flex-shrink:0;}
.x-admin-name{font-size:11.5px;font-weight:500;color:var(--white);}
.x-admin-role{font-family:'DM Mono',monospace;font-size:9px;color:var(--gold);text-transform:uppercase;letter-spacing:0.08em;}

.x-main{flex:1;display:flex;flex-direction:column;overflow:hidden;}
.x-topbar{height:52px;border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 24px;gap:12px;flex-shrink:0;background:var(--surface);}
.x-page-title{font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:400;flex:1;color:var(--white);}
.x-live-dot{width:6px;height:6px;border-radius:50%;background:var(--green);box-shadow:0 0 6px var(--green);animation:x-pulse 2s infinite;flex-shrink:0;}
.x-live-lbl{font-family:'DM Mono',monospace;font-size:10px;color:var(--green);}
@keyframes x-pulse{0%,100%{opacity:1}50%{opacity:0.4}}
.x-topbar-date{font-family:'DM Mono',monospace;font-size:10px;color:var(--muted);}
.x-sep{width:1px;height:14px;background:var(--border);margin:0 4px;}
.x-topbar-r{display:flex;align-items:center;gap:8px;}
.x-topbar-btn{font-family:'DM Mono',monospace;font-size:9px;color:var(--muted);cursor:pointer;padding:4px 8px;border:none;background:transparent;transition:color 0.15s;letter-spacing:0.04em;text-transform:uppercase;}
.x-topbar-btn:hover{color:var(--white);}

.x-content{flex:1;overflow-y:auto;padding:24px;display:flex;flex-direction:column;gap:20px;}
.x-content::-webkit-scrollbar{width:4px;}
.x-content::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px;}

.x-g4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
.x-g2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.x-g32{display:grid;grid-template-columns:2fr 1fr;gap:12px;}
.x-g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;}

.x-card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:18px;}
.x-card.warn{border-color:rgba(245,158,11,0.25);}
.x-card.warn::before{content:'';display:block;height:1px;margin:-18px -18px 18px;background:linear-gradient(90deg,transparent,var(--amber),transparent);border-radius:10px 10px 0 0;}
.x-card.gold-top::before{content:'';display:block;height:1px;margin:-18px -18px 18px;background:linear-gradient(90deg,transparent,var(--gold),transparent);border-radius:10px 10px 0 0;}

.x-kpi{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:18px;position:relative;overflow:hidden;}
.x-kpi.gold{border-color:rgba(201,168,76,0.2);}
.x-kpi.gold::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent);}
.x-kpi-lbl{font-family:'DM Mono',monospace;font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;}
.x-kpi-val{font-family:'Cormorant Garamond',serif;font-size:32px;font-weight:500;line-height:1;margin-bottom:8px;color:var(--white);}
.x-kpi.gold .x-kpi-val{color:var(--gold);}
.x-kpi.clickable{cursor:pointer;transition:border-color 0.18s;}
.x-kpi.clickable:hover{border-color:rgba(201,168,76,0.35);}
.x-kpi.gold.clickable:hover{border-color:rgba(201,168,76,0.55);}
.x-kpi-arrow{position:absolute;bottom:14px;right:14px;font-size:12px;color:var(--muted);opacity:0;transition:opacity 0.15s;}
.x-kpi.clickable:hover .x-kpi-arrow{opacity:1;}
.x-kpi-ch{font-family:'DM Mono',monospace;font-size:10px;}
.x-kpi-ch.up{color:var(--green);}
.x-kpi-ch.nn{color:var(--muted);}
.x-kpi-ch.wn{color:var(--amber);}
.x-spark{display:flex;align-items:flex-end;gap:3px;height:32px;margin-top:8px;}
.x-sp{flex:1;border-radius:2px;background:var(--border2);}
.x-sp.g{background:var(--gold);opacity:0.7;}
.x-sp.g.last{opacity:1;}

.x-sec-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
.x-sec-title{font-family:'DM Mono',monospace;font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:0.12em;}

.x-btn-ghost{font-family:'DM Mono',monospace;font-size:9px;color:var(--gold);cursor:pointer;padding:4px 10px;border-radius:4px;border:1px solid rgba(201,168,76,0.2);background:var(--gold-glow);transition:all 0.15s;white-space:nowrap;}
.x-btn-ghost:hover{background:rgba(201,168,76,0.15);}
.x-btn-primary{font-family:'DM Mono',monospace;font-size:10px;color:var(--bg);cursor:pointer;padding:8px 16px;border-radius:6px;border:none;background:var(--gold);transition:all 0.15s;font-weight:500;}
.x-btn-primary:hover{background:#d4b35e;}
.x-btn-cancel{font-family:'DM Mono',monospace;font-size:10px;color:var(--muted2);cursor:pointer;padding:8px 16px;border-radius:6px;border:1px solid var(--border);background:transparent;transition:all 0.15s;}
.x-btn-cancel:hover{border-color:var(--border2);color:var(--white);}
.x-btn-danger{font-family:'DM Mono',monospace;font-size:9px;color:#fff;cursor:pointer;padding:5px 10px;border-radius:4px;border:1px solid rgba(239,68,68,0.4);background:rgba(239,68,68,0.12);transition:all 0.15s;white-space:nowrap;}
.x-btn-danger:hover{background:rgba(239,68,68,0.9);border-color:var(--red);}
.x-btn-action{font-family:'DM Mono',monospace;font-size:9px;color:var(--muted2);cursor:pointer;padding:5px 10px;border-radius:4px;border:1px solid var(--border2);background:transparent;transition:all 0.15s;white-space:nowrap;}
.x-btn-action:hover{color:var(--white);border-color:var(--border2);background:var(--surface2);}

.x-tbl{width:100%;border-collapse:collapse;}
.x-tbl th{font-family:'DM Mono',monospace;font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:0.1em;text-align:left;padding:0 0 12px;border-bottom:1px solid var(--border);}
.x-tbl td{padding:11px 0;border-bottom:1px solid var(--border);font-size:12px;vertical-align:middle;}
.x-tbl tr:last-child td{border-bottom:none;}
.x-tbl tr:hover td{background:rgba(255,255,255,0.01);}

.x-ws-row{display:flex;align-items:center;gap:9px;}
.x-ws-av{width:26px;height:26px;border-radius:6px;background:linear-gradient(135deg,#1e1e1e,#2a2a2a);display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0;border:1px solid var(--border2);}

.x-pill{display:inline-flex;padding:2px 8px;border-radius:20px;font-family:'DM Mono',monospace;font-size:9px;text-transform:uppercase;}
.x-pill.ess{background:rgba(255,255,255,0.05);color:var(--muted2);border:1px solid var(--border2);}
.x-pill.pro{background:rgba(201,168,76,0.1);color:var(--gold);border:1px solid rgba(201,168,76,0.2);}
.x-pill.act{background:rgba(34,197,94,0.1);color:var(--green);border:1px solid rgba(34,197,94,0.2);}
.x-pill.inn{background:rgba(255,255,255,0.05);color:var(--muted);border:1px solid var(--border2);}
.x-pill.inv{background:rgba(59,130,246,0.1);color:var(--blue);border:1px solid rgba(59,130,246,0.2);}
.x-pill.pnd{background:rgba(245,158,11,0.1);color:var(--amber);border:1px solid rgba(245,158,11,0.2);}
.x-pill.red{background:rgba(239,68,68,0.1);color:var(--red);border:1px solid rgba(239,68,68,0.2);}

.x-hrow{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border);}
.x-hrow:last-child{border-bottom:none;}
.x-hname{font-size:12px;color:var(--muted2);flex:1;}
.x-hst{font-family:'DM Mono',monospace;font-size:10px;display:flex;align-items:center;gap:6px;}
.x-hst.ok{color:var(--green);}
.x-hst.wn{color:var(--amber);}
.x-hst.err{color:var(--red);}
.x-hd{width:6px;height:6px;border-radius:50%;background:currentColor;flex-shrink:0;}
.x-hd.pulse{animation:x-pulse 2s infinite;}

.x-audit-filters{display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap;}
.x-af{font-family:'DM Mono',monospace;font-size:9px;padding:4px 12px;border-radius:20px;cursor:pointer;transition:all 0.15s;border:1px solid var(--border);background:none;color:var(--muted2);}
.x-af:hover{border-color:var(--border2);}
.x-af.ins{background:rgba(34,197,94,0.1);color:var(--green);border-color:rgba(34,197,94,0.2);}
.x-af.upd{background:rgba(245,158,11,0.1);color:var(--amber);border-color:rgba(245,158,11,0.2);}
.x-af.del{background:rgba(239,68,68,0.1);color:var(--red);border-color:rgba(239,68,68,0.2);}
.x-af.sel{border-color:var(--gold) !important;color:var(--gold) !important;background:var(--gold-glow) !important;}
.x-audit-row{display:flex;gap:10px;align-items:center;padding:9px 0;border-bottom:1px solid var(--border);transition:background 0.1s;cursor:pointer;}
.x-audit-row:last-child{border-bottom:none;}
.x-audit-row:hover{background:rgba(255,255,255,0.01);}
.x-at{font-family:'DM Mono',monospace;font-size:9px;color:var(--muted);width:72px;flex-shrink:0;}
.x-aop{font-family:'DM Mono',monospace;font-size:9px;padding:2px 7px;border-radius:4px;flex-shrink:0;width:58px;text-align:center;}
.x-aop.ins{background:rgba(34,197,94,0.1);color:var(--green);}
.x-aop.upd{background:rgba(245,158,11,0.1);color:var(--amber);}
.x-aop.del{background:rgba(239,68,68,0.1);color:var(--red);}
.x-am{font-size:11px;color:var(--muted2);flex:1;}
.x-aw{font-family:'DM Mono',monospace;font-size:9px;color:var(--muted);}

.x-brow{display:flex;align-items:center;gap:12px;padding:12px;background:var(--surface2);border-radius:8px;border:1px solid var(--border);cursor:pointer;transition:border-color 0.15s;}
.x-brow:hover{border-color:var(--border2);}
.x-bav{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#222,#333);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;}

.x-rev-bars{display:flex;align-items:flex-end;gap:8px;height:120px;margin-top:16px;}
.x-rev-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;height:100%;}
.x-rev-bar{width:100%;border-radius:4px 4px 0 0;background:var(--border2);position:relative;margin-top:auto;}
.x-rev-bar.gold{background:var(--gold);}
.x-rev-lbl{font-family:'DM Mono',monospace;font-size:9px;color:var(--muted);}

.x-theme-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px;}
.x-tc{border-radius:8px;overflow:hidden;cursor:pointer;border:2px solid transparent;transition:all 0.2s;position:relative;}
.x-tc:hover{border-color:var(--border2);transform:translateY(-1px);}
.x-tc.sel{border-color:var(--gold);}
.x-tc.sel::after{content:"✓";position:absolute;top:6px;right:6px;width:16px;height:16px;background:var(--gold);border-radius:50%;font-size:9px;color:var(--bg);font-weight:bold;line-height:16px;text-align:center;}
.x-tp{height:60px;position:relative;overflow:hidden;}
.x-ti{padding:8px 10px;background:var(--surface2);border-top:1px solid var(--border);}
.x-tn{font-size:11px;font-weight:500;color:var(--white);}
.x-td2{font-family:'DM Mono',monospace;font-size:9px;color:var(--muted);margin-top:2px;}
.x-mb2{height:6px;margin:10px 10px 6px;border-radius:3px;}
.x-mbl{display:flex;gap:5px;padding:0 10px;}
.x-mc{flex:1;height:24px;border-radius:3px;}
.x-pw{background:linear-gradient(135deg,#f5e6d0,#e8d5b5);}
.x-pw .x-mb2{background:#C9A84C;}.x-pw .x-mc{background:rgba(255,255,255,0.7);border:1px solid rgba(201,168,76,0.3);}
.x-pdk{background:linear-gradient(135deg,#080808,#101010);}
.x-pdk .x-mb2{background:#C9A84C;}.x-pdk .x-mc{background:#161616;border:1px solid #1e1e1e;}
.x-pcr{background:linear-gradient(135deg,#fafaf8,#f0ede8);}
.x-pcr .x-mb2{background:#1a1a1a;}.x-pcr .x-mc{background:rgba(0,0,0,0.05);border:1px solid rgba(0,0,0,0.1);}
.x-ppu{background:linear-gradient(135deg,#1a0a2e,#2d1b4e);}
.x-ppu .x-mb2{background:#a855f7;}.x-ppu .x-mc{background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.2);}
.x-psl{background:linear-gradient(135deg,#0f172a,#1e293b);}
.x-psl .x-mb2{background:#38bdf8;}.x-psl .x-mc{background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.15);}
.x-pfr{background:linear-gradient(135deg,#0a1a0f,#142b1a);}
.x-pfr .x-mb2{background:#4ade80;}.x-pfr .x-mc{background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.15);}

.x-sw-row{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;}
.x-sw{width:32px;height:32px;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:all 0.2s;}
.x-sw:hover{transform:scale(1.15);}
.x-sw.sel{border-color:var(--white);box-shadow:0 0 0 1px var(--border2);}

.x-trow{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);}
.x-trow:last-child{border-bottom:none;}
.x-tlbl{font-size:12px;color:var(--muted2);flex:1;}
.x-tsub{font-family:'DM Mono',monospace;font-size:9px;color:var(--muted);margin-top:2px;}
.x-tog{width:36px;height:20px;border-radius:10px;position:relative;cursor:pointer;flex-shrink:0;transition:background 0.2s;}
.x-tog.on{background:var(--gold);}
.x-tog.off{background:var(--border2);}
.x-tok{position:absolute;top:3px;width:14px;height:14px;border-radius:50%;background:white;transition:left 0.2s;}
.x-tog.on .x-tok{left:19px;}
.x-tog.off .x-tok{left:3px;}

.x-fopts{display:flex;flex-direction:column;gap:8px;margin-top:12px;}
.x-fopt{display:flex;align-items:center;gap:12px;padding:10px 12px;background:var(--surface2);border-radius:7px;border:1px solid var(--border);cursor:pointer;transition:all 0.15s;}
.x-fopt:hover{border-color:var(--border2);}
.x-fopt.sel{border-color:rgba(201,168,76,0.3);background:var(--gold-glow);}
.x-fsample{font-size:18px;flex:1;}
.x-fname{font-family:'DM Mono',monospace;font-size:9px;color:var(--muted);}

.x-team-row{display:flex;align-items:center;gap:12px;padding:12px;background:var(--surface2);border-radius:8px;border:1px solid var(--border);}
.x-team-av{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:15px;font-weight:600;color:var(--bg);flex-shrink:0;}

.x-modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);z-index:100;align-items:center;justify-content:center;}
.x-modal-overlay.open{display:flex;}
.x-modal{background:var(--surface);border:1px solid var(--border2);border-radius:12px;padding:28px;width:400px;max-width:90vw;}
.x-modal-title{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:500;margin-bottom:4px;color:var(--white);}
.x-modal-sub{font-family:'DM Mono',monospace;font-size:10px;color:var(--muted);margin-bottom:20px;}
.x-inp-label{font-family:'DM Mono',monospace;font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;display:block;}
.x-inp{width:100%;background:var(--surface2);border:1px solid var(--border2);border-radius:7px;padding:10px 12px;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--white);outline:none;margin-bottom:14px;}
.x-inp:focus{border-color:rgba(201,168,76,0.4);}
.x-role-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px;}
.x-role-opt{padding:10px 12px;border-radius:7px;border:1px solid var(--border);cursor:pointer;transition:all 0.15s;background:none;}
.x-role-opt:hover{border-color:var(--border2);}
.x-role-opt.sel{border-color:rgba(201,168,76,0.3);background:var(--gold-glow);}
.x-rn{font-size:12px;font-weight:500;margin-bottom:2px;color:var(--white);}
.x-rd{font-family:'DM Mono',monospace;font-size:9px;color:var(--muted);}
.x-modal-actions{display:flex;gap:10px;justify-content:flex-end;}

/* TOOLTIP */
[data-tooltip]{position:relative;}
[data-tooltip]::after{content:attr(data-tooltip);position:absolute;bottom:calc(100% + 7px);left:50%;transform:translateX(-50%);background:#181818;border:1px solid var(--border2);color:var(--muted2);padding:7px 10px;border-radius:6px;font-family:'DM Mono',monospace;font-size:9px;white-space:normal;width:210px;line-height:1.55;z-index:200;pointer-events:none;opacity:0;transition:opacity 0.15s;text-align:left;}
[data-tooltip]:hover::after{opacity:1;}

.x-toast{position:fixed;bottom:24px;right:24px;background:var(--surface);border:1px solid rgba(34,197,94,0.3);border-radius:8px;padding:12px 16px;font-family:'DM Mono',monospace;font-size:11px;color:var(--green);z-index:9999;transform:translateY(80px);opacity:0;transition:all 0.3s;pointer-events:none;max-width:320px;}
.x-toast.show{transform:translateY(0);opacity:1;}
.x-toast.err{border-color:rgba(239,68,68,0.3);color:var(--red);}

.x-spinner{width:20px;height:20px;border:2px solid rgba(201,168,76,0.15);border-top-color:var(--gold);border-radius:50%;animation:x-spin 0.7s linear infinite;}
@keyframes x-spin{to{transform:rotate(360deg);}}
.x-center-spinner{display:flex;align-items:center;justify-content:center;padding:60px;}

/* HAMBURGER — hidden on desktop, shown on mobile */
.x-hamburger{display:none;flex-direction:column;gap:4px;padding:6px;background:none;border:none;cursor:pointer;flex-shrink:0;}
.x-hamburger-bar{width:18px;height:2px;background:var(--white);border-radius:2px;display:block;}

/* OVERLAY — rendered conditionally via React, always full-screen when present */
.x-sb-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:999;}

@media(max-width:768px){
  /* Pull sidebar completely out of layout flow — it covers content as overlay */
  .x-sidebar{
    position:fixed;top:0;left:0;bottom:0;
    z-index:1000;width:280px;
    transform:translateX(-100%);
    transition:transform 0.28s cubic-bezier(.4,0,.2,1);
    box-shadow:8px 0 32px rgba(0,0,0,0.4);
  }
  .x-sidebar.mobile-open{transform:translateX(0);}
  /* Main fills full width since sidebar is no longer in the flex flow */
  .x-main{width:100%;}
  .x-hamburger{display:flex;}
  .x-topbar{padding:0 12px;}
  .x-content{padding:16px;}
  .x-g4{grid-template-columns:repeat(2,1fr);}
  .x-g2{grid-template-columns:1fr;}
  .x-g32{grid-template-columns:1fr;}
  .x-g3{grid-template-columns:1fr;}
  .x-topbar-date{display:none;}
  .x-sep{display:none;}
}
`

export function fmt(n) {
  return (n || 0).toLocaleString()
}

export function fmtMoney(cents) {
  const amt = (Number(cents) || 0) / 100
  return `$${amt.toFixed(2)}`
}

export function timeAgo(ts) {
  if (!ts) return '—'
  const diff = Date.now() - new Date(ts).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  return new Date(ts).toLocaleDateString('en', { month: 'short', year: '2-digit' })
}

export function fmtDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

export function fmtTime(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

export function Spinner() {
  return <div className="x-spinner" />
}

export function CenterSpinner() {
  return <div className="x-center-spinner"><Spinner /></div>
}

export function Toast({ msg, type = 'ok' }) {
  const icon = type === 'err' ? '✕' : '✓'
  return <div className={`x-toast${msg ? ' show' : ''}${type === 'err' ? ' err' : ''}`}>{msg ? `${icon}  ${msg}` : ''}</div>
}

export function useToast() {
  const [toast, setToast] = useState(null)
  function showToast(text, type = 'ok') {
    setToast({ text, type })
    setTimeout(() => setToast(null), 3000)
  }
  return { toastMsg: toast?.text || null, toastType: toast?.type || 'ok', showToast }
}

export function KpiCard({ label, value, change, changeType = 'nn', gold = false, spark, sparkAllGold = false, onClick }) {
  return (
    <div className={`x-kpi${gold ? ' gold' : ''}${onClick ? ' clickable' : ''}`} onClick={onClick} style={{ position: 'relative' }}>
      <div className="x-kpi-lbl">{label}</div>
      <div className="x-kpi-val">{value ?? '—'}</div>
      {change && <div className={`x-kpi-ch ${changeType}`}>{change}</div>}
      {spark && (
        <div className="x-spark">
          {spark.map((h, i) => {
            const isLast = i === spark.length - 1
            const isGold = sparkAllGold || isLast
            return <div key={i} className={`x-sp${isGold ? ' g' : ''}${isLast ? ' last' : ''}`} style={{ height: `${h}%` }} />
          })}
        </div>
      )}
      {onClick && <div className="x-kpi-arrow">→</div>}
    </div>
  )
}

export function InfoBanner({ id, text }) {
  const key = 'admin_dismissed_banners'
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key) || '[]').includes(id) } catch { return false }
  })
  function dismiss() {
    try {
      const list = JSON.parse(localStorage.getItem(key) || '[]')
      if (!list.includes(id)) list.push(id)
      localStorage.setItem(key, JSON.stringify(list))
    } catch {}
    setDismissed(true)
  }
  if (dismissed) return null
  return (
    <div style={{ background: 'rgba(201,168,76,0.05)', borderLeft: '3px solid #C9A84C', borderRadius: '0 6px 6px 0', padding: '10px 14px', marginBottom: 4, display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 11, color: '#888', lineHeight: 1.6 }}>
      <div style={{ flex: 1 }}>{text}</div>
      <button onClick={dismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: 14, padding: 0, flexShrink: 0, lineHeight: 1, marginTop: 1 }}>✕</button>
    </div>
  )
}

export function SecHd({ title, right }) {
  return (
    <div className="x-sec-hd">
      <div className="x-sec-title">{title}</div>
      {right}
    </div>
  )
}

export function Card({ children, warn, goldTop, style }) {
  let cls = 'x-card'
  if (warn) cls += ' warn'
  if (goldTop) cls += ' gold-top'
  return <div className={cls} style={style}>{children}</div>
}

export function Pill({ type = 'inn', children }) {
  return <span className={`x-pill ${type}`}>{children}</span>
}

export function StatusPill({ status }) {
  const map = {
    captured: ['act', 'Captured'], succeeded: ['act', 'Captured'],
    canceled: ['inn', 'Cancelled'], cancelled: ['inn', 'Cancelled'],
    pending: ['pnd', 'Pending'], refunded: ['red', 'Refunded'],
  }
  const [type, label] = map[status?.toLowerCase()] || ['inn', status || '—']
  return <Pill type={type}>{label}</Pill>
}

export function Toggle({ on, onChange }) {
  return (
    <div className={`x-tog ${on ? 'on' : 'off'}`} onClick={() => onChange(!on)}>
      <div className="x-tok" />
    </div>
  )
}
