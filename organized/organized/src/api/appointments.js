import { supabase } from '../lib/supabase'

/**
 * Récupère tous les RDV d'un workspace, avec le nom du service associé.
 * Utilisé par le calendrier principal et les stats.
 */
export async function fetchAppointments(workspaceId) {
  return supabase
    .from('appointments')
    .select('*, services(name)')
    .eq('workspace_id', workspaceId)
}

/**
 * Récupère tous les RDV d'un workspace, triés du plus récent au plus ancien.
 * Utilisé par la liste de gestion des RDV.
 */
export async function fetchAppointmentsOrdered(workspaceId) {
  return supabase
    .from('appointments')
    .select('*, services(name)')
    .eq('workspace_id', workspaceId)
    .order('scheduled_at', { ascending: false })
}

/**
 * Récupère les RDV d'un client précis dans un workspace.
 */
export async function fetchAppointmentsByClient(workspaceId, clientName) {
  return supabase
    .from('appointments')
    .select('*, services(name)')
    .eq('workspace_id', workspaceId)
    .eq('client_name', clientName)
    .order('scheduled_at', { ascending: false })
}

/**
 * Crée un RDV depuis le panneau calendrier du dashboard.
 */
export async function insertAppointment({
  workspaceId,
  clientName,
  clientPhone,
  clientEmail,
  serviceId,
  serviceName,
  scheduledAt,
  amount,
  status,
}) {
  return supabase.from('appointments').insert({
    workspace_id: workspaceId,
    client_name: clientName,
    client_phone: clientPhone ?? null,
    client_email: clientEmail ?? null,
    service_id: serviceId ?? null,
    service_name: serviceName ?? null,
    scheduled_at: scheduledAt,
    amount: amount ?? 0,
    status,
  })
}

/**
 * Crée un RDV depuis la page publique client (avec notes).
 */
export async function insertAppointmentFromClient({
  workspaceId,
  clientName,
  clientPhone,
  clientEmail,
  serviceId,
  serviceName,
  scheduledAt,
  amount,
  status = 'pending',
  notes,
}) {
  return supabase.from('appointments').insert({
    workspace_id: workspaceId,
    client_name: clientName,
    client_phone: clientPhone ?? null,
    client_email: clientEmail ?? null,
    service_id: serviceId,
    service_name: serviceName,
    scheduled_at: scheduledAt,
    amount: amount ?? 0,
    status,
    notes: notes ?? null,
  })
}

/**
 * Replanifie un RDV existant (nouvelle date/heure).
 */
export async function rescheduleAppointment(id, scheduledAt) {
  return supabase
    .from('appointments')
    .update({ scheduled_at: scheduledAt })
    .eq('id', id)
}

/**
 * Met à jour le statut d'un RDV (confirmed, cancelled, etc.).
 */
export async function updateAppointmentStatus(id, status) {
  return supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)
}
