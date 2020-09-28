const express = require('express')
const router = express.Router()
const {requiresLogin, authMiddleware, adminMiddleware} = require('../controllers/auth')
const {read} = require('../controllers/user')

router.get('/user', requiresLogin, authMiddleware, read)
router.get('/admin', requiresLogin, adminMiddleware, read)

module.exports  = router