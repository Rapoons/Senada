// Uji cepat jalur keamanan dan data publik. Jalankan: npm test (butuh MySQL hidup dan seed).
import test from 'node:test'
import assert from 'node:assert/strict'
import app from '../src/app.js'
import { prisma } from '../src/lib/prisma.js'

let base
let server
test.before(() => new Promise((r) => { server = app.listen(0, () => { base = `http://localhost:${server.address().port}/api`; r() }) }))
test.after(async () => { server.close(); await prisma.$disconnect() })

const get = (path, token) => fetch(base + path, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
const login = (email, password) => fetch(base + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })

test('paket publik: 9 kombinasi dengan fasilitas', async () => {
  const { data } = await (await get('/packages')).json()
  assert.equal(data.length, 9)
  assert.ok(data.every((p) => p.tarifPerM2 > 0 && p.fasilitas.length > 0))
})

test('portofolio: filter kategori dan 404 untuk slug tidak ada', async () => {
  const { data } = await (await get('/portfolios?category=interior')).json()
  assert.ok(data.length >= 1)
  assert.equal((await get('/portfolios/tidak-ada')).status, 404)
})

test('login salah ditolak dengan pesan umum, endpoint terlindungi butuh token', async () => {
  const res = await login('admin@senada.test', 'salah')
  assert.equal(res.status, 401)
  assert.equal((await res.json()).message, 'Email atau password salah')
  assert.equal((await get('/auth/me')).status, 401)
  assert.equal((await get('/auth/me', 'token.palsu.sekali')).status, 401)
})
