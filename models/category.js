const mongoose = require('mongoose')
const Schema = mongoose.Schema
const {ObjectId} = mongoose.Schema

const Category = new Schema(
{
    name: {
        type: String,
        trim: true,
        max: 32,        
        required: true,
    },
    slug: {
        type: String,
        lowercase: true,
        unique: true,
        index: true,
    },
    image: {
        url: String,
        key: String,
    },
    content: {
        type: {},
        min: 20,
        max: 2000000,
    },
    postedBy: {
        type: ObjectId,
        ref: 'User'
    }
},
{
    timestamps: true
})

module.exports = mongoose.model('Category', Category)