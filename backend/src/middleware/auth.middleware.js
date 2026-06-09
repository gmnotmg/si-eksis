/**
 * SI EKSIS - Auth Middleware
 * Verifikasi JWT dari cookie + cek role
 */

const jwt = require('jsonwebtoken')

// Verifikasi token dari HttpOnly cookie
function authenticate(req, res, next) {
  const token = req.cookies?.si_eksis_token

  if (!token) {
    return res.status(401).json({ success: false, message: 'Akses ditolak. Silakan login terlebih dahulu.' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Sesi telah berakhir. Silakan login kembali.' })
  }
}

// Hanya admin sekretariat
function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Hanya admin sekretariat yang dapat mengakses fitur ini.' })
  }
  next()
}

// Admin atau bidang yang relevan
function bidangAccess(req, res, next) {
  const { role, bidang_id } = req.user
  if (role === 'admin') return next()

  // Bidang hanya bisa akses surat miliknya sendiri
  const targetBidangId = parseInt(req.params.bidangId || req.query.bidang_id)
  if (targetBidangId && bidang_id !== targetBidangId) {
    return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke bidang ini.' })
  }
  next()
}

module.exports = { authenticate, adminOnly, bidangAccess }
