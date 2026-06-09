import { useState, useEffect, useMemo } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import api from '../../utils/api'
import { getErrorMessage } from '../../utils/helpers'
import DataTable from '../../components/common/DataTable.jsx'
import toast from 'react-hot-toast'

const helper = createColumnHelper()

export default function AdminUsers() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(null)
  const [newPass, setNewPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  async function fetchUsers() {
    setLoading(true)
    try {
      const r = await api.get('/auth/users')
      setUsers(r.data.data)
    } catch { toast.error('Gagal memuat data user.') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [])

  async function handleReset(e) {
    e.preventDefault()
    if (!newPass || newPass.length < 6) return toast.error('Password minimal 6 karakter.')
    setSaving(true)
    try {
      await api.post('/auth/reset-password', { user_id: modal.id, password_baru: newPass })
      toast.success(`Password ${modal.nama_lengkap} berhasil direset.`)
      setModal(null); setNewPass('')
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setSaving(false) }
  }

  const filteredData = useMemo(() => {
    if (!searchQuery) return users
    return users.filter(u =>
      u.nama_lengkap?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [users, searchQuery])

  const columns = useMemo(() => [
    helper.display({
      id: 'avatar', size: 48, header: '',
      cell: ({ row: { original: u } }) => (
        <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center text-sm font-bold text-yellow-800">
          {u.nama_lengkap?.charAt(0)}
        </div>
      ),
    }),
    helper.accessor('nama_lengkap', {
      header: 'Nama',
      cell: i => (
        <div>
          <p className="font-semibold text-stone-700">{i.getValue()}</p>
          <p className="text-xs text-stone-400">@{i.row.original.username}</p>
        </div>
      ),
    }),
    helper.accessor('bidang_nama', {
      header: 'Bidang / Unit', size: 180,
      cell: i => <span className="text-sm text-stone-500">{i.getValue() || 'Sekretariat'}</span>,
    }),
    helper.accessor('role', {
      header: 'Role', size: 120,
      cell: i => {
        const isAdmin = i.getValue() === 'admin'
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${isAdmin ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
            {isAdmin ? 'Sekretariat' : 'Bidang'}
          </span>
        )
      },
    }),
    helper.display({
      id: 'aksi', size: 140, header: '',
      cell: ({ row: { original: u } }) => (
        <button onClick={() => { setModal(u); setNewPass(''); setShowPass(false) }}
          className="btn-secondary text-xs px-3 py-2 whitespace-nowrap">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
          Reset Password
        </button>
      ),
    }),
  ], [])

  const extraFilters = (
    <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
      <label className="text-[11px] text-stone-500">Cari</label>
      <div className="relative">
        <input
          placeholder="Cari nama, username..."
          className="input w-full pl-9 py-2 text-sm"
          onChange={e => setSearchQuery(e.target.value)}
          value={searchQuery}
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div>
        <h2 className="page-title">Manajemen User</h2>
        <p className="page-sub">Reset password akun bidang</p>
      </div>

      <DataTable
        data={filteredData}
        columns={columns}
        loading={loading}
        showGlobalFilter={false}
        extraFilters={extraFilters}
        emptyText="Tidak ada user."
      />

      {modal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="text-base font-bold text-stone-800 mb-1">Reset Password</h3>
            <p className="text-sm text-stone-400 mb-4">
              Reset password untuk <strong className="text-stone-700">{modal.nama_lengkap}</strong>
            </p>
            <form onSubmit={handleReset} className="space-y-4">
              <div className="form-group">
                <label className="label">Password Baru</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                    className="input pr-10" placeholder="Minimal 6 karakter" />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      {showPass
                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                        : <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></>
                      }
                    </svg>
                  </button>
                </div>
                {newPass && newPass.length < 6 && (
                  <p className="text-xs text-red-500 mt-1">Password minimal 6 karakter.</p>
                )}
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving ? 'Menyimpan...' : 'Reset Password'}
                </button>
                <button type="button" onClick={() => setModal(null)} className="btn-secondary">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}