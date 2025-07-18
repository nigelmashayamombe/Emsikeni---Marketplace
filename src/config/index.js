// src/config/index.js
require('dotenv').config();

const config = {
  development: {
    port: process.env.PORT || 3000,
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/zim_marketplace_dev'
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'dev_secret_key',
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    },
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
  },
  production: {
    port: process.env.PORT || 8080,
    mongodb: {
      uri: process.env.MONGODB_URI
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    },
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
  }
};

const env = process.env.NODE_ENV || 'development';
module.exports = config[env];

// src/config/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'zim-marketplace' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;