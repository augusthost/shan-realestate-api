require('dotenv').config()
 const jwt = require('jsonwebtoken');
 const Joi = require('joi');
 const bcrypt = require('bcrypt');
 const sqlite3 = require("sqlite3").verbose();
 const db = new sqlite3.Database("realestate.db");

 const secretKey = process.env.SECRET;

 const Auth = (req, res, next) => {
 const reqHeader = req.headers['authorization'];
 if (!reqHeader || typeof reqHeader == 'undefined') {
     res.status(401).send('No Authorized!');
     return;
 }
 req.token = reqHeader.split(" ")[1];
 jwt.verify(req.token, secretKey, (err, resData) => {
     if (err) {
         res.status(401).send(err);
         return;
     }
     next();
 })
 }
const createNewUser = (obj) =>{

    // id
    // name
    // username
    // email
    // password
    // role
    // activate
    // created
    // updated

    let user_object = {
        role:"user",
        activate:"1",
        created: Date.now(),
        updated: Date.now()
    }

    user_object = Object.assign({},user_object,obj);
    const {name,username,email,password,role,activate,created,updated} = user_object;

    let stmt = db.prepare("INSERT INTO users VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)");
    stmt.run(null,name,username,email,password,role,activate,created,updated);

}

 const registerUser = (req,res) =>{
    const query = "SELECT email FROM users WHERE email = ?";
    db.get(query, req.email, function(err, email) {
         if(email){
             res.status(400).send({
                 message: req.email + ' is already existed!'
             })
         }else{
             bcrypt.hash(req.password,10).then((hashedPass)=> {
                 const newUser = {
                     name:req.name,
                     username:req.username,
                     email: req.email,
                     password: hashedPass
                 }
                 createNewUser(newUser);
                 res.status(200).send({
                     message: req.email + ' is successfully registered!'
                 })
             })
         }
     })
 }

 // Login and Generate Token
 const generateToken = (req, res, next) =>{
     jwt.sign(req, secretKey, (err, token) => {
        const query = "SELECT * FROM users WHERE email = ?";
        db.get(query, req.email, function(err, user) {
             if(!user){
                 res.status(400).send({
                     message:req.email+' does not exist.'
                 })
                 return;
             } else {
                 bcrypt.compare(req.password, user.password).then((result) => {
                     if (result) {
                         delete user.password;
                         res.status(200).send({
                             token,
                             user
                         });
                     }else{
                         res.status(401).send({
                             message:'Wrong Password!'
                         });
                     }
                 })
             }
         })
         next();
     })
 }


 const getSingleUser = (req, res) => {
     db.users.find({
         "_id": ObjectId(req.params.id)
     }, (err, user) => {
         if (user.length == 0) {
             res.status(400).send('No ID exist!');
             return;
         }
         const reUser = {
             '_id': user[0]._id,
             'email': user[0].email,
             'createdAt': user[0].createdAt
         }
         res.status(200).send(reUser)
     })
 }

 // Input Validations 
 // validate user login
 const validateUser = (val, res) =>{
 const schema = {
     email: Joi.string().email({
         minDomainAtoms: 2
     }).required(),
     password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).min(6).required(),
 }
 const {error, value} = Joi.validate(val, schema, { stripUnknown: true });
 if (error) {
     res.status(400).send(error);
     return 'fail';
 }
 }

 module.exports = {
    Auth,
    registerUser,
    generateToken,
    getSingleUser,
    validateUser
 }