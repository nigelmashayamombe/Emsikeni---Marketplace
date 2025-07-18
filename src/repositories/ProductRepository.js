// src/repositories/ProductRepository.js
const BaseRepository = require('./BaseRepository');
const Product = require('../models/Product');

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  async findBySeller(sellerId, options = {}) {
    return await this.findAll({ seller: sellerId }, options);
  }

  async findByCategory(category, options = {}) {
    return await this.findAll({ 
      category, 
      status: 'approved',
      isActive: true 
    }, options);
  }

  async searchProducts(searchTerm, filters = {}, options = {}) {
    const query = {
      status: 'approved',
      isActive: true,
      ...filters
    };

    if (searchTerm) {
      query.$text = { $search: searchTerm };
    }

    return await this.findAll(query, {
      ...options,
      sort: searchTerm ? { score: { $meta: 'textScore' } } : options.sort
    });
  }

  async findPendingProducts(options = {}) {
    return await this.findAll(
      { status: 'pending' }, 
      { ...options, populate: ['seller'] }
    );
  }

  async approveProduct(productId, adminId) {
    return await this.model.findByIdAndUpdate(
      productId,
      {
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: adminId
      },
      { new: true }
    );
  }

  async rejectProduct(productId, reason) {
    return await this.model.findByIdAndUpdate(
      productId,
      {
        status: 'rejected',
        rejectionReason: reason
      },
      { new: true }
    );
  }

  async markAsSold(productId) {
    return await this.model.findByIdAndUpdate(
      productId,
      {
        status: 'sold',
        soldAt: new Date()
      },
      { new: true }
    );
  }

  async incrementViews(productId) {
    return await this.model.findByIdAndUpdate(
      productId,
      { $inc: { views: 1 } },
      { new: true }
    );
  }

  async getProductStats(sellerId) {
    const stats = await this.model.aggregate([
      { $match: { seller: sellerId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    return stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});
  }
}

module.exports = ProductRepository;