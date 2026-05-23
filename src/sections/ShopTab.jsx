import ProductsSection from './ProductsSection'
import OrdersSection   from './OrdersSection'
import ReviewsSection  from './ReviewsSection'
import PolicySection   from './PolicySection'

export default function ShopTab(props) {
  const { workspace, toast, refetch } = props
  return (
    <>
      <ProductsSection {...props} />
      <OrdersSection   workspace={workspace} toast={toast} />
      <ReviewsSection  {...props} type="shop" />
      <PolicySection   workspace={workspace} toast={toast} refetch={refetch} type="shop" />
    </>
  )
}
