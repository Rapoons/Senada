import { prisma } from '../lib/prisma.js'
import { HttpError } from '../lib/httpError.js'
import { idParam } from '../validators/adminSchemas.js'

// ATURAN AKSES PROYEK (satu-satunya tempat, dipakai semua modul proyek):
//   ADMIN   : semua proyek
//   ARSITEK : hanya proyek yang ditugaskan (project_members)
//   KLIEN   : hanya proyek miliknya (projects.client_id)
// Proyek yang tidak boleh diakses dijawab 404 (bukan 403) agar keberadaannya tidak bocor.
// Ini yang mencegah IDOR: mengganti angka id di URL tidak membuka proyek orang lain.
export const filterAkses = (user) => {
  if (user.role === 'ADMIN') return {}
  if (user.role === 'ARSITEK') return { anggota: { some: { userId: user.id } } }
  return { clientId: user.id }
}

export async function ambilProyek(user, id, include) {
  const proyek = await prisma.project.findFirst({ where: { id, ...filterAkses(user) }, include })
  if (!proyek) throw new HttpError(404, 'Proyek tidak ditemukan')
  return proyek
}

// Middleware: muat proyek dari :id dan cek hak akses. tulis=true menolak KLIEN (hanya baca + komentar).
export const muatProyek = ({ tulis = false } = {}) => async (req, res, next) => {
  if (tulis && req.user.role === 'KLIEN') throw new HttpError(403, 'Anda tidak punya akses ke fitur ini')
  req.proyek = await ambilProyek(req.user, idParam.parse(req.params.id))
  next()
}
