import React, { useEffect, useState } from 'react'
import api from '../../api/client.js'
import { PageHead, EmptyState } from '../../components/UI.jsx'

export default function ManagerUpdates() {
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/manager/daily-updates').then((res) => setUpdates(res.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <PageHead eyebrow="Manager" title="Daily Updates" sub="What your team has been working on, day by day." />
      <div className="card">
        <div className="section-title">Updates <span className="count">{updates.length}</span></div>
        {loading ? <EmptyState text="Loading…" /> : updates.length === 0 ? <EmptyState text="No daily updates submitted yet." /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Employee</th><th>Date</th><th>Update</th></tr></thead>
              <tbody>
                {updates.map((u) => (
                  <tr key={u.id}><td>{u.employee?.name}</td><td>{u.date}</td><td>{u.updateText}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
