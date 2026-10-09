import { ZodError } from 'zod'
import multer from 'multer'
import { HttpError } from '../lib/httpError.js'

// Format respons seragam:
//   sukses: { success: true, data }
//   gagal : { success: false, message, details? }
export function notFound(req, res) {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' })
}

const gagal = (res, status, message, details) => res.status(status).json({ success: false, message, details })

// Express 5 meneruskan error dari handler async ke sini secara otomatis.
export function errorHandler(err, req, res, _next) {
  if (err instanceof ZodError) {
    return gagal(res, 400, 'Data tidak valid', err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })))
  }
  if (err instanceof HttpError) return gagal(res, err.status, err.message, err.details)
  if (err instanceof multer.MulterError) {
    return gagal(res, 400, err.code === 'LIMIT_FILE_SIZE' ? 'Ukuran gambar maksimal 5 MB' : 'Unggahan tidak valid')
  }
  if (err instanceof SyntaxError && err.status === 400) return gagal(res, 400, 'Format JSON tidak valid')
  // Kode error Prisma yang umum dipetakan ke pesan yang jelas.
  if (err?.code === 'P2002') return gagal(res, 409, 'Data sudah ada (duplikat)')
  if (err?.code === 'P2025') return gagal(res, 404, 'Data tidak ditemukan')
  if (err?.code === 'P2003') return gagal(res, 400, 'Data terkait tidak valid')
  console.error(err)
  gagal(res, 500, 'Terjadi kesalahan pada server')
}
