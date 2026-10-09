import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'

const pad = (n) => String(n).padStart(2, '0')

// Hero fullscreen: foto memenuhi layar, teks (children) di atasnya.
// Geser/swipe, tombol panah, dan panah keyboard (klik atau Tab ke slider dulu).
// Tinggi = layar dikurangi navbar sticky (5.75rem, lihat Navbar.jsx).
export default function HeroSlider({ slides, children }) {
  const [ref, api] = useEmblaCarousel({ loop: true, duration: 30 })
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!api) return
    const onSelect = () => setIndex(api.selectedScrollSnap())
    api.on('select', onSelect)
    return () => api.off('select', onSelect)
  }, [api])

  const onKeyDown = useCallback((e) => {
    if (e.key === 'ArrowRight') api?.scrollNext()
    if (e.key === 'ArrowLeft') api?.scrollPrev()
  }, [api])

  const arrow = 'grid h-12 w-12 place-items-center border border-paper/60 transition-colors hover:bg-paper hover:text-ink'

  return (
    <section
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-roledescription="carousel"
      aria-label="Foto proyek pilihan"
      className="relative h-[calc(100svh-5.75rem)] min-h-[560px] overflow-hidden bg-ink text-paper"
    >
      <div className="absolute inset-0 overflow-hidden" ref={ref}>
        <div className="flex h-full">
          {slides.map((s, i) => (
            <div key={s.src} className="relative h-full min-w-0 flex-[0_0_100%]" aria-roledescription="slide" aria-label={`${i + 1} dari ${slides.length}`}>
              <img
                src={s.src}
                alt={s.alt}
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : undefined}
                draggable="false"
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
      {/* Lapisan gelap rata agar teks terbaca di atas foto yang terang */}
      <div className="pointer-events-none absolute inset-0 bg-ink/45" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto flex max-w-[1440px] flex-col gap-10 px-6 pb-12 md:flex-row md:items-end md:justify-between md:px-16 md:pb-16">
        <div className="pointer-events-auto flex max-w-md flex-col gap-6 md:max-w-3xl">{children}</div>

        <div className="pointer-events-auto flex items-center gap-6">
          <p aria-live="polite" className="text-sm tabular-nums">
            <span className="font-display text-3xl">{pad(index + 1)}</span>
            <span className="text-paper/60"> / {pad(slides.length)}</span>
            <span className="ml-4 hidden text-paper/80 sm:inline">{slides[index].judul}</span>
          </p>
          <div className="flex gap-2">
            <button onClick={() => api?.scrollPrev()} className={arrow} aria-label="Foto sebelumnya">&larr;</button>
            <button onClick={() => api?.scrollNext()} className={arrow} aria-label="Foto berikutnya">&rarr;</button>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-paper/30" aria-hidden="true">
        <div
          className="h-px origin-left bg-paper transition-transform duration-700"
          style={{ transform: `scaleX(${(index + 1) / slides.length})` }}
        />
      </div>
    </section>
  )
}
