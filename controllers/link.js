const Link = require('../models/link')
const User = require('../models/user')
const Category = require('../models/category')
const AWS = require('aws-sdk')
const slugify = require('slugify')
const {linkPublishedParams} = require('../helpers/email')

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
})

const ses = new AWS.SES({ apiVersion: '2010-12-01'})

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

            // find all users in the category

            User.find({ categories: {$in: categories}}, (err, users) => {
                if(err){
                    throw new Error(err)
                    console.log('Error finding users to email')
                }

                Category.find({ _id: {$in: categories}}, (err, results) => {
                    data.categories = results

                    for( let i = 0; i < users.length; i++){
                        const params = linkPublishedParams(users[i].email, data)
                        const sendEmail = ses.sendEmail(params).promise()

                        sendEmail
                            .then(success => {
                                console.log('Email was sent', success)
                                return
                            })
                            .catch( error => {
                                console.log('Error submitting email', error)
                                return 
                            })
                    }
                })
            })
        })
    })
}

exports.list = (req, res) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 10
    let skip = req.body.skip ? parseInt(req.body.skip) : 0
    console.log(limit, skip)
    
    Link.find({})
        .populate('postedBy', 'name')
        .populate('categories', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec( (err, data) => {
            if(err){
                return res.status(400).json({
                    error: 'Could not list links'
                })
            }
            console.log(data.length)
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
    // console.log(req.params)
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

exports.popular = (req, res) => {
    Link.find({})
        .populate('postedBy', 'name')
        .sort({clicks: -1})
        .limit(3)
        .exec((err, links) => {
            if(err){
                return res.status(400).json({
                    error: 'Links not found'
                })
            }
            console.log(links)
            res.json(links)
        })
}

exports.popularInCategory = (req, res) => {
    const {slug} = req.params

    Category.findOne({slug}, (err, category) => {
        if(err){
            return res.status(400).json({
                error: 'Could not load categories'
            })
        }

        Link.find({categories: category})
        .populate('postedBy', 'name')
        .sort({clicks: -1})
        .limit(3)
        .exec((err, links) => {
            if(err){
                return res.status(400).json({
                    error: 'Links not found'
                })
            }
            // console.log(links)
            res.json(links)
        })
    })
}