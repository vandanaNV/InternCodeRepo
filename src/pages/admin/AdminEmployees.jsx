import React, { useEffect, useState } from 'react'
import api from '../../api/client.js'
import { PageHead, EmptyState } from '../../components/UI.jsx'

const emptyForm = {
  name: '', email: '', mobile: '', department: '', designation: '',
  salary: '', joiningDate: '', password: '', role: 'ROLE_EMPLOYEE'
}

export default function AdminEmployees() {
  const [employees, setEmployees] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.get('/api/admin/employees').then((res) => setEmployees(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const runSearch = async (e) => {
    e.preventDefault()
    if (!search.trim()) return load()
    const res = await api.get('/api/admin/employees/search', { params: { name: search } })
    setEmployees(res.data)
  }

  const startAdd = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
  }

  const startEdit = (emp) => {
    setForm({
      name: emp.name || '', email: emp.email || '', mobile: emp.mobile || '',
      department: emp.department || '', designation: emp.designation || '',
      salary: emp.salary ?? '', joiningDate: emp.joiningDate || '',
      password: '', role: 'ROLE_EMPLOYEE'
    })
    setEditingId(emp.id)
    setShowForm(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    setMessage('')
    try {
      if (editingId) {
        await api.put(`/api/admin/employees/${editingId}`, {
          ...form,
          salary: form.salary ? Number(form.salary) : null
        })
        setMessage('Employee updated.')
      } else {
        await api.post('/api/admin/employees', { ...form, salary: form.salary ? Number(form.salary) : null })
        setMessage('Employee added.')
      }
      setShowForm(false)
      load()
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Something went wrong.')
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this employee?')) return
    await api.delete(`/api/admin/employees/${id}`)
    load()
  }

  return (
    <div>
      <PageHead eyebrow="Admin" title="Employees" sub="Add, edit, search, and remove employee records." />

      <div className="card" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <form onSubmit={runSearch} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 240 }}>
            <input
              placeholder="Search by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, padding: '9px 11px', border: '1px solid var(--line)', borderRadius: 8 }}
            />
            <button className="btn btn-outline" type="submit">Search</button>
          </form>
          <button className="btn btn-gold" onClick={startAdd}>+ Add Employee</button>
        </div>
      </div>

      {message && <div className="login-error" style={{ background: '#DCEAE8', color: '#2F6F6B' }}>{message}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="section-title">{editingId ? 'Edit Employee' : 'New Employee'}</div>
          <form onSubmit={submit}>
            <div className="grid grid-2">
              <div className="field"><label>Full name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="field"><label>Email</label><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="field"><label>Mobile</label><input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} /></div>
              <div className="field"><label>Department</label><input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
              <div className="field"><label>Designation</label><input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} /></div>
              <div className="field"><label>Salary</label><input type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} /></div>
              <div className="field"><label>Joining date</label><input type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} /></div>
              {!editingId && (
                <>
                  <div className="field"><label>Login password</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
                  <div className="field">
                    <label>Role</label>
                    <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                      <option value="ROLE_EMPLOYEE">Employee</option>
                      <option value="ROLE_MANAGER">Manager</option>
                    </select>
                  </div>
                </>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" type="submit">{editingId ? 'Save changes' : 'Add employee'}</button>
              <button className="btn btn-outline" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="section-title">All Employees <span className="count">{employees.length}</span></div>
        {loading ? <EmptyState text="Loading…" /> : employees.length === 0 ? <EmptyState text="No employees found." /> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Department</th><th>Designation</th><th>Email</th><th>Salary</th><th></th></tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.name}</td>
                    <td>{emp.department || '—'}</td>
                    <td>{emp.designation || '—'}</td>
                    <td>{emp.email}</td>
                    <td>{emp.salary != null ? `₹${emp.salary}` : '—'}</td>
                    <td className="row-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => startEdit(emp)}>Edit</button>
                      <button className="btn btn-reject btn-sm" onClick={() => remove(emp.id)}>Delete</button>
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
