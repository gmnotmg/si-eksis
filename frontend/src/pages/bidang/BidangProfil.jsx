import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import api from '../../utils/api'
import { getErrorMessage } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function BidangProfil() {
  const { user } = useAuth()
  const [form, setForm] = useState({ password_lama: '', password_baru: '', password_konfirmasi: '' })
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
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="page-title">Profil & Password</h2>
        <p className="page-sub">{user?.bidang_nama}</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-yellow-100 flex items-center justify-center text-xl font-bold text-yellow-700">
            {user?.nama_lengkap?.charAt(0)}
          </div>
          <div>
            <p className="text-base font-bold text-stone-800">{user?.nama_lengkap}</p>
            <p className="text-sm text-stone-400">@{user?.username} · {user?.bidang_singkatan}</p>
          </div>
        </div>

        <div className="border-t border-yellow-100 pt-5">
          <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-4">Ganti Password</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Password Lama', field: 'password_lama' },
              { label: 'Password Baru', field: 'password_baru' },
              { label: 'Konfirmasi Password Baru', field: 'password_konfirmasi' },
            ].map(item => (
              <div key={item.field} className="form-group">
                <label className="label">{item.label}</label>
                <input type="password" value={form[item.field]}
                  onChange={e => setForm(f => ({ ...f, [item.field]: e.target.value }))}
                  className="input" placeholder="••••••••" />
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}