import { z } from 'zod'

const idNum = z.number().int().positive()
const opsional = (max) => z.string().trim().max(max).nullable().optional()
const tgl = z.iso.date().nullable().optional()
const STATUS_TAHAP = z.enum(['BELUM', 'BERJALAN', 'SELESAI'])

export const projectUpdate = z.object({
  nama: z.string().trim().min(2).max(150),
  deskripsi: opsional(5000),
  lokasi: opsional(120),
  luasM2: z.number().int().min(1).max(1_000_000).nullable().optional(),
  packageId: idNum.nullable().optional(),
  status: z.enum(['AKTIF', 'SELESAI', 'DITUNDA']),
  tanggalMulai: tgl,
  targetSelesai: tgl,
  arsitekIds: z.array(idNum).max(20),
}).partial()

export const stageCreate = z.object({ nama: z.string().trim().min(2).max(100), tanggalTarget: tgl })

// Admin: semua field. Arsitek: hanya status (.strict menolak field lain, bukan diam-diam mengabaikan).
export const stageUpdateAdmin = z.object({
  nama: z.string().trim().min(2).max(100),
  status: STATUS_TAHAP,
  tanggalMulai: tgl,
  tanggalTarget: tgl,
  tanggalSelesai: tgl,
}).partial()
export const stageUpdateArsitek = z.object({ status: STATUS_TAHAP }).strict()

export const stageMove = z.object({ arah: z.enum(['naik', 'turun']) })

// Field teks dari multipart/form-data selalu string; kosong dianggap tidak diisi.
export const fileMeta = z.object({
  nama: z.string().trim().max(150).optional(),
  stageId: z.coerce.number().int().positive().optional().catch(undefined),
  catatanRevisi: z.string().trim().max(300).optional(),
})

export const commentBody = z.object({
  isi: z.string().trim().min(1, 'Isi komentar tidak boleh kosong').max(3000),
  jenis: z.enum(['KOMENTAR', 'REVISI']).default('KOMENTAR'),
  parentId: idNum.nullable().optional(),
})
