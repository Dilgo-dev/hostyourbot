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

    let zipFileBase64: string | undefined;
    if (zipFile && zipFile.length > 0) {
      zipFileBase64 = zipFile.toString('base64');
    }

    const bot = await botService.deployBot({
      name: fields.name,
      language: fields.language,
      version: fields.version,
      env: envVars,
      image: getDockerImage(fields.language, fields.version),
      userId: fields.userId,
      workflowId: fields.workflowId,
      startCommand: fields.startCommand,
      zipFileBase64,
    });

    reply.status(201).send(bot);
  } catch (error: any) {
    reply.status(400).send({ error: 'Failed to deploy bot', message: error.message });
  }
};

export const listBots = async (
  request: FastifyRequest<{ Querystring: { userId?: string } }>,
  reply: FastifyReply
) => {
  try {
    const userId = request.query.userId || request.headers['x-user-id'] as string;
    const bots = await botService.listBots(userId);
    reply.send({ bots, count: bots.length });
  } catch (error: any) {
    reply.status(500).send({ error: 'Failed to list bots', message: error.message });
  }
};

export const getBot = async (
  request: FastifyRequest<{ Params: { id: string }; Querystring: { userId?: string } }>,
  reply: FastifyReply
) => {
  try {
    const userId = request.query.userId || request.headers['x-user-id'] as string;
    const bot = await botService.getBot(request.params.id, userId);
    reply.send(bot);
  } catch (error: any) {
    reply.status(404).send({ error: 'Bot not found', message: error.message });
  }
};

export const deleteBot = async (
  request: FastifyRequest<{ Params: { id: string }; Querystring: { userId?: string } }>,
  reply: FastifyReply
) => {
  try {
    const userId = request.query.userId || request.headers['x-user-id'] as string;
    await botService.deleteBot(request.params.id, userId);
    reply.status(204).send();
  } catch (error: any) {
    reply.status(400).send({ error: 'Failed to delete bot', message: error.message });
  }
};

export const scaleBot = async (
  request: FastifyRequest<{ Params: { id: string }; Body: BotScaleRequest; Querystring: { userId?: string } }>,
  reply: FastifyReply
) => {
  try {
    const userId = request.query.userId || request.headers['x-user-id'] as string;
    const bot = await botService.scaleBot(request.params.id, request.body.replicas, userId);
    reply.send(bot);
  } catch (error: any) {
    reply.status(400).send({ error: 'Failed to scale bot', message: error.message });
  }
};

export const stopBot = async (
  request: FastifyRequest<{ Params: { id: string }; Querystring: { userId?: string } }>,
  reply: FastifyReply
) => {
  try {
    const userId = request.query.userId || request.headers['x-user-id'] as string;
    const bot = await botService.stopBot(request.params.id, userId);
    reply.send(bot);
  } catch (error: any) {
    reply.status(400).send({ error: 'Failed to stop bot', message: error.message });
  }
};

export const startBot = async (
  request: FastifyRequest<{ Params: { id: string }; Querystring: { userId?: string } }>,
  reply: FastifyReply
) => {
  try {
    const userId = request.query.userId || request.headers['x-user-id'] as string;
    const bot = await botService.startBot(request.params.id, userId);
    reply.send(bot);
  } catch (error: any) {
    reply.status(400).send({ error: 'Failed to start bot', message: error.message });
  }
};

export const restartBot = async (
  request: FastifyRequest<{ Params: { id: string }; Querystring: { userId?: string } }>,
  reply: FastifyReply
) => {
  try {
    const userId = request.query.userId || request.headers['x-user-id'] as string;
    const bot = await botService.restartBot(request.params.id, userId);
    reply.send(bot);
  } catch (error: any) {
    reply.status(400).send({ error: 'Failed to restart bot', message: error.message });
  }
};

export const getBotLogs = async (
  request: FastifyRequest<{
    Params: { id: string };
    Querystring: { tailLines?: string; userId?: string };
  }>,
  reply: FastifyReply
) => {
  try {
    const userId = request.query.userId || request.headers['x-user-id'] as string;
    const tailLines = request.query.tailLines ? parseInt(request.query.tailLines) : undefined;
    const logs = await botService.getBotLogs(request.params.id, tailLines, userId);
    reply.send({ logs });
  } catch (error: any) {
    reply.status(404).send({ error: 'Failed to get bot logs', message: error.message });
  }
};

export const deleteUserBots = async (
  request: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) => {
  try {
    await botService.deleteUserBots(request.params.userId);
    reply.status(204).send();
  } catch (error: any) {
    reply.status(400).send({ error: 'Failed to delete user bots', message: error.message });
  }
};

export const listAllBots = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const bots = await botService.listAllBots();
    reply.send({ bots, count: bots.length });
  } catch (error: any) {
    reply.status(500).send({ error: 'Failed to list all bots', message: error.message });
  }
};

export const getBotStats = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const stats = await botService.getBotStats();
    reply.send(stats);
  } catch (error: any) {
    reply.status(500).send({ error: 'Failed to get bot stats', message: error.message });
  }
};

export const deleteBotAsAdmin = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    await botService.deleteBotAsAdmin(request.params.id);
    reply.status(204).send();
  } catch (error: any) {
    reply.status(400).send({ error: 'Failed to delete bot', message: error.message });
  }
};

export const stopBotAsAdmin = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const bot = await botService.stopBotAsAdmin(request.params.id);
    reply.send({ bot });
  } catch (error: any) {
    reply.status(400).send({ error: 'Failed to stop bot', message: error.message });
  }
};

export const startBotAsAdmin = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const bot = await botService.startBotAsAdmin(request.params.id);
    reply.send({ bot });
  } catch (error: any) {
    reply.status(400).send({ error: 'Failed to start bot', message: error.message });
  }
};

export const updateBot = async (
  request: FastifyRequest<{ Params: { id: string } }>,
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

    const userId = fields.userId || request.headers['x-user-id'] as string;

    let envVars: EnvVar[] = [];
    if (fields.envVars) {
      try {
        envVars = JSON.parse(fields.envVars);
      } catch {
        envVars = [];
      }
    }

    let zipFileBase64: string | undefined;
    if (zipFile && zipFile.length > 0) {
      zipFileBase64 = zipFile.toString('base64');
    }

    const updateData: any = {
      userId,
    };

    if (fields.name) updateData.name = fields.name;
    if (fields.language) updateData.language = fields.language;
    if (fields.version) updateData.version = fields.version;
    if (fields.startCommand) updateData.startCommand = fields.startCommand;
    if (fields.workflowId) updateData.workflowId = fields.workflowId;
    if (envVars.length > 0) updateData.env = envVars;
    if (zipFileBase64) updateData.zipFileBase64 = zipFileBase64;
    if (fields.language && fields.version) {
      updateData.image = getDockerImage(fields.language, fields.version);
    }

    const bot = await botService.updateBot(request.params.id, updateData);

    reply.send(bot);
  } catch (error: any) {
    reply.status(400).send({ error: 'Failed to update bot', message: error.message });
  }
};

export const getBotStatus = async (
  request: FastifyRequest<{ Params: { id: string }; Querystring: { userId?: string } }>,
  reply: FastifyReply
) => {
  try {
    const userId = request.query.userId || request.headers['x-user-id'] as string;
    const status = await botService.getBotDetailedStatus(request.params.id, userId);
    reply.send(status);
  } catch (error: any) {
    reply.status(404).send({ error: 'Failed to get bot status', message: error.message });
  }
};
