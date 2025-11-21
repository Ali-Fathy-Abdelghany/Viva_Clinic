require('dotenv').config();

module.exports = {
  // Server Configuration
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  JWT_COOKIE_NAME: process.env.JWT_COOKIE_NAME || 'token',
  JWT_COOKIE_EXPIRE: process.env.JWT_COOKIE_EXPIRE || 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  
  // Email Configuration
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: process.env.EMAIL_PORT || 587,
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || '',
  
  // SMS Configuration (optional)
  SMS_API_KEY: process.env.SMS_API_KEY || '',
  SMS_API_URL: process.env.SMS_API_URL || '',
  
  // App Configuration
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000'
};

