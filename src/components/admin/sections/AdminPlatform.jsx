import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { Card, SecHd, useToast, Toast } from '../AdminShared'

async function getConfig(key) {
  const { data } = await supabase.from('app_config').select('value').eq('key', key).maybeSingle()
  return data?.value
}

async function setConfig(key, value) {
  await supabase.from('app_config').upsert({ key, value: String(value) }, { onConflict: 'key' })
}

export default function AdminPlatform() {
  const [onboardingOpen,   setOnboardingOpen]   = useState(false)
  const [paymentsRequired, setPaymentsRequired] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toastMsg, showToast } = useToast()

  useEffect(() => {
    async function load() {
      const [ob, pr] = await Promise.all([
        getConfig('onboarding_open'),
        getConfig('payments_required'),
      ])
      setOnboardingOpen(ob === 'true')
      setPaymentsRequired(pr === 'true')
      setLoading(false)
    }
    load()
  }, [])

  async function toggleOnboarding() {
    const next = !onboardingOpen
    setOnboardingOpen(next)
    await setConfig('onboarding_open', next)
    showToast(`Onboarding ${next ? 'open' : 'closed'}`)
  }

  async function togglePayments() {
    const next = !paymentsRequired
    setPaymentsRequired(next)
    await setConfig('payments_required', next)
    showToast(`Payments ${next ? 'required (LIVE)' : 'not required (beta)'}`)
  }

  if (loading) return null

  return (
    <div>
      <Card>
        <SecHd title="Platform Settings" />

        <div className="x-trow">
          <div style={{ flex: 1 }}>
            <div className="x-tlbl">Onboarding open</div>
            <div className="x-tsub">
              {onboardingOpen ? 'ON — new users can sign up' : 'OFF — landing shows "Join waitlist"'}
            </div>
          </div>
          <div className={`x-tog ${onboardingOpen ? 'on' : 'off'}`} onClick={toggleOnboarding}>
            <div className="x-tok" />
          </div>
        </div>

        <div className="x-trow">
          <div style={{ flex: 1 }}>
            <div className="x-tlbl">Payments required</div>
            <div className="x-tsub">
              {paymentsRequired
                ? <span style={{ color: '#e25', fontWeight: 600 }}>⚠ Live — users must pay to access</span>
                : 'OFF — free onboarding (beta)'}
            </div>
          </div>
          <div className={`x-tog ${paymentsRequired ? 'on' : 'off'}`} onClick={togglePayments}>
            <div className="x-tok" />
          </div>
        </div>
      </Card>
      <Toast msg={toastMsg} />
    </div>
  )
}
