import AppointmentsSection from './AppointmentsSection'
import ServicesSection     from './ServicesSection'
import AvailabilitySection from './AvailabilitySection'
import ClientsSection      from './ClientsSection'
import PortfolioSection    from './PortfolioSection'
import ReviewsSection      from './ReviewsSection'
import PolicySection       from './PolicySection'

export default function BookingTab(props) {
  const { workspace, toast, refetch } = props
  return (
    <>
      <AppointmentsSection {...props} />
      <ServicesSection     {...props} />
      <AvailabilitySection {...props} />
      <ClientsSection      {...props} />
      <PortfolioSection    {...props} />
      <ReviewsSection      {...props} type="booking" />
      <PolicySection workspace={workspace} toast={toast} refetch={refetch} type="booking" />
    </>
  )
}
