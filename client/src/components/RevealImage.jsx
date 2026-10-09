import { motion, useReducedMotion } from 'motion/react'

// Gambar terbuka dengan clip-path saat masuk layar, zoom pelan saat di-hover.
// Rasio dikunci lewat prop `ratio` supaya tidak ada layout shift.
export default function RevealImage({ src, alt = '', ratio = '4 / 5', className = '' }) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={`group overflow-hidden ${className}`}
      style={{ aspectRatio: ratio }}
      initial={reduced ? false : { clipPath: 'inset(100% 0 0 0)' }}
      whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
    </motion.div>
  )
}
