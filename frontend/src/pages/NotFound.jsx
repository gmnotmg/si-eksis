import { Link } from 'react-router-dom'
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-50 px-4 text-center">
      <div className="text-6xl font-bold text-yellow-300 mb-2">404</div>
      <h1 className="text-xl font-bold text-stone-700 mb-1">Halaman tidak ditemukan</h1>
      <p className="text-sm text-stone-400 mb-6">Halaman yang Anda cari tidak ada atau sudah dipindahkan.</p>
      <Link to="/" className="btn-primary">Kembali ke Beranda</Link>
    </div>
  )
}
