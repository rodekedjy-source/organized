import OfferingsSection from './OfferingsSection'
import ReviewsSection   from './ReviewsSection'
import PolicySection    from './PolicySection'

export default function LearnTab(props) {
  const { workspace, toast, refetch } = props
  return (
    <>
      <OfferingsSection {...props} />
      <ReviewsSection   {...props} type="learn" />
      <PolicySection    workspace={workspace} toast={toast} refetch={refetch} type="learn" />
    </>
  )
}
