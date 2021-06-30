const Joi = require('joi');


// Validate Properties
 const validateProperty = (val) =>{
    const obj = { 
        title: 	Joi.string().required(),
        address: Joi.string().min(20).required(),
        price: Joi.string().required(),
        show_price: Joi.string().max(2).required(),
        phone_number: Joi.string().required()
    };
    const schema = Joi.object(obj);
    return schema.validate(val,{allowUnknown:true});
    
 }

 module.exports = {
    validateProperty
 }