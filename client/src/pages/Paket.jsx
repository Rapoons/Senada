import { useMemo, useState } from 'react'
import { useApi } from '../lib/api'
import { TINGKATAN, LINGKUP, rupiah, hitungEstimasi, parseLuas, pesanWhatsApp, linkWhatsApp } from '../lib/estimasi'

const label = 'text-xs uppercase tracking-[0.22em] text-accent'

// Pilihan bergaya tombol, tetap radio asli agar bisa dipakai dengan keyboard dan pembaca layar.
function Pilihan({ nama, nilai, teks, checked, onChange }) {
  return (
    <label className="cursor-pointer">
      <input type="radio" name={nama} value={nilai} checked={checked} onChange={() => onChange(nilai)} className="peer sr-only" />
      <span className="block border border-ink/40 px-5 py-3 text-sm transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent hover:border-ink">
        {teks}
      </span>
    </label>
  )
}

export default function Paket() {
  const { data: paket, error, loading } = useApi('/packages')
  const [tingkatan, setTingkatan] = useState('SILVER')
  const [lingkup, setLingkup] = useState('INTERIOR')
  const [luasTeks, setLuasTeks] = useState('')

  const terpilih = useMemo(() => paket?.find((p) => p.tingkatan === tingkatan && p.lingkup === lingkup), [paket, tingkatan, lingkup])
  const luas = parseLuas(luasTeks)
  const estimasi = terpilih && luas ? hitungEstimasi(luas, terpilih.tarifPerM2) : null
  const wa = estimasi ? linkWhatsApp(import.meta.env.VITE_WHATSAPP_NUMBER, pesanWhatsApp({ paket: terpilih, luas, estimasi })) : null

  if (loading) return <p className="px-6 pb-28 pt-40 md:px-16">Memuat paket...</p>
  if (error) return <p className="px-6 pb-28 pt-40 md:px-16">Data paket belum bisa dimuat. Pastikan server API berjalan.</p>

  return (
    <div className="mx-auto max-w-[1440px] px-6 pb-12 pt-4 md:px-16 md:pt-8">
      <h1 className="max-w-[14ch] font-display text-6xl font-normal leading-[1.02] md:text-8xl">Paket dan estimasi</h1>
      <p className="mt-8 max-w-md">Pilih tingkatan dan lingkup, isi total luas lantai, lalu lihat perkiraan biayanya. Lanjutkan konsultasi langsung lewat WhatsApp.</p>

      {/* Tabel tarif: data dari database */}
      <section className="mt-24" aria-labelledby="tarif">
        <h2 id="tarif" className={label}>Tarif per m²</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-left">
            <thead>
              <tr className="border-b border-ink text-sm text-muted">
                <th className="py-3 pr-4 font-normal">Tingkatan</th>
                {Object.values(LINGKUP).map((l) => <th key={l} className="py-3 pr-4 font-normal">{l}</th>)}
              </tr>
            </thead>
            <tbody>
              {Object.entries(TINGKATAN).map(([kode, nama]) => (
                <tr key={kode} className="border-b border-line">
                  <th scope="row" className="py-4 pr-4 font-display text-2xl font-medium">{nama}</th>
                  {Object.keys(LINGKUP).map((l) => {
                    const p = paket.find((x) => x.tingkatan === kode && x.lingkup === l)
                    return <td key={l} className="py-4 pr-4">{p ? rupiah(p.tarifPerM2) : '-'}</td>
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Kalkulator estimasi */}
      <section className="mt-28 grid gap-12 md:grid-cols-12 md:gap-x-6" aria-labelledby="hitung">
        <div className="space-y-10 md:col-span-6">
          <h2 id="hitung" className={label}>Hitung estimasi</h2>
          <fieldset>
            <legend className="mb-3 text-sm">1. Tingkatan</legend>
            <div className="flex flex-wrap gap-2">
              {Object.entries(TINGKATAN).map(([k, v]) => <Pilihan key={k} nama="tingkatan" nilai={k} teks={v} checked={tingkatan === k} onChange={setTingkatan} />)}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-3 text-sm">2. Lingkup</legend>
            <div className="flex flex-wrap gap-2">
              {Object.entries(LINGKUP).map(([k, v]) => <Pilihan key={k} nama="lingkup" nilai={k} teks={v} checked={lingkup === k} onChange={setLingkup} />)}
            </div>
          </fieldset>
          <label className="block text-sm">3. Total luas lantai (m²)
            <input
              inputMode="decimal"
              value={luasTeks}
              onChange={(e) => setLuasTeks(e.target.value)}
              placeholder="contoh: 120"
              className="mt-3 block w-full max-w-[16rem] border-0 border-b border-ink/40 bg-transparent py-3 text-2xl focus:border-accent"
              aria-describedby="luas-bantuan"
            />
            <span id="luas-bantuan" className="mt-2 block text-xs text-muted">Total semua lantai, bukan luas lahan. Isi angka 1 sampai 100.000.</span>
          </label>
        </div>

        <aside className="border-t border-ink pt-8 md:col-span-5 md:col-start-8" aria-live="polite">
          <span className="text-[11px] uppercase tracking-[0.18em] text-muted">Estimasi awal</span>
          <p className="mt-2 font-display text-6xl font-normal leading-none">{estimasi ? rupiah(estimasi) : 'Rp -'}</p>
          {terpilih && <p className="mt-3 text-sm text-muted">{TINGKATAN[tingkatan]} · {LINGKUP[lingkup]} · {rupiah(terpilih.tarifPerM2)} per m²</p>}
          <p className="mt-6 text-sm">Angka ini hanya estimasi awal, bukan penawaran final. Harga masih bisa dinegosiasi dan ditentukan setelah konsultasi.</p>

          {terpilih && (
            <ul className="mt-8 space-y-2 border-t border-line pt-6 text-sm">
              {terpilih.fasilitas.map((f) => <li key={f.teks}>{f.teks}</li>)}
            </ul>
          )}

          <div className="mt-10">
            {wa ? (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-block bg-accent px-8 py-4 text-sm tracking-wider text-paper transition-transform hover:-translate-y-0.5 motion-reduce:transition-none">
                Chat via WhatsApp
              </a>
            ) : (
              <>
                <button disabled className="cursor-not-allowed bg-ink/30 px-8 py-4 text-sm tracking-wider text-paper">Chat via WhatsApp</button>
                <p className="mt-3 text-xs text-muted">
                  {estimasi ? 'Nomor WhatsApp studio belum diatur (VITE_WHATSAPP_NUMBER).' : 'Isi total luas lantai terlebih dahulu.'}
                </p>
              </>
            )}
          </div>
        </aside>
      </section>
      <p className="mt-16 text-xs text-muted">Tarif dan fasilitas di atas masih data contoh sampai dikonfirmasi Senada Studio.</p>
    </div>
  )
}
