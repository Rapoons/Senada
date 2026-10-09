// Seed DATA CONTOH untuk demo. Bukan data asli Senada Studio.
// Tarif Interior/Eksterior dan fasilitas dari client; tarif FULL masih sementara.
import bcrypt from 'bcrypt'
import { prisma } from '../src/lib/prisma.js'

// Akun demo (satu per peran). Ganti password sebelum dipakai di luar demo lokal.
const DEMO_PASSWORD = 'Demo12345!'
const users = [
  { nama: 'Admin Demo', email: 'admin@senada.test', role: 'ADMIN' },
  { nama: 'Arsitek Demo', email: 'arsitek@senada.test', role: 'ARSITEK' },
  { nama: 'Klien Demo', email: 'klien@senada.test', role: 'KLIEN' },
]

// Tarif per m2 (Rp). Interior dan Eksterior dari client (2026-10-08).
// FULL belum diberikan client: sementara = Interior + Eksterior, WAJIB dikonfirmasi.
const tarif = {
  BASIC:    { INTERIOR: 35000, EKSTERIOR: 35000, FULL: 70000 },
  SILVER:   { INTERIOR: 50000, EKSTERIOR: 50000, FULL: 100000 },
  PLATINUM: { INTERIOR: 65000, EKSTERIOR: 65000, FULL: 130000 },
}

// Fasilitas per tingkatan, dari client (ditulis untuk Eksterior; dipakai sama untuk semua lingkup,
// menunggu konfirmasi). Bonus dan jumlah revisi per paket belum diberikan client.
const dasar = ["Konsultasi", "Survei lokasi", "Gambar denah", "Visualisasi 3D"]
const fasilitas = {
  BASIC: dasar,
  SILVER: [...dasar, "Gambar kerja"],
  PLATINUM: [...dasar, "Gambar kerja", "RAB"],
}

const kategori = [
  { nama: 'Interior', slug: 'interior' },
  { nama: 'Eksterior', slug: 'eksterior' },
  { nama: 'Full Package', slug: 'full-package' },
]

const portofolio = [
  { judul: 'Ruang Keluarga (data contoh)', slug: 'ruang-keluarga-contoh', kategori: 'interior', unggulan: true, gambar: '/images/hero-ruang-keluarga.webp', alt: 'Ruang keluarga dengan panel kayu dan dinding marmer' },
  { judul: 'Ruang Tamu (data contoh)', slug: 'ruang-tamu-contoh', kategori: 'interior', unggulan: false, gambar: '/images/hero-ruang-tamu.webp', alt: 'Ruang tamu dengan dinding panel putih dan lantai kayu' },
]

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10)
  for (const u of users) {
    await prisma.user.upsert({ where: { email: u.email }, update: {}, create: { ...u, passwordHash } })
  }

  for (const [tingkatan, perLingkup] of Object.entries(tarif)) {
    for (const [lingkup, tarifPerM2] of Object.entries(perLingkup)) {
      const p = await prisma.package.upsert({
        where: { tingkatan_lingkup: { tingkatan, lingkup } },
        update: {},
        create: { tingkatan, lingkup, tarifPerM2 },
      })
      // Fasilitas ditulis ulang agar seed bisa dijalankan berulang tanpa duplikat.
      await prisma.packageFeature.deleteMany({ where: { packageId: p.id } })
      await prisma.packageFeature.createMany({
        data: fasilitas[tingkatan].map((teks, urutan) => ({ packageId: p.id, teks, urutan })),
      })
    }
  }

  for (const k of kategori) await prisma.category.upsert({ where: { slug: k.slug }, update: {}, create: k })

  for (const p of portofolio) {
    const category = await prisma.category.findUniqueOrThrow({ where: { slug: p.kategori } })
    const data = {
      judul: p.judul,
      deskripsi: 'Data contoh untuk mengisi tampilan. Ganti dengan proyek asli lewat dashboard admin.',
      categoryId: category.id,
      unggulan: p.unggulan,
      terbit: true,
    }
    const row = await prisma.portfolio.upsert({ where: { slug: p.slug }, update: {}, create: { slug: p.slug, ...data } })
    await prisma.portfolioImage.deleteMany({ where: { portfolioId: row.id } })
    await prisma.portfolioImage.create({ data: { portfolioId: row.id, path: p.gambar, alt: p.alt, sampul: true } })
  }

  // Satu proyek contoh yang menghubungkan klien dan arsitek demo, untuk mencoba modul proyek.
  const NAMA_PROYEK = 'Rumah Tinggal Contoh (data contoh)'
  if (!(await prisma.project.findFirst({ where: { nama: NAMA_PROYEK } }))) {
    const klien = await prisma.user.findUniqueOrThrow({ where: { email: 'klien@senada.test' } })
    const arsitek = await prisma.user.findUniqueOrThrow({ where: { email: 'arsitek@senada.test' } })
    const tahapan = ['Konsultasi', 'Konsep Desain', 'Pengembangan Desain', 'Gambar Kerja', 'RAB', 'Pelaksanaan dan Pengawasan', 'Serah Terima']
    await prisma.project.create({
      data: {
        nama: NAMA_PROYEK,
        deskripsi: 'Proyek contoh untuk demo. Bukan proyek asli Senada Studio.',
        clientId: klien.id,
        progres: 14,
        anggota: { create: [{ userId: arsitek.id }] },
        tahapan: { create: tahapan.map((nama, urutan) => ({ nama, urutan, status: urutan === 0 ? 'SELESAI' : urutan === 1 ? 'BERJALAN' : 'BELUM' })) },
      },
    })
  }

  console.log('Seed selesai: 3 akun demo, 9 paket, 3 kategori, 2 portofolio dan 1 proyek contoh.')
}

main().finally(() => prisma.$disconnect())
