import { useState } from 'react'
import { kirim } from '../../../lib/api'
import { STATUS_TAHAP, terlambat, tgl, tglInput } from '../../../lib/format'
import { Btn, Pesan, input, useTanya } from '../ui'

// Tahapan proyek sebagai timeline. Arsitek/admin mengubah status; admin juga menambah, menggeser,
// mengganti nama, mengatur target, dan menghapus. Klien hanya melihat.
export default function Tahapan({ proyek, user, reload }) {
  const [err, setErr] = useState(null)
  const [tanya, dialog] = useTanya()
  const [baru, setBaru] = useState({ nama: '', tanggalTarget: '' })
  const staf = user.role !== 'KLIEN'
  const admin = user.role === 'ADMIN'
  const base = `/projects/${proyek.id}/stages`

  const jalankan = async (fn) => { setErr(null); try { await fn(); reload() } catch (e) { setErr(e) } }

  return (
    <section aria-labelledby="tahapan" className="mt-14">
      {dialog}
      <h2 id="tahapan" className="font-display text-2xl font-medium">Tahapan</h2>
      <div className="mt-4"><Pesan error={err} /></div>

      <ol className="border-t border-ink">
        {proyek.tahapan.map((t, i) => (
          <li key={t.id} className="grid gap-3 border-b border-line py-5 md:grid-cols-[2.5rem_1fr_auto] md:gap-6">
            <span className={`font-display text-2xl ${t.status === 'SELESAI' ? 'text-accent' : 'text-muted'}`}>{String(i + 1).padStart(2, '0')}</span>
            <div>
              <p className="text-base">{t.nama}</p>
              <p className="mt-1 text-xs text-muted">
                Mulai {tgl(t.tanggalMulai)} · Target {tgl(t.tanggalTarget)} · Selesai {tgl(t.tanggalSelesai)}
                {terlambat(t) && <span className="ml-2 text-red-800">Terlambat</span>}
              </p>
              {admin && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <label className="text-xs text-muted">Target
                    <input type="date" defaultValue={tglInput(t.tanggalTarget)} onChange={(e) => jalankan(() => kirim('PATCH', `${base}/${t.id}`, { tanggalTarget: e.target.value || null }))} className={input + ' ml-2 inline-block w-auto py-1'} />
                  </label>
                  <Btn variant="garis" onClick={async () => { const n = await tanya({ judul: 'Ganti nama tahapan', nilai: t.nama }); if (n && n !== t.nama) jalankan(() => kirim('PATCH', `${base}/${t.id}`, { nama: n })) }}>Ganti nama</Btn>
                  <Btn variant="garis" disabled={i === 0} aria-label="Geser ke atas" onClick={() => jalankan(() => kirim('POST', `${base}/${t.id}/move`, { arah: 'naik' }))}>&uarr;</Btn>
                  <Btn variant="garis" disabled={i === proyek.tahapan.length - 1} aria-label="Geser ke bawah" onClick={() => jalankan(() => kirim('POST', `${base}/${t.id}/move`, { arah: 'turun' }))}>&darr;</Btn>
                  <Btn variant="bahaya" onClick={async () => (await tanya({ judul: `Hapus tahapan "${t.nama}"?`, tombol: 'Hapus', bahaya: true })) && jalankan(() => kirim('DELETE', `${base}/${t.id}`))}>Hapus</Btn>
                </div>
              )}
            </div>
            {staf ? (
              <select aria-label={`Status ${t.nama}`} value={t.status} onChange={(e) => jalankan(() => kirim('PATCH', `${base}/${t.id}`, { status: e.target.value }))} className={input + ' mt-0 w-40 self-start'}>
                {Object.entries(STATUS_TAHAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            ) : (
              <span className={`self-start text-sm ${t.status === 'SELESAI' ? 'text-accent' : ''}`}>{STATUS_TAHAP[t.status]}</span>
            )}
          </li>
        ))}
      </ol>

      {admin && (
        <form className="mt-4 flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); jalankan(async () => { await kirim('POST', base, { nama: baru.nama, tanggalTarget: baru.tanggalTarget || null }); setBaru({ nama: '', tanggalTarget: '' }) }) }}>
          <label className="text-sm">Tahapan baru
            <input required minLength={2} value={baru.nama} onChange={(e) => setBaru({ ...baru, nama: e.target.value })} className={input} />
          </label>
          <label className="text-sm">Target
            <input type="date" value={baru.tanggalTarget} onChange={(e) => setBaru({ ...baru, tanggalTarget: e.target.value })} className={input} />
          </label>
          <Btn type="submit">Tambah</Btn>
        </form>
      )}
    </section>
  )
}
