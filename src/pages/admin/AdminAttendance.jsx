import React, { useEffect, useState } from 'react'
import api from '../../api/client.js'
import { PageHead, EmptyState, StatusBadge } from '../../components/UI.jsx'

function formatTime(t) {
  return t ? t.slice(0, 5) : null
}

const successStyle = { background: '#DCEAE8', color: '#2F6F6B' }

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function yesterdayStr() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function AdminAttendance() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const [regRows, setRegRows] = useState([])
  const [regLoading, setRegLoading] = useState(true)

  const [closeDate, setCloseDate] = useState(yesterdayStr())
  const [closing, setClosing] = useState(false)
  const [closeMsg, setCloseMsg] = useState(null)

  const [exportFrom, setExportFrom] = useState('')
  const [exportTo, setExportTo] = useState('')
  const [exporting, setExporting] = useState(null) // 'excel' | 'pdf' | null
  const [exportMsg, setExportMsg] = useState(null)

  const loadAttendance = () =>
    api.get('/api/admin/attendance').then((res) => setRows(res.data))

  useEffect(() => {
    loadAttendance().finally(() => setLoading(false))
  }, [])

  const runCloseDay = async () => {
    setCloseMsg(null)
    setClosing(true)
    try {
      const res = await api.post('/api/admin/attendance/close-day', null, { params: { date: closeDate } })
      setCloseMsg({ text: res.data.message, type: 'success' })
      await loadAttendance()
    } catch (err) {
      setCloseMsg({ text: err.response?.data?.error || 'Could not close attendance for that date.', type: 'error' })
    } finally {
      setClosing(false)
    }
  }

  const downloadReport = async (format) => {
    setExportMsg(null)
    setExporting(format)
    try {
      const res = await api.get(`/api/admin/attendance/export/${format}`, {
        responseType: 'blob',
        params: {
          from: exportFrom || undefined,
          to: exportTo || undefined,
        },
      })
      const blob = new Blob([res.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `attendance-report.${format === 'excel' ? 'xlsx' : 'pdf'}`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setExportMsg({ text: 'Could not generate the report. Try again.', type: 'error' })
    } finally {
      setExporting(null)
    }
  }

  const loadRegularizations = () => {
    setRegLoading(true)
    api.get('/api/admin/regularization').then((res) => setRegRows(res.data)).finally(() => setRegLoading(false))
  }
  useEffect(() => { loadRegularizations() }, [])

  const act = async (id, action) => {
    await api.put(`/api/admin/regularization/${id}/${action}`)
    loadRegularizations()
    api.get('/api/admin/attendance').then((res) => setRows(res.data))
  }

  return (
    <div>
      <PageHead eyebrow="Admin" title="Attendance" sub="Company-wide attendance, and every regularization request — including a manager's own." />

      <div className="card">
        <div className="section-title">Close a Day's Attendance</div>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: -8, marginBottom: 12 }}>
          Runs automatically every night at 12:05 AM for the previous day. Use this to run it
          manually for a specific date — marks anyone with no record as Absent (skipping
          approved leave/WFH, holidays, and weekends), and flags anyone who punched in but
          never punched out as Missed Punch-out.
        </p>
        {closeDate === todayStr() && (
          <div className="login-error" style={{ background: '#FBE9CF', color: '#97600F' }}>
            Heads up: you picked today. Anyone still punched in (hasn't punched out yet) will
            be flagged Missed Punch-out right now, even if their shift isn't over. Pick a past
            date instead if you just want to test/demo this.
          </div>
        )}
        {closeMsg && <div className="login-error" style={closeMsg.type === 'success' ? successStyle : undefined}>{closeMsg.text}</div>}
        <div className="punch-row">
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Date</label>
            <input type="date" value={closeDate} max={todayStr()} onChange={(e) => setCloseDate(e.target.value)} />
          </div>
          <button className="btn btn-gold" disabled={closing} onClick={runCloseDay}>
            {closing ? 'Running…' : 'Close attendance for this date'}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="section-title">Download Attendance Report</div>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: -8, marginBottom: 12 }}>
          Leave both dates blank to export everything, or set a range for a specific period.
        </p>
        {exportMsg && <div className="login-error">{exportMsg.text}</div>}
        <div className="punch-row" style={{ flexWrap: 'wrap' }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>From</label>
            <input type="date" value={exportFrom} max={exportTo || todayStr()} onChange={(e) => setExportFrom(e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>To</label>
            <input type="date" value={exportTo} min={exportFrom} max={todayStr()} onChange={(e) => setExportTo(e.target.value)} />
          </div>
          <div className="punch-actions">
            <button className="btn btn-outline" disabled={exporting !== null} onClick={() => downloadReport('excel')}>
              {exporting === 'excel' ? 'Preparing…' : 'Download Excel'}
            </button>
            <button className="btn btn-gold" disabled={exporting !== null} onClick={() => downloadReport('pdf')}>
              {exporting === 'pdf' ? 'Preparing…' : 'Download PDF'}
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">Regularization Requests <span className="count">{regRows.length}</span></div>
        {regLoading ? <EmptyState text="Loading…" /> : regRows.length === 0 ? <EmptyState text="No regularization requests yet." /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Employee</th><th>Date</th><th>Requested In</th><th>Requested Out</th><th>Reason</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {regRows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.employee?.name || '—'}</td><td>{r.date}</td><td>{formatTime(r.requestedPunchIn) || '—'}</td><td>{formatTime(r.requestedPunchOut) || '—'}</td><td>{r.reason}</td>
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

      <div className="card">
        <div className="section-title">All Attendance <span className="count">{rows.length}</span></div>
        {loading ? <EmptyState text="Loading…" /> : rows.length === 0 ? <EmptyState text="No attendance records yet." /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Employee</th><th>Date</th><th>Punch In</th><th>Punch Out</th><th>Status</th></tr></thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id}>
                    <td>{a.employee?.name || '—'}</td><td>{a.date}</td><td>{formatTime(a.punchIn) || '—'}</td><td>{formatTime(a.punchOut) || '—'}</td>
                    <td><StatusBadge value={a.status} /></td>
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
