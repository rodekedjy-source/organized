import { supabase } from '../lib/supabase'
import { cacheInvalidate, cacheInvalidatePrefix } from '../lib/cache'

export async function getOfferingById(offeringId, workspaceId) {
  const query = supabase.from('offerings').select('*').eq('id', offeringId)
  if (workspaceId) query.eq('workspace_id', workspaceId)
  const { data, error } = await query.maybeSingle()
  return { data, error }
}

export async function fetchOfferings(workspaceId) {
  const { data, error } = await supabase
    .from('offerings')
    .select('*')
    .eq('workspace_id', workspaceId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function insertOffering(data) {
  if (data?.workspace_id) cacheInvalidate(`offerings:${data.workspace_id}`)
  const { data: row, error } = await supabase
    .from('offerings')
    .insert({ ...data, is_active: true })
    .select()
    .single()
  return { data: row, error }
}

export async function updateOffering(id, data) {
  cacheInvalidatePrefix('offerings:')
  const { error } = await supabase
    .from('offerings')
    .update(data)
    .eq('id', id)
  return { error }
}

export async function deleteOffering(id) {
  cacheInvalidatePrefix('offerings:')
  const { error } = await supabase
    .from('offerings')
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq('id', id)
  return { error }
}

export async function enrollFree(offeringId, workspaceId, clientData) {
  const { data, error } = await supabase
    .from('enrollments')
    .insert({
      offering_id: offeringId,
      workspace_id: workspaceId,
      client_name: clientData.name,
      client_email: clientData.email,
      client_phone: clientData.phone || null,
      amount_paid: 0,
      payment_status: 'free',
      status: 'confirmed'
    })
    .select()
    .single()
  return { data, error }
}

export async function fetchEnrollments(workspaceId) {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*, offerings(title, type)')
    .eq('workspace_id', workspaceId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  return { data, error }
}
