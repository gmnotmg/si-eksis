import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../utils/api'
import { formatTanggal, formatTanggalWaktu, getStatusBadge } from '../../utils/helpers'
import logoCirebon from '../../assets/Kabupaten_Cirebon.png'

export default function AdminCetakSurat() {
  const { id }          = useParams()
  const [surat, setSurat] = useState(null)
  const [loading, setLoading] = useState(true)
  const printRef        = useRef()

  useEffect(() => {
    api.get(`/surat/${id}`)
      .then(r => setSurat(r.data.data))
      .finally(() => setLoading(false))
  }, [id])

  function handlePrint() { window.print() }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!surat) return (
    <div className="text-center py-12 text-stone-400">Surat tidak ditemukan.</div>
  )

  const st = getStatusBadge(surat.status)

  return (
    <div className="max-w-3xl mx-auto">
      {/* Toolbar */}
      <div className="no-print flex items-center justify-between mb-5 gap-3">
        <div>
          <h2 className="page-title">Cetak Surat</h2>
          <p className="page-sub">{surat.nomor_surat}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/surat" className="btn-secondary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Kembali
          </Link>
          <button onClick={handlePrint} className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            Cetak / Print
          </button>
        </div>
      </div>

      {/* Area cetak */}
      <div ref={printRef} className="bg-white rounded-2xl border border-yellow-100 shadow-sm p-8 print:shadow-none print:border-none print:rounded-none">

        {/* Header instansi */}
        <div className="flex items-center gap-4 pb-5 mb-5 border-b-2 border-stone-800">
          <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
            <img src={logoCirebon} alt="Logo Kabupaten Cirebon" className="w-full h-full object-contain"
              onError={e => e.target.style.display='none'} />
          </div>
          <div className="flex-1 text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-stone-600">Pemerintah Kabupaten Cirebon</p>
            <h1 className="text-xl font-bold text-stone-900 mt-0.5">DINAS SOSIAL</h1>
            <p className="text-xs text-stone-500 mt-0.5">Jl. Sunan Drajat No. 5, Cirebon, Jawa Barat</p>
          </div>
          {/* spacer kanan agar teks tetap center */}
          <div className="w-20 flex-shrink-0" />
        </div>

        {/* Judul dokumen */}
        <div className="text-center mb-6">
          <h2 className="text-base font-bold uppercase tracking-widest text-stone-800">Lembar Ekspedisi Surat Masuk</h2>
          <div className="w-24 h-0.5 bg-stone-800 mx-auto mt-2" />
        </div>

        {/* Info surat */}
        <table className="w-full text-sm mb-6">
          <tbody>
            {[
              { label: 'Nomor Surat',    value: surat.nomor_surat },
              { label: 'Tanggal Surat',  value: formatTanggal(surat.tanggal_surat) },
              { label: 'Perihal',        value: surat.perihal },
              { label: 'Asal Surat',     value: surat.asal_surat },
              { label: 'Disposisi ke',   value: surat.bidang_nama },
              { label: 'Tanggal Terima', value: formatTanggalWaktu(surat.created_at) },
              { label: 'Diterima oleh',  value: surat.dibuat_oleh },
              { label: 'Status',         value: surat.status === 'sudah_dibaca' ? 'Sudah Dibaca' : surat.status === 'terlambat' ? 'Terlambat' : 'Belum Dibaca' },
            ].map(row => (
              <tr key={row.label} className="border-b border-stone-100">
                <td className="py-2.5 pr-4 font-semibold text-stone-600 w-40 align-top">{row.label}</td>
                <td className="py-2.5 pr-4 text-stone-400 w-4 align-top">:</td>
                <td className="py-2.5 text-stone-800 font-medium">{row.value || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Catatan disposisi */}
        {surat.catatan && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-xs font-bold text-yellow-700 uppercase tracking-wide mb-1">Catatan Disposisi</p>
            <p className="text-sm text-stone-700">{surat.catatan}</p>
          </div>
        )}

        {/* Log baca */}
        {surat.log_baca?.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">Riwayat Penerimaan</p>
            <table className="w-full text-sm border border-stone-200 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-stone-50">
                  <th className="text-left px-4 py-2.5 text-xs font-bold text-stone-500 uppercase">Pegawai</th>
                  <th className="text-left px-4 py-2.5 text-xs font-bold text-stone-500 uppercase">Jabatan</th>
                  <th className="text-left px-4 py-2.5 text-xs font-bold text-stone-500 uppercase">Waktu Dibuka</th>
                </tr>
              </thead>
              <tbody>
                {surat.log_baca.map((log, i) => (
                  <tr key={i} className="border-t border-stone-100">
                    <td className="px-4 py-2.5 font-semibold text-stone-700">{log.pegawai_nama}</td>
                    <td className="px-4 py-2.5 text-stone-500">{log.jabatan || '-'}</td>
                    <td className="px-4 py-2.5 text-stone-500">{formatTanggalWaktu(log.dibuka_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tanda tangan — sejajar dengan flex */}
        <div className="flex gap-8 mt-8">
          {/* Kiri - Penerima */}
          <div className="flex-1 text-center">
            <p className="text-sm text-stone-500 mb-1">&nbsp;</p>
            <p className="text-sm font-semibold text-stone-600 mb-16">Penerima Surat,</p>
            <div className="border-b border-stone-400 mb-1" />
            <p className="text-xs text-stone-400">Nama & Tanda Tangan</p>
          </div>

          {/* Kanan - Sekretariat */}
          <div className="flex-1 text-center">
            <p className="text-sm text-stone-500 mb-1">Cirebon, {formatTanggal(new Date().toISOString())}</p>
            <p className="text-sm font-semibold text-stone-600 mb-16">Petugas Sekretariat,</p>
            <div className="border-b border-stone-400 mb-1" />
            <p className="text-xs text-stone-400">{surat.dibuat_oleh}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-stone-100 text-center">
          <p className="text-xs text-stone-300">Dicetak melalui SI EKSIS — Sistem Informasi Ekspedisi Surat Internal · Dinas Sosial Kabupaten Cirebon</p>
          <p className="text-xs text-stone-300 mt-0.5">Dicetak pada {formatTanggalWaktu(new Date().toISOString())}</p>
        </div>
      </div>
    </div>
  )
}