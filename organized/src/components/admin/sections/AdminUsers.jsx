import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { SectionHead, Card, XTable, CenterSpinner, fmt, timeAgo } from '../AdminShared'

export default function AdminUsers() {
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('workspaces')
        .select('id, name, slug, created_at, owner_id')
        .order('created_at', { ascending: false })
      setWorkspaces(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <CenterSpinner />

  return (
    <div>
      <SectionHead
        tag="Platform Data"
        title="Workspaces"
        sub={`${fmt(workspaces.length)} total workspaces`}
      />

      <Card title="All Workspaces" meta={`${workspaces.length} total`}>
        <XTable
          cols={['Name', 'Slug', 'Owner ID', 'Created']}
          empty="No workspaces found"
          rows={workspaces.map(w => (
            <tr key={w.id}>
              <td><strong>{w.name || '—'}</strong></td>
              <td style={{ fontFamily: 'monospace', fontSize: '.69rem', color: 'rgba(181,137,58,.7)' }}>
                {w.slug || '—'}
              </td>
              <td style={{ fontFamily: 'monospace', fontSize: '.65rem', color: 'rgba(240,236,228,.25)' }}>
                {w.owner_id ? `${w.owner_id.slice(0, 8)}…` : '—'}
              </td>
              <td>{timeAgo(w.created_at)}</td>
            </tr>
          ))}
        />
      </Card>
    </div>
  )
}
