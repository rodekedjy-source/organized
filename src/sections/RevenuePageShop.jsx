import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { formatCurrency } from '../lib/formatters'

const TABS = ['Day', 'Week', 'Month', 'Year']
const PAID = ['confirmed', 'shipped', 'delivered']

function startOf(tab) {
  const now = new Date()
  if (tab === 'Day')   { const d = new Date(now); d.setHours(0,0,0,0); return d }
  if (tab === 'Week')  { const d = new Date(now); d.setHours(0,0,0,0); d.setDate(d.getDate()-d.getDay()); return d }
  if (tab === 'Month') return new Date(now.getFullYear(), now.getMonth(), 1)
  return new Date(now.getFullYear(), 0, 1)
}
function startOfPrev(tab) {
  const now = new Date()
  if (tab === 'Day')   { const d = new Date(now); d.setHours(0,0,0,0); d.setDate(d.getDate()-1); return d }
  if (tab === 'Week')  { const d = new Date(now); d.setHours(0,0,0,0); d.setDate(d.getDate()-d.getDay()-7); return d }
  if (tab === 'Month') return new Date(now.getFullYear(), now.getMonth()-1, 1)
  return new Date(now.getFullYear()-1, 0, 1)
}
function pct(a, b) { if (!b) return null; return Math.round(((a-b)/b)*100) }

function getBars(orders, tab) {
  const now = new Date()
  if (tab === 'Week') {
    const sw = startOf('Week')
    return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((label, i) => {
      const d = new Date(sw); d.setDate(sw.getDate()+i)
      const ds = d.toISOString().split('T')[0]
      return { label, value: orders.filter(o => o.created_at?.startsWith(ds)).reduce((s,o)=>s+Number(o.total_amount||0),0) }
    })
  }
  if (tab === 'Month') {
    return ['W1','W2','W3','W4','W5'].map((label, i) => ({
      label,
      value: orders.filter(o => { const d=new Date(o.created_at).getDate(); return d>=i*7+1&&d<=(i+1)*7 })
                   .reduce((s,o)=>s+Number(o.total_amount||0),0),
    }))
  }
  if (tab === 'Year') {
    return ['J','F','M','A','M','J','J','A','S','O','N','D'].map((label, i) => ({
      label,
      value: orders.filter(o => { const d=new Date(o.created_at); return d.getFullYear()===now.getFullYear()&&d.getMonth()===i })
                   .reduce((s,o)=>s+Number(o.total_amount||0),0),
    }))
  }
  return [0,3,6,9,12,15,18,21].map(h => ({
    label: h===0?'12a':h<12?`${h}a`:h===12?'12p':`${h-12}p`,
    value: orders.filter(o => { const ah=new Date(o.created_at).getHours(); return ah>=h&&ah<h+3 })
                 .reduce((s,o)=>s+Number(o.total_amount||0),0),
  }))
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

export default function RevenuePageShop({ workspace }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('Month')
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (!workspace?.id) return
    setLoading(true)
    supabase.from('orders')
      .select('id,created_at,total_amount,product_name,customer_name,client_name,status')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setOrders(data||[]); setLoading(false) })
  }, [workspace?.id])

  const paid = orders.filter(o => PAID.includes(o.status))
  const periodStart = startOf(tab)
  const prevStart   = startOfPrev(tab)
  const filtered    = paid.filter(o => new Date(o.created_at) >= periodStart)
  const prevPeriod  = paid.filter(o => { const d=new Date(o.created_at); return d>=prevStart&&d<periodStart })
  const total       = filtered.reduce((s,o)=>s+Number(o.total_amount||0), 0)
  const prevTotal   = prevPeriod.reduce((s,o)=>s+Number(o.total_amount||0), 0)
  const delta       = pct(total, prevTotal)
  const bars        = getBars(filtered, tab)

  // Top product this period
  const prodMap = {}
  filtered.forEach(o => {
    const k = o.product_name || 'Unknown'
    if (!prodMap[k]) prodMap[k] = { rev:0, count:0 }
    prodMap[k].rev += Number(o.total_amount||0)
    prodMap[k].count++
  })
  const topProd = Object.entries(prodMap).sort((a,b)=>b[1].rev-a[1].rev)[0]

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Shop Revenue</div>
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
          <div style={{ fontSize:'.65rem', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:'.4rem' }}>TOTAL · {tab.toUpperCase()}</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'2rem', fontWeight:700, color:'var(--accent-gold)', marginBottom:'.1rem' }}>
            {hidden ? '$ ••••' : formatCurrency(total)}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'1rem' }}>
            <span style={{ fontSize:'.78rem', color:'var(--text-secondary)' }}>{filtered.length} order{filtered.length!==1?'s':''}</span>
            {delta !== null && (
              <span style={{ fontSize:'.75rem', fontWeight:600, color: delta>=0 ? 'var(--accent-gold)' : 'var(--text-secondary)' }}>
                {delta>=0?'↑':'↓'} {Math.abs(delta)}% vs prev {tab.toLowerCase()}
              </span>
            )}
          </div>
          <BarChart bars={bars} />
        </div>
      </div>

      {topProd && (
        <div className="card" style={{ marginBottom:'1rem' }}>
          <div className="card-head">
            <div>
              <div style={{ fontSize:'.65rem', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'.08em' }}>TOP PRODUCT</div>
              <div className="card-title">{topProd[0]}</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.1rem', color:'var(--accent-gold)' }}>{hidden?'••':formatCurrency(topProd[1].rev)}</div>
              <div style={{ fontSize:'.72rem', color:'var(--text-secondary)' }}>{topProd[1].count} sold</div>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom:'1rem' }}>
        <div className="card-head"><div className="card-title">Breakdown</div></div>
        {loading ? (
          <div style={{ padding:'2rem', color:'var(--text-secondary)', fontSize:'.85rem' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:'2rem 1.4rem', color:'var(--text-secondary)', fontSize:'.85rem', fontStyle:'italic' }}>No orders this {tab.toLowerCase()}.</div>
        ) : filtered.map(o => (
          <div key={o.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'.85rem 1.25rem', borderBottom:'1px solid var(--border)' }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:600, fontSize:'.88rem', color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{o.product_name||'—'}</div>
              <div style={{ fontSize:'.72rem', color:'var(--text-secondary)', marginTop:2 }}>
                {o.client_name||o.customer_name||'—'} · {new Date(o.created_at).toLocaleDateString('en-CA',{month:'short',day:'numeric'})}
              </div>
            </div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'.9rem', color:'var(--accent-gold)', flexShrink:0, marginLeft:'.75rem' }}>
              {hidden ? '••' : formatCurrency(o.total_amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
