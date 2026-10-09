import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { prisma } from '../lib/prisma.js'
import { authenticate } from '../middlewares/auth.js'
import * as publik from '../controllers/publicController.js'
import * as authCtl from '../controllers/authController.js'

const router = Router()

// Cek server dan koneksi database.
router.get('/health', async (req, res) => {
  await prisma.$queryRaw`SELECT 1`
  res.json({ success: true, data: { status: 'ok' } })
})

// Publik (tanpa login)
router.get('/packages', publik.packages)
router.get('/categories', publik.categories)
router.get('/portfolios', publik.portfolios)
router.get('/portfolios/:slug', publik.portfolioDetail)

// Auth. Login dibatasi 10 percobaan per 15 menit per IP (anti tebak password).
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Terlalu banyak percobaan login, coba lagi nanti' },
})
router.post('/auth/login', loginLimiter, authCtl.login)
router.get('/auth/me', authenticate, authCtl.me)

export default router
