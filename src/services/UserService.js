
import BaseService from './BaseService.js';
import IUserService from '../interfaces/IUserService.js';
import UserRepository from '../repositories/UserRepository.js';
import jwt from 'jsonwebtoken';
import twilio from 'twilio';
import { config } from '../config/index.js';
import logger from '../config/logger.js';

class UserService extends BaseService {
  constructor() {
    super(new UserRepository());
    this.twilioClient = twilio(config.twilio.accountSid, config.twilio.authToken);
  }

  async register(userData) {
    // Check if user already exists
    const existingUser = await this.repository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const existingPhone = await this.repository.findByPhoneNumber(userData.phoneNumber);
    if (existingPhone) {
      throw new Error('User already exists with this phone number');
    }

    // Create user
    const user = await this.repository.create(userData);
    
    // Send phone verification
    await this.sendPhoneVerification(user._id);

    // Generate JWT token
    const token = this.generateToken(user._id);

    return {
      user: this.sanitizeUser(user),
      token
    };
  }

  async login(credentials) {
    const { email, password } = credentials;
    
    // Find user
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Check if user is suspended
    if (user.isSuspended) {
      throw new Error('Account is suspended');
    }

    // Update last login
    await this.repository.updateLastLogin(user._id);

    // Generate token
    const token = this.generateToken(user._id);

    return {
      user: this.sanitizeUser(user),
      token
    };
  }

  async sendPhoneVerification(userId) {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate verification code
    const code = user.generatePhoneVerificationCode();
    await user.save();

    // Send SMS
    try {
      await this.twilioClient.messages.create({
        body: `Your Zimbabwe Marketplace verification code is: ${code}`,
        from: config.twilio.phoneNumber,
        to: user.phoneNumber
      });
      
      logger.info(`Verification code sent to ${user.phoneNumber}`);
    } catch (error) {
      logger.error(`Failed to send SMS to ${user.phoneNumber}:`, error);
      throw new Error('Failed to send verification code');
    }
  }

  async verifyPhoneNumber(userId, code) {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.verifyPhoneCode(code)) {
      throw new Error('Invalid or expired verification code');
    }

    // Mark phone as verified
    await this.repository.verifyPhone(userId);
    
    return { message: 'Phone number verified successfully' };
  }

  async updateProfile(userId, profileData) {
    const user = await this.repository.update(userId, profileData);
    return this.sanitizeUser(user);
  }

  async getUserProfile(userId) {
    const user = await this.repository.findById(userId);
    return this.sanitizeUser(user);
  }

  async suspendUser(userId, reason, adminId) {
    const user = await this.repository.suspendUser(userId, reason);
    logger.info(`User ${userId} suspended by admin ${adminId}. Reason: ${reason}`);
    return this.sanitizeUser(user);
  }

  async unsuspendUser(userId, adminId) {
    const user = await this.repository.unsuspendUser(userId);
    logger.info(`User ${userId} unsuspended by admin ${adminId}`);
    return this.sanitizeUser(user);
  }

  generateToken(userId) {
    return jwt.sign(
      { userId },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
  }

  sanitizeUser(user) {
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.phoneVerificationCode;
    delete userObj.phoneVerificationExpires;
    return userObj;
  }
}

export default UserService;