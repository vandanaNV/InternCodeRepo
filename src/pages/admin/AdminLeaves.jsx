import React, { useEffect, useState } from 'react'
import api from '../../api/client.js'
import { PageHead, EmptyState, StatusBadge } from '../../components/UI.jsx'

export default function AdminLeaves() {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.get('/api/admin/leaves').then((res) => setLeaves(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const act = async (id, action) => {
    await api.put(`/api/admin/leaves/${id}/${action}`)
    load()
  }

  return (
    <div>
      <PageHead eyebrow="Admin" title="Leave Requests" sub="Review and decide on every leave request in the company." />
      <div className="card">
        <div className="section-title">All Requests <span className="count">{leaves.length}</span></div>
        {loading ? <EmptyState text="Loading…" /> : leaves.length === 0 ? <EmptyState text="No leave requests yet." /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Employee</th><th>From</th><th>To</th><th>Reason</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {leaves.map((l) => (
                  <tr key={l.id}>
                    <td>{l.employee?.name || '—'}</td>
                    <td>{l.startDate}</td>
                    <td>{l.endDate}</td>
                    <td>{l.reason}</td>
                    <td><StatusBadge value={l.status} /></td>
                    <td className="row-actions">
                      {l.status === 'PENDING' ? (
                        <>
                          <button className="btn btn-approve btn-sm" onClick={() => act(l.id, 'approve')}>Approve</button>
                          <button className="btn btn-reject btn-sm" onClick={() => act(l.id, 'reject')}>Reject</button>
                        </>
                      ) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Decided</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
