import { supabase } from '../lib/supabase'

/**
 * Récupère le workspace et l'utilisateur associés à une session.
 */
export async function fetchWorkspaceAndUser(userId) {
  return Promise.all([
    supabase.from('workspaces').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('users').select('*').eq('id', userId).maybeSingle(),
  ])
}

/**
 * Récupère l'abonnement actif d'un workspace.
 */
export async function fetchSubscription(workspaceId) {
  return supabase
    .from('subscriptions')
    .select('*')
    .eq('workspace_id', workspaceId)
    .maybeSingle()
}

/**
 * Met à jour l'objectif de revenus mensuels.
 */
export async function updateRevenueGoal(workspaceId, goal) {
  return supabase
    .from('workspaces')
    .update({ monthly_revenue_goal: goal })
    .eq('id', workspaceId)
}

/**
 * Publie ou dépublie la page publique du workspace.
 */
export async function updatePublishedStatus(workspaceId, isPublished) {
  return supabase
    .from('workspaces')
    .update({ is_published: isPublished })
    .eq('id', workspaceId)
}

/**
 * Met à jour le thème de la page publique (light / dark).
 */
export async function updateWorkspaceTheme(workspaceId, theme) {
  return supabase
    .from('workspaces')
    .update({ theme })
    .eq('id', workspaceId)
}

/**
 * Sauvegarde le profil business (nom, adresse, contact, réseaux sociaux, visites à domicile).
 */
export async function updateBusinessProfile(workspaceId, fields) {
  return supabase
    .from('workspaces')
    .update({
      name: fields.name,
      tagline: fields.tagline,
      bio: fields.bio,
      address_street: fields.address_street || null,
      address_city: fields.address_city || null,
      address_province: fields.address_province || null,
      address_postal: fields.address_postal || null,
      address_country: fields.address_country || 'CA',
      show_address_on_page: fields.show_address_on_page,
      address_in_confirmations: fields.address_in_confirmations,
      email: fields.email,
      phone: fields.phone,
      instagram: fields.instagram,
      tiktok: fields.tiktok,
      offers_domicile: fields.offers_domicile,
      domicile_fee: fields.offers_domicile ? Number(fields.domicile_fee) || 45 : null,
      domicile_radius_km: fields.offers_domicile ? Number(fields.domicile_radius_km) || 25 : null,
      domicile_notes: fields.offers_domicile ? fields.domicile_notes || null : null,
    })
    .eq('id', workspaceId)
}

/**
 * Sauvegarde les paramètres d'automatisation (demandes d'avis).
 */
export async function updateAutomationSettings(workspaceId, { reviewRequestsEnabled, googleReviewUrl, reviewDelayHours }) {
  return supabase
    .from('workspaces')
    .update({
      review_requests_enabled: reviewRequestsEnabled,
      google_review_url: googleReviewUrl?.trim() || null,
      review_delay_hours: Number(reviewDelayHours),
    })
    .eq('id', workspaceId)
}

// ── USERS ────────────────────────────────────────────────────────────────────

/**
 * Crée ou met à jour le profil utilisateur (nom, email).
 */
export async function upsertUser(id, { fullName, email }) {
  return supabase
    .from('users')
    .upsert({ id, full_name: fullName, email }, { onConflict: 'id' })
}

/**
 * Met à jour la langue de l'interface pour un utilisateur.
 */
export async function updateUserLanguage(id, language) {
  return supabase
    .from('users')
    .update({ language })
    .eq('id', id)
}

/**
 * Met à jour l'URL de l'avatar d'un utilisateur.
 */
export async function updateUserAvatar(id, avatarUrl) {
  return supabase
    .from('users')
    .update({ avatar_url: avatarUrl })
    .eq('id', id)
}

/**
 * Supprime l'avatar d'un utilisateur.
 */
export async function removeUserAvatar(id) {
  return supabase
    .from('users')
    .update({ avatar_url: null })
    .eq('id', id)
}

// ── AUTH ─────────────────────────────────────────────────────────────────────

/**
 * Récupère la session active.
 */
export async function getSession() {
  return supabase.auth.getSession()
}

/**
 * Écoute les changements d'état d'authentification.
 * Retourne l'objet subscription (à unsubscribe dans le cleanup).
 */
export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange(callback)
  return data.subscription
}

/**
 * Met à jour l'email de l'utilisateur connecté.
 */
export async function updateAuthEmail(email) {
  return supabase.auth.updateUser({ email })
}

/**
 * Met à jour le mot de passe de l'utilisateur connecté.
 */
export async function updateAuthPassword(password) {
  return supabase.auth.updateUser({ password })
}

/**
 * Déconnecte l'utilisateur.
 */
export async function signOut() {
  return supabase.auth.signOut()
}
