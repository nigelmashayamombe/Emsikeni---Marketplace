// src/controllers/BaseController.js
const logger = require('../config/logger');

class BaseController {
  constructor(service) {
    this.service = service;
  }

  // Success response helper
  success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  // Error response helper
  error(res, message = 'Internal Server Error', statusCode = 500, errors = null) {
    const response = {
      success: false,
      message
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  // Validation error helper
  validationError(res, errors) {
    return this.error(res, 'Validation failed', 400, errors);
  }

  // Not found error helper
  notFound(res, message = 'Resource not found') {
    return this.error(res, message, 404);
  }

  // Unauthorized error helper
  unauthorized(res, message = 'Unauthorized') {
    return this.error(res, message, 401);
  }

  // Forbidden error helper
  forbidden(res, message = 'Forbidden') {
    return this.error(res, message, 403);
  }

  // Async wrapper for controller methods
  asyncWrapper(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  // Pagination helper
  getPaginationOptions(req) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || {};
    
    return { page, limit, sort };
  }

  // Standard CRUD operations
  async create(req, res) {
    try {
      const data = await this.service.create(req.body);
      return this.success(res, data, 'Created successfully', 201);
    } catch (error) {
      logger.error('Create error:', error);
      return this.error(res, error.message, 400);
    }
  }

  async findAll(req, res) {
    try {
      const options = this.getPaginationOptions(req);
      const data = await this.service.findAll(req.query, options);
      return this.success(res, data);
    } catch (error) {
      logger.error('Find all error:', error);
      return this.error(res, error.message);
    }
  }

  async findById(req, res) {
    try {
      const data = await this.service.findById(req.params.id);
      return this.success(res, data);
    } catch (error) {
      logger.error('Find by ID error:', error);
      return this.error(res, error.message, 404);
    }
  }

  async update(req, res) {
    try {
      const data = await this.service.update(req.params.id, req.body);
      return this.success(res, data, 'Updated successfully');
    } catch (error) {
      logger.error('Update error:', error);
      return this.error(res, error.message, 400);
    }
  }

  async delete(req, res) {
    try {
      await this.service.delete(req.params.id);
      return this.success(res, null, 'Deleted successfully');
    } catch (error) {
      logger.error('Delete error:', error);
      return this.error(res, error.message, 400);
    }
  }
}

module.exports = BaseController;