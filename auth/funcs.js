require('dotenv').config()
 const jwt = require('jsonwebtoken');
 const bcrypt = require('bcrypt');
 const sqlite3 = require("sqlite3").verbose();
 const db = new sqlite3.Database("realestate.db");

 const secretKey = process.env.SECRET;

 const Auth = (req, res, next) => {
 const reqHeader = req.headers['authorization'];
 if (!reqHeader || typeof reqHeader == 'undefined') {
     res.status(401).send(ApiResponse(401,'Unauthorized!'));
     return;
 }
 req.token = reqHeader.split(" ")[1];
 jwt.verify(req.token, secretKey, (err, user) => {
     if (err) {
        res.status(401).send(ApiResponse(401,'Unauthorized!'));
        return;
     }
     req.user = user;
     next();
 })
 }

 const ApiResponse = (status,msg,data = []) => {
    return {
        status: status,
        message: msg,
        data: data
    }
}

 // Create new user
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

    let question_marks = Object.keys(user_object).map(()=>'?').join(",");
    let stmt = db.prepare(`INSERT INTO users VALUES(?,${question_marks})`);
    stmt.run(null,name,username,email,password,role,activate,created,updated);
}

// Register new user
 const registerUser = (req,res) =>{
    const query = "SELECT email FROM users WHERE email = ?";
    db.get(query, req.email, function(err, email) {
         if(email){
             res.status(400).send(ApiResponse(400,req.email + ' is already existed!'))
         }

         bcrypt.hash(req.password,10).then((hashedPass)=> {
            const newUser = {
                name:req.name,
                username:req.username,
                email: req.email,
                password: hashedPass
            }
            createNewUser(newUser);
            res.status(200).send(ApiResponse(200,req.email + ' is successfully registered!'))
        })
     })
 }

 // Login and Generate Token
 const generateToken = (req, res, next) =>{
     jwt.sign(req, secretKey, (err, token) => {
        const query = "SELECT * FROM users WHERE email = ?";
        db.get(query, req.email, function(err, user) {
             if(!user){
                 res.status(400).send(ApiResponse(400,req.email+' does not exist.'))
             } 

            bcrypt.compare(req.password, user.password).then((result) => {
                if (result) {
                    delete user.password;
                    res.status(200).send(ApiResponse(200,'Sucessfully logged in!',{token,user}));
                }else{
                    res.status(401).send(ApiResponse(401,'Unauthorized!'));
                }
            })
         })
         next();
     })
 }

 // Get User By Email
 const getUserByEmail = (email) =>{
    const query = "SELECT * FROM users WHERE email = ?";
    return new Promise((resolve,reject)=>{
        db.get(query, email, function(err, user) {
            if(err) reject(err);
            resolve(user);
        })
    })
 }

 module.exports = {
    ApiResponse,
    Auth,
    registerUser,
    generateToken,
    getUserByEmail
 }