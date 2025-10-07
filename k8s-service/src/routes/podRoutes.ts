import { FastifyInstance } from 'fastify';
import {
  listPods,
  getPod,
  createPod,
  deletePod,
  getPodLogs,
} from '../controllers/podController';

export default async function podRoutes(fastify: FastifyInstance) {
  fastify.get('/namespaces/:namespace/pods', listPods);
  fastify.get('/namespaces/:namespace/pods/:name', getPod);
  fastify.post('/namespaces/:namespace/pods', createPod);
  fastify.delete('/namespaces/:namespace/pods/:name', deletePod);
  fastify.get('/namespaces/:namespace/pods/:name/logs', getPodLogs);
}
