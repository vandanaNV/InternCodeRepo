import axios from 'axios'
export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const api = axios.create({
  baseURL: API_BASE
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ems_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 || err?.response?.status === 403) {
      // token invalid/expired — bounce to login
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('ems_token')
        localStorage.removeItem('ems_user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
