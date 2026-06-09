/**
 * SI EKSIS - Entry Point Server
 * Sistem Informasi Ekspedisi Surat Internal
 * Dinas Sosial Kabupaten Cirebon
 */

require('dotenv').config()
const express    = require('express')
const cors       = require('cors')
const helmet     = require('helmet')
const path       = require('path')
const cookieParser = require('cookie-parser')

const authRoutes   = require('./routes/auth.routes')
const suratRoutes  = require('./routes/surat.routes')
const bidangRoutes = require('./routes/bidang.routes')
const pegawaiRoutes = require('./routes/pegawai.routes')
const statsRoutes  = require('./routes/stats.routes')

const app  = express()
const PORT = process.env.PORT || 5000

// ============================================
// SECURITY MIDDLEWARE
// ============================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // izinkan akses file PDF
}))

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))

// ============================================
// BODY & COOKIE PARSER
// ============================================
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// ============================================
// STATIC FILE - Serve PDF uploads
// ============================================
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// ============================================
// ROUTES
// ============================================
app.use('/api/auth',    authRoutes)
app.use('/api/surat',   suratRoutes)
app.use('/api/bidang',  bidangRoutes)
app.use('/api/pegawai', pegawaiRoutes)
app.use('/api/stats',   statsRoutes)

// Health check - untuk Railway/Render nanti
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'SI EKSIS', timestamp: new Date().toISOString() })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message)
  const status = err.status || 500
  res.status(status).json({
    success: false,
    message: status === 500 ? 'Terjadi kesalahan server' : err.message,
  })
})

app.listen(PORT, () => {
  console.log(`🚀 SI EKSIS Server berjalan di port ${PORT}`)
  console.log(`   Mode     : ${process.env.NODE_ENV || 'development'}`)
  console.log(`   Health   : http://localhost:${PORT}/api/health`)
})
