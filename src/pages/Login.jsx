import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info] = useState(location.state?.resetSuccess ? 'Password reset. Sign in with your new password.' : '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const u = await login(username, password)
      if (u.role === 'ROLE_ADMIN') navigate('/admin')
      else if (u.role === 'ROLE_MANAGER') navigate('/manager')
      else navigate('/employee')
    } catch (err) {
      setError(err?.response?.data?.error || 'Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-aside">
        <div className="mark">EMS · Ledger</div>
        <div className="ledger-quote">
          Every punch in,<br />
          every leave,<br />
          <span>one open book.</span>
        </div>
        <div className="foot-note">Employee Management System — Admin · Manager · Employee</div>
      </div>
      <div className="login-main">
        <div className="login-card">
          <h2>Sign in</h2>
          <div className="sub">Enter your credentials to access your dashboard.</div>

          {info && <div className="login-error" style={{ background: '#DCEAE8', color: '#2F6F6B' }}>{info}</div>}
          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin"
                autoFocus
                required
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div style={{ textAlign: 'right', marginBottom: 14, marginTop: -6 }}>
              <Link to="/forgot-password" style={{ fontSize: 12.5, color: 'var(--teal)' }}>Forgot password?</Link>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px' }} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="demo-creds">
            <b>Demo accounts</b><br />
            Admin — admin / admin123<br />
            Manager — manager / manager123
          </div>
        </div>
      </div>
    </div>
  )
}
