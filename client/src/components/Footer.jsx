import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer>
      {/* Ajakan menuju kalkulator estimasi dan WhatsApp */}
      <section className="mx-auto grid max-w-[1440px] items-end gap-10 px-6 pb-24 pt-32 md:grid-cols-12 md:gap-x-6 md:px-16 md:pt-40">
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
        </div>
        <div className="flex flex-col gap-1.5 md:col-span-3 md:col-start-10">
          <span className="mb-1.5 text-[11px] uppercase tracking-[0.18em] text-muted">Jelajahi</span>
          <Link to="/portofolio" className="hover:text-accent">Portofolio</Link>
          <Link to="/paket" className="hover:text-accent">Paket dan Estimasi</Link>
          <Link to="/masuk" className="hover:text-accent">Masuk (klien dan tim)</Link>
        </div>
      </div>
      <p className="mx-auto max-w-[1440px] px-6 pb-10 text-xs text-muted md:px-16">&copy; {new Date().getFullYear()} Senada Studio Arsitektur</p>
    </footer>
  )
}
