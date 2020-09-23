const User = require('../models/user')
const AWS = require('aws-sdk')
const JWT = require('jsonwebtoken')
const { registerEmailParams } = require('../helpers/email')

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
})

const ses = new AWS.SES({ apiVersion: '2010-12-01'})

exports.register = (req, res) => {
    // console.log('REGISTER CONTROLLER', req.body)
    const {name, email, password} = req.body

    // Check if user exists

    User.findOne({email}).exec((err, user) => {
        if(user){ 
            return res.status(400).json({
                error: 'Email is taken'
            })
        }

        // Generate token with username, email and password

        const token = JWT.sign({ name, email, password}, process.env.JWT_ACCOUNT_ACTIVATION, {
            expiresIn: '10m'
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