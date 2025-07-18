const Joi = require('joi');

const updateUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  phoneNumber: Joi.string().pattern(/^0[0-9]{9}$/).optional(),
  location: Joi.object({
    city: Joi.string().required(),
    province: Joi.string().required(),
    address: Joi.string().optional()
  }).optional(),
  ecocashNumber: Joi.string().pattern(/^0[0-9]{9}$/).optional(),
  nationalId: Joi.string().optional(),
  profilePicture: Joi.string().optional()
});

module.exports = { updateUserSchema };