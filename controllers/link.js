const Link = require('../models/link')
const slugify = require('slugify')

exports.create = (req, res) => {
    // console.log(req)
    const {title, url, categories, type, medium} = req.body
    const slug = url
    let link = new Link({title, url, categories, type, medium, slug})

    // posted by user
    // link.postedBy = req.user._id
    // categories
    let arrayOfCategories = categories && categories.split(',')
    link.categories = arrayOfCategories

    // save link
    link.save((err, data) => {
        if(err){
            console.log(err)
            return res.status(400).json({
                error: 'Link already exists'
            })
        }
        res.json(data)
    })
}

exports.list = (req, res) => {
    Link.find({}, (err, data) => {
        if(err){
            return res.status(400).json({
                error: 'Could not list links'
            })
        }
        res.json(data)
    })
}

exports.read = (req, res) => {
    //
}

exports.update = (req, res) => {
    //
}

exports.remove = (req, res) => {
    //
}