import React, { useRef } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import ChatWidget from './ChatWidget.jsx'
import api from '../api/client.js'

const NAV = {
  ROLE_ADMIN: [
    { to: '/admin', label: 'Overview', end: true },
    { to: '/admin/employees', label: 'Employees' },
    { to: '/admin/leaves', label: 'Leave Requests' },
    { to: '/admin/wfh', label: 'WFH Requests' },
    { to: '/admin/teams', label: 'Teams' },
    { to: '/admin/assign-task', label: 'Assign Task' },
    { to: '/admin/attendance', label: 'Attendance' },
    { to: '/admin/holidays', label: 'Holidays' }
  ],
  ROLE_MANAGER: [
    { to: '/manager', label: 'Overview', end: true },
    { to: '/manager/team', label: 'My Team' },
    { to: '/manager/leaves', label: 'Leave Requests' },
    { to: '/manager/wfh', label: 'WFH Requests' },
    { to: '/manager/updates', label: 'Daily Updates' },
    { to: '/manager/attendance', label: 'Team Attendance' },
    { to: '/manager/holidays', label: 'Holidays' },
    { to: '/employee', label: 'My Workspace' }
  ],
  ROLE_EMPLOYEE: [
    { to: '/employee', label: 'Overview', end: true },
    { to: '/employee/tasks', label: 'My Tasks' },
    { to: '/employee/leave', label: 'Leave' },
    { to: '/employee/wfh', label: 'Work From Home' },
    { to: '/employee/attendance', label: 'Attendance' },
    { to: '/employee/ratings', label: 'Ratings' },
    { to: '/employee/holidays', label: 'Holidays' }
  ]
}

const ROLE_LABEL = {
  ROLE_ADMIN: 'Admin',
  ROLE_MANAGER: 'Manager',
  ROLE_EMPLOYEE: 'Employee'
}

export default function Layout() {
  const { user, logout, updatePhoto } = useAuth()
  const items = NAV[user.role] || []
  const initials = (user.name || user.username || '?').slice(0, 2).toUpperCase()
  const fileInputRef = useRef(null)

  const handlePhotoClick = () => fileInputRef.current?.click()

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 1_500_000) {
      alert('Image too large. Please pick a photo under 1.5MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result
      try {
        await api.post('/api/user/photo', { photo: base64 })
        updatePhoto(base64)
      } catch {
        alert('Failed to upload photo. Please try again.')
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="mark">EMS</span>
          <span className="word">Ledger</span>
        </div>
        <div className="sidebar-role">{ROLE_LABEL[user.role]} Panel</div>
        <nav>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-pill">
            <div className="user-avatar" onClick={handlePhotoClick} style={{ cursor: 'pointer', overflow: 'hidden' }} title="Click to change photo">
              {user.photo ? (
                <img src={user.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                initials
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
            <div className="user-meta">
              <div className="name">{user.name || user.username}</div>
              <div className="role">{ROLE_LABEL[user.role]}</div>
            </div>
          </div>
          <NavLink to="/change-password" className="logout-btn settings-link">Change Password</NavLink>
          <button className="logout-btn" onClick={logout}>Log out</button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
      <ChatWidget />
    </div>
  )
}