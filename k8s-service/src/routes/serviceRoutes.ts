import { FastifyInstance } from 'fastify';
import {
  listServices,
  getService,
  createService,
  deleteService,
} from '../controllers/serviceController';

export default async function serviceRoutes(fastify: FastifyInstance) {
  fastify.get('/namespaces/:namespace/services', listServices);
  fastify.get('/namespaces/:namespace/services/:name', getService);
  fastify.post('/namespaces/:namespace/services', createService);
  fastify.delete('/namespaces/:namespace/services/:name', deleteService);
}
