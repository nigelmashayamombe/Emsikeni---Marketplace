
import Joi from 'joi';

export const createProductSchema = Joi.object({
  name: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(10).max(2000).required(),
  category: Joi.string().valid(
    'electronics', 'fashion', 'home', 'automotive', 'books', 
    'sports', 'beauty', 'agriculture', 'services', 'other'
  ).required(),
  price: Joi.number().min(0).required(),
  condition: Joi.string().valid('new', 'used', 'refurbished').required(),
  location: Joi.object({
    city: Joi.string().required(),
    province: Joi.string().required(),
    address: Joi.string().optional()
  }).required(),
  images: Joi.array().items(Joi.string()).min(1).max(5).required(),
  deliveryOptions: Joi.array().items(
    Joi.string().valid('delivery', 'pickup', 'both')
  ).required(),
  negotiable: Joi.boolean().default(false)
});


// Already exported above as named export