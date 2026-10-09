// Uji modul proyek: akses per peran (anti-IDOR), tahapan + progres, dokumen berversi, komentar, notifikasi.
// Data uji dibuat lalu dibersihkan. Butuh MySQL hidup dan seed (akun demo).
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import app from '../src/app.js'
import { prisma } from '../src/lib/prisma.js'
import { PROJECT_DIR } from '../src/lib/uploads.js'

const PW = 'rahasia123'
const emails = ['uji.klienA@senada.test', 'uji.klienB@senada.test', 'uji.arsX@senada.test', 'uji.arsY@senada.test']
let base, server, P
const T = {}

const call = (method, p, token, body) =>
  fetch(base + p, {
    method,
    headers: { ...(token && { Authorization: `Bearer ${token}` }), ...(body && !(body instanceof FormData) && { 'Content-Type': 'application/json' }) },
    body: body instanceof FormData ? body : body && JSON.stringify(body),
  })
const json = async (res) => (await res.json()).data
const login = async (email, password = PW) => (await json(await call('POST', '/auth/login', null, { email, password }))).token
const berkas = (isi, nama, extra = {}) => {
  const f = new FormData()
  f.append('berkas', new Blob([isi]), nama)
  Object.entries(extra).forEach(([k, v]) => f.append(k, v))
  return f
}

test.before(async () => {
  await new Promise((r) => { server = app.listen(0, () => { base = `http://localhost:${server.address().port}/api`; r() }) })
  T.admin = await login('admin@senada.test', 'Demo12345!')
  const buat = (nama, email, role) => call('POST', '/admin/users', T.admin, { nama, email, password: PW, role })
  const x = await json(await buat('Arsitek X', emails[2], 'ARSITEK'))
  await buat('Arsitek Y', emails[3], 'ARSITEK')
  await buat('Klien B', emails[1], 'KLIEN')
  P = await json(await call('POST', '/admin/projects', T.admin, {
    nama: 'Proyek Uji Modul', klienBaru: { nama: 'Klien A', email: emails[0], password: PW }, arsitekIds: [x.id],
  }))
  // Detail lengkap (dengan tahapan) lewat endpoint proyek.
  P = await json(await call('GET', `/projects/${P.id}`, T.admin))
  T.A = await login(emails[0]); T.B = await login(emails[1]); T.X = await login(emails[2]); T.Y = await login(emails[3])
})
test.after(async () => {
  await prisma.project.deleteMany({ where: { nama: 'Proyek Uji Modul' } })
  await prisma.user.deleteMany({ where: { email: { in: emails } } })
  if (P) fs.rmSync(path.join(PROJECT_DIR, String(P.id)), { recursive: true, force: true })
  server.close()
  await prisma.$disconnect()
})

test('anti-IDOR: proyek orang lain tidak terlihat (404) di semua endpoint', async () => {
  for (const [token, nama] of [[T.B, 'klien lain'], [T.Y, 'arsitek tidak ditugaskan']]) {
    for (const [m, p, b] of [['GET', `/projects/${P.id}`], ['GET', `/projects/${P.id}/files`], ['GET', `/projects/${P.id}/comments`], ['POST', `/projects/${P.id}/comments`, { isi: 'coba' }]]) {
      assert.equal((await call(m, p, token, b)).status, 404, `${nama}: ${m} ${p}`)
    }
    assert.ok(!(await json(await call('GET', '/projects', token))).some((x) => x.id === P.id), `${nama}: daftar`)
  }
  assert.equal((await call('GET', `/projects/${P.id}`, T.A)).status, 200)
  assert.equal((await call('GET', `/projects/${P.id}`, T.X)).status, 200)
  assert.equal((await call('GET', '/projects/abc', T.A)).status, 400)
  assert.equal((await call('GET', `/projects/${P.id}`)).status, 401)
})

test('klien hanya baca: tidak bisa ubah tahapan, proyek, atau unggah dokumen', async () => {
  const tahap = P.tahapan[0]
  assert.equal((await call('PATCH', `/projects/${P.id}/stages/${tahap.id}`, T.A, { status: 'SELESAI' })).status, 403)
  assert.equal((await call('PATCH', `/projects/${P.id}`, T.A, { nama: 'diretas' })).status, 403)
  assert.equal((await call('POST', `/projects/${P.id}/files`, T.A, berkas('%PDF-1.4', 'a.pdf'))).status, 403)
})

test('arsitek ubah status tahapan: progres otomatis, klien dapat notifikasi, field lain ditolak', async () => {
  const [t1, t2] = P.tahapan
  assert.equal((await call('PATCH', `/projects/${P.id}/stages/${t1.id}`, T.X, { nama: 'ganti nama' })).status, 400)
  const baru = await json(await call('PATCH', `/projects/${P.id}/stages/${t1.id}`, T.X, { status: 'SELESAI' }))
  assert.equal(baru.progres, 14) // 1 dari 7 tahapan
  assert.ok(baru.tahapan[0].tanggalSelesai)
  await call('PATCH', `/projects/${P.id}/stages/${t2.id}`, T.X, { status: 'BERJALAN' })
  assert.equal((await call('PATCH', `/projects/${P.id}/stages/${t1.id}`, T.Y, { status: 'BELUM' })).status, 404) // arsitek lain
  const n = await json(await call('GET', '/notifications', T.A))
  assert.ok(n.items.some((i) => i.pesan.includes('Konsultasi')) && n.belumDibaca >= 2)
})

test('dokumen: versi naik, unduh berotorisasi, tidak bisa lewat URL statis, file palsu ditolak', async () => {
  const pdf = '%PDF-1.4 isi uji'
  const v1 = await json(await call('POST', `/projects/${P.id}/files`, T.X, berkas(pdf, 'denah.pdf', { nama: 'Denah Lantai 1' })))
  const v2 = await json(await call('POST', `/projects/${P.id}/files`, T.X, berkas(pdf + ' revisi', 'denah2.pdf', { nama: 'Denah Lantai 1', catatanRevisi: 'Geser tangga' })))
  assert.equal(v1.versi, 1)
  assert.equal(v2.versi, 2)
  assert.equal(v2.catatanRevisi, 'Geser tangga')

  const unduh = await call('GET', `/files/${v2.id}/download`, T.A)
  assert.equal(unduh.status, 200)
  assert.equal(await unduh.text(), pdf + ' revisi')
  assert.match(unduh.headers.get('content-disposition'), /attachment/)
  for (const token of [T.B, T.Y, null]) assert.ok([401, 404].includes((await call('GET', `/files/${v2.id}/download`, token)).status))

  const rel = (await prisma.projectFile.findUnique({ where: { id: v2.id } })).path
  assert.equal((await fetch(`${base.replace('/api', '')}/uploads/projects/${rel}`)).status, 404) // dokumen privat tidak dilayani statis

  assert.equal((await call('POST', `/projects/${P.id}/files`, T.X, berkas('bukan pdf', 'palsu.pdf'))).status, 400)
  assert.equal((await call('POST', `/projects/${P.id}/files`, T.X, berkas('MZ...', 'virus.exe'))).status, 400)
  assert.equal((await call('DELETE', `/files/${v1.id}`, T.A)).status, 403)
  assert.equal((await call('DELETE', `/files/${v1.id}`, T.X)).status, 200)

  const n = await json(await call('GET', '/notifications', T.A))
  assert.ok(n.items.some((i) => i.pesan.includes('Denah Lantai 1')))
})

test('komentar: klien ajukan revisi, arsitek membalas, saling dapat notifikasi', async () => {
  const k = await json(await call('POST', `/projects/${P.id}/comments`, T.A, { isi: 'Tolong perbesar ruang tamu', jenis: 'REVISI' }))
  assert.equal(k.jenis, 'REVISI')
  const nX = await json(await call('GET', '/notifications', T.X))
  assert.ok(nX.items.some((i) => i.pesan.includes('permintaan revisi')))

  assert.equal((await call('POST', `/projects/${P.id}/comments`, T.X, { isi: 'Baik, kami revisi', parentId: k.id })).status, 201)
  assert.equal((await call('POST', `/projects/${P.id}/comments`, T.X, { isi: 'x', parentId: 999999 })).status, 400)
  assert.equal((await call('POST', `/projects/${P.id}/comments`, T.A, { isi: '   ' })).status, 400)
  const semua = await json(await call('GET', `/projects/${P.id}/comments`, T.A))
  assert.equal(semua.length, 2)
  assert.equal(semua[1].parentId, k.id)

  // Notifikasi hanya bisa ditandai oleh pemiliknya.
  const nA = await json(await call('GET', '/notifications', T.A))
  await call('PATCH', `/notifications/${nA.items[0].id}/read`, T.B)
  assert.equal((await json(await call('GET', '/notifications', T.A))).belumDibaca, nA.belumDibaca)
  await call('POST', '/notifications/read-all', T.A)
  assert.equal((await json(await call('GET', '/notifications', T.A))).belumDibaca, 0)
})

test('admin: tambah, geser, hapus tahapan; progres dihitung ulang; arsitek tidak boleh', async () => {
  let p = await json(await call('POST', `/projects/${P.id}/stages`, T.admin, { nama: 'Tahap Tambahan' }))
  assert.equal(p.tahapan.length, 8)
  assert.equal((await call('POST', `/projects/${P.id}/stages`, T.X, { nama: 'Tidak boleh' })).status, 403)
  const baru = p.tahapan.at(-1)
  p = await json(await call('POST', `/projects/${P.id}/stages/${baru.id}/move`, T.admin, { arah: 'naik' }))
  assert.equal(p.tahapan.at(-2).id, baru.id)
  p = await json(await call('DELETE', `/projects/${P.id}/stages/${baru.id}`, T.admin))
  assert.equal(p.tahapan.length, 7)
  assert.equal(p.progres, 14)
  p = await json(await call('PATCH', `/projects/${P.id}`, T.admin, { status: 'DITUNDA', arsitekIds: [] }))
  assert.equal(p.status, 'DITUNDA')
  assert.equal(p.anggota.length, 0)
  assert.equal((await call('GET', `/projects/${P.id}`, T.X)).status, 404) // dicabut dari penugasan = kehilangan akses
})
