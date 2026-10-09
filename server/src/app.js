import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import routes from './routes/index.js'
import adminRoutes from './routes/admin.js'
import projectRoutes from './routes/projects.js'
import { PORTFOLIO_DIR } from './lib/uploads.js'
import { notFound, errorHandler } from './middlewares/errorHandler.js'

const app = express()

app.use(helmet())
// CORS hanya untuk asal frontend yang dikonfigurasi, bukan semua origin.
app.use(cors({ origin: process.env.CLIENT_ORIGIN }))
app.use(express.json({ limit: '100kb' }))
// Batas umum untuk semua endpoint API; login mendapat batas lebih ketat di fase 3.
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }))

app.use('/api/admin', adminRoutes)
app.use('/api', projectRoutes)
app.use('/api', routes)
// Hanya foto portofolio (publik) yang dilayani statis. Dokumen proyek (uploads/projects)
// TIDAK boleh lewat sini: unduhannya lewat endpoint yang memeriksa hak akses.
app.use('/uploads/portfolios', express.static(PORTFOLIO_DIR, { maxAge: '7d' }))
app.use(notFound)
app.use(errorHandler)

export default app
