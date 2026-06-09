import { useState, useEffect, useMemo } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import * as XLSX from 'xlsx'
import api from '../../utils/api'
import { formatTanggal, formatTanggalWaktu, getStatusBadge } from '../../utils/helpers'
import DataTable from '../../components/common/DataTable.jsx'
import toast from 'react-hot-toast'

const helper   = createColumnHelper()
const now      = new Date()
const TAHUN_OPTS = Array.from({ length: 2 }, (_, i) => now.getFullYear() - i)
const BULAN_NAMA = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

export default function AdminRekap() {
  const [tahun, setTahun]   = useState(String(now.getFullYear()))
  const [bulan, setBulan]   = useState(String(now.getMonth() + 1))
  const [data, setData]     = useState([])
  const [loading, setLoading] = useState(false)

  async function fetchRekap() {
    setLoading(true)
    try {
      const params = {}
      if (bulan) {
        params.bulan = `${tahun}-${String(bulan).padStart(2, '0')}`
      } else {
        params.tahun = tahun
      }
      const r = await api.get('/stats/rekap', { params })
      setData(r.data.data)
    } catch { toast.error('Gagal memuat rekap.') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchRekap() }, [tahun, bulan])

  function exportExcel() {
    if (!data.length) return toast.error('Tidak ada data untuk diekspor.')
    const rows = data.map((s, i) => ({
      'No':           i + 1,
      'Nomor Surat':  s.nomor_surat,
      'Tanggal Surat': s.tanggal_surat,
      'Perihal':      s.perihal,
      'Asal Surat':   s.asal_surat,
      'Bidang':       s.bidang_nama,
      'Status':       s.status === 'sudah_dibaca' ? 'Sudah Dibaca' : s.status === 'terlambat' ? 'Terlambat' : 'Belum Dibaca',
      'Dibaca Oleh':  s.dibaca_oleh || '-',
      'Waktu Dibaca': s.dibaca_at ? formatTanggalWaktu(s.dibaca_at) : '-',
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap Surat')

    // Auto column width
    const colWidths = Object.keys(rows[0] || {}).map(k => ({
      wch: Math.max(k.length, ...rows.map(r => String(r[k] || '').length)) + 2
    }))
    ws['!cols'] = colWidths

    const label = bulan
      ? `${BULAN_NAMA[Number(bulan)-1]}_${tahun}`
      : `Semua_Bulan_${tahun}`
    XLSX.writeFile(wb, `Rekap_Surat_${label}.xlsx`)
    toast.success('Rekap berhasil diekspor ke Excel.')
  }

  const sudah  = data.filter(s => s.status === 'sudah_dibaca').length
  const belum  = data.filter(s => s.status === 'belum_dibaca').length
  const lambat = data.filter(s => s.status === 'terlambat').length

  const columns = useMemo(() => [
    helper.accessor('nomor_surat', {
      header: 'No. Surat', size: 160,
      cell: i => <span className="font-bold text-yellow-700 text-xs">{i.getValue()}</span>,
    }),
    helper.accessor('perihal', {
      header: 'Perihal',
      cell: i => <p className="font-medium text-stone-700 truncate max-w-[180px]">{i.getValue()}</p>,
    }),
    helper.accessor('asal_surat', {
      header: 'Asal Surat', size: 130,
      cell: i => <span className="text-stone-500 text-xs">{i.getValue()}</span>,
    }),
    helper.accessor('bidang_nama', {
      header: 'Bidang', size: 130,
      cell: i => <span className="badge-bidang text-xs">{i.getValue()?.split(' ').slice(-1)[0]}</span>,
    }),
    helper.accessor('tanggal_surat', {
      header: 'Tgl Surat', size: 100,
      cell: i => <span className="text-stone-500 text-xs whitespace-nowrap">{formatTanggal(i.getValue())}</span>,
    }),
    helper.accessor('status', {
      header: 'Status', size: 130,
      cell: i => {
        const st = getStatusBadge(i.getValue())
        return <span className={`${st.cls} whitespace-nowrap`}><span className="w-1.5 h-1.5 rounded-full bg-current" />{st.label}</span>
      },
    }),
    helper.accessor('dibaca_oleh', {
      header: 'Dibaca Oleh', size: 160,
      cell: i => i.getValue()
        ? <div><p className="text-xs font-medium text-stone-600">{i.getValue()}</p><p className="text-xs text-stone-400">{formatTanggalWaktu(i.row.original.dibaca_at)}</p></div>
        : <span className="text-xs text-stone-400">—</span>,
    }),
  ], [])

  const extraFilters = (
    <div className="grid grid-cols-12 gap-2">
      <div className="col-span-12 sm:col-span-6 flex flex-col gap-1">
        <label className="text-[11px] text-stone-500">Bulan</label>
        <select className="select text-sm py-2 w-full" value={bulan} onChange={e => setBulan(e.target.value)}>
          <option value="">Semua Bulan</option>
          {BULAN_NAMA.map((n, i) => <option key={i+1} value={i+1}>{n}</option>)}
        </select>
      </div>
      <div className="col-span-12 sm:col-span-6 flex flex-col gap-1">
        <label className="text-[11px] text-stone-500">Tahun</label>
        <select className="select text-sm py-2 w-full" value={tahun} onChange={e => setTahun(e.target.value)}>
          {TAHUN_OPTS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="page-title">Rekap & Export</h2>
          <p className="page-sub">Rekap surat masuk per bulan</p>
        </div>
        <button onClick={exportExcel} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Export Excel
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total',             value: data.length, color: 'bg-yellow-100 text-yellow-800' },
          { label: 'Sudah Dibaca',      value: sudah,       color: 'bg-green-100 text-green-800' },
          { label: 'Belum Dibaca',      value: belum,       color: 'bg-yellow-100 text-yellow-800' },
          { label: 'Terlambat',         value: lambat,      color: 'bg-red-100 text-red-700' },
        ].map(c => (
          <div key={c.label} className={`card p-3 ${c.color}`}>
            <div className="text-xl font-bold">{c.value}</div>
            <div className="text-xs font-semibold opacity-80 mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        globalFilterPlaceholder="Cari surat..."
        extraFilters={extraFilters}
        emptyText="Tidak ada data bulan ini."
      />
    </div>
  )
}