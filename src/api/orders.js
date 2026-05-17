import { supabase } from '../lib/supabase'

/**
 * Récupère toutes les commandes d'un workspace.
 */
export async function fetchOrders(workspaceId) {
  const { data, error } = await supabase
    .from('orders')
    .select('id,client_name,client_email,product_id,quantity,unit_price,total_amount,currency,status,payment_status,created_at')
    .eq('workspace_id', workspaceId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  return { data, error }
}

/**
 * Met à jour le statut d'une commande.
 */
export async function updateOrderStatus(orderId, status) {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
  return { error }
}
