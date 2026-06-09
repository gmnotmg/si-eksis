const getDb = require('../db/database')

async function getAll(req, res) {
  const db   = getDb()
  const user = req.user
  const { bidang_id } = req.query
  const targetBidang  = user.role === 'bidang' ? user.bidang_id : (bidang_id ? Number(bidang_id) : null)

  let rows
  if (targetBidang) {
    rows = (await db.execute({
      sql: `SELECT p.*,
              CASE WHEN EXISTS (SELECT 1 FROM log_baca lb WHERE lb.pegawai_id = p.id) THEN 1 ELSE 0 END as has_log_baca
            FROM pegawai p
            WHERE p.bidang_id = ? AND p.is_active = 1
            ORDER BY p.nama`,
      args: [targetBidang]
    })).rows
  } else {
    rows = (await db.execute({
      sql: `SELECT p.*, b.nama as bidang_nama,
              CASE WHEN EXISTS (SELECT 1 FROM log_baca lb WHERE lb.pegawai_id = p.id) THEN 1 ELSE 0 END as has_log_baca
            FROM pegawai p
            JOIN bidang b ON p.bidang_id = b.id
            WHERE p.is_active = 1
            ORDER BY b.id, p.nama`,
      args: []
    })).rows
  }

  return res.json({ success: true, data: rows })
}

async function create(req, res) {
  const db = getDb()
  const { nama, nip, jabatan, bidang_id } = req.body
  if (!nama || !bidang_id) return res.status(400).json({ success: false, message: 'Nama dan bidang wajib diisi.' })

  const r       = await db.execute({ sql: 'INSERT INTO pegawai (nama, nip, jabatan, bidang_id) VALUES (?, ?, ?, ?)', args: [nama.trim(), nip || null, jabatan || null, Number(bidang_id)] })
  const pegawai = (await db.execute({ sql: 'SELECT * FROM pegawai WHERE id = ?', args: [Number(r.lastInsertRowid)] })).rows[0]
  return res.status(201).json({ success: true, message: 'Pegawai berhasil ditambahkan.', data: pegawai })
}

async function update(req, res) {
  const db = getDb()
  const { id } = req.params
  const { nama, nip, jabatan, bidang_id, is_active } = req.body

  const r = await db.execute({ sql: 'SELECT * FROM pegawai WHERE id = ?', args: [Number(id)] })
  const p = r.rows[0]
  if (!p) return res.status(404).json({ success: false, message: 'Pegawai tidak ditemukan.' })

  await db.execute({
    sql: 'UPDATE pegawai SET nama=?, nip=?, jabatan=?, bidang_id=?, is_active=? WHERE id=?',
    args: [nama || p.nama, nip !== undefined ? nip : p.nip, jabatan !== undefined ? jabatan : p.jabatan, bidang_id || p.bidang_id, is_active !== undefined ? is_active : p.is_active, Number(id)],
  })

  return res.json({ success: true, message: 'Pegawai berhasil diperbarui.' })
}

async function remove(req, res) {
  const db = getDb()
  await db.execute({ sql: 'UPDATE pegawai SET is_active = 0 WHERE id = ?', args: [Number(req.params.id)] })
  return res.json({ success: true, message: 'Pegawai berhasil dinonaktifkan.' })
}

module.exports = { getAll, create, update, remove }
