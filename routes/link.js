const express = require('express')
const router = express.Router()
const {createLinkValidator, updateLinkValidator} = require('../validators/link')
const {runValidation} = require('../validators')
const {requiresLogin, authMiddleware, adminMiddleware, canUpdateDeleteLink} = require('../controllers/auth')
const {create, list, read, update, remove, clickCount, popular, popularInCategory} = require('../controllers/link')

// createLinkValidator, runValidation, requiresLogin, authMiddleware,
router.post('/link', createLinkValidator, runValidation, requiresLogin, authMiddleware, create)
router.post('/links', requiresLogin, adminMiddleware, list)
router.get('/link/:id', read)
router.get('/links/trending', popular)
router.get('/links/trending/:slug', popularInCategory)
router.put('/click-count', clickCount)
router.put('/link/:id', updateLinkValidator, requiresLogin, authMiddleware, canUpdateDeleteLink, update)
router.put('/link/admin/:id', updateLinkValidator, requiresLogin, adminMiddleware, update)
router.delete('/link/:id', requiresLogin, authMiddleware, canUpdateDeleteLink, remove)
router.delete('/link/admin/:id', requiresLogin, adminMiddleware, remove)

module.exports  = router