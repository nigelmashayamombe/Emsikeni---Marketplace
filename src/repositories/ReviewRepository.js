// src/repositories/ReviewRepository.js
const BaseRepository = require('./BaseRepository');
const Review = require('../models/Review');

class ReviewRepository extends BaseRepository {
  constructor() {
    super(Review);
  }

  async findByReviewed(userId, options = {}) {
    return await this.findAll(
      { reviewed: userId, isActive: true }, 
      { ...options, populate: ['reviewer', 'order'] }
    );
  }

  async findByReviewer(userId, options = {}) {
    return await this.findAll(
      { reviewer: userId }, 
      { ...options, populate: ['reviewed', 'order'] }
    );
  }

  async findByOrder(orderId) {
    return await this.model.findOne({ order: orderId })
      .populate('reviewer', 'firstName lastName')
      .populate('reviewed', 'firstName lastName');
  }

  async getAverageRating(userId) {
    const result = await this.model.aggregate([
      { $match: { reviewed: userId, isActive: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    return result.length > 0 ? result[0] : { averageRating: 0, totalReviews: 0 };
  }

  async canReview(orderId, reviewerId) {
    const order = await this.model.findOne({ order: orderId });
    return !order; // Can review if no review exists for this order
  }
}

module.exports = ReviewRepository;