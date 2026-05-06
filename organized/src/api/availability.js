import { supabase } from '../lib/supabase'

export async function fetchAvailability(workspaceId) {
  return supabase
    .from('availability')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('day_of_week')
}

export async function insertDefaultAvailability(workspaceId) {
  const defaults = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
    .map((_, i) => ({
      workspace_id: workspaceId,
      day_of_week: i,
      is_open: i >= 1 && i <= 5,
      open_time: '09:00:00',
      close_time: '18:00:00',
    }))
  return supabase.from('availability').insert(defaults).select()
}

export async function toggleAvailabilityDay(id, currentValue) {
  return supabase
    .from('availability')
    .update({ is_open: !currentValue })
    .eq('id', id)
}

export async function updateAvailabilityTime(id, field, value) {
  return supabase
    .from('availability')
    .update({ [field]: value })
    .eq('id', id)
}

export async function fetchBlockedDates(workspaceId) {
  return supabase
    .from('blocked_dates')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('blocked_date')
}

export async function insertBlockedDate(workspaceId, date, reason) {
  return supabase
    .from('blocked_dates')
    .insert({ workspace_id: workspaceId, blocked_date: date, reason })
}

export async function deleteBlockedDate(id) {
  return supabase.from('blocked_dates').delete().eq('id', id)
}
