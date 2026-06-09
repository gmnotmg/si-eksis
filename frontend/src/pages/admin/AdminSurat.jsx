import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createColumnHelper } from '@tanstack/react-table'
import api from '../../utils/api'
import { formatTanggal, formatTanggalWaktu, getStatusBadge, getErrorMessage } from '../../utils/helpers'
import DataTable from '../../components/common/DataTable.jsx'
import ConfirmModal from '../../components/common/ConfirmModal.jsx'
import toast from 'react-hot-toast'

const helper = createColumnHelper()
const TAHUN_OPTS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

export default function AdminSurat() {
  const navigate          = useNavigate()
  const [surat, setSurat] = useState([])
  const [bidang, setBidang] = useState([])
  const [loading, setLoading] = useState(true)
  const [bidangId, setBidangId] = useState('')
  const [tahun, setTahun]   = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [confirmDel, setConfirmDel] = useState(null)
  const [deleting, setDeleting]     = useState(false)

  useEffect(() => { api.get('/bidang').then(r => setBidang(r.data.data)) }, [])

  const fetchSurat = useCallback(async () => {
    setLoading(true)
    try {
      const params = { limit: 9999 }
      if (bidangId)     params.bidang_id = bidangId
      if (tahun)        params.tahun     = tahun
      if (statusFilter) params.status    = statusFilter
      const r = await api.get('/surat', { params })
      setSurat(r.data.data)
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setLoading(false) }
  }, [bidangId, tahun, statusFilter])

  useEffect(() => { fetchSurat() }, [fetchSurat])

  async function handleDelete() {
    setDeleting(true)
    try {
      await api.delete(`/surat/${confirmDel.id}`)
      toast.success('Surat berhasil dihapus.')
      setConfirmDel(null); fetchSurat()
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setDeleting(false) }
  }

  const columns = useMemo(() => [
    helper.accessor('nomor_surat', {
      header: 'No. Surat',
      size: 160,
      cell: i => <span className="font-bold text-yellow-700 text-xs">{i.getValue()}</span>,
    }),
    helper.accessor('perihal', {
      header: 'Perihal',
      cell: i => <p className="font-medium text-stone-700 truncate max-w-[200px]">{i.getValue()}</p>,
    }),
    helper.accessor('asal_surat', {
      header: 'Asal Surat',
      size: 140,
      cell: i => <span className="text-stone-500 text-xs">{i.getValue()}</span>,
    }),
    helper.accessor('tanggal_surat', {
      header: 'Tanggal',
      size: 100,
      cell: i => <span className="text-stone-500 text-xs whitespace-nowrap">{formatTanggal(i.getValue())}</span>,
    }),
    helper.accessor('bidang_singkatan', {
      header: 'Bidang',
      size: 90,
      cell: i => <span className="badge-bidang">{i.getValue()}</span>,
      enableGlobalFilter: false,
    }),
    helper.accessor('status', {
      header: 'Status',
      size: 130,
      cell: i => {
        const st = getStatusBadge(i.getValue())
        return <span className={`${st.cls} whitespace-nowrap`}><span className="w-1.5 h-1.5 rounded-full bg-current" />{st.label}</span>
      },
      enableGlobalFilter: false,
    }),
    helper.accessor('dibaca_oleh', {
      header: 'Dibaca Oleh',
      size: 160,
      cell: i => i.getValue()
        ? <div><p className="text-xs font-medium text-stone-600 truncate">{i.getValue()}</p><p className="text-xs text-stone-400">{formatTanggalWaktu(i.row.original.dibaca_at)}</p></div>
        : <span className="text-xs text-stone-400">—</span>,
      enableGlobalFilter: false,
    }),
    helper.display({
      id: 'aksi',
      header: () => <span className="sr-only">Aksi</span>,
      size: 110,
      cell: ({ row: { original: s } }) => (
        <div className="flex items-center gap-1">
          {s.file_pdf && (
            <a href={`http://localhost:5000/uploads/${s.file_pdf}`} target="_blank" rel="noreferrer"
              onClick={e => e.stopPropagation()}
              className="p-1.5 rounded-lg text-yellow-700 hover:bg-yellow-100 transition-colors" title="Lihat PDF">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </a>
          )}
          <button onClick={e => { e.stopPropagation(); navigate(`/admin/surat/cetak/${s.id}`) }}
            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" title="Cetak">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
          </button>
          <button onClick={e => { e.stopPropagation(); navigate(`/admin/surat/edit/${s.id}`) }}
            className="p-1.5 rounded-lg text-stone-500 hover:bg-yellow-100 transition-colors" title="Edit">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          {s.status !== 'sudah_dibaca' ? (
            <button onClick={e => { e.stopPropagation(); setConfirmDel(s) }}
              className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors" title="Hapus">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          ) : (
            <span className="w-[30px]" />
          )}
        </div>
      ),
    }),
  ], [navigate])

  const extraFilters = (
    <div className="grid grid-cols-12 gap-2">
      <div className="col-span-12 sm:col-span-4 flex flex-col gap-1">
        <label className="text-[11px] text-stone-500">Status</label>
        <select className="select text-sm py-2 w-full" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Semua Status</option>
          <option value="belum_dibaca">Belum Dibaca</option>
          <option value="sudah_dibaca">Sudah Dibaca</option>
          <option value="terlambat">Terlambat</option>
        </select>
      </div>
      <div className="col-span-12 sm:col-span-4 flex flex-col gap-1">
        <label className="text-[11px] text-stone-500">Bidang</label>
        <select className="select text-sm py-2 w-full" value={bidangId} onChange={e => setBidangId(e.target.value)}>
          <option value="">Semua Bidang</option>
          {bidang.map(b => <option key={b.id} value={b.id}>{b.singkatan}</option>)}
        </select>
      </div>
      <div className="col-span-12 sm:col-span-4 flex flex-col gap-1">
        <label className="text-[11px] text-stone-500">Tahun</label>
        <select className="select text-sm py-2 w-full" value={tahun} onChange={e => setTahun(e.target.value)}>
          <option value="">Semua Tahun</option>
          {TAHUN_OPTS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="page-title">Semua Surat</h2>
          <p className="page-sub">{surat.length} surat</p>
        </div>
        <Link to="/admin/surat/input" className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          Input Surat
        </Link>
      </div>

      <DataTable
        data={surat}
        columns={columns}
        loading={loading}
        globalFilterPlaceholder="Cari nomor surat, perihal, asal..."
        extraFilters={extraFilters}
        emptyText="Tidak ada surat ditemukan."
      />

      <ConfirmModal
        open={!!confirmDel}
        title="Hapus Surat"
        message={`Yakin hapus surat "${confirmDel?.perihal}"? File PDF juga ikut terhapus dan tidak bisa dikembalikan.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDel(null)}
        loading={deleting}
      />
    </div>
  )
}