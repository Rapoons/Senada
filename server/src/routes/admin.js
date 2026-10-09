import { Router } from 'express'
import { authenticate, requireRole } from '../middlewares/auth.js'
import { unggahGambar } from '../middlewares/upload.js'
import * as c from '../controllers/adminController.js'

// Semua rute di sini hanya untuk ADMIN. Dipasang di /api/admin.
const router = Router()
router.use(authenticate, requireRole('ADMIN'))

router.get('/summary', c.ringkasan)

router.get('/packages', c.daftarPaket)
router.patch('/packages/:id', c.ubahPaket)

router.post('/categories', c.buatKategori)
router.patch('/categories/:id', c.ubahKategori)
router.delete('/categories/:id', c.hapusKategori)

router.get('/portfolios', c.daftarPortofolio)
router.post('/portfolios', c.buatPortofolio)
router.get('/portfolios/:id', c.detailPortofolio)
router.patch('/portfolios/:id', c.ubahPortofolio)
router.delete('/portfolios/:id', c.hapusPortofolio)
router.post('/portfolios/:id/images', unggahGambar, c.tambahGambar)
router.patch('/portfolio-images/:id', c.ubahGambar)
router.delete('/portfolio-images/:id', c.hapusGambar)

router.get('/users', c.daftarAkun)
router.post('/users', c.buatAkun)
router.patch('/users/:id', c.ubahAkun)

router.get('/projects', c.daftarProyek)
router.post('/projects', c.buatProyek)

export default router
