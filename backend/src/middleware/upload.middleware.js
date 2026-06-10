const multer = require('multer')
const path   = require('path')
const fs     = require('fs')
const crypto = require('crypto')

const UPLOAD_PATH = path.resolve(process.env.UPLOAD_PATH || './uploads')

// Di Vercel filesystem read-only — skip mkdir
if (process.env.NODE_ENV !== 'production') {
  fs.mkdirSync(UPLOAD_PATH, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Di production pakai /tmp (writable di Vercel)
    const dest = process.env.NODE_ENV === 'production' ? '/tmp' : UPLOAD_PATH
    cb(null, dest)
  },
  filename: (req, file, cb) => {
    const random = crypto.randomBytes(16).toString('hex')
    const ext    = path.extname(file.originalname).toLowerCase()
    cb(null, `${Date.now()}-${random}${ext}`)
  },
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true)
  } else {
    cb(new Error('FORMAT_INVALID'), false)
  }
}

const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } })

function handleUpload(req, res, next) {
  upload.single('file_pdf')(req, res, (err) => {
    if (!err) return next()
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `Ukuran file terlalu besar. Maksimal ${MAX_SIZE / 1024 / 1024} MB.`,
      })
    }
    if (err.message === 'FORMAT_INVALID') {
      return res.status(400).json({
        success: false,
        message: 'Format file tidak valid. Hanya file PDF yang diizinkan.',
      })
    }
    return res.status(400).json({ success: false, message: err.message || 'Gagal mengupload file.' })
  })
}

module.exports = handleUpload