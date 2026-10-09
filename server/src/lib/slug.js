// "Rumah Tinggal Ibu Sari" -> "rumah-tinggal-ibu-sari"
export const slugify = (teks) =>
  teks.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item'

// Pastikan unik di tabel: tambahkan -2, -3, ... bila sudah dipakai.
// delegate = prisma.portfolio atau prisma.category.
export async function slugUnik(delegate, teks) {
  const dasar = slugify(teks)
  let slug = dasar
  for (let n = 2; await delegate.findUnique({ where: { slug } }); n++) slug = `${dasar}-${n}`
  return slug
}
