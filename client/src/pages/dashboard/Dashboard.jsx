import { useEffect, useState } from 'react'
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import Logo from '../../components/Logo'
import { useApi } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import Ringkasan from './Ringkasan'
import PaketAdmin from './PaketAdmin'
import PortofolioDaftar from './PortofolioDaftar'
import PortofolioForm from './PortofolioForm'
import Akun from './Akun'
import Proyek from './Proyek'
import ProyekSaya from './ProyekSaya'
import Rincian from './proyek/Rincian'
import Notifikasi from './Notifikasi'

const menu = {
  ADMIN: [['/dashboard', 'Ringkasan', true], ['/dashboard/proyek', 'Proyek'], ['/dashboard/portofolio', 'Portofolio'], ['/dashboard/paket', 'Paket dan tarif'], ['/dashboard/akun', 'Akun']],
  ARSITEK: [['/dashboard', 'Proyek saya', true]],
  KLIEN: [['/dashboard', 'Proyek saya', true]],
}

// Pintu masuk dashboard: wajib login. Hak akses sebenarnya dijaga di server (RBAC + cek kepemilikan);
// menu dan rute di sini hanya menyesuaikan tampilan dengan peran.
export default function Dashboard() {
  const { user, siap, keluar } = useAuth()
  const [buka, setBuka] = useState(false)
  const { pathname } = useLocation()
  const { data: notif, reload: muatNotif } = useApi(user ? '/notifications' : null)

  // Hitung ulang lencana notifikasi saat pindah halaman atau setelah ditandai dibaca.
  useEffect(() => { if (user) muatNotif() }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    window.addEventListener('senada:notif', muatNotif)
    return () => window.removeEventListener('senada:notif', muatNotif)
  }, [muatNotif])

  if (!siap) return <p className="p-8 text-sm">Memeriksa sesi...</p>
  if (!user) return <Navigate to="/masuk" replace />

  const admin = user.role === 'ADMIN'
  const cls = ({ isActive }) => `flex items-center justify-between border-l-2 py-2 pl-4 pr-2 text-sm ${isActive ? 'border-accent text-accent' : 'border-transparent hover:text-accent'}`

  return (
    <div className="min-h-screen md:grid md:grid-cols-[15rem_1fr]">
      <a href="#isi" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">Lompat ke konten</a>
      <aside className="border-b border-line bg-white md:min-h-screen md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-6 py-4 md:block">
          <Logo width={96} />
          <button className="px-2 py-2 text-sm md:hidden" aria-expanded={buka} onClick={() => setBuka(!buka)}>{buka ? 'Tutup' : 'Menu'}</button>
        </div>
        <nav className={`${buka ? 'block' : 'hidden'} px-2 pb-4 md:block`} aria-label="Menu dashboard">
          {menu[user.role].map(([to, label, end]) => (
            <NavLink key={to} to={to} end={end} className={cls} onClick={() => setBuka(false)}>{label}</NavLink>
          ))}
          <NavLink to="/dashboard/notifikasi" className={cls} onClick={() => setBuka(false)}>
            Notifikasi
            {notif?.belumDibaca > 0 && <span className="bg-accent px-1.5 text-xs text-paper" aria-label={`${notif.belumDibaca} belum dibaca`}>{notif.belumDibaca}</span>}
          </NavLink>
          <div className="mt-6 border-t border-line px-4 pt-4 text-xs text-muted">
            <p className="text-sm text-ink">{user.nama}</p>
            <p>{user.role}</p>
            <button onClick={keluar} className="mt-3 text-sm text-ink underline underline-offset-4 hover:text-accent">Keluar</button>
          </div>
        </nav>
      </aside>

      <main id="isi" className="min-w-0 px-6 py-10 md:px-12">
        <Routes>
          <Route index element={admin ? <Ringkasan /> : <ProyekSaya />} />
          <Route path="proyek" element={admin ? <Proyek /> : <Navigate to="/dashboard" replace />} />
          <Route path="proyek/:id" element={<Rincian />} />
          <Route path="notifikasi" element={<Notifikasi />} />
          {admin && <>
            <Route path="portofolio" element={<PortofolioDaftar />} />
            <Route path="portofolio/baru" element={<PortofolioForm />} />
            <Route path="portofolio/:id" element={<PortofolioForm />} />
            <Route path="paket" element={<PaketAdmin />} />
            <Route path="akun" element={<Akun />} />
          </>}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}
