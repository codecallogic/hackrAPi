const { check } = require('express-validator')

exports.createCategoryValidator = [
    check('name').not().isEmpty().withMessage('Name is required'),
    check('image').isEmpty().withMessage('Image is required'),
    check('content').isLength({ min: 20}).withMessage('Content is required')
]

exports.updateCategoryValidator = [
    check('name').not().isEmpty().withMessage('Name is required'),
    check('content').isLength({ min: 20}).withMessage('Content is required')
]