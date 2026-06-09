import { useState, useEffect, useMemo } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import api from '../../utils/api'
import { getErrorMessage } from '../../utils/helpers'
import DataTable from '../../components/common/DataTable.jsx'
import ConfirmModal from '../../components/common/ConfirmModal.jsx'
import toast from 'react-hot-toast'

const helper = createColumnHelper()

export default function AdminPegawai() {
  const [searchQuery, setSearchQuery] = useState('')
  const [pegawai, setPegawai] = useState([])
  const [bidang, setBidang]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState({ nama: '', nip: '', jabatan: '', bidang_id: '' })
  const [saving, setSaving]   = useState(false)
  const [confirmDel, setConfirmDel] = useState(null)
  const [deleting, setDeleting]     = useState(false)
  const [bidangFilter, setBidangFilter] = useState('')

  async function fetchAll() {
    setLoading(true)
    try {
      const [p, b] = await Promise.all([api.get('/pegawai'), api.get('/bidang')])
      setPegawai(p.data.data); setBidang(b.data.data)
    } catch { toast.error('Gagal memuat data.') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  function openAdd() { setEditing(null); setForm({ nama:'', nip:'', jabatan:'', bidang_id:'' }); setModal(true) }
  function openEdit(p) { setEditing(p); setForm({ nama: p.nama, nip: p.nip||'', jabatan: p.jabatan||'', bidang_id: String(p.bidang_id) }); setModal(true) }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.nama.trim()) return toast.error('Nama pegawai wajib diisi.')
    if (!form.bidang_id)   return toast.error('Bidang wajib dipilih.')
    setSaving(true)
    try {
      if (editing) { await api.put(`/pegawai/${editing.id}`, form); toast.success('Pegawai berhasil diperbarui.') }
      else         { await api.post('/pegawai', form);              toast.success('Pegawai berhasil ditambahkan.') }
      setModal(false); fetchAll()
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await api.delete(`/pegawai/${confirmDel.id}`)
      toast.success('Pegawai berhasil dinonaktifkan.')
      setConfirmDel(null); fetchAll()
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setDeleting(false) }
  }

  const filteredData = useMemo(() => {
    let result = pegawai
    if (bidangFilter) result = result.filter(p => String(p.bidang_id) === bidangFilter)
    if (searchQuery)  result = result.filter(p =>
      p.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nip?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.jabatan?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    return result
  }, [pegawai, bidangFilter, searchQuery])

  const columns = useMemo(() => [
    helper.display({
      id: 'avatar',
      size: 48,
      header: '',
      cell: ({ row: { original: p } }) => (
        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-xs font-bold text-yellow-800">
          {p.nama?.charAt(0)}
        </div>
      ),
    }),
    helper.accessor('nama', {
      header: 'Nama Lengkap',
      cell: i => <p className="font-semibold text-stone-700">{i.getValue()}</p>,
    }),
    helper.accessor('nip', {
      header: 'NIP', size: 160,
      cell: i => <span className="text-stone-500 text-xs">{i.getValue() || '—'}</span>,
    }),
    helper.accessor('jabatan', {
      header: 'Jabatan',
      cell: i => <span className="text-stone-500 text-xs">{i.getValue() || '—'}</span>,
    }),
    helper.accessor('bidang_nama', {
      header: 'Bidang', size: 160,
      cell: i => <span className="badge-bidang">{i.getValue()?.split(' ').pop()}</span>,
    }),
    helper.display({
      id: 'aksi', size: 80,
      header: () => <span className="sr-only">Aksi</span>,
      cell: ({ row: { original: p } }) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(p)}
            className="p-1.5 rounded-lg text-stone-500 hover:bg-yellow-100 transition-colors" title="Edit">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          {p.has_log_baca ? (
            <span className="p-1.5 rounded-lg text-stone-300 cursor-not-allowed" title="Tidak bisa dihapus — pegawai sudah pernah membuka surat">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </span>
          ) : (
            <button onClick={() => setConfirmDel(p)}
              className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors" title="Nonaktifkan">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          )}
        </div>
      ),
    }),
  ], [])

  const extraFilters = (
    <div className="flex items-end gap-2 flex-wrap w-full">
      {/* Search manual */}
      <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
        <label className="text-[11px] text-stone-500">Cari</label>
        <div className="relative">
          <input
            placeholder="Cari nama, NIP, jabatan..."
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

      {/* Filter Bidang */}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-stone-500">Bidang</label>
        <select className="select text-sm py-2" value={bidangFilter} onChange={e => setBidangFilter(e.target.value)}>
          <option value="">Semua Bidang</option>
          {bidang.map(b => <option key={b.id} value={b.id}>{b.singkatan}</option>)}
        </select>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Data Pegawai</h2>
          <p className="page-sub">{pegawai.length} pegawai aktif</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          Tambah Pegawai
        </button>
      </div>

      <DataTable
        data={filteredData}
        columns={columns}
        loading={loading}
        showGlobalFilter={false}   // ← matikan search bawaan
        extraFilters={extraFilters}
        emptyText="Tidak ada pegawai."
      />

      {/* Modal tambah/edit */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="text-base font-bold text-stone-800 mb-4">{editing ? 'Edit Pegawai' : 'Tambah Pegawai'}</h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="form-group">
                <label className="label">Nama Lengkap *</label>
                <input className="input" value={form.nama} onChange={e => setForm(f=>({...f,nama:e.target.value}))} placeholder="Nama pegawai" />
              </div>
              <div className="form-group">
                <label className="label">NIP</label>
                <input className="input" value={form.nip} onChange={e => setForm(f=>({...f,nip:e.target.value}))} placeholder="Opsional" />
              </div>
              <div className="form-group">
                <label className="label">Jabatan</label>
                <input className="input" value={form.jabatan} onChange={e => setForm(f=>({...f,jabatan:e.target.value}))} placeholder="Opsional" />
              </div>
              <div className="form-group">
                <label className="label">Bidang *</label>
                <select className="select" value={form.bidang_id} onChange={e => setForm(f=>({...f,bidang_id:e.target.value}))}>
                  <option value="">— Pilih Bidang —</option>
                  {bidang.map(b => <option key={b.id} value={b.id}>{b.nama}</option>)}
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button type="button" onClick={() => setModal(false)} className="btn-secondary">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!confirmDel}
        title="Nonaktifkan Pegawai"
        message={`Yakin nonaktifkan pegawai "${confirmDel?.nama}"? Pegawai tidak akan muncul di daftar pilihan surat.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDel(null)}
        loading={deleting}
      />
    </div>
  )
}