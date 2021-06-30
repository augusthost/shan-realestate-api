
const express = require('express');
const app     = express();

const { ApiResponse, Auth, getUserByEmail, registerUser, generateToken } = require('./funcs');
const { validateLogin, validateRegister } = require('./validate');

// User Login
app.post('/api/login', (req, res) => {
    const {error,value} = validateLogin(req.body);
    if(error){
        res.status(400).send(ApiResponse(400,error.details[0].message))
    };
    generateToken(req.body, res);
})

// New user registration
app.post('/api/auth', (req, res) => {
    const {error,value} = validateRegister(req.body);
    if(error){
        res.status(400).send(ApiResponse(400,error.details[0].message))
    };
    registerUser(req.body, res);
})


// Get My Profile Data
app.get('/api/me',Auth, async (req,res)=>{
    try{
        const user = await getUserByEmail(req.user.email);
        delete user.password;
        res.status(200).send(ApiResponse(200,'Sucessfully retrieved'))
    }catch(err){
        throw new Error(err);
    }
});

module.exports = app;