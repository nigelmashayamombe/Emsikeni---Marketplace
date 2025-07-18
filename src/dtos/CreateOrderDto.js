
import Joi from 'joi';

export const createOrderSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).default(1),
  deliveryMethod: Joi.string().valid('delivery', 'pickup').required(),
  paymentMethod: Joi.string().valid('cod', 'paynow', 'ecocash').required(),
  deliveryAddress: Joi.when('deliveryMethod', {
    is: 'delivery',
    then: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      province: Joi.string().required(),
      phoneNumber: Joi.string().pattern(/^0[0-9]{9}$/).required()
    }).required(),
    otherwise: Joi.optional()
  }),
  message: Joi.string().max(500).optional()
});


// Already exported above as named export