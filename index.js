
// Libraries 
require('dotenv').config()
const express = require('express');
const app     = express();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("realestate.db");

// Project
const { ApiResponse } = require('./services/apiService');
const {
    Auth,
    registerUser,
    generateToken,
    getSingleUser,
    validateUser
 } = require('./auth');

app.use(express.json())

// Home
app.use(express.static('public'))

// All Properties
app.get('/properties',(req,res)=>{

    const {limit,only,order} = req.query;

    // Validate Limit 
    if(limit && isNaN(limit)){
        return res.status(400).send(ApiResponse(400,'Sorry, please type only numbers for limit=',[]));
    };

    // Validate Order 
    if(order && !['asc','desc'].includes(order)){
        return res.status(400).send(ApiResponse(400,'Sorry, please type only asc and desc for order=',[]));
    }

    const order_query = order?` ORDER BY id ${order}`:'';
    const limit_query = limit?` LIMIT ${limit}`:'';
    db.serialize(() => {
        const query = `SELECT * FROM properties${order_query}${limit_query}`;
            db.all(query, function(err, rows) {
            if (err) throw err;

            if(only == undefined){
                return res.status(200).send(ApiResponse(200,'Properties',rows));
            }

            let onlyArray = only.split(",");

            let data = rows.map(each=>{
                for(key of Object.keys(each)){
                    if(!onlyArray.includes(key)){
                        delete each[key];
                    }
                }
                return each;
            })

            data = data.filter(e=>Object.keys(e).length !== 0);

            res.status(200).send(ApiResponse(200,'Properties',data));

        });
    });    

})


// Read Single User
app.get('/api/users/:id', Auth, (req, res) => {
    getSingleUser(req, res);
})

// User Login
app.post('/api/login', (req, res) => {
// let check = validateUser(req.body, res);
//     if (check === 'fail') {
//     return
//     }
    generateToken(req.body, res);
})

// New user registration
app.post('/api/auth', (req, res) => {
// let check = validateUser(req.body, res);
//     if (check === 'fail') {
//     return
//     }
    registerUser(req.body, res);
})

// Add New Property
app.post('/properties',(req,res)=>{

    const {name,price,property_type,show_price,market_type} = req.body;

    if(!name || !price  || !property_type  || !show_price  || !market_type){
        res.status(400).send(response(400,'Please fill all data'),[]);
    }
})

app.listen(process.env.PORT,()=>{
    console.log('Listen on http://localhost:'+process.env.PORT)
})