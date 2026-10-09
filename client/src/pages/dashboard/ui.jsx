// Komponen kecil bersama untuk dashboard. Gaya tenang: garis tipis, sudut tegas, tanpa bayangan.

export const input = 'mt-1 block w-full border border-muted bg-white px-3 py-2 text-sm focus:border-accent'

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
  <div className="overflow-x-auto border border-line bg-white">
    <table className="w-full min-w-[560px] border-collapse text-left text-sm">{children}</table>
  </div>
)
export const Th = ({ children }) => <th className="border-b border-line px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted">{children}</th>
export const Td = ({ children, className = '' }) => <td className={`border-b border-line px-4 py-3 align-top ${className}`}>{children}</td>

export const kosongKeNull = (v) => (v === '' || v == null ? null : v)
export const angkaAtauNull = (v) => (v === '' || v == null ? null : Number(v))
