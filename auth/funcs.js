require('dotenv').config()
 const jwt = require('jsonwebtoken');
 const bcrypt = require('bcrypt');
 const db = require('better-sqlite3')('realestate.db', {});


 const secretKey = process.env.SECRET;

 const Auth = (req, res, next) => {
 const reqHeader = req.headers['authorization'];
 if (!reqHeader || typeof reqHeader == 'undefined') {
     return res.status(401).send(ApiResponse(401,'Unauthorized!'));
 }
 req.token = reqHeader.split(" ")[1];
 jwt.verify(req.token, secretKey, (err, user) => {
     if (err) {
        return res.status(401).send(ApiResponse(401,'Unauthorized!'));
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
    const query = `SELECT email FROM users WHERE email = '${req.email}'`;
    const email = db.prepare(query).get();

    if(email){
        return res.status(400).send(ApiResponse(400,req.email + ' is already existed!'))
    }

    bcrypt.hash(req.password,10).then((hashedPass)=> {
       const newUser = {
           name:req.name,
           username:req.username,
           email: req.email,
           password: hashedPass
       }
       createNewUser(newUser);
       return res.status(200).send(ApiResponse(200,req.email + ' is successfully registered!'))
   })
 }

 // Login and Generate Token
 const getTheLastUserId = () =>{
    const query = `SELECT * FROM users ORDER BY id DESC LIMIT 1`;
    const obj = db.prepare(query).get();
    return obj.id;
 }

 const generateToken = async (req, res) =>{
     req.user_id = await getTheLastUserId();
     jwt.sign(req, secretKey, (err, token) => {
        const query = `SELECT * FROM users WHERE email = '${req.email}'`;
        const user = db.prepare(query).get();
        if(!user){
            return res.status(400).send(ApiResponse(400,req.email+' does not exist.'))
        } 

       bcrypt.compare(req.password, user.password).then((result) => {
           if (result) {
               delete user.password;
               return res.status(200).send(ApiResponse(200,'Sucessfully logged in!',{token,user}));
           }else{
               return res.status(401).send(ApiResponse(401,'Unauthorized!'));
           }
       })
     })
 }

 // Get User By id
 const getUserById = (id) =>{
    const query = `SELECT * FROM users WHERE id = '${id}'`;
    return new Promise((resolve,reject)=>{
        const user = db.prepare(query).get();
        delete user.password;
        resolve(user);
    })
 }

 module.exports = {
    ApiResponse,
    Auth,
    registerUser,
    generateToken,
    getUserById
 }