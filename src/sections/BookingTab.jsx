import { useState } from 'react'
import OverviewSection      from './OverviewSection'
import AppointmentsSection  from './AppointmentsSection'
import AvailabilitySection  from './AvailabilitySection'
import ClientsSection       from './ClientsSection'
import ServicesSection      from './ServicesSection'
import PortfolioSection     from './PortfolioSection'
import ReviewsSection       from './ReviewsSection'
import PolicySection        from './PolicySection'
import RevenuePageBooking   from './RevenuePageBooking'
import BackBar              from './BackBar'

export default function BookingTab(props) {
  const [subPage, setSubPage] = useState(null)
  const { workspace, toast, refetch } = props
  const back = () => setSubPage(null)

  if (subPage === 'revenue')       return <><BackBar onBack={back} title="Revenue" /><div style={{paddingBottom:90}}><RevenuePageBooking /></div></>
  if (subPage === 'appointments')  return <><BackBar onBack={back} title="Appointments" /><div style={{paddingBottom:90}}><AppointmentsSection {...props} /></div></>
  if (subPage === 'availability')  return <><BackBar onBack={back} title="Availability" /><div style={{paddingBottom:90}}><AvailabilitySection {...props} /></div></>
  if (subPage === 'clients')       return <><BackBar onBack={back} title="Clients" /><div style={{paddingBottom:90}}><ClientsSection {...props} /></div></>
  if (subPage === 'services')      return <><BackBar onBack={back} title="Services" /><div style={{paddingBottom:90}}><ServicesSection {...props} /></div></>
  if (subPage === 'portfolio')     return <><BackBar onBack={back} title="Portfolio" /><div style={{paddingBottom:90}}><PortfolioSection {...props} /></div></>
  if (subPage === 'reviews')       return <><BackBar onBack={back} title="Reviews" /><div style={{paddingBottom:90}}><ReviewsSection {...props} type="booking" /></div></>
  if (subPage === 'policy')        return (
    <>
      <BackBar onBack={back} title="Policy" />
      <div style={{paddingBottom:90}}>
        <PolicySection workspace={workspace} toast={toast} refetch={refetch} type="booking" />
      </div>
    </>
  )

  return <OverviewSection {...props} activeTab="booking" onNavigate={(page) => setSubPage(page)} />
}
