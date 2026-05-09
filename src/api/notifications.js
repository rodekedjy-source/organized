import { supabase } from '../lib/supabase'

// ── REVIEWS ──────────────────────────────────────────────────────────────────

/**
 * Récupère le nombre d'avis en attente d'approbation (badge sidebar).
 */
export async function fetchPendingReviewsCount(workspaceId) {
  return supabase
    .from('reviews')
    .select('id', { count: 'exact' })
    .eq('workspace_id', workspaceId)
    .eq('is_approved', false)
}

/**
 * Récupère tous les avis d'un workspace, du plus récent au plus ancien.
 */
export async function fetchReviews(workspaceId) {
  return supabase
    .from('reviews')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
}

/**
 * Approuve un avis.
 */
export async function approveReview(id) {
  return supabase
    .from('reviews')
    .update({ is_approved: true })
    .eq('id', id)
}

/**
 * Supprime un avis.
 */
export async function deleteReview(id) {
  return supabase
    .from('reviews')
    .delete()
    .eq('id', id)
}

// ── PORTFOLIO ─────────────────────────────────────────────────────────────────

/**
 * Récupère les photos du portfolio d'un workspace, triées par display_order.
 */
export async function fetchPortfolioPhotos(workspaceId) {
  return supabase
    .from('portfolio_photos')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('display_order')
}

/**
 * Ajoute une photo au portfolio.
 */
export async function insertPortfolioPhoto(workspaceId, url, displayOrder) {
  return supabase
    .from('portfolio_photos')
    .insert({ workspace_id: workspaceId, url, display_order: displayOrder })
}

/**
 * Supprime une photo du portfolio.
 */
export async function deletePortfolioPhoto(id) {
  return supabase
    .from('portfolio_photos')
    .delete()
    .eq('id', id)
}
