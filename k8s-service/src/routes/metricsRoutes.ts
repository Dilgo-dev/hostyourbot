import { FastifyInstance } from 'fastify';
import { getClusterMetrics, getNodesMetrics, getPodsMetrics } from '../controllers/metricsController';

export default async function metricsRoutes(fastify: FastifyInstance) {
  fastify.get('/admin/metrics/cluster', getClusterMetrics);
  fastify.get('/admin/metrics/nodes', getNodesMetrics);
  fastify.get('/admin/metrics/pods', getPodsMetrics);
}
