import { supabase } from '../lib/supabase'

/**
 * Update workspace booking policy fields.
 */
export async function updatePolicy(workspaceId, data) {
  const { error } = await supabase
    .from('workspaces')
    .update({
      policy_enabled:      data.policy_enabled,
      policy_deposit_pct:  data.policy_deposit_pct,
      policy_cancel_hours: data.policy_cancel_hours,
      policy_late_fee:     data.policy_late_fee,
      policy_no_show_fee:  data.policy_no_show_fee,
      policy_custom:       data.policy_custom,
    })
    .eq('id', workspaceId)
  return { error }
}
