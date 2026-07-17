import React, { useEffect, useState } from 'react'
import api from '../../api/client.js'
import { PageHead, EmptyState } from '../../components/UI.jsx'

const successStyle = { background: '#DCEAE8', color: '#2F6F6B' }
const errorStyle = undefined // falls back to default .login-error styling

const emptyForm = { name: '', date: '', description: '' }

function daysUntil(dateStr) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.round((target - today) / (1000 * 60 * 60 * 24))
}

export default function AdminHolidays() {
  const [holidays, setHolidays] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [msg, setMsg] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/api/holidays').then((res) => setHolidays(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  const startEdit = (h) => {
    setEditingId(h.id)
    setForm({ name: h.name, date: h.date, description: h.description || '' })
    setMsg(null)
  }

  const submit = async (e) => {
    e.preventDefault()
    setMsg(null)
    setSaving(true)
    try {
      if (editingId) {
        await api.put(`/api/admin/holidays/${editingId}`, form)
        setMsg({ text: 'Holiday updated.', type: 'success' })
      } else {
        await api.post('/api/admin/holidays', form)
        setMsg({ text: 'Holiday added.', type: 'success' })
      }
      resetForm()
      load()
    } catch (err) {
      setMsg({ text: err.response?.data?.error || 'Could not save holiday.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this holiday?')) return
    await api.delete(`/api/admin/holidays/${id}`)
    if (editingId === id) resetForm()
    load()
  }

  const upcoming = holidays.filter((h) => daysUntil(h.date) >= 0)
  const nextHoliday = upcoming[0]

  return (
    <div>
      <PageHead eyebrow="Admin" title="Holiday Calendar" sub="Manage the company-wide holiday list. Punch-in is automatically disabled on these dates." />

      {nextHoliday && (
        <div className="card" style={{ marginBottom: 16, background: '#FFF6E5', border: '1px solid #F0D9A6' }}>
          <strong>Upcoming:</strong> {nextHoliday.name} on {nextHoliday.date}
          {' '}({daysUntil(nextHoliday.date) === 0 ? 'today' : `in ${daysUntil(nextHoliday.date)} day${daysUntil(nextHoliday.date) === 1 ? '' : 's'}`})
        </div>
      )}

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="section-title">{editingId ? 'Edit Holiday' : 'Add Holiday'}</div>
        {msg && <div className="login-error" style={msg.type === 'success' ? successStyle : errorStyle}>{msg.text}</div>}
        <form onSubmit={submit} style={{ display: 'grid', gap: 12, gridTemplateColumns: '1.2fr 1fr 1.5fr auto', alignItems: 'end' }}>
          <div className="field">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Diwali" required />
          </div>
          <div className="field">
            <label>Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </div>
          <div className="field">
            <label>Description (optional)</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Notes" />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Update' : 'Add'}</button>
            {editingId && <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="card">
        <div className="section-title">All Holidays <span className="count">{holidays.length}</span></div>
        {loading ? <EmptyState text="Loading…" /> : holidays.length === 0 ? <EmptyState text="No holidays added yet." /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Date</th><th>Description</th><th></th></tr></thead>
              <tbody>
                {holidays.map((h) => (
                  <tr key={h.id}>
                    <td>{h.name}</td>
                    <td>{h.date}</td>
                    <td>{h.description || '—'}</td>
                    <td className="row-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => startEdit(h)}>Edit</button>
                      <button className="btn btn-reject btn-sm" onClick={() => remove(h.id)}>Delete</button>
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
