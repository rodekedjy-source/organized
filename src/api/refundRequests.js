import { supabase } from '../lib/supabase'

export async function fetchEnrollmentByToken(token) {
  return supabase
    .from('enrollments')
    .select('id, workspace_id, client_name, client_email, amount_paid, currency, payment_status, refunded_at, offerings(title)')
    .eq('enrollment_token', token)
    .maybeSingle()
}

export async function checkExistingRefundRequest(enrollmentId) {
  return supabase
    .from('refund_requests')
    .select('id, status')
    .eq('enrollment_id', enrollmentId)
    .maybeSingle()
}

export async function submitRefundRequest({ workspace_id, enrollment_id, client_name, client_email, reason }) {
  return supabase
    .from('refund_requests')
    .insert({ workspace_id, request_type: 'enrollment', enrollment_id, client_name, client_email, reason })
}

export async function getRefundRequests(workspaceId) {
  return supabase
    .from('refund_requests')
    .select('*, enrollments(client_name, client_email, amount_paid, currency, offerings(title))')
    .eq('workspace_id', workspaceId)
    .eq('request_type', 'enrollment')
    .order('created_at', { ascending: false })
}

export async function approveRefundRequest(requestId) {
  return supabase
    .from('refund_requests')
    .update({ status: 'approved', resolved_at: new Date().toISOString() })
    .eq('id', requestId)
}

export async function declineRefundRequest(requestId, reason) {
  return supabase
    .from('refund_requests')
    .update({ status: 'declined', decline_reason: reason, resolved_at: new Date().toISOString() })
    .eq('id', requestId)
}
