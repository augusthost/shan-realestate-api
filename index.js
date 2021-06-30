
// Libraries 
require('dotenv').config()
const express = require('express');
const app     = express();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("realestate.db");
const AuthRoutes = require('./auth/routes');

// JWT Middleware
const {Auth} = require('./auth/funcs');

// Project
const { ApiResponse } = require('./helpers/apiHelper');
const { validateProperty } = require('./helpers/apiValidator');
app.use(express.json())

// Home
app.use(express.static('public'));

// Auth, JWT related routes
app.use('/',AuthRoutes);

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

// Add New Property
app.post('/properties', Auth, (req,res)=>{

    const {error,value} = validateProperty(req.body);
    if(error){
        res.status(400).send(ApiResponse(400,error.details[0].message))
    };
    
    res.status(200).send({message:'Success!'});

})

// Listen App
app.listen(process.env.PORT,()=>{
    console.log('Listen on http://localhost:'+process.env.PORT)
})