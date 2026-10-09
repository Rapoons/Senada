import { prisma } from '../lib/prisma.js'

// Kirim notifikasi ke daftar pengguna (pelaku aksi sendiri dilewati).
export async function notify(userIds, projectId, pesan, actorId) {
  const target = [...new Set(userIds)].filter((id) => id !== actorId)
  if (target.length) await prisma.notification.createMany({ data: target.map((userId) => ({ userId, projectId, pesan })) })
}

// Penerima untuk aksi klien: arsitek proyek; bila belum ada, semua admin aktif.
export async function penerimaStaf(proyek) {
  const anggota = await prisma.projectMember.findMany({ where: { projectId: proyek.id }, select: { userId: true } })
  if (anggota.length) return anggota.map((a) => a.userId)
  return (await prisma.user.findMany({ where: { role: 'ADMIN', aktif: true }, select: { id: true } })).map((u) => u.id)
}

export async function list(user) {
  const [items, belumDibaca] = await Promise.all([
    prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 50 }),
    prisma.notification.count({ where: { userId: user.id, dibaca: false } }),
  ])
  return { items, belumDibaca }
}

// Selalu difilter userId: pengguna hanya bisa menandai notifikasi miliknya sendiri.
export const tandaiDibaca = (user, id) =>
  prisma.notification.updateMany({ where: { id, userId: user.id }, data: { dibaca: true } })

export const tandaiSemua = (user) =>
  prisma.notification.updateMany({ where: { userId: user.id, dibaca: false }, data: { dibaca: true } })
