const { check } = require('express-validator')

exports.createCategoryValidator = [
    check('name').not().isEmpty().withMessage('Name is required'),
    check('image').not().isEmpty().withMessage('Image is required'),
    check('content').isLength({ min: 2}).withMessage('Content should be at least 20 characters long')
]

exports.updateCategoryValidator = [
    check('name').not().isEmpty().withMessage('Name is required'),
    check('content').isLength({ min: 20}).withMessage('Content is required')
]