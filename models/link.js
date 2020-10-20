const mongoose = require('mongoose')
const Schema = mongoose.Schema
const {ObjectId} = mongoose.Schema

const linkSchema = new Schema(
{
    title: {
        type: String,
        trim: true,
        required: true,
        max: 256,
        unique: true
    },
    url: {
        type: String,
        trim: true,
        required: true,
        max: 256,
        unique: true
    },
    slug: {
        type: String,
        lowercase: true,
        required: true,
    },
    postedBy: {
        type: ObjectId,
        ref: 'User'
    },
    categories: [{
        type: ObjectId, 
        ref: 'Category', 
        required: true
    }],
    type: {
        type: String,
        default: 'free',
    },
    medium: {
        type: String,
        default: 'video',
    },
    clicks: {
        type: Number,
        default: 0,
    }
},
{
    timestamps: true
})

module.exports = mongoose.model('Link', linkSchema)