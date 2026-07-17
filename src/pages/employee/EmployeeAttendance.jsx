import React, { useEffect, useState } from 'react'
import api from '../../api/client.js'
import { PageHead, EmptyState, StatusBadge } from '../../components/UI.jsx'

function todayStr() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function formatTime(t) {
  return t ? t.slice(0, 5) : null
}

const successStyle = { background: '#DCEAE8', color: '#2F6F6B' }

export default function EmployeeAttendance() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [punchLoading, setPunchLoading] = useState(false)
  const [punchMsg, setPunchMsg] = useState(null)

  const [regRows, setRegRows] = useState([])
  const [regForm, setRegForm] = useState({ date: '', requestedPunchIn: '', requestedPunchOut: '', reason: '' })
  const [regMsg, setRegMsg] = useState(null)
  const [regSubmitting, setRegSubmitting] = useState(false)

  const today = todayStr()
  const todayRecord = rows.find((a) => a.date === today)

  const loadAttendance = () =>
    api.get('/api/employee/attendance').then((res) => setRows(res.data))

  const loadRegularizations = () =>
    api.get('/api/employee/regularization').then((res) => setRegRows(res.data))

  useEffect(() => {
    Promise.all([loadAttendance(), loadRegularizations()]).finally(() => setLoading(false))
  }, [])

  const punchIn = async () => {
    setPunchMsg(null)
    setPunchLoading(true)
    try {
      await api.post('/api/employee/punch-in')
      await loadAttendance()
      setPunchMsg({ text: 'Punched in. Have a good day!', type: 'success' })
    } catch (err) {
      setPunchMsg({ text: err.response?.data?.error || 'Could not punch in.', type: 'error' })
    } finally {
      setPunchLoading(false)
    }
  }

  const punchOut = async () => {
    setPunchMsg(null)
    setPunchLoading(true)
    try {
      await api.post('/api/employee/punch-out')
      await loadAttendance()
      setPunchMsg({ text: 'Punched out. See you tomorrow!', type: 'success' })
    } catch (err) {
      setPunchMsg({ text: err.response?.data?.error || 'Could not punch out.', type: 'error' })
    } finally {
      setPunchLoading(false)
    }
  }

  const submitRegularization = async (e) => {
    e.preventDefault()
    setRegMsg(null)
    setRegSubmitting(true)
    try {
      await api.post('/api/employee/regularization', regForm)
      setRegMsg({ text: 'Regularization request submitted for approval.', type: 'success' })
      setRegForm({ date: '', requestedPunchIn: '', requestedPunchOut: '', reason: '' })
      await loadRegularizations()
    } catch (err) {
      setRegMsg({ text: err.response?.data?.error || 'Could not submit request.', type: 'error' })
    } finally {
      setRegSubmitting(false)
    }
  }

  return (
    <div>
      <PageHead eyebrow="Employee" title="Attendance" sub="Punch in / out, view your history, and request corrections for past days." />

      <div className="card">
        <div className="section-title">Today — {today}</div>
        {punchMsg && <div className="login-error" style={punchMsg.type === 'success' ? successStyle : undefined}>{punchMsg.text}</div>}
        <div className="punch-row">
          <div className="punch-status">
            <div><span className="punch-label">Punch In</span><strong>{formatTime(todayRecord?.punchIn) || 'Not yet'}</strong></div>
            <div><span className="punch-label">Punch Out</span><strong>{formatTime(todayRecord?.punchOut) || 'Not yet'}</strong></div>
          </div>
          <div className="punch-actions">
            <button className="btn btn-gold" disabled={!!todayRecord?.punchIn || punchLoading} onClick={punchIn}>Punch In</button>
            <button className="btn btn-primary" disabled={!todayRecord?.punchIn || !!todayRecord?.punchOut || punchLoading} onClick={punchOut}>Punch Out</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">History <span className="count">{rows.length}</span></div>
        {loading ? <EmptyState text="Loading…" /> : rows.length === 0 ? <EmptyState text="No attendance records yet." /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Punch In</th><th>Punch Out</th><th>Status</th></tr></thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id}>
                    <td>{a.date}</td><td>{formatTime(a.punchIn) || '—'}</td><td>{formatTime(a.punchOut) || '—'}</td>
                    <td><StatusBadge value={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="section-title">Request Regularization</div>
          {regMsg && <div className="login-error" style={regMsg.type === 'success' ? successStyle : undefined}>{regMsg.text}</div>}
          <form onSubmit={submitRegularization}>
            <div className="field"><label>Date</label><input type="date" required max={today} value={regForm.date} onChange={(e) => setRegForm({ ...regForm, date: e.target.value })} /></div>
            <div className="field"><label>Correct punch in</label><input type="time" value={regForm.requestedPunchIn} onChange={(e) => setRegForm({ ...regForm, requestedPunchIn: e.target.value })} /></div>
            <div className="field"><label>Correct punch out</label><input type="time" value={regForm.requestedPunchOut} onChange={(e) => setRegForm({ ...regForm, requestedPunchOut: e.target.value })} /></div>
            <div className="field"><label>Reason</label><textarea required placeholder="e.g. forgot to punch out, biometric down…" value={regForm.reason} onChange={(e) => setRegForm({ ...regForm, reason: e.target.value })} /></div>
            <button className="btn btn-gold" type="submit" disabled={regSubmitting}>Submit request</button>
          </form>
        </div>

        <div className="card">
          <div className="section-title">My Regularization Requests <span className="count">{regRows.length}</span></div>
          {regRows.length === 0 ? <EmptyState text="No requests yet." /> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Date</th><th>In</th><th>Out</th><th>Status</th></tr></thead>
                <tbody>
                  {regRows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.date}</td><td>{formatTime(r.requestedPunchIn) || '—'}</td><td>{formatTime(r.requestedPunchOut) || '—'}</td>
                      <td><StatusBadge value={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
