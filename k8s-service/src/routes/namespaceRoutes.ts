import { FastifyInstance } from 'fastify';
import {
  listNamespaces,
  getNamespace,
  createNamespace,
  deleteNamespace,
} from '../controllers/namespaceController';

export default async function namespaceRoutes(fastify: FastifyInstance) {
  fastify.get('/namespaces', listNamespaces);
  fastify.get('/namespaces/:name', getNamespace);
  fastify.post('/namespaces', createNamespace);
  fastify.delete('/namespaces/:name', deleteNamespace);
}
