import 'reflect-metadata';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import { initLogsGrpcClient } from './grpc/logsGrpcClient';
import { initMailGrpcClient } from './grpc/mailGrpcClient';
import passport from './config/passport';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP',
});

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(limiter);

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth/subscription', subscriptionRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'auth-service' });
});

const connectWithRetry = async (retries = 10, delay = 5000): Promise<void> => {
  for (let i = 0; i < retries; i++) {
    try {
      await AppDataSource.initialize();
      console.log('Database connected successfully');

      await AppDataSource.runMigrations();
      console.log('Migrations executed successfully');

      initLogsGrpcClient();
      initMailGrpcClient();

      app.listen(PORT, () => {
        console.log(`Auth service running on port ${PORT}`);
      });
      return;
    } catch (error) {
      console.error(`Database connection attempt ${i + 1}/${retries} failed:`, error);

      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
        console.log('Database connection destroyed for retry');
      }

      if (i < retries - 1) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('Max retries reached. Exiting...');
        process.exit(1);
      }
    }
  }
};

connectWithRetry();
