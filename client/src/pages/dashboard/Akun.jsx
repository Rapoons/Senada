import { useState } from 'react'
import { kirim, useApi } from '../../lib/api'
import { Btn, Field, Judul, Pesan, Tabel, Td, Th, input, kosongKeNull } from './ui'

const kosong = { nama: '', email: '', telepon: '', role: 'KLIEN', password: '', aktif: true }

export default function Akun() {
  const { data, error, loading, reload } = useApi('/admin/users')
  const [f, setF] = useState(null) // null = form tertutup; { id? , ... } = buat/ubah
  const [err, setErr] = useState(null)
  const [ok, setOk] = useState(null)

  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const buka = (u) => { setErr(null); setOk(null); setF(u ? { ...kosong, ...u, telepon: u.telepon ?? '', password: '' } : { ...kosong }) }

  async function simpan(e) {
    e.preventDefault()
    setErr(null)
    try {
      if (f.id) {
        // Email tidak bisa diubah; password hanya dikirim bila diisi (reset).
        await kirim('PATCH', `/admin/users/${f.id}`, { nama: f.nama, telepon: kosongKeNull(f.telepon), role: f.role, aktif: f.aktif, ...(f.password && { password: f.password }) })
      } else {
        await kirim('POST', '/admin/users', { nama: f.nama, email: f.email, telepon: kosongKeNull(f.telepon), role: f.role, password: f.password })
      }
      setOk(f.id ? 'Akun diperbarui.' : 'Akun dibuat. Sampaikan email dan password ke pemiliknya.')
      setF(null)
      reload()
    } catch (e2) { setErr(e2) }
  }

  return (
    <>
      <Judul aksi={!f && <Btn onClick={() => buka()}>Tambah akun</Btn>}>Akun</Judul>
      <Pesan ok={ok} />
      {loading && <p className="text-sm">Memuat...</p>}
      <Pesan error={error} />

      {f && (
        <form onSubmit={simpan} className="mb-10 max-w-xl space-y-5 border border-line bg-white p-6" aria-label={f.id ? 'Ubah akun' : 'Akun baru'}>
          <h2 className="font-display text-2xl font-medium">{f.id ? 'Ubah akun' : 'Akun baru'}</h2>
          <Pesan error={err} />
          <Field label="Nama"><input required minLength={2} value={f.nama} onChange={set('nama')} className={input} /></Field>
          <Field label="Email"><input type="email" required disabled={!!f.id} value={f.email} onChange={set('email')} className={input + ' disabled:bg-paper disabled:text-muted'} /></Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Telepon"><input value={f.telepon} onChange={set('telepon')} className={input} /></Field>
            <Field label="Peran">
              <select value={f.role} onChange={set('role')} className={input}>
                <option value="KLIEN">Klien</option><option value="ARSITEK">Arsitek</option><option value="ADMIN">Admin</option>
              </select>
            </Field>
          </div>
          <Field label={f.id ? 'Password baru (kosongkan jika tidak diubah)' : 'Password'} hint="Minimal 8 karakter.">
            <input type="password" autoComplete="new-password" required={!f.id} minLength={8} value={f.password} onChange={set('password')} className={input} />
          </Field>
          {f.id && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.aktif} onChange={set('aktif')} /> Akun aktif (boleh login)</label>}
          <div className="flex gap-3"><Btn type="submit">Simpan</Btn><Btn variant="garis" onClick={() => setF(null)}>Batal</Btn></div>
        </form>
      )}

      {data && (
        <Tabel>
          <thead><tr><Th>Nama</Th><Th>Email</Th><Th>Peran</Th><Th>Status</Th><Th><span className="sr-only">Aksi</span></Th></tr></thead>
          <tbody>
            {data.map((u) => (
              <tr key={u.id}>
                <Td>{u.nama}</Td><Td>{u.email}</Td><Td>{u.role}</Td><Td>{u.aktif ? 'Aktif' : 'Nonaktif'}</Td>
                <Td><Btn variant="garis" onClick={() => buka(u)}>Ubah</Btn></Td>
              </tr>
            ))}
          </tbody>
        </Tabel>
      )}
    </>
  )
}
