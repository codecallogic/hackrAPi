const { check } = require('express-validator')

exports.createLinkValidator = [
    check('title').not().isEmpty().withMessage('Title is required'),
    check('url').not().isEmpty().withMessage('URL is required'),
    check('categories').not().isEmpty().withMessage('Pick a category'),
    check('type').not().isEmpty().withMessage('Select a type free/paid'),
    check('medium').not().isEmpty().withMessage('Select a medium/channel')
]

exports.updateLinkValidator = [
    check('title').not().isEmpty().withMessage('Title is required'),
    check('url').not().isEmpty().withMessage('URL is required'),
    check('categories').not().isEmpty().withMessage('Pick a category'),
    check('type').not().isEmpty().withMessage('Select a type free/paid'),
    check('medium').not().isEmpty().withMessage('Select a medium/channel')
]