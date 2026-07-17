import React, { useEffect, useState } from 'react'
import api from '../../api/client.js'
import { PageHead, EmptyState } from '../../components/UI.jsx'

export default function EmployeeRatings() {
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/employee/ratings').then((res) => setRatings(res.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <PageHead eyebrow="Employee" title="Ratings" sub="Performance ratings given by your manager." />
      <div className="card">
        <div className="section-title">Ratings <span className="count">{ratings.length}</span></div>
        {loading ? <EmptyState text="Loading…" /> : ratings.length === 0 ? <EmptyState text="No ratings yet." /> : (
          <div className="grid grid-2">
            {ratings.map((r) => (
              <div key={r.id} className="card" style={{ boxShadow: 'none', background: '#FBF9F4' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--gold)' }}>{r.rating} / 5</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.date}</span>
                </div>
                <div style={{ fontSize: 13.5 }}>{r.comment}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>— {r.ratedBy?.name || 'Manager'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
