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
  const { workspace, toast, refetch, isPro } = props

  function goBack() { setSubPage(null); setRefreshKey(k => k + 1) }

  if (isPro === false) return (
    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
      <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Learn is a Pro feature</p>
      <p style={{ color: '#888', marginBottom: 24, fontSize: '14px' }}>Upgrade to Pro to offer courses and workshops.</p>
      <button style={{ background: '#1A0900', color: '#C9A84C', border: 'none', borderRadius: 8, padding: '12px 28px', fontSize: '14px', cursor: 'pointer' }}
        onClick={() => window.location.href = '/dashboard?upgrade=true'}>
        Upgrade to Pro →
      </button>
    </div>
  )

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
