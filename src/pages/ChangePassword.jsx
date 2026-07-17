import React, { useState } from 'react'
import api from '../api/client.js'
import { PageHead } from '../components/UI.jsx'

const successStyle = { background: '#DCEAE8', color: '#2F6F6B' }

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setMsg(null)

    if (newPassword !== confirmPassword) {
      setMsg({ text: 'New passwords do not match.', type: 'error' })
      return
    }
    if (newPassword.length < 6) {
      setMsg({ text: 'New password should be at least 6 characters.', type: 'error' })
      return
    }

    setLoading(true)
    try {
      await api.post('/api/auth/change-password', { oldPassword, newPassword })
      setMsg({ text: 'Password changed successfully.', type: 'success' })
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setMsg({ text: err.response?.data?.error || 'Could not change password.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHead eyebrow="Account" title="Change Password" sub="Update the password for your account." />
      <div className="card" style={{ maxWidth: 420 }}>
        {msg && <div className="login-error" style={msg.type === 'success' ? successStyle : undefined}>{msg.text}</div>}
        <form onSubmit={submit}>
          <div className="field">
            <label>Current password</label>
            <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <div className="field">
            <label>New password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <div className="field">
            <label>Confirm new password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button className="btn btn-gold" type="submit" disabled={loading}>
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}
