import { supabase } from '../lib/supabase'

/**
 * Récupère les services actifs d'un workspace (pour le formulaire de RDV).
 */
export async function fetchActiveServices(workspaceId) {
  return supabase
    .from('services')
    .select('id, name, price')
    .eq('workspace_id', workspaceId)
    .eq('is_active', true)
}

/**
 * Récupère tous les services d'un workspace, triés par display_order.
 */
export async function fetchServices(workspaceId) {
  return supabase
    .from('services')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('display_order', { ascending: true })
}

/**
 * Crée un nouveau service.
 */
export async function insertService({ workspaceId, name, price, durationMin, description }) {
  return supabase
    .from('services')
    .insert({
      workspace_id: workspaceId,
      name,
      price: parseFloat(price) || 0,
      duration_min: durationMin ? parseInt(durationMin) : null,
      description,
      is_free: parseFloat(price) === 0,
    })
    .select()
    .single()
}

/**
 * Met à jour l'image d'un service.
 */
export async function updateServiceImage(id, imageUrl) {
  return supabase
    .from('services')
    .update({ image_url: imageUrl })
    .eq('id', id)
}

/**
 * Supprime l'image d'un service (met image_url à null).
 */
export async function removeServiceImage(id) {
  return supabase
    .from('services')
    .update({ image_url: null })
    .eq('id', id)
}

/**
 * Active ou désactive un service.
 */
export async function toggleServiceActive(id, currentValue) {
  return supabase
    .from('services')
    .update({ is_active: !currentValue })
    .eq('id', id)
}

/**
 * Supprime un service.
 */
export async function deleteService(id) {
  return supabase
    .from('services')
    .delete()
    .eq('id', id)
}
