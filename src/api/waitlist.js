import { supabase } from '../lib/supabase'

export async function markWaitlistNotified(id) {
  const { error } = await supabase
    .from('waitlist_entries')
    .update({ notified_at: new Date().toISOString() })
    .eq('id', id)
  return { error }
}

export async function getUnnotifiedWaitlistCount(workspaceId) {
  const { count, error } = await supabase
    .from('waitlist_entries')
    .select('id', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .is('notified_at', null)
  return { count: count || 0, error }
}

export async function removeWaitlistEntry(id) {
  const { error } = await supabase
    .from('waitlist_entries')
    .delete()
    .eq('id', id)
  return { error }
}
