import { supabase } from '../lib/supabase'

/**
 * Récupère tous les produits d'un workspace, du plus récent au plus ancien.
 */
export async function fetchProducts(workspaceId) {
  return supabase
    .from('products')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
}

/**
 * Récupère uniquement les IDs des produits (pour les stats/comptage).
 */
export async function fetchProductIds(workspaceId) {
  return supabase
    .from('products')
    .select('id')
    .eq('workspace_id', workspaceId)
}

/**
 * Crée un nouveau produit.
 */
export async function insertProduct({ workspaceId, name, price, stock, description, images }) {
  return supabase.from('products').insert({
    workspace_id: workspaceId,
    name,
    price: parseFloat(price) || 0,
    stock: parseInt(stock) || 0,
    description,
    images,
    image_url: images?.[0] || null,
  })
}

/**
 * Met à jour un produit existant.
 */
export async function updateProduct(id, { name, price, stock, description, images }) {
  return supabase
    .from('products')
    .update({
      name,
      price: parseFloat(price) || 0,
      stock: parseInt(stock) || 0,
      description,
      images,
      image_url: images?.[0] || null,
    })
    .eq('id', id)
}

/**
 * Sets (or clears) the featured product on a workspace.
 * Pass null as productId to unfeature.
 */
export async function setFeaturedProduct(workspaceId, productId) {
  return supabase
    .from('workspaces')
    .update({ featured_product_id: productId })
    .eq('id', workspaceId)
}

/**
 * Supprime un produit.
 */
export async function deleteProduct(id) {
  return supabase
    .from('products')
    .delete()
    .eq('id', id)
}

/**
 * Supprime plusieurs produits en une seule passe (bulk delete).
 */
export async function deleteProducts(ids) {
  return Promise.all(ids.map((id) => deleteProduct(id)))
}
