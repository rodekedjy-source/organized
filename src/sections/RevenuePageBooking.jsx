import { useState } from 'react'
import { useWorkspaceContext } from '../contexts/WorkspaceContext'
import { useAppointments } from '../hooks/useAppointments'
import { formatCurrency } from '../lib/formatters'

const TABS = ['Day', 'Week', 'Month', 'Year']

function startOf(tab) {
  const now = new Date()
  if (tab === 'Day')   { const d = new Date(now); d.setHours(0,0,0,0); return d }
  if (tab === 'Week')  { const d = new Date(now); d.setHours(0,0,0,0); d.setDate(d.getDate()-d.getDay()); return d }
  if (tab === 'Month') return new Date(now.getFullYear(), now.getMonth(), 1)
  return new Date(now.getFullYear(), 0, 1)
}

function getBars(appts, tab) {
  const now = new Date()
  if (tab === 'Day') {
    const slots = [0,3,6,9,12,15,18,21]
    return slots.map(h => ({
      label: h===0?'12am':h<12?`${h}am`:h===12?'12pm':`${h-12}pm`,
      value: appts.filter(a => { const ah=new Date(a.scheduled_at).getHours(); return ah>=h&&ah<h+3 })
                  .reduce((s,a)=>s+Number(a.amount||0),0),
    }))
  }
  if (tab === 'Week') {
    const sw = startOf('Week')
    return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((label,i)=>{
      const d=new Date(sw); d.setDate(sw.getDate()+i)
      const ds=d.toISOString().split('T')[0]
      return { label, value: appts.filter(a=>a.scheduled_at?.startsWith(ds)).reduce((s,a)=>s+Number(a.amount||0),0) }
    })
  }
  if (tab === 'Month') {
    return ['W1','W2','W3','W4','W5'].map((label,i)=>({
      label,
      value: appts.filter(a=>{ const d=new Date(a.scheduled_at).getDate(); return d>=i*7+1&&d<=(i+1)*7 })
                  .reduce((s,a)=>s+Number(a.amount||0),0),
    }))
  }
  return ['J','F','M','A','M','J','J','A','S','O','N','D'].map((label,i)=>({
    label,
    value: appts.filter(a=>{ const d=new Date(a.scheduled_at); return d.getFullYear()===now.getFullYear()&&d.getMonth()===i })
                .reduce((s,a)=>s+Number(a.amount||0),0),
  }))
}

function BarChart({ bars }) {
  const max = Math.max(...bars.map(b=>b.value), 1)
  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-end', gap:4, height:64, marginBottom:4 }}>
        {bars.map((b,i) => (
          <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
            <div style={{
              width:'100%', borderRadius:3,
              background: b.value>0 ? 'var(--accent-gold)' : 'var(--bg-pill)',
              height: `${Math.max((b.value/max)*56, b.value>0?4:2)}px`,
              transition: 'height .25s',
            }}/>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:4 }}>
        {bars.map((b,i) => (
          <div key={i} style={{ flex:1, textAlign:'center', fontSize:9, color:'var(--text-secondary)', overflow:'hidden' }}>
            {b.label}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function RevenuePageBooking() {
  const { workspace } = useWorkspaceContext()
  const { data: appts, loading } = useAppointments(workspace?.id)
  const [tab, setTab] = useState('Month')
  const [hidden, setHidden] = useState(false)

  const confirmed = appts.filter(a => a.status === 'confirmed')
  const periodStart = startOf(tab)
  const filtered = confirmed.filter(a => new Date(a.scheduled_at) >= periodStart)
  const total = filtered.reduce((s,a)=>s+Number(a.amount||0), 0)
  const sorted = [...filtered].sort((a,b)=>new Date(b.scheduled_at)-new Date(a.scheduled_at))
  const bars = getBars(filtered, tab)

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Revenue</div>
          <div className="page-sub">Confirmed earnings</div>
        </div>
        <button onClick={()=>setHidden(h=>!h)} style={{
          background:'var(--bg-pill)', border:'none', borderRadius:8, padding:'6px 12px',
          cursor:'pointer', fontSize:12, color:'var(--text-secondary)', fontFamily:'inherit', fontWeight:600,
        }}>
          {hidden ? 'Show' : 'Hide'}
        </button>
      </div>

      <div style={{ display:'flex', gap:'.4rem', marginBottom:'1rem' }}>
        {TABS.map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{
            padding:'.35rem .9rem', borderRadius:99, border:'1.5px solid',
            borderColor: tab===t ? 'var(--accent-gold)' : 'var(--border)',
            background: tab===t ? 'rgba(201,168,76,.12)' : 'transparent',
            color: tab===t ? 'var(--accent-gold)' : 'var(--text-secondary)',
            fontSize:'.75rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit',
          }}>{t}</button>
        ))}
      </div>

      <div className="card" style={{ marginBottom:'1rem' }}>
        <div style={{ padding:'1.25rem 1.4rem' }}>
          <div style={{ fontSize:'.65rem', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:'.4rem' }}>
            TOTAL · {tab.toUpperCase()}
          </div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'2rem', fontWeight:700, color:'var(--accent-gold)', marginBottom:'.1rem' }}>
            {hidden ? '$ ••••' : formatCurrency(total)}
          </div>
          <div style={{ fontSize:'.78rem', color:'var(--text-secondary)', marginBottom:'1rem' }}>
            {sorted.length} appointment{sorted.length!==1?'s':''}
          </div>
          <BarChart bars={bars} />
        </div>
      </div>

      <div className="card" style={{ marginBottom:'1rem' }}>
        <div className="card-head">
          <div className="card-title">Breakdown</div>
        </div>
        {loading ? (
          <div style={{ padding:'2rem', color:'var(--text-secondary)', fontSize:'.85rem' }}>Loading…</div>
        ) : sorted.length === 0 ? (
          <div style={{ padding:'2rem 1.4rem', color:'var(--text-secondary)', fontSize:'.85rem', fontStyle:'italic' }}>
            No confirmed appointments this {tab.toLowerCase()}.
          </div>
        ) : sorted.map(a => (
          <div key={a.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'.85rem 1.25rem', borderBottom:'1px solid var(--border)' }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:600, fontSize:'.88rem', color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.client_name}</div>
              <div style={{ fontSize:'.72rem', color:'var(--text-secondary)', marginTop:2 }}>
                {a.services?.name||a.service_name||'—'} · {new Date(a.scheduled_at).toLocaleDateString('en-CA',{month:'short',day:'numeric'})}
              </div>
            </div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'.9rem', color:'var(--accent-gold)', flexShrink:0, marginLeft:'.75rem' }}>
              {hidden ? '••' : formatCurrency(a.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
