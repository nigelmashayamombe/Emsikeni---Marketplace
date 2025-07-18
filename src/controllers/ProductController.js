// src/controllers/ProductController.js
//const BaseController = require('./BaseController');
import BaseController from './BaseController.js';
import ProductService from '../services/ProductService.js';
import { createProductSchema } from '../dtos/CreateProductDto.js';
import logger from '../config/logger.js';
//const ProductService = require('../services/ProductService');
//const { createProductSchema } = require('../dtos/CreateProductDto');
//const logger = require('../config/logger');

class ProductController extends BaseController {
  constructor() {
    super(new ProductService());
  }

  createProduct = this.asyncWrapper(async (req, res) => {
    // Validate request body
    const { error } = createProductSchema.validate(req.body);
    if (error) {
      return this.validationError(res, error.details);
    }

    try {
      const result = await this.service.createProduct(req.body, req.user.userId);
      return this.success(res, result, 'Product created successfully', 201);
    } catch (error) {
      logger.error('Product creation error:', error);
      return this.error(res, error.message, 400);
    }
  });

  uploadProductImages = this.asyncWrapper(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return this.validationError(res, [{ message: 'No files uploaded' }]);
    }

    try {
      const imageUrls = await this.service.uploadProductImages(req.files);
      return this.success(res, { images: imageUrls }, 'Images uploaded successfully');
    } catch (error) {
      logger.error('Image upload error:', error);
      return this.error(res, error.message, 400);
    }
  });

  getAllProducts = this.asyncWrapper(async (req, res) => {
    try {
      const products = await this.service.getAll(req.query);
      return this.success(res, products);
    } catch (error) {
      logger.error('Get products error:', error);
      return this.error(res, error.message);
    }
  });

  getProductById = this.asyncWrapper(async (req, res) => {
    try {
      const product = await this.service.getById(req.params.id);
      if (!product) {
        return this.notFound(res, 'Product not found');
      }
      return this.success(res, product);
    } catch (error) {
      logger.error('Get product error:', error);
      return this.error(res, error.message);
    }
  });

  updateProduct = this.asyncWrapper(async (req, res) => {
    try {
      const product = await this.service.updateProduct(req.params.id, req.body, req.user.userId);
      return this.success(res, product, 'Product updated successfully');
    } catch (error) {
      logger.error('Update product error:', error);
      return this.error(res, error.message, 400);
    }
  });

  deleteProduct = this.asyncWrapper(async (req, res) => {
    try {
      await this.service.deleteProduct(req.params.id, req.user.userId);
      return this.success(res, null, 'Product deleted successfully');
    } catch (error) {
      logger.error('Delete product error:', error);
      return this.error(res, error.message, 400);
    }
  });
}

export default ProductController;
