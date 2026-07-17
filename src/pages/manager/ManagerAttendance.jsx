import React, { useEffect, useState } from 'react'
import api from '../../api/client.js'
import { PageHead, EmptyState, StatusBadge } from '../../components/UI.jsx'

function formatTime(t) {
  return t ? t.slice(0, 5) : null
}

export default function ManagerAttendance() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const [regRows, setRegRows] = useState([])
  const [regLoading, setRegLoading] = useState(true)

  useEffect(() => {
    api.get('/api/manager/attendance').then((res) => setRows(res.data)).finally(() => setLoading(false))
  }, [])

  const loadRegularizations = () => {
    setRegLoading(true)
    api.get('/api/manager/regularization').then((res) => setRegRows(res.data)).finally(() => setRegLoading(false))
  }
  useEffect(() => { loadRegularizations() }, [])

  const act = async (id, action) => {
    await api.put(`/api/manager/regularization/${id}/${action}`)
    loadRegularizations()
    // an approval corrects the attendance record too, so refresh that list as well
    api.get('/api/manager/attendance').then((res) => setRows(res.data))
  }

  return (
    <div>
      <PageHead eyebrow="Manager" title="Team Attendance" sub="Punch in/out records for your team, and regularization requests awaiting your approval." />
      <div className="card">
        <div className="section-title">Records <span className="count">{rows.length}</span></div>
        {loading ? <EmptyState text="Loading…" /> : rows.length === 0 ? <EmptyState text="No attendance records yet." /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Employee</th><th>Date</th><th>Punch In</th><th>Punch Out</th><th>Status</th></tr></thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id}>
                    <td>{a.employee?.name}</td><td>{a.date}</td><td>{formatTime(a.punchIn) || '—'}</td><td>{formatTime(a.punchOut) || '—'}</td>
                    <td><StatusBadge value={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <div className="section-title">Regularization Requests <span className="count">{regRows.length}</span></div>
        {regLoading ? <EmptyState text="Loading…" /> : regRows.length === 0 ? <EmptyState text="No regularization requests from your team." /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Employee</th><th>Date</th><th>Requested In</th><th>Requested Out</th><th>Reason</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {regRows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.employee?.name}</td><td>{r.date}</td><td>{formatTime(r.requestedPunchIn) || '—'}</td><td>{formatTime(r.requestedPunchOut) || '—'}</td><td>{r.reason}</td>
                    <td><StatusBadge value={r.status} /></td>
                    <td className="row-actions">
                      {r.status === 'PENDING' ? (
                        <>
                          <button className="btn btn-approve btn-sm" onClick={() => act(r.id, 'approve')}>Approve</button>
                          <button className="btn btn-reject btn-sm" onClick={() => act(r.id, 'reject')}>Reject</button>
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
