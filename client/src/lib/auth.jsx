import { createContext, useContext, useEffect, useState } from 'react'
import { kirim, getToken, setToken } from './api'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [siap, setSiap] = useState(false) // false selama token lama sedang diperiksa

  useEffect(() => {
    if (!getToken()) { setSiap(true); return }
    kirim('GET', '/auth/me').then(setUser).catch(() => setToken(null)).finally(() => setSiap(true))
  }, [])

  // Token ditolak server (kedaluwarsa/akun dinonaktifkan): keluar otomatis.
  useEffect(() => {
    const keluarPaksa = () => { setToken(null); setUser(null) }
    window.addEventListener('senada:logout', keluarPaksa)
    return () => window.removeEventListener('senada:logout', keluarPaksa)
  }, [])

  async function masuk(email, password) {
    const data = await kirim('POST', '/auth/login', { email, password })
    setToken(data.token)
    setUser(data.user)
    return data.user
  }
  function keluar() { setToken(null); setUser(null) }

  return <AuthContext.Provider value={{ user, siap, masuk, keluar }}>{children}</AuthContext.Provider>
}
