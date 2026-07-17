import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ClipboardList, LogIn, LogOut, PartyPopper, Star, CalendarDays } from 'lucide-react'
import api from '../../api/client.js'
import { StatCard, QuickLink } from '../../components/UI.jsx'

function greeting(hour) {
  if (hour < 5) return 'Still up'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good night'
}

function fmtClock(d) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function fmtDate(d) {
  return d.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })
}

function fmtTime(t) {
  return t ? t.slice(0, 5) : null
}

export default function EmployeeOverview() {
  const [profile, setProfile] = useState(null)
  const [tasks, setTasks] = useState([])
  const [attendance, setAttendance] = useState([])
  const [holiday, setHoliday] = useState(null)
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)

  const [now, setNow] = useState(new Date())
  const [message, setMessage] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get('/api/employee/profile'),
      api.get('/api/employee/tasks'),
      api.get('/api/employee/attendance'),
      api.get('/api/holidays/upcoming'),
      api.get('/api/employee/ratings'),
    ]).then(([p, t, a, h, r]) => {
      setProfile(p.data)
      setTasks(t.data || [])
      setAttendance(a.data || [])
      setHoliday((h.data || [])[0] || null)
      setRatings(r.data || [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const todayStr = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }, [])

  const todayRecord = attendance.find((a) => a.date === todayStr)

  const monthStats = useMemo(() => {
    const prefix = todayStr.slice(0, 7)
    const thisMonth = attendance.filter((a) => a.date?.startsWith(prefix))
    return {
      present: thisMonth.filter((a) => a.status === 'PRESENT').length,
      absent: thisMonth.filter((a) => a.status === 'ABSENT').length,
      wfh: thisMonth.filter((a) => a.status === 'WFH').length,
    }
  }, [attendance, todayStr])

  const pendingTasks = tasks.filter((t) => t.status !== 'COMPLETED').length
  const latestRating = ratings[0]

  const punch = async (type) => {
    setBusy(true)
    setMessage(null)
    try {
      await api.post(`/api/employee/punch-${type}`)
      setMessage({ text: type === 'in' ? 'Punched in — have a good day.' : 'Punched out — see you tomorrow.', ok: true })
      load()
    } catch (err) {
      setMessage({ text: err?.response?.data?.error || 'Action failed.', ok: false })
    } finally {
      setBusy(false)
    }
  }

  const stampState = !todayRecord?.punchIn ? 'ready' : !todayRecord?.punchOut ? 'in' : 'done'

  return (
    <div>
      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-6">
        <div>
          <div className="eyebrow">Employee</div>
          <h1 className="font-display text-3xl font-bold text-ink">
            {greeting(now.getHours())}{profile ? `, ${profile.name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-text-muted text-sm mt-1">{fmtDate(now)}</p>
        </div>
        <div className="font-display text-2xl font-bold text-gold tabular-nums">{fmtClock(now)}</div>
      </div>

      {message && (
        <div className="login-error mb-4" style={message.ok ? { background: '#DCEAE8', color: '#2F6F6B' } : undefined}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4 mb-4">
        <div className="rounded-[10px] bg-ink text-[#EDE9DD] p-7 relative overflow-hidden shadow-[0_1px_2px_rgba(20,24,31,0.06),0_8px_24px_rgba(20,24,31,0.06)]">
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-gold/[0.08]" />
          <div className="absolute -right-4 top-16 w-24 h-24 rounded-full border border-gold/20" />
          <div className="relative flex items-center justify-between flex-wrap gap-6">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-gold font-semibold mb-2">Today's stamp</div>
              {stampState === 'ready' && <div className="text-lg">You haven't punched in yet.</div>}
              {stampState === 'in' && <div className="text-lg">Punched in at <b className="text-gold-soft">{fmtTime(todayRecord.punchIn)}</b> — still on the clock.</div>}
              {stampState === 'done' && <div className="text-lg">Done for the day: <b className="text-gold-soft">{fmtTime(todayRecord.punchIn)} → {fmtTime(todayRecord.punchOut)}</b></div>}
              <div className="flex gap-3 mt-5">
                <button
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold text-ink font-semibold text-sm disabled:opacity-40 hover:opacity-90 transition"
                  disabled={busy || stampState !== 'ready'}
                  onClick={() => punch('in')}
                >
                  <LogIn size={16} /> Punch In
                </button>
                <button
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#EDE9DD]/25 text-[#EDE9DD] font-semibold text-sm disabled:opacity-30 hover:bg-white/5 transition"
                  disabled={busy || stampState !== 'in'}
                  onClick={() => punch('out')}
                >
                  <LogOut size={16} /> Punch Out
                </button>
              </div>
            </div>
            <div className={`shrink-0 w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center rotate-[-8deg] ${stampState === 'done' ? 'border-teal text-teal' : stampState === 'in' ? 'border-gold text-gold' : 'border-[#EDE9DD]/20 text-[#EDE9DD]/40'}`}>
              <CheckCircle2 size={22} />
              <div className="text-[10px] uppercase tracking-wider font-bold mt-1">{stampState === 'ready' ? 'Pending' : stampState === 'in' ? 'Active' : 'Closed'}</div>
            </div>
          </div>
        </div>

        <div className="rounded-[10px] bg-paper-card border border-line p-6 shadow-[0_1px_2px_rgba(20,24,31,0.06),0_8px_24px_rgba(20,24,31,0.06)]">
          <div className="section-title">Your profile</div>
          {profile ? (
            <div className="space-y-2.5 text-sm mt-3">
              <div className="flex justify-between gap-3"><span className="text-text-muted">Department</span><span className="font-medium text-ink text-right">{profile.department || '—'}</span></div>
              <div className="flex justify-between gap-3"><span className="text-text-muted">Designation</span><span className="font-medium text-ink text-right">{profile.designation || '—'}</span></div>
              <div className="flex justify-between gap-3"><span className="text-text-muted">Email</span><span className="font-medium text-ink text-right truncate">{profile.email}</span></div>
              <div className="flex justify-between gap-3"><span className="text-text-muted">Mobile</span><span className="font-medium text-ink text-right">{profile.mobile || '—'}</span></div>
              <div className="flex justify-between gap-3"><span className="text-text-muted">Joined</span><span className="font-medium text-ink text-right">{profile.joiningDate || '—'}</span></div>
            </div>
          ) : <div className="text-text-muted text-sm">Loading…</div>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <StatCard icon={CheckCircle2} label="Present (month)" value={loading ? '—' : monthStats.present} accent="teal" />
        <StatCard icon={CalendarDays} label="Absent (month)" value={loading ? '—' : monthStats.absent} accent="red" />
        <StatCard icon={ClipboardList} label="Open tasks" value={loading ? '—' : pendingTasks} sub={`${tasks.length} total`} accent="gold" />
        <StatCard icon={Star} label="Latest rating" value={latestRating ? `${latestRating.rating}/5` : '—'} sub={latestRating ? `by ${latestRating.ratedBy?.name || 'Manager'}` : 'No ratings yet'} accent="ink" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 rounded-[10px] bg-paper-card border border-line p-5 shadow-[0_1px_2px_rgba(20,24,31,0.06),0_8px_24px_rgba(20,24,31,0.06)]">
          <div className="section-title">Quick links</div>
          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            <QuickLink icon={ClipboardList} label="My Tasks" sub={`${pendingTasks} open`} to="/employee/tasks" accent="gold" />
            <QuickLink icon={CalendarDays} label="Apply Leave" sub="Leave / WFH requests" to="/employee/leave" accent="teal" />
            <QuickLink icon={CheckCircle2} label="Attendance History" sub="Full punch log" to="/employee/attendance" accent="ink" />
            <QuickLink icon={Star} label="Ratings" sub={`${ratings.length} received`} to="/employee/ratings" accent="gold" />
          </div>
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
          <Link to="/employee/holidays" className="inline-block mt-3 text-xs font-semibold text-teal hover:underline">View full calendar →</Link>
        </div>
      </div>
    </div>
  )
}
