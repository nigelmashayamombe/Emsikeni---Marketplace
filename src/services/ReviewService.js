
import BaseService from './BaseService.js';
import ReviewRepository from '../repositories/ReviewRepository.js';
import OrderRepository from '../repositories/OrderRepository.js';
import UserRepository from '../repositories/UserRepository.js';
import logger from '../config/logger.js';

class ReviewService extends BaseService {
  constructor() {
    super(new ReviewRepository());
    this.orderRepository = new OrderRepository();
    this.userRepository = new UserRepository();
  }

  async createReview(reviewData, reviewerId) {
    // Verify order exists and is completed
    const order = await this.orderRepository.findById(reviewData.orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'completed') {
      throw new Error('Can only review completed orders');
    }

    // Check if reviewer is the buyer
    if (order.buyer.toString() !== reviewerId) {
      throw new Error('Only the buyer can review this order');
    }

    // Check if review already exists
    const existingReview = await this.repository.findByOrder(reviewData.orderId);
    if (existingReview) {
      throw new Error('Order has already been reviewed');
    }

    // Create review
    const review = await this.repository.create({
      order: reviewData.orderId,
      reviewer: reviewerId,
      reviewed: order.seller,
      rating: reviewData.rating,
      comment: reviewData.comment
    });

    // Update seller's rating
    const seller = await this.userRepository.findById(order.seller);
    seller.updateRating(reviewData.rating);
    await seller.save();

    logger.info(`Review created for order ${reviewData.orderId} by user ${reviewerId}`);
    return review;
  }

  async getSellerReviews(sellerId, options = {}) {
    return await this.repository.findByReviewed(sellerId, options);
  }

  async getUserReviews(userId, options = {}) {
    return await this.repository.findByReviewer(userId, options);
  }

  async getSellerRating(sellerId) {
    return await this.repository.getAverageRating(sellerId);
  }

  async deleteReview(reviewId, userId) {
    const review = await this.repository.findById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    // Check if user is the reviewer
    if (review.reviewer.toString() !== userId) {
      throw new Error('Only the reviewer can delete this review');
    }

    // Soft delete
    const deletedReview = await this.repository.update(reviewId, { isActive: false });
    
    // Recalculate seller's rating
    const sellerRating = await this.repository.getAverageRating(review.reviewed);
    await this.userRepository.update(review.reviewed, {
      'rating.average': sellerRating.averageRating,
      'rating.count': sellerRating.totalReviews
    });

    logger.info(`Review ${reviewId} deleted by user ${userId}`);
    return deletedReview;
  }
}

export default ReviewService;