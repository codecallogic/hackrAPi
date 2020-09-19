const express = require('express');
const mongoose = require('mongoose');

const app = express()

// import routes 

const authRoutes = require('./routes/auth')

// middleware

app.use('/api', authRoutes)

const port = process.env.PORT || 3000

app.listen(port, () => console.log(`Server is running on port ${port}`))