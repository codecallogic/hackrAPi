const express = require('express')
const router = express.Router()
const {requiresLogin, authMiddleware, adminMiddleware} = require('../controllers/auth')
const {userUpdateValidator} = require('../validators/auth')
const {runValidation} = require('../validators')
const {read, update} = require('../controllers/user')

router.get('/user', requiresLogin, authMiddleware, read)
router.get('/admin', requiresLogin, adminMiddleware, read)
router.put('/user', userUpdateValidator, runValidation, requiresLogin, authMiddleware, update)

module.exports  = router