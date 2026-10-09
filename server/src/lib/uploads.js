import fs from 'node:fs'
import path from 'node:path'

// Semua unggahan disimpan di server/uploads/<jenis>/. Database hanya menyimpan path,
// jadi pindah ke cloud storage cukup mengganti modul ini.
export const UPLOAD_ROOT = path.resolve(import.meta.dirname, '../../uploads')
export const PORTFOLIO_DIR = path.join(UPLOAD_ROOT, 'portfolios') // publik, dilayani statis
export const PROJECT_DIR = path.join(UPLOAD_ROOT, 'projects')     // privat, hanya lewat endpoint berotorisasi
fs.mkdirSync(PORTFOLIO_DIR, { recursive: true })
fs.mkdirSync(PROJECT_DIR, { recursive: true })

const mulaiDengan = (b, teks) => b.subarray(0, teks.length).toString('latin1') === teks

// Jenis file yang diizinkan, ditentukan dari ekstensi + tanda awal isi file (magic bytes).
// Tipe MIME dari browser bisa dipalsukan, isi file tidak.
export const JENIS = {
  '.jpg':  { mime: 'image/jpeg', cek: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  '.jpeg': { mime: 'image/jpeg', cek: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  '.png':  { mime: 'image/png', cek: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  '.webp': { mime: 'image/webp', cek: (b) => mulaiDengan(b, 'RIFF') && b.subarray(8, 12).toString() === 'WEBP' },
  '.pdf':  { mime: 'application/pdf', cek: (b) => mulaiDengan(b, '%PDF') },
  '.dwg':  { mime: 'application/acad', cek: (b) => mulaiDengan(b, 'AC10') },
  '.zip':  { mime: 'application/zip', cek: (b) => mulaiDengan(b, 'PK') },
  '.docx': { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', cek: (b) => mulaiDengan(b, 'PK') },
  '.xlsx': { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', cek: (b) => mulaiDengan(b, 'PK') },
}
export const GAMBAR = ['.jpg', '.jpeg', '.png', '.webp']

export function isiValid(filePath, ext) {
  const fd = fs.openSync(filePath, 'r')
  const buf = Buffer.alloc(12)
  fs.readSync(fd, buf, 0, 12, 0)
  fs.closeSync(fd)
  return !!JENIS[ext]?.cek(buf)
}

// basename mencegah path traversal ("../") dari nilai yang tersimpan.
export function hapusFile(urlPath, dir = PORTFOLIO_DIR) {
  fs.rm(path.join(dir, path.basename(urlPath)), { force: true }, () => {})
}

// Lokasi file proyek: "<idProyek>/<uuid>.ext" di bawah PROJECT_DIR.
export const lokasiBerkasProyek = (relatif) => path.join(PROJECT_DIR, ...relatif.split('/').map((s) => path.basename(s)))
export const hapusBerkasProyek = (relatif) => fs.rm(lokasiBerkasProyek(relatif), { force: true }, () => {})
