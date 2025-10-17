import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { config } from './config/env';
import botRoutes from './routes/botRoutes';
import namespaceRoutes from './routes/namespaceRoutes';
import podRoutes from './routes/podRoutes';
import deploymentRoutes from './routes/deploymentRoutes';
import serviceRoutes from './routes/serviceRoutes';
import metricsRoutes from './routes/metricsRoutes';
import { K8sClient } from './services/k8sClient';
import { K8sGrpcServer } from './services/grpcServer';

const fastify = Fastify({
  logger: {
    level: config.environment === 'development' ? 'info' : 'error',
  },
});

const k8sClient = new K8sClient();
const grpcServer = new K8sGrpcServer(k8sClient);

async function start() {
  try {
    await fastify.register(cors, {
      origin: true,
      credentials: true,
    });

    await fastify.register(multipart, {
      limits: {
        fileSize: 100 * 1024 * 1024,
      },
    });

    fastify.get('/health', async (request, reply) => {
      const k8sHealthy = await k8sClient.healthCheck();
      return {
        status: k8sHealthy ? 'healthy' : 'unhealthy',
        service: 'k8s-service',
        timestamp: new Date().toISOString(),
        kubernetes: k8sHealthy ? 'connected' : 'disconnected',
      };
    });

    await fastify.register(botRoutes, { prefix: '/api/v1' });

    await fastify.register(namespaceRoutes, { prefix: '/api/v1/k8s' });
    await fastify.register(podRoutes, { prefix: '/api/v1/k8s' });
    await fastify.register(deploymentRoutes, { prefix: '/api/v1/k8s' });
    await fastify.register(serviceRoutes, { prefix: '/api/v1/k8s' });
    await fastify.register(metricsRoutes, { prefix: '/api/v1' });

    await fastify.listen({ port: config.port, host: '0.0.0.0' });
    await grpcServer.start(config.grpcPort);

    console.log(`Service K8s démarré sur le port ${config.port}`);
    console.log(`Serveur gRPC démarré sur le port ${config.grpcPort}`);
    console.log(`Environnement: ${config.environment}`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
}

start();
