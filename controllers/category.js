const Category = require('../models/category')
const Link = require('../models/link')
const slugify = require('slugify')
const formidable = require('formidable')
const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid')
const fs = require('fs')
const { find } = require('lodash')

const S3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
})

// exports.create = (req, res) => {
//     let form = new formidable.IncomingForm()
//     form.parse(req, (err, fields, files) => {
//         console.table((err, fields, files))
//         if(err){
//             return res.status(400).json({
//                 error: 'Could not upload image'
//             })
//         }

//         const {name, content} = fields
//         const {image} = files

//         const slug = slugify(name)
//         let category = new Category({name, content, slug})
        
//         if( image.size > 200000){
//             return res.status(400).json({
//                 error: 'Image should be less than 2 MB'
//             })
//         }

//         const params = {
//             Bucket: 'codecallogiclab',
//             Key: `hackr/categories/${uuidv4()}`,
//             Body: fs.readFileSync(image.path),
//             // Access control level
//             ACL: 'public-read',
//             ContentType: 'image/jpg',
//         }

//         Category.findOne({name}, (err, category) => {
//             if(category){
//                 return res.status(400).json({
//                     error: 'Cannot have duplicate categories'
//                 })
//             }
//         })

//         S3.upload(params, (err, data) => {
//             if(err){
//                 console.log(err)
//                 return res.status(400).json({
//                     error: 'Upload to S3 failed'
//                 })
//             }
//             console.log('AWS UPLOAD DATA', data)
//             category.image.url = data.Location
//             category.image.key = data.key

//             category.save((err, success) => {
//                 if(err) {
//                     console.log(err)
//                     return res.status(400).json({ error: 'Cannot save category to database'})
//                 }
//                 return res.json({success: success})
//             })
//         })
//     })
// }

exports.create = (req, res) => {
    const {name, content, image, user} = req.body
    console.log(image)
    // console.log(base64Data)
    // image data
    const base64Data = new Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64')
    const type = image.split(';')[0].split('/')[1]

    const slug = slugify(name)
    let category = new Category({name, content, slug})

    const params = {
        Bucket: 'codecallogiclab',
        Key: `hackr/categories/${uuidv4()}.${type}`,
        Body: base64Data,
        // Access control level
        ACL: 'public-read',
        ContentEncoding: 'base64',
        ContentType: `image/${type}`,
    }

    Category.findOne({name}, (err, category) => {
        if(category){
            return res.status(400).json({
                error: 'Cannot have duplicate categories'
            })
        }
    })

    S3.upload(params, (err, data) => {
        if(err){
            console.log(err)
            return res.status(400).json({
                error: 'Upload to S3 failed'
            })
        }
        console.log('AWS UPLOAD DATA', data)
        category.image.url = data.Location
        category.image.key = data.key
        // posted by
        category.postedBy = user._id

        category.save((err, success) => {
            if(err) {
                console.log(err)
                return res.status(400).json({ error: 'Cannot save category to database'})
            }
            return res.json({success: success})
        })
    })
}

// exports.create = (req, res) => {
//     const {name, content} = req.body
//     const slug = slugify(name)
//     const image = {
//         url: `https://via.placeholder.com/350x150.png?text=${process.env.CLIENT_URL}`,
//         key: '123',
//     }

//     const category = new Category({name, slug, image})
//     category.postedBy = req.user._id

//     category.save((err, data) => {
//         if(err){
//             console.log(err)
//             return res.status(400).json({
//                 error: 'Categry create failed'
//             })
//         }
//         res.json(data)
//     })
// }

exports.list = (req, res) => {
    Category.find({}, (err, data) => {
        if(err){
            return res.status(400).json({
                error: 'Categories could not load'
            })
        }
        res.json(data)
    })
}

exports.read = (req, res) => {
    const {slug} = req.params
    let limit = req.body.limit ? parseInt(req.body.limit) : 10
    let skip = req.body.skip ? parseInt(req.body.skip) : 0

    Category.findOne({slug})
        .populate('postedBy', '_id name username')
        .exec( (err, category) => {
            if(err){
                return res.status(400).json({
                    error: 'Could not load category'
                })
            }

            Link.find({ categories: category})
                .populate('postedBy', '_id name username')
                .populate('categories', 'name')
                .sort({createdAt: -1})
                .limit(limit)
                .skip(skip)
                .exec( (err, links) => {
                    if(err){
                        return res.status(400).json({error: 'Could not load links of category'})
                    }
                    res.json({category, links})
                })

        })
}

exports.update = (req, res) => {
    const {slug} = req.params
    const {name, content, image} = req.body

    Category.findOneAndUpdate({slug}, {name, content}, {new: true}, (err, updated) => {
        if(err){
            return res.status(400).json({
                error: 'Could not update category'
            })
        }
        console.log(updated)
        if(image){
            // remove image from s3 before uploading a new one
            const deleteParams = {
                Bucket: 'codecallogiclab',
                Key: `hackr/categories/${updated.image.key}`,
            }

            S3.deleteObject(deleteParams, (err, data) => {
                if(err) console.log('ERROR DELETING', err)
                else console.log('DELETED IMAGE', data)
            })

            // handle upload image
            const params = {
                Bucket: 'codecallogiclab',
                Key: `hackr/categories/${uuidv4()}.${type}`,
                Body: base64Data,
                // Access control level
                ACL: 'public-read',
                ContentEncoding: 'base64',
                ContentType: `image/${type}`,
            }

            Category.findOne({name}, (err, category) => {
                if(category){
                    return res.status(400).json({
                        error: 'Cannot have duplicate categories'
                    })
                }
            })
        
            S3.upload(params, (err, data) => {
                if(err){
                    console.log(err)
                    return res.status(400).json({
                        error: 'Upload to S3 failed'
                    })
                }
                console.log('AWS UPLOAD DATA', data)
                updated.image.url = data.Location
                updated.image.key = data.key
                // posted by
                updated.postedBy = user._id
        
                updated.save((err, success) => {
                    if(err) {
                        console.log(err)
                        return res.status(400).json({ error: 'Cannot save category to database'})
                    }
                    return res.json({success: success})
                })
            })
        }else{
            res.json(updated)
        }
    })
}

exports.remove = (req, res) => {
    const {slug} = req.params
    Category.findOne({slug}, async (err, data) => {
        if(err) {
            console.log(err)
            return res.status(400).json({ error: `Couldn't delete category`})
        }
        const deleteParams = {
            Bucket: 'codecallogiclab',
            Key: `hackr/categories/${data.image.key}`,
        }

        console.log(data.image.key)

        try { 
            await S3.deleteObject(deleteParams, function(err, data){
                if(err) console.log('ERROR DELETING', err)
                else console.log('DELETED IMAGE', data)
                }) 
                res.json({
                    message: 'Category was deleted'
                })
        } catch (e) {
            console.log(e)
        }
    })
}