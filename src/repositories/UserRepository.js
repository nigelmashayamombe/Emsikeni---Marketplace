import BaseRepository from './BaseRepository.js';
import Users from '../models/Users.js';

export default class UserRepository extends BaseRepository {
  constructor() {
    super(Users);
  }

  async findByEmail(email) {
    return await this.model.findOne({ email: email.toLowerCase() });
  }

  async findByPhoneNumber(phoneNumber) {
    return await this.model.findOne({ phoneNumber });
  }

  async findSellers(query = {}, options = {}) {
    const sellerQuery = { ...query, userType: 'seller' };
    return await this.findAll(sellerQuery, options);
  }

  async findBuyers(query = {}, options = {}) {
    const buyerQuery = { ...query, userType: 'buyer' };
    return await this.findAll(buyerQuery, options);
  }

  async updateLastLogin(userId) {
    return await this.model.findByIdAndUpdate(
      userId, 
      { lastLogin: new Date() },
      { new: true }
    );
  }

  async suspendUser(userId, reason) {
    return await this.model.findByIdAndUpdate(
      userId,
      { 
        isSuspended: true, 
        suspensionReason: reason 
      },
      { new: true }
    );
  }

  async unsuspendUser(userId) {
    return await this.model.findByIdAndUpdate(
      userId,
      { 
        isSuspended: false, 
        suspensionReason: null 
      },
      { new: true }
    );
  }

  async verifyPhone(userId) {
    return await this.model.findByIdAndUpdate(
      userId,
      { 
        phoneVerified: true,
        phoneVerificationCode: null,
        phoneVerificationExpires: null
      },
      { new: true }
    );
  }
}