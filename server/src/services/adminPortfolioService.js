import { prisma } from '../lib/prisma.js'
import { HttpError } from '../lib/httpError.js'
import { slugUnik } from '../lib/slug.js'
import { hapusFile } from '../lib/uploads.js'

const include = {
  category: { select: { id: true, nama: true, slug: true } },
  gambar: { orderBy: [{ urutan: 'asc' }, { id: 'asc' }] },
}

export const list = () => prisma.portfolio.findMany({ orderBy: { createdAt: 'desc' }, include })

export async function get(id) {
  const item = await prisma.portfolio.findUnique({ where: { id }, include })
  if (!item) throw new HttpError(404, 'Portofolio tidak ditemukan')
  return item
}

// Slug dibuat sekali dari judul dan tidak berubah saat judul diedit, agar tautan lama tetap valid.
export async function create(data) {
  return prisma.portfolio.create({ data: { ...data, slug: await slugUnik(prisma.portfolio, data.judul) }, include })
}

export const update = (id, data) => prisma.portfolio.update({ where: { id }, data, include })

export async function remove(id) {
  const { gambar } = await get(id)
  await prisma.portfolio.delete({ where: { id } }) // baris gambar ikut terhapus (cascade)
  gambar.forEach((g) => hapusFile(g.path))
}

// ---- Galeri ----
export async function addImages(portfolioId, files) {
  const adaCover = async () => (await prisma.portfolioImage.count({ where: { portfolioId, sampul: true } })) > 0
  try {
    await get(portfolioId)
  } catch (e) {
    files.forEach((f) => hapusFile(f.filename)) // portofolio tidak ada: buang file yang sudah terlanjur tersimpan
    throw e
  }
  const terakhir = await prisma.portfolioImage.aggregate({ where: { portfolioId }, _max: { urutan: true } })
  let urutan = (terakhir._max.urutan ?? -1) + 1
  let butuhSampul = !(await adaCover())
  for (const f of files) {
    await prisma.portfolioImage.create({
      data: { portfolioId, path: `/uploads/portfolios/${f.filename}`, urutan: urutan++, sampul: butuhSampul },
    })
    butuhSampul = false // hanya gambar pertama yang jadi sampul
  }
  return get(portfolioId)
}

export async function updateImage(id, data) {
  const img = await prisma.portfolioImage.findUnique({ where: { id } })
  if (!img) throw new HttpError(404, 'Gambar tidak ditemukan')
  await prisma.$transaction(async (tx) => {
    if (data.sampul) await tx.portfolioImage.updateMany({ where: { portfolioId: img.portfolioId }, data: { sampul: false } })
    await tx.portfolioImage.update({ where: { id }, data })
  })
  return get(img.portfolioId)
}

export async function removeImage(id) {
  const img = await prisma.portfolioImage.findUnique({ where: { id } })
  if (!img) throw new HttpError(404, 'Gambar tidak ditemukan')
  await prisma.portfolioImage.delete({ where: { id } })
  hapusFile(img.path)
  if (img.sampul) {
    // Sampul dihapus: jadikan gambar pertama yang tersisa sebagai sampul.
    const next = await prisma.portfolioImage.findFirst({ where: { portfolioId: img.portfolioId }, orderBy: [{ urutan: 'asc' }, { id: 'asc' }] })
    if (next) await prisma.portfolioImage.update({ where: { id: next.id }, data: { sampul: true } })
  }
  return get(img.portfolioId)
}
