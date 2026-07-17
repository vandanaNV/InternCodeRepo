import React, { useEffect, useState } from 'react'
import api from '../api/client.js'
import { PageHead, EmptyState } from '../components/UI.jsx'

function daysUntil(dateStr) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.round((target - today) / (1000 * 60 * 60 * 24))
}

export default function Holidays() {
  const [holidays, setHolidays] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/holidays').then((res) => setHolidays(res.data)).finally(() => setLoading(false))
  }, [])

  const upcoming = holidays.filter((h) => daysUntil(h.date) >= 0)
  const nextHoliday = upcoming[0]

  return (
    <div>
      <PageHead eyebrow="Holidays" title="Holiday Calendar" sub="Company-wide holidays. Attendance punch-in is disabled on these dates." />

      {nextHoliday && (
        <div className="card" style={{ marginBottom: 16, background: '#FFF6E5', border: '1px solid #F0D9A6' }}>
          🎉 <strong>Next holiday:</strong> {nextHoliday.name} on {nextHoliday.date}
          {' '}({daysUntil(nextHoliday.date) === 0 ? 'today' : `in ${daysUntil(nextHoliday.date)} day${daysUntil(nextHoliday.date) === 1 ? '' : 's'}`})
        </div>
      )}

      <div className="card">
        <div className="section-title">All Holidays <span className="count">{holidays.length}</span></div>
        {loading ? <EmptyState text="Loading…" /> : holidays.length === 0 ? <EmptyState text="No holidays announced yet." /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Date</th><th>Description</th></tr></thead>
              <tbody>
                {holidays.map((h) => (
                  <tr key={h.id} style={daysUntil(h.date) < 0 ? { opacity: 0.55 } : undefined}>
                    <td>{h.name}</td>
                    <td>{h.date}</td>
                    <td>{h.description || '—'}</td>
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
