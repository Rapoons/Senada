import { useState } from 'react'
import { kirim, unduh, useApi } from '../../../lib/api'
import { ukuran, waktu } from '../../../lib/format'
import { Btn, Field, Pesan, input } from '../ui'

// Dokumen proyek. Nama dokumen yang sama = versi baru, jadi riwayat revisi gambar kerja terlihat.
export default function Dokumen({ proyek, user }) {
  const { data, error, reload } = useApi(`/projects/${proyek.id}/files`)
  const [err, setErr] = useState(null)
  const [ok, setOk] = useState(null)
  const [sibuk, setSibuk] = useState(false)
  const staf = user.role !== 'KLIEN'

  // Kelompokkan per nama dokumen; server sudah mengurutkan versi terbaru lebih dulu.
  const kelompok = Object.entries(Object.groupBy(data ?? [], (f) => f.nama))

  async function unggah(e) {
    e.preventDefault()
    const form = e.currentTarget
    const f = new FormData(form)
    for (const [k, v] of [...f.entries()]) if (v === '') f.delete(k) // kolom kosong tidak dikirim
    setErr(null); setOk(null); setSibuk(true)
    try {
      const hasil = await kirim('POST', `/projects/${proyek.id}/files`, f)
      setOk(`"${hasil.nama}" tersimpan sebagai versi ${hasil.versi}. Klien diberi tahu.`)
      form.reset()
      reload()
    } catch (e2) { setErr(e2) } finally { setSibuk(false) }
  }

  const aksi = (fn) => async () => { setErr(null); try { await fn() ; reload() } catch (e) { setErr(e) } }
  const bolehHapus = (f) => user.role === 'ADMIN' || (user.role === 'ARSITEK' && f.pengunggah.id === user.id)

  return (
    <section aria-labelledby="dokumen" className="mt-14">
      <h2 id="dokumen" className="font-display text-2xl font-medium">Dokumen</h2>
      <div className="mt-4"><Pesan error={err || error} ok={ok} /></div>

      {data && kelompok.length === 0 && <p className="text-sm text-muted">Belum ada dokumen.</p>}
      <ul className="border-t border-ink">
        {kelompok.map(([nama, versi]) => {
          const [terbaru, ...lama] = versi
          const baris = (f, tebal) => (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className={tebal ? 'text-base' : 'text-sm'}>{tebal && nama} <span className="text-muted">v{f.versi}</span></p>
                <p className="text-xs text-muted">{ukuran(f.ukuran)} · {f.pengunggah.nama} · {waktu(f.createdAt)}</p>
                {f.catatanRevisi && <p className="mt-1 text-xs">Catatan revisi: {f.catatanRevisi}</p>}
              </div>
              <span className="flex gap-2">
                <Btn variant="garis" onClick={aksi(() => unduh(`/files/${f.id}/download`))}>Unduh</Btn>
                {staf && bolehHapus(f) && <Btn variant="bahaya" onClick={() => window.confirm(`Hapus "${nama}" v${f.versi}?`) && aksi(() => kirim('DELETE', `/files/${f.id}`))()}>Hapus</Btn>}
              </span>
            </div>
          )
          return (
            <li key={nama} className="border-b border-line py-4">
              {baris(terbaru, true)}
              {lama.length > 0 && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs text-muted">Versi sebelumnya ({lama.length})</summary>
                  <div className="mt-3 space-y-3 border-l border-line pl-4">{lama.map((f) => <div key={f.id}>{baris(f, false)}</div>)}</div>
                </details>
              )}
            </li>
          )
        })}
      </ul>

      {staf && (
        <form onSubmit={unggah} className="mt-8 max-w-xl space-y-4 border border-line bg-white p-5" aria-label="Unggah dokumen">
          <h3 className="text-sm font-medium">Unggah dokumen atau gambar kerja</h3>
          <Field label="File" hint="PDF, DWG, DOCX, XLSX, ZIP, JPG, PNG, atau WebP. Maksimal 25 MB.">
            <input name="berkas" type="file" required accept=".pdf,.dwg,.docx,.xlsx,.zip,.jpg,.jpeg,.png,.webp" className="mt-1 block text-sm" />
          </Field>
          <Field label="Nama dokumen" hint="Pakai nama yang sama dengan dokumen sebelumnya untuk membuat versi baru.">
            <input name="nama" maxLength={150} placeholder="mis. Denah Lantai 1" className={input} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tahapan terkait">
              <select name="stageId" className={input} defaultValue="">
                <option value="">Tidak ditentukan</option>
                {proyek.tahapan.map((t) => <option key={t.id} value={t.id}>{t.nama}</option>)}
              </select>
            </Field>
            <Field label="Catatan revisi"><input name="catatanRevisi" maxLength={300} placeholder="Apa yang berubah?" className={input} /></Field>
          </div>
          <Btn type="submit" disabled={sibuk}>{sibuk ? 'Mengunggah...' : 'Unggah'}</Btn>
        </form>
      )}
    </section>
  )
}
