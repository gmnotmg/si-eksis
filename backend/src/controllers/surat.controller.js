const getDb = require('../db/database')
const fs    = require('fs')
const path  = require('path')

async function getAll(req, res) {
  const db   = getDb()
  const user = req.user
  const { status, bidang_id, search, tahun, page = 1, limit = 9999 } = req.query
  const offset = (parseInt(page) - 1) * parseInt(limit)

  let where = [], args = []

  if (user.role === 'bidang') { where.push('s.bidang_id = ?'); args.push(user.bidang_id) }
  else if (bidang_id)         { where.push('s.bidang_id = ?'); args.push(Number(bidang_id)) }
  if (status) { where.push('s.status = ?'); args.push(status) }
  if (tahun)  { where.push("strftime('%Y', s.created_at) = ?"); args.push(String(tahun)) }
  if (search) {
    where.push('(s.nomor_surat LIKE ? OR s.perihal LIKE ? OR s.asal_surat LIKE ?)')
    args.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }

  const wc = where.length ? 'WHERE ' + where.join(' AND ') : ''

  const countRes = await db.execute({ sql: `SELECT COUNT(*) as n FROM surat s ${wc}`, args })
  const total    = Number(countRes.rows[0].n)

  const lim = parseInt(limit)
  const rows = await db.execute({
    sql: `SELECT s.*, b.nama as bidang_nama, b.singkatan as bidang_singkatan,
            u.nama_lengkap as dibuat_oleh,
            lb.pegawai_id as dibaca_pegawai_id, p.nama as dibaca_oleh, lb.dibuka_at as dibaca_at
          FROM surat s
          LEFT JOIN bidang b ON s.bidang_id = b.id
          LEFT JOIN users u ON s.created_by = u.id
          LEFT JOIN log_baca lb ON lb.surat_id = s.id
          LEFT JOIN pegawai p ON lb.pegawai_id = p.id
          ${wc} ORDER BY s.created_at DESC
          ${lim < 9999 ? 'LIMIT ? OFFSET ?' : ''}`,
    args: lim < 9999 ? [...args, lim, offset] : args,
  })

  return res.json({
    success: true,
    data: rows.rows,
    pagination: { total, page: parseInt(page), limit: lim, totalPages: Math.ceil(total / lim) },
  })
}

async function getOne(req, res) {
  const db   = getDb()
  const user = req.user
  const r    = await db.execute({
    sql: `SELECT s.*, b.nama as bidang_nama, b.singkatan as bidang_singkatan, u.nama_lengkap as dibuat_oleh
          FROM surat s LEFT JOIN bidang b ON s.bidang_id = b.id LEFT JOIN users u ON s.created_by = u.id
          WHERE s.id = ?`,
    args: [Number(req.params.id)],
  })
  const surat = r.rows[0]
  if (!surat) return res.status(404).json({ success: false, message: 'Surat tidak ditemukan.' })
  if (user.role === 'bidang' && Number(surat.bidang_id) !== user.bidang_id)
    return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke surat ini.' })

  const logs = await db.execute({
    sql: `SELECT lb.*, p.nama as pegawai_nama, p.jabatan FROM log_baca lb
          JOIN pegawai p ON lb.pegawai_id = p.id WHERE lb.surat_id = ? ORDER BY lb.dibuka_at DESC`,
    args: [Number(req.params.id)],
  })
  return res.json({ success: true, data: { ...surat, log_baca: logs.rows } })
}

async function create(req, res) {
  const db   = getDb()
  const user = req.user
  const { nomor_surat, tanggal_surat, perihal, asal_surat, bidang_id, catatan } = req.body
  const file_pdf = req.file?.filename || null

  if (!nomor_surat || !tanggal_surat || !perihal || !asal_surat || !bidang_id) {
    if (req.file) fs.unlinkSync(req.file.path)
    return res.status(400).json({ success: false, message: 'Semua field wajib diisi.' })
  }

  const bidangCheck = await db.execute({ sql: 'SELECT id FROM bidang WHERE id = ?', args: [Number(bidang_id)] })
  if (!bidangCheck.rows[0]) {
    if (req.file) fs.unlinkSync(req.file.path)
    return res.status(400).json({ success: false, message: 'Bidang tidak valid.' })
  }

  const result = await db.execute({
    sql: `INSERT INTO surat (nomor_surat, tanggal_surat, perihal, asal_surat, bidang_id, file_pdf, catatan, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [nomor_surat.trim(), tanggal_surat, perihal.trim(), asal_surat.trim(), Number(bidang_id), file_pdf, catatan || null, user.id],
  })
  const newSurat = await db.execute({ sql: 'SELECT * FROM surat WHERE id = ?', args: [Number(result.lastInsertRowid)] })
  return res.status(201).json({ success: true, message: 'Surat berhasil ditambahkan.', data: newSurat.rows[0] })
}

async function update(req, res) {
  const db = getDb()
  const { id } = req.params
  const { nomor_surat, tanggal_surat, perihal, asal_surat, bidang_id, catatan } = req.body

  const r = await db.execute({ sql: 'SELECT * FROM surat WHERE id = ?', args: [Number(id)] })
  const surat = r.rows[0]
  if (!surat) {
    if (req.file) fs.unlinkSync(req.file.path)
    return res.status(404).json({ success: false, message: 'Surat tidak ditemukan.' })
  }

  let file_pdf = surat.file_pdf
  if (req.file) {
    if (surat.file_pdf) {
      const oldPath = path.join(process.env.UPLOAD_PATH || './uploads', surat.file_pdf)
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
    }
    file_pdf = req.file.filename
  }

  await db.execute({
    sql: `UPDATE surat SET nomor_surat=?, tanggal_surat=?, perihal=?, asal_surat=?,
          bidang_id=?, file_pdf=?, catatan=?, updated_at=datetime('now','localtime') WHERE id=?`,
    args: [
      nomor_surat?.trim()  || surat.nomor_surat,
      tanggal_surat        || surat.tanggal_surat,
      perihal?.trim()      || surat.perihal,
      asal_surat?.trim()   || surat.asal_surat,
      bidang_id            || surat.bidang_id,
      file_pdf,
      catatan !== undefined ? catatan : surat.catatan,
      Number(id),
    ],
  })
  return res.json({ success: true, message: 'Surat berhasil diperbarui.' })
}

async function remove(req, res) {
  const db = getDb()
  const r  = await db.execute({ sql: 'SELECT * FROM surat WHERE id = ?', args: [Number(req.params.id)] })
  const surat = r.rows[0]
  if (!surat) return res.status(404).json({ success: false, message: 'Surat tidak ditemukan.' })

  if (surat.file_pdf) {
    const filePath = path.join(process.env.UPLOAD_PATH || './uploads', surat.file_pdf)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  }
  await db.execute({ sql: 'DELETE FROM surat WHERE id = ?', args: [Number(req.params.id)] })
  return res.json({ success: true, message: 'Surat berhasil dihapus.' })
}

async function bukaSurat(req, res) {
  const db   = getDb()
  const user = req.user
  const { id } = req.params
  const { pegawai_id } = req.body

  if (!pegawai_id) return res.status(400).json({ success: false, message: 'Pilih pegawai yang membuka surat.' })

  const sr = await db.execute({ sql: 'SELECT * FROM surat WHERE id = ?', args: [Number(id)] })
  const surat = sr.rows[0]
  if (!surat) return res.status(404).json({ success: false, message: 'Surat tidak ditemukan.' })
  if (user.role === 'bidang' && Number(surat.bidang_id) !== user.bidang_id)
    return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke surat ini.' })

  const pr = await db.execute({
    sql: 'SELECT * FROM pegawai WHERE id = ? AND bidang_id = ? AND is_active = 1',
    args: [Number(pegawai_id), Number(surat.bidang_id)],
  })
  const pegawai = pr.rows[0]
  if (!pegawai) return res.status(400).json({ success: false, message: 'Pegawai tidak valid atau tidak sesuai bidang.' })

  await db.execute({ sql: 'INSERT INTO log_baca (surat_id, pegawai_id) VALUES (?, ?)', args: [Number(id), Number(pegawai_id)] })
  await db.execute({ sql: `UPDATE surat SET status='sudah_dibaca', updated_at=datetime('now','localtime') WHERE id=?`, args: [Number(id)] })

  return res.json({ success: true, message: `Surat berhasil dibuka oleh ${pegawai.nama}.`, data: { pegawai_nama: pegawai.nama, dibuka_at: new Date().toISOString() } })
}

module.exports = { getAll, getOne, create, update, remove, bukaSurat }