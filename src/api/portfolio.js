import { supabase } from '../lib/supabase'

export async function fetchPortfolioPhotos(workspaceId) {
  return supabase
    .from('portfolio_photos')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('display_order')
}

export async function insertPortfolioPhoto(workspaceId, url, displayOrder) {
  return supabase
    .from('portfolio_photos')
    .insert({ workspace_id: workspaceId, url, display_order: displayOrder })
}

export async function deletePortfolioPhoto(id) {
  return supabase.from('portfolio_photos').delete().eq('id', id)
}

export async function uploadPortfolioFile(workspaceId, file) {
  const ext = file.name.split('.').pop()
  const path = `${workspaceId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage
    .from('portfolio')
    .upload(path, file, { contentType: file.type })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from('portfolio').getPublicUrl(path)
  return { path, publicUrl: data.publicUrl }
}

export async function deletePortfolioFile(url) {
  const marker = '/object/public/portfolio/'
  const path = url.includes(marker) ? url.split(marker)[1] : null
  if (path) await supabase.storage.from('portfolio').remove([path])
}
