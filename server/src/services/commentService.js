import { prisma } from '../lib/prisma.js'
import { HttpError } from '../lib/httpError.js'
import { notify, penerimaStaf } from './notificationService.js'

const include = { user: { select: { id: true, nama: true, role: true } } }

export const list = (proyek) =>
  prisma.comment.findMany({ where: { projectId: proyek.id }, orderBy: { createdAt: 'asc' }, include })

// Klien menulis -> arsitek (atau admin) diberi tahu. Staf membalas -> klien diberi tahu.
export async function add(user, proyek, { isi, jenis, parentId }) {
  if (parentId && !(await prisma.comment.findFirst({ where: { id: parentId, projectId: proyek.id } }))) {
    throw new HttpError(400, 'Komentar yang dibalas tidak ditemukan di proyek ini')
  }
  const dibuat = await prisma.comment.create({ data: { projectId: proyek.id, userId: user.id, isi, jenis, parentId: parentId ?? null }, include })
  const label = jenis === 'REVISI' ? 'permintaan revisi' : 'komentar'
  if (user.role === 'KLIEN') {
    await notify(await penerimaStaf(proyek), proyek.id, `${proyek.nama}: ${label} baru dari ${user.nama}`, user.id)
  } else {
    await notify([proyek.clientId], proyek.id, `${proyek.nama}: ${label} baru dari ${user.nama}`, user.id)
  }
  return dibuat
}
