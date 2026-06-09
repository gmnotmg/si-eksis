import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import api from '../../utils/api'
import { formatTanggal, getStatusBadge } from '../../utils/helpers'

const COLORS = ['#22c55e', '#FACC15', '#ef4444']

function StatCard({ label, value, icon, bg, iconColor, sub }) {
  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div>
        <div className="text-2xl font-bold text-stone-800 tracking-tight">{value ?? '-'}</div>
        <div className="text-xs font-semibold text-stone-500 mt-0.5">{label}</div>
        {sub && <div className="text-xs text-stone-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) return (
    <div className="bg-white border border-yellow-100 rounded-xl shadow-lg px-3 py-2">
      <p className="text-xs font-bold text-stone-600">{payload[0].name}</p>
      <p className="text-sm font-bold text-stone-800">{payload[0].value} surat</p>
    </div>
  )
  return null
}

function getBulanList() {
  return [
    { val: '01', label: 'Januari' }, { val: '02', label: 'Februari' },
    { val: '03', label: 'Maret' },   { val: '04', label: 'April' },
    { val: '05', label: 'Mei' },     { val: '06', label: 'Juni' },
    { val: '07', label: 'Juli' },    { val: '08', label: 'Agustus' },
    { val: '09', label: 'September'},{ val: '10', label: 'Oktober' },
    { val: '11', label: 'November' },{ val: '12', label: 'Desember' },
  ]
}

function getTahunList() {
  const now = new Date().getFullYear()
  return [now, now - 1]
}

export default function AdminDashboard() {
  const now = new Date()
  const [selectedBulan, setSelectedBulan] = useState(String(now.getMonth() + 1).padStart(2, '0'))
  const [selectedTahun, setSelectedTahun] = useState(String(now.getFullYear()))
  const params = selectedBulan
    ? { bulan: `${selectedTahun}-${selectedBulan}` }
    : { tahun: selectedTahun }
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get('/stats/dashboard', { params })
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [selectedBulan, selectedTahun])

  const pieData = data ? [
    { name: 'Sudah Dibaca', value: Number(data.sudah_dibaca) },
    { name: 'Belum Dibaca', value: Number(data.belum_dibaca) },
    { name: 'Terlambat',    value: Number(data.terlambat) },
  ].filter(d => d.value > 0) : []

  const barData = data?.per_bidang?.map(b => ({
    name: b.singkatan,
    'Sudah': Number(b.sudah_dibaca),
    'Belum': Number(b.belum_dibaca),
  })) || []

  const selectedLabel = selectedBulan
  ? `${getBulanList().find(o => o.val === selectedBulan)?.label} ${selectedTahun}`
  : `Semua Bulan ${selectedTahun}`

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-sub">Rekap surat masuk</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Bulan */}
          <select
            className="select text-sm py-0 leading-none min-w-[150px]"
            value={selectedBulan}
            onChange={e => setSelectedBulan(e.target.value)}
          >
            <option value="">Semua Bulan</option>
            {getBulanList().map(o => (
              <option key={o.val} value={o.val}>{o.label}</option>
            ))}
          </select>

          {/* Filter Tahun */}
          <select
            className="select text-sm py-0 w-24 leading-none"
            value={selectedTahun}
            onChange={e => setSelectedTahun(e.target.value)}
          >
            {getTahunList().map(t => (
              <option key={t} value={String(t)}>{t}</option>
            ))}
          </select>

          {/* Tombol Input Surat — h-9 sama dengan select */}
          <Link to="/admin/surat/input" className="btn-primary h-9 px-4 flex items-center gap-1.5 whitespace-nowrap">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Input Surat
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total Surat" value={data?.total} sub={selectedLabel}
              bg="bg-yellow-100" iconColor="text-yellow-700"
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>}
            />
            <StatCard label="Sudah Dibaca" value={data?.sudah_dibaca}
              bg="bg-green-100" iconColor="text-green-700"
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
            />
            <StatCard label="Belum Dibaca" value={data?.belum_dibaca}
              bg="bg-yellow-100" iconColor="text-yellow-700"
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
            />
            <StatCard label="Terlambat" value={data?.terlambat} sub="> 3 hari"
              bg="bg-red-100" iconColor="text-red-600"
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>}
            />
          </div>

          {/* Charts */}
          {Number(data?.total) > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="card p-5">
                <h3 className="text-sm font-bold text-stone-700 mb-3">Status Surat</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={72}
                      paddingAngle={3} dataKey="value"
                      label={({ percent }) => `${(percent*100).toFixed(0)}%`} labelLine={false}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" iconSize={8}
                      formatter={v => <span className="text-xs font-semibold text-stone-600">{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="card p-5">
                <h3 className="text-sm font-bold text-stone-700 mb-3">Surat per Bidang</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={barData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#78716c' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#78716c' }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" iconSize={8}
                      formatter={v => <span className="text-xs font-semibold text-stone-600">{v}</span>} />
                    <Bar dataKey="Sudah" fill="#22c55e" radius={[4,4,0,0]} />
                    <Bar dataKey="Belum" fill="#FACC15" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Per bidang */}
          {data?.per_bidang?.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-5 py-3 border-b border-yellow-100">
                <h3 className="text-sm font-semibold text-stone-700">Distribusi per Bidang</h3>
              </div>
              <div className="divide-y divide-yellow-50">
                {data.per_bidang.map(b => {
                  const total = Number(b.total), sudah = Number(b.sudah_dibaca)
                  const pct = total > 0 ? Math.round((sudah/total)*100) : 0
                  return (
                    <div key={b.singkatan} className="flex items-center gap-4 px-5 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-stone-700 truncate">{b.nama}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-2 bg-yellow-100 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-stone-400 w-8 text-right">{pct}%</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-base font-bold text-stone-800">{total}</span>
                        <span className="text-xs text-stone-400 ml-1">surat</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Surat terbaru - max 5 */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-yellow-100">
              <h3 className="text-sm font-semibold text-stone-700">Surat Terbaru</h3>
              <Link to="/admin/surat" className="text-xs font-semibold text-yellow-700 hover:underline">Lihat semua →</Link>
            </div>
            {!data?.terbaru?.length
              ? <p className="text-sm text-stone-400 text-center py-8">Belum ada surat.</p>
              : <div className="divide-y divide-yellow-50">
                  {data.terbaru.slice(0,5).map(s => {
                    const st = getStatusBadge(s.status)
                    return (
                      <div key={s.id} className="flex items-start gap-3 px-5 py-3 hover:bg-yellow-50/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-yellow-700">{s.nomor_surat}</span>
                            <span className="badge-bidang">{s.bidang_singkatan}</span>
                          </div>
                          <p className="text-sm font-medium text-stone-700 mt-0.5 truncate">{s.perihal}</p>
                          <p className="text-xs text-stone-400">{s.asal_surat} · {formatTanggal(s.tanggal_surat)}</p>
                        </div>
                        <span className={`${st.cls} flex-shrink-0`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />{st.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
            }
          </div>
        </>
      )}
    </div>
  )
}