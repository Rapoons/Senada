import path from 'node:path'
import { prisma } from '../lib/prisma.js'
import { HttpError } from '../lib/httpError.js'
import { JENIS, lokasiBerkasProyek, hapusBerkasProyek } from '../lib/uploads.js'
import { ambilProyek } from './projectAccess.js'
import { notify } from './notificationService.js'

const select = {
  id: true, nama: true, mime: true, ukuran: true, versi: true, catatanRevisi: true, stageId: true, createdAt: true,
  pengunggah: { select: { id: true, nama: true } },
}

export async function list(proyek) {
  return prisma.projectFile.findMany({ where: { projectId: proyek.id }, orderBy: [{ nama: 'asc' }, { versi: 'desc' }], select })
}

// Unggah dokumen. Nama dokumen yang sama di proyek yang sama = versi baru (riwayat revisi gambar kerja).
export async function add(user, proyek, file, { nama, stageId, catatanRevisi }) {
  const relatif = `${proyek.id}/${file.filename}`
  try {
    if (stageId && !(await prisma.projectStage.findFirst({ where: { id: stageId, projectId: proyek.id } }))) {
      throw new HttpError(400, 'Tahapan tidak ditemukan di proyek ini')
    }
    // multer membaca nama file sebagai latin1; ubah kembali ke UTF-8 agar nama berhuruf khusus utuh.
    const asli = Buffer.from(file.originalname, 'latin1').toString('utf8')
    const ext = path.extname(asli).toLowerCase()
    const nama2 = (nama || path.basename(asli, ext)).trim().slice(0, 150)
    const terakhir = await prisma.projectFile.aggregate({ where: { projectId: proyek.id, nama: nama2 }, _max: { versi: true } })
    const versi = (terakhir._max.versi ?? 0) + 1

    const dibuat = await prisma.projectFile.create({
      data: { projectId: proyek.id, stageId: stageId ?? null, nama: nama2, path: relatif, mime: JENIS[ext].mime, ukuran: file.size, versi, catatanRevisi: catatanRevisi || null, uploadedBy: user.id },
      select,
    })
    await notify([proyek.clientId], proyek.id, `${proyek.nama}: dokumen baru "${nama2}" (versi ${versi})`, user.id)
    return dibuat
  } catch (e) {
    hapusBerkasProyek(relatif) // gagal menyimpan: jangan tinggalkan file yatim
    throw e
  }
}

// Untuk unduhan: cek hak akses lewat proyek pemilik file, lalu kembalikan lokasi file di disk.
export async function untukUnduh(user, id) {
  const berkas = await prisma.projectFile.findUnique({ where: { id } })
  if (!berkas) throw new HttpError(404, 'File tidak ditemukan')
  await ambilProyek(user, berkas.projectId) // 404 bila bukan proyek pengguna ini
  const ext = path.extname(berkas.path)
  const aman = berkas.nama.replace(/[\\/:*?"<>|]/g, '_')
  return { lokasi: lokasiBerkasProyek(berkas.path), nama: `${aman} v${berkas.versi}${ext}`, mime: berkas.mime }
}

// Hapus: admin, atau arsitek yang mengunggah file itu sendiri.
export async function remove(user, id) {
  const berkas = await prisma.projectFile.findUnique({ where: { id } })
  if (!berkas) throw new HttpError(404, 'File tidak ditemukan')
  await ambilProyek(user, berkas.projectId)
  if (user.role === 'KLIEN' || (user.role === 'ARSITEK' && berkas.uploadedBy !== user.id)) {
    throw new HttpError(403, 'Anda hanya bisa menghapus file yang Anda unggah sendiri')
  }
  await prisma.projectFile.delete({ where: { id } })
  hapusBerkasProyek(berkas.path)
}
