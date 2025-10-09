import dotenv from 'dotenv';

dotenv.config();

export const config = {
  environment: process.env.ENVIRONMENT || 'development',
  grpcPort: parseInt(process.env.GRPC_PORT || '50053', 10),
  smtp: {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || 'no-reply@hostyourbot.app',
  },
};
