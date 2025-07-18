// src/controllers/ReviewController.js
import BaseController from './BaseController.js';
import ReviewService from '../services/ReviewService.js';
import Joi from 'joi';
import logger from '../config/logger.js';

const createReviewSchema = Joi.object({
  orderId: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().min(10).max(500).required()
});

class ReviewController extends BaseController {
  constructor() {
    super(new ReviewService());
  }

  createReview = this.asyncWrapper(async (req, res) => {
    // Validate request body
    const { error } = createReviewSchema.validate(req.body);
    if (error) {
      return this.validationError(res, error.details);
    }

    try {
      const result = await this.service.createReview(req.body, req.user.userId);
      return this.success(res, result, 'Review created successfully', 201);
    } catch (error) {
      logger.error('Review creation error:', error);
      return this.error(res, error.message, 400);
    }
  });

  getUserReviews = this.asyncWrapper(async (req, res) => {
    try {
      const reviews = await this.service.getUserReviews(req.params.userId);
      return this.success(res, reviews);
    } catch (error) {
      logger.error('Get user reviews error:', error);
      return this.error(res, error.message);
    }
  });

  getOrderReview = this.asyncWrapper(async (req, res) => {
    try {
      const review = await this.service.getOrderReview(req.params.orderId);
      if (!review) {
        return this.notFound(res, 'Review not found');
      }
      return this.success(res, review);
    } catch (error) {
      logger.error('Get order review error:', error);
      return this.error(res, error.message);
    }
  });

  updateReview = this.asyncWrapper(async (req, res) => {
    // Validate request body
    const { error } = createReviewSchema.validate(req.body);
    if (error) {
      return this.validationError(res, error.details);
    }

    try {
      const review = await this.service.updateReview(req.params.id, req.body, req.user.userId);
      return this.success(res, review, 'Review updated successfully');
    } catch (error) {
      logger.error('Update review error:', error);
      return this.error(res, error.message, 400);
    }
  });

  deleteReview = this.asyncWrapper(async (req, res) => {
    try {
      await this.service.deleteReview(req.params.id, req.user.userId);
      return this.success(res, null, 'Review deleted successfully');
    } catch (error) {
      logger.error('Delete review error:', error);
      return this.error(res, error.message, 400);
    }
  });
}

export default ReviewController;
