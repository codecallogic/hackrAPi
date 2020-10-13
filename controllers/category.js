const Category = require('../models/category')
const slugify = require('slugify')
const formidable = require('formidable')
const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid')
const fs = require('fs')

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
    const {name, content, image} = req.body
    // image data
    const base64Data = new Buffer.from(image.replace(/^data:image\/w+;base64,/, ''), 'base64')
    console.log(image)
    console.log(base64Data)
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
    //
}

exports.update = (req, res) => {
    //
}

exports.remove = (req, res) => {
    //
}