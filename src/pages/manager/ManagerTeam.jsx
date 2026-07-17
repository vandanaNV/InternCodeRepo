import React, { useEffect, useState } from 'react'
import api from '../../api/client.js'
import { PageHead, EmptyState, Avatar } from '../../components/UI.jsx'

export default function ManagerTeam() {
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', dueDate: '', assignedToId: '' })
  const [ratingForm, setRatingForm] = useState({ employeeId: '', rating: 5, comment: '' })
  const [message, setMessage] = useState('')

  const load = () => {
    setLoading(true)
    api.get('/api/manager/team').then((res) => setTeam(res.data.team || [])).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const assignTask = async (e) => {
    e.preventDefault()
    setMessage('')
    try {
      await api.post('/api/manager/assign-task', { ...taskForm, assignedToId: Number(taskForm.assignedToId) })
      setMessage('Task assigned.')
      setTaskForm({ title: '', description: '', dueDate: '', assignedToId: '' })
    } catch { setMessage('Could not assign task.') }
  }

  const giveRating = async (e) => {
    e.preventDefault()
    setMessage('')
    try {
      await api.post('/api/manager/give-rating', { ...ratingForm, employeeId: Number(ratingForm.employeeId), rating: Number(ratingForm.rating) })
      setMessage('Rating submitted.')
      setRatingForm({ employeeId: '', rating: 5, comment: '' })
    } catch { setMessage('Could not submit rating.') }
  }

  return (
    <div>
      <PageHead eyebrow="Manager" title="My Team" sub="Your direct reports, plus quick task assignment and ratings." />
      {message && <div className="login-error" style={{ background: '#DCEAE8', color: '#2F6F6B' }}>{message}</div>}

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="section-title">Team Members <span className="count">{team.length}</span></div>
        {loading ? <EmptyState text="Loading…" /> : team.length === 0 ? <EmptyState text="No team members assigned yet." /> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {team.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-[10px] border border-line p-3">
                <Avatar name={m.name} size={40} />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-ink truncate">{m.name}</div>
                  <div className="text-xs text-text-muted truncate">{m.designation || '—'} · {m.department || '—'}</div>
                  <div className="text-[11px] text-text-muted truncate">{m.email}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="section-title">Assign Task</div>
          <form onSubmit={assignTask}>
            <div className="field"><label>Title</label><input required value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} /></div>
            <div className="field"><label>Description</label><textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} /></div>
            <div className="field"><label>Due date</label><input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} /></div>
            <div className="field">
              <label>Assign to</label>
              <select required value={taskForm.assignedToId} onChange={(e) => setTaskForm({ ...taskForm, assignedToId: e.target.value })}>
                <option value="">Select team member…</option>
                {team.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <button className="btn btn-gold" type="submit">Assign</button>
          </form>
        </div>

        <div className="card">
          <div className="section-title">Give Rating</div>
          <form onSubmit={giveRating}>
            <div className="field">
              <label>Employee</label>
              <select required value={ratingForm.employeeId} onChange={(e) => setRatingForm({ ...ratingForm, employeeId: e.target.value })}>
                <option value="">Select team member…</option>
                {team.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Rating (1–5)</label>
              <select value={ratingForm.rating} onChange={(e) => setRatingForm({ ...ratingForm, rating: e.target.value })}>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="field"><label>Comment</label><textarea value={ratingForm.comment} onChange={(e) => setRatingForm({ ...ratingForm, comment: e.target.value })} /></div>
            <button className="btn btn-primary" type="submit">Submit rating</button>
          </form>
        </div>
      </div>
    </div>
  )
}
