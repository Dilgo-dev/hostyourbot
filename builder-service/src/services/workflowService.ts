import { Workflow, IWorkflowDocument } from '../models/Workflow';
import { IWorkflow } from '../types/workflow';

export class WorkflowService {
  async createWorkflow(workflowData: IWorkflow): Promise<IWorkflowDocument> {
    const workflow = new Workflow(workflowData);
    return await workflow.save();
  }

  async getWorkflows(userId: string): Promise<IWorkflowDocument[]> {
    return await Workflow.find({ userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getWorkflowById(id: string, userId: string): Promise<IWorkflowDocument | null> {
    return await Workflow.findOne({ _id: id, userId }).exec();
  }

  async updateWorkflow(
    id: string,
    userId: string,
    updateData: Partial<IWorkflow>
  ): Promise<IWorkflowDocument | null> {
    return await Workflow.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).exec();
  }

  async deleteWorkflow(id: string, userId: string): Promise<IWorkflowDocument | null> {
    return await Workflow.findOneAndDelete({ _id: id, userId }).exec();
  }

  async workflowExists(id: string, userId: string): Promise<boolean> {
    const count = await Workflow.countDocuments({ _id: id, userId }).exec();
    return count > 0;
  }
}
