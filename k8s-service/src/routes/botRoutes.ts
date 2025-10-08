import { FastifyInstance } from 'fastify';
import {
  deployBot,
  listBots,
  getBot,
  deleteBot,
  deleteUserBots,
  scaleBot,
  stopBot,
  startBot,
  restartBot,
  getBotLogs,
} from '../controllers/botController';

export default async function botRoutes(fastify: FastifyInstance) {
  fastify.post('/bots', deployBot);
  fastify.get('/bots', listBots);
  fastify.get('/bots/:id', getBot);
  fastify.delete('/bots/:id', deleteBot);
  fastify.delete('/bots/user/:userId', deleteUserBots);
  fastify.post('/bots/:id/scale', scaleBot);
  fastify.post('/bots/:id/stop', stopBot);
  fastify.post('/bots/:id/start', startBot);
  fastify.post('/bots/:id/restart', restartBot);
  fastify.get('/bots/:id/logs', getBotLogs);
}
