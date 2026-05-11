import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TABLES = [
  'users', 'workspaces', 'services', 'products', 'offerings',
  'clients', 'appointments', 'orders', 'enrollments',
  'payments', 'subscriptions', 'notifications',
  'audit_log', 'waitlist', 'admin_users',
]

const BUCKET = 'db-backups'
const MAX_BACKUPS = 4

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  )

  // ── GET — return last backup metadata (used by AdminHealth) ───────────────
  if (req.method === 'GET') {
    try {
      const { data: files, error } = await supabase.storage
        .from(BUCKET)
        .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })

      if (error) throw error

      const last = files?.[0] ?? null
      return Response.json({
        lastBackup:     last?.name        ?? null,
        lastBackupDate: last?.created_at  ?? null,
        count:          files?.length     ?? 0,
      })
    } catch (err) {
      return Response.json({ lastBackup: null, lastBackupDate: null, count: 0, error: String(err) }, { status: 500 })
    }
  }

  // ── POST — run full backup ────────────────────────────────────────────────
  try {
    // 1. Export all tables
    const snapshot: Record<string, unknown[]> = {}
    let totalRows = 0

    for (const table of TABLES) {
      const { data, error } = await supabase.from(table).select('*')
      if (error) {
        snapshot[table] = []
      } else {
        snapshot[table] = data ?? []
        totalRows += snapshot[table].length
      }
    }

    // 2. Build file
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]   // YYYY-MM-DD
    const filename = `backup_${dateStr}.json`

    const payload = {
      created_at: now.toISOString(),
      tables: Object.keys(snapshot),
      total_rows: totalRows,
      data: snapshot,
    }

    const json  = JSON.stringify(payload)
    const bytes = new TextEncoder().encode(json)

    // 3. Upload
    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(filename, bytes, { contentType: 'application/json', upsert: true })

    if (uploadErr) throw uploadErr

    // 4. Prune — keep only last MAX_BACKUPS
    const { data: files } = await supabase.storage.from(BUCKET).list('', {
      limit: 100,
      sortBy: { column: 'created_at', order: 'asc' },
    })

    if (files && files.length > MAX_BACKUPS) {
      const toDelete = files.slice(0, files.length - MAX_BACKUPS).map(f => f.name)
      if (toDelete.length > 0) await supabase.storage.from(BUCKET).remove(toDelete)
    }

    // 5. Summary
    return Response.json({
      ok: true,
      filename,
      tables: TABLES.length,
      total_rows: totalRows,
      size_bytes: bytes.byteLength,
      timestamp: now.toISOString(),
    })
  } catch (err) {
    console.error('backup-database error:', err)
    return Response.json({ ok: false, error: String(err) }, { status: 500 })
  }
})
