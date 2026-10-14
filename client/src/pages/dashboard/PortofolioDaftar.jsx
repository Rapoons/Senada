import { useState } from 'react'
import { Link } from 'react-router-dom'
import { kirim, useApi } from '../../lib/api'
import { Btn, Judul, Pesan, Tabel, Td, Th, input, useTanya } from './ui'

function Kategori() {
  const { data: daftar, reload } = useApi('/categories')
  const [baru, setBaru] = useState('')
  const [err, setErr] = useState(null)
  const [tanya, dialog] = useTanya()

  const jalankan = async (fn) => { setErr(null); try { await fn(); reload() } catch (e) { setErr(e) } }

  return (
    <section className="mt-14" aria-labelledby="kategori">
      {dialog}
      <h2 id="kategori" className="font-display text-2xl font-medium">Kategori</h2>
      <Pesan error={err} />
      <ul className="mt-4 max-w-md divide-y divide-line border border-line bg-panel">
        {daftar?.map((k) => (
          <li key={k.id} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
            <span>{k.nama}</span>
            <span className="flex gap-2">
              <Btn variant="garis" onClick={async () => { const n = await tanya({ judul: 'Ubah kategori', nilai: k.nama }); if (n) jalankan(() => kirim('PATCH', `/admin/categories/${k.id}`, { nama: n })) }}>Ubah</Btn>
              <Btn variant="bahaya" onClick={async () => (await tanya({ judul: `Hapus kategori "${k.nama}"?`, tombol: 'Hapus', bahaya: true })) && jalankan(() => kirim('DELETE', `/admin/categories/${k.id}`))}>Hapus</Btn>
            </span>
          </li>
        ))}
      </ul>
      <form className="mt-3 flex max-w-md gap-2" onSubmit={(e) => { e.preventDefault(); jalankan(async () => { await kirim('POST', '/admin/categories', { nama: baru }); setBaru('') }) }}>
        <input aria-label="Nama kategori baru" placeholder="Kategori baru" required minLength={2} value={baru} onChange={(e) => setBaru(e.target.value)} className={input + ' mt-0'} />
        <Btn type="submit">Tambah</Btn>
      </form>
    </section>
  )
}

export default function PortofolioDaftar() {
  const { data, error, loading } = useApi('/admin/portfolios')

  return (
    <>
      <Judul aksi={<Link to="baru" className="bg-ink px-4 py-2 text-sm text-paper hover:bg-accent">Tambah proyek</Link>}>Portofolio</Judul>
      {loading && <p className="text-sm">Memuat...</p>}
      <Pesan error={error} />
      {data && (
        data.length === 0 ? <p className="text-sm text-muted">Belum ada proyek. Tambahkan yang pertama.</p> : (
          <Tabel>
            <thead><tr><Th>Gambar</Th><Th>Judul</Th><Th>Kategori</Th><Th>Status</Th><Th><span className="sr-only">Aksi</span></Th></tr></thead>
            <tbody>
              {data.map((p) => {
                const cover = p.gambar.find((g) => g.sampul) ?? p.gambar[0]
                return (
                  <tr key={p.id}>
                    <Td>{cover ? <img src={cover.path} alt="" className="h-12 w-16 object-cover" /> : <span className="text-xs text-muted">Belum ada</span>}</Td>
                    <Td>{p.judul}{p.unggulan && <span className="ml-2 text-xs text-accent">unggulan</span>}</Td>
                    <Td>{p.category.nama}</Td>
                    <Td>{p.terbit ? 'Terbit' : 'Draf'}</Td>
                    <Td><Link to={String(p.id)} className="underline underline-offset-4 hover:text-accent">Ubah</Link></Td>
                  </tr>
                )
              })}
            </tbody>
          </Tabel>
        )
      )}
      <Kategori />
    </>
  )
}
