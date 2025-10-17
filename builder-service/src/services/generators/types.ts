import { WorkflowNode, WorkflowEdge } from '../../types/workflow';

export interface GeneratedFile {
  filename: string;
  content: string;
}

export interface IGenerator {
  generate(nodes: WorkflowNode[], edges: WorkflowEdge[]): GeneratedFile[];
}
