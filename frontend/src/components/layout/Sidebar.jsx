import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useNotif } from '../../hooks/useNotif.js'
import { useTheme } from '../../hooks/useTheme.jsx'
import toast from 'react-hot-toast'
import logoCirebon from '../../assets/Kabupaten_Cirebon.png'

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const { count }        = useNotif()
  const { dark, toggle } = useTheme()
  const navigate         = useNavigate()
  const location         = useLocation()

  async function handleLogout() {
    await logout(); toast.success('Berhasil logout.'); navigate('/login')
  }

  // Cek apakah path aktif persis atau prefix — tapi Input Surat harus exact
  function isActive(path, exact = false) {
    if (exact) return location.pathname === path
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const navItems = [
    {
      to: '/admin', label: 'Dashboard', exact: true,
      customActive: location.pathname === '/admin',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
    },
    {
      to: '/admin/surat', label: 'Semua Surat', badge: count,
      // Aktif hanya di /admin/surat dan /admin/surat/edit/:id — BUKAN /admin/surat/input
      customActive: location.pathname === '/admin/surat' || location.pathname.startsWith('/admin/surat/edit'),
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
    },
    {
      to: '/admin/surat/input', label: 'Input Surat', exact: true,
      customActive: location.pathname === '/admin/surat/input',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
    },
    {
      to: '/admin/rekap', label: 'Rekap & Export',
      customActive: location.pathname.startsWith('/admin/rekap'),
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
    },
    {
      to: '/admin/pegawai', label: 'Data Pegawai',
      customActive: location.pathname.startsWith('/admin/pegawai'),
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
    },
    {
      to: '/admin/users', label: 'Manajemen User',
      customActive: location.pathname.startsWith('/admin/users'),
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
    },
    {
      to: '/admin/profil', label: 'Profil & Password',
      customActive: location.pathname.startsWith('/admin/profil'),
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
    },
  ]

  const activeClass = 'bg-yellow-100 text-yellow-900 font-bold'
  const inactiveClass = 'text-stone-500 hover:bg-yellow-50 hover:text-stone-700'

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={onClose} />}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-yellow-100 z-30
        flex flex-col transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-[57px] border-b border-yellow-100">
          <div className="w-10 h-10 rounded-xl bg-white border-2 border-yellow-400 flex items-center justify-center p-0.5 flex-shrink-0">
            <img src={logoCirebon} alt="Logo" className="w-full h-full object-contain"
              onError={e => { e.target.style.display='none' }} />
          </div>
          <div>
            <div className="text-base font-extrabold text-yellow-800">SI EKSIS</div>
            <div className="text-xs text-stone-400">Dinsos Kab. Cirebon</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-wider px-3 mb-2">Menu</p>
          {navItems.map(item => (
            <button key={item.to}
              onClick={() => { navigate(item.to); onClose?.() }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left
                ${item.customActive ? activeClass : inactiveClass}
              `}>
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.badge > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Dark mode + user */}
        <div className="px-3 py-4 border-t border-yellow-100">
          <button onClick={toggle}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-stone-500 hover:bg-yellow-50 transition-colors mb-1">
            {dark
              ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
              : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
            }
            {dark ? 'Mode Terang' : 'Mode Gelap'}
          </button>

          <div className="flex items-center gap-3 px-3 py-2 mb-1 rounded-xl bg-yellow-50">
            <div className="w-9 h-9 rounded-full bg-yellow-200 flex items-center justify-center text-sm font-bold text-yellow-800 flex-shrink-0">
              {user?.nama_lengkap?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-stone-700 truncate">{user?.nama_lengkap}</p>
              <p className="text-xs text-stone-400">Sekretariat</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Keluar
          </button>
        </div>
      </aside>
    </>
  )
}