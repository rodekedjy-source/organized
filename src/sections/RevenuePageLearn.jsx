import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { formatCurrency } from '../lib/formatters'

const TABS = ['Day', 'Week', 'Month', 'Year']
const TAB_LABELS = { Day: 'Last 7 Days', Week: 'Last 4 Weeks', Month: 'This Month', Year: 'This Year' }

function startOf(tab) {
  const now = new Date()
  if (tab === 'Day') {
    // Rolling last 7 days
    const d = new Date(now); d.setDate(d.getDate() - 6); d.setHours(0,0,0,0); return d
  }
  if (tab === 'Week') {
    // Rolling last 28 days (4 weeks)
    const d = new Date(now); d.setDate(d.getDate() - 7); d.setHours(0,0,0,0); return d
  }
  if (tab === 'Month') return new Date(now.getFullYear(), now.getMonth(), 1)
  return new Date(now.getFullYear(), 0, 1)
}
function startOfPrev(tab) {
  const now = new Date()
  if (tab === 'Day') {
    // Previous 7-day window (7–13 days ago)
    const d = new Date(now); d.setDate(d.getDate() - 13); d.setHours(0,0,0,0); return d
  }
  if (tab === 'Week') {
    // Previous 28-day window
    const d = new Date(now); d.setDate(d.getDate() - 55); d.setHours(0,0,0,0); return d
  }
  if (tab === 'Month') return new Date(now.getFullYear(), now.getMonth()-1, 1)
  return new Date(now.getFullYear()-1, 0, 1)
}
function pct(a, b) { if (!b) return null; return Math.round(((a-b)/b)*100) }

function getBars(list, tab) {
  const now = new Date()
  const sum = (arr) => arr.reduce((s,e) => s + Number(e.amount_paid||0), 0)
  if (tab === 'Day') {
    // 7 bars — one per day for the last 7 days
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now)
      d.setDate(d.getDate() - (6 - i))
      const ds = d.toISOString().split('T')[0]
      const label = d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)
      return { label, value: sum(list.filter(e => e.created_at?.startsWith(ds))) }
    })
  }
  if (tab === 'Week') {
    // 4 bars — one per week for the last 4 weeks
    return Array.from({ length: 4 }, (_, i) => {
      const wEnd = new Date(now); wEnd.setDate(wEnd.getDate() - (3 - i) * 7)
      const wStart = new Date(wEnd); wStart.setDate(wStart.getDate() - 6); wStart.setHours(0,0,0,0)
      wEnd.setHours(23,59,59,999)
      return {
        label: `W${i+1}`,
        value: sum(list.filter(e => { const d=new Date(e.created_at); return d>=wStart&&d<=wEnd }))
      }
    })
  }
  if (tab === 'Month') {
    return ['W1','W2','W3','W4','W5'].map((label, i) => ({
      label,
      value: sum(list.filter(e => { const d=new Date(e.created_at).getDate(); return d>=i*7+1&&d<=(i+1)*7 })),
    }))
  }
  if (tab === 'Year') {
    return ['J','F','M','A','M','J','J','A','S','O','N','D'].map((label, i) => ({
      label,
      value: sum(list.filter(e => { const d=new Date(e.created_at); return d.getFullYear()===now.getFullYear()&&d.getMonth()===i })),
    }))
  }
  return []
}

function BarChart({ bars }) {
  const max = Math.max(...bars.map(b=>b.value), 1)
  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-end', gap:4, height:64, marginBottom:4 }}>
        {bars.map((b,i) => (
          <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center' }}>
            <div style={{ width:'100%', borderRadius:3, background: b.value>0?'var(--accent-gold)':'var(--bg-pill)', height:`${Math.max((b.value/max)*56, b.value>0?4:2)}px`, transition:'height .25s' }}/>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:4 }}>
        {bars.map((b,i) => <div key={i} style={{ flex:1, textAlign:'center', fontSize:9, color:'var(--text-secondary)', overflow:'hidden' }}>{b.label}</div>)}
      </div>
    </div>
  )
}

export default function RevenuePageLearn({ workspace }) {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('Month')
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (!workspace?.id) return
    setLoading(true)
    supabase.from('enrollments')
      .select('id,created_at,amount_paid,offering_id,client_name,client_email,status,payment_status,offerings(title)')
      .eq('workspace_id', workspace.id)
      .eq('payment_status', 'paid')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setEnrollments(data||[]); setLoading(false) })
  }, [workspace?.id])

  const periodStart = startOf(tab)
  const prevStart   = startOfPrev(tab)
  const filtered    = enrollments.filter(e => new Date(e.created_at) >= periodStart)
  const prevPeriod  = enrollments.filter(e => { const d=new Date(e.created_at); return d>=prevStart&&d<periodStart })
  const total       = filtered.reduce((s,e) => s+Number(e.amount_paid||0), 0)
  const prevTotal   = prevPeriod.reduce((s,e) => s+Number(e.amount_paid||0), 0)
  const delta       = pct(total, prevTotal)
  const bars        = getBars(filtered, tab)

  const formMap = {}
  filtered.forEach(e => {
    const k = e.offerings?.title || e.offering_id || 'Unknown'
    if (!formMap[k]) formMap[k] = { rev:0, count:0 }
    formMap[k].rev += Number(e.amount_paid||0)
    formMap[k].count++
  })
  const topFormation = Object.entries(formMap).sort((a,b)=>b[1].rev-a[1].rev)[0]

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Learn Revenue</div>
          <div className="page-sub">{new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'})}</div>
        </div>
        <button onClick={()=>setHidden(h=>!h)} style={{ background:'var(--bg-pill)', border:'none', borderRadius:8, padding:'6px 12px', cursor:'pointer', fontSize:12, color:'var(--text-secondary)', fontFamily:'inherit', fontWeight:600 }}>
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
          <div style={{ fontSize:'.65rem', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:'.4rem' }}>TOTAL · {(TAB_LABELS[tab]||tab).toUpperCase()}</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'2rem', fontWeight:700, color:'var(--accent-gold)', marginBottom:'.1rem' }}>
            {hidden ? '$ ••••' : formatCurrency(total)}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'1rem' }}>
            <span style={{ fontSize:'.78rem', color:'var(--text-secondary)' }}>{filtered.length} enrollment{filtered.length!==1?'s':''}</span>
            {delta !== null && (
              <span style={{ fontSize:'.75rem', fontWeight:600, color: delta>=0?'var(--accent-gold)':'var(--text-secondary)' }}>
                {delta>=0?'↑':'↓'} {Math.abs(delta)}% vs prev {tab.toLowerCase()}
              </span>
            )}
          </div>
          <BarChart bars={bars} />
        </div>
      </div>

      {topFormation && (
        <div className="card" style={{ marginBottom:'1rem' }}>
          <div className="card-head">
            <div>
              <div style={{ fontSize:'.65rem', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'.08em' }}>TOP FORMATION</div>
              <div className="card-title">{topFormation[0]}</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.1rem', color:'var(--accent-gold)' }}>{hidden?'••':formatCurrency(topFormation[1].rev)}</div>
              <div style={{ fontSize:'.72rem', color:'var(--text-secondary)' }}>{topFormation[1].count} enrolled</div>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom:'1rem' }}>
        <div className="card-head"><div className="card-title">Breakdown</div></div>
        {loading ? (
          <div style={{ padding:'2rem', color:'var(--text-secondary)', fontSize:'.85rem' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:'2rem 1.4rem', color:'var(--text-secondary)', fontSize:'.85rem', fontStyle:'italic' }}>No paid enrollments in {(TAB_LABELS[tab]||tab).toLowerCase()}.</div>
        ) : filtered.map(e => (
          <div key={e.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'.85rem 1.25rem', borderBottom:'1px solid var(--border)' }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:600, fontSize:'.88rem', color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.offerings?.title||'Formation'}</div>
              <div style={{ fontSize:'.72rem', color:'var(--text-secondary)', marginTop:2 }}>
                {e.client_name||e.client_email||'—'} · {new Date(e.created_at).toLocaleDateString('en-CA',{month:'short',day:'numeric'})}
              </div>
            </div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'.9rem', color:'var(--accent-gold)', flexShrink:0, marginLeft:'.75rem' }}>
              {hidden ? '••' : formatCurrency(e.amount_paid)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
