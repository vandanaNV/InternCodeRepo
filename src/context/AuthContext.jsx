import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('ems_user')
    const token = localStorage.getItem('ems_token')
    if (stored && token) {
      setUser(JSON.parse(stored))
    }
    setReady(true)
  }, [])

 const login = async (username, password) => {
  const res = await api.post('/api/auth/login', { username, password })
  const data = res.data
  const u = {
    username: data.username,
    role: data.role,
    employeeId: data.employeeId,
    name: data.name,
    photo: data.photo || ''
  }
  localStorage.setItem('ems_token', data.token)
  localStorage.setItem('ems_user', JSON.stringify(u))
  setUser(u)
  return u
} 

  const logout = () => {
    localStorage.removeItem('ems_token')
    localStorage.removeItem('ems_user')
    setUser(null)
  }
  const updatePhoto = (photo) => {
  setUser((prev) => {
    const updated = { ...prev, photo }
    localStorage.setItem('ems_user', JSON.stringify(updated))
    return updated
  })
}

  return (
    <AuthContext.Provider value={{ user, login, logout, ready, updatePhoto }}>
      {children}
    </AuthContext.Provider>
  )
}


export const useAuth = () => useContext(AuthContext)
