const express   = require('express')
const rateLimit = require('express-rate-limit')
const { login, logout, me, changePassword, resetPassword, getUsers } = require('../controllers/auth.controller')
const { authenticate, adminOnly } = require('../middleware/auth.middleware')

const router = express.Router()
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: { success: false, message: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.' },
  standardHeaders: true, legacyHeaders: false,
})

router.post('/login',           loginLimiter, login)
router.post('/logout',          authenticate, logout)
router.get('/me',               authenticate, me)
router.post('/change-password', authenticate, changePassword)
router.post('/reset-password',  authenticate, adminOnly, resetPassword)
router.get('/users',            authenticate, adminOnly, getUsers)

module.exports = router