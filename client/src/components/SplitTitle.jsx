import { motion, useReducedMotion } from 'motion/react'

// Judul muncul kata demi kata (stagger) dari balik garis potong.
export default function SplitTitle({ text, className = '', delay = 0.9 }) {
  const reduced = useReducedMotion()
  if (reduced) return <h1 className={className}>{text}</h1>
  return (
    <motion.h1
      className={className}
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.09, delayChildren: delay }}
      aria-label={text}
    >
      {text.split(' ').map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom pb-[0.12em]" aria-hidden="true">
          <motion.span
            className="inline-block"
            variants={{ hidden: { y: '110%' }, show: { y: 0 } }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
    </motion.h1>
  )
}
