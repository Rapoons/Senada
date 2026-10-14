// Uji API admin: RBAC, paket, portofolio + unggah gambar, akun, proyek.
// Data uji dibuat lalu dibersihkan. Butuh MySQL hidup dan seed (akun demo).
import test from 'node:test'
import assert from 'node:assert/strict'
import app from '../src/app.js'
import { prisma } from '../src/lib/prisma.js'

let base, server, admin, klien
const PW = 'Demo12345!' // password akun demo dari prisma/seed.js
const cleanup = { portfolioIds: [], userEmails: [], projectNames: [] }

test.before(async () => {
  await new Promise((r) => { server = app.listen(0, () => { base = `http://localhost:${server.address().port}/api`; r() }) })
  const login = async (email) => (await (await fetch(base + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: PW }) })).json()).data.token
  admin = await login('admin@senada.test')
  klien = await login('klien@senada.test')
})
test.after(async () => {
  await prisma.project.deleteMany({ where: { nama: { in: cleanup.projectNames } } })
  await prisma.user.deleteMany({ where: { email: { in: cleanup.userEmails } } })
  for (const id of cleanup.portfolioIds) await call('DELETE', `/admin/portfolios/${id}`, admin).catch(() => {})
  server.close()
  await prisma.$disconnect()
})

const call = (method, path, token, body) =>
  fetch(base + path, {
    method,
    headers: { ...(token && { Authorization: `Bearer ${token}` }), ...(body && !(body instanceof FormData) && { 'Content-Type': 'application/json' }) },
    body: body instanceof FormData ? body : body && JSON.stringify(body),
  })
const json = async (res) => (await res.json()).data

test('RBAC: tanpa token 401, klien 403, admin 200', async () => {
  assert.equal((await call('GET', '/admin/summary')).status, 401)
  assert.equal((await call('GET', '/admin/users', klien)).status, 403)
  assert.equal((await call('GET', '/admin/users', admin)).status, 200)
})

test('paket: ubah tarif dan fasilitas, lalu kembalikan', async () => {
  const awal = (await json(await call('GET', '/admin/packages', admin)))[0]
  const res = await call('PATCH', `/admin/packages/${awal.id}`, admin, { tarifPerM2: awal.tarifPerM2 + 1000, fasilitas: ['Uji A', 'Uji B'] })
  const baru = await json(res)
  assert.equal(baru.tarifPerM2, awal.tarifPerM2 + 1000)
  assert.deepEqual(baru.fasilitas.map((f) => f.teks), ['Uji A', 'Uji B'])
  assert.equal((await call('PATCH', `/admin/packages/${awal.id}`, admin, { tarifPerM2: 5 })).status, 400) // di bawah batas
  await call('PATCH', `/admin/packages/${awal.id}`, admin, { tarifPerM2: awal.tarifPerM2, fasilitas: awal.fasilitas.map((f) => f.teks) })
})

test('portofolio: buat, slug unik, unggah gambar valid, tolak gambar palsu', async () => {
  const kat = (await json(await call('GET', '/categories')))[0]
  const a = await json(await call('POST', '/admin/portfolios', admin, { judul: 'Rumah Uji Otomatis', categoryId: kat.id }))
  const b = await json(await call('POST', '/admin/portfolios', admin, { judul: 'Rumah Uji Otomatis', categoryId: kat.id }))
  cleanup.portfolioIds.push(a.id, b.id)
  assert.equal(a.slug, 'rumah-uji-otomatis')
  assert.equal(b.slug, 'rumah-uji-otomatis-2')

  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==', 'base64')
  const form = new FormData()
  form.append('gambar', new Blob([png], { type: 'image/png' }), 'x.png')
  const ok = await call('POST', `/admin/portfolios/${a.id}/images`, admin, form)
  assert.equal(ok.status, 201)
  const hasil = await json(ok)
  assert.equal(hasil.gambar.length, 1)
  assert.equal(hasil.gambar[0].sampul, true) // gambar pertama otomatis jadi sampul
  assert.equal((await fetch(base.replace('/api', '') + hasil.gambar[0].path)).status, 200)

  const palsu = new FormData()
  palsu.append('gambar', new Blob(['ini bukan gambar'], { type: 'image/png' }), 'palsu.png')
  assert.equal((await call('POST', `/admin/portfolios/${a.id}/images`, admin, palsu)).status, 400)
  const bukanGambar = new FormData()
  bukanGambar.append('gambar', new Blob(['<script>'], { type: 'text/html' }), 'x.html')
  assert.equal((await call('POST', `/admin/portfolios/${a.id}/images`, admin, bukanGambar)).status, 400)

  // Belum terbit: tidak tampil di API publik.
  assert.equal((await call('GET', `/portfolios/${a.slug}`)).status, 404)
  await call('PATCH', `/admin/portfolios/${a.id}`, admin, { terbit: true })
  assert.equal((await call('GET', `/portfolios/${a.slug}`)).status, 200)
})

test('akun: email duplikat 409, admin tidak bisa menonaktifkan diri sendiri', async () => {
  const email = 'uji.otomatis@senada.test'
  cleanup.userEmails.push(email)
  const body = { nama: 'Uji Otomatis', email, password: 'rahasia123', role: 'KLIEN' }
  const dibuat = await call('POST', '/admin/users', admin, body)
  assert.equal(dibuat.status, 201)
  assert.equal((await json(dibuat)).passwordHash, undefined) // hash tidak bocor
  assert.equal((await call('POST', '/admin/users', admin, body)).status, 409)
  assert.equal((await call('POST', '/admin/users', admin, { ...body, email: 'lain@senada.test', password: 'pendek' })).status, 400)
  const me = await json(await call('GET', '/auth/me', admin))
  assert.equal((await call('PATCH', `/admin/users/${me.id}`, admin, { aktif: false })).status, 400)
})

test('proyek: buat dengan klien baru, 7 tahapan default, validasi klien/arsitek', async () => {
  const email = 'klien.baru.uji@senada.test'
  cleanup.userEmails.push(email)
  cleanup.projectNames.push('Proyek Uji Otomatis')
  const res = await call('POST', '/admin/projects', admin, { nama: 'Proyek Uji Otomatis', klienBaru: { nama: 'Klien Uji', email, password: 'rahasia123' }, arsitekIds: [] })
  assert.equal(res.status, 201)
  const p = await json(res)
  assert.equal(p.klien.email, email)
  assert.equal(await prisma.projectStage.count({ where: { projectId: p.id } }), 7)
  assert.equal((await call('POST', '/admin/projects', admin, { nama: 'Tanpa klien' })).status, 400)
  assert.equal((await call('POST', '/admin/projects', admin, { nama: 'Arsitek salah', klienBaru: { nama: 'K', email: 'k@x.test', password: 'rahasia123' }, arsitekIds: [p.clientId] })).status, 400)
  const ringkas = await json(await call('GET', '/admin/summary', admin))
  assert.ok(ringkas.proyek.AKTIF >= 1)
  assert.ok(Array.isArray(ringkas.daftarTunda) && ringkas.daftarTunda.length <= ringkas.tahapTertunda)
})
