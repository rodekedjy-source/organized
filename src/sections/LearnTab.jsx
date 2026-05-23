import { useState } from 'react'
import OfferingsSection from './OfferingsSection'
import ReviewsSection   from './ReviewsSection'
import PolicySection    from './PolicySection'
import BackBar          from './BackBar'

export default function LearnTab(props) {
  const [subPage, setSubPage] = useState(null)
  const { workspace, toast, refetch } = props
  const back = () => setSubPage(null)

  if (subPage === 'offerings') return <><BackBar onBack={back} title="Offerings" /><OfferingsSection {...props} /></>
  if (subPage === 'reviews')   return <><BackBar onBack={back} title="Reviews"   /><ReviewsSection  {...props} type="learn" /></>
  if (subPage === 'policy')    return (
    <>
      <BackBar onBack={back} title="Policy" />
      <PolicySection workspace={workspace} toast={toast} refetch={refetch} type="learn" />
    </>
  )

  return <OfferingsSection {...props} />
}
