import { FastifyRequest, FastifyReply } from 'fastify';
import { BotDeploymentService } from '../services/botDeploymentService';
import { BotScaleRequest, EnvVar } from '../types/bot';
import { getDockerImage } from '../utils/dockerImageMapper';

const botService = new BotDeploymentService();

export const deployBot = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const parts = await request.parts();
    const fields: Record<string, string> = {};
    let zipFile: Buffer | null = null;

    for await (const part of parts) {
      if (part.type === 'file') {
        if (part.fieldname === 'zipFile') {
          zipFile = await part.toBuffer();
        }
      } else {
        fields[part.fieldname] = part.value as string;
      }
    }

    if (!fields.name || !fields.language || !fields.version) {
      return reply.status(400).send({
        error: 'Missing required fields',
        message: 'name, language, and version are required'
      });
    }

    let envVars: EnvVar[] = [];
    if (fields.envVars) {
      try {
        envVars = JSON.parse(fields.envVars);
      } catch {
        envVars = [];
      }
    }

    const bot = await botService.deployBot({
      name: fields.name,
      language: fields.language,
      version: fields.version,
      env: envVars,
      image: getDockerImage(fields.language, fields.version),
      startCommand: fields.startCommand,
    });

    reply.status(201).send(bot);
  } catch (error: any) {
    reply.status(400).send({ error: 'Failed to deploy bot', message: error.message });
  }
};

export const listBots = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const bots = await botService.listBots();
    reply.send({ bots, count: bots.length });
  } catch (error: any) {
    reply.status(500).send({ error: 'Failed to list bots', message: error.message });
  }
};

export const getBot = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const bot = await botService.getBot(request.params.id);
    reply.send(bot);
  } catch (error: any) {
    reply.status(404).send({ error: 'Bot not found', message: error.message });
  }
};

export const deleteBot = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    await botService.deleteBot(request.params.id);
    reply.status(204).send();
  } catch (error: any) {
    reply.status(400).send({ error: 'Failed to delete bot', message: error.message });
  }
};

export const scaleBot = async (
  request: FastifyRequest<{ Params: { id: string }; Body: BotScaleRequest }>,
  reply: FastifyReply
) => {
  try {
    const bot = await botService.scaleBot(request.params.id, request.body.replicas);
    reply.send(bot);
  } catch (error: any) {
    reply.status(400).send({ error: 'Failed to scale bot', message: error.message });
  }
};

export const stopBot = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const bot = await botService.stopBot(request.params.id);
    reply.send(bot);
  } catch (error: any) {
    reply.status(400).send({ error: 'Failed to stop bot', message: error.message });
  }
};

export const startBot = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const bot = await botService.startBot(request.params.id);
    reply.send(bot);
  } catch (error: any) {
    reply.status(400).send({ error: 'Failed to start bot', message: error.message });
  }
};

export const restartBot = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const bot = await botService.restartBot(request.params.id);
    reply.send(bot);
  } catch (error: any) {
    reply.status(400).send({ error: 'Failed to restart bot', message: error.message });
  }
};

export const getBotLogs = async (
  request: FastifyRequest<{
    Params: { id: string };
    Querystring: { tailLines?: string };
  }>,
  reply: FastifyReply
) => {
  try {
    const tailLines = request.query.tailLines ? parseInt(request.query.tailLines) : undefined;
    const logs = await botService.getBotLogs(request.params.id, tailLines);
    reply.send({ logs });
  } catch (error: any) {
    reply.status(404).send({ error: 'Failed to get bot logs', message: error.message });
  }
};
