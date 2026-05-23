import { useState } from 'react'
import ProductsSection from './ProductsSection'
import OrdersSection   from './OrdersSection'
import ReviewsSection  from './ReviewsSection'
import PolicySection   from './PolicySection'
import BackBar         from './BackBar'

export default function ShopTab(props) {
  const [subPage, setSubPage] = useState(null)
  const { workspace, toast, refetch } = props
  const back = () => setSubPage(null)

  if (subPage === 'products') return <><BackBar onBack={back} title="Products" /><ProductsSection {...props} /></>
  if (subPage === 'orders')   return <><BackBar onBack={back} title="Orders"   /><OrdersSection   workspace={workspace} toast={toast} /></>
  if (subPage === 'reviews')  return <><BackBar onBack={back} title="Reviews"  /><ReviewsSection  {...props} type="shop" /></>
  if (subPage === 'policy')   return (
    <>
      <BackBar onBack={back} title="Policy" />
      <PolicySection workspace={workspace} toast={toast} refetch={refetch} type="shop" />
    </>
  )

  return (
    <>
      <ProductsSection {...props} />
      <OrdersSection   workspace={workspace} toast={toast} />
    </>
  )
}
