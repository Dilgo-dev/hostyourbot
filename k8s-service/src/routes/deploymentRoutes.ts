import { FastifyInstance } from 'fastify';
import {
  listDeployments,
  getDeployment,
  createDeployment,
  updateDeployment,
  deleteDeployment,
  scaleDeployment,
} from '../controllers/deploymentController';

export default async function deploymentRoutes(fastify: FastifyInstance) {
  fastify.get('/namespaces/:namespace/deployments', listDeployments);
  fastify.get('/namespaces/:namespace/deployments/:name', getDeployment);
  fastify.post('/namespaces/:namespace/deployments', createDeployment);
  fastify.put('/namespaces/:namespace/deployments/:name', updateDeployment);
  fastify.delete('/namespaces/:namespace/deployments/:name', deleteDeployment);
  fastify.post('/namespaces/:namespace/deployments/:name/scale', scaleDeployment);
}
