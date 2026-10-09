import { useNavigate } from 'react-router-dom'
import { kirim, useApi } from '../../lib/api'
import { waktu } from '../../lib/format'
import { Btn, Judul, Pesan } from './ui'

// Beri tahu sidebar agar menghitung ulang lencana "belum dibaca".
const segarkan = () => window.dispatchEvent(new Event('senada:notif'))

export default function Notifikasi() {
  const { data, error, loading, reload } = useApi('/notifications')
  const navigate = useNavigate()

  async function buka(n) {
    if (!n.dibaca) { await kirim('PATCH', `/notifications/${n.id}/read`).catch(() => {}); segarkan() }
    if (n.projectId) navigate(`/dashboard/proyek/${n.projectId}`)
    else reload()
  }
  async function semua() { await kirim('POST', '/notifications/read-all'); segarkan(); reload() }

  return (
    <>
      <Judul aksi={data?.belumDibaca > 0 && <Btn variant="garis" onClick={semua}>Tandai semua dibaca</Btn>}>Notifikasi</Judul>
      {loading && <p className="text-sm">Memuat...</p>}
      <Pesan error={error} />
      {data?.items.length === 0 && <p className="text-sm text-muted">Belum ada notifikasi.</p>}
      <ul className="max-w-2xl border-t border-ink">
        {data?.items.map((n) => (
          <li key={n.id} className="border-b border-line">
            <button onClick={() => buka(n)} className="block w-full py-4 text-left hover:text-accent">
              <span className={`block text-sm ${n.dibaca ? 'text-muted' : 'font-medium'}`}>
                {!n.dibaca && <span className="mr-2 inline-block h-2 w-2 bg-accent align-middle" aria-label="Belum dibaca" />}
                {n.pesan}
              </span>
              <span className="mt-1 block text-xs text-muted">{waktu(n.createdAt)}</span>
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}
