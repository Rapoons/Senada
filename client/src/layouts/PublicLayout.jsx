import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PageTransition from '../components/PageTransition'

export default function PublicLayout({ children }) {
  return (
    <PageTransition>
      <a href="#isi" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[60] focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">Lompat ke konten</a>
      <Navbar />
      <main id="isi">{children}</main>
      <Footer />
    </PageTransition>
  )
}
