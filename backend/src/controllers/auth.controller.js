require('dotenv').config()
const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')
const getDb  = require('../db/database')

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge:   8 * 60 * 60 * 1000,
}

async function login(req, res) {
  const { username, password } = req.body
  if (!username || !password)
    return res.status(400).json({ success: false, message: 'Username dan password wajib diisi.' })

  const db     = getDb()
  const result = await db.execute({
    sql: `SELECT u.*, b.nama as bidang_nama, b.singkatan as bidang_singkatan
          FROM users u LEFT JOIN bidang b ON u.bidang_id = b.id
          WHERE u.username = ? AND u.is_active = 1`,
    args: [username.trim().toLowerCase()],
  })

  const user = result.rows[0]
  if (!user) return res.status(401).json({ success: false, message: 'Username atau password salah.' })

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return res.status(401).json({ success: false, message: 'Username atau password salah.' })

  const payload = {
    id: Number(user.id), username: user.username, nama_lengkap: user.nama_lengkap,
    role: user.role, bidang_id: user.bidang_id ? Number(user.bidang_id) : null,
    bidang_nama: user.bidang_nama, bidang_singkatan: user.bidang_singkatan,
  }

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' })
  res.cookie('si_eksis_token', token, COOKIE_OPTIONS)
  return res.json({ success: true, message: `Selamat datang, ${user.nama_lengkap}!`, user: payload })
}

function logout(req, res) {
  res.clearCookie('si_eksis_token', { ...COOKIE_OPTIONS, maxAge: 0 })
  return res.json({ success: true, message: 'Berhasil logout.' })
}

function me(req, res) {
  return res.json({ success: true, user: req.user })
}

async function changePassword(req, res) {
  const { password_lama, password_baru, password_konfirmasi } = req.body
  const userId = req.user.id

  if (!password_lama || !password_baru || !password_konfirmasi)
    return res.status(400).json({ success: false, message: 'Semua field wajib diisi.' })
  if (password_baru.length < 6)
    return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter.' })
  if (password_baru !== password_konfirmasi)
    return res.status(400).json({ success: false, message: 'Konfirmasi password tidak cocok.' })

  const db  = getDb()
  const r   = await db.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [userId] })
  const user = r.rows[0]
  if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan.' })

  const valid = await bcrypt.compare(password_lama, user.password)
  if (!valid) return res.status(400).json({ success: false, message: 'Password lama tidak sesuai.' })

  const hashed = await bcrypt.hash(password_baru, 12)
  await db.execute({
    sql: `UPDATE users SET password = ?, updated_at = datetime('now','localtime') WHERE id = ?`,
    args: [hashed, userId],
  })

  return res.json({ success: true, message: 'Password berhasil diubah.' })
}

// Admin reset password user lain
async function resetPassword(req, res) {
  const { user_id, password_baru } = req.body
  if (!user_id || !password_baru)
    return res.status(400).json({ success: false, message: 'User ID dan password baru wajib diisi.' })
  if (password_baru.length < 6)
    return res.status(400).json({ success: false, message: 'Password minimal 6 karakter.' })

  const db     = getDb()
  const hashed = await bcrypt.hash(password_baru, 12)
  await db.execute({
    sql: `UPDATE users SET password = ?, updated_at = datetime('now','localtime') WHERE id = ?`,
    args: [hashed, Number(user_id)],
  })

  return res.json({ success: true, message: 'Password berhasil direset.' })
}

module.exports = { login, logout, me, changePassword, resetPassword }

async function getUsers(req, res) {
  const db   = getDb()
  const rows = await db.execute(`
    SELECT u.id, u.username, u.nama_lengkap, u.role, u.is_active,
           b.nama as bidang_nama, b.singkatan as bidang_singkatan
    FROM users u LEFT JOIN bidang b ON u.bidang_id = b.id
    ORDER BY u.role DESC, u.id
  `)
  return res.json({ success: true, data: rows.rows })
}

module.exports = { login, logout, me, changePassword, resetPassword, getUsers }