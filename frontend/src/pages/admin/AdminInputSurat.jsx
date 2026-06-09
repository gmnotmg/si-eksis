import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../../utils/api'
import { getErrorMessage } from '../../utils/helpers'
import toast from 'react-hot-toast'

const MAX_MB   = 10
const MAX_SIZE = MAX_MB * 1024 * 1024

export default function AdminInputSurat() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const isEdit       = !!id
  const [bidang, setBidang]   = useState([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [existingPdf, setExistingPdf] = useState(null)
  const [file, setFile]       = useState(null)
  const [fileError, setFileError] = useState('')
  const [errors, setErrors]   = useState({})

  const [form, setForm] = useState({
    nomor_surat: '', tanggal_surat: '', perihal: '',
    asal_surat: '', bidang_id: '', catatan: '',
  })

  useEffect(() => {
    api.get('/bidang').then(r => setBidang(r.data.data))
    if (isEdit) {
      api.get(`/surat/${id}`)
        .then(r => {
          const s = r.data.data
          setForm({
            nomor_surat:   s.nomor_surat   || '',
            tanggal_surat: s.tanggal_surat?.slice(0, 10) || '',
            perihal:       s.perihal       || '',
            asal_surat:    s.asal_surat    || '',
            bidang_id:     String(s.bidang_id) || '',
            catatan:       s.catatan       || '',
          })
          setExistingPdf(s.file_pdf)
        })
        .catch(() => toast.error('Surat tidak ditemukan.'))
        .finally(() => setFetching(false))
    }
  }, [id])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  function handleFile(e) {
    const f = e.target.files[0]
    setFileError('')
    setFile(null)
    if (!f) return
    if (f.type !== 'application/pdf') {
      setFileError('Hanya file PDF yang diizinkan.')
      e.target.value = ''
      return
    }
    if (f.size > MAX_SIZE) {
      setFileError(`Ukuran file terlalu besar (${(f.size/1024/1024).toFixed(1)} MB). Maksimal ${MAX_MB} MB.`)
      e.target.value = ''
      return
    }
    setFile(f)
  }

  function validate() {
    const errs = {}
    if (!form.nomor_surat.trim()) errs.nomor_surat   = 'Nomor surat wajib diisi.'
    if (!form.tanggal_surat)      errs.tanggal_surat = 'Tanggal surat wajib diisi.'
    if (!form.perihal.trim())     errs.perihal        = 'Perihal surat wajib diisi.'
    if (!form.asal_surat.trim())  errs.asal_surat     = 'Asal surat wajib diisi.'
    if (!form.bidang_id)          errs.bidang_id      = 'Bidang tujuan wajib dipilih.'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      toast.error('Lengkapi semua field yang wajib diisi.')
      return
    }
    if (fileError) return

    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (file) fd.append('file_pdf', file)

      if (isEdit) {
        await api.put(`/surat/${id}`, fd)
        toast.success('Surat berhasil diperbarui.')
      } else {
        await api.post('/surat', fd)
        toast.success('Surat berhasil ditambahkan.')
      }
      navigate('/admin/surat')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  function FieldError({ name }) {
    return errors[name]
      ? <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 8v4m0 4h.01"/></svg>
          {errors[name]}
        </p>
      : null
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/admin/surat" className="p-2 rounded-xl hover:bg-yellow-100 text-stone-500 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        </Link>
        <div>
          <h2 className="page-title">{isEdit ? 'Edit Surat' : 'Input Surat Baru'}</h2>
          <p className="page-sub">{isEdit ? 'Perbarui data surat masuk' : 'Tambahkan surat masuk beserta disposisi'}</p>
        </div>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Nomor Surat <span className="text-red-400">*</span></label>
              <input name="nomor_surat" value={form.nomor_surat} onChange={handleChange}
                className={`input ${errors.nomor_surat ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                placeholder="Contoh: 400.5/128/Dinsos" />
              <FieldError name="nomor_surat" />
            </div>
            <div>
              <label className="label">Tanggal Surat <span className="text-red-400">*</span></label>
              <input type="date" name="tanggal_surat" value={form.tanggal_surat} onChange={handleChange}
                className={`input ${errors.tanggal_surat ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`} />
              <FieldError name="tanggal_surat" />
            </div>
          </div>

          <div>
            <label className="label">Perihal Surat <span className="text-red-400">*</span></label>
            <input name="perihal" value={form.perihal} onChange={handleChange}
              className={`input ${errors.perihal ? 'border-red-400' : ''}`}
              placeholder="Isi perihal surat" />
            <FieldError name="perihal" />
          </div>

          <div>
            <label className="label">Asal Surat <span className="text-red-400">*</span></label>
            <input name="asal_surat" value={form.asal_surat} onChange={handleChange}
              className={`input ${errors.asal_surat ? 'border-red-400' : ''}`}
              placeholder="Contoh: Kemensos RI" />
            <FieldError name="asal_surat" />
          </div>

          <div>
            <label className="label">Disposisi ke Bidang <span className="text-red-400">*</span></label>
            <select name="bidang_id" value={form.bidang_id} onChange={handleChange}
              className={`select ${errors.bidang_id ? 'border-red-400' : ''}`}>
              <option value="">— Pilih Bidang —</option>
              {bidang.map(b => <option key={b.id} value={b.id}>{b.nama}</option>)}
            </select>
            <FieldError name="bidang_id" />
          </div>

          <div>
            <label className="label">Catatan Disposisi</label>
            <textarea name="catatan" value={form.catatan} onChange={handleChange}
              className="textarea" rows={3}
              placeholder="Catatan tambahan dari Kepala Dinas (opsional)" />
          </div>

          <div>
            <label className="label">
              Upload PDF Surat
              <span className="ml-1 text-stone-400 normal-case font-normal">(maks. {MAX_MB} MB)</span>
            </label>

            {existingPdf && !file && (
              <div className="flex items-center gap-2 mb-2 p-2.5 rounded-xl bg-yellow-50 border border-yellow-200">
                <svg className="w-4 h-4 text-yellow-700 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                <span className="text-xs text-yellow-800 font-medium flex-1">PDF sudah tersimpan</span>
                <a href={`http://localhost:5000/uploads/${existingPdf}`} target="_blank" rel="noreferrer"
                  className="text-xs text-yellow-700 hover:underline font-semibold">Lihat</a>
              </div>
            )}

            <label htmlFor="file-input"
              className={`flex items-center gap-2 cursor-pointer input hover:bg-yellow-50 transition-colors
                ${fileError ? 'border-red-400' : ''} ${file ? 'border-green-400 bg-green-50' : ''}`}>
              <svg className="w-4 h-4 flex-shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
              <span className="text-sm truncate text-stone-500">
                {file ? `✓ ${file.name} (${(file.size/1024/1024).toFixed(1)} MB)` : 'Klik untuk pilih file PDF'}
              </span>
            </label>
            <input type="file" accept="application/pdf" onChange={handleFile} className="hidden" id="file-input" />

            {fileError && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 8v4m0 4h.01"/></svg>
                {fileError}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-yellow-100">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading
                ? <><div className="w-4 h-4 border-2 border-yellow-800 border-t-transparent rounded-full animate-spin" />Menyimpan...</>
                : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>{isEdit ? 'Perbarui Surat' : 'Simpan Surat'}</>
              }
            </button>
            <Link to="/admin/surat" className="btn-secondary">Batal</Link>
          </div>
        </form>
      </div>
    </div>
  )
}