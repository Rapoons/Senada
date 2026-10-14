import { Link } from 'react-router-dom'
import SplitTitle from '../components/SplitTitle'
import RevealImage from '../components/RevealImage'
import HeroSlider from '../components/HeroSlider'
import { useApi } from '../lib/api'
import { heroSlides, layanan } from '../data/contoh'

const wrap = 'mx-auto max-w-[1440px] px-6 md:px-16'
const label = 'text-xs uppercase tracking-[0.22em] text-accent'

// "Proyek terpilih": tiga kotak 1:1, kotak tengah digeser turun.
const grid = [
  { cls: 'md:col-span-4', ratio: '1 / 1' },
  { cls: 'md:col-span-4 md:mt-24', ratio: '1 / 1' },
  { cls: 'md:col-span-4', ratio: '1 / 1' },
]

export default function Beranda() {
  // Proyek dari database (dikelola admin). Unggulan = yang bertanda unggulan, atau yang terbaru.
  const { data: items } = useApi('/portfolios')
  const unggulan = items?.find((p) => p.unggulan) ?? items?.[0]
  const lainnya = items?.filter((p) => p !== unggulan).slice(0, 3) ?? []

  return (
    <>
      {/* HERO fullscreen: foto proyek, judul di atasnya */}
      <HeroSlider slides={heroSlides}>
        <span className="text-xs uppercase tracking-[0.22em] text-paper/80">Arsitektur &middot; Interior &middot; Manajemen Proyek</span>
        <SplitTitle text="Ruang yang tenang, dibangun dengan cermat." className="font-display text-5xl font-normal leading-[0.98] md:text-7xl lg:text-[5.5rem]" />
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link to="/portofolio" className="inline-block bg-paper px-8 py-4 text-sm tracking-wider text-ink transition-colors hover:bg-accent hover:text-paper">Lihat Proyek</Link>
          <Link to="/paket" className="under text-sm tracking-wide">Hitung estimasi</Link>
        </div>
      </HeroSlider>

      <div className="h-12 md:h-20" aria-hidden="true" />

      {/* PROYEK UNGGULAN */}
      {unggulan && (
        <section className={`${wrap} grid gap-10 pb-20 md:grid-cols-12 md:gap-x-6 md:pb-28`}>
          <div className="md:col-span-7">
            <RevealImage src={unggulan.gambar[0]?.path} alt={unggulan.gambar[0]?.alt || unggulan.judul} ratio="4 / 3" />
          </div>
          <div className="flex flex-col justify-between gap-10 md:col-span-4 md:col-start-9">
            <div className="flex flex-col gap-5">
              <span className={label}>Proyek unggulan</span>
              <h2 className="font-display text-5xl font-normal leading-[1.05]">{unggulan.judul}</h2>
              {unggulan.deskripsi && <p>{unggulan.deskripsi}</p>}
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-6 border-t border-ink pt-6">
              {[['Kategori', unggulan.category.nama], ['Luas', unggulan.luasM2 && `${unggulan.luasM2} m²`], ['Tahun', unggulan.tahun], ['Lokasi', unggulan.lokasi]]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[11px] uppercase tracking-[0.18em] text-muted">{k}</dt>
                    <dd className="mt-1">{v}</dd>
                  </div>
                ))}
            </dl>
            <Link to={`/portofolio/${unggulan.slug}`} className="under self-start text-sm tracking-wide">Lihat detail proyek</Link>
          </div>
        </section>
      )}

      {/* LAYANAN */}
      <section className={`${wrap} grid gap-10 pb-20 md:grid-cols-12 md:gap-x-6 md:pb-28`}>
        <div className="md:col-span-12">
          <span className={label}>Layanan</span>
          <h2 className="mt-5 font-display text-5xl font-normal leading-[1.05]">Dari gagasan sampai serah terima.</h2>
        </div>
        <ul className="md:col-span-7 md:col-start-6">
          {layanan.map((l, i) => (
            <li key={l.no} className={`grid grid-cols-[3.5rem_1fr] gap-4 border-t border-ink py-8 ${i === layanan.length - 1 ? 'border-b' : ''}`}>
              <span className="font-display text-3xl text-accent">{l.no}</span>
              <div>
                <h3 className="font-display text-3xl font-medium">{l.judul}</h3>
                <p className="mt-2 max-w-lg">{l.ringkas}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* PROYEK TERPILIH */}
      {lainnya.length > 0 && (
        <section className={`${wrap} pb-20 md:pb-28`}>
          <div className="mb-12 flex items-end justify-between">
            <h2 className="font-display text-5xl font-normal leading-[1.05]">Proyek terpilih</h2>
            <Link to="/portofolio" className="under text-sm tracking-wide">Semua proyek</Link>
          </div>
          <div className="grid items-start gap-12 md:grid-cols-12 md:gap-x-6">
            {lainnya.map((p, i) => (
              <Link key={p.slug} to={`/portofolio/${p.slug}`} className={grid[i].cls}>
                <RevealImage src={p.gambar[0]?.path} alt={p.gambar[0]?.alt || p.judul} ratio={grid[i].ratio} />
                <div className="flex justify-between pt-3 text-sm">
                  <span>{p.judul}</span>
                  <span className="text-muted">{p.category.nama}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* TENTANG */}
      <div className="wash py-16 md:py-24">
      <section id="tentang" className={`${wrap} grid gap-10 md:grid-cols-12 md:gap-x-6`}>
        <div className="md:col-span-4">
          <span className={label}>Tentang studio</span>
          <h2 className="mt-5 font-display text-5xl font-normal leading-[1.05]">Senada Studio Arsitektur</h2>
        </div>
        <div className="max-w-xl space-y-5 md:col-span-6 md:col-start-6">
          <p>Senada Studio Arsitektur adalah studio arsitektur di Pontianak, Kalimantan Barat, yang berdiri sejak 2019. Kami melayani konsultasi, desain, dan pembangunan (design and build) agar ide hunian atau bangunanmu bisa diwujudkan dalam satu alur yang rapi.</p>
          <p>Kami menangani perancangan arsitektur dan interior, gambar kerja, hingga pengawasan pelaksanaan.</p>
          <p>Lewat website ini, calon klien bisa melihat portofolio, menghitung estimasi paket, dan berkonsultasi langsung lewat WhatsApp. Setelah proyek berjalan, klien memantau tahapan dan progresnya dari akun masing-masing, tanpa perlu terus bertanya.</p>        </div>
      </section>
      </div>
    </>
  )
}
