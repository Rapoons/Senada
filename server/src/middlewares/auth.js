import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'
import { HttpError } from '../lib/httpError.js'

// Autentikasi: baca token "Authorization: Bearer <jwt>", lalu muat pengguna dari database.
// Pengguna dimuat ulang setiap request supaya akun yang dinonaktifkan langsung kehilangan akses.
export async function authenticate(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) throw new HttpError(401, 'Silakan login terlebih dahulu')

  let payload
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    throw new HttpError(401, 'Sesi tidak valid atau sudah berakhir')
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(payload.sub) },
    select: { id: true, nama: true, email: true, role: true, aktif: true },
  })
  if (!user || !user.aktif) throw new HttpError(401, 'Akun tidak ditemukan atau nonaktif')

  req.user = user
  next()
}

// RBAC: pakai setelah authenticate, contoh: router.use(authenticate, requireRole('ADMIN')).
export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) throw new HttpError(403, 'Anda tidak punya akses ke fitur ini')
  next()
}
