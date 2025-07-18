// src/repositories/OrderRepository.js
const BaseRepository = require('./BaseRepository');
const Order = require('../models/Order');

class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  async findByBuyer(buyerId, options = {}) {
    return await this.findAll(
      { buyer: buyerId }, 
      { ...options, populate: ['product', 'seller'] }
    );
  }

  async findBySeller(sellerId, options = {}) {
    return await this.findAll(
      { seller: sellerId }, 
      { ...options, populate: ['product', 'buyer'] }
    );
  }

  async findByOrderNumber(orderNumber) {
    return await this.model.findOne({ orderNumber })
      .populate('product')
      .populate('buyer', 'firstName lastName phoneNumber email')
      .populate('seller', 'firstName lastName phoneNumber email');
  }

  async updateStatus(orderId, status, notes = null) {
    const updateData = { status };
    if (notes) updateData.notes = notes;
    
    if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    } else if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    return await this.model.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    );
  }

  async cancelOrder(orderId, cancelledBy, reason) {
    return await this.model.findByIdAndUpdate(
      orderId,
      {
        status: 'cancelled',
        cancelledBy,
        cancellationReason: reason
      },
      { new: true }
    );
  }

  async updatePaymentStatus(orderId, paymentStatus, paymentReference = null) {
    const updateData = { paymentStatus };
    if (paymentReference) updateData.paymentReference = paymentReference;

    return await this.model.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    );
  }

  async getOrderStats(sellerId) {
    const stats = await this.model.aggregate([
      { $match: { seller: sellerId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    return stats.reduce((acc, stat) => {
      acc[stat._id] = {
        count: stat.count,
        totalAmount: stat.totalAmount
      };
      return acc;
    }, {});
  }
}

module.exports = OrderRepository;