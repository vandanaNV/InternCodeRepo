import React, { useEffect, useState } from 'react'
import api from '../../api/client.js'
import { PageHead, EmptyState, Avatar } from '../../components/UI.jsx'
import { UserPlus, Users } from 'lucide-react'

export default function AdminTeams() {
  const [teams, setTeams] = useState([])
  const [employees, setEmployees] = useState([])
  const [managers, setManagers] = useState([])
  const [assignForm, setAssignForm] = useState({ employeeId: '', managerId: '' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get('/api/admin/teams'),
      api.get('/api/admin/employees'),
      api.get('/api/admin/managers')
    ]).then(([t, e, m]) => {
      setTeams(t.data)
      setEmployees(e.data)
      setManagers(m.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const assign = async (e) => {
    e.preventDefault()
    if (!assignForm.employeeId || !assignForm.managerId) return
    await api.post('/api/admin/assign-manager', {
      employeeId: Number(assignForm.employeeId),
      managerId: Number(assignForm.managerId)
    })
    setMessage('Manager assigned.')
    setAssignForm({ employeeId: '', managerId: '' })
    load()
  }

  return (
    <div>
      <PageHead eyebrow="Admin" title="Teams" sub="See manager-wise teams and assign employees to managers." />

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="section-title flex items-center gap-2"><UserPlus size={14} /> Assign Manager</div>
        {message && <div className="login-error" style={{ background: '#DCEAE8', color: '#2F6F6B' }}>{message}</div>}
        <form onSubmit={assign} className="grid grid-3" style={{ alignItems: 'end' }}>
          <div className="field">
            <label>Employee</label>
            <select value={assignForm.employeeId} onChange={(e) => setAssignForm({ ...assignForm, employeeId: e.target.value })}>
              <option value="">Select employee…</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Manager</label>
            <select value={assignForm.managerId} onChange={(e) => setAssignForm({ ...assignForm, managerId: e.target.value })}>
              <option value="">Select manager…</option>
              {managers.map((m) => m.employee && <option key={m.employee.id} value={m.employee.id}>{m.employee.name}</option>)}
            </select>
          </div>
          <button className="btn btn-gold" type="submit" style={{ marginBottom: 14 }}>Assign</button>
        </form>
      </div>

      <div className="card">
        <div className="section-title">Teams <span className="count">{teams.length}</span></div>
        {loading ? <EmptyState text="Loading…" /> : teams.length === 0 ? <EmptyState text="No teams yet." /> : (
          <div className="grid md:grid-cols-2 gap-4">
            {teams.map((t, idx) => (
              <div key={idx} className="rounded-[10px] border border-line bg-[#FBF9F4] p-4">
                <div className="flex items-center gap-3 pb-3 mb-3 border-b border-line">
                  <Avatar name={t.manager?.name} size={40} />
                  <div className="min-w-0">
                    <div className="font-display font-bold text-ink truncate">{t.manager?.name}</div>
                    <div className="text-xs text-text-muted flex items-center gap-1"><Users size={11} /> {t.team?.length || 0} team member{t.team?.length === 1 ? '' : 's'}</div>
                  </div>
                </div>
                {t.team?.length === 0 ? (
                  <div className="text-sm text-text-muted py-2">No team members yet.</div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {t.team.map((mem) => (
                      <div key={mem.id} className="flex items-center gap-2 rounded-[8px] bg-paper-card border border-line p-2">
                        <Avatar name={mem.name} size={30} />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-ink truncate">{mem.name}</div>
                          <div className="text-[11px] text-text-muted truncate">{mem.designation || 'N/A'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
