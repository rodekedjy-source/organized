import { supabase } from '../lib/supabase'

export async function getSubscription(workspaceId) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('workspace_id', workspaceId)
    .single()
  return { data, error }
}

export async function createCheckoutSession(priceId, workspaceId, billingInterval) {
  const response = await supabase.functions.invoke('create-subscription', {
    body: { price_id: priceId, workspace_id: workspaceId, billing_interval: billingInterval }
  })
  if (response.error) throw new Error(response.error.message)
  return response.data
}

export function isSubscriptionActive(subscription) {
  if (!subscription) return false
  const { status, trial_end } = subscription
  if (status === 'active') return true
  if (status === 'trialing') {
    if (!trial_end) return true
    return new Date(trial_end) > new Date()
  }
  return false
}

export function isPro(subscription) {
  if (!isSubscriptionActive(subscription)) return false
  return subscription?.plan === 'pro'
}
