import { FastifyRequest, FastifyReply } from 'fastify';
import { K8sClient } from '../services/k8sClient';
import { Deployment } from '../types/k8s';

const k8sClient = new K8sClient();

export const listDeployments = async (
  request: FastifyRequest<{ Params: { namespace?: string } }>,
  reply: FastifyReply
) => {
  try {
    const namespace = request.params.namespace || 'default';
    const deployments = await k8sClient.listDeployments(namespace);
    reply.send(deployments);
  } catch (error: any) {
    reply.status(500).send({ error: 'Failed to list deployments', message: error.message });
  }
};

export const getDeployment = async (
  request: FastifyRequest<{ Params: { name: string; namespace?: string } }>,
  reply: FastifyReply
) => {
  try {
    const namespace = request.params.namespace || 'default';
    const deployment = await k8sClient.getDeployment(request.params.name, namespace);
    reply.send(deployment);
  } catch (error: any) {
    reply.status(404).send({ error: 'Deployment not found', message: error.message });
  }
};

export const createDeployment = async (
  request: FastifyRequest<{ Body: Deployment; Params: { namespace?: string } }>,
  reply: FastifyReply
) => {
  try {
    const namespace = request.params.namespace || 'default';
    const deployment = await k8sClient.createDeployment(request.body, namespace);
    reply.status(201).send(deployment);
  } catch (error: any) {
    reply.status(400).send({ error: 'Failed to create deployment', message: error.message });
  }
};

export const updateDeployment = async (
  request: FastifyRequest<{ Body: Deployment; Params: { name: string; namespace?: string } }>,
  reply: FastifyReply
) => {
  try {
    const namespace = request.params.namespace || 'default';
    const deployment = await k8sClient.updateDeployment(request.params.name, request.body, namespace);
    reply.send(deployment);
  } catch (error: any) {
    reply.status(400).send({ error: 'Failed to update deployment', message: error.message });
  }
};

export const deleteDeployment = async (
  request: FastifyRequest<{ Params: { name: string; namespace?: string } }>,
  reply: FastifyReply
) => {
  try {
    const namespace = request.params.namespace || 'default';
    await k8sClient.deleteDeployment(request.params.name, namespace);
    reply.status(204).send();
  } catch (error: any) {
    reply.status(400).send({ error: 'Failed to delete deployment', message: error.message });
  }
};

export const scaleDeployment = async (
  request: FastifyRequest<{
    Params: { name: string; namespace?: string };
    Body: { replicas: number };
  }>,
  reply: FastifyReply
) => {
  try {
    const namespace = request.params.namespace || 'default';
    const deployment = await k8sClient.scaleDeployment(
      request.params.name,
      request.body.replicas,
      namespace
    );
    reply.send(deployment);
  } catch (error: any) {
    reply.status(400).send({ error: 'Failed to scale deployment', message: error.message });
  }
};
