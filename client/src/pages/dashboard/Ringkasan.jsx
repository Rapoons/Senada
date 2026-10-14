import { Link } from 'react-router-dom'
import { useApi } from '../../lib/api'
import { tgl } from '../../lib/format'
import { Judul, Pesan } from './ui'

function Angka({ label, nilai, ket }) {
  return (
    <div className="border border-line bg-panel p-5">
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-2 font-display text-5xl">{nilai ?? 0}</p>
      {ket && <p className="mt-1 text-xs text-muted">{ket}</p>}
    </div>
  )
}

export default function Ringkasan() {
  const { data: s, error, loading } = useApi('/admin/summary')
  if (loading) return <p className="text-sm">Memuat...</p>
  if (error) return <Pesan error={error} />

  return (
    <>
      <Judul>Ringkasan</Judul>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Angka label="Proyek aktif" nilai={s.proyek.AKTIF} ket={`${s.proyek.SELESAI ?? 0} selesai · ${s.proyek.DITUNDA ?? 0} ditunda`} />
        <Angka label="Tahapan terlambat" nilai={s.tahapTertunda} ket="Melewati tanggal target" />
        <Angka label="Portofolio terbit" nilai={s.portofolio.terbit} ket={`${s.portofolio.draf} draf`} />
        <Angka label="Klien aktif" nilai={s.pengguna.KLIEN} ket={`${s.pengguna.ARSITEK ?? 0} arsitek · ${s.pengguna.ADMIN ?? 0} admin`} />
      </div>
      <section aria-labelledby="tunda" className="mt-12 max-w-2xl">
        <h2 id="tunda" className="font-display text-2xl font-medium">Tahapan terlambat</h2>
        {s.daftarTunda.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Tidak ada tahapan yang melewati target.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {s.daftarTunda.map((t) => (
              <li key={t.id}>
                <Link to={`/dashboard/proyek/${t.project.id}`} className="flex items-baseline justify-between gap-4 py-3 text-sm hover:text-accent">
                  <span>{t.project.nama}<span className="text-muted"> · {t.nama}</span></span>
                  <span className="shrink-0 text-xs text-red-800">Target {tgl(t.tanggalTarget)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <p className="mt-10 text-sm">
        Setelah kesepakatan di WhatsApp, <Link to="/dashboard/proyek" className="underline underline-offset-4 hover:text-accent">buat proyek dan akun klien</Link>.
      </p>
    </>
  )
}
