import { supabase } from '../lib/supabase'

export async function fetchReviews(workspaceId) {
  return supabase
    .from('reviews')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
}

export async function approveReview(id) {
  return supabase
    .from('reviews')
    .update({ is_approved: true })
    .eq('id', id)
}

export async function deleteReview(id) {
  return supabase.from('reviews').delete().eq('id', id)
}
