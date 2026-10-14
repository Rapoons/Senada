import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { kirim, useApi } from '../../lib/api'
import { LINGKUP, TINGKATAN } from '../../lib/estimasi'
import { Btn, Field, Judul, Pesan, angkaAtauNull, input, kosongKeNull, useTanya } from './ui'

const kosong = { judul: '', categoryId: '', packageId: '', lokasi: '', luasM2: '', tahun: '', deskripsi: '', unggulan: false, terbit: false }

function Galeri({ item, onUbah }) {
  const [err, setErr] = useState(null)
  const [tanya, dialog] = useTanya()
  const [sibuk, setSibuk] = useState(false)

  const jalankan = async (fn) => {
    setErr(null); setSibuk(true)
    try { onUbah(await fn()) } catch (e) { setErr(e) } finally { setSibuk(false) }
  }
  const unggah = (e) => {
    const form = new FormData()
    ;[...e.target.files].forEach((f) => form.append('gambar', f))
    e.target.value = ''
    if ([...form.keys()].length) jalankan(() => kirim('POST', `/admin/portfolios/${item.id}/images`, form))
  }

  return (
    <section className="mt-14" aria-labelledby="galeri">
      {dialog}
      <h2 id="galeri" className="font-display text-2xl font-medium">Galeri foto</h2>
      <p className="mt-1 text-sm text-muted">JPG, PNG, atau WebP, maksimal 5 MB per foto. Foto bertanda sampul tampil di kartu portofolio.</p>
      <div className="mt-4"><Pesan error={err} /></div>
      <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={unggah} disabled={sibuk} aria-label="Unggah foto" className="text-sm" />

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {item.gambar.map((g) => (
          <li key={g.id} className="border border-line bg-panel p-3">
            <img src={g.path} alt={g.alt || ''} className="aspect-[4/3] w-full object-cover" />
            <input
              defaultValue={g.alt ?? ''}
              placeholder="Teks alternatif (deskripsi foto)"
              aria-label="Teks alternatif"
              onBlur={(e) => e.target.value !== (g.alt ?? '') && jalankan(() => kirim('PATCH', `/admin/portfolio-images/${g.id}`, { alt: e.target.value }))}
              className={input}
            />
            <div className="mt-3 flex items-center justify-between gap-2">
              {g.sampul ? <span className="text-xs text-accent">Sampul</span> : <Btn variant="garis" onClick={() => jalankan(() => kirim('PATCH', `/admin/portfolio-images/${g.id}`, { sampul: true }))}>Jadikan sampul</Btn>}
              <Btn variant="bahaya" onClick={async () => (await tanya({ judul: 'Hapus foto ini?', tombol: 'Hapus', bahaya: true })) && jalankan(() => kirim('DELETE', `/admin/portfolio-images/${g.id}`))}>Hapus</Btn>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function PortofolioForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: kategori } = useApi('/categories')
  const { data: paket } = useApi('/admin/packages')
  const { data: item, error: errMuat } = useApi(id ? `/admin/portfolios/${id}` : null)
  const [f, setF] = useState(kosong)
  const [galeri, setGaleri] = useState(null)
  const [tanya, dialog] = useTanya()
  const [err, setErr] = useState(null)
  const [ok, setOk] = useState(null)

  useEffect(() => {
    if (!item) return
    setGaleri(item)
    setF({ ...kosong, ...Object.fromEntries(Object.keys(kosong).map((k) => [k, item[k] ?? kosong[k]])), luasM2: item.luasM2 ?? '', tahun: item.tahun ?? '' })
  }, [item])

  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  async function simpan(e) {
    e.preventDefault()
    setErr(null); setOk(null)
    const body = {
      judul: f.judul,
      categoryId: Number(f.categoryId),
      packageId: angkaAtauNull(f.packageId),
      lokasi: kosongKeNull(f.lokasi),
      luasM2: angkaAtauNull(f.luasM2),
      tahun: angkaAtauNull(f.tahun),
      deskripsi: kosongKeNull(f.deskripsi),
      unggulan: f.unggulan,
      terbit: f.terbit,
    }
    try {
      if (id) { await kirim('PATCH', `/admin/portfolios/${id}`, body); setOk('Perubahan disimpan.') }
      else { const baru = await kirim('POST', '/admin/portfolios', body); navigate(`/dashboard/portofolio/${baru.id}`, { replace: true }) }
    } catch (e2) { setErr(e2) }
  }

  async function hapus() {
    if (!(await tanya({ judul: `Hapus proyek "${f.judul}"?`, pesan: 'Semua fotonya ikut terhapus. Tindakan ini tidak bisa dibatalkan.', tombol: 'Hapus', bahaya: true }))) return
    try { await kirim('DELETE', `/admin/portfolios/${id}`); navigate('/dashboard/portofolio') } catch (e) { setErr(e) }
  }

  return (
    <>
      {dialog}
      <Judul aksi={<Link to="/dashboard/portofolio" className="text-sm underline underline-offset-4 hover:text-accent">Kembali ke daftar</Link>}>
        {id ? 'Ubah proyek' : 'Proyek baru'}
      </Judul>
      <Pesan error={errMuat} />

      <form onSubmit={simpan} className="max-w-2xl space-y-5">
        <Pesan error={err} ok={ok} />
        <Field label="Judul"><input required minLength={2} value={f.judul} onChange={set('judul')} className={input} /></Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Kategori">
            <select required value={f.categoryId} onChange={set('categoryId')} className={input}>
              <option value="">Pilih kategori</option>
              {kategori?.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
          </Field>
          <Field label="Paket yang dipakai (opsional)">
            <select value={f.packageId ?? ''} onChange={set('packageId')} className={input}>
              <option value="">Tidak ditentukan</option>
              {paket?.map((p) => <option key={p.id} value={p.id}>{TINGKATAN[p.tingkatan]} · {LINGKUP[p.lingkup]}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Lokasi"><input value={f.lokasi} onChange={set('lokasi')} className={input} /></Field>
          <Field label="Luas (m²)"><input type="number" min="1" value={f.luasM2} onChange={set('luasM2')} className={input} /></Field>
          <Field label="Tahun"><input type="number" min="1900" max="2100" value={f.tahun} onChange={set('tahun')} className={input} /></Field>
        </div>
        <Field label="Deskripsi"><textarea rows={5} value={f.deskripsi} onChange={set('deskripsi')} className={input} /></Field>
        <div className="flex flex-wrap gap-8 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.terbit} onChange={set('terbit')} /> Terbitkan di website</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.unggulan} onChange={set('unggulan')} /> Proyek unggulan</label>
        </div>
        <div className="flex gap-3">
          <Btn type="submit">{id ? 'Simpan perubahan' : 'Simpan dan lanjut ke foto'}</Btn>
          {id && <Btn variant="bahaya" onClick={hapus}>Hapus proyek</Btn>}
        </div>
      </form>

      {id && galeri && <Galeri item={galeri} onUbah={setGaleri} />}
    </>
  )
}
