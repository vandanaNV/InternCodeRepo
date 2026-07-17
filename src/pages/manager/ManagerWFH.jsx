import React, { useEffect, useState } from 'react'
import api from '../../api/client.js'
import { PageHead, EmptyState, StatusBadge } from '../../components/UI.jsx'

export default function ManagerWFH() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.get('/api/manager/wfh').then((res) => setItems(res.data)).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const act = async (id, action) => {
    await api.put(`/api/manager/wfh/${id}/${action}`)
    load()
  }

  return (
    <div>
      <PageHead eyebrow="Manager" title="Work From Home Requests" sub="Approve or reject WFH requests from your team." />
      <div className="card">
        <div className="section-title">Requests <span className="count">{items.length}</span></div>
        {loading ? <EmptyState text="Loading…" /> : items.length === 0 ? <EmptyState text="No WFH requests from your team." /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Employee</th><th>Date</th><th>Reason</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {items.map((w) => (
                  <tr key={w.id}>
                    <td>{w.employee?.name}</td><td>{w.date}</td><td>{w.reason}</td>
                    <td><StatusBadge value={w.status} /></td>
                    <td className="row-actions">
                      {w.status === 'PENDING' ? (
                        <>
                          <button className="btn btn-approve btn-sm" onClick={() => act(w.id, 'approve')}>Approve</button>
                          <button className="btn btn-reject btn-sm" onClick={() => act(w.id, 'reject')}>Reject</button>
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
