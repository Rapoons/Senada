import { useEffect, useRef, useState } from 'react'

// Komponen kecil bersama untuk dashboard. Gaya tenang: garis tipis, sudut tegas, tanpa bayangan.

export const input = 'mt-1 block w-full border border-muted bg-panel px-3 py-2 text-sm focus:border-accent'

export function Field({ label, hint, className = '', children }) {
  return (
    <label className={`block text-sm ${className}`}>
      {label}
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  )
}

const gaya = {
  utama: 'bg-ink text-paper hover:bg-accent',
  garis: 'border border-ink/40 hover:bg-ink hover:text-paper',
  bahaya: 'border border-red-800/50 text-red-800 hover:bg-red-800 hover:text-paper',
}
export function Btn({ variant = 'utama', className = '', ...props }) {
  return <button type="button" {...props} className={`px-4 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${gaya[variant]} ${className}`} />
}

export function Judul({ children, aksi }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <h1 className="font-display text-4xl font-medium">{children}</h1>
      {aksi}
    </div>
  )
}

// Pesan error (merah) atau sukses; error dari server bisa membawa daftar detail per field.
export function Pesan({ error, ok }) {
  if (!error && !ok) return null
  return (
    <div role={error ? 'alert' : 'status'} className={`mb-4 border px-3 py-2 text-sm ${error ? 'border-red-800/40 text-red-800' : 'border-line text-ink'}`}>
      {error ? error.message : ok}
      {error?.details?.length > 0 && (
        <ul className="mt-1 list-disc pl-5">{error.details.map((d, i) => <li key={i}>{d.field}: {d.message}</li>)}</ul>
      )}
    </div>
  )
}

export const Tabel = ({ children }) => (
  <div className="overflow-x-auto border border-line bg-panel">
    <table className="w-full min-w-[560px] border-collapse text-left text-sm">{children}</table>
  </div>
)
export const Th = ({ children }) => <th className="border-b border-line px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted">{children}</th>
export const Td = ({ children, className = '' }) => <td className={`border-b border-line px-4 py-3 align-top ${className}`}>{children}</td>

export const kosongKeNull = (v) => (v === '' || v == null ? null : v)
export const angkaAtauNull = (v) => (v === '' || v == null ? null : Number(v))

// Pengganti window.prompt / window.confirm: dialog bawaan <dialog> bergaya dashboard.
// tanya({ judul, pesan?, nilai?, tombol?, bahaya? }) -> true (konfirmasi), teks (jika ada `nilai`), atau null (batal).
// Pasang {dialog} di dalam JSX komponen pemakai.
export function useTanya() {
  const [s, setS] = useState(null)
  const ref = useRef(null)
  useEffect(() => { if (s) ref.current?.showModal() }, [s])
  const tanya = (opsi) => new Promise((resolve) => setS({ ...opsi, resolve }))
  const tutup = (hasil) => { s.resolve(hasil); ref.current?.close(); setS(null) }
  const dialog = s && (
    <dialog ref={ref} onCancel={(e) => { e.preventDefault(); tutup(null) }} className="m-auto w-full max-w-sm border border-ink bg-paper p-6 text-ink backdrop:bg-ink/40">
      <form onSubmit={(e) => { e.preventDefault(); tutup(s.nilai !== undefined ? new FormData(e.currentTarget).get('nilai') : true) }}>
        <p className="font-display text-2xl">{s.judul}</p>
        {s.pesan && <p className="mt-2 text-sm">{s.pesan}</p>}
        {s.nilai !== undefined && <input name="nilai" defaultValue={s.nilai} required autoFocus className={input} />}
        <div className="mt-6 flex justify-end gap-2">
          <Btn variant="garis" onClick={() => tutup(null)}>Batal</Btn>
          <Btn type="submit" variant={s.bahaya ? 'bahaya' : 'utama'}>{s.tombol || 'Simpan'}</Btn>
        </div>
      </form>
    </dialog>
  )
  return [tanya, dialog]
}
