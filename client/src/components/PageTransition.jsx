import { motion, useReducedMotion } from 'motion/react'

const ease = [0.76, 0, 0.24, 1]

// Tirai menyapu layar: naik saat halaman baru muncul, turun saat halaman lama keluar.
export default function PageTransition({ children }) {
  const reduced = useReducedMotion()
  return (
    <>
      {children}
      {!reduced && (
        <motion.div
          aria-hidden="true"
          className="fixed inset-0 z-[100] bg-ink pointer-events-none"
          initial={{ scaleY: 1, transformOrigin: 'top' }}
          animate={{ scaleY: 0, transformOrigin: 'top', transition: { duration: 0.8, ease, delay: 0.1 } }}
          exit={{ scaleY: 1, transformOrigin: 'bottom', transition: { duration: 0.6, ease } }}
        />
      )}
    </>
  )
}
