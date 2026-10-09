import { z } from 'zod'

const idNum = z.number().int().positive()
const opsional = (max) => z.string().trim().max(max).nullable().optional()

export const idParam = z.coerce.number().int().positive()

export const packageUpdate = z.object({
  tarifPerM2: z.number().int().min(1000).max(100_000_000).optional(),
  aktif: z.boolean().optional(),
  fasilitas: z.array(z.string().trim().min(1).max(200)).max(20).optional(), // mengganti seluruh daftar
})

export const categoryBody = z.object({ nama: z.string().trim().min(2).max(80) })

export const portfolioBody = z.object({
  judul: z.string().trim().min(2).max(150),
  categoryId: idNum,
  deskripsi: opsional(5000),
  lokasi: opsional(120),
  luasM2: z.number().int().min(1).max(1_000_000).nullable().optional(),
  tahun: z.number().int().min(1900).max(2100).nullable().optional(),
  packageId: idNum.nullable().optional(),
  unggulan: z.boolean().optional(),
  terbit: z.boolean().optional(),
})
export const portfolioUpdate = portfolioBody.partial()

export const imageUpdate = z.object({
  alt: opsional(200),
  urutan: z.number().int().min(0).max(1000).optional(),
  sampul: z.boolean().optional(),
})

const role = z.enum(['ADMIN', 'ARSITEK', 'KLIEN'])
const password = z.string().min(8, 'Password minimal 8 karakter').max(72) // batas bcrypt 72 byte
const dataUser = {
  nama: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(150),
  telepon: opsional(30),
}
export const userCreate = z.object({ ...dataUser, password, role })
export const userUpdate = z.object({ ...dataUser, password, role, aktif: z.boolean() }).partial().omit({ email: true })

export const projectCreate = z
  .object({
    nama: z.string().trim().min(2).max(150),
    deskripsi: opsional(5000),
    lokasi: opsional(120),
    luasM2: z.number().int().min(1).max(1_000_000).nullable().optional(),
    packageId: idNum.nullable().optional(),
    tanggalMulai: z.iso.date().nullable().optional(),
    targetSelesai: z.iso.date().nullable().optional(),
    clientId: idNum.optional(), // klien yang sudah punya akun...
    klienBaru: z.object({ ...dataUser, password }).optional(), // ...atau buat akun klien baru
    arsitekIds: z.array(idNum).max(20).default([]),
  })
  .refine((d) => !!d.clientId !== !!d.klienBaru, { message: 'Pilih klien yang ada atau isi data klien baru (salah satu)', path: ['clientId'] })
