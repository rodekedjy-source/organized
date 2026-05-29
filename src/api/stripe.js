import { supabase } from '../lib/supabase'

export async function createConnectAccount(workspaceId) {
  return supabase.functions.invoke('create-connect-account', {
    body: { workspace_id: workspaceId },
  })
}

export async function verifyConnectAccount(workspaceId) {
  return supabase.functions.invoke('verify-connect-account', {
    body: { workspace_id: workspaceId },
  })
}
