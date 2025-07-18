// src/controllers/UserController.js
import BaseController from './BaseController.js';
import UserService from '../services/UserService.js';
import { createUserSchema } from '../dtos/CreateUserDto.js';
import { updateUserSchema } from '../dtos/UpdateUserDto.js';
import logger from '../config/logger.js';

class UserController extends BaseController {
  constructor() {
    super(new UserService());
  }

  register = this.asyncWrapper(async (req, res) => {
    // Validate request body
    const { error } = createUserSchema.validate(req.body);
    if (error) {
      return this.validationError(res, error.details);
    }

    try {
      const result = await this.service.register(req.body);
      return this.success(res, result, 'User registered successfully', 201);
    } catch (error) {
      logger.error('Registration error:', error);
      return this.error(res, error.message, 400);
    }
  });

  login = this.asyncWrapper(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return this.validationError(res, [
        { message: 'Email and password are required' }
      ]);
    }

    try {
      const result = await this.service.login({ email, password });
      return this.success(res, result, 'Login successful');
    } catch (error) {
      logger.error('Login error:', error);
      return this.error(res, error.message, 401);
    }
  });

  sendPhoneVerification = this.asyncWrapper(async (req, res) => {
    try {
      await this.service.sendPhoneVerification(req.user.userId);
      return this.success(res, null, 'Verification code sent');
    } catch (error) {
      logger.error('Send verification error:', error);
      return this.error(res, error.message, 400);
    }
  });

  verifyPhoneNumber = this.asyncWrapper(async (req, res) => {
    const { code } = req.body;

    if (!code) {
      return this.validationError(res, [
        { message: 'Verification code is required' }
      ]);
    }

    try {
      const result = await this.service.verifyPhoneNumber(req.user.userId, code);
      return this.success(res, result, 'Phone number verified successfully');
    } catch (error) {
      logger.error('Phone verification error:', error);
      return this.error(res, error.message, 400);
    }
  });

  getProfile = this.asyncWrapper(async (req, res) => {
    try {
      const user = await this.service.getUserProfile(req.user.userId);
      return this.success(res, user);
    } catch (error) {
      logger.error('Get profile error:', error);
      return this.error(res, error.message, 404);
    }
  });

  updateProfile = this.asyncWrapper(async (req, res) => {
    // Validate request body
    const { error } = updateUserSchema.validate(req.body);
    if (error) {
      return this.validationError(res, error.details);
    }

    try {
      const user = await this.service.updateProfile(req.user.userId, req.body);
      return this.success(res, user, 'Profile updated successfully');
    } catch (error) {
      logger.error('Update profile error:', error);
      return this.error(res, error.message, 400);
    }
  });

  // Admin methods
  suspendUser = this.asyncWrapper(async (req, res) => {
    const { reason } = req.body;
    const { userId } = req.params;

    if (!reason) {
      return this.validationError(res, [
        { message: 'Suspension reason is required' }
      ]);
    }

    try {
      const user = await this.service.suspendUser(userId, reason, req.user.userId);
      return this.success(res, user, 'User suspended successfully');
    } catch (error) {
      logger.error('Suspend user error:', error);
      return this.error(res, error.message, 400);
    }
  });

  unsuspendUser = this.asyncWrapper(async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await this.service.unsuspendUser(userId, req.user.userId);
      return this.success(res, user, 'User unsuspended successfully');
    } catch (error) {
      logger.error('Unsuspend user error:', error);
      return this.error(res, error.message, 400);
    }
  });

  getAllUsers = this.asyncWrapper(async (req, res) => {
    try {
      const options = this.getPaginationOptions(req);
      const users = await this.service.findAll(req.query, options);
      return this.success(res, users);
    } catch (error) {
      logger.error('Get all users error:', error);
      return this.error(res, error.message);
    }
  });
}

export default UserController;