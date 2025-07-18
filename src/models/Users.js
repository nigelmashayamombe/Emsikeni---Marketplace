import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    match: /^0[0-9]{9}$/ // Zimbabwe phone format
  },
  userType: {
    type: String,
    enum: ['buyer', 'seller', 'admin'],
    required: true
  },
  location: {
    city: { type: String, required: true },
    province: { type: String, required: true },
    address: { type: String }
  },
  ecocashNumber: {
    type: String,
    match: /^0[0-9]{9}$/
  },
  nationalId: {
    type: String
  },
  profilePicture: {
    type: String
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  phoneVerificationCode: {
    type: String
  },
  phoneVerificationExpires: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  suspensionReason: {
    type: String
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate phone verification code
userSchema.methods.generatePhoneVerificationCode = function() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  this.phoneVerificationCode = code;
  this.phoneVerificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  return code;
};

// Verify phone verification code
userSchema.methods.verifyPhoneCode = function(code) {
  return this.phoneVerificationCode === code && 
         this.phoneVerificationExpires > new Date();
};

// Update rating
userSchema.methods.updateRating = function(newRating) {
  const totalRating = (this.rating.average * this.rating.count) + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
};

const User = mongoose.model('User', userSchema);

export default User;