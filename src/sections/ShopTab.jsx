import { useState } from 'react'
import OverviewSection      from './OverviewSection'
import ProductsSection      from './ProductsSection'
import ReviewsSection       from './ReviewsSection'
import PolicySection        from './PolicySection'
import RevenuePageShop      from './RevenuePageShop'
import OrderHistorySection  from './OrderHistorySection'
import ShippingSection      from './ShippingSection'
import BackBar              from './BackBar'

export default function ShopTab(props) {
  const [subPage, setSubPage] = useState(null)
  const { workspace, toast, refetch } = props
  const back = () => setSubPage(null)

  if (subPage === 'revenue')  return <><BackBar onBack={back} title="Revenue" /><div style={{paddingBottom:90}}><RevenuePageShop workspace={workspace} /></div></>
  if (subPage === 'orders')   return <><BackBar onBack={back} title="Orders" /><div style={{paddingBottom:90}}><OrderHistorySection workspace={workspace} toast={toast} /></div></>
  if (subPage === 'products') return <><BackBar onBack={back} title="Products" /><div style={{paddingBottom:90}}><ProductsSection {...props} /></div></>
  if (subPage === 'reviews')  return <><BackBar onBack={back} title="Reviews" /><div style={{paddingBottom:90}}><ReviewsSection {...props} type="shop" /></div></>
  if (subPage === 'shipping') return <><BackBar onBack={back} title="Shipping" /><div style={{paddingBottom:90}}><ShippingSection workspace={workspace} toast={toast} /></div></>
  if (subPage === 'policy')   return (
    <>
      <BackBar onBack={back} title="Policy" />
      <div style={{paddingBottom:90}}>
        <PolicySection workspace={workspace} toast={toast} refetch={refetch} type="shop" />
      </div>
    </>
  )

  return <OverviewSection {...props} activeTab="shop" onNavigate={(page) => setSubPage(page)} />
}
