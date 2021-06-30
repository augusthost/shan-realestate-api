const Joi = require('joi');

// Validate Register
const validateRegister = (val) =>{
    const schema = Joi.object(
    { 
        name: Joi.string().required(),
        username: Joi.string().required(),
        email: Joi.string().required().email(),
        password: Joi.string().min(6).required() 
    }
   );
    return schema.validate(val);
 }

 // Validate Login
 const validateLogin = (val) =>{
    const schema = Joi.object(
    { 
        email: Joi.string().required().email(),
        password: Joi.string().min(6).required() 
    }
   );
    return schema.validate(val);
 }

module.exports = {
     validateLogin,
     validateRegister
}