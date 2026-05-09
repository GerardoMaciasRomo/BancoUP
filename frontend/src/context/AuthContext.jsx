import { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const saved  = localStorage.getItem('user')
    if (token && saved) setUser(JSON.parse(saved))
    setLoading(false)
  }, [])

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.access_token)
    const { data: me } = await api.get('/auth/me')
    localStorage.setItem('user', JSON.stringify(me))
    setUser(me)
    return me
  }

  async function register(email, password, full_name) {
    const { data } = await api.post('/auth/register', { email, password, full_name })
    localStorage.setItem('token', data.access_token)
    const { data: me } = await api.get('/auth/me')
    localStorage.setItem('user', JSON.stringify(me))
    setUser(me)
    return me
  }

  async function refreshUser() {
    const { data: me } = await api.get('/auth/me')
    localStorage.setItem('user', JSON.stringify(me))
    setUser(me)
    return me
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
