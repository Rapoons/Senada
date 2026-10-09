// Logika estimasi harga dan pesan WhatsApp. Murni (tanpa React) agar mudah diuji.

export const TINGKATAN = { BASIC: 'Basic', SILVER: 'Silver', PLATINUM: 'Platinum' }
export const LINGKUP = { INTERIOR: 'Interior', EKSTERIOR: 'Eksterior', FULL: 'Full Package' }

export const rupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

// Rumus: luas (m2) x tarif per m2 paket yang dipilih. Tarif berasal dari database lewat API.
export const hitungEstimasi = (luas, tarifPerM2) => Math.round(luas * tarifPerM2)

// Luas valid: angka 1 sampai 100.000 m2. Selain itu dianggap belum diisi.
export function parseLuas(teks) {
  const n = Number(String(teks).replace(',', '.'))
  return Number.isFinite(n) && n >= 1 && n <= 100000 ? n : null
}

export function pesanWhatsApp({ paket, luas, estimasi }) {
  return [
    'Halo Senada Studio, saya ingin berkonsultasi.',
    '',
    `Paket: ${TINGKATAN[paket.tingkatan]} - ${LINGKUP[paket.lingkup]}`,
    `Total luas lantai: ${luas} m2`,
    `Tarif: ${rupiah(paket.tarifPerM2)} per m2`,
    `Estimasi awal: ${rupiah(estimasi)} (estimasi dari website, bukan penawaran final)`,
    '',
    'Nama:',
    'Jenis bangunan:',
    'Lokasi:',
    'Kebutuhan:',
  ].join('\n')
}

// nomor: format internasional tanpa + (contoh 628123456789). Kosong = belum diatur.
export const linkWhatsApp = (nomor, pesan) =>
  nomor ? `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}` : null
