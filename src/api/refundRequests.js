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
