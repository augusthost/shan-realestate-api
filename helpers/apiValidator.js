const Joi = require('joi');


// Validate Properties
 const validateProperty = (val,perform = null) =>{
    let obj = { 
        title: Joi.string().required(),
        address: Joi.string().min(20).required(),
        price: Joi.string().required(),
        show_price: Joi.string().max(2).required(),
        phone_number: Joi.string().required()
    };

    if(perform === 'update'){
        obj = {
         title: Joi.string(),
         address: Joi.string().min(20),
         price: Joi.string(),
         show_price: Joi.string().max(2),
         phone_number: Joi.string()
        }
    }

    const schema = Joi.object(obj);
    return schema.validate(val,{allowUnknown:true});
 }

 module.exports = {
    validateProperty
 }