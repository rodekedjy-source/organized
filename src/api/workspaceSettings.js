import { supabase } from '../lib/supabase'

export async function getWorkspaceSettings(workspaceId) {
  return supabase
    .from('workspace_settings')
    .select('*')
    .eq('workspace_id', workspaceId)
    .maybeSingle()
}

export async function upsertWorkspaceSettings(workspaceId, updates) {
  return supabase
    .from('workspace_settings')
    .upsert(
      { workspace_id: workspaceId, ...updates, updated_at: new Date().toISOString() },
      { onConflict: 'workspace_id' }
    )
    .select()
    .maybeSingle()
}
