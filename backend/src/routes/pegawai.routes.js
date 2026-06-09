const express = require('express')
const { authenticate, adminOnly } = require('../middleware/auth.middleware')
const ctrl    = require('../controllers/pegawai.controller')

const router = express.Router()
router.get('/',    authenticate,            ctrl.getAll)
router.post('/',   authenticate, adminOnly, ctrl.create)
router.put('/:id', authenticate, adminOnly, ctrl.update)
router.delete('/:id', authenticate, adminOnly, ctrl.remove)

module.exports = router
