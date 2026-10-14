import { Link } from 'react-router-dom'
import Logo from './Logo'

// Ikon kontak fungsional (hitam mengikuti warna teks). Path 24x24 stroke.
const ikon = {
  mail: <><rect x="3" y="5" width="18" height="14" rx="1" /><path d="m3 7 9 6 9-6" /></>,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />,
  whatsapp: <><path d="M3 21l1.6-4.8A8.5 8.5 0 1 1 8 19.5L3 21Z" /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-2-2l.8-1-1-2L9 9.5Z" /></>,
}
const nomorWa = import.meta.env.VITE_WHATSAPP_NUMBER
const kontak = [
  ['mail', 'Email', 'mailto:senadastudio@gmail.com'],
  ['phone', 'Telepon', 'tel:+62895701997526'],
  nomorWa && ['whatsapp', 'WhatsApp', `https://wa.me/${nomorWa}`],
].filter(Boolean)

export default function Footer() {
  return (
    <footer>
      {/* Ajakan menuju kalkulator estimasi dan WhatsApp */}
      <section className="mx-auto grid max-w-[1440px] items-end gap-10 px-6 pb-24 pt-16 md:grid-cols-12 md:gap-x-6 md:px-16 md:pt-24">
        <h2 className="font-display text-5xl font-light leading-none md:col-span-7 md:text-7xl">Punya rencana bangunan? Mari bicarakan.</h2>
        <div className="flex flex-col items-start gap-6 md:col-span-4 md:col-start-9">
          <p>Pilih paket, isi total luas lantai, dan lihat estimasi awalnya. Lanjutkan konsultasi langsung lewat WhatsApp.</p>
          <Link to="/paket" className="bg-accent px-8 py-4 text-sm tracking-wider text-paper transition-transform hover:-translate-y-0.5 motion-reduce:transition-none">
            Hitung Estimasi
          </Link>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1440px] gap-10 border-t border-ink px-6 py-12 text-sm md:grid-cols-12 md:gap-x-6 md:px-16">
        <div className="md:col-span-4"><Logo width={150} /></div>
        <div className="flex flex-col gap-1.5 md:col-span-3 md:col-start-6">
          <span className="mb-1.5 text-[11px] uppercase tracking-[0.18em] text-muted">Kontak</span>
          <span>Pontianak, Kalimantan Barat</span>
          <a href="mailto:senadastudio@gmail.com" className="hover:text-accent">senadastudio@gmail.com</a>
          <a href="tel:+62895701997526" className="hover:text-accent">0895-7019-97526</a>
          <div className="mt-3 flex gap-4">
            {kontak.map(([nama, label, href]) => (
              <a key={nama} href={href} aria-label={label} className="text-ink hover:text-accent" {...(href.startsWith('http') && { target: '_blank', rel: 'noopener noreferrer' })}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ikon[nama]}</svg>
              </a>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5 md:col-span-3 md:col-start-10">
          <span className="mb-1.5 text-[11px] uppercase tracking-[0.18em] text-muted">Jelajahi</span>
          <Link to="/portofolio" className="hover:text-accent">Portfolio</Link>
          <Link to="/paket" className="hover:text-accent">Packages & Estimate</Link>
          <Link to="/login" className="hover:text-accent">Login</Link>
        </div>
      </div>
      <p className="mx-auto max-w-[1440px] px-6 pb-10 text-xs text-muted md:px-16">&copy; {new Date().getFullYear()} Senada Studio Arsitektur</p>
    </footer>
  )
}
