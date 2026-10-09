import { useState } from 'react'
import { kirim, useApi } from '../../lib/api'
import { LINGKUP, TINGKATAN, rupiah } from '../../lib/estimasi'
import { Btn, Field, Judul, Pesan, Tabel, Td, Th, input } from './ui'

export default function PaketAdmin() {
  const { data: paket, error, loading, reload } = useApi('/admin/packages')
  const [edit, setEdit] = useState(null) // { id, tarif, aktif, fasilitas (teks, satu per baris) }
  const [err, setErr] = useState(null)
  const [ok, setOk] = useState(null)

  const mulai = (p) => { setErr(null); setOk(null); setEdit({ id: p.id, tarif: String(p.tarifPerM2), aktif: p.aktif, fasilitas: p.fasilitas.map((f) => f.teks).join('\n') }) }

  async function simpan(e) {
    e.preventDefault()
    setErr(null)
    try {
      await kirim('PATCH', `/admin/packages/${edit.id}`, {
        tarifPerM2: Number(edit.tarif),
        aktif: edit.aktif,
        fasilitas: edit.fasilitas.split('\n').map((s) => s.trim()).filter(Boolean),
      })
      setEdit(null)
      setOk('Paket disimpan. Perubahan langsung tampil di halaman publik.')
      reload()
    } catch (e2) { setErr(e2) }
  }

  if (loading) return <p className="text-sm">Memuat...</p>
  if (error) return <Pesan error={error} />

  return (
    <>
      <Judul>Paket dan tarif</Judul>
      <Pesan ok={ok} />
      <Tabel>
        <thead><tr><Th>Tingkatan</Th><Th>Lingkup</Th><Th>Tarif per m²</Th><Th>Status</Th><Th>Fasilitas</Th><Th><span className="sr-only">Aksi</span></Th></tr></thead>
        <tbody>
          {paket.map((p) => (
            <tr key={p.id}>
              <Td>{TINGKATAN[p.tingkatan]}</Td>
              <Td>{LINGKUP[p.lingkup]}</Td>
              <Td>{rupiah(p.tarifPerM2)}</Td>
              <Td>{p.aktif ? 'Aktif' : 'Nonaktif'}</Td>
              <Td>{p.fasilitas.length} poin</Td>
              <Td><Btn variant="garis" onClick={() => mulai(p)}>Ubah</Btn></Td>
            </tr>
          ))}
        </tbody>
      </Tabel>

      {edit && (
        <form onSubmit={simpan} className="mt-8 max-w-xl space-y-5 border border-line bg-white p-6" aria-label="Ubah paket">
          <h2 className="font-display text-2xl font-medium">
            {(() => { const p = paket.find((x) => x.id === edit.id); return `${TINGKATAN[p.tingkatan]} · ${LINGKUP[p.lingkup]}` })()}
          </h2>
          <Pesan error={err} />
          <Field label="Tarif per m² (Rp)" hint="Estimasi di website = luas × tarif ini.">
            <input type="number" min="1000" step="1000" required value={edit.tarif} onChange={(e) => setEdit({ ...edit, tarif: e.target.value })} className={input} />
          </Field>
          <Field label="Fasilitas" hint="Satu poin per baris.">
            <textarea rows={7} value={edit.fasilitas} onChange={(e) => setEdit({ ...edit, fasilitas: e.target.value })} className={input} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={edit.aktif} onChange={(e) => setEdit({ ...edit, aktif: e.target.checked })} />
            Tampilkan di website
          </label>
          <div className="flex gap-3">
            <Btn type="submit">Simpan</Btn>
            <Btn variant="garis" onClick={() => setEdit(null)}>Batal</Btn>
          </div>
        </form>
      )}
    </>
  )
}
