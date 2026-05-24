import { useState } from 'react'
import OverviewSection     from './OverviewSection'
import AppointmentsSection from './AppointmentsSection'
import AvailabilitySection from './AvailabilitySection'
import ClientsSection      from './ClientsSection'
import ServicesSection     from './ServicesSection'
import PortfolioSection    from './PortfolioSection'
import ReviewsSection      from './ReviewsSection'
import PolicySection       from './PolicySection'
import BackBar             from './BackBar'

export default function BookingTab(props) {
  const [subPage, setSubPage] = useState(null)
  const { workspace, toast, refetch } = props
  const back = () => setSubPage(null)

  if (subPage === 'appointments') return <><BackBar onBack={back} title="Appointments" /><AppointmentsSection {...props} /></>
  if (subPage === 'availability') return <><BackBar onBack={back} title="Availability"  /><AvailabilitySection  {...props} /></>
  if (subPage === 'clients')      return <><BackBar onBack={back} title="Clients"       /><ClientsSection       {...props} /></>
  if (subPage === 'services')     return <><BackBar onBack={back} title="Services"      /><ServicesSection      {...props} /></>
  if (subPage === 'portfolio')    return <><BackBar onBack={back} title="Portfolio"     /><PortfolioSection     {...props} /></>
  if (subPage === 'reviews')      return <><BackBar onBack={back} title="Reviews"       /><ReviewsSection       {...props} type="booking" /></>
  if (subPage === 'policy')       return (
    <>
      <BackBar onBack={back} title="Policy" />
      <PolicySection workspace={workspace} toast={toast} refetch={refetch} type="booking" />
    </>
  )

  return <OverviewSection {...props} activeTab="booking" onNavigate={(page) => setSubPage(page)} />
}
