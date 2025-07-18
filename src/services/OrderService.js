// src/services/OrderService.js
const BaseService = require('./BaseService');
const OrderRepository = require('../repositories/OrderRepository');
const ProductRepository = require('../repositories/ProductRepository');
const UserRepository = require('../repositories/UserRepository');
const logger = require('../config/logger');

class OrderService extends BaseService {
  constructor() {
    super(new OrderRepository());
    this.productRepository = new ProductRepository();
    this.userRepository = new UserRepository();
  }

  async createOrder(orderData, buyerId) {
    // Verify buyer
    const buyer = await this.userRepository.findById(buyerId);
    if (!buyer) {
      throw new Error('Buyer not found');
    }

    if (!buyer.phoneVerified) {
      throw new Error('Phone number must be verified to place orders');
    }

    // Get product details
    const product = await this.productRepository.findById(orderData.productId);
    if (!product) {
      throw new Error('Product not found');
    }

    if (product.status !== 'approved') {
      throw new Error('Product is not available for purchase');
    }

    if (product.seller.toString() === buyerId) {
      throw new Error('Cannot order your own product');
    }

    // Calculate total amount
    const totalAmount = product.price * orderData.quantity;

    // Create order
    const order = await this.repository.create({
      ...orderData,
      product: product._id,
      buyer: buyerId,
      seller: product.seller,
      totalAmount
    });

    logger.info(`Order created: ${order.orderNumber} by buyer ${buyerId}`);
    return order;
  }

  async getOrderById(orderId) {
    const order = await this.repository.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }

  async getOrderByNumber(orderNumber) {
    const order = await this.repository.findByOrderNumber(orderNumber);
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }

  async getBuyerOrders(buyerId, options = {}) {
    return await this.repository.findByBuyer(buyerId, options);
  }

  async getSellerOrders(sellerId, options = {}) {
    return await this.repository.findBySeller(sellerId, options);
  }

  async updateOrderStatus(orderId, status, userId, notes = null) {
    const order = await this.repository.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Check if user has permission to update
    const isSeller = order.seller.toString() === userId;
    const isBuyer = order.buyer.toString() === userId;
    
    if (!isSeller && !isBuyer) {
      throw new Error('Unauthorized to update this order');
    }

    // Validate status transitions
    if (!this.isValidStatusTransition(order.status, status, isSeller, isBuyer)) {
      throw new Error(`Invalid status transition from ${order.status} to ${status}`);
    }

    const updatedOrder = await this.repository.updateStatus(orderId, status, notes);
    
    // Mark product as sold if order is completed
    if (status === 'completed') {
      await this.productRepository.markAsSold(order.product);
    }

    logger.info(`Order ${orderId} status updated to ${status} by user ${userId}`);
    return updatedOrder;
  }

  async cancelOrder(orderId, userId, reason) {
    const order = await this.repository.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Check if user has permission to cancel
    const isSeller = order.seller.toString() === userId;
    const isBuyer = order.buyer.toString() === userId;
    
    if (!isSeller && !isBuyer) {
      throw new Error('Unauthorized to cancel this order');
    }

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new Error('Order cannot be cancelled at this stage');
    }

    const cancelledOrder = await this.repository.cancelOrder(orderId, userId, reason);
    logger.info(`Order ${orderId} cancelled by user ${userId}. Reason: ${reason}`);
    return cancelledOrder;
  }

  async updatePaymentStatus(orderId, paymentStatus, paymentReference = null) {
    const order = await this.repository.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const updatedOrder = await this.repository.updatePaymentStatus(
      orderId, 
      paymentStatus, 
      paymentReference
    );

    logger.info(`Order ${orderId} payment status updated to ${paymentStatus}`);
    return updatedOrder;
  }

  async getOrderStats(sellerId) {
    return await this.repository.getOrderStats(sellerId);
  }

  isValidStatusTransition(currentStatus, newStatus, isSeller, isBuyer) {
    const transitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: ['completed'],
      cancelled: [],
      completed: []
    };

    // Check if transition is allowed
    if (!transitions[currentStatus].includes(newStatus)) {
      return false;
    }

    // Check role-based permissions
    if (newStatus === 'confirmed' && !isSeller) return false;
    if (newStatus === 'shipped' && !isSeller) return false;
    if (newStatus === 'delivered' && !isSeller) return false;
    if (newStatus === 'completed' && !isBuyer) return false;

    return true;
  }
}

module.exports = OrderService;