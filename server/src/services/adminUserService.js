import bcrypt from 'bcrypt'
import { prisma } from '../lib/prisma.js'
import { HttpError } from '../lib/httpError.js'

// Hash password tidak pernah ikut dikirim ke klien.
const select = { id: true, nama: true, email: true, role: true, telepon: true, aktif: true, createdAt: true }

export const list = () => prisma.user.findMany({ select, orderBy: [{ role: 'asc' }, { nama: 'asc' }] })

export async function create({ password, ...data }) {
  return prisma.user.create({ data: { ...data, passwordHash: await bcrypt.hash(password, 10) }, select })
}

export async function update(id, { password, ...data }, actorId) {
  // Admin tidak boleh mengunci dirinya sendiri (menonaktifkan atau menurunkan peran).
  if (id === actorId && (data.aktif === false || (data.role && data.role !== 'ADMIN'))) {
    throw new HttpError(400, 'Anda tidak bisa menonaktifkan atau menurunkan peran akun sendiri')
  }
  return prisma.user.update({
    where: { id },
    data: { ...data, ...(password && { passwordHash: await bcrypt.hash(password, 10) }) },
    select,
  })
}
