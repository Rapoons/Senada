import { prisma } from '../lib/prisma.js'
import { HttpError } from '../lib/httpError.js'

// Data publik (tanpa login): paket dan tarif, kategori, portofolio.

export const listPackages = () =>
  prisma.package.findMany({
    where: { aktif: true },
    orderBy: [{ tingkatan: 'asc' }, { lingkup: 'asc' }],
    include: { fasilitas: { orderBy: { urutan: 'asc' }, select: { teks: true } } },
  })

export const listCategories = () => prisma.category.findMany({ orderBy: { nama: 'asc' } })

export const listPortfolios = ({ category, unggulan }) =>
  prisma.portfolio.findMany({
    where: {
      terbit: true,
      ...(category && { category: { slug: category } }),
      ...(unggulan && { unggulan: true }),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      category: { select: { nama: true, slug: true } },
      gambar: { where: { sampul: true }, take: 1 },
    },
  })

export async function getPortfolio(slug) {
  const item = await prisma.portfolio.findFirst({
    where: { slug, terbit: true },
    include: {
      category: { select: { nama: true, slug: true } },
      package: { select: { tingkatan: true, lingkup: true } },
      gambar: { orderBy: { urutan: 'asc' } },
    },
  })
  if (!item) throw new HttpError(404, 'Proyek tidak ditemukan')
  return item
}
