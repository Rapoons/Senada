import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Logo from './Logo'

const links = [
  ['/', 'Beranda'],
  ['/portofolio', 'Portofolio'],
  ['/paket', 'Paket dan Estimasi'],
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const cls = ({ isActive }) => `text-sm tracking-wide ${isActive ? 'border-b border-accent pb-1' : 'hover:text-accent'}`
  return (
    <header className="sticky top-0 z-50 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-3 md:px-16">
        <Link to="/" aria-label="Senada Arsitektur, beranda" onClick={() => setOpen(false)}>
          <Logo width={96} />
        </Link>
        <nav className="hidden gap-10 md:flex" aria-label="Navigasi utama">
          {links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'} className={cls}>{label}</NavLink>)}
        </nav>
        <button className="text-sm md:hidden" aria-expanded={open} aria-controls="menu-hp" onClick={() => setOpen(!open)}>
          {open ? 'Tutup' : 'Menu'}
        </button>
      </div>
      {open && (
        <nav id="menu-hp" className="flex flex-col gap-4 px-6 pb-6 md:hidden" aria-label="Navigasi utama">
          {links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'} className={cls} onClick={() => setOpen(false)}>{label}</NavLink>)}
        </nav>
      )}
    </header>
  )
}
