import { useState } from 'react'
import { kirim, useApi } from '../../../lib/api'
import { PERAN, waktu } from '../../../lib/format'
import { Btn, Pesan, input } from '../ui'

function Item({ c, balasan, onBalas }) {
  return (
    <li className="border-b border-line py-4">
      <p className="text-sm">
        <span className="font-medium">{c.user.nama}</span>
        <span className="ml-2 text-xs text-muted">{PERAN[c.user.role]} · {waktu(c.createdAt)}</span>
        {c.jenis === 'REVISI' && <span className="ml-2 border border-accent px-1.5 py-0.5 text-[11px] uppercase tracking-wider text-accent">Revisi</span>}
      </p>
      <p className="mt-1 whitespace-pre-wrap text-sm">{c.isi}</p>
      {onBalas && <button onClick={() => onBalas(c)} className="mt-2 text-xs underline underline-offset-4 hover:text-accent">Balas</button>}
      {balasan.length > 0 && (
        <ul className="mt-3 border-l border-line pl-4">
          {balasan.map((b) => <Item key={b.id} c={b} balasan={[]} />)}
        </ul>
      )}
    </li>
  )
}

// Diskusi proyek. Klien boleh memilih "Ajukan revisi"; arsitek/admin membalas.
export default function Diskusi({ proyek, user }) {
  const { data, error, reload } = useApi(`/projects/${proyek.id}/comments`)
  const [isi, setIsi] = useState('')
  const [jenis, setJenis] = useState('KOMENTAR')
  const [balas, setBalas] = useState(null)
  const [err, setErr] = useState(null)

  const utama = data?.filter((c) => !c.parentId) ?? []
  const anak = (id) => data?.filter((c) => c.parentId === id) ?? []

  async function kirimKomentar(e) {
    e.preventDefault()
    setErr(null)
    try {
      await kirim('POST', `/projects/${proyek.id}/comments`, { isi, jenis: balas ? 'KOMENTAR' : jenis, parentId: balas?.id ?? null })
      setIsi(''); setBalas(null); setJenis('KOMENTAR')
      reload()
    } catch (e2) { setErr(e2) }
  }

  return (
    <section aria-labelledby="diskusi" className="mt-14">
      <h2 id="diskusi" className="font-display text-2xl font-medium">Diskusi dan revisi</h2>
      <div className="mt-4"><Pesan error={error} /></div>
      {data && utama.length === 0 && <p className="text-sm text-muted">Belum ada komentar.</p>}
      <ul className="border-t border-ink">
        {utama.map((c) => <Item key={c.id} c={c} balasan={anak(c.id)} onBalas={setBalas} />)}
      </ul>

      <form onSubmit={kirimKomentar} className="mt-6 max-w-xl space-y-3" aria-label="Tulis komentar">
        <Pesan error={err} />
        {balas && (
          <p className="text-xs text-muted">Membalas {balas.user.nama}. <button type="button" onClick={() => setBalas(null)} className="underline">Batal</button></p>
        )}
        <textarea required maxLength={3000} rows={3} value={isi} onChange={(e) => setIsi(e.target.value)} aria-label="Isi komentar"
          placeholder={user.role === 'KLIEN' ? 'Tulis komentar atau jelaskan revisi yang diminta' : 'Tulis balasan untuk klien'} className={input} />
        <div className="flex flex-wrap items-center gap-3">
          {user.role === 'KLIEN' && !balas && (
            <select aria-label="Jenis" value={jenis} onChange={(e) => setJenis(e.target.value)} className={input + ' mt-0 w-auto'}>
              <option value="KOMENTAR">Komentar</option>
              <option value="REVISI">Ajukan revisi</option>
            </select>
          )}
          <Btn type="submit">Kirim</Btn>
        </div>
      </form>
    </section>
  )
}
