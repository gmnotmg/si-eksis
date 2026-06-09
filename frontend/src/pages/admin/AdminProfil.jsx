import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import api from '../../utils/api'
import { getErrorMessage } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function AdminProfil() {
  const { user } = useAuth()
  const [form, setForm] = useState({ password_lama: '', password_baru: '', password_konfirmasi: '' })
  const [show, setShow] = useState({ lama: false, baru: false, konfirmasi: false })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password_baru !== form.password_konfirmasi)
      return toast.error('Konfirmasi password tidak cocok.')
    if (form.password_baru.length < 6)
      return toast.error('Password baru minimal 6 karakter.')
    setLoading(true)
    try {
      const r = await api.post('/auth/change-password', form)
      toast.success(r.data.message)
      setForm({ password_lama: '', password_baru: '', password_konfirmasi: '' })
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  function PasswordInput({ label, field, showKey }) {
    return (
      <div className="form-group">
        <label className="label">{label}</label>
        <div className="relative">
          <input type={show[showKey] ? 'text' : 'password'}
            value={form[field]}
            onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
            className="input pr-11" placeholder="••••••••" />
          <button type="button"
            onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors">
            {show[showKey]
              ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
              : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            }
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h2 className="page-title">Profil & Password</h2>
        <p className="page-sub">Informasi akun dan ganti password</p>
      </div>

      {/* Info Profil */}
      <div className="card p-6">
        <h3 className="text-sm font-bold text-stone-600 uppercase tracking-wider mb-4">Informasi Akun</h3>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center text-2xl font-bold text-yellow-700">
            {user?.nama_lengkap?.charAt(0)}
          </div>
          <div>
            <p className="text-lg font-bold text-stone-800">{user?.nama_lengkap}</p>
            <p className="text-sm text-stone-400">@{user?.username}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Role', value: user?.role === 'admin' ? 'Administrator Sekretariat' : 'Admin Bidang' },
            { label: 'Bidang', value: user?.bidang_nama || 'Sekretariat' },
          ].map(item => (
            <div key={item.label} className="bg-yellow-50 rounded-xl p-3 border border-yellow-100">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wide">{item.label}</p>
              <p className="text-sm font-semibold text-stone-700 mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ganti Password */}
      <div className="card p-6">
        <h3 className="text-sm font-bold text-stone-600 uppercase tracking-wider mb-4">Ganti Password</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordInput label="Password Lama" field="password_lama" showKey="lama" />
          <PasswordInput label="Password Baru" field="password_baru" showKey="baru" />
          <PasswordInput label="Konfirmasi Password Baru" field="password_konfirmasi" showKey="konfirmasi" />

          {/* Strength indicator */}
          {form.password_baru && (
            <div>
              <div className="flex gap-1 mb-1">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${
                    form.password_baru.length >= i * 3
                      ? i <= 1 ? 'bg-red-400' : i <= 2 ? 'bg-yellow-400' : i <= 3 ? 'bg-blue-400' : 'bg-green-400'
                      : 'bg-stone-200'
                  }`} />
                ))}
              </div>
              <p className="text-xs text-stone-400">
                {form.password_baru.length < 6 ? 'Terlalu pendek' : form.password_baru.length < 9 ? 'Cukup' : form.password_baru.length < 12 ? 'Kuat' : 'Sangat kuat'}
              </p>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading
              ? <><div className="w-4 h-4 border-2 border-yellow-800 border-t-transparent rounded-full animate-spin" />Menyimpan...</>
              : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Simpan Password Baru</>
            }
          </button>
        </form>
      </div>
    </div>
  )
}