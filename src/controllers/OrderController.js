// src/controllers/OrderController.js
import BaseController from './BaseController.js';
import OrderService from '../services/OrderService.js';
import { createOrderSchema } from '../dtos/CreateOrderDto.js';
import logger from '../config/logger.js';

class OrderController extends BaseController {
  constructor() {
    super(new OrderService());
  }

  createOrder = this.asyncWrapper(async (req, res) => {
    // Validate request body
    const { error } = createOrderSchema.validate(req.body);
    if (error) {
      return this.validationError(res, error.details);
    }

    try {
      const result = await this.service.createOrder(req.body, req.user.userId);
      return this.success(res, result, 'Order created successfully', 201);
    } catch (error) {
      logger.error('Order creation error:', error);
      return this.error(res, error.message, 400);
    }
  });

  getBuyerOrders = this.asyncWrapper(async (req, res) => {
    try {
      const orders = await this.service.getBuyerOrders(req.user.userId, req.query);
      return this.success(res, orders);
    } catch (error) {
      logger.error('Get buyer orders error:', error);
      return this.error(res, error.message);
    }
  });

  getSellerOrders = this.asyncWrapper(async (req, res) => {
    try {
      const orders = await this.service.getSellerOrders(req.user.userId, req.query);
      return this.success(res, orders);
    } catch (error) {
      logger.error('Get seller orders error:', error);
      return this.error(res, error.message);
    }
  });

  getOrderById = this.asyncWrapper(async (req, res) => {
    try {
      const order = await this.service.getOrderDetails(req.params.id, req.user.userId);
      if (!order) {
        return this.notFound(res, 'Order not found');
      }
      return this.success(res, order);
    } catch (error) {
      logger.error('Get order error:', error);
      return this.error(res, error.message);
    }
  });

  updateOrderStatus = this.asyncWrapper(async (req, res) => {
    const { status } = req.body;
    if (!status) {
      return this.validationError(res, [{ message: 'Status is required' }]);
    }

    try {
      const order = await this.service.updateOrderStatus(req.params.id, status, req.user.userId);
      return this.success(res, order, 'Order status updated successfully');
    } catch (error) {
      logger.error('Update order status error:', error);
      return this.error(res, error.message, 400);
    }
  });

  cancelOrder = this.asyncWrapper(async (req, res) => {
    try {
      await this.service.cancelOrder(req.params.id, req.user.userId);
      return this.success(res, null, 'Order cancelled successfully');
    } catch (error) {
      logger.error('Cancel order error:', error);
      return this.error(res, error.message, 400);
    }
  });
}

export default OrderController;
