import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import { config } from './config/env';
import { connectDatabase } from './config/database';
import { corsMiddleware } from './middlewares/corsMiddleware';
import workflowRoutes from './routes/workflowRoutes';
import generatorRoutes from './routes/generatorRoutes';

const app: Application = express();

app.use(helmet());
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'builder-service',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', workflowRoutes);
app.use('/api', generatorRoutes);

const start = async () => {
  try {
    await connectDatabase();

    app.listen(config.port, () => {
      console.log(`🚀 Builder service démarré sur le port ${config.port}`);
      console.log(`📝 Environnement: ${config.environment}`);
      console.log(`🌐 Client URL autorisée: ${config.clientUrl}`);
    });
  } catch (error) {
    console.error('❌ Erreur au démarrage du service:', error);
    process.exit(1);
  }
};

start();
