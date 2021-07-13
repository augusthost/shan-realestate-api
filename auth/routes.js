
const express = require('express');
const router  = express.Router();

const { ApiResponse, Auth, getUserById, registerUser, generateToken } = require('./funcs');
const { validateLogin, validateRegister } = require('./validate');

// User Login
router.post('/login', (req, res) => {
    const {error,value} = validateLogin(req.body);
    if(error){
        return res.status(400).send(ApiResponse(400,error.details[0].message))
    };
    generateToken(req.body, res);
})

// New user registration
router.post('/register', (req, res) => {
    const {error,value} = validateRegister(req.body);
    if(error){
        return res.status(400).send(ApiResponse(400,error.details[0].message));
    };
    return registerUser(req.body, res);
})

// Get My Profile Data
router.get('/me',Auth, async (req,res)=>{
    try{
        const user = await getUserById(req.user.user_id);
        return res.status(200).send(ApiResponse(200,'Sucessfully retrieved',user))
    }catch(err){
        throw new Error(err);
    }
});

module.exports = router;