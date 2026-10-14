import { motion, useReducedMotion } from 'motion/react'

// Transisi antar halaman: fade singkat (tanpa tirai). Dimatikan bila pengguna memilih reduced motion.
export default function PageTransition({ children }) {
  const reduced = useReducedMotion()
  if (reduced) return children
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.15 } }}
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
    >
      {children}
    </motion.div>
  )
}
