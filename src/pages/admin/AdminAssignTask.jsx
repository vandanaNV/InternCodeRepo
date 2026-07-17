import React, { useEffect, useState } from 'react'
import api from '../../api/client.js'
import { PageHead } from '../../components/UI.jsx'

export default function AdminAssignTask() {
  const [employees, setEmployees] = useState([])
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', assignedToId: '' })
  const [message, setMessage] = useState('')

  useEffect(() => {
    api.get('/api/admin/employees').then((res) => setEmployees(res.data))
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setMessage('')
    try {
      await api.post('/api/admin/assign-task', { ...form, assignedToId: Number(form.assignedToId) })
      setMessage('Task assigned successfully.')
      setForm({ title: '', description: '', dueDate: '', assignedToId: '' })
    } catch {
      setMessage('Could not assign task.')
    }
  }

  return (
    <div>
      <PageHead eyebrow="Admin" title="Assign Task" sub="Create and assign a task directly to any employee." />
      <div className="card" style={{ maxWidth: 520 }}>
        {message && <div className="login-error" style={{ background: '#DCEAE8', color: '#2F6F6B' }}>{message}</div>}
        <form onSubmit={submit}>
          <div className="field">
            <label>Title</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="field">
            <label>Due date</label>
            <input type="date" required value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <div className="field">
            <label>Assign to</label>
            <select required value={form.assignedToId} onChange={(e) => setForm({ ...form, assignedToId: e.target.value })}>
              <option value="">Select employee…</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <button className="btn btn-gold" type="submit">Assign task</button>
        </form>
      </div>
    </div>
  )
}
