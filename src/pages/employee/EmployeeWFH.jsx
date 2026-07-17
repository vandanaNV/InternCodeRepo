import React, { useState } from 'react'
import api from '../../api/client.js'
import { PageHead } from '../../components/UI.jsx'

export default function EmployeeWFH() {
  const [form, setForm] = useState({ date: '', reason: '' })
  const [message, setMessage] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setMessage('')
    try {
      await api.post('/api/employee/wfh', form)
      setMessage('WFH request submitted.')
      setForm({ date: '', reason: '' })
    } catch {
      setMessage('Could not submit WFH request.')
    }
  }

  return (
    <div>
      <PageHead eyebrow="Employee" title="Work From Home" sub="Request to work remotely for a specific day." />
      <div className="card" style={{ maxWidth: 480 }}>
        {message && <div className="login-error" style={{ background: '#DCEAE8', color: '#2F6F6B' }}>{message}</div>}
        <form onSubmit={submit}>
          <div className="field"><label>Date</label><input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div className="field"><label>Reason</label><textarea required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
          <button className="btn btn-gold" type="submit">Submit request</button>
        </form>
      </div>
    </div>
  )
}
