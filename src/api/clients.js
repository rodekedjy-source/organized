import { supabase } from '../lib/supabase'

/**
 * Récupère tous les clients d'un workspace, triés par dépenses décroissantes.
 */
export async function fetchClients(workspaceId) {
  return supabase
    .from('clients')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('total_spent', { ascending: false })
}

/**
 * Met à jour le tag d'un client (new, regular, vip, ou null).
 */
export async function updateClientTag(id, tag) {
  return supabase
    .from('clients')
    .update({ tag: tag || null })
    .eq('id', id)
}
