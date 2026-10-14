import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Logo from './Logo'

const links = [
  ['/', 'Home'],
  ['/portofolio', 'Portfolio'],
  ['/paket', 'Packages & Estimate'],
]

// Tombol WhatsApp di header: sapaan umum. Pesan berisi estimasi dibuat di halaman Packages.
const nomor = import.meta.env.VITE_WHATSAPP_NUMBER
const waUrl = nomor ? `https://wa.me/${nomor}?text=${encodeURIComponent('Halo Senada Studio, saya ingin berkonsultasi.')}` : null
const btnLogin = 'border border-ink px-4 py-2 text-sm tracking-wide transition-colors hover:bg-ink hover:text-paper'
const btnWa = 'bg-accent px-4 py-2 text-sm tracking-wide text-paper transition-opacity hover:opacity-90'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const cls = ({ isActive }) => `text-sm tracking-wide ${isActive ? 'border-b border-accent pb-1' : 'hover:text-accent'}`
  return (
    <header className="sticky top-0 z-50 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-3 md:px-16">
        <Link to="/" aria-label="Senada Arsitektur, home" onClick={() => setOpen(false)}>
          <Logo width={96} />
        </Link>
        <nav className="hidden gap-10 md:flex" aria-label="Navigasi utama">
          {links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'} className={cls}>{label}</NavLink>)}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login" className={btnLogin}>Login</Link>
          {waUrl && <a href={waUrl} target="_blank" rel="noopener noreferrer" className={btnWa}>WhatsApp</a>}
        </div>
        <button className="text-sm md:hidden" aria-expanded={open} aria-controls="menu-hp" onClick={() => setOpen(!open)}>
          {open ? 'Tutup' : 'Menu'}
        </button>
      </div>
      {open && (
        <nav id="menu-hp" className="flex flex-col gap-4 px-6 pb-6 md:hidden" aria-label="Navigasi utama">
          {links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'} className={cls} onClick={() => setOpen(false)}>{label}</NavLink>)}
          <div className="flex gap-3 pt-2">
            <Link to="/login" className={btnLogin} onClick={() => setOpen(false)}>Login</Link>
            {waUrl && <a href={waUrl} target="_blank" rel="noopener noreferrer" className={btnWa}>WhatsApp</a>}
          </div>
        </nav>
      )}
    </header>
  )
}
