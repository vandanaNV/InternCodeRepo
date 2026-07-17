import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Login from './pages/Login.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ChangePassword from './pages/ChangePassword.jsx'
import Layout from './components/Layout.jsx'
import Holidays from './pages/Holidays.jsx'

import AdminOverview from './pages/admin/AdminOverview.jsx'
import AdminEmployees from './pages/admin/AdminEmployees.jsx'
import AdminLeaves from './pages/admin/AdminLeaves.jsx'
import AdminWFH from './pages/admin/AdminWFH.jsx'
import AdminTeams from './pages/admin/AdminTeams.jsx'
import AdminAssignTask from './pages/admin/AdminAssignTask.jsx'
import AdminAttendance from './pages/admin/AdminAttendance.jsx'
import AdminHolidays from './pages/admin/AdminHolidays.jsx'

import ManagerOverview from './pages/manager/ManagerOverview.jsx'
import ManagerTeam from './pages/manager/ManagerTeam.jsx'
import ManagerLeaves from './pages/manager/ManagerLeaves.jsx'
import ManagerWFH from './pages/manager/ManagerWFH.jsx'
import ManagerUpdates from './pages/manager/ManagerUpdates.jsx'
import ManagerAttendance from './pages/manager/ManagerAttendance.jsx'

import EmployeeOverview from './pages/employee/EmployeeOverview.jsx'
import EmployeeTasks from './pages/employee/EmployeeTasks.jsx'
import EmployeeLeave from './pages/employee/EmployeeLeave.jsx'
import EmployeeWFH from './pages/employee/EmployeeWFH.jsx'
import EmployeeAttendance from './pages/employee/EmployeeAttendance.jsx'
import EmployeeRatings from './pages/employee/EmployeeRatings.jsx'

function ProtectedRoute({ roles, children }) {
  const { user, ready } = useAuth()
  if (!ready) return <div className="loading-screen">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homeFor(user.role)} replace />
  }
  return children
}

function homeFor(role) {
  if (role === 'ROLE_ADMIN') return '/admin'
  if (role === 'ROLE_MANAGER') return '/manager'
  return '/employee'
}

export default function App() {
  const { user, ready } = useAuth()

  if (!ready) return <div className="loading-screen">Loading…</div>

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={homeFor(user.role)} replace /> : <Login />} />
      <Route path="/forgot-password" element={user ? <Navigate to={homeFor(user.role)} replace /> : <ForgotPassword />} />

      <Route path="/change-password" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<ChangePassword />} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute roles={['ROLE_ADMIN']}><Layout /></ProtectedRoute>}>
        <Route index element={<AdminOverview />} />
        <Route path="employees" element={<AdminEmployees />} />
        <Route path="leaves" element={<AdminLeaves />} />
        <Route path="wfh" element={<AdminWFH />} />
        <Route path="teams" element={<AdminTeams />} />
        <Route path="assign-task" element={<AdminAssignTask />} />
        <Route path="attendance" element={<AdminAttendance />} />
        <Route path="holidays" element={<AdminHolidays />} />
      </Route>

      <Route path="/manager" element={<ProtectedRoute roles={['ROLE_MANAGER']}><Layout /></ProtectedRoute>}>
        <Route index element={<ManagerOverview />} />
        <Route path="team" element={<ManagerTeam />} />
        <Route path="leaves" element={<ManagerLeaves />} />
        <Route path="wfh" element={<ManagerWFH />} />
        <Route path="updates" element={<ManagerUpdates />} />
        <Route path="attendance" element={<ManagerAttendance />} />
        <Route path="holidays" element={<Holidays />} />
      </Route>

      <Route path="/employee" element={<ProtectedRoute roles={['ROLE_EMPLOYEE', 'ROLE_MANAGER']}><Layout /></ProtectedRoute>}>
        <Route index element={<EmployeeOverview />} />
        <Route path="tasks" element={<EmployeeTasks />} />
        <Route path="leave" element={<EmployeeLeave />} />
        <Route path="wfh" element={<EmployeeWFH />} />
        <Route path="attendance" element={<EmployeeAttendance />} />
        <Route path="ratings" element={<EmployeeRatings />} />
        <Route path="holidays" element={<Holidays />} />
      </Route>

      <Route path="*" element={<Navigate to={user ? homeFor(user.role) : '/login'} replace />} />
    </Routes>
  )
}
