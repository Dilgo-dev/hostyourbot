import mongoose, { Schema, Document } from 'mongoose';
import { IWorkflow, WorkflowNode, WorkflowEdge } from '../types/workflow';

export interface IWorkflowDocument extends IWorkflow, Document {}

const NodeSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  data: {
    label: { type: String, required: true },
    type: { type: String, required: true },
    icon: String,
    blockId: String,
    config: Schema.Types.Mixed,
  },
}, { _id: false });

const EdgeSchema = new Schema({
  id: { type: String, required: true },
  source: { type: String, required: true },
  target: { type: String, required: true },
  sourceHandle: String,
  targetHandle: String,
}, { _id: false });

const WorkflowSchema = new Schema<IWorkflowDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    nodes: {
      type: [NodeSchema],
      required: true,
      default: [],
    },
    edges: {
      type: [EdgeSchema],
      required: true,
      default: [],
    },
    botType: {
      type: String,
      enum: ['discord'],
      default: 'discord',
    },
  },
  {
    timestamps: true,
  }
);

WorkflowSchema.index({ userId: 1, createdAt: -1 });

export const Workflow = mongoose.model<IWorkflowDocument>('Workflow', WorkflowSchema);
