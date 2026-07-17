import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, CalendarClock, Home, ClipboardCheck, PartyPopper, ArrowRight } from 'lucide-react'
import api from '../../api/client.js'
import { StatCard, QuickLink, Avatar } from '../../components/UI.jsx'

function greeting(hour) {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good night'
}

export default function ManagerOverview() {
  const [manager, setManager] = useState(null)
  const [team, setTeam] = useState([])
  const [leaves, setLeaves] = useState([])
  const [wfh, setWfh] = useState([])
  const [regularizations, setRegularizations] = useState([])
  const [holiday, setHoliday] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/api/manager/dashboard'),
      api.get('/api/manager/team'),
      api.get('/api/manager/leaves'),
      api.get('/api/manager/wfh'),
      api.get('/api/manager/regularization'),
      api.get('/api/holidays/upcoming'),
    ]).then(([d, t, l, w, r, h]) => {
      setManager(d.data.manager)
      setTeam(t.data.team || [])
      setLeaves(l.data || [])
      setWfh(w.data || [])
      setRegularizations(r.data || [])
      setHoliday((h.data || [])[0] || null)
    }).finally(() => setLoading(false))
  }, [])

  const pendingLeaves = useMemo(() => leaves.filter((l) => l.status === 'PENDING'), [leaves])
  const pendingWfh = useMemo(() => wfh.filter((w) => w.status === 'PENDING'), [wfh])
  const pendingReg = useMemo(() => regularizations.filter((r) => r.status === 'PENDING'), [regularizations])
  const now = new Date()

  return (
    <div>
      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-6">
        <div>
          <div className="eyebrow">Manager</div>
          <h1 className="font-display text-3xl font-bold text-ink">
            {greeting(now.getHours())}{manager ? `, ${manager.name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-text-muted text-sm mt-1">Here's where your team stands today.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <StatCard icon={Users} label="Team size" value={loading ? '—' : team.length} accent="ink" />
        <StatCard icon={CalendarClock} label="Pending leaves" value={loading ? '—' : pendingLeaves.length} sub={`${leaves.length} total`} accent="gold" />
        <StatCard icon={Home} label="Pending WFH" value={loading ? '—' : pendingWfh.length} sub={`${wfh.length} total`} accent="teal" />
        <StatCard icon={ClipboardCheck} label="Regularizations" value={loading ? '—' : pendingReg.length} sub="awaiting your review" accent="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 rounded-[10px] bg-paper-card border border-line p-5 shadow-[0_1px_2px_rgba(20,24,31,0.06),0_8px_24px_rgba(20,24,31,0.06)]">
          <div className="flex items-center justify-between mb-3">
            <div className="section-title !mb-0">Your team</div>
            <Link to="/manager/team" className="text-xs font-semibold text-teal hover:underline flex items-center gap-1">See all <ArrowRight size={13} /></Link>
          </div>
          {team.length === 0 ? (
            <div className="text-sm text-text-muted py-6 text-center">No team members assigned yet.</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {team.slice(0, 6).map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-[10px] border border-line p-3">
                  <Avatar name={m.name} size={38} />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-ink truncate">{m.name}</div>
                    <div className="text-xs text-text-muted truncate">{m.designation || m.department || '—'}</div>
                  </div>
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
          <Link to="/manager/holidays" className="inline-block mt-3 text-xs font-semibold text-teal hover:underline">View full calendar →</Link>
        </div>
      </div>

      <div className="rounded-[10px] bg-paper-card border border-line p-5 shadow-[0_1px_2px_rgba(20,24,31,0.06),0_8px_24px_rgba(20,24,31,0.06)]">
        <div className="section-title">Quick actions</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
          <QuickLink icon={Users} label="My Team" sub={`${team.length} members`} to="/manager/team" accent="ink" />
          <QuickLink icon={CalendarClock} label="Leave Requests" sub={`${pendingLeaves.length} pending`} to="/manager/leaves" accent="gold" />
          <QuickLink icon={Home} label="WFH Requests" sub={`${pendingWfh.length} pending`} to="/manager/wfh" accent="teal" />
          <QuickLink icon={ClipboardCheck} label="Team Attendance" sub="Full log" to="/manager/attendance" accent="red" />
        </div>
      </div>
    </div>
  )
}
