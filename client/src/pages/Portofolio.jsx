import { useState } from 'react'
import { Link } from 'react-router-dom'
import GaleriParalaks from '../components/GaleriParalaks'
import { useApi } from '../lib/api'

export default function Portofolio() {
  const [kategori, setKategori] = useState('')
  const { data: kategoriList } = useApi('/categories')
  const { data: items, error, loading } = useApi(kategori ? `/portfolios?category=${kategori}` : '/portfolios')

  const tombol = (aktif) => `border-b pb-1 text-sm transition-colors ${aktif ? 'border-accent text-accent' : 'border-transparent hover:text-accent'}`

  return (
    <>
      <header className="mx-auto max-w-[1440px] px-6 pb-12 pt-16 md:px-16 md:pt-24">
        <h1 className="max-w-[12ch] font-display text-6xl font-normal leading-[1.02] md:text-8xl">Portofolio</h1>
      </header>

      <GaleriParalaks />

      <section className="mx-auto max-w-[1440px] px-6 pb-24 pt-12 md:px-16">
        <div className="flex flex-wrap gap-x-8 gap-y-3" role="group" aria-label="Filter kategori">
          <button className={tombol(!kategori)} aria-pressed={!kategori} onClick={() => setKategori('')}>Semua</button>
          {kategoriList?.map((k) => (
            <button key={k.slug} className={tombol(kategori === k.slug)} aria-pressed={kategori === k.slug} onClick={() => setKategori(k.slug)}>{k.nama}</button>
          ))}
        </div>

        {error && <p className="mt-10">Data belum bisa dimuat. Pastikan server API berjalan.</p>}
        {!error && !loading && items?.length === 0 && <p className="mt-10 text-muted">Belum ada proyek di kategori ini.</p>}

        {/* Grid seragam: 1 kolom di HP, 2 di tablet, 3 di desktop. Rasio kartu tetap, tanpa animasi masuk. */}
        <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {items?.map((p) => (
            <Link key={p.slug} to={`/portofolio/${p.slug}`} className="group block">
              <div className="aspect-[4/3] overflow-hidden bg-line">
                <img
                  src={p.gambar[0]?.path}
                  alt={p.gambar[0]?.alt || p.judul}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-4">
                <span className="font-display text-xl leading-tight">{p.judul}</span>
                <span className="shrink-0 text-xs text-muted">{p.category.nama}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
