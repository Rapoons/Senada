import { Link } from 'react-router-dom'
import { useApi } from '../../lib/api'
import { Judul, Pesan } from './ui'

function Angka({ label, nilai, ket }) {
  return (
    <div className="border border-line bg-white p-5">
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
      <p className="mt-10 text-sm">
        Setelah kesepakatan di WhatsApp, <Link to="/dashboard/proyek" className="underline underline-offset-4 hover:text-accent">buat proyek dan akun klien</Link>.
      </p>
    </>
  )
}
