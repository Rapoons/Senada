import multer from 'multer'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import fs from 'node:fs'
import { PORTFOLIO_DIR, PROJECT_DIR, JENIS, isiValid, hapusFile, hapusBerkasProyek } from '../lib/uploads.js'
import { HttpError } from '../lib/httpError.js'

// Ekstensi diambil dari tipe yang diizinkan, bukan dari nama file buatan pengguna.
const EKSTENSI = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }

const multerGambar = multer({
  storage: multer.diskStorage({
    destination: PORTFOLIO_DIR,
    filename: (req, file, cb) => cb(null, randomUUID() + EKSTENSI[file.mimetype]),
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 10 }, // 5 MB per file, maksimal 10 file
  fileFilter: (req, file, cb) =>
    EKSTENSI[file.mimetype] ? cb(null, true) : cb(new HttpError(400, 'Hanya gambar JPG, PNG, atau WebP yang diizinkan')),
})

// Unggah field "gambar", lalu cek isi file. Satu saja gagal = semua file batch ini dibuang.
export const unggahGambar = [
  multerGambar.array('gambar', 10),
  (req, res, next) => {
    const files = req.files ?? []
    if (!files.length) throw new HttpError(400, 'Pilih minimal satu gambar')
    if (files.some((f) => !isiValid(f.path, EKSTENSI[f.mimetype]))) {
      files.forEach((f) => hapusFile(f.filename))
      throw new HttpError(400, 'Isi file bukan gambar yang valid')
    }
    next()
  },
]

// Dokumen proyek (satu file per unggahan, maksimal 25 MB). Dipasang SETELAH muatProyek,
// jadi folder tujuan hanya dibuat untuk pengguna yang berhak.
const multerBerkas = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(PROJECT_DIR, String(req.proyek.id))
      fs.mkdirSync(dir, { recursive: true })
      cb(null, dir)
    },
    filename: (req, file, cb) => cb(null, randomUUID() + path.extname(file.originalname).toLowerCase()),
  }),
  limits: { fileSize: 25 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) =>
    JENIS[path.extname(file.originalname).toLowerCase()]
      ? cb(null, true)
      : cb(new HttpError(400, 'Jenis file tidak diizinkan. Gunakan PDF, DWG, DOCX, XLSX, ZIP, JPG, PNG, atau WebP')),
})

export const unggahBerkas = [
  multerBerkas.single('berkas'),
  (req, res, next) => {
    const f = req.file
    if (!f) throw new HttpError(400, 'Pilih file yang akan diunggah')
    if (!isiValid(f.path, path.extname(f.filename))) {
      hapusBerkasProyek(`${req.proyek.id}/${f.filename}`)
      throw new HttpError(400, 'Isi file tidak sesuai dengan jenisnya')
    }
    next()
  },
]
