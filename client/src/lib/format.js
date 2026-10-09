// Tanggal kolom DATE dari server berbentuk ISO UTC; tampilkan tanpa geser zona waktu.
export const tgl = (iso) => (iso ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '-')
export const tglInput = (iso) => (iso ? iso.slice(0, 10) : '')
export const waktu = (iso) => new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
export const ukuran = (b) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`)
export const terlambat = (t) => t.status !== 'SELESAI' && t.tanggalTarget && new Date(t.tanggalTarget) < new Date(new Date().toDateString())
export const PERAN = { ADMIN: 'Admin', ARSITEK: 'Arsitek', KLIEN: 'Klien' }
export const STATUS_PROYEK = { AKTIF: 'Aktif', SELESAI: 'Selesai', DITUNDA: 'Ditunda' }
export const STATUS_TAHAP = { BELUM: 'Belum mulai', BERJALAN: 'Berjalan', SELESAI: 'Selesai' }
