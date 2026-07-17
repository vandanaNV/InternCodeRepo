import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, UserCog, CalendarClock, ClipboardCheck, PartyPopper, Building2, UserPlus, CalendarPlus, FileSpreadsheet, Home } from 'lucide-react'
import api from '../../api/client.js'
import { StatCard, QuickLink } from '../../components/UI.jsx'

function greeting(hour) {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good night'
}

const BAR_COLORS = ['bg-gold', 'bg-teal', 'bg-ink', 'bg-red', 'bg-gold-soft']

export default function AdminOverview() {
  const [employees, setEmployees] = useState([])
  const [managers, setManagers] = useState([])
  const [leaves, setLeaves] = useState([])
  const [wfh, setWfh] = useState([])
  const [regularizations, setRegularizations] = useState([])
  const [holiday, setHoliday] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/api/admin/employees'),
      api.get('/api/admin/managers'),
      api.get('/api/admin/leaves'),
      api.get('/api/admin/wfh'),
      api.get('/api/admin/regularization'),
      api.get('/api/holidays/upcoming'),
    ]).then(([e, m, l, w, r, h]) => {
      setEmployees(e.data || [])
      setManagers(m.data || [])
      setLeaves(l.data || [])
      setWfh(w.data || [])
      setRegularizations(r.data || [])
      setHoliday((h.data || [])[0] || null)
    }).catch(() => setError('Could not load some dashboard data.'))
      .finally(() => setLoading(false))
  }, [])

  const deptBreakdown = useMemo(() => {
    const counts = {}
    employees.forEach((e) => {
      const dept = e.department || 'Unassigned'
      counts[dept] = (counts[dept] || 0) + 1
    })
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
    const max = entries.length ? entries[0][1] : 1
    return entries.map(([dept, count], i) => ({ dept, count, pct: Math.max(6, Math.round((count / max) * 100)), color: BAR_COLORS[i % BAR_COLORS.length] }))
  }, [employees])

  const pendingLeaves = leaves.filter((l) => l.status === 'PENDING').length
  const pendingWfh = wfh.filter((w) => w.status === 'PENDING').length
  const pendingReg = regularizations.filter((r) => r.status === 'PENDING').length
  const now = new Date()

  return (
    <div>
      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-6">
        <div>
          <div className="eyebrow">Admin</div>
          <h1 className="font-display text-3xl font-bold text-ink">{greeting(now.getHours())}</h1>
          <p className="text-text-muted text-sm mt-1">Organization-wide snapshot, one open book.</p>
        </div>
      </div>

      {error && <div className="login-error mb-4">{error}</div>}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
        <StatCard icon={Users} label="Total employees" value={loading ? '—' : employees.length} accent="ink" />
        <StatCard icon={UserCog} label="Managers" value={loading ? '—' : managers.length} accent="teal" />
        <StatCard icon={CalendarClock} label="Pending leaves" value={loading ? '—' : pendingLeaves} sub={`${leaves.length} total`} accent="gold" />
        <StatCard icon={Home} label="Pending WFH" value={loading ? '—' : pendingWfh} sub={`${wfh.length} total`} accent="teal" />
        <StatCard icon={ClipboardCheck} label="Regularizations" value={loading ? '—' : pendingReg} sub="awaiting review" accent="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 rounded-[10px] bg-paper-card border border-line p-5 shadow-[0_1px_2px_rgba(20,24,31,0.06),0_8px_24px_rgba(20,24,31,0.06)]">
          <div className="flex items-center gap-2 section-title">
            <Building2 size={14} /> Headcount by department
          </div>
          {deptBreakdown.length === 0 ? (
            <div className="text-sm text-text-muted py-6 text-center">No employees yet.</div>
          ) : (
            <div className="space-y-3 mt-2">
              {deptBreakdown.map((d) => (
                <div key={d.dept} className="flex items-center gap-3">
                  <div className="w-28 shrink-0 text-sm font-medium text-ink truncate">{d.dept}</div>
                  <div className="flex-1 h-2.5 rounded-full bg-line/60 overflow-hidden">
                    <div className={`h-full rounded-full ${d.color}`} style={{ width: `${d.pct}%` }} />
                  </div>
                  <div className="w-8 text-right text-sm font-semibold text-ink tabular-nums">{d.count}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[10px] bg-[#FFF6E5] border border-[#F0D9A6] p-5">
          <div className="flex items-center gap-2 mb-2">
            <PartyPopper size={18} className="text-gold" />
            <div className="font-display font-bold text-ink">Next holiday</div>
          </div>
          {holiday ? (
            <>
              <div className="text-lg font-semibold text-ink">{holiday.name}</div>
              <div className="text-sm text-text-muted mt-1">{holiday.date}</div>
            </>
          ) : (
            <div className="text-sm text-text-muted">No upcoming holidays on the calendar.</div>
          )}
          <Link to="/admin/holidays" className="inline-block mt-3 text-xs font-semibold text-teal hover:underline">Manage calendar →</Link>
        </div>
      </div>

      <div className="rounded-[10px] bg-paper-card border border-line p-5 shadow-[0_1px_2px_rgba(20,24,31,0.06),0_8px_24px_rgba(20,24,31,0.06)]">
        <div className="section-title">Quick actions</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-3">
          <QuickLink icon={UserPlus} label="Employees" sub={`${employees.length} total`} to="/admin/employees" accent="ink" />
          <QuickLink icon={CalendarClock} label="Leave Requests" sub={`${pendingLeaves} pending`} to="/admin/leaves" accent="gold" />
          <QuickLink icon={Home} label="WFH Requests" sub={`${pendingWfh} pending`} to="/admin/wfh" accent="teal" />
          <QuickLink icon={Users} label="Teams" sub="Manager assignments" to="/admin/teams" accent="ink" />
          <QuickLink icon={FileSpreadsheet} label="Attendance" sub="Reports & export" to="/admin/attendance" accent="red" />
        </div>
      </div>
    </div>
  )
}
