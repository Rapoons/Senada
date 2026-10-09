import bcrypt from 'bcrypt'
import { prisma } from '../lib/prisma.js'
import { HttpError } from '../lib/httpError.js'

// Tahapan default; setelah proyek dibuat, tahapan bisa diubah per proyek (fase 6).
const TAHAPAN_DEFAULT = ['Konsultasi', 'Konsep Desain', 'Pengembangan Desain', 'Gambar Kerja', 'RAB', 'Pelaksanaan dan Pengawasan', 'Serah Terima']

const include = {
  klien: { select: { id: true, nama: true, email: true } },
  package: { select: { tingkatan: true, lingkup: true } },
  anggota: { select: { user: { select: { id: true, nama: true } } } },
}

export const list = () => prisma.project.findMany({ orderBy: { createdAt: 'desc' }, include })

const tanggal = (s) => (s ? new Date(s) : null)

// Dipanggil admin setelah kesepakatan di WhatsApp: membuat proyek, tahapan default, penugasan arsitek,
// dan (opsional) akun klien baru, semuanya dalam satu transaksi (gagal satu = batal semua).
export async function create({ klienBaru, clientId, arsitekIds, tanggalMulai, targetSelesai, ...data }) {
  if (arsitekIds.length) {
    const n = await prisma.user.count({ where: { id: { in: arsitekIds }, role: 'ARSITEK', aktif: true } })
    if (n !== new Set(arsitekIds).size) throw new HttpError(400, 'Ada arsitek yang tidak valid atau nonaktif')
  }
  if (clientId) {
    const klien = await prisma.user.findFirst({ where: { id: clientId, role: 'KLIEN', aktif: true } })
    if (!klien) throw new HttpError(400, 'Klien tidak ditemukan atau nonaktif')
  }
  const passwordHash = klienBaru ? await bcrypt.hash(klienBaru.password, 10) : null

  return prisma.$transaction(async (tx) => {
    if (klienBaru) {
      const { password, ...profil } = klienBaru
      clientId = (await tx.user.create({ data: { ...profil, passwordHash, role: 'KLIEN' } })).id
    }
    return tx.project.create({
      data: {
        ...data,
        clientId,
        tanggalMulai: tanggal(tanggalMulai),
        targetSelesai: tanggal(targetSelesai),
        tahapan: { create: TAHAPAN_DEFAULT.map((nama, urutan) => ({ nama, urutan })) },
        anggota: { create: [...new Set(arsitekIds)].map((userId) => ({ userId })) },
      },
      include,
    })
  })
}

// Ringkasan untuk halaman awal dashboard admin.
export async function summary() {
  const hariIni = new Date(new Date().toDateString())
  const [proyek, pengguna, terbit, draf, tahapTertunda] = await Promise.all([
    prisma.project.groupBy({ by: ['status'], _count: true }),
    prisma.user.groupBy({ by: ['role'], where: { aktif: true }, _count: true }),
    prisma.portfolio.count({ where: { terbit: true } }),
    prisma.portfolio.count({ where: { terbit: false } }),
    prisma.projectStage.count({ where: { status: { not: 'SELESAI' }, tanggalTarget: { lt: hariIni } } }),
  ])
  const hitung = (rows, key) => Object.fromEntries(rows.map((r) => [r[key], r._count]))
  return { proyek: hitung(proyek, 'status'), pengguna: hitung(pengguna, 'role'), portofolio: { terbit, draf }, tahapTertunda }
}
