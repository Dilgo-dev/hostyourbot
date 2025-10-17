import { WorkflowNode, WorkflowEdge } from '../../types/workflow';
import { GeneratedFile, IGenerator } from './types';

export abstract class BaseGenerator implements IGenerator {
  protected nodes: WorkflowNode[];
  protected edges: WorkflowEdge[];

  constructor(nodes: WorkflowNode[], edges: WorkflowEdge[]) {
    this.nodes = nodes;
    this.edges = edges;
  }

  abstract generate(): GeneratedFile[];

  protected getConnectedNodes(sourceNodeId: string): WorkflowNode[] {
    const connectedEdges = this.edges.filter(edge => edge.source === sourceNodeId);
    const targetIds = connectedEdges.map(edge => edge.target);
    return this.nodes.filter(node => targetIds.includes(node.id));
  }

  protected getEventNodes(): WorkflowNode[] {
    return this.nodes.filter(node => node.data.type === 'event');
  }

  protected getActionNodes(): WorkflowNode[] {
    return this.nodes.filter(node => node.data.type === 'action');
  }
}
