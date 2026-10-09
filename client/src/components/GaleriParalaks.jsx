import { useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { useApi } from '../lib/api'

// Rentang 0-0.15: bingkai membesar sampai penuh. 0.15-1: dinding foto miring 3D meluruskan diri
// dan kolomnya bergeser berlawanan arah (paralaks). Mengikuti gulir halaman, bukan kotak gulir sendiri.
const MULAI = 0.15
const NAVBAR = '5.75rem' // tinggi navbar sticky, sama dengan hero

const KARTU = 'relative block h-[200px] w-full shrink-0 overflow-hidden bg-line sm:h-[300px] md:h-[400px]'

function Kartu({ foto, salinan }) {
  // Salinan kedua hanya pengisi agar kolom tidak habis: disembunyikan dari pembaca layar dan Tab.
  return (
    <Link
      to={`/portofolio/${foto.slug}`}
      aria-hidden={salinan || undefined}
      tabIndex={salinan ? -1 : undefined}
      className={`${KARTU} group`}
    >
      <img
        src={foto.src}
        alt={salinan ? '' : foto.alt}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-105"
      />
    </Link>
  )
}

function Galeri({ kolom }) {
  const ref = useRef(null)

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 100, damping: 20, mass: 0.5 })

  const lebar = useTransform(p, [0, MULAI], ['90%', '100%'])
  const tinggi = useTransform(p, [0, MULAI], ['80%', '100%'])
  const garis = useTransform(p, [0, MULAI], ['4px', '0px'])
  const rotateY = useTransform(p, [MULAI, 1], [-45, -8])
  const rotateX = useTransform(p, [MULAI, 1], [25, 4])
  const rotateZ = useTransform(p, [MULAI, 1], [15, 2])
  const z = useTransform(p, [MULAI, 1], [-800, 0])
  const y = [
    useTransform(p, [MULAI, 1], ['0%', '-40%']),
    useTransform(p, [MULAI, 1], ['-40%', '10%']),
    useTransform(p, [MULAI, 1], ['0%', '-40%']),
    useTransform(p, [MULAI, 1], ['-30%', '20%']),
  ]

  return (
    <section ref={ref} aria-label="Galeri foto proyek" className="relative h-[300vh] w-full">
      <div className="sticky flex w-full items-center justify-center overflow-hidden" style={{ top: NAVBAR, height: `calc(100svh - ${NAVBAR})` }}>
        <motion.div
          style={{ width: lebar, height: tinggi, borderWidth: garis }}
          className="relative flex items-center justify-center overflow-hidden border-line bg-paper"
        >
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ perspective: '1000px' }}>
            {/* Tepi memudar ke warna latar halaman */}
            <div className="absolute inset-0 z-20 shadow-[inset_0_100px_150px_-50px_#f8f8f8,inset_0_-100px_150px_-50px_#f8f8f8,inset_150px_0_150px_-50px_#f8f8f8,inset_-150px_0_150px_-50px_#f8f8f8]" />

            <motion.div
              style={{ rotateX, rotateY, rotateZ, z, transformStyle: 'preserve-3d' }}
              className="flex h-[150%] w-[120%] origin-center items-center justify-center gap-4 will-change-transform md:gap-6"
            >
              {kolom.map((foto, k) => (
                <motion.div key={k} style={{ y: y[k] }} className="pointer-events-auto flex w-[22vw] min-w-[200px] flex-col gap-4 md:gap-6">
                  {foto.map((f, i) => <Kartu key={`a${i}`} foto={f} />)}
                  {foto.map((f, i) => <Kartu key={`b${i}`} foto={f} salinan />)}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Hook gulir hanya boleh dibuat setelah elemen targetnya ada, jadi data dimuat di sini
// dan <Galeri> baru dipasang setelah foto siap.
export default function GaleriParalaks() {
  const reduced = useReducedMotion()
  const { data } = useApi('/portfolios')

  // Semua foto proyek terbit, dibagi ke 4 kolom bergantian.
  const kolom = useMemo(() => {
    const foto = (data ?? []).flatMap((p) => p.gambar.map((g) => ({ src: g.path, alt: g.alt || p.judul, slug: p.slug })))
    if (foto.length < 4) return null
    return [0, 1, 2, 3].map((k) => foto.filter((_, i) => i % 4 === k))
  }, [data])

  // Gerak berkurang atau foto belum cukup: dilewati, grid portofolio di bawahnya tetap lengkap.
  if (reduced || !kolom) return null
  return <Galeri kolom={kolom} />
}
