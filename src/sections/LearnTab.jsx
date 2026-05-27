import { useState } from 'react'
import OverviewSection  from './OverviewSection'
import OfferingsSection from './OfferingsSection'
import EnrollmentsView  from './EnrollmentsView'
import ReviewsSection   from './ReviewsSection'
import PolicySection    from './PolicySection'
import RevenuePageLearn from './RevenuePageLearn'
import BackBar          from './BackBar'

export default function LearnTab(props) {
  const [subPage, setSubPage] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const { workspace, toast, refetch } = props

  function goBack() { setSubPage(null); setRefreshKey(k => k + 1) }

  const wrap = (title, child) => (
    <><BackBar onBack={goBack} title={title} /><div style={{ paddingBottom: 90 }}>{child}</div></>
  )

  if (subPage === 'revenue')
    return wrap('Revenue', <RevenuePageLearn workspace={workspace} />)
  if (subPage === 'offerings')
    return wrap('Formations', <OfferingsSection key={refreshKey} {...props} />)
  if (subPage === 'enrollments')
    return wrap('Enrollments', <EnrollmentsView key={refreshKey} workspace={workspace} toast={toast} />)
  if (subPage === 'reviews')
    return wrap('Reviews', <ReviewsSection {...props} type="learn" />)
  if (subPage === 'policy')
    return wrap('Policy', <PolicySection workspace={workspace} toast={toast} refetch={refetch} type="learn" />)

  return <OverviewSection {...props} activeTab="learn" onNavigate={setSubPage} />
}
