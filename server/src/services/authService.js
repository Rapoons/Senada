import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'
import { HttpError } from '../lib/httpError.js'

// Hash bohongan: perbandingan tetap dijalankan walau email tidak ada,
// supaya waktu respons tidak membocorkan email mana yang terdaftar.
const DUMMY_HASH = bcrypt.hashSync('tidak-dipakai', 10)

export async function login(email, password) {
  const user = await prisma.user.findUnique({ where: { email } })
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH)
  if (!user || !ok || !user.aktif) throw new HttpError(401, 'Email atau password salah')

  const token = jwt.sign({ role: user.role }, process.env.JWT_SECRET, {
    subject: String(user.id),
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  })
  return { token, user: { id: user.id, nama: user.nama, email: user.email, role: user.role } }
}
