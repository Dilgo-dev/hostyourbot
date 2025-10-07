import dotenv from 'dotenv';

dotenv.config();

export const config = {
  environment: process.env.ENVIRONMENT || 'development',
  port: parseInt(process.env.PORT || '3003', 10),
  k8s: {
    apiUrl: process.env.K8S_API_URL || '',
    apiToken: process.env.K8S_API_TOKEN || '',
  },
};
