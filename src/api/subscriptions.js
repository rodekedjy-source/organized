import { supabase } from '../lib/supabase'

export async function fetchSubscription(workspaceId) {
  return supabase
    .from('subscriptions')
    .select('*')
    .eq('workspace_id', workspaceId)
    .maybeSingle()
}
