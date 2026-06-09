import { useState, useEffect, useCallback, useMemo } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import api from '../../utils/api'
import { formatTanggal, formatTanggalWaktu, getStatusBadge, getErrorMessage } from '../../utils/helpers'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useNotif } from '../../hooks/useNotif.js'
import DataTable from '../../components/common/DataTable.jsx'
import toast from 'react-hot-toast'

const helper = createColumnHelper()
const now    = new Date()
const TAHUN_OPTS  = Array.from({ length: 2 }, (_, i) => now.getFullYear() - i)
const BULAN_NAMA  = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des']

export default function BidangSurat() {
  const { user }          = useAuth()
  const { refresh }       = useNotif()
  const [surat, setSurat] = useState([])
  const [loading, setLoading]   = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [bulanFilter, setBulanFilter]   = useState('')
  const [tahunFilter, setTahunFilter]   = useState('')
  const [modal, setModal]       = useState(null)
  const [pegawai, setPegawai]   = useState([])
  const [selectedPeg, setSelectedPeg] = useState('')
  const [submitting, setSubmitting]   = useState(false)

  const fetchSurat = useCallback(async () => {
    setLoading(true)
    try {
      const params = { limit: 9999 }
      if (statusFilter) params.status = statusFilter
      if (tahunFilter)  params.tahun  = tahunFilter
      const r = await api.get('/surat', { params })
      setSurat(r.data.data)
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setLoading(false) }
  }, [statusFilter, tahunFilter])

  useEffect(() => { fetchSurat() }, [fetchSurat])

  const filteredData = useMemo(() => {
    if (!bulanFilter) return surat
    return surat.filter(s => {
      const d = new Date(s.created_at)
      return String(d.getMonth() + 1) === bulanFilter
    })
  }, [surat, bulanFilter])

  async function openBukaSurat(s) {
    setModal(s); setSelectedPeg('')
    const r = await api.get('/pegawai', { params: { bidang_id: user.bidang_id } })
    setPegawai(r.data.data)
  }

  async function handleBuka() {
    if (!selectedPeg) return toast.error('Pilih pegawai yang membuka surat.')
    setSubmitting(true)
    try {
      const r = await api.post(`/surat/${modal.id}/buka`, { pegawai_id: selectedPeg })
      toast.success(r.data.message)
      setModal(null); fetchSurat(); refresh()
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setSubmitting(false) }
  }

  const columns = useMemo(() => [
    helper.accessor('nomor_surat', {
      header: 'No. Surat', size: 150,
      cell: i => (
        <div>
          <p className="font-bold text-yellow-700 text-xs">{i.getValue()}</p>
          <p className="text-xs text-stone-400 mt-0.5">{formatTanggal(i.row.original.tanggal_surat)}</p>
        </div>
      ),
    }),
    helper.accessor('perihal', {
      header: 'Perihal',
      cell: i => (
        <div>
          <p className="font-semibold text-stone-700 truncate max-w-[200px]">{i.getValue()}</p>
          <p className="text-xs text-stone-400 truncate">{i.row.original.asal_surat}</p>
          {i.row.original.catatan && (
            <p className="text-xs text-yellow-700 mt-0.5 italic truncate">📝 {i.row.original.catatan}</p>
          )}
        </div>
      ),
    }),
    helper.accessor('status', {
      header: 'Status', size: 130,
      cell: i => {
        const st  = getStatusBadge(i.getValue())
        const row = i.row.original
        return (
          <div className="space-y-1">
            <span className={st.cls}><span className="w-1.5 h-1.5 rounded-full bg-current" />{st.label}</span>
            {row.dibaca_oleh && (
              <p className="text-xs text-green-700 font-medium">{row.dibaca_oleh}</p>
            )}
          </div>
        )
      },
    }),
    helper.display({
      id: 'aksi', size: 110,
      header: () => <span className="sr-only">Aksi</span>,
      cell: ({ row: { original: s } }) => {
        const isUnread = s.status !== 'sudah_dibaca'
        return (
          <div className="flex flex-col gap-1.5">
            {isUnread ? (
              <button onClick={() => openBukaSurat(s)} className="btn-primary text-xs px-3 py-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                Buka Surat
              </button>
            ) : s.file_pdf ? (
              // PDF hanya bisa diakses setelah surat ditandai dibaca
              <a href={`http://localhost:5000/uploads/${s.file_pdf}`} target="_blank" rel="noreferrer"
                className="btn-secondary text-xs px-3 py-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                Lihat PDF
              </a>
            ) : (
              <span className="text-xs text-stone-400 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                Terbaca
              </span>
            )}
          </div>
        )
      },
    }),
  ], [])

  const unreadCount = surat.filter(s => s.status !== 'sudah_dibaca').length

  const extraFilters = (
    <div className="grid grid-cols-12 gap-2">

      {/* STATUS (4 col) */}
      <div className="col-span-12 sm:col-span-4 flex flex-col gap-1">
        <label className="text-[11px] text-stone-500">Status</label>
        <select
          className="select text-sm py-2 w-full"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">Semua Status</option>
          <option value="belum_dibaca">Belum Dibaca</option>
          <option value="sudah_dibaca">Sudah Dibaca</option>
          <option value="terlambat">Terlambat</option>
        </select>
      </div>

      {/* BULAN (4 col) */}
      <div className="col-span-12 sm:col-span-4 flex flex-col gap-1">
        <label className="text-[11px] text-stone-500">Bulan</label>
        <select
          className="select text-sm py-2 w-full"
          value={bulanFilter}
          onChange={e => setBulanFilter(e.target.value)}
        >
          <option value="">Semua Bulan</option>
          {BULAN_NAMA.map((n, i) => (
            <option key={i + 1} value={i + 1}>{n}</option>
          ))}
        </select>
      </div>

      {/* TAHUN (4 col) */}
      <div className="col-span-12 sm:col-span-4 flex flex-col gap-1">
        <label className="text-[11px] text-stone-500">Tahun</label>
        <select
          className="select text-sm py-2 w-full"
          value={tahunFilter}
          onChange={e => setTahunFilter(e.target.value)}
        >
          <option value="">Semua Tahun</option>
          {TAHUN_OPTS.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="page-title">Surat Masuk</h2>
          <p className="page-sub">{user?.bidang_nama}</p>
        </div>
        {unreadCount > 0 && (
          <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-xl px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold text-red-600">{unreadCount} belum dibaca</span>
          </div>
        )}
      </div>

      <DataTable
        data={filteredData}
        columns={columns}
        loading={loading}
        globalFilterPlaceholder="Cari nomor surat, perihal..."
        extraFilters={extraFilters}
        emptyText="Tidak ada surat masuk."
      />

      {/* Modal Buka Surat */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </div>
            <h3 className="text-base font-bold text-stone-800 mb-1">Konfirmasi Buka Surat</h3>
            <p className="text-xs text-stone-400 mb-4">Pilih pegawai yang bertanggung jawab. Setelah dikonfirmasi, PDF surat dapat diakses.</p>

            <div className="bg-yellow-50 rounded-xl p-3 mb-4 border border-yellow-100">
              <p className="text-xs font-bold text-yellow-700">{modal.nomor_surat}</p>
              <p className="text-sm font-semibold text-stone-700 mt-0.5">{modal.perihal}</p>
              <p className="text-xs text-stone-400">{modal.asal_surat}</p>
            </div>

            <div className="form-group mb-4">
              <label className="label">Pegawai yang Membuka *</label>
              <select className="select" value={selectedPeg} onChange={e => setSelectedPeg(e.target.value)}>
                <option value="">— Pilih Pegawai —</option>
                {pegawai.map(p => <option key={p.id} value={p.id}>{p.nama}{p.jabatan ? ` — ${p.jabatan}` : ''}</option>)}
              </select>
            </div>

            <div className="flex gap-2">
              <button onClick={handleBuka} disabled={submitting} className="btn-primary flex-1 justify-center">
                {submitting
                  ? <><div className="w-4 h-4 border-2 border-yellow-800 border-t-transparent rounded-full animate-spin" />Menyimpan...</>
                  : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Konfirmasi</>
                }
              </button>
              <button onClick={() => setModal(null)} className="btn-secondary">Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}