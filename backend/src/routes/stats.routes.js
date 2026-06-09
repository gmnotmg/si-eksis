const express = require('express')
const { authenticate } = require('../middleware/auth.middleware')
const { getDashboard, getRekap, getNotifCount } = require('../controllers/stats.controller')

const router = express.Router()
router.get('/dashboard', authenticate, getDashboard)
router.get('/rekap',     authenticate, getRekap)
router.get('/notif',     authenticate, getNotifCount)

module.exports = router