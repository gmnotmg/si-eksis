const express  = require('express')
const { authenticate, adminOnly } = require('../middleware/auth.middleware')
const handleUpload = require('../middleware/upload.middleware')
const ctrl     = require('../controllers/surat.controller')

const router = express.Router()

router.get('/',              authenticate,            ctrl.getAll)
router.get('/:id',           authenticate,            ctrl.getOne)
router.post('/',             authenticate, adminOnly, handleUpload, ctrl.create)
router.put('/:id',           authenticate, adminOnly, handleUpload, ctrl.update)
router.delete('/:id',        authenticate, adminOnly, ctrl.remove)
router.post('/:id/buka',     authenticate,            ctrl.bukaSurat)

module.exports = router