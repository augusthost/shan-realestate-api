
// Libraries 
require('dotenv').config()
const express = require('express');
const app = express();
const cors = require("cors");
const db = require('better-sqlite3')('realestate.db', {});
const AuthRoutes = require('./auth/routes');


// JWT Middleware
const { Auth } = require('./auth/funcs');

// Project
const { ApiResponse } = require('./helpers/apiHelper');
const { validateProperty } = require('./helpers/apiValidator');
const { date } = require('joi');
app.use(express.json())
app.use(cors());

// Home
app.use(express.static('public'));

// Auth, JWT related routes
app.use('/', AuthRoutes);


// Property Helper functions
const isCurrentUserProperty = async (req) =>{
    const property = await getSingleProperty(req.body.id);
    if(!property) return false;
    return property.author == req.user.user_id;
}

// All Properties
app.get('/properties', (req, res) => {

    const { limit, only, sort } = req.query;

    // Validate Limit 
    if (limit && isNaN(limit)) {
        return res.status(400).send(ApiResponse(400, 'Sorry, please provide only "numbers" for limit parameter', []));
    };

    // Validate Order 
    if (sort && !['asc', 'desc'].includes(sort)) {
        return res.status(400).send(ApiResponse(400, 'Sorry, please provide only "asc" and "desc" for order parameter', []));
    }

    const order_query = sort ? ` ORDER BY id ${sort}` : '';
    const limit_query = limit ? ` LIMIT ${limit}` : '';
    const query = `SELECT * FROM properties${order_query}${limit_query}`;

    const rows =  db.prepare(query).all();

    if (only == undefined) {
        return res.status(200).send(ApiResponse(200, 'Successfully retrieved Properties', rows));
    }

    let onlyArray = only.split(",");

    data = rows.map(each => {
        for (key of Object.keys(each)) {
            if (!onlyArray.includes(key)) {
                delete each[key];
            }
        }
        return each;
    })

    data = data.filter(e => Object.keys(e).length !== 0);

    res.status(200).send(ApiResponse(200, 'Properties', data));

})

// Get Single property
const getSingleProperty = (id) =>{
    const query = `SELECT * FROM properties WHERE id = ${id}`;
    return new Promise((resolve,reject)=>{
       const data = db.prepare(query).get();
       resolve(data);
    })
}
app.get('/properties/:id', async (req, res) => {
    const property_id = req.params.id;
    let reg = new RegExp(`[0-9]`,'gm');
    if(!property_id || !reg.test(property_id)){
        res.status(400).send(ApiResponse(400,'Please provide a valid parameter'))
    }
  
    const property = await getSingleProperty(property_id);
    if(!property){
        res.status(404).send(ApiResponse(404,'No property Id found!'))
    }

    res.status(200).send(ApiResponse(200,"Successfully retrieved property id "+property_id,property));
})



// Update Property
const updateProperty = (id,obj) => {
    let allKeys = Object.keys(obj).filter(e=>e!=='id');
    let question_marks = allKeys.map((key)=>` ${key} = ?`).join(",");
    const values = allKeys.map(key=>obj[key]);
    const query = `UPDATE properties SET${question_marks} WHERE id = ?`;
    const stmt = db.prepare(query); 
    return stmt.run(values, id);
}
app.put('/properties', Auth, (req, res) => {

    let reg = new RegExp(`[0-9]`,'gm');
    if(!req.body.id || !reg.test(req.body.id)){
        res.status(400).send(ApiResponse(400,'Bad request, please provide a valid id'))
    }
    if(!isCurrentUserProperty(req)){
        res.status(400).send(ApiResponse(400,'Bad request, you are not allowed to update this property'));
    }

    const { error, value } = validateProperty(req.body,'update');
    if (error) {
        res.status(400).send(ApiResponse(400, error.details[0].message))
    };

   const appendObj = {
          updated:Date.now()
    }

   const property = Object.assign({},appendObj,req.body);
	
   try{
        const updatedProperty = updateProperty(req.body.id,property); 
        res.status(200).send(ApiResponse(200,'Successfully updated!',updatedProperty))
   }catch(err){
      throw new Error(err);
   }
  
})


// Add New Property
const addProperty = (obj) => {
    const {
        uuid,
        title,
        market_type,
        property_type,
        address,price,
        show_price,
        township,
        author,
        phone_number,
        show_phone,
        media,
        created,
        updated 
       } = obj;
    let question_marks = Object.keys(obj).map(()=>'?').join(",");
    let stmt = db.prepare(`INSERT INTO properties VALUES(?,${question_marks})`);
    stmt.run(
        null,
        uuid,
        title,
        market_type,
        property_type,
        address,
        price,
        show_price,
        township,
        author,
        phone_number,
        show_phone,
        media,
        created,
        updated);
}
app.post('/properties', Auth, (req, res) => {

    const { error, value } = validateProperty(req.body);
    if (error) {
        res.status(400).send(ApiResponse(400, error.details[0].message))
    };

   const appendObj = {
             uuid:Math.random().toString(36).substr(2, 9),
           author:req.user.email,
          created:Date.now(),
          updated:Date.now()
        }

   const property = Object.assign({},appendObj,req.body);
	
   try{
        addProperty(property); 
        res.status(200).send(ApiResponse(200,'Successfully added!',property))
   }catch(err){
      throw new Error(err);
   }
  
})


// Delete Property
const deleteProperty = (id)=>{
    const query = `DELETE FROM properties WHERE id = ?`;
    const stmt = db.prepare(query); 
    return stmt.run(id);
}
app.delete('/properties', Auth, (req, res) => {

    let reg = new RegExp(`[0-9]`,'gm');
    if(!req.body.id || !reg.test(req.body.id)){
        res.status(400).send(ApiResponse(400,'Bad request, please provide a valid id'))
    }

    if(!isCurrentUserProperty(req)){
        res.status(400).send(ApiResponse(400,'Bad request, you are not allowed to delete this property'));
    }

   try{
        const deletedObj = deleteProperty(req.body.id); 
        res.status(200).send(ApiResponse(200,'Successfully deleted!',deletedObj))
   }catch(err){
      throw new Error(err);
   }
  
})



// Listen App
app.listen(process.env.PORT, () => {
    console.log('Listen on http://localhost:' + process.env.PORT)
})
