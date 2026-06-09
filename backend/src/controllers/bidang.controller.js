const getDb = require('../db/database')

async function getAll(req, res) {
  const db   = getDb()
  const rows = await db.execute('SELECT * FROM bidang ORDER BY id')
  return res.json({ success: true, data: rows.rows })
}

async function getOne(req, res) {
  const db = getDb()
  const r  = await db.execute({ sql: 'SELECT * FROM bidang WHERE id = ?', args: [Number(req.params.id)] })
  if (!r.rows[0]) return res.status(404).json({ success: false, message: 'Bidang tidak ditemukan.' })
  return res.json({ success: true, data: r.rows[0] })
}

module.exports = { getAll, getOne }
