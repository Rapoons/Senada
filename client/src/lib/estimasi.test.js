// Jalankan: npm test
import test from 'node:test'
import assert from 'node:assert/strict'
import { hitungEstimasi, parseLuas, pesanWhatsApp, linkWhatsApp } from './estimasi.js'

test('estimasi = luas x tarif', () => {
  assert.equal(hitungEstimasi(120, 55000), 6600000)
  assert.equal(hitungEstimasi(36.5, 35000), 1277500)
})

test('luas tidak valid ditolak', () => {
  for (const x of ['', 'abc', '0', '-5', '100001']) assert.equal(parseLuas(x), null)
  assert.equal(parseLuas('45,5'), 45.5)
})

test('pesan WhatsApp memuat paket, luas, estimasi; link kosong bila nomor belum diatur', () => {
  const pesan = pesanWhatsApp({ paket: { tingkatan: 'SILVER', lingkup: 'FULL', tarifPerM2: 100000 }, luas: 80, estimasi: 8000000 })
  assert.match(pesan, /Silver - Full Package/)
  assert.match(pesan, /80 m2/)
  assert.equal(linkWhatsApp('', pesan), null)
  assert.ok(linkWhatsApp('628123', pesan).startsWith('https://wa.me/628123?text='))
})
