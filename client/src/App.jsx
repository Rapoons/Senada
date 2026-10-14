import { lazy, Suspense } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import useLenis from './hooks/useLenis'
import PublicLayout from './layouts/PublicLayout'
import Beranda from './pages/Beranda'
import Portofolio from './pages/Portofolio'
import ProyekDetail from './pages/ProyekDetail'
import Paket from './pages/Paket'

// Dashboard dimuat terpisah (lazy) supaya pengunjung publik tidak mengunduh kodenya.
const Masuk = lazy(() => import('./pages/dashboard/Masuk'))
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'))

export default function App() {
  const location = useLocation()
  const internal = location.pathname === '/login' || location.pathname.startsWith('/dashboard')
  useLenis(!internal)

  // Dashboard: tanpa tirai transisi dan tanpa smooth scroll (animasi minimal).
  if (internal) {
    return (
      <Suspense fallback={<p className="p-8 text-sm">Memuat...</p>}>
        <Routes>
          <Route path="/login" element={<Masuk />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
        </Routes>
      </Suspense>
    )
  }

  return (
    // mode="wait": halaman lama fade out dulu, baru halaman baru masuk.
    <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PublicLayout><Beranda /></PublicLayout>} />
        <Route path="/portofolio" element={<PublicLayout><Portofolio /></PublicLayout>} />
        <Route path="/portofolio/:slug" element={<PublicLayout><ProyekDetail /></PublicLayout>} />
        <Route path="/paket" element={<PublicLayout><Paket /></PublicLayout>} />
      </Routes>
    </AnimatePresence>
  )
}
