import { Request, Response } from 'express';
import { WorkflowService } from '../services/workflowService';
import { ZipService } from '../services/zipService';
import { DiscordGenerator } from '../services/generators/discordGenerator';
import { WorkflowNode, WorkflowEdge } from '../types/workflow';

const workflowService = new WorkflowService();
const zipService = new ZipService();

export const generateFromWorkflow = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.query.userId as string;

    if (!userId) {
      res.status(400).json({
        error: 'Missing userId',
        message: 'userId query parameter is required',
      });
      return;
    }

    const workflow = await workflowService.getWorkflowById(id, userId);

    if (!workflow) {
      res.status(404).json({
        error: 'Workflow not found',
        message: `No workflow found with id ${id} for this user`,
      });
      return;
    }

    const eventNodes = workflow.nodes.filter(n => n.data.type === 'event');
    if (eventNodes.length === 0) {
      res.status(400).json({
        error: 'Invalid workflow',
        message: 'Workflow must contain at least one event node',
      });
      return;
    }

    const generator = new DiscordGenerator(workflow.nodes, workflow.edges);
    const files = generator.generate();

    const zipBuffer = await zipService.createZip(files);

    const filename = `${workflow.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', zipBuffer.length);

    res.status(200).send(zipBuffer);
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to generate code',
      message: error.message,
    });
  }
};

export const generateDirect = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nodes, edges } = req.body;

    if (!nodes || !edges) {
      res.status(400).json({
        error: 'Missing required fields',
        message: 'nodes and edges are required',
      });
      return;
    }

    const eventNodes = nodes.filter((n: WorkflowNode) => n.data.type === 'event');
    if (eventNodes.length === 0) {
      res.status(400).json({
        error: 'Invalid workflow',
        message: 'Workflow must contain at least one event node',
      });
      return;
    }

    const generator = new DiscordGenerator(nodes, edges);
    const files = generator.generate();

    const zipBuffer = await zipService.createZip(files);

    const filename = `discord-bot-${Date.now()}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', zipBuffer.length);

    res.status(200).send(zipBuffer);
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to generate code',
      message: error.message,
    });
  }
};
