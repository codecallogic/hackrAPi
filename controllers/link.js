const Link = require('../models/link')
const slugify = require('slugify')

exports.create = (req, res) => {
    const {title, url, categories, type, medium, user} = req.body
    const slug = url

    Link.findOne({title}, (err, duplicate) => {
        if(duplicate){
            return res.status(400).json({
                error: 'Cannot have duplicate titles for category'
            })
        }

        let link = new Link({title, url, categories, type, medium, slug})

        // posted by user
        link.postedBy = user._id

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

exports.clickCount = (req, res) => {
    console.log(req.body)
    const {linkId} = req.body
    Link.findByIdAndUpdate(linkId, {$inc: {clicks: 1}}, {upsert: true, new: true}, (err, results) => {
        if(err){
            return res.status(400).res.json({
                error: 'Could not update view count'
            })
        }
        res.json(results)
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