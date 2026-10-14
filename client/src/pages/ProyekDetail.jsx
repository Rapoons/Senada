import { Link, useParams } from 'react-router-dom'
import RevealImage from '../components/RevealImage'
import { useApi } from '../lib/api'
import { TINGKATAN, LINGKUP } from '../lib/estimasi'

export default function ProyekDetail() {
  const { slug } = useParams()
  const { data: p, error, loading } = useApi(`/portfolios/${encodeURIComponent(slug)}`)

  if (loading) return <p className="px-6 pb-28 pt-40 md:px-16">Memuat proyek...</p>
  if (error) return (
    <div className="px-6 pb-28 pt-40 md:px-16">
      <p>{error.message}</p>
      <Link to="/portofolio" className="under mt-6 inline-block text-sm">Kembali ke portofolio</Link>
    </div>
  )

  // Hanya tampilkan field yang terisi.
  const meta = [
    ['Kategori', p.category.nama],
    ['Lokasi', p.lokasi],
    ['Luas', p.luasM2 && `${p.luasM2} m²`],
    ['Tahun', p.tahun],
    ['Paket', p.package && `${TINGKATAN[p.package.tingkatan]} · ${LINGKUP[p.package.lingkup]}`],
  ].filter(([, v]) => v)

  return (
    <article className="mx-auto max-w-[1440px] px-6 pb-12 pt-4 md:px-16 md:pt-8">
      <Link to="/portofolio" className="under text-sm">Semua proyek</Link>
      <h1 className="mt-10 max-w-[16ch] font-display text-6xl font-normal leading-[1.02] md:text-8xl">{p.judul}</h1>

      <div className="mt-10 grid gap-10 md:grid-cols-12 md:gap-x-6">
        <dl className="grid grid-cols-2 content-start gap-x-4 gap-y-6 border-t border-ink pt-6 md:col-span-4">
          {meta.map(([k, v]) => (
            <div key={k}>
              <dt className="text-[11px] uppercase tracking-[0.18em] text-muted">{k}</dt>
              <dd className="mt-1">{v}</dd>
            </div>
          ))}
        </dl>
        {p.deskripsi && <p className="max-w-lg md:col-span-6 md:col-start-7">{p.deskripsi}</p>}
      </div>

      <div className="mt-12 space-y-8">
        {p.gambar.map((g, i) => (
          <RevealImage key={g.id} src={g.path} alt={g.alt || `${p.judul}, foto ${i + 1}`} ratio="16 / 9" />
        ))}
      </div>
    </article>
  )
}
