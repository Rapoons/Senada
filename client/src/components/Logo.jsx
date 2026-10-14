// Logo sudah dipotong rapat dan transparan (lihat public/images/logo-senada.png),
// jadi cukup satu gambar; tinggi mengikuti rasio aslinya.
export default function Logo({ width = 130, className = '' }) {
  return <img src="/images/logo-senada.png" alt="Senada Arsitektur" width={width} className={`block h-auto ${className}`} style={{ width, aspectRatio: '295 / 205' }} />
}
