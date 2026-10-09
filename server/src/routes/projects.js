import { Router } from 'express'
import { authenticate, requireRole } from '../middlewares/auth.js'
import { muatProyek } from '../services/projectAccess.js'
import { unggahBerkas } from '../middlewares/upload.js'
import * as c from '../controllers/projectController.js'

// Modul proyek untuk semua peran yang login. Pembatasan per peran:
//   ADMIN   : kelola semuanya      ARSITEK : tahapan (status), dokumen, komentar di proyek tugasnya
//   KLIEN   : baca proyek sendiri, unduh dokumen, komentar/revisi
const router = Router()
const staf = requireRole('ADMIN', 'ARSITEK')
const admin = requireRole('ADMIN')
router.use(['/projects', '/files', '/notifications'], authenticate)

router.get('/projects', c.daftar)
router.get('/projects/:id', c.rincian)
router.patch('/projects/:id', admin, c.ubah)

router.post('/projects/:id/stages', admin, c.tambahTahap)
router.patch('/projects/:id/stages/:stageId', staf, c.ubahTahap)
router.post('/projects/:id/stages/:stageId/move', admin, c.geserTahap)
router.delete('/projects/:id/stages/:stageId', admin, c.hapusTahap)

router.get('/projects/:id/files', muatProyek(), c.daftarFile)
router.post('/projects/:id/files', muatProyek({ tulis: true }), unggahBerkas, c.unggahFile)
router.get('/files/:id/download', c.unduhFile)
router.delete('/files/:id', staf, c.hapusFile)

router.get('/projects/:id/comments', muatProyek(), c.daftarKomentar)
router.post('/projects/:id/comments', muatProyek(), c.tulisKomentar)

router.get('/notifications', c.notifikasi)
router.post('/notifications/read-all', c.bacaSemua)
router.patch('/notifications/:id/read', c.bacaNotifikasi)

export default router
