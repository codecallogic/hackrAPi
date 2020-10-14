const express = require('express')
const router = express.Router()
const {createLinkValidator, updateLinkValidator} = require('../validators/link')
const {runValidation} = require('../validators')
const {requiresLogin, authMiddleware} = require('../controllers/auth')
const {create, list, read, update, remove} = require('../controllers/link')

// createLinkValidator, runValidation, requiresLogin, authMiddleware,
router.post('/link', create)
router.get('/links', list)
router.get('/link/:slug', read)
router.put('/link/:slug', updateLinkValidator, requiresLogin, authMiddleware, update)
router.delete('/link/:slug', requiresLogin, authMiddleware, remove)

module.exports  = router