import { supabase } from '../lib/supabase'

export async function fetchSubscription(workspaceId) {
  return supabase
    .from('subscriptions')
    .select('*')
    .eq('workspace_id', workspaceId)
    .maybeSingle()
}

export function isSubscriptionActive(subscription) {
  if (!subscription) return false
  return subscription.status === 'active' || subscription.status === 'trialing'
}

export function isPro(subscription) {
  return isSubscriptionActive(subscription) && subscription.plan === 'pro'
}

export async function createCheckoutSession(priceId, workspaceId, billingInterval) {
  const { data, error } = await supabase.functions.invoke('create-checkout-payment-intent', {
    body: { price_id: priceId, workspace_id: workspaceId, billing_interval: billingInterval },
  })
  if (error) throw error
  return data
}
