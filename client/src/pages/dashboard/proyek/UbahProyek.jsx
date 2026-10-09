import { useState } from 'react'
import { kirim, useApi } from '../../../lib/api'
import { LINGKUP, TINGKATAN } from '../../../lib/estimasi'
import { STATUS_PROYEK, tglInput } from '../../../lib/format'
import { Btn, Field, Pesan, angkaAtauNull, input, kosongKeNull } from '../ui'

// Form admin: ubah data proyek dan penugasan arsitek.
export default function UbahProyek({ proyek, onSelesai }) {
  const { data: akun } = useApi('/admin/users')
  const { data: paket } = useApi('/admin/packages')
  const [f, setF] = useState({
    nama: proyek.nama, status: proyek.status, lokasi: proyek.lokasi ?? '', luasM2: proyek.luasM2 ?? '', packageId: proyek.packageId ?? '',
    tanggalMulai: tglInput(proyek.tanggalMulai), targetSelesai: tglInput(proyek.targetSelesai), deskripsi: proyek.deskripsi ?? '',
    arsitekIds: proyek.anggota.map((a) => a.user.id),
  })
  const [err, setErr] = useState(null)
  const arsitek = akun?.filter((u) => u.role === 'ARSITEK' && u.aktif) ?? []
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const toggle = (id) => setF({ ...f, arsitekIds: f.arsitekIds.includes(id) ? f.arsitekIds.filter((x) => x !== id) : [...f.arsitekIds, id] })

  async function simpan(e) {
    e.preventDefault()
    setErr(null)
    try {
      await kirim('PATCH', `/projects/${proyek.id}`, {
        nama: f.nama, status: f.status, lokasi: kosongKeNull(f.lokasi), luasM2: angkaAtauNull(f.luasM2), packageId: angkaAtauNull(f.packageId),
        tanggalMulai: kosongKeNull(f.tanggalMulai), targetSelesai: kosongKeNull(f.targetSelesai), deskripsi: kosongKeNull(f.deskripsi), arsitekIds: f.arsitekIds,
      })
      onSelesai()
    } catch (e2) { setErr(e2) }
  }

  return (
    <form onSubmit={simpan} className="mt-8 max-w-2xl space-y-5 border border-line bg-white p-6" aria-label="Ubah proyek">
      <Pesan error={err} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nama proyek"><input required minLength={2} value={f.nama} onChange={set('nama')} className={input} /></Field>
        <Field label="Status">
          <select value={f.status} onChange={set('status')} className={input}>
            {Object.entries(STATUS_PROYEK).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
      </div>
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
      <fieldset>
        <legend className="mb-2 text-sm">Arsitek yang ditugaskan</legend>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {arsitek.map((u) => <label key={u.id} className="flex items-center gap-2"><input type="checkbox" checked={f.arsitekIds.includes(u.id)} onChange={() => toggle(u.id)} /> {u.nama}</label>)}
          {akun && arsitek.length === 0 && <span className="text-muted">Belum ada akun arsitek aktif.</span>}
        </div>
      </fieldset>
      <div className="flex gap-3"><Btn type="submit">Simpan</Btn><Btn variant="garis" onClick={onSelesai}>Batal</Btn></div>
    </form>
  )
}
