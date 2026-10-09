import { Link } from 'react-router-dom'
import { useApi } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { STATUS_PROYEK } from '../../lib/format'
import { Judul, Pesan } from './ui'

// Daftar proyek untuk arsitek (yang ditugaskan) dan klien (miliknya). Pemfilteran dilakukan server.
export default function ProyekSaya() {
  const { user } = useAuth()
  const { data, error, loading } = useApi('/projects')

  return (
    <>
      <Judul>{user.role === 'KLIEN' ? 'Proyek Anda' : 'Proyek yang ditugaskan'}</Judul>
      {loading && <p className="text-sm">Memuat...</p>}
      <Pesan error={error} />
      {data?.length === 0 && (
        <p className="max-w-md text-sm text-muted">
          {user.role === 'KLIEN' ? 'Belum ada proyek di akun Anda. Proyek dibuat oleh admin Senada Studio setelah kesepakatan.' : 'Belum ada proyek yang ditugaskan kepada Anda.'}
        </p>
      )}
      <ul className="grid gap-4 md:grid-cols-2">
        {data?.map((p) => (
          <li key={p.id}>
            <Link to={`/dashboard/proyek/${p.id}`} className="block border border-line bg-white p-5 transition-colors hover:border-ink">
              <p className="font-display text-2xl font-medium">{p.nama}</p>
              <p className="mt-1 text-xs text-muted">
                {STATUS_PROYEK[p.status]}{user.role === 'ARSITEK' ? ` · Klien: ${p.klien.nama}` : p.anggota.length ? ` · Arsitek: ${p.anggota.map((a) => a.user.nama).join(', ')}` : ''}
              </p>
              <div className="mt-4 flex justify-between text-xs"><span>Progres</span><span>{p.progres}%</span></div>
              <div className="mt-1 h-1.5 bg-line"><div className="h-1.5 bg-accent" style={{ width: `${p.progres}%` }} /></div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
