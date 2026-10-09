import { prisma } from '../lib/prisma.js'
import { HttpError } from '../lib/httpError.js'
import { ambilProyek, filterAkses } from './projectAccess.js'
import { notify } from './notificationService.js'

const NAMA_STATUS = { BELUM: 'Belum mulai', BERJALAN: 'Berjalan', SELESAI: 'Selesai' }
const hariIni = () => new Date(new Date().toDateString())
const tanggal = (s) => (s ? new Date(s) : null)

const include = {
  klien: { select: { id: true, nama: true, email: true, telepon: true } },
  package: { select: { tingkatan: true, lingkup: true } },
  anggota: { select: { user: { select: { id: true, nama: true } } } },
}

export const list = (user) =>
  prisma.project.findMany({ where: filterAkses(user), orderBy: { createdAt: 'desc' }, include })

export const detail = (user, id) =>
  ambilProyek(user, id, { ...include, tahapan: { orderBy: { urutan: 'asc' } } })

// Progres proyek = persentase tahapan yang selesai. Dihitung ulang setiap tahapan berubah,
// jadi angkanya selalu konsisten dengan tahapan (tidak diisi manual).
async function hitungUlangProgres(tx, projectId) {
  const [total, selesai] = await Promise.all([
    tx.projectStage.count({ where: { projectId } }),
    tx.projectStage.count({ where: { projectId, status: 'SELESAI' } }),
  ])
  await tx.project.update({ where: { id: projectId }, data: { progres: total ? Math.round((100 * selesai) / total) : 0 } })
}

// ---- Admin: ubah data proyek dan penugasan arsitek ----
export async function update(id, { arsitekIds, tanggalMulai, targetSelesai, ...data }) {
  await ambilProyek({ role: 'ADMIN' }, id)
  if (arsitekIds) {
    const n = await prisma.user.count({ where: { id: { in: arsitekIds }, role: 'ARSITEK', aktif: true } })
    if (n !== new Set(arsitekIds).size) throw new HttpError(400, 'Ada arsitek yang tidak valid atau nonaktif')
  }
  await prisma.$transaction(async (tx) => {
    await tx.project.update({
      where: { id },
      data: {
        ...data,
        ...(tanggalMulai !== undefined && { tanggalMulai: tanggal(tanggalMulai) }),
        ...(targetSelesai !== undefined && { targetSelesai: tanggal(targetSelesai) }),
      },
    })
    if (arsitekIds) {
      await tx.projectMember.deleteMany({ where: { projectId: id } })
      await tx.projectMember.createMany({ data: [...new Set(arsitekIds)].map((userId) => ({ projectId: id, userId })) })
    }
  })
  return detail({ role: 'ADMIN' }, id)
}

// ---- Tahapan ----
export async function addStage(id, { nama, tanggalTarget }) {
  await ambilProyek({ role: 'ADMIN' }, id)
  const akhir = await prisma.projectStage.aggregate({ where: { projectId: id }, _max: { urutan: true } })
  await prisma.$transaction(async (tx) => {
    await tx.projectStage.create({ data: { projectId: id, nama, urutan: (akhir._max.urutan ?? -1) + 1, tanggalTarget: tanggal(tanggalTarget) } })
    await hitungUlangProgres(tx, id)
  })
  return detail({ role: 'ADMIN' }, id)
}

// Admin boleh mengubah semua field tahapan. Arsitek hanya status (field lain diabaikan di sini
// dan juga tidak lolos validasi di controller).
export async function updateStage(user, projectId, stageId, data) {
  const proyek = await ambilProyek(user, projectId)
  const tahap = await prisma.projectStage.findFirst({ where: { id: stageId, projectId } })
  if (!tahap) throw new HttpError(404, 'Tahapan tidak ditemukan')

  const ubah = { ...data }
  for (const k of ['tanggalMulai', 'tanggalTarget', 'tanggalSelesai']) if (k in ubah) ubah[k] = tanggal(ubah[k])
  // Tanggal mulai/selesai terisi otomatis mengikuti perubahan status.
  if (data.status && data.status !== tahap.status) {
    if (data.status !== 'BELUM' && !tahap.tanggalMulai && !('tanggalMulai' in ubah)) ubah.tanggalMulai = hariIni()
    if (data.status === 'SELESAI' && !('tanggalSelesai' in ubah)) ubah.tanggalSelesai = hariIni()
    if (data.status !== 'SELESAI' && !('tanggalSelesai' in ubah)) ubah.tanggalSelesai = null
  }

  await prisma.$transaction(async (tx) => {
    await tx.projectStage.update({ where: { id: stageId }, data: ubah })
    await hitungUlangProgres(tx, projectId)
  })
  if (data.status && data.status !== tahap.status) {
    await notify([proyek.clientId], projectId, `${proyek.nama}: tahapan "${ubah.nama ?? tahap.nama}" kini ${NAMA_STATUS[data.status].toLowerCase()}`, user.id)
  }
  return detail(user, projectId)
}

export async function moveStage(projectId, stageId, arah) {
  await ambilProyek({ role: 'ADMIN' }, projectId)
  const semua = await prisma.projectStage.findMany({ where: { projectId }, orderBy: { urutan: 'asc' } })
  const i = semua.findIndex((s) => s.id === stageId)
  if (i < 0) throw new HttpError(404, 'Tahapan tidak ditemukan')
  const j = arah === 'naik' ? i - 1 : i + 1
  if (j >= 0 && j < semua.length) {
    // Susun ulang lalu beri nomor urut 0..n-1 (menghindari nomor ganda).
    const baru = [...semua]
    ;[baru[i], baru[j]] = [baru[j], baru[i]]
    await prisma.$transaction(baru.map((s, urutan) => prisma.projectStage.update({ where: { id: s.id }, data: { urutan } })))
  }
  return detail({ role: 'ADMIN' }, projectId)
}

export async function removeStage(projectId, stageId) {
  await ambilProyek({ role: 'ADMIN' }, projectId)
  await prisma.$transaction(async (tx) => {
    const { count } = await tx.projectStage.deleteMany({ where: { id: stageId, projectId } })
    if (!count) throw new HttpError(404, 'Tahapan tidak ditemukan')
    await hitungUlangProgres(tx, projectId)
  })
  return detail({ role: 'ADMIN' }, projectId)
}
