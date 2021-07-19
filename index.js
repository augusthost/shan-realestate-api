
// Libraries 
require('dotenv').config()
const express = require('express');
const app = express();
const cors = require("cors");


const AuthRoutes     = require('./auth/routes');
const PropertyRoutes = require('./routes/propertyRoutes');


app.use(express.json())
app.use(cors());

// Home
app.use(express.static('public'));

// Auth, JWT related routes
app.use('/', AuthRoutes);


app.use('/', PropertyRoutes)


// Listen App
app.listen(process.env.PORT, () => {
    console.log('Listen on http://localhost:' + process.env.PORT)
})
