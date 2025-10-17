import dotenv from 'dotenv';

dotenv.config();

export const config = {
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3004', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/hostyourbot-builder',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};
