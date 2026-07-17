import React, { useState } from 'react'
import api from '../../api/client.js'
import { PageHead } from '../../components/UI.jsx'

export default function EmployeeLeave() {
  const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' })
  const [updateText, setUpdateText] = useState('')
  const [message, setMessage] = useState('')
  const [updateMessage, setUpdateMessage] = useState('')

  const applyLeave = async (e) => {
    e.preventDefault()
    setMessage('')
    try {
      await api.post('/api/employee/leave', form)
      setMessage('Leave request submitted.')
      setForm({ startDate: '', endDate: '', reason: '' })
    } catch {
      setMessage('Could not submit leave request.')
    }
  }

  const submitUpdate = async (e) => {
    e.preventDefault()
    setUpdateMessage('')
    try {
      await api.post('/api/employee/daily-update', { updateText })
      setUpdateMessage('Daily update saved.')
      setUpdateText('')
    } catch {
      setUpdateMessage('Could not save update.')
    }
  }

  return (
    <div>
      <PageHead eyebrow="Employee" title="Leave" sub="Apply for leave and submit your daily work update." />
      <div className="grid grid-2">
        <div className="card">
          <div className="section-title">Apply for Leave</div>
          {message && <div className="login-error" style={{ background: '#DCEAE8', color: '#2F6F6B' }}>{message}</div>}
          <form onSubmit={applyLeave}>
            <div className="field"><label>Start date</label><input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
            <div className="field"><label>End date</label><input type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
            <div className="field"><label>Reason</label><textarea required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
            <button className="btn btn-gold" type="submit">Submit request</button>
          </form>
        </div>

        <div className="card">
          <div className="section-title">Daily Update</div>
          {updateMessage && <div className="login-error" style={{ background: '#DCEAE8', color: '#2F6F6B' }}>{updateMessage}</div>}
          <form onSubmit={submitUpdate}>
            <div className="field">
              <label>What did you work on today?</label>
              <textarea required value={updateText} onChange={(e) => setUpdateText(e.target.value)} placeholder="Briefly describe today's work…" />
            </div>
            <button className="btn btn-primary" type="submit">Save update</button>
          </form>
        </div>
      </div>
    </div>
  )
}
