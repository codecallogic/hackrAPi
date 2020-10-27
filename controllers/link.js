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
    let limit = req.body.limit ? parseInt(req.body.limit) : 10
    let skip = req.body.skip ? parseInt(req.body.skip) : 0
    
    Link.find({})
        .populate('postedBy', 'name')
        .populate('categories', 'name, slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec( (err, data) => {
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
    const {id} = req.params
    Link.findOne({_id: id}, (err, data) => {
        if(err){
            return res.status(400).json({
                error: "Could not find link"
            })
        }
        res.json(data)
    })
}

exports.update = (req, res) => {
    const {id} = req.params
    const {title, url, categories, type, medium} = req.body

    Link.findOneAndUpdate({_id: id}, {title, url, categories, type, medium}, {new: true}, (err, updated) => {
        if(err){
            return res.status(400).json({
                error: "Could not update link"
            })
        }
        res.json({updated})
    })
}

exports.remove = (req, res) => {
    const {id} = req.params
    Link.findOneAndRemove({_id: id}, (err, data) => {
        if(err){
            return res.status(400).json({
                error: 'Error deleting link'
            })
        }
        res.json({
            message: 'Link removed successfully'
        })
    })
}