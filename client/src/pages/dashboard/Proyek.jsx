import { useState } from 'react'
import { Link } from 'react-router-dom'
import { kirim, useApi } from '../../lib/api'
import { LINGKUP, TINGKATAN } from '../../lib/estimasi'
import { Btn, Field, Judul, Pesan, Tabel, Td, Th, angkaAtauNull, input, kosongKeNull } from './ui'

const kosong = { nama: '', lokasi: '', luasM2: '', packageId: '', tanggalMulai: '', targetSelesai: '', deskripsi: '', klienMode: 'baru', clientId: '', klienNama: '', klienEmail: '', klienPassword: '', arsitekIds: [] }
const STATUS = { AKTIF: 'Aktif', SELESAI: 'Selesai', DITUNDA: 'Ditunda' }

export default function Proyek() {
  const { data, error, loading, reload } = useApi('/admin/projects')
  const { data: akun } = useApi('/admin/users')
  const { data: paket } = useApi('/admin/packages')
  const [f, setF] = useState(null)
  const [err, setErr] = useState(null)
  const [ok, setOk] = useState(null)

  const klien = akun?.filter((u) => u.role === 'KLIEN' && u.aktif) ?? []
  const arsitek = akun?.filter((u) => u.role === 'ARSITEK' && u.aktif) ?? []
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const togglArsitek = (id) => setF({ ...f, arsitekIds: f.arsitekIds.includes(id) ? f.arsitekIds.filter((x) => x !== id) : [...f.arsitekIds, id] })

  async function simpan(e) {
    e.preventDefault()
    setErr(null)
    const body = {
      nama: f.nama,
      lokasi: kosongKeNull(f.lokasi),
      luasM2: angkaAtauNull(f.luasM2),
      packageId: angkaAtauNull(f.packageId),
      tanggalMulai: kosongKeNull(f.tanggalMulai),
      targetSelesai: kosongKeNull(f.targetSelesai),
      deskripsi: kosongKeNull(f.deskripsi),
      arsitekIds: f.arsitekIds,
      ...(f.klienMode === 'ada'
        ? { clientId: Number(f.clientId) }
        : { klienBaru: { nama: f.klienNama, email: f.klienEmail, password: f.klienPassword } }),
    }
    try {
      await kirim('POST', '/admin/projects', body)
      setOk('Proyek dibuat dengan 7 tahapan default. Sampaikan email dan password ke klien agar bisa memantau progres.')
      setF(null)
      reload()
    } catch (e2) { setErr(e2) }
  }

  return (
    <>
      <Judul aksi={!f && <Btn onClick={() => { setErr(null); setOk(null); setF({ ...kosong }) }}>Buat proyek</Btn>}>Proyek</Judul>
      <Pesan ok={ok} />
      {loading && <p className="text-sm">Memuat...</p>}
      <Pesan error={error} />

      {f && (
        <form onSubmit={simpan} className="mb-10 max-w-2xl space-y-5 border border-line bg-white p-6" aria-label="Proyek baru">
          <h2 className="font-display text-2xl font-medium">Proyek baru</h2>
          <Pesan error={err} />
          <Field label="Nama proyek"><input required minLength={2} value={f.nama} onChange={set('nama')} className={input} /></Field>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Lokasi"><input value={f.lokasi} onChange={set('lokasi')} className={input} /></Field>
            <Field label="Luas (m²)"><input type="number" min="1" value={f.luasM2} onChange={set('luasM2')} className={input} /></Field>
            <Field label="Paket">
              <select value={f.packageId} onChange={set('packageId')} className={input}>
                <option value="">Belum ditentukan</option>
                {paket?.map((p) => <option key={p.id} value={p.id}>{TINGKATAN[p.tingkatan]} · {LINGKUP[p.lingkup]}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Tanggal mulai"><input type="date" value={f.tanggalMulai} onChange={set('tanggalMulai')} className={input} /></Field>
            <Field label="Target selesai"><input type="date" value={f.targetSelesai} onChange={set('targetSelesai')} className={input} /></Field>
          </div>
          <Field label="Deskripsi"><textarea rows={3} value={f.deskripsi} onChange={set('deskripsi')} className={input} /></Field>

          <fieldset className="space-y-4 border-t border-line pt-5">
            <legend className="pr-2 text-sm">Klien</legend>
            <div className="flex gap-6 text-sm">
              <label className="flex items-center gap-2"><input type="radio" name="mode" checked={f.klienMode === 'baru'} onChange={() => setF({ ...f, klienMode: 'baru' })} /> Buat akun klien baru</label>
              <label className="flex items-center gap-2"><input type="radio" name="mode" checked={f.klienMode === 'ada'} onChange={() => setF({ ...f, klienMode: 'ada' })} /> Pilih klien yang sudah ada</label>
            </div>
            {f.klienMode === 'ada' ? (
              <Field label="Klien">
                <select required value={f.clientId} onChange={set('clientId')} className={input}>
                  <option value="">Pilih klien</option>
                  {klien.map((u) => <option key={u.id} value={u.id}>{u.nama} ({u.email})</option>)}
                </select>
              </Field>
            ) : (
              <div className="grid gap-5 sm:grid-cols-3">
                <Field label="Nama klien"><input required minLength={2} value={f.klienNama} onChange={set('klienNama')} className={input} /></Field>
                <Field label="Email klien"><input type="email" required value={f.klienEmail} onChange={set('klienEmail')} className={input} /></Field>
                <Field label="Password awal" hint="Minimal 8 karakter."><input type="password" autoComplete="new-password" required minLength={8} value={f.klienPassword} onChange={set('klienPassword')} className={input} /></Field>
              </div>
            )}
          </fieldset>

          <fieldset className="border-t border-line pt-5">
            <legend className="pr-2 text-sm">Arsitek yang ditugaskan</legend>
            {arsitek.length === 0 ? <p className="text-sm text-muted">Belum ada akun arsitek aktif. Buat di menu Akun.</p> : (
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                {arsitek.map((u) => <label key={u.id} className="flex items-center gap-2"><input type="checkbox" checked={f.arsitekIds.includes(u.id)} onChange={() => togglArsitek(u.id)} /> {u.nama}</label>)}
              </div>
            )}
          </fieldset>

          <div className="flex gap-3"><Btn type="submit">Buat proyek</Btn><Btn variant="garis" onClick={() => setF(null)}>Batal</Btn></div>
        </form>
      )}

      {data && (
        data.length === 0 ? <p className="text-sm text-muted">Belum ada proyek.</p> : (
          <Tabel>
            <thead><tr><Th>Proyek</Th><Th>Klien</Th><Th>Paket</Th><Th>Arsitek</Th><Th>Status</Th><Th>Progres</Th></tr></thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id}>
                  <Td><Link to={String(p.id)} className="underline underline-offset-4 hover:text-accent">{p.nama}</Link>{p.lokasi && <span className="block text-xs text-muted">{p.lokasi}</span>}</Td>
                  <Td>{p.klien.nama}</Td>
                  <Td>{p.package ? `${TINGKATAN[p.package.tingkatan]} · ${LINGKUP[p.package.lingkup]}` : '-'}</Td>
                  <Td>{p.anggota.map((a) => a.user.nama).join(', ') || '-'}</Td>
                  <Td>{STATUS[p.status]}</Td>
                  <Td>{p.progres}%</Td>
                </tr>
              ))}
            </tbody>
          </Tabel>
        )
      )}
    </>
  )
}
