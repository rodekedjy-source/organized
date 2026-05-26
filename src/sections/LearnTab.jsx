import { useState } from 'react'
import OverviewSection  from './OverviewSection'
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
      <OverviewSection {...props} activeTab="learn" onNavigate={(page) => setSubPage(page)} />
      {navCard('FORMATIONS & WORKSHOPS', 'offerings')}
      {navCard('REVIEWS',                'reviews')}
      {navCard('POLICY',                 'policy')}
    </>
  )
}
