// src/services/ProductService.js
const BaseService = require('./BaseService');
const ProductRepository = require('../repositories/ProductRepository');
const UserRepository = require('../repositories/UserRepository');
const cloudinary = require('cloudinary').v2;
const config = require('../config');
const logger = require('../config/logger');

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret
});

class ProductService extends BaseService {
  constructor() {
    super(new ProductRepository());
    this.userRepository = new UserRepository();
  }

  async createProduct(productData, sellerId) {
    // Verify seller
    const seller = await this.userRepository.findById(sellerId);
    if (!seller || seller.userType !== 'seller') {
      throw new Error('Only sellers can create products');
    }

    if (!seller.phoneVerified) {
      throw new Error('Phone number must be verified to create products');
    }

    // Add seller to product data
    const product = await this.repository.create({
      ...productData,
      seller: sellerId
    });

    logger.info(`Product created by seller ${sellerId}: ${product._id}`);
    return product;
  }

  async uploadProductImages(files) {
    const uploadPromises = files.map(file => {
      return cloudinary.uploader.upload(file.path, {
        folder: 'zim-marketplace/products',
        resource_type: 'image'
      });
    });

    const results = await Promise.all(uploadPromises);
    return results.map(result => result.secure_url);
  }

  async getProducts(filters = {}, options = {}) {
    const query = {
      status: 'approved',
      isActive: true,
      ...filters
    };

    return await this.repository.findAll(query, {
      ...options,
      populate: ['seller']
    });
  }

  async searchProducts(searchTerm, filters = {}, options = {}) {
    return await this.repository.searchProducts(searchTerm, filters, options);
  }

  async getProductById(productId, incrementViews = false) {
    const product = await this.repository.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Increment views if requested
    if (incrementViews) {
      await this.repository.incrementViews(productId);
    }

    return product;
  }

  async getSellerProducts(sellerId, options = {}) {
    return await this.repository.findBySeller(sellerId, options);
  }

  async updateProduct(productId, updateData, sellerId) {
    const product = await this.repository.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Check if user is the seller
    if (product.seller.toString() !== sellerId) {
      throw new Error('Only the seller can update this product');
    }

    // If product was rejected and being updated, reset status to pending
    if (product.status === 'rejected') {
      updateData.status = 'pending';
      updateData.rejectionReason = null;
    }

    const updatedProduct = await this.repository.update(productId, updateData);
    return updatedProduct;
  }

  async deleteProduct(productId, sellerId) {
    const product = await this.repository.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Check if user is the seller
    if (product.seller.toString() !== sellerId) {
      throw new Error('Only the seller can delete this product');
    }

    // Soft delete by setting isActive to false
    const deletedProduct = await this.repository.update(productId, { isActive: false });
    return deletedProduct;
  }

  async getPendingProducts(options = {}) {
    return await this.repository.findPendingProducts(options);
  }

  async approveProduct(productId, adminId) {
    const product = await this.repository.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    if (product.status !== 'pending') {
      throw new Error('Only pending products can be approved');
    }

    const approvedProduct = await this.repository.approveProduct(productId, adminId);
    logger.info(`Product ${productId} approved by admin ${adminId}`);
    return approvedProduct;
  }

  async rejectProduct(productId, reason, adminId) {
    const product = await this.repository.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    if (product.status !== 'pending') {
      throw new Error('Only pending products can be rejected');
    }

    const rejectedProduct = await this.repository.rejectProduct(productId, reason);
    logger.info(`Product ${productId} rejected by admin ${adminId}. Reason: ${reason}`);
    return rejectedProduct;
  }

  async getProductsByCategory(category, options = {}) {
    return await this.repository.findByCategory(category, options);
  }

  async getProductStats(sellerId) {
    return await this.repository.getProductStats(sellerId);
  }
}

module.exports = ProductService;