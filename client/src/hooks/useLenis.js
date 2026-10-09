import { useEffect } from 'react'
import Lenis from 'lenis'
import { useReducedMotion } from 'motion/react'

// Smooth scroll untuk halaman publik. Dimatikan di dashboard (aktif=false)
// dan kalau pengguna meminta gerakan dikurangi.
export default function useLenis(aktif = true) {
  const reduced = useReducedMotion()
  useEffect(() => {
    if (reduced || !aktif) return
    const lenis = new Lenis({ autoRaf: true })
    return () => lenis.destroy()
  }, [reduced, aktif])
}
