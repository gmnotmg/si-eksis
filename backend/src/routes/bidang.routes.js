const express = require('express')
const { authenticate } = require('../middleware/auth.middleware')
const ctrl    = require('../controllers/bidang.controller')

const router = express.Router()
router.get('/',    authenticate, ctrl.getAll)
router.get('/:id', authenticate, ctrl.getOne)

module.exports = router
