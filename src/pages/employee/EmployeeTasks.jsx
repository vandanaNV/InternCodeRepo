import React, { useEffect, useState } from 'react'
import api from '../../api/client.js'
import { PageHead, EmptyState, StatusBadge } from '../../components/UI.jsx'

export default function EmployeeTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.get('/api/employee/tasks').then((res) => setTasks(res.data)).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const updateStatus = async (id, status) => {
    await api.put(`/api/employee/tasks/${id}/status`, { status })
    load()
  }

  return (
    <div>
      <PageHead eyebrow="Employee" title="My Tasks" sub="Tasks assigned to you. Update status as you make progress." />
      <div className="card">
        <div className="section-title">Tasks <span className="count">{tasks.length}</span></div>
        {loading ? <EmptyState text="Loading…" /> : tasks.length === 0 ? <EmptyState text="No tasks assigned yet." /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Title</th><th>Description</th><th>Due</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.id}>
                    <td>{t.title}</td>
                    <td>{t.description}</td>
                    <td>{t.dueDate}</td>
                    <td><StatusBadge value={t.status} /></td>
                    <td>
                      <select value={t.status} onChange={(e) => updateStatus(t.id, e.target.value)} style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid var(--line)' }}>
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
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
