const express = require('express')
const router = express.Router()
const {createLinkValidator, updateLinkValidator} = require('../validators/link')
const {runValidation} = require('../validators')
const {requiresLogin, authMiddleware} = require('../controllers/auth')
const {create, list, read, update, remove, clickCount} = require('../controllers/link')

// createLinkValidator, runValidation, requiresLogin, authMiddleware,
router.post('/link', create)
router.get('/links', list)
router.get('/link/:id', read)
router.put('/click-count', clickCount)
router.put('/link/:id', updateLinkValidator, requiresLogin, authMiddleware, update)
router.delete('/link/:id', requiresLogin, authMiddleware, remove)

module.exports  = router