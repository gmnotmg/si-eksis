import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { getErrorMessage } from '../utils/helpers'
import toast from 'react-hot-toast'
import kabCirebon from '../assets/Kabupaten_Cirebon.png'
import dinasSosial from '../assets/Dinas_Sosial.png'

export default function LoginPage() {
  const { login }               = useAuth()
  const navigate                = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!username.trim() || !password) return toast.error('Username dan password wajib diisi.')
    setLoading(true)
    try {
      const res = await login(username.trim(), password)
      toast.success(res.message)
      navigate(res.user.role === 'admin' ? '/admin' : '/bidang', { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  function LogoBox({ src, alt, fallback }) {
    const [err, setErr] = useState(false)
    return (
      <div className="w-14 h-14 rounded-xl bg-white shadow flex items-center justify-center p-1 flex-shrink-0"
        style={{ border: '2.5px solid #ca8a04' }}>
        {!err
          ? <img src={src} alt={alt} className="w-full h-full object-contain" onError={() => setErr(true)} />
          : <span className="text-[10px] font-bold text-yellow-700 text-center leading-tight px-0.5">{fallback}</span>
        }
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #fef9c3 0%, #fde68a 40%, #fcd34d 75%, #fbbf24 100%)' }}>
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: '#fde047', transform: 'translate(-35%, -35%)' }} />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: '#f59e0b', transform: 'translate(35%, 35%)' }} />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-4 mb-5">
          <LogoBox src={kabCirebon} alt="Logo Kab. Cirebon" fallback="Kab. Cirebon" />
          <div className="flex flex-col items-center gap-1">
            <div className="w-px h-5 bg-yellow-600/30" />
            <div className="w-2 h-2 rounded-full bg-yellow-600/50" />
            <div className="w-px h-5 bg-yellow-600/30" />
          </div>
          <LogoBox src={dinasSosial} alt="Logo Dinas Sosial" fallback="Dinas Sosial" />
        </div>

        {/* Judul */}
        <div className="text-center mb-5">
          <h1 className="text-2xl font-extrabold text-yellow-900 tracking-tight">SI EKSIS</h1>
          <p className="text-sm font-semibold text-yellow-800/80 mt-1">Sistem Informasi Ekspedisi Surat Internal</p>
          <p className="text-xs text-yellow-700/60 mt-0.5">Dinas Sosial Kabupaten Cirebon</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-yellow-200/70 px-6 py-6">
          <h2 className="text-base font-bold text-stone-800 mb-0.5">Masuk ke Sistem</h2>
          <p className="text-xs text-stone-400 mb-4">Gunakan akun yang diberikan administrator.</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="label">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </span>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="Masukkan username" autoComplete="username"
                  className="input pl-9 py-2 text-sm" disabled={loading} />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                </span>
                <input type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" autoComplete="current-password"
                  className="input pl-9 pr-10 py-2 text-sm" disabled={loading} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors">
                  {showPass
                    ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                    : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  }
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-1">
              {loading
                ? <><div className="w-4 h-4 border-2 border-yellow-800 border-t-transparent rounded-full animate-spin" />Memproses...</>
                : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>Masuk ke Sistem</>
              }
            </button>
          </form>
        </div>

        <p className="text-center text-yellow-700/50 text-xs mt-4">
          © {new Date().getFullYear()} Dinas Sosial Kabupaten Cirebon
        </p>
      </div>
    </div>
  )
}