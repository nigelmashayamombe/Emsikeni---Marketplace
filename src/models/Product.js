const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['electronics', 'fashion', 'home', 'automotive', 'books', 
           'sports', 'beauty', 'agriculture', 'services', 'other'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  condition: {
    type: String,
    enum: ['new', 'used', 'refurbished'],
    required: true
  },
  images: [{
    type: String,
    required: true
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    city: { type: String, required: true },
    province: { type: String, required: true },
    address: { type: String }
  },
  deliveryOptions: [{
    type: String,
    enum: ['delivery', 'pickup', 'both']
  }],
  negotiable: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'sold', 'inactive'],
    default: 'pending'
  },
  rejectionReason: {
    type: String
  },
  views: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  soldAt: {
    type: Date
  },
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for search
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ seller: 1 });

module.exports = mongoose.model('Product', productSchema);
