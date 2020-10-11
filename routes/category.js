const express = require('express')
const router = express.Router()
const {createCategoryValidator, updateCategoryValidator} = require('../validators/category')
const {runValidation} = require('../validators')
const {requiresLogin, adminMiddleware} = require('../controllers/auth')
const {create, list, read, update, remove} = require('../controllers/category')


router.post('/category', requiresLogin, adminMiddleware, create)
router.get('/categories', list)
router.get('/category/:slug', read)
router.put('/category/:slug', updateCategoryValidator, requiresLogin, adminMiddleware, update)
router.delete('/category/:slug', requiresLogin, adminMiddleware, remove)

module.exports  = router