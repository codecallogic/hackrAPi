const User = require('../models/user')
const AWS = require('aws-sdk')
const JWT = require('jsonwebtoken')
const shortId = require('shortid')
const { registerEmailParams, forgotPasswordEmailParams } = require('../helpers/email')
const expressJWT = require('express-jwt')
const _ = require('lodash')
const Link = require('../models/link')

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
})

const ses = new AWS.SES({ apiVersion: '2010-12-01'})

exports.register = (req, res) => {
    // console.log('REGISTER CONTROLLER', req.body)
    const {name, email, password, categories} = req.body

    // Check if user exists

    User.findOne({email}).exec((err, user) => {
        if(user){ 
            return res.status(400).json({
                error: 'Email is taken'
            })
        }

        // Generate token with username, email and password

        const token = JWT.sign({ name, email, password, categories}, process.env.JWT_ACCOUNT_ACTIVATION, {
            expiresIn: '10m',
        })

        // Send email

        const params = registerEmailParams(email, token)
    
        const sendEmailOnRegister = ses.sendEmail(params).promise()
    
        sendEmailOnRegister
        .then( data => {
            console.log('Email submitted on SES', data)
            res.json({
                success: `Email has been sent to ${email}. Follow the instructions to complete your registratioin`
            })
        })
        .catch( err => {
            console.log('SES email on register', err)
            res.json({
                error: `We could not verify your email please try again`
            })
        })
    })
}

exports.registerActivate = (req, res) => {
    const {token} = req.body
    JWT.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function(err, decoded){
        if(err){
            return res.status(401).json({
                error: 'Expired link. Try again'
            })
        }

        const {name, email, password, categories} = JWT.decode(token)
        const username = shortId.generate()
        User.findOne({email}).exec((err, user) => {
            if(user){
                return res.status(401).json({
                    error: 'Email is taken'
                })
            }

            // Create new user
            const newUser = new User({username, name, email, password, categories})
            newUser.save((err, result) => {
                if(err){
                    return res.status(401).json({
                        error: 'Error saving user in database, please try later!'
                    })
                }

                return res.json({
                    success: 'Registration successful. Please login!'
                })
            })
        })
    })
}

exports.login = (req, res) => {
    const {email, password} = req.body
    console.table({email, password})
    User.findOne({email}).exec( (err, user) => {
        if(err || !user){
            console.log(err)
            return res.status(400).json({
                error: 'User with that email does not exist. Please register'
            })
        }

        if(!user.authenticate(password)){
            return res.status(400).json({
                error: 'Email and password do not match'
            })
        }

        // generate token and send to client

        const token = JWT.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: '1h', algorithm: 'HS256'},)
        const {_id, name, email, role} = user
        
        return res.json({
            token, 
            user: {_id, name, email, role}}
        )
    })
}

exports.requiresLogin = expressJWT({ secret: process.env.JWT_SECRET, algorithms: ['HS256']})

exports.authMiddleware = (req, res, next) => {
    const authUserId = req.user._id
    User.findOne({_id: authUserId}, (err, user) => {
        if(err || !user){
            return res.status(400).json({
                error: 'User not found'
            })
        }
        // console.log(user)
        req.profile = user
        next()
    })
}

exports.adminMiddleware = (req, res, next) => {
    // console.log(req.user)
    const authUserId = req.user._id
    User.findOne({_id: authUserId}, (err, user) => {
        if(err || !user){
            return res.status(400).json({
                error: 'User not found'
            })
        }

        if(user.role !== 'admin'){
            return res.status(400).json({
                error: 'Admin resource. Access denied'
            })
        }

        req.profile = user
        next()
    })
}

exports.forgotPassword = (req, res) => {
    const {email} = req.body

    // Check if user exist with that email
    User.findOne({email}, (err, user) => {
        if(err || !user){
            return res.json({ error: 'User with that email does not exist'})
        }

        // Generate token and email to user
        const token = JWT.sign({name: user.name}, process.env.JWT_RESET_PASSWORD, {expiresIn: '10m'})

        // send email
        const params = forgotPasswordEmailParams(email, token)

        // Populate the db > user > resetPasswordLink
        return user.updateOne({resetPasswordLink: token}, (err, success) => {
            if(err){
                res.status(400).json({ message: 'Password reset failed please try later'})
            }

            const sendEmail = ses.sendEmail(params).promise()
            sendEmail
            .then(data => {
                console.log('SES reset password success', data)
                return res.json({
                    success: `Email has been sent to ${email}. Click on the link to reset your password`
                })
            })
            .catch(err => {
                console.log('SES reset password failed', err)
                return res.json({
                    error: `We could not verify your email please try again`
                })
            })
        })
    })
}

exports.resetPassword = (req, res) => {
    const {resetPasswordLink, newPassword} = req.body
    if(resetPasswordLink){

        // Check for expiration of token

        JWT.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, (err, success) => {
            if(err){
                return res.status(400).json({
                    error: "Expired link please try again"
                })
            }
        })
        
        User.findOne({resetPasswordLink}, (err, user) => {
            if(err || !user){
                return res.status(400).json({
                    error: 'Invalid token. Try again'
                })
            }

            const updateFields = {
                password: newPassword,
                resetPasswordLink: ''
            }

            user = _.extend(user, updateFields)

            user.save((err, results) => {
                if(err){
                    return res.status(400).json({
                        error: 'Password rest failed please try again'
                    })
                }

                res.json({
                    success: 'Your password has been reset. You can login with your new password'
                })
            })
        })
    }
}

exports.canUpdateDeleteLink = (req, res, next) => {
    const {id} = req.params
    Link.findOne({_id: id}, (err, data) => {
        if(err){
            return res.status(400).json({
                error: 'Could not find link'
            })
        }
        let authorizedUser = data.postedBy._id.toString() == req.user._id.toString()
        if(!authorizedUser){
            return res.status(400).json({
                error: 'You are not authorized'
            })
        }
        next()
    })
}