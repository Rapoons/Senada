import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useApi } from '../../../lib/api'
import { useAuth } from '../../../lib/auth'
import { LINGKUP, TINGKATAN } from '../../../lib/estimasi'
import { STATUS_PROYEK, tgl } from '../../../lib/format'
import { Btn, Pesan } from '../ui'
import Tahapan from './Tahapan'
import Dokumen from './Dokumen'
import Diskusi from './Diskusi'
import UbahProyek from './UbahProyek'

// Halaman satu proyek, dipakai ketiga peran. Hak akses ditegakkan di server;
// peran hanya menentukan tombol apa yang ditampilkan.
export default function Rincian() {
  const { id } = useParams()
  const { user } = useAuth()
  const { data: p, error, loading, reload } = useApi(`/projects/${id}`)
  const [ubah, setUbah] = useState(false)

  if (loading && !p) return <p className="text-sm">Memuat...</p>
  if (error) return (
    <div>
      <Pesan error={error} />
      <Link to="/dashboard/proyek" className="text-sm underline underline-offset-4">Kembali ke daftar proyek</Link>
    </div>
  )

  const meta = [
    ['Klien', p.klien.nama],
    ['Arsitek', p.anggota.map((a) => a.user.nama).join(', ') || 'Belum ditugaskan'],
    ['Lokasi', p.lokasi],
    ['Luas', p.luasM2 && `${p.luasM2} m²`],
    ['Paket', p.package && `${TINGKATAN[p.package.tingkatan]} · ${LINGKUP[p.package.lingkup]}`],
    ['Mulai', p.tanggalMulai && tgl(p.tanggalMulai)],
    ['Target selesai', p.targetSelesai && tgl(p.targetSelesai)],
  ].filter(([, v]) => v)

  return (
    <>
      <Link to="/dashboard/proyek" className="text-sm underline underline-offset-4 hover:text-accent">Semua proyek</Link>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl font-medium">{p.nama}</h1>
        {user.role === 'ADMIN' && !ubah && <Btn variant="garis" onClick={() => setUbah(true)}>Ubah data proyek</Btn>}
      </div>

      {ubah ? <UbahProyek proyek={p} onSelesai={() => { setUbah(false); reload() }} /> : (
        <>
          <p className="mt-2 text-sm text-muted">Status: {STATUS_PROYEK[p.status]}</p>
          <div className="mt-6 max-w-xl" role="progressbar" aria-valuenow={p.progres} aria-valuemin={0} aria-valuemax={100} aria-label="Progres proyek">
            <div className="flex justify-between text-sm"><span>Progres</span><span>{p.progres}%</span></div>
            <div className="mt-2 h-1.5 bg-line"><div className="h-1.5 bg-accent" style={{ width: `${p.progres}%` }} /></div>
          </div>
          <dl className="mt-8 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-5 border-t border-ink pt-6 sm:grid-cols-3">
            {meta.map(([k, v]) => (
              <div key={k}><dt className="text-[11px] uppercase tracking-[0.18em] text-muted">{k}</dt><dd className="mt-1 text-sm">{v}</dd></div>
            ))}
          </dl>
          {p.deskripsi && <p className="mt-6 max-w-2xl text-sm">{p.deskripsi}</p>}
        </>
      )}

      <Tahapan proyek={p} user={user} reload={reload} />
      <Dokumen proyek={p} user={user} />
      <Diskusi proyek={p} user={user} />
    </>
  )
}
