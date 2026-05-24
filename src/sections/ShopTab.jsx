import { useState, useEffect } from 'react'
import { supabase }       from '../lib/supabase'
import OverviewSection    from './OverviewSection'
import ProductsSection    from './ProductsSection'
import OrdersSection      from './OrdersSection'
import ReviewsSection     from './ReviewsSection'
import PolicySection      from './PolicySection'
import BackBar            from './BackBar'

export default function ShopTab(props) {
  const [subPage, setSubPage]           = useState(null)
  const [productCount, setProductCount] = useState(null)
  const [orderCount, setOrderCount]     = useState(null)
  const { workspace, toast, refetch } = props
  const back = () => setSubPage(null)

  useEffect(() => {
    if (!workspace?.id) return
    Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('workspace_id', workspace.id),
      supabase.from('orders').select('id',   { count: 'exact', head: true }).eq('workspace_id', workspace.id),
    ]).then(([p, o]) => {
      setProductCount(p.count ?? 0)
      setOrderCount(o.count ?? 0)
    })
  }, [workspace?.id])

  if (subPage === 'products') return <><BackBar onBack={back} title="Products" /><ProductsSection {...props} /></>
  if (subPage === 'orders')   return <><BackBar onBack={back} title="Orders"   /><OrdersSection   workspace={workspace} toast={toast} /></>
  if (subPage === 'reviews')  return <><BackBar onBack={back} title="Reviews"  /><ReviewsSection  {...props} type="shop" /></>
  if (subPage === 'policy')   return (
    <>
      <BackBar onBack={back} title="Policy" />
      <PolicySection workspace={workspace} toast={toast} refetch={refetch} type="shop" />
    </>
  )

  const navCard = (label, page) => (
    <div key={page} className="card" style={{marginBottom:'1.25rem',cursor:'pointer'}} onClick={()=>setSubPage(page)}>
      <div className="card-head">
        <div style={{fontSize:'.65rem',fontWeight:700,color:'var(--ink-3)',textTransform:'uppercase',letterSpacing:'.08em'}}>{label}</div>
        <div className="stat-arrow">&#8594;</div>
      </div>
    </div>
  )

  return (
    <>
      <OverviewSection {...props} activeTab="shop" onNavigate={(page) => setSubPage(page)} />
      {navCard(productCount != null ? `PRODUCTS — ${productCount} listed` : 'PRODUCTS', 'products')}
      {navCard(orderCount  != null ? `ORDERS — ${orderCount} total`       : 'ORDERS',   'orders')}
      {navCard('REVIEWS', 'reviews')}
      {navCard('POLICY',  'policy')}
    </>
  )
}
