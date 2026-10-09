import 'dotenv/config'

// Gagal cepat bila konfigurasi penting kosong atau lemah: lebih baik server tidak jalan
// daripada jalan dengan rahasia JWT kosong (token bisa dipalsukan).
const wajib = ['DATABASE_URL', 'CLIENT_ORIGIN', 'JWT_SECRET']
const kurang = wajib.filter((k) => !process.env[k])
if (kurang.length) {
  console.error(`Konfigurasi .env belum lengkap: ${kurang.join(', ')}. Lihat .env.example.`)
  process.exit(1)
}
if (process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.startsWith('GANTI')) {
  console.error('JWT_SECRET terlalu pendek atau masih contoh. Isi dengan string acak minimal 32 karakter.')
  process.exit(1)
}

const { default: app } = await import('./app.js')
const port = process.env.PORT || 4000
app.listen(port, () => console.log(`API berjalan di http://localhost:${port}`))
