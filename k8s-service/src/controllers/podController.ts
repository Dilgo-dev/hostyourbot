import { FastifyRequest, FastifyReply } from 'fastify';
import { K8sClient } from '../services/k8sClient';
import { Pod } from '../types/k8s';

const k8sClient = new K8sClient();

export const listPods = async (
  request: FastifyRequest<{ Params: { namespace?: string } }>,
  reply: FastifyReply
) => {
  try {
    const namespace = request.params.namespace || 'default';
    const pods = await k8sClient.listPods(namespace);
    reply.send(pods);
  } catch (error: any) {
    reply.status(500).send({ error: 'Failed to list pods', message: error.message });
  }
};

export const getPod = async (
  request: FastifyRequest<{ Params: { name: string; namespace?: string } }>,
  reply: FastifyReply
) => {
  try {
    const namespace = request.params.namespace || 'default';
    const pod = await k8sClient.getPod(request.params.name, namespace);
    reply.send(pod);
  } catch (error: any) {
    reply.status(404).send({ error: 'Pod not found', message: error.message });
  }
};

export const createPod = async (
  request: FastifyRequest<{ Body: Pod; Params: { namespace?: string } }>,
  reply: FastifyReply
) => {
  try {
    const namespace = request.params.namespace || 'default';
    const pod = await k8sClient.createPod(request.body, namespace);
    reply.status(201).send(pod);
  } catch (error: any) {
    reply.status(400).send({ error: 'Failed to create pod', message: error.message });
  }
};

export const deletePod = async (
  request: FastifyRequest<{ Params: { name: string; namespace?: string } }>,
  reply: FastifyReply
) => {
  try {
    const namespace = request.params.namespace || 'default';
    await k8sClient.deletePod(request.params.name, namespace);
    reply.status(204).send();
  } catch (error: any) {
    reply.status(400).send({ error: 'Failed to delete pod', message: error.message });
  }
};

export const getPodLogs = async (
  request: FastifyRequest<{
    Params: { name: string; namespace?: string };
    Querystring: { tailLines?: string };
  }>,
  reply: FastifyReply
) => {
  try {
    const namespace = request.params.namespace || 'default';
    const tailLines = request.query.tailLines ? parseInt(request.query.tailLines) : undefined;
    const logs = await k8sClient.getPodLogs(request.params.name, namespace, tailLines);
    reply.send({ logs });
  } catch (error: any) {
    reply.status(404).send({ error: 'Failed to get pod logs', message: error.message });
  }
};
