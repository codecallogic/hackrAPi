const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express()

// import routes 

const authRoutes = require('./routes/auth')

// app middlewares
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cors());

app.use('/api', authRoutes)

const port = process.env.PORT

app.listen(port, () => console.log(`Server is running on port ${port}`))