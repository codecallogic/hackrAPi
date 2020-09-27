const express = require('express')
const router = express.Router()

// Import from validators

const {userRegisterValidator} = require('../validators/auth')
const {runValidation} = require('../validators')

// Import from controllers
const {register, registerActivate} = require('../controllers/auth')

router.post('/register', userRegisterValidator, runValidation, register)
router.post('/register/activate', registerActivate)

module.exports = router