import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client.js'

const successStyle = { background: '#DCEAE8', color: '#2F6F6B' }
const OTP_LENGTH = 6
const RESEND_SECONDS = 30

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1 = request otp, 2 = verify otp, 3 = set new password
  const [username, setUsername] = useState('')
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(''))
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const otpRefs = useRef([])
  const otp = otpDigits.join('')

  useEffect(() => {
    if (resendTimer <= 0) return
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000)
    return () => clearInterval(id)
  }, [resendTimer])

  const startResendTimer = () => setResendTimer(RESEND_SECONDS)

  const focusBox = (idx) => {
    const el = otpRefs.current[idx]
    if (el) el.focus()
  }

  const handleOtpChange = (idx, rawValue) => {
    const digits = rawValue.replace(/\D/g, '')
    if (!digits) {
      const next = [...otpDigits]
      next[idx] = ''
      setOtpDigits(next)
      return
    }
    const next = [...otpDigits]
    let pos = idx
    for (const d of digits) {
      if (pos >= OTP_LENGTH) break
      next[pos] = d
      pos++
    }
    setOtpDigits(next)
    focusBox(Math.min(pos, OTP_LENGTH - 1))
  }

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      focusBox(idx - 1)
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      focusBox(idx - 1)
    } else if (e.key === 'ArrowRight' && idx < OTP_LENGTH - 1) {
      focusBox(idx + 1)
    }
  }

  const requestOtp = async (e) => {
    e.preventDefault()
    setMsg(null)
    setLoading(true)
    try {
      const res = await api.post('/api/auth/forgot-password', { username })
      setMsg({ text: res.data.message || 'OTP sent to your registered email.', type: 'success' })
      setOtpDigits(Array(OTP_LENGTH).fill(''))
      setStep(2)
      startResendTimer()
    } catch (err) {
      setMsg({ text: err.response?.data?.error || 'Could not send OTP.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const resendOtp = async () => {
    if (resendTimer > 0 || loading) return
    setMsg(null)
    setLoading(true)
    try {
      const res = await api.post('/api/auth/forgot-password', { username })
      setMsg({ text: res.data.message || 'A new OTP has been sent.', type: 'success' })
      setOtpDigits(Array(OTP_LENGTH).fill(''))
      focusBox(0)
      startResendTimer()
    } catch (err) {
      setMsg({ text: err.response?.data?.error || 'Could not resend OTP.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (e) => {
    e.preventDefault()
    setMsg(null)
    if (otp.length !== OTP_LENGTH) {
      setMsg({ text: `Please enter all ${OTP_LENGTH} digits.`, type: 'error' })
      return
    }
    setLoading(true)
    try {
      await api.post('/api/auth/verify-otp', { username, otp })
      setMsg({ text: 'OTP verified. Set your new password below.', type: 'success' })
      setStep(3)
    } catch (err) {
      setMsg({ text: err.response?.data?.error || 'Invalid OTP.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (e) => {
    e.preventDefault()
    setMsg(null)
    if (newPassword !== confirmPassword) {
      setMsg({ text: 'Passwords do not match.', type: 'error' })
      return
    }
    if (newPassword.length < 6) {
      setMsg({ text: 'Password should be at least 6 characters.', type: 'error' })
      return
    }
    setLoading(true)
    try {
      await api.post('/api/auth/reset-password', { username, otp, newPassword })
      navigate('/login', { state: { resetSuccess: true } })
    } catch (err) {
      setMsg({ text: err.response?.data?.error || 'Could not reset password.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-aside">
        <div className="mark">EMS · Ledger</div>
        <div className="ledger-quote">
          Forgot your<br />
          password?<br />
          <span>Happens to everyone.</span>
        </div>
        <div className="foot-note">Employee Management System — Admin · Manager · Employee</div>
      </div>
      <div className="login-main">
        <div className="login-card">
          <h2>Reset password</h2>
          <div className="sub">
            {step === 1 && 'Enter your username (email) to receive an OTP.'}
            {step === 2 && 'Enter the 6-digit OTP sent to your email.'}
            {step === 3 && 'Choose a new password.'}
          </div>

          {msg && <div className="login-error" style={msg.type === 'success' ? successStyle : undefined}>{msg.text}</div>}

          {step === 1 && (
            <form onSubmit={requestOtp}>
              <div className="field">
                <label>Username / Email</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="you@company.com" autoFocus required />
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px' }} disabled={loading}>
                {loading ? 'Sending…' : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={verifyOtp}>
              <div className="field">
                <label>OTP</label>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpRefs.current[idx] = el)}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={OTP_LENGTH}
                      autoFocus={idx === 0}
                      required
                      style={{
                        width: 44,
                        height: 52,
                        textAlign: 'center',
                        fontSize: 20,
                        fontWeight: 600,
                      }}
                    />
                  ))}
                </div>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px' }} disabled={loading}>
                {loading ? 'Verifying…' : 'Verify OTP'}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: 8 }}
                onClick={resendOtp}
                disabled={resendTimer > 0 || loading}
              >
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
              </button>
              <button type="button" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: 8 }} onClick={() => setStep(1)}>
                Use a different username
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={resetPassword}>
              <div className="field">
                <label>New password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" autoFocus required />
              </div>
              <div className="field">
                <label>Confirm new password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px' }} disabled={loading}>
                {loading ? 'Resetting…' : 'Reset password'}
              </button>
            </form>
          )}

          <div className="demo-creds">
            <Link to="/login">← Back to sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
