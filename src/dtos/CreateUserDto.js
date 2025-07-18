const Joi = require('joi');

const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  phoneNumber: Joi.string().pattern(/^0[0-9]{9}$/).required(), // Zimbabwe phone format
  userType: Joi.string().valid('buyer', 'seller').required(),
  location: Joi.object({
    city: Joi.string().required(),
    province: Joi.string().required(),
    address: Joi.string().optional()
  }).required(),
  ecocashNumber: Joi.string().pattern(/^0[0-9]{9}$/).optional(),
  nationalId: Joi.string().optional()
});

module.exports = { createUserSchema };