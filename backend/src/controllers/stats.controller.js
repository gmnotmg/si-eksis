const getDb = require('../db/database')

async function getDashboard(req, res) {
  const db       = getDb()
  const user     = req.user
  const isBidang = user.role === 'bidang'
  const { bulan, tahun } = req.query

  await db.execute(`UPDATE surat SET status='terlambat' WHERE status='belum_dibaca' AND julianday('now') - julianday(created_at) > 3`)

  // Tentukan filter waktu
  let timeFilter, timeArgs
  if (bulan) {
    timeFilter = "strftime('%Y-%m', s.created_at) = ?"
    timeArgs   = [bulan]
  } else if (tahun) {
    timeFilter = "strftime('%Y', s.created_at) = ?"
    timeArgs   = [String(tahun)]
  } else {
    const defaultBulan = new Date().toISOString().slice(0, 7)
    timeFilter = "strftime('%Y-%m', s.created_at) = ?"
    timeArgs   = [defaultBulan]
  }

  const bFilter = isBidang ? 'AND s.bidang_id = ?' : ''
  const bArgs   = (extra = []) => isBidang ? [...timeArgs, user.bidang_id, ...extra] : [...timeArgs, ...extra]
  const baseWhere = `WHERE ${timeFilter} ${bFilter}`

  const [total, sudahDibaca, belumDibaca, terlambat] = await Promise.all([
    db.execute({ sql: `SELECT COUNT(*) as n FROM surat s ${baseWhere}`, args: bArgs() }),
    db.execute({ sql: `SELECT COUNT(*) as n FROM surat s ${baseWhere} AND s.status='sudah_dibaca'`, args: bArgs() }),
    db.execute({ sql: `SELECT COUNT(*) as n FROM surat s ${baseWhere} AND s.status='belum_dibaca'`, args: bArgs() }),
    db.execute({ sql: `SELECT COUNT(*) as n FROM surat s ${baseWhere} AND s.status='terlambat'`, args: bArgs() }),
  ])

  let perBidang = []
  if (!isBidang) {
    const r = await db.execute({
      sql: `SELECT b.nama, b.singkatan,
              COUNT(s.id) as total,
              SUM(CASE WHEN s.status='sudah_dibaca' THEN 1 ELSE 0 END) as sudah_dibaca,
              SUM(CASE WHEN s.status!='sudah_dibaca' THEN 1 ELSE 0 END) as belum_dibaca
            FROM bidang b LEFT JOIN surat s ON s.bidang_id = b.id AND ${timeFilter}
            GROUP BY b.id ORDER BY b.id`,
      args: timeArgs,
    })
    perBidang = r.rows
  }

  const terbaru = await db.execute({
    sql: `SELECT s.*, b.singkatan as bidang_singkatan, b.nama as bidang_nama FROM surat s
          LEFT JOIN bidang b ON s.bidang_id = b.id
          ${isBidang ? 'WHERE s.bidang_id = ?' : ''}
          ORDER BY s.created_at DESC LIMIT 5`,
    args: isBidang ? [user.bidang_id] : [],
  })

  return res.json({
    success: true,
    data: {
      total:        Number(total.rows[0].n),
      sudah_dibaca: Number(sudahDibaca.rows[0].n),
      belum_dibaca: Number(belumDibaca.rows[0].n),
      terlambat:    Number(terlambat.rows[0].n),
      per_bidang:   perBidang,
      terbaru:      terbaru.rows,
    },
  })
}

async function getRekap(req, res) {
  const db       = getDb()
  const user     = req.user
  const isBidang = user.role === 'bidang'

  const { bulan, tahun } = req.query

  let where = [], args = []

  // Filter bulan (YYYY-MM) atau tahun saja
  if (bulan) {
    where.push("strftime('%Y-%m', s.created_at) = ?")
    args.push(bulan)
  } else if (tahun) {
    where.push("strftime('%Y', s.created_at) = ?")
    args.push(String(tahun))
  } else {
    // default bulan ini
    const defaultBulan = new Date().toISOString().slice(0, 7)
    where.push("strftime('%Y-%m', s.created_at) = ?")
    args.push(defaultBulan)
  }

  if (isBidang) {
    where.push('s.bidang_id = ?')
    args.push(user.bidang_id)
  }

  const wc = 'WHERE ' + where.join(' AND ')

  const rows = await db.execute({
    sql: `SELECT s.nomor_surat, s.tanggal_surat, s.perihal, s.asal_surat, s.status, s.created_at,
                 b.nama as bidang_nama, p.nama as dibaca_oleh, lb.dibuka_at as dibaca_at
          FROM surat s LEFT JOIN bidang b ON s.bidang_id = b.id
          LEFT JOIN log_baca lb ON lb.surat_id = s.id
          LEFT JOIN pegawai p ON lb.pegawai_id = p.id
          ${wc} ORDER BY s.created_at DESC`,
    args,
  })

  return res.json({ success: true, bulan: bulan || tahun, data: rows.rows })
}

async function getNotifCount(req, res) {
  const db     = getDb()
  const user   = req.user
  const isBidang = user.role === 'bidang'

  await db.execute(`UPDATE surat SET status='terlambat' WHERE status='belum_dibaca' AND julianday('now') - julianday(created_at) > 3`)

  const where = isBidang ? 'WHERE status != ? AND bidang_id = ?' : 'WHERE status != ?'
  const args  = isBidang ? ['sudah_dibaca', user.bidang_id] : ['sudah_dibaca']

  const r = await db.execute({ sql: `SELECT COUNT(*) as n FROM surat ${where}`, args })
  return res.json({ success: true, count: Number(r.rows[0].n) })
}

module.exports = { getDashboard, getRekap, getNotifCount }