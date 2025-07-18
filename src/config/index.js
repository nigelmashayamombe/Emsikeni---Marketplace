// src/config/index.js
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/zim_marketplace_dev',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },
  paynow: {
    integrationId: process.env.PAYNOW_INTEGRATION_ID,
    integrationKey: process.env.PAYNOW_INTEGRATION_KEY
  }
};

