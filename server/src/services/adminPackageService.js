import { prisma } from '../lib/prisma.js'
import { HttpError } from '../lib/httpError.js'
import { slugUnik } from '../lib/slug.js'

// ---- Paket dan tarif ----
export const listPackages = () =>
  prisma.package.findMany({
    orderBy: [{ tingkatan: 'asc' }, { lingkup: 'asc' }],
    include: { fasilitas: { orderBy: { urutan: 'asc' }, select: { id: true, teks: true } } },
  })

export async function updatePackage(id, { fasilitas, ...data }) {
  return prisma.$transaction(async (tx) => {
    await tx.package.update({ where: { id }, data })
    if (fasilitas) {
      await tx.packageFeature.deleteMany({ where: { packageId: id } })
      await tx.packageFeature.createMany({ data: fasilitas.map((teks, urutan) => ({ packageId: id, teks, urutan })) })
    }
    return tx.package.findUnique({ where: { id }, include: { fasilitas: { orderBy: { urutan: 'asc' }, select: { id: true, teks: true } } } })
  })
}

// ---- Kategori portofolio ----
export const createCategory = async ({ nama }) =>
  prisma.category.create({ data: { nama, slug: await slugUnik(prisma.category, nama) } })

export const updateCategory = (id, { nama }) => prisma.category.update({ where: { id }, data: { nama } })

export async function deleteCategory(id) {
  if (await prisma.portfolio.count({ where: { categoryId: id } })) {
    throw new HttpError(409, 'Kategori masih dipakai portofolio, pindahkan dulu proyeknya')
  }
  await prisma.category.delete({ where: { id } })
}
