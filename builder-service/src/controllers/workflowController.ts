import { Request, Response } from 'express';
import { WorkflowService } from '../services/workflowService';
import { IWorkflow } from '../types/workflow';

const workflowService = new WorkflowService();

export const createWorkflow = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, userId, nodes, edges, botType } = req.body;

    if (!name || !userId || !nodes || !edges) {
      res.status(400).json({
        error: 'Missing required fields',
        message: 'name, userId, nodes, and edges are required',
      });
      return;
    }

    const workflowData: IWorkflow = {
      name,
      description,
      userId,
      nodes,
      edges,
      botType: botType || 'discord',
    };

    const workflow = await workflowService.createWorkflow(workflowData);

    res.status(201).json({
      success: true,
      workflow,
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to create workflow',
      message: error.message,
    });
  }
};

export const getWorkflows = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.query.userId as string;

    if (!userId) {
      res.status(400).json({
        error: 'Missing userId',
        message: 'userId query parameter is required',
      });
      return;
    }

    const workflows = await workflowService.getWorkflows(userId);

    res.status(200).json({
      success: true,
      workflows,
      count: workflows.length,
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch workflows',
      message: error.message,
    });
  }
};

export const getWorkflow = async (req: Request, res: Response): Promise<void> => {
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

    res.status(200).json({
      success: true,
      workflow,
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch workflow',
      message: error.message,
    });
  }
};

export const updateWorkflow = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.query.userId as string;
    const updateData = req.body;

    if (!userId) {
      res.status(400).json({
        error: 'Missing userId',
        message: 'userId query parameter is required',
      });
      return;
    }

    delete updateData.userId;
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const workflow = await workflowService.updateWorkflow(id, userId, updateData);

    if (!workflow) {
      res.status(404).json({
        error: 'Workflow not found',
        message: `No workflow found with id ${id} for this user`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      workflow,
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to update workflow',
      message: error.message,
    });
  }
};

export const deleteWorkflow = async (req: Request, res: Response): Promise<void> => {
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

    const workflow = await workflowService.deleteWorkflow(id, userId);

    if (!workflow) {
      res.status(404).json({
        error: 'Workflow not found',
        message: `No workflow found with id ${id} for this user`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Workflow deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to delete workflow',
      message: error.message,
    });
  }
};
