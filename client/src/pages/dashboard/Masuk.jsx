import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Logo from '../../components/Logo'
import { useAuth } from '../../lib/auth'
import { Btn, Field, Pesan, input } from './ui'

export default function Masuk() {
  const { user, siap, masuk } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const [kirim, setKirim] = useState(false)

  if (siap && user) return <Navigate to="/dashboard" replace />

  async function onSubmit(e) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setKirim(true)
    setError(null)
    try {
      await masuk(f.get('email'), f.get('password'))
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err)
      setKirim(false)
    }
  }

  return (
    <main id="isi" className="wash grid min-h-screen place-items-center px-6">
      <div className="w-full max-w-sm">
        <Link to="/" aria-label="Kembali ke beranda"><Logo width={130} /></Link>
        <h1 className="mt-10 font-display text-4xl font-medium">Login</h1>
        <p className="mt-2 text-sm text-muted">Untuk admin, arsitek, dan klien Senada Studio.</p>
        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <Pesan error={error} />
          <Field label="Email"><input name="email" type="email" autoComplete="username" required className={input} /></Field>
          <Field label="Password"><input name="password" type="password" autoComplete="current-password" required className={input} /></Field>
          <Btn type="submit" disabled={kirim} className="w-full py-3">{kirim ? 'Memeriksa...' : 'Login'}</Btn>
        </form>
      </div>
    </main>
  )
}
