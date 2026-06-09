import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { createColumnHelper } from '@tanstack/react-table'
import api from '../../utils/api'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useNotif } from '../../hooks/useNotif.js'
import { getStatusBadge, formatTanggal } from '../../utils/helpers'
import DataTable from '../../components/common/DataTable.jsx'

const helper = createColumnHelper()

export default function BidangDashboard() {
  const { user }        = useAuth()
  const { count }       = useNotif()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/stats/dashboard')
      .then(r => setData(r.data.data))
      .finally(() => setLoading(false))
  }, [])

  const columns = useMemo(() => [
    helper.accessor('nomor_surat', {
      header: 'No. Surat', size: 150,
      cell: i => <span className="font-bold text-yellow-700 text-xs">{i.getValue()}</span>,
    }),
    helper.accessor('perihal', {
      header: 'Perihal',
      cell: i => <p className="font-medium text-stone-700 truncate max-w-[200px]">{i.getValue()}</p>,
    }),
    helper.accessor('asal_surat', {
      header: 'Asal', size: 130,
      cell: i => <span className="text-stone-500 text-xs">{i.getValue()}</span>,
    }),
    helper.accessor('tanggal_surat', {
      header: 'Tanggal', size: 100,
      cell: i => <span className="text-stone-500 text-xs">{formatTanggal(i.getValue())}</span>,
    }),
    helper.accessor('status', {
      header: 'Status', size: 130,
      cell: i => {
        const st = getStatusBadge(i.getValue())
        return <span className={st.cls}><span className="w-1.5 h-1.5 rounded-full bg-current" />{st.label}</span>
      },
    }),
  ], [])

  const terbaru = useMemo(() => (data?.terbaru || []).slice(0, 10), [data])

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-5">
      <div>
        <h2 className="page-title">Selamat datang 👋</h2>
        <p className="page-sub">{user?.bidang_nama}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Surat',   value: data?.total,        color: 'bg-yellow-100 text-yellow-800' },
          { label: 'Sudah Dibaca', value: data?.sudah_dibaca,  color: 'bg-green-100 text-green-800' },
          { label: 'Belum Dibaca', value: (Number(data?.belum_dibaca || 0) + Number(data?.terlambat || 0)), color: 'bg-red-100 text-red-700' },
        ].map(c => (
          <div key={c.label} className={`card p-3 ${c.color}`}>
            <div className="text-2xl font-bold">{c.value ?? '-'}</div>
            <div className="text-xs font-semibold opacity-80 mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Alert belum dibaca */}
      {count > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-red-700">Ada {count} surat belum dibaca</p>
            <p className="text-xs text-red-500">Segera buka dan konfirmasi penerimaan surat.</p>
          </div>
          <Link to="/bidang/surat" className="btn-danger text-xs px-3 py-2 flex-shrink-0">Lihat →</Link>
        </div>
      )}

      {/* Terbaru - DataTable max 10 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-stone-700">10 Surat Terbaru</h3>
          <Link to="/bidang/surat" className="text-xs font-semibold text-yellow-700 hover:underline">Lihat semua →</Link>
        </div>
        <DataTable
          data={terbaru}
          columns={columns}
          loading={loading}
          showGlobalFilter={false}
          emptyText="Belum ada surat masuk."
        />
      </div>
    </div>
  )
}