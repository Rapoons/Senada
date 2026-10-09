import { useCallback, useEffect, useState } from 'react'

// Token login disimpan di localStorage. Catatan keamanan: rentan jika ada celah XSS;
// untuk skala proyek ini diterima, alternatif produksi adalah cookie httpOnly.
const KUNCI = 'senada_token'
export const getToken = () => { try { return localStorage.getItem(KUNCI) } catch { return null } }
export const setToken = (t) => { try { t ? localStorage.setItem(KUNCI, t) : localStorage.removeItem(KUNCI) } catch { /* abaikan */ } }

// Semua panggilan API lewat sini. Respons server: { success, data } atau { success:false, message, details }.
// body boleh objek (dikirim JSON) atau FormData (unggah file).
export async function kirim(method, path, body) {
  const token = getToken()
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(body && !(body instanceof FormData) && { 'Content-Type': 'application/json' }),
    },
    body: body instanceof FormData ? body : body && JSON.stringify(body),
  })
  const json = await res.json().catch(() => null)
  if (!res.ok || !json?.success) {
    // Token kedaluwarsa atau ditolak: paksa keluar (didengar oleh AuthProvider).
    if (res.status === 401 && token) window.dispatchEvent(new Event('senada:logout'))
    const err = new Error(json?.message || 'Gagal memuat data')
    err.details = json?.details
    throw err
  }
  return json.data
}

// GET sekali saat path berubah. reload() mengambil ulang (setelah simpan/hapus).
export function useApi(path) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const [versi, setVersi] = useState(0)
  useEffect(() => {
    if (!path) return
    let batal = false
    setState((s) => ({ ...s, loading: true, error: null }))
    kirim('GET', path)
      .then((data) => !batal && setState({ data, error: null, loading: false }))
      .catch((error) => !batal && setState({ data: null, error, loading: false }))
    return () => { batal = true }
  }, [path, versi])
  const reload = useCallback(() => setVersi((v) => v + 1), [])
  return { ...state, reload }
}

// Unduh file berotorisasi: <a href> biasa tidak membawa token, jadi ambil lewat fetch lalu simpan.
export async function unduh(path) {
  const res = await fetch(`/api${path}`, { headers: { Authorization: `Bearer ${getToken()}` } })
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.message || 'Gagal mengunduh file')
  const disp = res.headers.get('content-disposition') || ''
  const nama = decodeURIComponent(disp.match(/filename\*=UTF-8''([^;]+)/i)?.[1] ?? disp.match(/filename="?([^";]+)"?/i)?.[1] ?? 'berkas')
  const url = URL.createObjectURL(await res.blob())
  const a = Object.assign(document.createElement('a'), { href: url, download: nama })
  a.click()
  URL.revokeObjectURL(url)
}
