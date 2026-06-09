import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useNotif } from '../../hooks/useNotif.js'
import toast from 'react-hot-toast'
import logoCirebon from '../../assets/Kabupaten_Cirebon.png'

export default function BidangLayout() {
  const { user, logout } = useAuth()
  const { count }        = useNotif()
  const navigate         = useNavigate()

  async function handleLogout() {
    await logout(); toast.success('Berhasil logout.'); navigate('/login')
  }

  const tabs = [
    { to: '/bidang',        label: 'Dashboard', end: true },
    { to: '/bidang/surat',  label: `Surat Masuk${count > 0 ? ` (${count})` : ''}` },
    { to: '/bidang/profil', label: 'Profil' },
  ]

  return (
    <div className="min-h-screen bg-yellow-50">
      <header className="sticky top-0 z-10 bg-white border-b border-yellow-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border-2 border-yellow-400 flex items-center justify-center p-0.5 flex-shrink-0">
              <img src={logoCirebon} alt="Logo" className="w-full h-full object-contain"
                onError={e => e.target.style.display='none'} />
            </div>
            <div>
              <div className="text-sm font-extrabold text-yellow-800 leading-tight">SI EKSIS</div>
              <div className="text-xs text-stone-400 leading-tight truncate max-w-[160px] sm:max-w-xs">{user?.bidang_nama}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {count > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-xl px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-bold text-red-600">{count} baru</span>
              </div>
            )}
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-stone-700">{user?.nama_lengkap}</p>
              <p className="text-xs text-stone-400">{user?.bidang_singkatan}</p>
            </div>
            <button onClick={handleLogout}
              className="p-2 rounded-xl text-red-400 hover:bg-red-50 transition-colors" title="Logout">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            </button>
          </div>
        </div>

        {/* Nav tabs */}
        <div className="max-w-4xl mx-auto px-4 flex gap-0">
          {tabs.map(tab => (
            <NavLink key={tab.to} to={tab.to} end={tab.end}
              className={({ isActive }) =>
                `px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                  isActive
                    ? 'border-yellow-500 text-yellow-800'
                    : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-yellow-200'
                }`
              }>
              {tab.label}
            </NavLink>
          ))}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}